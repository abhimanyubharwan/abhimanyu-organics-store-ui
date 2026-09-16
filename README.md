# Abhimanyu Organics — React Storefront

A premium React storefront prototype focused on honey and farm-direct products.

Built with React, TypeScript, Vite and React Router.

## Run locally

```bash
npm install
npm start
```

Vite serves the site at `http://localhost:5173/`.

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
   for a product, set its `photo` in `src/catalog.json` to that entry's name.

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

## Writing a Journal article

The Journal's posts are listed in [`src/journal.ts`](src/journal.ts), newest
first. Posts with a written article (so far, *Gulkand honey*) show their own
text; the rest show a shared introduction until theirs is written.

1. Write the article in `src/articles/<slug>.tsx`, like
   [`gulkand-honey.tsx`](src/articles/gulkand-honey.tsx): export `lead` (the
   opening line, also used as the page's search description) and the body as
   the default export — `h2` sections, lists, and optionally a `.recipe` box and
   an `.article-cta` panel.
2. Add or update its entry in `src/journal.ts` with `date` and `readMinutes`
   (words ÷ 200, rounded up), and register it in `ARTICLES` in
   [`src/pages/BlogDetail.tsx`](src/pages/BlogDetail.tsx).
3. To feature it on the home page, put it first in `JOURNAL` in
   `src/pages/Home.tsx`; the row holds four.

A cover is a photograph from `src/media.ts`. When there is no photograph of the
subject, draw one instead (see `src/components/RoseHoneyArt.tsx`) rather than
using a photo of a different jar, whose label readers would take at its word.

## Main routes
- `/` immersive homepage
- `/shop` (accepts `?cat=Honey` to preselect a category)
- `/product/:id`
- `/our-story`
- `/gifting`
- `/seasonal`
- `/blog`
- `/blog/:slug` — e.g. `/blog/gulkand-honey`
- `/gallery`
- `/bulk`
- `/wishlist`
- `/cart`
- `/checkout` (accepts `?cancelled=1` after an abandoned Stripe payment)
- `/order/:id?t=<token>` — an order's confirmation and status page
- `/account` — explains guest checkout; there are no customer accounts
- `/support` — help and contact: WhatsApp / call / email, *Track an order*,
  common questions and a message form. Accepts `?order=<id>` to pre-fill the
  form (order pages link here that way); `#track`, `#faq` and `#contact` jump
  to a section. `/contact-us`, the old Website Builder address, redirects here.
- `/refund-policy`, `/privacy-policy`, `/terms-and-conditions`

## Checkout and orders

Customers check out as guests and pay online with **Stripe** or choose
**Cash on Delivery**. Delivery is free from ₹999 and ₹99 below that.

- **What is for sale and at what price** lives only in
  [`src/catalog.json`](src/catalog.json): each product's packs and MRPs, the
  delivery rule and whether COD is offered. A product with an empty `packs`
  list shows as "coming soon". Change prices there, rebuild, and upload.
- **The browser never decides a price.** The build copies the catalogue to
  `/api/catalog.json`, and the PHP API in [`public/api/`](public/api) prices
  every order from it. Totals sent by the browser are ignored.
- **Payment is confirmed by Stripe, not by the page.** An order becomes paid
  only when the server asks Stripe about its Checkout Session, or when Stripe's
  signed webhook says so — whichever comes first. Each order is emailed once.
- **Orders are kept on the server** in `private/store.sqlite` (SQLite, created
  automatically), beside `public_html` where nobody can download it. Include
  that folder in backups.
- **Back office:** `/api/admin.php` lists orders, support messages and
  enquiries, marks orders shipped / delivered / cancelled, and has a *Setup
  check* page. Refunds for online payments are issued in the Stripe dashboard.
- **Support:** *Track an order* on `/support` opens an order's page when its
  order number and the email or mobile number it was placed with both match
  (10 tries per visitor per 15 minutes), so a lost confirmation email isn't a
  dead end. Messages from the form are saved, emailed to `owner_email` with
  Reply-To set to the customer, and shown on admin's *Support* tab and under
  the order they mention.

### Setting up checkout on Hostinger

1. Upload the build as usual (see *Publishing on Hostinger*).
2. In File Manager, go **up one level** from `public_html` and create a folder
   named `private`. Copy [`server/config.example.php`](server/config.example.php)
   into it as `config.php`.
3. Fill in `config.php`:
   - `site_url` — the site's address, e.g. `https://new.abhimanyuorganics.com`.
   - `stripe_secret_key` — Stripe → API keys → *Standard keys* → Secret key.
     Use the **test** key (`sk_test_…`) first.
   - `stripe_webhook_secret` — Stripe → Webhooks → *Create an event
     destination* → *Your account*, with the events
     `checkout.session.completed`, `checkout.session.async_payment_succeeded`,
     `checkout.session.async_payment_failed` and `checkout.session.expired`,
     destination type *Webhook endpoint*, URL
     `https://<your-site>/api/stripe-webhook.php`; then reveal and copy its
     signing secret (`whsec_…`).
   - Email: create a mailbox such as `orders@abhimanyuorganics.com` in
     hPanel → Emails and put its details under `smtp`.
   - `admin_password` — at least 12 characters.
4. Open `https://<your-site>/api/admin.php`, sign in, and check that every line
   of *Setup check* says OK.
5. Place a test order with Stripe's Indian test card `4000 0035 6000 0008` (or
   `4242 4242 4242 4242`; any future date, any CVC), and one Cash on Delivery
   order. Both should appear in admin and send two emails each.
