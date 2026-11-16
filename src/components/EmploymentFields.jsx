import { MONTH_NAMES, capitalize, currentMonth } from '../format.js';
import Switch from './Switch.jsx';

const FIRST_YEAR = 2000;

export const emptyEmployment = {
  start: { month: '', year: '' },
  finished: false,
  end: { month: '', year: '' },
};

export function employmentFromUser(user) {
  return { start: splitMonth(user.startMonth), finished: Boolean(user.endMonth), end: splitMonth(user.endMonth) };
}

export function employmentPayload({ start, finished, end }) {
  return { startMonth: joinMonth(start), endMonth: finished ? joinMonth(end) : null };
}

export function validateEmployment({ start, finished, end }) {
  const now = currentMonth();
  const startMonth = joinMonth(start);
  if (!startMonth) return 'Indica el mes y el año en que empezaste en Khambu.';
  if (startMonth > now) return 'La fecha de inicio no puede ser futura.';
  if (!finished) return null;

  const endMonth = joinMonth(end);
  if (!endMonth) return 'Indica el mes y el año en que terminaste.';
  if (endMonth < startMonth) return 'La fecha de fin no puede ser anterior a la de inicio.';
  if (endMonth > now) return 'La fecha de fin no puede ser futura.';
  return null;
}

export default function EmploymentFields({ value, onChange, disabled }) {
  return (
    <>
      <MonthYearField
        label="¿Cuándo empezaste en Khambu?"
        value={value.start}
        disabled={disabled}
        onChange={(start) => onChange({ ...value, start })}
      />
      <Switch
        label="Ya no trabajo en Khambu"
        checked={value.finished}
        disabled={disabled}
        onChange={(finished) => onChange({ ...value, finished })}
      />
      {value.finished && (
        <MonthYearField
          label="¿Cuándo terminaste?"
          value={value.end}
          disabled={disabled}
          onChange={(end) => onChange({ ...value, end })}
        />
      )}
    </>
  );
}

function MonthYearField({ label, value, onChange, disabled }) {
  const [thisYear, thisMonth] = currentMonth().split('-');
  const years = Array.from({ length: Number(thisYear) - FIRST_YEAR + 1 }, (_, index) => String(Number(thisYear) - index));

  return (
    <fieldset className="field" disabled={disabled}>
      <legend className="field__label">{label}</legend>
      <div className="field-row">
        <select
          className="input select"
          aria-label={`${label} Mes`}
          value={value.month}
          onChange={(event) => onChange({ ...value, month: event.target.value })}
          required
        >
          <option value="" disabled>
            Mes
          </option>
          {MONTH_NAMES.map((name, index) => {
            const month = String(index + 1).padStart(2, '0');
            return (
              <option key={month} value={month} disabled={value.year === thisYear && month > thisMonth}>
                {capitalize(name)}
              </option>
            );
          })}
        </select>
        <select
          className="input select"
          aria-label={`${label} Año`}
          value={value.year}
          onChange={(event) => onChange({ ...value, year: event.target.value })}
          required
        >
          <option value="" disabled>
            Año
          </option>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
    </fieldset>
  );
}

function splitMonth(value) {
  if (!value) return { month: '', year: '' };
  const [year, month] = value.split('-');
  return { month, year };
}

function joinMonth({ month, year }) {
  return month && year ? `${year}-${month}` : '';
}
