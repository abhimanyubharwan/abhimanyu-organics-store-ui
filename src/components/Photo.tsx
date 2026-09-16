import { asset } from "../asset";
import type { Media } from "../media";

const srcSet = (m: Media, ext: string) =>
  m.widths.map((w) => `${asset(`assets/img/${m.name}-${w}.${ext}`)} ${w}w`).join(", ");

/**
 * A responsive photograph. The browser picks AVIF, then WebP, then JPEG, at the
 * smallest width that still covers `sizes` on the current screen — so a 230px
 * product card downloads a ~15 KB file instead of the 700 KB original.
 *
 * `sizes` must describe the rendered width honestly; overstating it quietly
 * sends the large file to every phone.
 */
export default function Photo({
  media,
  alt,
  sizes,
  className,
  priority = false,
}: {
  media: Media;
  alt: string;
  sizes: string;
  className?: string;
  /** Above-the-fold hero image: load immediately at high priority. */
  priority?: boolean;
}) {
  return (
    <picture>
      <source type="image/avif" srcSet={srcSet(media, "avif")} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet(media, "webp")} sizes={sizes} />
      <img
        className={className}
        src={asset(`assets/img/${media.name}.jpg`)}
        alt={alt}
        width={media.width}
        height={media.height}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : undefined}
      />
    </picture>
  );
}
