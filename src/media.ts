// Every entry here is a real photograph of the product or its packaging.
//
// Originals live in media-src/ and are never shipped. `npm run images` turns
// each one into AVIF + WebP at the widths listed below (plus a JPEG fallback)
// under public/assets/img/, and prints the numbers to copy into a new entry.
// `width` and `height` are the original's pixel size; <Photo> puts them on the
// <img> so the browser reserves the right box before the file arrives.
//
// The three full-page design mockups that once sat in public/ are not photos:
// rendering one as a backdrop put a ghosted copy of the page behind the hero.
// They live in design-reference/ and must never be referenced from src/.
export interface Media {
  /** File stem in public/assets/img, e.g. "beri" -> beri-640.avif */
  name: string;
  width: number;
  height: number;
  /** Widths that exist on disk, ascending. */
  widths: readonly number[];
}

const STANDARD_WIDTHS = [360, 640, 1080] as const;

const photo = (
  name: string,
  width: number,
  height: number,
  widths: readonly number[] = STANDARD_WIDTHS,
): Media => ({ name, width, height, widths });

export const media = {
  jarBeri: photo("beri", 1536, 2048),
  jarJamun: photo("jamun", 1536, 2048),
  jarDryFruit: photo("dry-fruit", 1536, 2048),
  jarsRosewood: photo("rosewood", 2048, 1536),
  jarInHand: photo("rosewood-alt", 720, 1280, [360, 640, 720]),
  giftBox: photo("gifting", 1512, 2016),
  giftTrio: photo("mini-jars", 1536, 2048),
  miniFlight: photo("mini-collection", 1536, 2048),
  acaciaBox: photo("kashmiri", 1697, 2048),
  /** First frame of public/assets/video/brand-story.mp4 — see <StoryFilm>. */
  storyPoster: photo("brand-story-poster", 720, 1280, [360, 640, 720]),
} as const;
