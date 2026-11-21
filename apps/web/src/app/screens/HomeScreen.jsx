import { useState } from 'react';
import { Search } from 'lucide-react';
import { motion } from 'motion/react';
import { CategoryGrid } from '@/features/discovery';
import { EventsSection, dayKey } from '@/features/events';
import { useI18n } from '@/shared/i18n';
import { fadeRise, stagger } from '@/shared/motion/motion.js';

// Pestaña Inicio: barra de búsqueda, categorías (filtro opcional, activo en lima) y lista de eventos próximos.
// Sin categoría elegida se ven todos los eventos: un filtro por defecto escondería eventos sin avisar.
export function HomeScreen({ city, onExplore }) {
  const { t } = useI18n();
  const [day] = useState(() => dayKey(new Date(), city.timezone));
  const [category, setCategory] = useState(null);
  const [search, setSearch] = useState('');

  const handleSelectCategory = (id) => {
    if (id === 'more') {
      onExplore?.(id);
    } else {
      setCategory((prev) => (prev === id ? null : id));
    }
  };

  return (
    <motion.div variants={stagger(0.08)} initial="hidden" animate="visible" className="grid gap-4 pt-3 [&>*]:min-w-0">
      {/* Barra de búsqueda */}
      <motion.div variants={fadeRise} className="relative">
        <label htmlFor="event-search" className="sr-only">
          {t('home.searchPlaceholder')}
        </label>
        <div className="relative flex items-center rounded-card border border-line bg-surface px-4 py-2.5 shadow-sunk transition-colors duration-150 focus-within:border-accent">
          <Search aria-hidden="true" size={18} strokeWidth={1.5} className="text-ink-2 shrink-0" />
          <input
            id="event-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('home.searchPlaceholder')}
            className="w-full bg-transparent pl-3 text-sm text-ink placeholder:text-ink-3 focus:outline-none"
          />
        </div>
      </motion.div>

      {/* Categorías con selector activo */}
      <motion.div variants={fadeRise}>
        <CategoryGrid selectedCategory={category} onSelect={handleSelectCategory} />
      </motion.div>

      {/* Lista de eventos */}
      <motion.div variants={fadeRise}>
        <EventsSection
          key={city.id}
          city={city}
          dayKey={day}
          category={category}
          searchQuery={search}
        />
      </motion.div>
    </motion.div>
  );
}
