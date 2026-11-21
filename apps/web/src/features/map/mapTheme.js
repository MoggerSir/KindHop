// MapLibre pinta en canvas y no entiende clases: los colores salen de los tokens de @theme (src/index.css).
export function token(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(`--color-${name}`).trim();
}

export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Movimiento de cámara: corto y sin animación con movimiento reducido (motion.md).
export function cameraOptions() {
  return { animate: !prefersReducedMotion(), duration: 600 };
}
