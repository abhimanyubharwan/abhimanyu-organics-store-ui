# Abhimanyu Organics — React Storefront

A premium React storefront prototype focused on honey and farm-direct products.

Built with React, TypeScript, Vite and React Router.

## Run locally

```bash
npm install
npm start
```

Vite serves the site at `http://localhost:5173/abhimanyu-organics-store-ui/`.
The path includes the repository name because `base` is set for GitHub Pages,
and the dev server mirrors it so local and deployed behaviour match.

## Build

```bash
npm run build
```

Type-checks with `tsc -b`, builds the site into `dist/`, then pre-renders the
home page (see *Performance* below).

## Adding or replacing a photograph

1. Put the original, full-size file in `media-src/` (JPEG or PNG).
2. Run `npm run images`. It writes AVIF and WebP copies at 360, 640 and 1080 px
   wide, plus a JPEG fallback, into `public/assets/img/`, and prints each
   photo's pixel size.
3. Add an entry to `src/media.ts` with that name and size, then reference it —
   for a product, set `image` in `src/catalog.tsx`.

Render photographs with `<Photo>` (`src/components/Photo.tsx`), never a bare
`<img>`, and give it an honest `sizes`: it is what lets a phone download a
15 KB file instead of the 1080 px one. `media-src/` is never deployed.

## The story film

"Watch our story" on the home page opens the brand film in a lightbox, and the
Our Story page plays it inline (`src/components/StoryFilm.tsx`). It is a silent
6.5-second loop, so it plays muted and needs no sound controls. Nothing is
downloaded until it plays; the inline copy starts only while on screen, and not
at all for visitors with reduced motion or Save-Data on, who get a play button.

