import { Gift, Lock, Users } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import PageHeader from '../components/PageHeader.jsx';
import { ErrorCard, Loading } from '../components/States.jsx';
import { formatTimestamp } from '../format.js';
import { useApiData } from '../useApiData.js';

export default function SecretSantaPage() {
  const { data, error, loading, reload } = useApiData('/secret-santa');

  let content;
  if (loading) content = <Loading />;
  else if (!data) content = <ErrorCard error={error} onRetry={reload} />;
  else {
    content = (
      <>
        <DrawStatus data={data} />
        <section className="card stack">
          <h2 className="card__title">
            <Users size={22} aria-hidden="true" /> {data.drawn ? 'Participan' : 'Apuntados'} ({data.participants.length})
          </h2>
          {data.participants.length > 0 ? (
            <ul className="chips">
              {data.participants.map((participant) => (
                <li key={participant.id} className="chip">
                  {participant.name}
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">Todavía no se ha apuntado nadie.</p>
          )}
        </section>
        <p className="footnote">
          <Lock size={16} aria-hidden="true" /> Nadie más, ni siquiera el organizador, puede ver a quién te ha tocado.
        </p>
      </>
    );
  }

  return (
    <div className="stack stack--loose">
      <PageHeader eyebrow="Navidad en Khambu" title="Amigo invisible">
        Solo te puede tocar alguien con quien hayas coincidido trabajando en Khambu.
      </PageHeader>
      {content}
    </div>
  );
}

function DrawStatus({ data }) {
  if (data.drawn && data.inDraw) return <RevealCard receiver={data.receiver} />;

  if (data.drawn) {
    return (
      <section className="card card--pink stack">
        <h2 className="card__title">
          <Gift size={22} aria-hidden="true" /> El sorteo ya está hecho
        </h2>
        <p>
          Se hizo el {formatTimestamp(data.drawnAt)} y no estás dentro. Si quieres participar, pide al organizador que
          lo repita.
        </p>
      </section>
    );
  }

  return (
    <section className="card card--pink stack waiting">
      <span className="waiting__icon" aria-hidden="true">
        <Gift size={40} />
      </span>
      <h2 className="card__title">Todavía no hay sorteo</h2>
      <p>El organizador lo hará cuando estemos todos apuntados. ¡Avisa a quien falte!</p>
      {!data.joins && (
        <>
          <p className="muted">Ahora mismo no participas.</p>
          <Link to="/perfil" className="btn btn--pink btn--block">
            Quiero participar
          </Link>
        </>
      )}
    </section>
  );
}

function RevealCard({ receiver }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <button
      type="button"
      className={`reveal${revealed ? ' reveal--open' : ''}`}
      onClick={() => setRevealed((current) => !current)}
      aria-live="polite"
    >
      {revealed ? (
        <>
          <span className="reveal__eyebrow">Te ha tocado regalar a</span>
          <span className="reveal__name">{receiver.name}</span>
          <span className="reveal__hint">Toca para ocultarlo</span>
        </>
      ) : (
        <>
          <span className="reveal__gift" aria-hidden="true">
            <Gift size={56} />
          </span>
          <span className="reveal__title">Toca para descubrir</span>
          <span className="reveal__hint">a quién le haces el regalo</span>
        </>
      )}
    </button>
  );
}
