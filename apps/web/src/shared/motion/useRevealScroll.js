import { useRef } from 'react';

// Guía la mirada hacia un panel que se expande: mientras crece, la página baja con él fotograma a fotograma para
// que su borde inferior quede siempre por encima de la barra inferior fija. Seguir el crecimiento (en vez de
// desplazar al final o calcular el destino al empezar) funciona aunque la página aún no tenga altura para bajar.
// Uso: <motion.div {...useRevealScroll()} variants={expand} …>. Al plegarse no desplaza.
const BOTTOM_GAP = 88; // barra inferior (64 px) + aire

export function useRevealScroll() {
  const ref = useRef(null);
  const opening = useRef(false);

  function follow() {
    if (!opening.current || !ref.current) return;
    const overflow = ref.current.getBoundingClientRect().bottom + BOTTOM_GAP - window.innerHeight;
    if (overflow > 0) window.scrollBy(0, overflow);
  }

  return {
    ref,
    onAnimationStart: (definition) => {
      opening.current = definition === 'visible';
    },
    onUpdate: follow,
    onAnimationComplete: () => {
      follow();
      opening.current = false;
    },
  };
}
