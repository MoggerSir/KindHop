import { CalendarDays, MapPin } from 'lucide-react';
import { useI18n } from '@/shared/i18n';

// Fecha (en la zona de la ciudad) y lugar de un evento. `compact` omite la hora para tarjetas pequeñas.
export function EventMeta({ event, timeZone, compact = false, className = '' }) {
  const { locale } = useI18n();
  const start = new Date(event.startsAt);
  const day = new Intl.DateTimeFormat(locale, { weekday: 'short', day: 'numeric', month: 'short', timeZone }).format(start);
  const time = new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit', timeZone }).format(start);

  return (
    <dl className={`grid gap-1 ${className}`}>
      <div className="flex min-w-0 items-center gap-2">
        <dt>
          <CalendarDays aria-hidden="true" size={16} strokeWidth={2} />
        </dt>
        <dd className="first-letter:uppercase">
          <time dateTime={event.startsAt}>{compact ? day : `${day} · ${time}`}</time>
        </dd>
      </div>
      <div className="flex min-w-0 items-center gap-2">
        <dt>
          <MapPin aria-hidden="true" size={16} strokeWidth={2} />
        </dt>
        <dd className="min-w-0 truncate">{event.venue}</dd>
      </div>
    </dl>
  );
}
