import { createContext, useCallback, useContext, useRef, useState } from 'react';

const ToastContext = createContext(() => {});

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const nextId = useRef(0);

  const showToast = useCallback((message, tone = 'success') => {
    nextId.current += 1;
    const id = nextId.current;
    setToast({ id, message, tone });
    setTimeout(() => setToast((current) => (current?.id === id ? null : current)), 3500);
  }, []);

  return (
    <ToastContext value={showToast}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {toast && (
          <p key={toast.id} className={`toast toast--${toast.tone}`}>
            {toast.message}
          </p>
        )}
      </div>
    </ToastContext>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
