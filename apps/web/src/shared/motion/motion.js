// Vocabulario de movimiento de KinHop (motion/react). Usa estos nombres; nunca números sueltos en un componente.
// Reglas y cuándo usar cada pieza: docs/03-design/motion.md

// Curvas. outExpo: llegadas con aplomo · fluid: cambios de estado · sheet: hojas y paneles que se deslizan.
export const ease = {
  outExpo: [0.16, 1, 0.3, 1],
  fluid: [0.2, 0, 0, 1],
  sheet: [0.32, 0.72, 0, 1],
};

// Resortes, siempre sin rebote: la cartulina se posa, no bota.
export const spring = {
  snappy: { type: 'spring', duration: 0.3, bounce: 0 }, // fichas, indicadores, iconos
  layout: { type: 'spring', duration: 0.45, bounce: 0 }, // reacomodos y elementos compartidos (layoutId)
  reveal: { type: 'spring', duration: 0.55, bounce: 0 }, // paneles que se expanden
  sheet: { type: 'spring', duration: 0.5, bounce: 0 }, // hojas
  // Morph de elemento compartido (tarjeta -> detalle). visualDuration respeta la velocidad del gesto que interrumpe:
  // si el usuario cierra a mitad de la apertura, la vuelta arranca con esa inercia (lo que la hace sentir orgánica).
  morph: { type: 'spring', visualDuration: 0.55, bounce: 0 },
};

// Revelado de una pieza del bento: sube 16 px y se enfoca (desenfoque 4 px -> 0 -> none), en cascada desde su padre.
export const tileReveal = {
  hidden: { opacity: 0, y: 16, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { type: 'spring', visualDuration: 0.6, bounce: 0 },
    transitionEnd: { filter: 'none' },
  },
  exit: { opacity: 0, y: -8, filter: 'blur(4px)', transition: { duration: 0.15, ease: 'easeOut' } },
};

// Foto que se "revela": entra un 12 % más grande y se asienta despacio (solo la foto, dentro de su marco).
export const photoSettle = {
  initial: { scale: 1.12 },
  animate: { scale: 1, transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] } },
};

// Pequeño salto de un icono al quedar seleccionado (confirma el toque sin mover vecinos).
export const iconPop = { scale: [1, 1.22, 1], transition: { duration: 0.42, ease: [0.16, 1, 0.3, 1] } };

// Pulsar: escala 0.96 en 150 ms. Úsalo como whileTap en lo que se toca.
export const press = { scale: 0.96, transition: { duration: 0.15, ease: 'easeOut' } };

// Entrada de un bloque: sube 12 px y aparece, nítido. La salida es más corta y más pequeña.
export const fadeRise = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: ease.outExpo } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.15, ease: 'easeOut' } },
};

// Entrada escalonada de pantalla (better-ui): 12 px + blur 4 px en 300 ms ease-out; salida 150 ms.
// Combinar siempre con `useReducedMotion() ? fadeOnly : stageItem` y padre `stagger(0.1)`.
export const stageItem = {
  hidden: { opacity: 0, y: 12, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.3, ease: 'easeOut' },
    transitionEnd: { filter: 'none' },
  },
  exit: { opacity: 0, y: -12, filter: 'blur(4px)', transition: { duration: 0.15, ease: 'easeOut' } },
};

// Padre que escalona a sus hijos (100 ms entre grupos). Solo entradas poco frecuentes, nunca listas que cambian.
export const stagger = (step = 0.1, delay = 0) => ({
  hidden: {},
  visible: { transition: { staggerChildren: step, delayChildren: delay } },
  exit: {},
});

// Tipo que se compone: cada palabra sube desde debajo de su línea (el padre recorta con overflow: hidden).
export const typeSet = {
  hidden: { y: '105%' },
  visible: { y: 0, transition: { duration: 0.8, ease: ease.outExpo } },
};

// Panel que se expande (Ver más, Ver todo): la altura crece con resorte y su contenido entra en cascada.
// Al cerrar ocurre lo mismo en reversa: las piezas se hunden de la última a la primera y, al terminar, el panel se pliega.
// Los hijos usan `cascadeItem`.
export const expand = {
  hidden: { height: 0, opacity: 0 },
  visible: { height: 'auto', opacity: 1, transition: { ...spring.reveal, staggerChildren: 0.06, delayChildren: 0.05 } },
  exit: {
    height: 0,
    opacity: 0,
    transition: { when: 'afterChildren', staggerChildren: 0.035, staggerDirection: -1, duration: 0.28, ease: ease.fluid },
  },
};

// Pieza dentro de un panel `expand`: sube al entrar y vuelve a hundirse (no sale hacia arriba) al cerrar.
export const cascadeItem = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: ease.outExpo } },
  exit: { opacity: 0, y: 12, transition: { duration: 0.15, ease: 'easeIn' } },
};

// Cambio de icono contextual (Ver todo -> cerrar): escala 0.25 -> 1, opacidad y desenfoque 4 px (el único del sistema).
// Úsalo dentro de <AnimatePresence mode="popLayout" initial={false}>.
export const iconSwap = {
  initial: { opacity: 0, scale: 0.25, filter: 'blur(4px)' },
  animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
  exit: { opacity: 0, scale: 0.25, filter: 'blur(4px)' },
  transition: spring.snappy,
};

// Con movimiento reducido cualquier variante se vuelve un fundido corto (MotionConfig reducedMotion="user"
// ya quita transformaciones; para alturas y recorridos usa esta variante con useReducedMotion()).
export const fadeOnly = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, filter: 'none', transition: { duration: 0.15 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};
