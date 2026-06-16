/**
 * Renders a generated vision image. `src` is either a Supabase Storage URL or
 * an inline data: URL. We use a plain <img> (not next/image) because sources
 * are dynamic/data URLs that next/image doesn't handle without extra config.
 */
export function VisionImage({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={`block h-auto w-full object-cover ${className}`}
    />
  );
}
