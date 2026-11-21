import { useI18n } from '@/shared/i18n';

// Fecha (en la zona de la ciudad, en mono: es un dato) y lugar de un evento. `compact` omite la hora
// (y el lugar en pantallas de menos de 700 px de alto; sigue en el detalle).
export function EventMeta({ event, timeZone, compact = false, className = '' }) {
  const { locale } = useI18n();
  const start = new Date(event.startsAt);
  const day = new Intl.DateTimeFormat(locale, { weekday: 'short', day: 'numeric', month: 'short', timeZone }).format(start);
  const time = new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit', timeZone }).format(start);

  return (
    <p className={`grid min-w-0 gap-0.5 text-ink-2 ${className}`}>
      <time dateTime={event.startsAt} className="font-mono first-letter:uppercase">
        {compact ? day : `${day} · ${time}`}
      </time>
      <span className={`truncate ${compact ? 'short:hidden' : ''}`}>{event.venue}</span>
    </p>
  );
}
