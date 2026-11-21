import { motion } from 'motion/react';
import { fadeRise } from '@/shared/motion/motion.js';

// Estado vacío honesto, hundido en el papel: explica por qué no hay datos (sin fuente, aún no construido). Entra subiendo.
// `actions` (opcional): salidas útiles bajo el texto (p. ej. "Prueba con…" en Explorar).
export function EmptyState({ icon: Icon, title, children, actions }) {
  return (
    <motion.div variants={fadeRise} initial="hidden" animate="visible" className="flex min-w-0 flex-col items-center gap-2 rounded-card border border-line bg-surface/40 px-6 py-9 text-center shadow-sunk">
      {Icon && <Icon aria-hidden="true" size={24} strokeWidth={1.5} className="text-accent" />}
      {title && <p className="title mt-1 min-w-0 font-semibold break-words text-ink">{title}</p>}
      <p className="min-w-0 max-w-[min(36ch,100%)] text-sm text-pretty break-words text-ink-2">{children}</p>
      {actions && <div className="mt-2 flex flex-wrap justify-center gap-2">{actions}</div>}
    </motion.div>
  );
}
