import { useState } from 'react';
import { motion } from 'motion/react';
import { CategoryGrid } from '@/features/discovery';
import { EventsSection, WeekStrip, dayKey } from '@/features/events';
import { useI18n } from '@/shared/i18n';
import { fadeRise, stagger, typeSet } from '@/shared/motion/motion.js';

// Pestaña Inicio: lema, tira de 7 días, eventos desde el día elegido y accesos a Explorar por categoría.
// Momento focal (uno por pantalla): el lema se compone palabra a palabra mientras los bloques entran en cascada.
// En pantallas bajas (< 700 px de alto) el lema se oculta para que todo quepa en la primera vista.
export function HomeScreen({ city, onExplore }) {
  const { t } = useI18n();
  const [day, setDay] = useState(() => dayKey(new Date(), city.timezone));
  const words = t('home.tagline').split(' ');

  return (
    <motion.div variants={stagger(0.1)} initial="hidden" animate="visible" className="grid gap-[clamp(0.5rem,2dvh,1rem)] pt-3">
      <motion.p variants={stagger(0.07)} className="label -mb-0.5 text-ink-2 short:hidden">
        {words.map((word, i) => (
          <span key={i} className="inline-block overflow-hidden pr-[0.35em] align-bottom">
            <motion.span variants={typeSet} className="inline-block">
              {word}
            </motion.span>
          </span>
        ))}
      </motion.p>
      <motion.div variants={fadeRise}>
        <WeekStrip timeZone={city.timezone} value={day} onChange={setDay} />
      </motion.div>
      <motion.div variants={fadeRise}>
        <EventsSection key={city.id} city={city} dayKey={day} />
      </motion.div>
      <motion.div variants={fadeRise}>
        <CategoryGrid onSelect={onExplore} />
      </motion.div>
    </motion.div>
  );
}
