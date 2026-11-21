import { demoImageManifest } from './demo-image-manifest.js';

// Tamaños de presentación (CSS) para que el navegador elija la variante y no baje la foto de 960 px en un
// recuadro de 80 px. El 2x lo aplica el navegador solo a partir de `sizes`.
export const photoSizes = {
  featured: '(min-width: 48rem) 736px, calc(100vw - 2rem)',
  tile: '(min-width: 48rem) 360px, calc((100vw - 2.75rem) / 2)',
  row: '(max-height: 700px) 80px, 96px',
  spot: '80px',
  detail: '(min-width: 40rem) 512px, 100vw',
  sheet: '(min-width: 48rem) 736px, calc(100vw - 2rem)',
  pin: '44px',
  pinPop: '36px',
  mapThumb: '56px',
  collageLarge: '66vw',
  collageSmall: '34vw',
};

// `manifest` permite probar la función sin el archivo generado. Devuelve null si la foto no es un JPEG DEMO conocido:
// entonces se usa el `src` tal cual (foto de perfil, o una ruta que todavía no tiene variantes).
export function sourcesFor(src, manifest = demoImageManifest) {
  const meta = manifest?.[src];
  if (!meta?.widths?.length) return null;
  const base = src.replace(/\.jpe?g$/i, '');
  const set = (ext) => meta.widths.map((w) => `${base}-${w}.${ext} ${w}w`).join(', ');
  return { width: meta.width, height: meta.height, avif: set('avif'), webp: set('webp') };
}

export function demoSources(src) {
  return sourcesFor(src);
}
