const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '');
const TOKEN_KEY = 'amigo-invisible:token';

let handleUnauthorized = () => {};

export class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export const session = {
  get token() {
    return localStorage.getItem(TOKEN_KEY);
  },
  save(token) {
    localStorage.setItem(TOKEN_KEY, token);
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY);
  },
};

export function onUnauthorized(handler) {
  handleUnauthorized = handler;
}

export async function api(path, { method = 'GET', body } = {}) {
  const token = session.token;
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API_URL}/api${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, 'No se puede conectar con el servidor. Revisa tu conexión.');
  }

  const data = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 401 && token) {
      session.clear();
      handleUnauthorized();
    }
    throw new ApiError(response.status, data?.error ?? 'Algo ha fallado. Inténtalo de nuevo.', data?.details);
  }
  return data;
}
