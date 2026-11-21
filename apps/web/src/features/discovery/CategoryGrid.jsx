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
function CategoryButton({ id, Icon, selected, onSelect }) {
  const { t } = useI18n();
  return (
    <motion.button
      type="button"
      onClick={() => onSelect(id)}
      whileHover={{ y: -2 }}
      whileTap={press}
      transition={spring.snappy}
      className={`flex min-h-[4.2rem] w-full flex-col items-center justify-center gap-1.5 rounded-2xl border px-1 transition-all ${
        selected
          ? 'border-accent bg-accent text-on-accent shadow-solid'
          : 'border-line bg-surface text-ink hover:border-line-strong hover:bg-surface-hover'
      }`}
    >
      <Icon aria-hidden="true" size={20} strokeWidth={selected ? 2 : 1.5} />
      <span className="max-w-full truncate text-center text-xs font-medium">{t(`discovery.categories.${id}`)}</span>
    </motion.button>
  );
}

export function CategoryGrid({ selectedCategory = 'music', onSelect }) {
  const { t } = useI18n();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const revealScroll = useRevealScroll();

  return (
    <section aria-label={t('discovery.title')} className="grid gap-2">
      <motion.ul variants={stagger(0.04)} className="grid grid-cols-5 gap-2 [&>li]:min-w-0">
        {PRIMARY_CATEGORIES.map(({ id, Icon }) => (
          <motion.li key={id} variants={fadeRise}>
            <CategoryButton
              id={id}
              Icon={Icon}
              selected={selectedCategory === id}
              onSelect={onSelect}
            />
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
            className={`flex min-h-[4.2rem] w-full flex-col items-center justify-center gap-1.5 rounded-2xl border px-1 transition-all ${
              open
                ? 'border-accent bg-accent text-on-accent shadow-solid'
                : 'border-line bg-surface text-ink hover:border-line-strong hover:bg-surface-hover'
            }`}
          >
            <span className="grid size-5 place-items-center">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span key={open ? 'close' : 'more'} {...iconSwap} className="grid">
                  {open ? <X aria-hidden="true" size={20} strokeWidth={1.5} /> : <Ellipsis aria-hidden="true" size={20} strokeWidth={1.5} />}
                </motion.span>
              </AnimatePresence>
            </span>
            <span className="max-w-full truncate text-center text-xs font-medium">
              {t(open ? 'discovery.showLess' : 'discovery.more')}
            </span>
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
            <ul className="grid grid-cols-4 gap-1.5 [&>li]:min-w-0">
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
