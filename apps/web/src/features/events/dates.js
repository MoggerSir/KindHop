// Fechas de eventos siempre en la zona horaria de la ciudad (city.timezone), no la del dispositivo:
// un turista con el móvil en hora de Madrid debe ver el "jueves" de Cancún.
const DAY_MS = 24 * 60 * 60 * 1000;
const DAY_FORMATTERS = new Map();

function dayFormatter(timeZone) {
  let fmt = DAY_FORMATTERS.get(timeZone);
  if (!fmt) {
    fmt = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' });
    DAY_FORMATTERS.set(timeZone, fmt);
  }
  return fmt;
}

// 'YYYY-MM-DD' del instante `date` en `timeZone` (formateador cacheado en Map: O(1)).
export function dayKey(date, timeZone) {
  return dayFormatter(timeZone).format(date);
}

// `count` días seguidos desde hoy (en la ciudad): [{ key, date }]. `date` cae a mediodía UTC de ese día,
// suficiente para formatear día de semana y número sin cruzar de fecha en zonas de América.
export function nextDays(count, timeZone, now = new Date()) {
  const today = dayKey(now, timeZone);
  return Array.from({ length: count }, (_, i) => {
    const date = new Date(Date.parse(`${today}T12:00:00Z`) + i * DAY_MS);
    return { key: date.toISOString().slice(0, 10), date };
  });
}

// Eventos que aún no terminan, desde el día elegido, ordenados por inicio.
export function eventsFromDay(events, fromKey, timeZone, now = new Date()) {
  return events
    .filter((e) => Date.parse(e.endsAt ?? e.startsAt) > now.getTime() && dayKey(new Date(e.startsAt), timeZone) >= fromKey)
    .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));
}
