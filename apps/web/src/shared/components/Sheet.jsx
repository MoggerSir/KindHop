import { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';
import { animate, useReducedMotion } from 'motion/react';
import { useI18n } from '@/shared/i18n';
import { ease, spring } from '@/shared/motion/motion.js';

// Hoja inferior en móvil, diálogo centrado en escritorio: cartulina flotante con corte casi recto.
// <dialog> nativo (foco atrapado, Escape y fondo inerte gratis) animado con Motion: sube con resorte y,
// al cerrar, baja 24 px y se desvanece ANTES de cerrarse (la salida es más corta que la entrada).
// Controlado: `open` lo abre/cierra; `onClose` se pide al pulsar Escape, la X o tocar fuera (closedby="any";
// en navegadores sin soporte, tocar fuera no cierra pero Escape y la X sí).
export function Sheet({ open, onClose, title, children }) {
  const { t } = useI18n();
  const dialog = useRef(null);
  const titleId = useId();
  const reduce = useReducedMotion();

  useEffect(() => {
    const node = dialog.current;
    if (open && !node.open) {
      node.showModal();
      animate(node, reduce ? { opacity: [0, 1] } : { opacity: [0, 1], y: [48, 0] }, reduce ? { duration: 0.15 } : spring.sheet);
    } else if (!open && node.open) {
      animate(node, reduce ? { opacity: 0 } : { opacity: 0, y: 24 }, { duration: 0.15, ease: ease.fluid }).then(() => node.close());
    }
  }, [open, reduce]);

  return (
    <dialog
      ref={dialog}
      closedby="any"
      onCancel={(e) => {
        e.preventDefault(); // Escape / tocar fuera: dejamos que la salida animada cierre el diálogo.
        onClose();
      }}
      aria-labelledby={titleId}
      className="m-0 mt-auto max-h-[85dvh] w-full max-w-none overscroll-contain rounded-t-sheet border border-line bg-surface p-0 text-ink shadow-floating backdrop:bg-scrim backdrop:backdrop-blur-sm open:flex open:flex-col sm:m-auto sm:max-w-lg sm:rounded-sheet"
    >
      <header className="flex items-center justify-between gap-3 px-5 pt-4 pb-3 border-b border-line">
        <h2 id={titleId} className="title text-lg font-semibold text-ink">
          {title}
        </h2>
        <button type="button" onClick={onClose} aria-label={t('common.close')} className="grid size-11 place-items-center rounded-full text-ink-2 transition-colors duration-150 hover:bg-tint hover:text-ink">
          <X aria-hidden="true" size={18} strokeWidth={1.5} />
        </button>
      </header>
      <div className="overflow-y-auto overscroll-contain px-5 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">{children}</div>
    </dialog>
  );
}
