import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Bus, CalendarDays, Info, X } from 'lucide-react';
import { motion, useIsPresent } from 'motion/react';
import { DataStatusBadge } from '@/shared/components/DataStatusBadge.jsx';
import { Photo } from '@/shared/components/Photo.jsx';
import { StarRating } from '@/shared/components/StarRating.jsx';
import { useI18n } from '@/shared/i18n';
import { photoSizes } from '@/shared/lib/demoImage.js';
import { fadeRise, press, spring, stagger } from '@/shared/motion/motion.js';
import { EventMeta } from './EventMeta.jsx';

// Detalle de un evento: la tarjeta del bento se EXPANDE hasta este panel (layoutId compartido del marco y la foto,
// spring.morph) y al cerrar vuelve a su hueco. El contenido entra en cascada cuando el panel ya casi llegó.
// Capa fija en un portal (fuera de ancestros con transform). Accesibilidad hecha a mano, sin <dialog> (su top layer
// no está soportado por las animaciones de layout): role="dialog" + aria-modal, foco al botón de cerrar (EventsSection lo
// devuelve a la tarjeta al salir), Escape cierra, el resto de la app queda inerte (#root.inert) y sin scroll de fondo.
// Movimiento reducido: MotionConfig desactiva el layout; queda el fundido del fondo y del contenido.
export function EventDetail({ event, timeZone, onClose }) {
  const { t } = useI18n();
  const titleId = useId();
  const closeButton = useRef(null);
  const panel = useRef(null);
  const hasImage = Boolean(event.image?.src);
  const isPresent = useIsPresent(); // false en cuanto empieza la salida (AnimatePresence lo mantiene montado)

  useEffect(() => {
    if (!isPresent) return;
    const root = document.getElementById('root');
    const html = document.documentElement;
    root.inert = true;
    html.style.overflow = 'hidden';
    closeButton.current?.focus({ preventScroll: true });
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key !== 'Tab') return;
      const controls = panel.current?.querySelectorAll('button:not(:disabled), a[href], input, select, textarea, [tabindex="0"]');
      const first = controls?.[0];
      const last = controls?.[controls.length - 1];
      if ((e.shiftKey && document.activeElement === first) || (!e.shiftKey && document.activeElement === last)) {
        e.preventDefault();
        (e.shiftKey ? last : first)?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      // Al empezar a salir: la app deja de ser inerte y el foco vuelve al botón de la tarjeta (recién montada).
      root.inert = false;
      html.style.overflow = '';
      window.removeEventListener('keydown', onKey);
      requestAnimationFrame(() => document.querySelector(`[data-event-open="${event.id}"]`)?.focus({ preventScroll: true }));
    };
  }, [isPresent, onClose, event.id]);

  return createPortal(
    // Al salir, la capa deja de interceptar toques y sale del árbol de accesibilidad aunque siga animándose.
    <motion.div
      layoutRoot
      aria-hidden={isPresent ? undefined : true}
      inert={!isPresent}
      style={{ pointerEvents: isPresent ? 'auto' : 'none' }}
      className="fixed inset-0 z-50 flex items-end justify-center pb-[env(safe-area-inset-bottom)] sm:items-center sm:p-6"
    >
      <motion.div
        aria-hidden="true"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 0.3 } }}
        exit={{ opacity: 0, transition: { duration: 0.25 } }}
        className="absolute inset-0 contain-paint bg-scrim backdrop-blur-sm"
      />
      <motion.section
        ref={panel}
        layoutId={`event-${event.id}`}
        transition={spring.morph}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        style={{ borderRadius: 'var(--radius-sheet)' }}
        className="relative flex max-h-[min(90dvh,calc(100svh-env(safe-area-inset-bottom)))] w-full min-w-0 max-w-full flex-col overflow-hidden border border-line-strong bg-surface shadow-floating sm:max-w-lg"
      >
        <motion.div layoutId={`event-media-${event.id}`} transition={spring.morph} className="relative h-56 shrink-0 overflow-hidden sm:h-64">
          {hasImage ? (
            <Photo src={event.image.src} alt={event.image.alt} sizes={photoSizes.detail} loading="eager" style={{ objectPosition: event.image.position }} className="size-full object-cover" />
          ) : (
            <div className="grid size-full place-items-center bg-sunk text-ink-3">
              <CalendarDays aria-hidden="true" size={36} strokeWidth={1.5} />
              <span className="sr-only">{t('events.noPhoto')}</span>
            </div>
          )}
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-surface via-surface/10 to-transparent" />
        </motion.div>

        <motion.button
          ref={closeButton}
          type="button"
          onClick={onClose}
          aria-label={t('common.close')}
          whileTap={press}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1, transition: { ...spring.snappy, delay: 0.25 } }}
          exit={{ opacity: 0, scale: 0.6, transition: { duration: 0.12 } }}
          className="absolute top-3 right-3 grid size-11 place-items-center rounded-full bg-scrim text-ink backdrop-blur-md hover:bg-paper"
        >
          <X aria-hidden="true" size={18} strokeWidth={1.5} />
        </motion.button>

        <motion.div
          variants={stagger(0.07, 0.22)}
          initial="hidden"
          animate="visible"
          exit={{ opacity: 0, transition: { duration: 0.12 } }}
          className="-mt-8 grid min-w-0 gap-4 overflow-y-auto overscroll-contain px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
        >
          <motion.div variants={fadeRise} className="relative grid justify-items-start gap-2">
            <DataStatusBadge status={event.dataStatus} />
            <h2 id={titleId} className="text-2xl leading-tight font-semibold text-balance break-words text-ink">
              {event.title}
            </h2>
            <StarRating rating={event.rating} count={event.ratingCount} />
          </motion.div>

          <motion.div variants={fadeRise} className="rounded-card border border-line bg-paper/60 p-4">
            <EventMeta event={event} timeZone={timeZone} className="text-sm" />
          </motion.div>

          {event.dataStatus === 'DEMO' && (
            <motion.p variants={fadeRise} className="flex items-start gap-2.5 rounded-control border border-line bg-sunk p-3 text-sm text-ink">
              <Info aria-hidden="true" size={16} strokeWidth={1.5} className="mt-0.5 shrink-0 text-accent" />
              {t('events.demoNotice')}
            </motion.p>
          )}

          <motion.p variants={fadeRise} className="flex items-start gap-2.5 rounded-control border border-line p-3 text-sm text-ink-2">
            <Bus aria-hidden="true" size={16} strokeWidth={1.5} className="mt-0.5 shrink-0 text-accent" />
            {t('events.directionsSoon')}
          </motion.p>

          {hasImage && (
            <motion.p variants={fadeRise} className="text-xs text-ink-3">
              <a href={event.image.sourceUrl} target="_blank" rel="noreferrer" className="underline decoration-line-strong underline-offset-4 hover:decoration-current">
                {t('events.photoCredit', { author: event.image.author, license: event.image.license })}
              </a>
            </motion.p>
          )}
        </motion.div>
      </motion.section>
    </motion.div>,
    document.body,
  );
}
