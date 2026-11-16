import { Euro, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { api } from '../api.js';
import { useToast } from '../toast.jsx';
import { useApiData } from '../useApiData.js';
import { ErrorCard, Loading } from './States.jsx';

export default function BudgetSurvey() {
  const { data, error, loading, reload } = useApiData('/budget');
  const showToast = useToast();
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  if (loading) return <Loading />;
  if (!data) return <ErrorCard error={error} onRetry={reload} />;

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      await api('/budget', {
        method: 'PUT',
        body: { minAmount: Number(minAmount), maxAmount: Number(maxAmount) },
      });
      showToast('¡Voto guardado!');
      setMinAmount('');
      setMaxAmount('');
      reload();
    } catch (requestError) {
      setFormError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  async function removeVote() {
    try {
      await api('/budget', { method: 'DELETE' });
      showToast('Has quitado tu voto.');
      reload();
    } catch (requestError) {
      showToast(requestError.message, 'error');
    }
  }

  return (
    <section className="card stack">
      <h2 className="card__title">
        <Euro size={22} aria-hidden="true" /> Presupuesto del regalo
      </h2>
      <p className="muted">Vota el mínimo y el máximo que te parecen bien. Usamos la mediana de todos los votos.</p>

      {data.suggested ? (
        <div className="budget-result">
          <span className="budget-result__label">Rango que sale de la encuesta</span>
          <strong>
            {data.suggested.minAmount} – {data.suggested.maxAmount} €
          </strong>
          <span className="muted">
            {data.votes.length} de {data.totalPeople} han votado
          </span>
        </div>
      ) : (
        <p className="muted">Todavía no hay votos.</p>
      )}

      {data.myVote ? (
        <div className="budget-mine">
          <p>
            Tu voto: <strong>{data.myVote.minAmount} – {data.myVote.maxAmount} €</strong>
          </p>
          <button type="button" className="btn btn--ghost btn--small" onClick={removeVote}>
            <Trash2 size={16} aria-hidden="true" /> Quitar
          </button>
        </div>
      ) : (
        <form className="stack" onSubmit={handleSubmit}>
          <div className="field-row">
            <label className="field">
              <span className="field__label">Mínimo €</span>
              <input
                className="input"
                type="number"
                inputMode="numeric"
                min={1}
                max={500}
                step={1}
                value={minAmount}
                onChange={(event) => setMinAmount(event.target.value)}
                required
              />
            </label>
            <label className="field">
              <span className="field__label">Máximo €</span>
              <input
                className="input"
                type="number"
                inputMode="numeric"
                min={1}
                max={500}
                step={1}
                value={maxAmount}
                onChange={(event) => setMaxAmount(event.target.value)}
                required
              />
            </label>
          </div>
          {formError && (
            <p className="form-error" role="alert">
              {formError}
            </p>
          )}
          <button type="submit" className="btn btn--primary btn--block" disabled={saving}>
            {saving ? 'Guardando…' : 'Votar presupuesto'}
          </button>
        </form>
      )}

      {data.votes.length > 0 && (
        <ul className="budget-votes" aria-label="Votos de presupuesto">
          {data.votes.map((vote) => (
            <li key={vote.user.id} className={`budget-vote${vote.isMe ? ' budget-vote--me' : ''}`}>
              <span>{vote.isMe ? 'Tú' : vote.user.name}</span>
              <strong>
                {vote.minAmount} – {vote.maxAmount} €
              </strong>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
