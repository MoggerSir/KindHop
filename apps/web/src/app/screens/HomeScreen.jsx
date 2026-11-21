import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { CategoryGrid, HomeSpotCards } from '@/features/discovery';
import { EventsSection, dayKey } from '@/features/events';
import { AdSlot } from '@/features/monetization';
import { fadeOnly, stageItem, stagger } from '@/shared/motion/motion.js';

// Pestaña Inicio: categorías (filtro; tocar la activa lo quita), eventos recomendados en bento y accesos a comercios/turismo.
// Sin buscador aquí: la búsqueda vive en la pestaña Explorar.
export function HomeScreen({ city, onExplore, onOpenMap }) {
  const reduce = useReducedMotion();
  const item = reduce ? fadeOnly : stageItem;
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
    <motion.div variants={stagger(0.1)} initial="hidden" animate="visible" className="grid gap-4 pt-3 [&>*]:min-w-0">
      {/* Categorías con selector activo */}
      <motion.div variants={item}>
        <CategoryGrid selectedCategory={category} onSelect={handleSelectCategory} />
      </motion.div>

      {/* Recomendados: los 3 primeros son los puestos pagados, con "Patrocinado · #n" (KH-021) */}
      <motion.div variants={item}>
        <EventsSection
          key={city.id}
          city={city}
          dayKey={day}
          category={category}
          onSeeMore={() => onExplore?.()}
        />
      </motion.div>

      {/* Anuncio personalizado (se oculta con Pro) */}
      <AdSlot kind="direct" />

      {/* Comercios locales y puntos turísticos */}
      <motion.div variants={item}>
        <HomeSpotCards key={city.id} city={city} onOpenMap={onOpenMap} />
      </motion.div>
    </motion.div>
  );
}
