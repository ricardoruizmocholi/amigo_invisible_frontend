import { KeyRound } from 'lucide-react';
import { useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import PasswordField, { PasswordHint } from '../components/PasswordField.jsx';
import { firstName } from '../format.js';
import { useToast } from '../toast.jsx';

export default function NewPasswordPage() {
  const { user, setUser, signOut } = useAuth();
  const showToast = useToast();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const result = await api('/me/password', { method: 'PUT', body: { newPassword: password } });
      setUser(result.user);
      showToast('¡Listo! Ya tienes tu contraseña nueva.');
    } catch (requestError) {
      setError(requestError.message);
      setSaving(false);
    }
  }

  return (
    <main className="auth">
      <header className="auth__hero">
        <span className="auth__badge" aria-hidden="true">
          <KeyRound size={44} strokeWidth={2.2} />
        </span>
        <h1 className="auth__title">Hola, {firstName(user.name)}</h1>
        <p className="auth__text">Has entrado con una contraseña temporal. Elige una nueva para seguir.</p>
      </header>

      <section className="card">
        <form className="stack" onSubmit={handleSubmit}>
          <PasswordField label="Contraseña nueva" value={password} onChange={setPassword} autoComplete="new-password">
            <PasswordHint />
          </PasswordField>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <button type="submit" className="btn btn--primary btn--block" disabled={saving}>
            {saving ? 'Guardando…' : 'Guardar contraseña'}
          </button>
          <button type="button" className="btn btn--ghost btn--block" onClick={signOut}>
            Salir
          </button>
        </form>
      </section>
    </main>
  );
}
