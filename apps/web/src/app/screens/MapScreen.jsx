import { motion } from 'motion/react';
import { ModuleStatusList } from '@/features/cities';
import { OsmAttribution } from '@/features/discovery';
import { CityMap } from '@/features/map';
import { useI18n } from '@/shared/i18n';
import { fadeRise, stagger } from '@/shared/motion/motion.js';

// Pestaña Mapa: mapa de la ciudad y estado honesto de sus capas. Aquí se montan las capas de cada feature
// (transporte, lugares, incidencias…); cada una recibe `city` y decide sola qué pedir. Bloques en cascada al entrar.
export function MapScreen({ city }) {
  const { t } = useI18n();
  return (
    <motion.div variants={stagger(0.1)} initial="hidden" animate="visible" className="grid gap-4 pt-4">
      <motion.h2 variants={fadeRise} className="display text-2xl">
        {city.name}
      </motion.h2>
      <motion.div variants={fadeRise} className="h-[58dvh]">
        <CityMap city={city} />
      </motion.div>
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
