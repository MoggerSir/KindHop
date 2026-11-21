// MapLibre pinta en canvas y no entiende clases: los colores salen de los tokens de @theme (src/index.css).
// Se cachean: getComputedStyle fuerza recálculo de estilo y estas llamadas ocurren al pintar capas.
const tokenCache = new Map();
export function token(name) {
  const hit = tokenCache.get(name);
  if (hit) return hit;
  const value = getComputedStyle(document.documentElement).getPropertyValue(`--color-${name}`).trim();
  if (value) tokenCache.set(name, value);
  return value;
}

// En un teléfono el lienzo a DPR 3 (390 px → ~1170 px) no aporta detalle visible y sí frames perdidos al arrastrar.
// 2× cubre lo que se distingue a esa distancia. En escritorio se respeta el DPR del equipo.
export function mapPixelRatio() {
  const dpr = window.devicePixelRatio || 1;
  if (window.matchMedia('(max-width: 767px)').matches) return Math.min(dpr, 2);
  return dpr;
}

export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Movimiento de cámara: corto y sin animación con movimiento reducido (motion.md).
export function cameraOptions() {
  return { animate: !prefersReducedMotion(), duration: 600 };
}
