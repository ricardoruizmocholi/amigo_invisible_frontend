import { createContext, useCallback, useContext, useState } from 'react';
import Modal from './components/Modal.jsx';

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [request, setRequest] = useState(null);

  const confirm = useCallback(
    (options) => new Promise((resolve) => setRequest({ ...options, resolve })),
    [],
  );

  const close = useCallback(
    (accepted) => {
      request?.resolve(accepted);
      setRequest(null);
    },
    [request],
  );

  return (
    <ConfirmContext value={confirm}>
      {children}
      <Modal open={Boolean(request)} title={request?.title} onClose={() => close(false)}>
        {request?.message && <p className="modal__text">{request.message}</p>}
        <div className="modal__actions">
          <button type="button" className="btn btn--ghost" onClick={() => close(false)} autoFocus>
            Cancelar
          </button>
          <button
            type="button"
            className={`btn ${request?.danger ? 'btn--danger' : 'btn--primary'}`}
            onClick={() => close(true)}
          >
            {request?.confirmLabel ?? 'Confirmar'}
          </button>
        </div>
      </Modal>
    </ConfirmContext>
  );
}

export function useConfirm() {
  return useContext(ConfirmContext);
}
