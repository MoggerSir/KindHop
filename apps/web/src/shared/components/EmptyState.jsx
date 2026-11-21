import { motion } from 'motion/react';
import { fadeRise } from '@/shared/motion/motion.js';

// Estado vacío honesto, hundido en el papel: explica por qué no hay datos (sin fuente, aún no construido). Entra subiendo.
export function EmptyState({ icon: Icon, title, children }) {
  return (
    <motion.div variants={fadeRise} initial="hidden" animate="visible" className="flex flex-col items-center gap-2 bg-sunk px-6 py-9 text-center shadow-well">
      {Icon && <Icon aria-hidden="true" size={20} strokeWidth={1.5} className="text-ink-2" />}
      {title && <p className="label mt-1">{title}</p>}
      <p className="max-w-[36ch] text-sm text-pretty text-ink-2">{children}</p>
    </motion.div>
  );
}
