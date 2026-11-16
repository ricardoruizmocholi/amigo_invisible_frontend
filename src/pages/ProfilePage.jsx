import { Briefcase, KeyRound, Lock, LogOut } from 'lucide-react';
import { useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import EmploymentFields, {
  employmentFromUser,
  employmentPayload,
  validateEmployment,
} from '../components/EmploymentFields.jsx';
import PasswordField, { PasswordHint } from '../components/PasswordField.jsx';
import Switch from '../components/Switch.jsx';
import { formatPeriod, initials } from '../format.js';
import { useToast } from '../toast.jsx';
import { useApiData } from '../useApiData.js';

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const secretSanta = useApiData('/secret-santa');

  return (
    <div className="stack stack--loose">
      <section className="profile-card">
        <span className="avatar" aria-hidden="true">
          {initials(user.name)}
        </span>
        <div>
          <h1 className="profile-card__name">{user.name}</h1>
          <p className="muted">{formatPeriod(user.startMonth, user.endMonth)}</p>
          {user.isAdmin && <span className="tag tag--mint">Organizador</span>}
        </div>
      </section>

      <EmploymentForm locked={Boolean(secretSanta.data?.inDraw)} />
      <PasswordForm />

      <button type="button" className="btn btn--ghost btn--block" onClick={signOut}>
        <LogOut size={20} aria-hidden="true" /> Cerrar sesión
      </button>
    </div>
  );
}

function EmploymentForm({ locked }) {
  const { user, setUser } = useAuth();
  const showToast = useToast();
  const [employment, setEmployment] = useState(() => employmentFromUser(user));
  const [joinsSecretSanta, setJoinsSecretSanta] = useState(user.joinsSecretSanta);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const invalid = validateEmployment(employment);
    if (invalid) {
      setError(invalid);
      return;
    }

    setSaving(true);
    setError('');
    try {
      const result = await api('/me', {
        method: 'PATCH',
        body: { ...employmentPayload(employment), joinsSecretSanta },
      });
      setUser(result.user);
      showToast('Datos guardados.');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="card stack" onSubmit={handleSubmit}>
      <h2 className="card__title">
        <Briefcase size={22} aria-hidden="true" /> Tu etapa en Khambu
      </h2>
      {locked && (
        <p className="hint">
          <Lock size={18} aria-hidden="true" />
          <span>El sorteo ya está hecho, así que estos datos no se pueden cambiar. Si hay algún error, avisa al organizador.</span>
        </p>
      )}
      <EmploymentFields value={employment} onChange={setEmployment} disabled={locked} />
      <Switch
        label="Participo en el amigo invisible"
        checked={joinsSecretSanta}
        onChange={setJoinsSecretSanta}
        disabled={locked}
      />
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {!locked && (
        <button type="submit" className="btn btn--primary btn--block" disabled={saving}>
          {saving ? 'Guardando…' : 'Guardar cambios'}
        </button>
      )}
    </form>
  );
}

function PasswordForm() {
  const showToast = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api('/me/password', { method: 'PUT', body: { currentPassword, newPassword } });
      setCurrentPassword('');
      setNewPassword('');
      showToast('Contraseña cambiada.');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="card stack" onSubmit={handleSubmit}>
      <h2 className="card__title">
        <KeyRound size={22} aria-hidden="true" /> Cambiar contraseña
      </h2>
      <PasswordField
        label="Contraseña actual"
        value={currentPassword}
        onChange={setCurrentPassword}
        autoComplete="current-password"
      />
      <PasswordField label="Contraseña nueva" value={newPassword} onChange={setNewPassword} autoComplete="new-password">
        <PasswordHint />
      </PasswordField>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <button type="submit" className="btn btn--ghost btn--block" disabled={saving}>
        {saving ? 'Guardando…' : 'Cambiar contraseña'}
      </button>
    </form>
  );
}
