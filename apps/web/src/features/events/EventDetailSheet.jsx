import { useState } from 'react';
import { Bus, Info } from 'lucide-react';
import { motion } from 'motion/react';
import { DataStatusBadge } from '@/shared/components/DataStatusBadge.jsx';
import { Sheet } from '@/shared/components/Sheet.jsx';
import { useI18n } from '@/shared/i18n';
import { fadeRise, stagger } from '@/shared/motion/motion.js';
import { EventMeta } from './EventMeta.jsx';

// Detalle de un evento: foto con su crédito y licencia, cuándo y dónde, procedencia y aviso honesto de "cómo llegar".
// El contenido entra en cascada (80 ms entre bloques) mientras la hoja sube.
export function EventDetailSheet({ event: requested, timeZone, onClose }) {
  const { t } = useI18n();
  // Conserva el último evento mientras la hoja anima su salida (requested ya es null en ese momento).
  const [last, setLast] = useState(requested);
  if (requested && requested !== last) setLast(requested);
  const event = requested ?? last;
  const hasImage = Boolean(event?.image?.src);
  return (
    <Sheet open={Boolean(requested)} onClose={onClose} title={event?.title ?? ''}>
      {event && (
        <motion.div key={event.id} className="grid gap-4" variants={stagger(0.08, 0.12)} initial="hidden" animate="visible">
          {hasImage ? (
            <motion.figure variants={fadeRise} className="grid gap-1.5">
              <img
                src={event.image.src}
                alt={event.image.alt}
                className="aspect-[16/9] w-full rounded-2xl object-cover border border-line"
                style={{ objectPosition: event.image.position }}
              />
              <figcaption className="text-xs text-ink-2">
                <a href={event.image.sourceUrl} target="_blank" rel="noreferrer" className="underline decoration-line-strong underline-offset-4 hover:decoration-current">
                  {t('events.photoCredit', { author: event.image.author, license: event.image.license })}
                </a>
              </figcaption>
            </motion.figure>
          ) : (
            <motion.p variants={fadeRise} className="text-sm text-ink-2">
              {t('events.noPhoto')}
            </motion.p>
          )}

          <motion.div variants={fadeRise} className="rounded-2xl border border-line bg-surface p-4">
            <EventMeta event={event} timeZone={timeZone} className="text-sm" />
          </motion.div>

          {event.dataStatus === 'DEMO' && (
            <motion.p variants={fadeRise} className="flex items-start gap-2.5 rounded-xl border border-line bg-sunk p-3 text-sm text-ink shadow-sunk">
              <Info aria-hidden="true" size={16} strokeWidth={1.5} className="mt-0.5 shrink-0 text-accent" />
              <span>
                <DataStatusBadge status="DEMO" /> {t('events.demoNotice')}
              </span>
            </motion.p>
          )}

          <motion.p variants={fadeRise} className="flex items-start gap-2.5 rounded-xl border border-line bg-surface p-3 text-sm text-ink-2">
            <Bus aria-hidden="true" size={16} strokeWidth={1.5} className="mt-0.5 shrink-0 text-accent" />
            {t('events.directionsSoon')}
          </motion.p>
        </motion.div>
      )}
    </Sheet>
  );
}