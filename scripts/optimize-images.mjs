// Turns the original photographs in media-src/ into small responsive files in
// public/assets/img/. Run it whenever a photo is added or replaced:
//
//   npm run images
//
// For every source it writes AVIF and WebP at each width in WIDTHS (never
// upscaling past the original), plus one JPEG at FALLBACK_WIDTH for browsers
// that take neither. It then prints the intrinsic size of each photo; copy any
// new entry into src/media.ts so <Photo> can reserve the right box.
import { mkdir, readdir, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const SRC = "media-src";
const OUT = "public/assets/img";
const WIDTHS = [360, 640, 1080];
const FALLBACK_WIDTH = 640;

await mkdir(OUT, { recursive: true });

const files = (await readdir(SRC)).filter((f) => /\.(jpe?g|png)$/i.test(f));
let before = 0;
let after = 0;

for (const file of files) {
  const name = path.parse(file).name;
  const input = path.join(SRC, file);
  const { width, height } = await sharp(input).metadata();
  before += (await stat(input)).size;

  // Every width we can serve without upscaling; always at least one.
  const widths = WIDTHS.filter((w) => w < width);
  if (!widths.length || widths.at(-1) < Math.min(width, WIDTHS.at(-1))) {
    widths.push(Math.min(width, WIDTHS.at(-1)));
  }

  const jobs = [];
  for (const w of widths) {
    const base = sharp(input).rotate().resize({ width: w });
    jobs.push(base.clone().avif({ quality: 50, effort: 5, chromaSubsampling: "4:2:0" }).toFile(`${OUT}/${name}-${w}.avif`));
    jobs.push(base.clone().webp({ quality: 72, effort: 5, smartSubsample: true }).toFile(`${OUT}/${name}-${w}.webp`));
  }
  const fb = Math.min(FALLBACK_WIDTH, width);
  jobs.push(
    sharp(input).rotate().resize({ width: fb })
      .jpeg({ quality: 76, progressive: true, mozjpeg: true })
      .toFile(`${OUT}/${name}.jpg`),
  );

  const results = await Promise.all(jobs);
  const bytes = results.reduce((sum, r) => sum + r.size, 0);
  after += bytes;
  console.log(
    `${name.padEnd(18)} ${String(width).padStart(4)}x${String(height).padEnd(5)}` +
      ` widths ${widths.join("/").padEnd(12)} ${(bytes / 1024).toFixed(0).padStart(5)} KB for all files`,
  );
}

console.log(
  `\n${files.length} photos: ${(before / 1048576).toFixed(1)} MB of originals -> ` +
    `${(after / 1048576).toFixed(2)} MB across every size and format.`,
);