6. To take real payments, repeat step 3 with the **live** secret key and a live
   webhook endpoint. Test and live mode have separate keys and webhook secrets.

Which online payment methods customers see (cards, and UPI where Stripe offers
it to your account) is controlled in Stripe → Settings → Payment methods.

### Testing checkout locally

PHP 8.1+ with `pdo_sqlite`, `curl`, `openssl` and `mbstring` enabled. Point
`AO_PRIVATE_DIR` at a folder with a test `config.php` (Stripe **test** key,
`'mail_transport' => 'log'` so emails go to `outbox.log` instead of being sent),
then serve the build with the router that stands in for `.htaccess`:

```bash
npm run build
```

```bash
AO_PRIVATE_DIR=/path/to/test-private php -S 127.0.0.1:8080 -t dist scripts/php-router.php
```

The Vite dev server (`npm start`) has no PHP, so there checkout shows
"Ordering isn't available right now" — that is expected.

## Project layout

| Path | Holds |
| --- | --- |
| `src/pages/` | One component per route |
| `src/components/` | Header, Footer, ProductCard, ProductImage and the SVG icon set |
| `src/catalog.json` | What is for sale: products, packs, MRPs, delivery rule, COD on/off |
| `src/catalog.tsx` | Catalogue helpers plus the cart and wishlist (saved in the browser) |
| `src/api.ts` | Calls to the PHP order API |
| `src/policies.ts` | Refund, privacy and terms wording |
| `src/journal.ts`, `src/articles/` | Journal posts and the written articles (see *Writing a Journal article*) |
| `public/api/` | PHP order API: orders, order status and lookup, Stripe webhook, support messages, enquiries, admin |
| `server/config.example.php` | Template for the private `config.php` on the server |
| `src/media.ts` | Every real photograph: file name, pixel size, generated widths |
| `src/components/Photo.tsx` | Responsive AVIF/WebP/JPEG `<picture>` for a media entry |
| `src/components/StoryFilm.tsx` | The brand film: inline player and the "Watch our story" lightbox |
| `src/entry-server.tsx` | Build-time render of the home page (used by `scripts/prerender.mjs`) |
| `src/asset.ts` | Builds asset URLs against the configured base path |
| `src/useReveal.ts` | Scroll-reveal observer, mounted once in `App` |
| `src/styles.css` | All styling, global and unscoped — the "Royal Honey" theme |
| `scripts/` | `optimize-images.mjs` (`npm run images`), `prerender.mjs`, `php-router.php` (local testing) |
| `media-src/` | Original photographs and the original film clip; not deployed |
| `public/assets/img/` | Generated photo sizes — do not edit by hand |
| `public/assets/video/` | The encoded story film (see *The story film*) |
| `public/fonts/` | Self-hosted Cormorant Garamond and Jost (SIL Open Font License) |
| `public/.htaccess` | Routing, caching and file types for Apache/LiteSpeed hosting (Hostinger) |
| `design-reference/` | Design mockups. Never referenced from `src/` — see Notes |

## Publishing on Hostinger

The build is plain static files served from a domain root, so it needs a
Hostinger **web hosting** plan (Premium, Business or Cloud). A Website Builder
plan cannot host it. There are two ways to publish:

