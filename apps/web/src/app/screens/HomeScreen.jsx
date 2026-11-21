import { useState } from 'react';
import { motion } from 'motion/react';
import { CategoryGrid } from '@/features/discovery';
import { EventsSection, dayKey } from '@/features/events';
import { fadeRise, stagger } from '@/shared/motion/motion.js';

// Pestaña Inicio: categorías (filtro; tocar la activa lo quita) y eventos recomendados en bento.
// Sin buscador aquí: la búsqueda vive en la pestaña Explorar.
export function HomeScreen({ city, onExplore }) {
  const [day] = useState(() => dayKey(new Date(), city.timezone));
  const [category, setCategory] = useState(null); // null = todas las categorías

  const handleSelectCategory = (id) => {
    if (id === 'more') {
      onExplore?.(id);
    } else {
      setCategory((prev) => (prev === id ? null : id));
    }
  };

  return (
    <motion.div variants={stagger(0.08)} initial="hidden" animate="visible" className="grid gap-4 pt-3 [&>*]:min-w-0">
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
        />
      </motion.div>
    </motion.div>
  );
}
