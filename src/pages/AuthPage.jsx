import { Gift, LogIn, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { api } from '../api.js';
import { isKnownDevice, useAuth } from '../auth.jsx';
import EmploymentFields, {
  emptyEmployment,
  employmentPayload,
  validateEmployment,
} from '../components/EmploymentFields.jsx';
import PasswordField, { PasswordHint } from '../components/PasswordField.jsx';
import Switch from '../components/Switch.jsx';
import { firstName } from '../format.js';
import { useToast } from '../toast.jsx';

export default function AuthPage() {
  const [mode, setMode] = useState(() => (isKnownDevice() ? 'login' : 'register'));

  return (
    <main className="auth">
      <header className="auth__hero">
        <span className="auth__badge" aria-hidden="true">
          <Gift size={48} strokeWidth={2.2} />
        </span>
        <p className="eyebrow">Khambu · Navidad {new Date().getFullYear()}</p>
        <h1 className="auth__title">Cena y amigo invisible</h1>
        <p className="auth__text">Apúntate, vota dónde y cuándo quedamos y descubre a quién le haces el regalo.</p>
      </header>

      <div className="segmented" role="tablist" aria-label="Acceso">
        <button type="button" role="tab" aria-selected={mode === 'register'} onClick={() => setMode('register')}>
          <UserPlus size={18} aria-hidden="true" /> Primera vez
        </button>
        <button type="button" role="tab" aria-selected={mode === 'login'} onClick={() => setMode('login')}>
          <LogIn size={18} aria-hidden="true" /> Ya me apunté
        </button>
      </div>

      <section className="card">{mode === 'register' ? <RegisterForm /> : <LoginForm />}</section>
    </main>
  );
}

function RegisterForm() {
  const { signIn } = useAuth();
  const showToast = useToast();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [employment, setEmployment] = useState(emptyEmployment);
  const [joinsSecretSanta, setJoinsSecretSanta] = useState(true);
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
      const result = await api('/auth/register', {
        method: 'POST',
        body: { name, password, joinsSecretSanta, ...employmentPayload(employment) },
      });
      signIn(result);
      const greeting = firstName(result.user.name);
      showToast(result.user.isAdmin ? `¡Hola, ${greeting}! Eres el organizador.` : `¡Ya estás dentro, ${greeting}!`);
    } catch (requestError) {
      setError(requestError.message);
      setSaving(false);
    }
  }

  return (
    <form className="stack" onSubmit={handleSubmit}>
      <label className="field">
        <span className="field__label">Tu nombre</span>
        <input
          className="input"
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoComplete="username"
          autoCapitalize="words"
          maxLength={40}
          placeholder="Como te conocen en Khambu"
          required
        />
      </label>

      <PasswordField label="Elige una contraseña" value={password} onChange={setPassword} autoComplete="new-password">
        <PasswordHint />
      </PasswordField>

      <div className="form-section">
        <h2 className="form-section__title">Tu etapa en Khambu</h2>
        <p className="form-section__text">Así a nadie le toca regalar a alguien con quien no ha coincidido.</p>
      </div>
      <EmploymentFields value={employment} onChange={setEmployment} />

      <Switch
        label="Participo en el amigo invisible"
        description="Si solo vienes a la cena, desactívalo."
        checked={joinsSecretSanta}
        onChange={setJoinsSecretSanta}
      />

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <button type="submit" className="btn btn--primary btn--block" disabled={saving}>
        {saving ? 'Apuntándote…' : 'Apuntarme'}
      </button>
    </form>
  );
}

function LoginForm() {
  const { signIn } = useAuth();
  const showToast = useToast();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const result = await api('/auth/login', { method: 'POST', body: { name, password } });
      signIn(result);
      showToast(`¡Hola de nuevo, ${firstName(result.user.name)}!`);
    } catch (requestError) {
      setError(requestError.message);
      setSaving(false);
    }
  }

  return (
    <form className="stack" onSubmit={handleSubmit}>
      <label className="field">
        <span className="field__label">Tu nombre</span>
        <input
          className="input"
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoComplete="username"
          autoCapitalize="words"
          maxLength={40}
          required
        />
      </label>
      <PasswordField label="Contraseña" value={password} onChange={setPassword} autoComplete="current-password" />

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <button type="submit" className="btn btn--primary btn--block" disabled={saving}>
        {saving ? 'Entrando…' : 'Entrar'}
      </button>
      <p className="footnote">¿No recuerdas la contraseña? Pide al organizador que te dé una temporal.</p>
    </form>
  );
}
