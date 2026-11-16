import { CalendarClock, ChevronRight, Gift, MapPin, MapPinned, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router';
import { useAuth } from '../auth.jsx';
import PageHeader from '../components/PageHeader.jsx';
import PlaceMap from '../components/PlaceMap.jsx';
import { ErrorCard, Loading } from '../components/States.jsx';
import { firstName, formatDay, formatTime, plural } from '../format.js';
import { summarize } from '../proposals.js';
import { useApiData } from '../useApiData.js';

export default function HomePage() {
  const { user } = useAuth();
  const meetup = useApiData('/proposals');
  const secretSanta = useApiData('/secret-santa');

  return (
    <div className="stack stack--loose">
      <PageHeader eyebrow="Navidad en Khambu" title={`¡Hola, ${firstName(user.name)}!`}>
        Esto es lo que se cuece para la cena de este año.
      </PageHeader>

      <MeetupSummary {...meetup} />
      <SecretSantaSummary {...secretSanta} />

      {user.isAdmin && (
        <Link to="/admin" className="card card--link">
          <ShieldCheck size={26} aria-hidden="true" />
          <span>
            <strong>Panel del organizador</strong>
            <small>Sorteo y gente registrada</small>
          </span>
          <ChevronRight size={22} aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}

function MeetupSummary({ data, error, loading, reload }) {
  if (loading) {
    return (
      <section className="card card--mint">
        <Loading />
      </section>
    );
  }
  if (!data) return <ErrorCard error={error} onRetry={reload} />;

  const chosenPlace = data.places.find((proposal) => proposal.chosen) ?? null;

  return (
    <section className="card card--mint stack">
      <h2 className="card__title">
        <MapPinned size={22} aria-hidden="true" /> La quedada
      </h2>
      <SummaryRow
        icon={MapPin}
        label="Sitio"
        proposals={data.places}
        describe={(proposal) => proposal.title}
        empty="Aún no hay sitios propuestos"
      />
      <SummaryRow
        icon={CalendarClock}
        label="Día y hora"
        proposals={data.dates}
        describe={(proposal) => `${formatDay(proposal.startsAt)} · ${formatTime(proposal.startsAt)}`}
        empty="Aún no hay fechas propuestas"
      />
      {chosenPlace && <PlaceMap place={chosenPlace} compact />}
      <Link to="/quedada" className="btn btn--primary btn--block">
        Proponer y votar
      </Link>
    </section>
  );
}

function SummaryRow({ icon: Icon, label, proposals, describe, empty }) {
  const { chosen, leaders, topVotes } = summarize(proposals);

  let tag = null;
  let text;
  if (chosen) {
    tag = <span className="tag tag--mint">Confirmado</span>;
    text = describe(chosen);
  } else if (leaders.length === 1) {
    tag = <span className="tag tag--pink">Va ganando · {plural(topVotes, 'voto')}</span>;
    text = describe(leaders[0]);
  } else if (leaders.length > 1) {
    tag = <span className="tag tag--pink">Empate a {plural(topVotes, 'voto')}</span>;
    text = `${leaders.length} opciones empatadas`;
  } else {
    text = proposals.length > 0 ? `${plural(proposals.length, 'propuesta')} sin votos todavía` : empty;
  }

  return (
    <div className="summary-row">
      <span className="summary-row__icon">
        <Icon size={20} aria-hidden="true" />
      </span>
      <div className="summary-row__body">
        <p className="summary-row__label">
          {label} {tag}
        </p>
        <p className="summary-row__value">{text}</p>
      </div>
    </div>
  );
}

function SecretSantaSummary({ data, error, loading, reload }) {
  if (loading) {
    return (
      <section className="card card--pink">
        <Loading />
      </section>
    );
  }
  if (!data) return <ErrorCard error={error} onRetry={reload} />;

  let text;
  if (!data.drawn) {
    text = data.joins
      ? `Hay ${plural(data.participants.length, 'persona apuntada', 'personas apuntadas')}. El organizador hará el sorteo cuando estemos todos.`
      : 'Ahora mismo no participas en el amigo invisible. Puedes apuntarte desde tu perfil.';
  } else if (data.inDraw) {
    text = '¡El sorteo ya está hecho! Entra para descubrir a quién le haces el regalo.';
  } else {
    text = 'El sorteo ya se hizo y no estás dentro. Habla con el organizador si quieres participar.';
  }

  return (
    <section className="card card--pink stack">
      <h2 className="card__title">
        <Gift size={22} aria-hidden="true" /> Amigo invisible
      </h2>
      <p>{text}</p>
      <Link to="/amigo-invisible" className="btn btn--pink btn--block">
        {data.drawn && data.inDraw ? 'Descubrir a quién le regalo' : 'Ver quién se ha apuntado'}
      </Link>
    </section>
  );
}
