import { CalendarClock, CircleCheck, Clock, Heart, MapPin, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import { useConfirm } from '../confirm.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { EmptyState, ErrorCard, Loading } from '../components/States.jsx';
import { formatDay, formatTime, today } from '../format.js';
import { summarize } from '../proposals.js';
import { useToast } from '../toast.jsx';
import { useApiData } from '../useApiData.js';

const KINDS = {
  place: {
    tab: 'Sitio',
    icon: MapPin,
    list: 'places',
    add: 'Proponer un sitio',
    empty: 'Todavía no hay sitios propuestos',
    chosenTag: 'Sitio elegido',
    chosenBanner: 'Sitio confirmado',
  },
  date: {
    tab: 'Día y hora',
    icon: CalendarClock,
    list: 'dates',
    add: 'Proponer día y hora',
    empty: 'Todavía no hay fechas propuestas',
    chosenTag: 'Fecha elegida',
    chosenBanner: 'Fecha confirmada',
  },
};

const URL_PATTERN = /(https?:\/\/[^\s]+)/g;

export default function MeetupPage() {
  const { user } = useAuth();
  const confirm = useConfirm();
  const showToast = useToast();
  const { data, error, loading, reload, mutate } = useApiData('/proposals');
  const [kind, setKind] = useState('place');
  const [adding, setAdding] = useState(false);

  const settings = KINDS[kind];
  const proposals = data?.[settings.list] ?? [];
  const { chosen, leaders } = summarize(proposals);

  function switchKind(next) {
    setKind(next);
    setAdding(false);
  }

  async function toggleVote(proposal) {
    const voting = !proposal.votedByMe;
    mutate((current) =>
      updateProposal(current, proposal.id, (item) => ({
        ...item,
        votedByMe: voting,
        votes: item.votes + (voting ? 1 : -1),
        voters: voting
          ? [...item.voters, { id: user.id, name: user.name }]
          : item.voters.filter((voter) => voter.id !== user.id),
      })),
    );
    try {
      await api(`/proposals/${proposal.id}/vote`, { method: voting ? 'PUT' : 'DELETE' });
    } catch (requestError) {
      showToast(requestError.message, 'error');
    }
    reload();
  }

  async function remove(proposal) {
    const accepted = await confirm({
      title: '¿Borrar la propuesta?',
      message: 'También se borrarán los votos que tenga.',
      confirmLabel: 'Borrar',
      danger: true,
    });
    if (!accepted) return;

    try {
      await api(`/proposals/${proposal.id}`, { method: 'DELETE' });
      showToast('Propuesta borrada.');
    } catch (requestError) {
      showToast(requestError.message, 'error');
    }
    reload();
  }

  async function toggleChosen(proposal) {
    try {
      await api(`/proposals/${proposal.id}/chosen`, { method: proposal.chosen ? 'DELETE' : 'PUT' });
      showToast(proposal.chosen ? 'Ya no está marcada como la elegida.' : '¡Marcada como la elegida!');
    } catch (requestError) {
      showToast(requestError.message, 'error');
    }
    reload();
  }

  let list;
  if (loading) list = <Loading />;
  else if (!data) list = <ErrorCard error={error} onRetry={reload} />;
  else if (proposals.length === 0) {
    list = (
      <EmptyState icon={settings.icon} title={settings.empty}>
        ¡Anímate a proponer la primera!
      </EmptyState>
    );
  } else {
    list = (
      <ul className="stack">
        {proposals.map((proposal) => (
          <li key={proposal.id}>
            <ProposalCard
              proposal={proposal}
              totalPeople={data.totalPeople}
              isLeader={!proposal.chosen && leaders.includes(proposal)}
              chosenTag={settings.chosenTag}
              onVote={toggleVote}
              onDelete={remove}
              onToggleChosen={toggleChosen}
            />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="stack stack--loose">
      <PageHeader eyebrow="Cena de Navidad" title="La quedada">
        Propón sitios y fechas, y vota todas las opciones que te vengan bien.
      </PageHeader>

      <div className="segmented" role="tablist" aria-label="Tipo de propuesta">
        {Object.entries(KINDS).map(([key, { tab, icon: Icon }]) => (
          <button key={key} type="button" role="tab" aria-selected={kind === key} onClick={() => switchKind(key)}>
            <Icon size={18} aria-hidden="true" /> {tab}
          </button>
        ))}
      </div>

      {chosen && (
        <div className="banner">
          <CircleCheck size={26} aria-hidden="true" />
          <p>
            <strong>{settings.chosenBanner}</strong>
            {kind === 'place' ? chosen.title : `${formatDay(chosen.startsAt)} a las ${formatTime(chosen.startsAt)}`}
          </p>
        </div>
      )}

      {adding ? (
        <ProposalForm
          kind={kind}
          onCancel={() => setAdding(false)}
          onCreated={() => {
            setAdding(false);
            reload();
          }}
        />
      ) : (
        <button type="button" className="btn btn--primary btn--block" onClick={() => setAdding(true)}>
          <Plus size={20} aria-hidden="true" /> {settings.add}
        </button>
      )}

      {list}
    </div>
  );
}

function ProposalCard({ proposal, totalPeople, isLeader, chosenTag, onVote, onDelete, onToggleChosen }) {
  const { user } = useAuth();
  const share = totalPeople > 0 ? Math.round((proposal.votes / totalPeople) * 100) : 0;

  return (
    <article className={`proposal${proposal.chosen ? ' proposal--chosen' : ''}`}>
      <div className="proposal__top">
        <div className="proposal__body">
          {proposal.chosen && <span className="tag tag--mint">{chosenTag}</span>}
          {isLeader && <span className="tag tag--pink">Más votos</span>}
          <h3 className="proposal__title">{proposal.kind === 'place' ? proposal.title : formatDay(proposal.startsAt)}</h3>
          {proposal.kind === 'date' && (
            <p className="proposal__time">
              <Clock size={16} aria-hidden="true" /> {formatTime(proposal.startsAt)} h
            </p>
          )}
          {proposal.details && (
            <p className="proposal__details">
              <Linkified text={proposal.details} />
            </p>
          )}
        </div>
        <button
          type="button"
          className={`vote${proposal.votedByMe ? ' vote--on' : ''}`}
          aria-pressed={proposal.votedByMe}
          aria-label={proposal.votedByMe ? 'Quitar mi voto' : 'Votar'}
          onClick={() => onVote(proposal)}
        >
          <Heart size={24} fill={proposal.votedByMe ? 'currentColor' : 'none'} aria-hidden="true" />
          <span>{proposal.votes}</span>
        </button>
      </div>

      <div className="meter" role="img" aria-label={`${proposal.votes} de ${totalPeople} personas`}>
        <span style={{ width: `${share}%` }} />
      </div>

      {proposal.voters.length > 0 ? (
        <ul className="chips" aria-label="Han votado">
          {proposal.voters.map((voter) => (
            <li key={voter.id} className={`chip${voter.id === user.id ? ' chip--me' : ''}`}>
              {voter.id === user.id ? 'Tú' : voter.name}
            </li>
          ))}
        </ul>
      ) : (
        <p className="muted">Nadie la ha votado todavía.</p>
      )}

      <footer className="proposal__footer">
        <span className="muted">Propuesta de {proposal.author.id === user.id ? 'ti' : proposal.author.name}</span>
        <div className="proposal__actions">
          {user.isAdmin && (
            <button type="button" className="btn btn--ghost btn--small" onClick={() => onToggleChosen(proposal)}>
              {proposal.chosen ? 'Quitar elección' : 'Elegir'}
            </button>
          )}
          {proposal.canDelete && (
            <button
              type="button"
              className="icon-btn icon-btn--danger"
              aria-label="Borrar propuesta"
              onClick={() => onDelete(proposal)}
            >
              <Trash2 size={18} aria-hidden="true" />
            </button>
          )}
        </div>
      </footer>
    </article>
  );
}

function ProposalForm({ kind, onCancel, onCreated }) {
  const showToast = useToast();
  const [title, setTitle] = useState('');
  const [day, setDay] = useState('');
  const [time, setTime] = useState('21:00');
  const [details, setDetails] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const body = kind === 'place' ? { kind, title, details } : { kind, startsAt: `${day}T${time}`, details };
      await api('/proposals', { method: 'POST', body });
      showToast('¡Propuesta añadida! Ya cuenta con tu voto.');
      onCreated();
    } catch (requestError) {
      setError(requestError.message);
      setSaving(false);
    }
  }

  return (
    <form className="card stack" onSubmit={handleSubmit}>
      {kind === 'place' ? (
        <label className="field">
          <span className="field__label">¿Qué sitio propones?</span>
          <input
            className="input"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            minLength={2}
            maxLength={80}
            placeholder="Nombre del restaurante o bar"
            required
            autoFocus
          />
        </label>
      ) : (
        <div className="field-row">
          <label className="field">
            <span className="field__label">Día</span>
            <input
              className="input"
              type="date"
              min={today()}
              value={day}
              onChange={(event) => setDay(event.target.value)}
              required
            />
          </label>
          <label className="field">
            <span className="field__label">Hora</span>
            <input
              className="input"
              type="time"
              value={time}
              onChange={(event) => setTime(event.target.value)}
              required
            />
          </label>
        </div>
      )}

      <label className="field">
        <span className="field__label">
          Detalles <span className="field__optional">(opcional)</span>
        </span>
        <textarea
          className="input textarea"
          rows={3}
          maxLength={300}
          value={details}
          onChange={(event) => setDetails(event.target.value)}
          placeholder={kind === 'place' ? 'Dirección, enlace a la carta, precio por persona…' : '¿Algo que haya que saber?'}
        />
      </label>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <div className="field-row">
        <button type="button" className="btn btn--ghost" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="btn btn--primary" disabled={saving}>
          {saving ? 'Guardando…' : 'Añadir'}
        </button>
      </div>
    </form>
  );
}

function Linkified({ text }) {
  return text.split(URL_PATTERN).map((part, index) =>
    index % 2 === 1 ? (
      <a key={index} href={part} target="_blank" rel="noopener noreferrer">
        {hostname(part)}
      </a>
    ) : (
      part
    ),
  );
}

function hostname(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function updateProposal(data, id, update) {
  const apply = (list) => list.map((proposal) => (proposal.id === id ? update(proposal) : proposal));
  return { ...data, places: apply(data.places), dates: apply(data.dates) };
}
