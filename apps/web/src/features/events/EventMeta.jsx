import { Calendar, MapPin } from 'lucide-react';
import { useI18n } from '@/shared/i18n';
import { Highlight } from './Highlight.jsx';

// Fecha y lugar del evento con iconos, con formato acorde a la maqueta. `query`: resalta el lugar si coincide.
export function EventMeta({ event, timeZone, query = '', className = '', onImage = false }) {
  const { locale } = useI18n();
  const start = new Date(event.startsAt);
  const day = new Intl.DateTimeFormat(locale, { weekday: 'short', day: 'numeric', month: 'short', timeZone }).format(start);
  const time = new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit', timeZone }).format(start);

  return (
    <div className={`grid gap-1 text-xs ${onImage ? 'text-ink' : 'text-ink-2'} ${className}`}>
      <div className="flex min-w-0 items-center gap-1.5">
        <Calendar aria-hidden="true" size={13} strokeWidth={1.5} className="shrink-0" />
        <time dateTime={event.startsAt} className="min-w-0 truncate first-letter:uppercase">
          {day} · {time}
        </time>
      </div>
      <div className="flex min-w-0 items-center gap-1.5">
        <MapPin aria-hidden="true" size={13} strokeWidth={1.5} className="shrink-0" />
        <span className="min-w-0 truncate">
          <Highlight text={event.venue} query={query} />
        </span>
      </div>
    </div>
  );
}
