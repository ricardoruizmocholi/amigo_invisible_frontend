export const MONTH_NAMES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

const dayFormatter = new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
const dayWithYearFormatter = new Intl.DateTimeFormat('es-ES', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});
const timestampFormatter = new Intl.DateTimeFormat('es-ES', {
  day: 'numeric',
  month: 'long',
  hour: '2-digit',
  minute: '2-digit',
});

const pad = (value) => String(value).padStart(2, '0');

export function today() {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function currentMonth() {
  return today().slice(0, 7);
}

export function formatMonth(value) {
  const [year, month] = value.split('-');
  return `${MONTH_NAMES[Number(month) - 1]} ${year}`;
}

export function formatPeriod(startMonth, endMonth) {
  return `${capitalize(formatMonth(startMonth))} – ${endMonth ? formatMonth(endMonth) : 'actualidad'}`;
}

export function formatDay(startsAt) {
  const [year, month, day] = startsAt.slice(0, 10).split('-').map(Number);
  const formatter = year === new Date().getFullYear() ? dayFormatter : dayWithYearFormatter;
  return capitalize(formatter.format(new Date(year, month - 1, day)));
}

export function formatTime(startsAt) {
  return startsAt.slice(11, 16);
}

export function formatTimestamp(isoDate) {
  return timestampFormatter.format(new Date(isoDate));
}

export function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function firstName(name) {
  return name.split(' ')[0];
}

export function initials(name) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export function plural(count, singular, pluralForm = `${singular}s`) {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

export function listNames(names) {
  return names.length <= 1 ? names.join('') : `${names.slice(0, -1).join(', ')} y ${names.at(-1)}`;
}
