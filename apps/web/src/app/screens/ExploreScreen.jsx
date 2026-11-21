import { motion } from 'motion/react';
import { CategoryGrid, OsmAttribution, PlaceResults } from '@/features/discovery';
import { EventSearch } from '@/features/events';
import { useI18n } from '@/shared/i18n';
import { fadeRise, stagger } from '@/shared/motion/motion.js';

// Pestaña Explorar: buscador de eventos con categorías y "cuándo". Búsqueda y filtros viven en la URL
// (?tab=explore&q=&category=&when=) para compartir y para el botón atrás. Tocar la categoría activa la quita.
export function ExploreScreen({ city, category, q, when, onFilter }) {
  const { t } = useI18n();
  return (
    <motion.div variants={stagger(0.08)} initial="hidden" animate="visible" className="grid gap-4 pt-3 [&>*]:min-w-0">
      <h2 className="sr-only">{t('screens.explore.title')}</h2>
      <motion.div variants={fadeRise}>
        <EventSearch
          key={city.id}
          city={city}
          query={q}
          category={category}
          when={when}
          onChange={onFilter}
          renderPlaces={(query) => <PlaceResults city={city} query={query} category={category} />}
          filters={<CategoryGrid selectedCategory={category} onSelect={(id) => onFilter({ category: id === category ? null : id })} />}
        />
      </motion.div>
      <OsmAttribution standalone />
    </motion.div>
  );
}