`public/assets/video/brand-story.mp4` is made from the original phone clip,
`media-src/brand-story.mov`, with [ffmpeg](https://ffmpeg.org/download.html):
trimmed at 7 s, the last half second cross-faded into the first so the loop
has no visible seam, 30 fps, 720 px wide, H.264 — about 760 KB against the
original's 3 MB. To replace it, re-run this with the new clip:

```bash
ffmpeg -i media-src/brand-story.mov -filter_complex "[0:v]trim=0:7.0,setpts=PTS-STARTPTS,fps=30,scale=720:-2,split[a][b];[b]trim=0:0.5,setpts=PTS-STARTPTS[head];[a]trim=0.5:7.0,setpts=PTS-STARTPTS[body];[body][head]xfade=transition=fade:duration=0.5:offset=6.0,format=yuv420p[out]" -map "[out]" -an -c:v libx264 -profile:v high -level 4.0 -preset slow -crf 32 -movflags +faststart public/assets/video/brand-story.mp4
```

Then refresh the poster, which must be the film's exact first frame so playback
starts without a jump, and regenerate the photo sizes:

```bash
ffmpeg -i public/assets/video/brand-story.mp4 -frames:v 1 -q:v 2 media-src/brand-story-poster.jpg
```

```bash
npm run images
```

For a clip of a different length, change `trim=0:7.0`, `trim=0.5:7.0` and
`offset=6.0` (clip length minus one second), and the duration mentioned in
`StoryFilm.tsx`.

## Main routes
- `/` immersive homepage
- `/shop` (accepts `?cat=Honey` to preselect a category)
- `/product/:id`
- `/our-story`
- `/gifting`
- `/seasonal`
- `/blog`
- `/blog/:slug`
- `/gallery`
- `/bulk`
- `/wishlist`
- `/cart`
- `/account`

## Project layout

| Path | Holds |
| --- | --- |
| `src/pages/` | One component per route |
| `src/components/` | Header, Footer, ProductCard, ProductImage and the SVG icon set |
| `src/catalog.tsx` | Product data plus the cart and wishlist context |
| `src/media.ts` | Every real photograph: file name, pixel size, generated widths |
| `src/components/Photo.tsx` | Responsive AVIF/WebP/JPEG `<picture>` for a media entry |
| `src/components/StoryFilm.tsx` | The brand film: inline player and the "Watch our story" lightbox |
| `src/entry-server.tsx` | Build-time render of the home page (used by `scripts/prerender.mjs`) |
| `src/asset.ts` | Builds asset URLs against the configured base path |
| `src/useReveal.ts` | Scroll-reveal observer, mounted once in `App` |
| `src/styles.css` | All styling, global and unscoped — the "Royal Honey" theme |
| `scripts/` | `optimize-images.mjs` (`npm run images`) and `prerender.mjs` |
| `media-src/` | Original photographs and the original film clip; not deployed |
| `public/assets/img/` | Generated photo sizes — do not edit by hand |
| `public/assets/video/` | The encoded story film (see *The story film*) |
| `public/fonts/` | Self-hosted Cormorant Garamond and Jost (SIL Open Font License) |
| `design-reference/` | Design mockups. Never referenced from `src/` — see Notes |

## Hosting on GitHub Pages

The site is published by [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) on every push to `main`.

Live URL: https://abhimanyubharwan.github.io/abhimanyu-organics-store-ui/

One-time setup: in the repository, open Settings then Pages, and set Source to
"GitHub Actions". This needs the Admin role on the repository.

### How the Pages build differs from a plain build

- `base` in [`vite.config.ts`](vite.config.ts) is `/abhimanyu-organics-store-ui/`,
  because a project site is served from a sub-path rather than the domain root.
  Every runtime URL goes through `asset()`, and the router takes the same value
  as its `basename`.
- The build writes `404.html` as an empty app shell. GitHub Pages has no
  server-side rewrites, so a direct hit on a deep route such as `/shop` would
  otherwise miss; Pages returns `404.html` instead, and React Router resolves
  the route from the URL. Those requests carry a 404 status code even though
  the correct page renders. `404.html` must stay empty rather than a copy of the
  pre-rendered `index.html`, or deep links would flash the home page.
- An empty `.nojekyll` file is written so Pages publishes the output as-is.

### Renaming the repository

Change `base` in [`vite.config.ts`](vite.config.ts) to match the new repository
name, keeping the leading and trailing slashes. Nothing else hardcodes the path.

## Notes
- Cart and wishlist live in React state only, so they reset on a full page
  reload. Add persistence or a backend before treating them as real.
- Bulk query and login are front-end UI demos only; connect them to your
  backend/CRM/auth provider for production.
- `design-reference/` holds full-page design mockups (`mockup-home`,
  `mockup-farm`, `mockup-range`). They are screenshots of the site, not
  photographs, and they used to sit in `public/assets/images/` where the hero
  rendered one as its backdrop — which put a ghosted second copy of the page
  behind the headline. Keep them out of `public/` and out of `src/`.
- A product with no photograph of its own leaves `image` undefined in
  `src/catalog.tsx`, and `ProductImage` draws a branded honeycomb tile instead.
  Do not point it at a photo of a different jar: the label is legible in every
  shot, so the customer would be looking at a product they will not receive.
  Thirteen entries are waiting on photography — see *Adding or replacing a
  photograph* above.

## Performance

Measured with Chrome on a cold cache, median of repeated runs, before and after
the "Royal Honey" rework. "Mobile" is throttled to slow 4G with a 4x slower CPU.

| | Before | After |
| --- | --- | --- |
| Hero photo on screen, mobile | 14.0 s | 2.8 s |
| Hero photo on screen, desktop | 3.2 s | 0.9 s |
| First paint, mobile | 2.8 s | 2.3 s |
| First paint, desktop | 1.0 s | 0.8 s |
| Downloaded for the first screen, desktop | 4.3 MB | 0.3 MB |
| Layout shift (CLS), desktop | 0.134 | 0.011 |

What produces those numbers, and what to keep intact when changing things:

- **Photographs** are served as AVIF/WebP at the smallest adequate width (see
  *Adding or replacing a photograph*).
- **The home page is pre-rendered.** `npm run build` renders it to HTML with
  `src/entry-server.tsx`, so it paints before React has loaded; `main.tsx` then
  hydrates it. Every other page is a separate small chunk, fetched in the
  background once the home page is idle. Anything the home page renders must
  give the same output on the server and in the browser — read `window`,
  `localStorage` and the like only inside effects.
- **Fonts are self-hosted and not preloaded.** Preloading measurably delayed
  first paint on phones. To stop the late swap from shifting the layout, each
  font has a metric-matched local fallback in `src/styles.css`; re-measure those
  numbers if you change typeface.
- **Motion is budgeted.** Only transform and opacity animate, and on the home
  page only the seal ring, bees, honey drops and marquee move. Breathing light,
  drifting pollen, a floating arch and scroll parallax were tried and removed:
  together they halved scrolling frame rate on a throttled CPU.
- Health-related blog copy is intentionally general and food-use oriented; avoid
  disease-treatment claims without appropriate regulatory/legal review.