**A. Deploy Web App (Business Web Hosting or Cloud) — rebuilds on every push.**
In hPanel open *Websites → Add Website → Deploy Web App → Import Git
Repository*, authorise GitHub, pick this repository and set:

| Setting | Value |
| --- | --- |
| Framework | React (Vite) |
| Build command | `npm run build` |
| Output directory | `dist` |
| Node.js version | 22.x or 24.x |

Hostinger writes its own routing rules for this kind of app.

**B. Upload the files (Premium, Business or Cloud) — manual on every change.**

1. Build and package: `npm run build`, then zip the *contents* of `dist/`
   (not the folder itself). `release/abhimanyu-organics-website.zip` is one
   made this way; `release/` is not committed. On Windows, create the ZIP with
   `tar.exe`, not Explorer's "Compress" or PowerShell's `Compress-Archive`,
   which can store folder paths with backslashes that break on a Linux server:

   ```bash
   tar -a -c -f release/abhimanyu-organics-website.zip -C dist .htaccess 404.html index.html assets fonts api
   ```

   The list must include `api` — without it the upload has no checkout.

2. In hPanel: *Websites → Add Website → Custom PHP/HTML website*, and choose
   the domain or subdomain.
3. Open *File Manager* for that site, go to `public_html`, upload the ZIP,
   right-click it → *Extract* into `public_html`, then delete the ZIP.
   `index.html` and `.htaccess` must sit directly in `public_html`.

[`public/.htaccess`](public/.htaccess) ships in every build. It sends paths
such as `/shop` to the app, gives missing files a real 404, sets long-lived
caching for hashed build files, and serves AVIF, WebP and WOFF2 with the right
types. Turn on *Force HTTPS* for the domain in hPanel.

## Hosting on GitHub Pages (preview copy)

[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) also publishes
the site to https://abhimanyubharwan.github.io/abhimanyu-organics-store-ui/ on
every push to `main`. Once Hostinger is live, consider switching this off so
search engines do not find two copies of the site.

One-time setup: in the repository, open Settings then Pages, and set Source to
"GitHub Actions". This needs the Admin role on the repository.

### How the Pages build differs from a plain build

- The workflow sets `BASE_PATH=/abhimanyu-organics-store-ui/`, because a
  project site is served from a sub-path rather than the domain root.
  [`vite.config.ts`](vite.config.ts) reads it (default `/`), every runtime URL
  goes through `asset()`, and the router takes the same value as its
  `basename`.
- The build writes `404.html` as an empty app shell. GitHub Pages has no
  server-side rewrites, so a direct hit on a deep route such as `/shop` would
  otherwise miss; Pages returns `404.html` instead, and React Router resolves
  the route from the URL. Those requests carry a 404 status code even though
  the correct page renders. `404.html` must stay empty rather than a copy of the
  pre-rendered `index.html`, or deep links would flash the home page.
- An empty `.nojekyll` file is written so Pages publishes the output as-is.

### Renaming the repository

Change `BASE_PATH` in the workflow to match the new repository name, keeping
the leading and trailing slashes. Nothing else hardcodes the path.

## Notes
- The cart and wishlist are saved in the visitor's browser (`localStorage`),
  so they survive reloads on that device but are not shared across devices.
- The Bulk Orders form saves each enquiry on the server and emails it to
  `owner_email`. There are no customer logins; `/account` explains guest checkout.
- The answers on `/support` are written from what the site already states
  (delivery charges come from `src/catalog.json`). Its topic list is repeated
  in `public/api/support.php`; change both together.
- The policy pages repeat, word for word, what the Website Builder store
  published. Their wording has not been reviewed against this store's actual
  terms (for example, returns within 5 vs 15 days; "Private Limited").
- `design-reference/` holds full-page design mockups (`mockup-home`,
  `mockup-farm`, `mockup-range`). They are screenshots of the site, not
  photographs, and they used to sit in `public/assets/images/` where the hero
  rendered one as its backdrop — which put a ghosted second copy of the page
  behind the headline. Keep them out of `public/` and out of `src/`.
- A product with no photograph of its own has no `photo` in
  `src/catalog.json`, and `ProductImage` draws a branded honeycomb tile instead.
  Do not point it at a photo of a different jar: the label is legible in every
  shot, so the customer would be looking at a product they will not receive.
  Several products on sale (Tulsi, Neem, Lemon and Dalchini infused, Kashmiri
  Acacia USA, the mini pack) are waiting on photography — see *Adding or
  replacing a photograph* above.

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
