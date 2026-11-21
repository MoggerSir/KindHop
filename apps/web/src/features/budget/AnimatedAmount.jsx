import { useLayoutEffect, useRef } from 'react';
import { animate, useReducedMotion } from 'motion/react';
import { ease } from '@/shared/motion/motion.js';

// Monto que cuenta hasta su nuevo valor cuando cambia (no al montar: el primer valor ya se ve correcto).
// El número visible lo escribe solo este efecto (React no le pone hijos, así no pelean por el mismo nodo de texto);
// es decorativo (aria-hidden) y el valor final siempre está en el texto oculto para lectores de pantalla.
// Con movimiento reducido salta directo al valor final.
export function AnimatedAmount({ cents, format, className = '' }) {
  const node = useRef(null);
  const shown = useRef(null);
  const reduce = useReducedMotion();

  useLayoutEffect(() => {
    const el = node.current;
    const from = shown.current; // lo que se ve ahora (a mitad de una cuenta, si la había)
    if (from === null || from === cents || reduce) {
      shown.current = cents;
      el.textContent = format(cents);
      return;
    }
    const controls = animate(from, cents, {
      duration: 0.6,
      ease: ease.outExpo,
      onUpdate: (v) => {
        shown.current = Math.round(v);
        el.textContent = format(shown.current);
      },
    });
    return () => controls.stop();
  }, [cents, format, reduce]);

  return (
    <span className={className}>
      <span ref={node} aria-hidden="true" />
      <span className="sr-only">{format(cents)}</span>
    </span>
  );
}
