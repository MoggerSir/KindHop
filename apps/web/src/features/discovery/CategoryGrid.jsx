import { useState } from 'react';
import { Ellipsis, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useI18n } from '@/shared/i18n';
import { cascadeItem, expand, fadeOnly, fadeRise, iconSwap, press, spring, stagger } from '@/shared/motion/motion.js';
import { useRevealScroll } from '@/shared/motion/useRevealScroll.js';
import { MORE_CATEGORIES, PRIMARY_CATEGORIES } from './categories.js';

// Accesos a Explorar por categoría: piezas grabadas en seco que suben 2 px con puntero y se hunden al pulsarlas.
// "Ver todo" expande, en la misma pantalla y hacia abajo, una cuadrícula con el resto de categorías:
// el panel crece con resorte, sus piezas entran en cascada y el icono cambia de "…" a "×"; mientras crece, la página
// baja con él para mostrarlo entero (useRevealScroll). Al cerrar, todo ocurre en reversa: las piezas se hunden de la
// última a la primera y después el panel se pliega.
function CategoryButton({ id, Icon, onSelect }) {
  const { t } = useI18n();
  return (
    <motion.button
      type="button"
      onClick={() => onSelect(id)}
      whileHover={{ y: -2 }}
      whileTap={press}
      transition={spring.snappy}
      className="flex min-h-[clamp(3.5rem,7.5dvh,4rem)] w-full flex-col items-center justify-center gap-1.5 rounded-control border border-transparent bg-surface px-0.5 text-ink shadow-embossed transition-shadow duration-150 active:shadow-sunk"
    >
      <Icon aria-hidden="true" size={18} strokeWidth={1.5} />
      <span className="label text-center !text-[0.5625rem] !tracking-[0.08em]">{t(`discovery.categories.${id}`)}</span>
    </motion.button>
  );
}

export function CategoryGrid({ onSelect }) {
  const { t } = useI18n();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const revealScroll = useRevealScroll();

  return (
    <section aria-labelledby="categories-title" className="grid gap-2.5">
      <h2 id="categories-title" className="title text-base text-balance">
        {t('discovery.title')}
      </h2>
      <motion.ul variants={stagger(0.05)} className="grid grid-cols-5 gap-1.5">
        {PRIMARY_CATEGORIES.map(({ id, Icon }) => (
          <motion.li key={id} variants={fadeRise}>
            <CategoryButton id={id} Icon={Icon} onSelect={onSelect} />
          </motion.li>
        ))}
        <motion.li variants={fadeRise}>
          <motion.button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="more-categories"
            whileHover={{ y: -2 }}
            whileTap={press}
            transition={spring.snappy}
            className={`flex min-h-[clamp(3.5rem,7.5dvh,4rem)] w-full flex-col items-center justify-center gap-1.5 rounded-control border border-transparent px-0.5 transition-[background-color,color,box-shadow] duration-150 ${open ? 'bg-solid text-on-solid shadow-solid' : 'bg-surface text-ink shadow-embossed active:shadow-sunk'}`}
          >
            <span className="grid size-[18px] place-items-center">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span key={open ? 'close' : 'more'} {...iconSwap} className="grid">
                  {open ? <X aria-hidden="true" size={18} strokeWidth={1.5} /> : <Ellipsis aria-hidden="true" size={18} strokeWidth={1.5} />}
                </motion.span>
              </AnimatePresence>
            </span>
            <span className="label text-center !text-[0.5625rem] !tracking-[0.08em]">{t(open ? 'discovery.showLess' : 'discovery.showAll')}</span>
          </motion.button>
        </motion.li>
      </motion.ul>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            {...revealScroll}
            id="more-categories"
            key="more"
            variants={reduce ? fadeOnly : expand}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="-m-2 overflow-hidden p-2"
          >
            <h3 className="sr-only">{t('discovery.moreLabel')}</h3>
            <ul className="grid grid-cols-4 gap-1.5">
              {MORE_CATEGORIES.map(({ id, Icon }) => (
                <motion.li key={id} variants={cascadeItem}>
                  <CategoryButton id={id} Icon={Icon} onSelect={onSelect} />
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
