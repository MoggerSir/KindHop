import { motion } from 'motion/react';
import { useI18n } from '@/shared/i18n';
import { fadeRise } from '@/shared/motion/motion.js';

// Crédito ODbL siempre visible. El control compacto del mapa lo esconde detrás de un botón.
// `standalone` anima el bloque cuando no hay un padre con stagger (pestaña Explorar).
export function OsmAttribution({ standalone = false }) {
  const { t } = useI18n();
  const Tag = standalone ? motion.p : 'p';
  return (
    <Tag
      {...(standalone ? { variants: fadeRise, initial: 'hidden', animate: 'visible' } : {})}
      className="text-xs leading-5 text-ink-2"
    >
      <a
        href="https://www.openstreetmap.org/copyright"
        target="_blank"
        rel="noreferrer"
        className="inline-flex min-h-11 items-center underline decoration-line-strong underline-offset-4 hover:decoration-current"
      >
        {t('discovery.osmAttribution')}
      </a>
    </Tag>
  );
}
