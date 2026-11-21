import { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';
import { useI18n } from '@/shared/i18n';

// Hoja inferior en móvil, diálogo centrado en escritorio. <dialog> nativo: foco atrapado, Escape y fondo inerte gratis.
// Controlado: `open` lo abre/cierra; `onClose` se llama al cerrar por Escape, por el botón o tocando fuera
// (closedby="any"; en navegadores sin soporte, tocar fuera no cierra pero Escape y el botón sí).
export function Sheet({ open, onClose, title, children }) {
  const { t } = useI18n();
  const dialog = useRef(null);
  const titleId = useId();

  useEffect(() => {
    const node = dialog.current;
    if (open && !node.open) node.showModal();
    if (!open && node.open) node.close();
  }, [open]);

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      closedby="any"
      aria-labelledby={titleId}
      className="m-0 mt-auto max-h-[85dvh] w-full max-w-none overscroll-contain rounded-t-3xl bg-surface p-0 text-ink shadow-[0_-8px_32px_-8px_oklch(0.25_0.03_200/0.35)] backdrop:bg-ink/40 open:flex open:flex-col sm:m-auto sm:max-w-lg sm:rounded-3xl motion-safe:transition-[translate,opacity,display,overlay] motion-safe:duration-300 motion-safe:ease-[cubic-bezier(0.2,0,0,1)] motion-safe:transition-discrete starting:open:translate-y-6 starting:open:opacity-0"
    >
      <header className="flex items-center justify-between gap-3 px-5 pt-4 pb-2">
        <h2 id={titleId} className="text-lg font-bold tracking-tight">
          {title}
        </h2>
        <button type="button" onClick={() => dialog.current.close()} aria-label={t('common.close')} className="grid size-11 place-items-center rounded-full text-ink-2 hover:bg-paper">
          <X aria-hidden="true" size={20} strokeWidth={2} />
        </button>
      </header>
      <div className="overflow-y-auto overscroll-contain px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">{children}</div>
    </dialog>
  );
}
