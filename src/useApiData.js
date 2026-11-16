import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from './api.js';

export function useApiData(path) {
  const [state, setState] = useState({ data: null, error: null, loading: true });
  const latestRequest = useRef(0);

  const reload = useCallback(async () => {
    latestRequest.current += 1;
    const request = latestRequest.current;
    try {
      const data = await api(path);
      if (request === latestRequest.current) setState({ data, error: null, loading: false });
    } catch (error) {
      if (request === latestRequest.current) setState((previous) => ({ ...previous, error, loading: false }));
    }
  }, [path]);

  const mutate = useCallback((update) => {
    // Descarta respuestas que estuvieran en camino: traerían datos anteriores al cambio.
    latestRequest.current += 1;
    setState((previous) => ({ ...previous, data: update(previous.data) }));
  }, []);

  useEffect(() => {
    reload();
    const reloadWhenVisible = () => {
      if (document.visibilityState === 'visible') reload();
    };
    document.addEventListener('visibilitychange', reloadWhenVisible);
    return () => document.removeEventListener('visibilitychange', reloadWhenVisible);
  }, [reload]);

  return { ...state, reload, mutate };
}
