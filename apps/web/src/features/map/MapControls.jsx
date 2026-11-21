import { LoaderCircle, LocateFixed, Minus, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { useI18n } from '@/shared/i18n';
import { press } from '@/shared/motion/motion.js';
import { cameraOptions } from './mapTheme.js';

const BUTTON =
  'grid size-11 place-items-center text-ink transition-colors duration-150 hover:bg-surface-hover disabled:cursor-not-allowed disabled:text-ink-3';

// Controles propios del mapa (44 px, tokens, nombres del JSON) en vez de los de MapLibre: localizar y zoom.
// El lienzo también responde al teclado (flechas, + y -) cuando tiene el foco.
export function MapControls({ map, geoStatus, located, onLocate }) {
  const { t } = useI18n();
  const locating = geoStatus === 'locating';
  return (
    <div className="flex flex-col items-end gap-2">
      <motion.button
        type="button"
        onClick={onLocate}
        disabled={locating}
        whileTap={locating ? undefined : press}
        aria-label={t(located ? 'map.controls.centerOnMe' : 'map.controls.locate')}
        className={`${BUTTON} rounded-full border border-line-strong bg-surface shadow-floating ${located ? 'text-accent' : ''}`}
      >
        {locating ? (
          <LoaderCircle aria-hidden="true" size={18} strokeWidth={1.5} className="motion-safe:animate-spin" />
        ) : (
          <LocateFixed aria-hidden="true" size={18} strokeWidth={1.5} />
        )}
      </motion.button>
      <div className="flex flex-col overflow-hidden rounded-full border border-line-strong bg-surface shadow-floating">
        <motion.button type="button" whileTap={press} onClick={() => map.zoomIn(cameraOptions())} aria-label={t('map.zoomIn')} className={BUTTON}>
          <Plus aria-hidden="true" size={18} strokeWidth={1.5} />
        </motion.button>
        <span aria-hidden="true" className="mx-2.5 h-px bg-line-strong" />
        <motion.button type="button" whileTap={press} onClick={() => map.zoomOut(cameraOptions())} aria-label={t('map.zoomOut')} className={BUTTON}>
          <Minus aria-hidden="true" size={18} strokeWidth={1.5} />
        </motion.button>
      </div>
    </div>
  );
}
