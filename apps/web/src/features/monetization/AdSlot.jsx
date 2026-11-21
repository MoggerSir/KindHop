import { Megaphone, Sparkles } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { DataStatusBadge } from '@/shared/components/DataStatusBadge.jsx';
import { useI18n } from '@/shared/i18n';
import { fadeOnly, stageItem } from '@/shared/motion/motion.js';
import { usePlan } from './PlanContext.js';
import { SponsorBadge } from './SponsorBadge.jsx';

// Espacio de anuncio (KH-021). Con Pro no se pinta. Dos tipos:
// - `direct`: anuncio personalizado vendido por KinHop a un negocio (banner propio en app y web).
// - `network`: hueco de red publicitaria (AdMob en la app móvil; en web, su equivalente). En la demo se muestra
//   el hueco reservado: no se cargan anuncios reales de terceros.
export function AdSlot({ kind = 'direct' }) {
  const { t } = useI18n();
  const reduce = useReducedMotion();
  const { pro } = usePlan();
  if (pro) return null;
  const Icon = kind === 'direct' ? Sparkles : Megaphone;
  return (
    <motion.aside
      variants={reduce ? fadeOnly : stageItem}
      initial="hidden"
      animate="visible"
      aria-label={t('monetization.ad.label')}
      className="grid gap-2 rounded-card border border-line bg-surface p-4 shadow-raised"
    >
      <div className="flex items-center justify-between gap-2">
        <SponsorBadge kind="ad" />
        <DataStatusBadge status="DEMO" />
      </div>
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-control bg-sunk text-accent shadow-sunk">
          <Icon aria-hidden="true" size={18} strokeWidth={1.5} />
        </span>
        <div className="grid min-w-0 gap-0.5">
          <p className="text-sm font-semibold text-ink">{t(`monetization.ad.${kind}.title`)}</p>
          <p className="text-xs text-pretty text-ink-2">{t(`monetization.ad.${kind}.body`)}</p>
        </div>
      </div>
      <p className="text-[11px] text-ink-3">{t('monetization.ad.removeWithPro')}</p>
    </motion.aside>
  );
}
