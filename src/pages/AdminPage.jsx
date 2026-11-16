import { Ban, Copy, Gift, KeyRound, Lock, RotateCcw, Shuffle, Trash2, Users } from 'lucide-react';
import { useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import { useConfirm } from '../confirm.jsx';
import Modal from '../components/Modal.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { ErrorCard, Loading, Warning } from '../components/States.jsx';
import { formatPeriod, formatTimestamp, initials, listNames, plural } from '../format.js';
import { useToast } from '../toast.jsx';
import { useApiData } from '../useApiData.js';

export default function AdminPage() {
  const { user } = useAuth();
  const confirm = useConfirm();
  const showToast = useToast();
  const { data, error, loading, reload } = useApiData('/admin/overview');
  const [busy, setBusy] = useState(false);
  const [drawError, setDrawError] = useState('');
  const [temporary, setTemporary] = useState(null);

  if (loading) return <Loading />;
  if (!data) return <ErrorCard error={error} onRetry={reload} />;

  const { draw, users } = data;
  const participants = users.filter((person) => person.joinsSecretSanta);
  const isolated = participants.filter((person) => person.overlapCount === 0);

  async function runDraw(redo) {
    const accepted = await confirm(
      redo
        ? {
            title: '¿Repetir el sorteo?',
            message: `Se anula el sorteo actual y se hace otro entre las ${participants.length} personas apuntadas ahora. A cada uno le puede tocar alguien distinto.`,
            confirmLabel: 'Repetir sorteo',
          }
        : {
            title: '¿Hacemos el sorteo?',
            message: `Entran las ${participants.length} personas apuntadas ahora mismo. Quien se apunte después no entrará, salvo que repitas el sorteo.`,
            confirmLabel: 'Hacer el sorteo',
          },
    );
    if (!accepted) return;

    setBusy(true);
    setDrawError('');
    try {
      await api('/admin/draw', { method: 'POST', body: { redo } });
      showToast('¡Sorteo hecho! Cada uno ya puede ver a quién le regala.');
    } catch (requestError) {
      setDrawError(requestError.message);
    } finally {
      setBusy(false);
      reload();
    }
  }

  async function cancelDraw() {
    const accepted = await confirm({
      title: '¿Anular el sorteo?',
      message: 'Nadie podrá ver ya a quién le había tocado. Podrás hacer otro cuando quieras.',
      confirmLabel: 'Anular',
      danger: true,
    });
    if (!accepted) return;

    setBusy(true);
    try {
      await api('/admin/draw', { method: 'DELETE' });
      showToast('Sorteo anulado.');
    } catch (requestError) {
      showToast(requestError.message, 'error');
    } finally {
      setBusy(false);
      reload();
    }
  }

  async function resetPassword(person) {
    const accepted = await confirm({
      title: `¿Contraseña nueva para ${person.name}?`,
      message: 'Se generará una contraseña temporal. Al entrar con ella tendrá que elegir otra.',
      confirmLabel: 'Generar',
    });
    if (!accepted) return;

    try {
      const { temporaryPassword } = await api(`/admin/users/${person.id}/reset-password`, { method: 'POST' });
      setTemporary({ name: person.name, password: temporaryPassword });
    } catch (requestError) {
      showToast(requestError.message, 'error');
    }
    reload();
  }

  async function removePerson(person) {
    const accepted = await confirm({
      title: `¿Borrar a ${person.name}?`,
      message: person.inDraw
        ? 'Está dentro del sorteo: se anulará y tendrás que repetirlo. También se borran sus propuestas y votos.'
        : 'También se borran sus propuestas y votos.',
      confirmLabel: 'Borrar',
      danger: true,
    });
    if (!accepted) return;

    try {
      const { drawReset } = await api(`/admin/users/${person.id}`, { method: 'DELETE' });
      showToast(drawReset ? 'Borrado. El sorteo se ha anulado: repítelo cuando quieras.' : 'Borrado.');
    } catch (requestError) {
      showToast(requestError.message, 'error');
    }
    reload();
  }

  async function copyTemporary() {
    try {
      await navigator.clipboard.writeText(temporary.password);
      showToast('Contraseña copiada.');
    } catch {
      showToast('No se ha podido copiar. Apúntala a mano.', 'error');
    }
  }

  return (
    <div className="stack stack--loose">
      <PageHeader eyebrow="Solo para el organizador" title="Panel de admin">
        Haz el sorteo cuando estén todos y echa una mano a quien no pueda entrar.
      </PageHeader>

      <section className="card card--pink stack">
        <h2 className="card__title">
          <Gift size={22} aria-hidden="true" /> Sorteo del amigo invisible
        </h2>
        <div className="stats">
          <div className="stat">
            <span className="stat__value">{draw.drawn ? draw.participantCount : participants.length}</span>
            <span className="stat__label">{draw.drawn ? 'en el sorteo' : 'apuntados'}</span>
          </div>
          <div className="stat">
            <span className="stat__value">{users.length}</span>
            <span className="stat__label">registrados</span>
          </div>
        </div>
        <p>{draw.drawn ? `Hecho el ${formatTimestamp(draw.drawnAt)}.` : 'Todavía no se ha hecho.'}</p>

        {!draw.drawn && isolated.length > 0 && (
          <Warning>
            {isolated.length === 1
              ? `${isolated[0].name} no coincidió con nadie más, así que no se puede hacer el sorteo. Que revise sus fechas o desactive el amigo invisible en su perfil.`
              : `${listNames(isolated.map((person) => person.name))} no coincidieron con nadie más, así que no se puede hacer el sorteo. Que revisen sus fechas o desactiven el amigo invisible en su perfil.`}
          </Warning>
        )}
        {draw.drawn && draw.pendingPeople.length > 0 && (
          <Warning>
            Se han apuntado después del sorteo: {listNames(draw.pendingPeople)}. Repítelo para que entren.
          </Warning>
        )}
        {drawError && (
          <p className="form-error" role="alert">
            {drawError}
          </p>
        )}

        {draw.drawn ? (
          <div className="field-row">
            <button type="button" className="btn btn--pink" onClick={() => runDraw(true)} disabled={busy}>
              <RotateCcw size={20} aria-hidden="true" /> Repetir
            </button>
            <button type="button" className="btn btn--danger" onClick={cancelDraw} disabled={busy}>
              <Ban size={20} aria-hidden="true" /> Anular
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="btn btn--pink btn--block"
            onClick={() => runDraw(false)}
            disabled={busy || participants.length < 3 || isolated.length > 0}
          >
            <Shuffle size={20} aria-hidden="true" /> Hacer el sorteo
          </button>
        )}
        {!draw.drawn && participants.length < 3 && (
          <p className="muted">Hacen falta al menos 3 personas apuntadas.</p>
        )}
        <p className="footnote">
          <Lock size={16} aria-hidden="true" /> Ni tú puedes ver quién le regala a quién.
        </p>
      </section>

      <section className="card stack">
        <h2 className="card__title">
          <Users size={22} aria-hidden="true" /> Gente registrada ({users.length})
        </h2>
        <ul className="people">
          {users.map((person) => (
            <li key={person.id} className="person">
              <span className="avatar avatar--small" aria-hidden="true">
                {initials(person.name)}
              </span>
              <div className="person__info">
                <p className="person__name">
                  {person.name}
                  {person.id === user.id && ' (tú)'}
                </p>
                <p className="person__meta">{formatPeriod(person.startMonth, person.endMonth)}</p>
                <div className="person__tags">
                  {person.isAdmin && <span className="tag tag--mint">Organizador</span>}
                  {person.joinsSecretSanta ? (
                    <span className={`tag ${person.overlapCount === 0 ? 'tag--warning' : 'tag--pink'}`}>
                      {person.overlapCount === 0
                        ? 'No coincide con nadie'
                        : `Coincide con ${plural(person.overlapCount, 'persona')}`}
                    </span>
                  ) : (
                    <span className="tag">No participa</span>
                  )}
                  {person.mustChangePassword && <span className="tag">Contraseña temporal</span>}
                </div>
              </div>
              {person.id !== user.id && (
                <div className="person__actions">
                  <button
                    type="button"
                    className="icon-btn"
                    aria-label={`Contraseña nueva para ${person.name}`}
                    onClick={() => resetPassword(person)}
                  >
                    <KeyRound size={18} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="icon-btn icon-btn--danger"
                    aria-label={`Borrar a ${person.name}`}
                    onClick={() => removePerson(person)}
                  >
                    <Trash2 size={18} aria-hidden="true" />
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>

      <Modal open={Boolean(temporary)} title="Contraseña temporal" onClose={() => setTemporary(null)}>
        {temporary && (
          <div className="stack">
            <p className="modal__text">
              Pásale esta contraseña a <strong>{temporary.name}</strong>. Al entrar tendrá que elegir una nueva.
            </p>
            <p className="temp-password">{temporary.password}</p>
            <div className="modal__actions">
              <button type="button" className="btn btn--ghost" onClick={copyTemporary}>
                <Copy size={18} aria-hidden="true" /> Copiar
              </button>
              <button type="button" className="btn btn--primary" onClick={() => setTemporary(null)}>
                Hecho
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
