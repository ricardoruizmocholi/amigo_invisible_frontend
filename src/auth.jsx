import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, onUnauthorized, session } from './api.js';

const KNOWN_DEVICE_KEY = 'amigo-invisible:registrado';
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(() => Boolean(session.token));

  useEffect(() => {
    onUnauthorized(() => setUser(null));
    if (!session.token) return;

    api('/auth/me')
      .then(({ user: current }) => {
        if (!current) session.clear();
        setUser(current);
      })
      .catch(() => setUser(null))
      .finally(() => setChecking(false));
  }, []);

  const signIn = useCallback(({ token, user: signedIn }) => {
    session.save(token);
    localStorage.setItem(KNOWN_DEVICE_KEY, '1');
    setUser(signedIn);
  }, []);

  const signOut = useCallback(async () => {
    await api('/auth/logout', { method: 'POST' }).catch(() => {});
    session.clear();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, checking, setUser, signIn, signOut }),
    [user, checking, signIn, signOut],
  );
  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth() {
  return useContext(AuthContext);
}

export function isKnownDevice() {
  return localStorage.getItem(KNOWN_DEVICE_KEY) === '1';
}
