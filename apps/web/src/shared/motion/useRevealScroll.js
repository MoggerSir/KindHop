import { useEffect, useRef } from 'react';

// Guía la mirada hacia un panel que se expande: mientras crece, la página baja con él fotograma a fotograma para
// que su borde inferior quede siempre por encima de la barra inferior fija. Seguir el crecimiento (en vez de
// desplazar al final o calcular el destino al empezar) funciona aunque la página aún no tenga altura para bajar.
// Uso: <motion.div {...useRevealScroll()} variants={expand} …>. Al plegarse no desplaza.
const BOTTOM_GAP = 88; // barra inferior (64 px) + aire
// `bottomGap`: súmale el alto de lo que haya debajo del panel y deba verse también (p. ej. su botón de cerrar).

export function useRevealScroll(bottomGap = BOTTOM_GAP) {
  const ref = useRef(null);
  const opening = useRef(false);
  const frame = useRef(0);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  // Un solo getBoundingClientRect por fotograma: onUpdate puede llamarse más de una vez y cada lectura fuerza layout.
  function follow() {
    if (frame.current) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      if (!opening.current || !ref.current) return;
      const overflow = ref.current.getBoundingClientRect().bottom + bottomGap - window.innerHeight;
      if (overflow > 0.5) window.scrollBy(0, overflow);
    });
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
