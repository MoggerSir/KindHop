import { useState } from 'react';
import { Ellipsis, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useI18n } from '@/shared/i18n';
import { cascadeItem, expand, fadeOnly, fadeRise, iconPop, iconSwap, press, spring, stagger } from '@/shared/motion/motion.js';
import { useRevealScroll } from '@/shared/motion/useRevealScroll.js';
import { MORE_CATEGORIES, PRIMARY_CATEGORIES } from './categories.js';

// Filtro por categoría: la píldora lima se desliza a la elegida (layoutId) y su icono da un salto; al pulsar, 0.96.
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
      aria-pressed={Boolean(selected)}
      whileTap={press}
      transition={spring.snappy}
      className={`relative isolate flex min-h-[4.2rem] w-full flex-col items-center justify-center gap-1.5 rounded-card border px-1 transition-[border-color,color,background-color] duration-150 ${
        // El color del texto llega con la píldora (retraso de 120 ms), nunca negro sobre fondo oscuro mientras viaja.
        selected ? 'border-accent text-on-accent delay-[120ms]' : 'border-line bg-surface text-ink hover:border-line-strong hover:bg-surface-hover'
      }`}
    >
      {/* Una sola píldora lima viaja a la categoría elegida (layoutId). Con isolate en el botón y z-10 en contenido
          siempre se ve en lima tanto en la fila principal como en las categorías desplegadas. */}
      {selected && <motion.span layoutId="category-pill" transition={spring.snappy} aria-hidden="true" className="absolute inset-0 z-0 rounded-card bg-accent shadow-solid" />}
      <motion.span key={String(selected)} animate={selected ? iconPop : undefined} className="relative z-10 grid">
        <Icon aria-hidden="true" size={20} strokeWidth={1.5} />
      </motion.span>
      <span className="relative z-10 max-w-full truncate text-center text-xs font-medium">{t(`discovery.categories.${id}`)}</span>
    </motion.button>
  );
}

export function CategoryGrid({ selectedCategory = 'music', onSelect }) {
  const { t } = useI18n();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const revealScroll = useRevealScroll();

  return (
    <section aria-label={t('discovery.title')} className="grid min-w-0 gap-2">
      <motion.ul variants={stagger(0.04)} className="isolate grid grid-cols-5 gap-2 [&>li]:min-w-0">
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
            whileTap={press}
            transition={spring.snappy}
            className={`flex min-h-[4.2rem] w-full flex-col items-center justify-center gap-1.5 rounded-card border px-1 transition-[background-color,border-color,color,box-shadow] duration-150 ${
              open
                ? 'border-accent bg-accent text-on-accent shadow-solid'
                : 'border-line bg-surface text-ink hover:border-line-strong hover:bg-surface-hover'
            }`}
          >
            <span className="grid size-5 place-items-center">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span key={open ? 'close' : 'more'} {...(reduce ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.15 } } : iconSwap)} className="grid">
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
            <ul className="isolate grid grid-cols-5 gap-2 [&>li]:min-w-0">
              {MORE_CATEGORIES.map(({ id, Icon }) => (
                <motion.li key={id} variants={cascadeItem}>
                  <CategoryButton id={id} Icon={Icon} selected={selectedCategory === id} onSelect={onSelect} />
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
