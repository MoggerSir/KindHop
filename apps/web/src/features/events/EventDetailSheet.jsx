import { Bus, Info } from 'lucide-react';
import { DataStatusBadge } from '@/shared/components/DataStatusBadge.jsx';
import { Sheet } from '@/shared/components/Sheet.jsx';
import { useI18n } from '@/shared/i18n';
import { EventMeta } from './EventMeta.jsx';

// Detalle de un evento: foto con su crédito y licencia, cuándo y dónde, procedencia y aviso honesto de "cómo llegar".
export function EventDetailSheet({ event, timeZone, onClose }) {
  const { t } = useI18n();
  return (
    <Sheet open={Boolean(event)} onClose={onClose} title={event?.title ?? ''}>
      {event && (
        <div className="grid gap-4">
          <figure className="grid gap-1.5">
            <img src={event.image.src} alt={event.image.alt} className="aspect-[16/9] w-full rounded-2xl object-cover outline-1 -outline-offset-1 outline-black/10" />
            <figcaption className="text-xs text-ink-2">
              <a href={event.image.sourceUrl} target="_blank" rel="noreferrer" className="underline underline-offset-2">
                {t('events.photoCredit', { author: event.image.author, license: event.image.license })}
              </a>
            </figcaption>
          </figure>

          <EventMeta event={event} timeZone={timeZone} className="text-sm" />

          {event.dataStatus === 'DEMO' && (
            <p className="flex items-start gap-2 rounded-2xl bg-status-demo/10 p-3 text-sm text-ink">
              <Info aria-hidden="true" size={18} strokeWidth={2} className="mt-px shrink-0 text-status-demo" />
              <span>
                <DataStatusBadge status="DEMO" /> {t('events.demoNotice')}
              </span>
            </p>
          )}

          <p className="flex items-start gap-2 text-sm text-ink-2">
            <Bus aria-hidden="true" size={18} strokeWidth={2} className="mt-px shrink-0 text-accent" />
            {t('events.directionsSoon')}
          </p>
        </div>
      )}
    </Sheet>
  );
}
