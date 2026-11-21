import { demoSources } from '@/shared/lib/demoImage.js';

// Foto DEMO con variantes AVIF/WebP y el JPEG original de respaldo. `picture` con `contents` no crea caja:
// el img sigue siendo el que ocupa el hueco que ya tenía (object-cover, size-full, etc.).
// `Img` permite pasar `motion.img` cuando la foto anima; si no, es un img normal.
export function Photo({ src, alt = '', sizes, loading = 'lazy', img: Img = 'img', ...rest }) {
  const sources = demoSources(src);
  return (
    <picture className="contents">
      {sources && (
        <>
          <source type="image/avif" srcSet={sources.avif} sizes={sizes} />
          <source type="image/webp" srcSet={sources.webp} sizes={sizes} />
        </>
      )}
      <Img
        src={src}
        alt={alt}
        width={sources?.width}
        height={sources?.height}
        sizes={sources ? sizes : undefined}
        loading={loading}
        decoding="async"
        {...rest}
      />
    </picture>
  );
}
