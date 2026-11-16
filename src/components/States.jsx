import { Gift, LoaderCircle, RefreshCw, TriangleAlert } from 'lucide-react';

export function Splash() {
  return (
    <div className="splash" role="status">
      <span className="splash__icon">
        <Gift size={44} aria-hidden="true" />
      </span>
      <span className="visually-hidden">Cargando…</span>
    </div>
  );
}

export function Loading({ label = 'Cargando…' }) {
  return (
    <div className="loading" role="status">
      <LoaderCircle className="spin" size={26} aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

export function ErrorCard({ error, onRetry }) {
  return (
    <section className="card card--danger stack" role="alert">
      <p className="card__row">
        <TriangleAlert size={20} aria-hidden="true" />
        <span>{error?.message ?? 'Algo ha fallado.'}</span>
      </p>
      {onRetry && (
        <button type="button" className="btn btn--ghost btn--small" onClick={onRetry}>
          <RefreshCw size={18} aria-hidden="true" /> Reintentar
        </button>
      )}
    </section>
  );
}

export function EmptyState({ icon: Icon, title, children }) {
  return (
    <div className="empty">
      <span className="empty__icon">
        <Icon size={30} aria-hidden="true" />
      </span>
      <p className="empty__title">{title}</p>
      {children && <p className="empty__text">{children}</p>}
    </div>
  );
}

export function Warning({ children }) {
  return (
    <p className="warning">
      <TriangleAlert size={18} aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}
