import { Eye, EyeOff, KeyRound } from 'lucide-react';
import { useId, useState } from 'react';

export default function PasswordField({ label, value, onChange, autoComplete, children }) {
  const [visible, setVisible] = useState(false);
  const id = useId();

  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      <div className="password">
        <input
          id={id}
          className="input"
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          minLength={4}
          maxLength={128}
          required
        />
        <button
          type="button"
          className="password__toggle"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        >
          {visible ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
        </button>
      </div>
      {children}
    </div>
  );
}

export function PasswordHint() {
  return (
    <p className="hint">
      <KeyRound size={18} aria-hidden="true" />
      <span>
        La usarás para volver a entrar las próximas veces. Aquí podéis poner la misma que para el fichaje o la que
        queráis.
      </span>
    </p>
  );
}
