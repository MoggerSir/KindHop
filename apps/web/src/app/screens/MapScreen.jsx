import { Bus } from 'lucide-react';
import { motion } from 'motion/react';
import { ModuleStatusList } from '@/features/cities';
import { OsmAttribution } from '@/features/discovery';
import { CityMap } from '@/features/map';
import { TransitCredit, useTransit } from '@/features/transit';
import { EmptyState } from '@/shared/components/EmptyState.jsx';
import { ErrorState } from '@/shared/components/ErrorState.jsx';
import { useI18n } from '@/shared/i18n';
import { fadeRise, stagger } from '@/shared/motion/motion.js';

const NO_ROUTES = [];

// Pestaña Mapa: mapa de la ciudad y estado honesto de sus capas. Aquí se montan las capas de cada feature
// (transporte, lugares, incidencias…); cada una recibe `city` y decide sola qué pedir. Bloques en cascada al entrar.
export function MapScreen({ city }) {
  const { t } = useI18n();
  const transitEnabled = city.modules.transit === 'IMPLEMENTED';
  const { status, transit, error, reload } = useTransit(transitEnabled ? city.id : null);
  const routes = transit?.routes ?? NO_ROUTES;
  return (
    <motion.div variants={stagger(0.1)} initial="hidden" animate="visible" className="grid gap-4 pt-4">
      <motion.h2 variants={fadeRise} className="display text-2xl">
        {city.name}
      </motion.h2>
      <motion.div variants={fadeRise} className="relative h-[58dvh]">
        <CityMap city={city} routes={routes} />
        {transit?.source && (
          <div className="absolute left-3 top-3 z-10 max-w-[min(18rem,calc(100%-4.5rem))]">
            <TransitCredit source={transit.source} routes={routes} />
          </div>
        )}
      </motion.div>
      {transitEnabled && status === 'loading' && (
        <motion.p variants={fadeRise} role="status" className="text-sm text-ink-2">
          {t('transit.loading')}
        </motion.p>
      )}
      {transitEnabled && status === 'error' && (
        <motion.div variants={fadeRise}>
          <ErrorState error={error} onRetry={reload} />
        </motion.div>
      )}
      {transitEnabled && status === 'ready' && routes.length === 0 && (
        <EmptyState icon={Bus} title={t('transit.emptyTitle')}>
          {t('transit.emptyBody')}
        </EmptyState>
      )}
      <motion.div variants={fadeRise}>
        <OsmAttribution />
      </motion.div>
      <motion.section variants={fadeRise} aria-labelledby="layers-title" className="rounded-2xl border border-line bg-surface p-4 shadow-raised">
        <h3 id="layers-title" className="title mb-3 text-base font-semibold text-white">
          {t('cities.layersTitle', { city: city.name })}
        </h3>
        <ModuleStatusList modules={city.modules} />
      </motion.section>
    </motion.div>
  );
}
