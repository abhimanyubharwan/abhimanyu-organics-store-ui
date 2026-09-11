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

Type-checks with `tsc -b`, then emits the static site to `dist/`.

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
| `src/components/` | Header, Footer and ProductCard |
| `src/catalog.tsx` | Product data plus the cart and wishlist context |
| `src/asset.ts` | Builds asset URLs against the configured base path |
| `src/styles.css` | All styling, global and unscoped |
| `public/assets/` | Images and video, served verbatim |

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
- `npm run build:pages` copies `index.html` to `404.html`. GitHub Pages has no
  server-side rewrites, so a direct hit on a deep route such as `/shop` would
  otherwise miss. The copy lets Pages return the app, and React Router then
  resolves the route from the URL. Those requests carry a 404 status code even
  though the correct page renders.
- An empty `.nojekyll` file is written so Pages publishes the output as-is.

### Renaming the repository

Change `base` in [`vite.config.ts`](vite.config.ts) to match the new repository
name, keeping the leading and trailing slashes. Nothing else hardcodes the path.

## Notes
- Cart and wishlist live in React state only, so they reset on a full page
  reload. Add persistence or a backend before treating them as real.
- Bulk query and login are front-end UI demos only; connect them to your
  backend/CRM/auth provider for production.
- Product, farm and gifting imagery is a mix of your supplied assets and
  design-development placeholders. Replace any image in `public/assets/images/`
  without restructuring the app.
- Health-related blog copy is intentionally general and food-use oriented; avoid
  disease-treatment claims without appropriate regulatory/legal review.
