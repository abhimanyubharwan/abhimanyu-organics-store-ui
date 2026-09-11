# Abhimanyu Organics — Angular Immersive Store

A premium Angular storefront prototype focused on honey and farm-direct products.

## Run locally

```bash
npm install
npm start
```

Angular CLI will normally open `http://localhost:4200/`.

## Build

```bash
npm run build
```

## Hosting on GitHub Pages

The site is published by [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) on every push to `main`.

Live URL: https://abhimanyubharwan.github.io/abhimanyu-organics-store-ui/

One-time setup: in the repository, open Settings then Pages, and set Source to
"GitHub Actions". Re-run the workflow afterwards if the first run finished before
Pages was enabled.

### How the Pages build differs from a local build

- The production build sets `baseHref` to `/abhimanyu-organics-store-ui/`, because
  a project site is served from a sub-path rather than the domain root. Local
  `npm start` is unaffected and still runs at `/`.
- `npm run build:pages` copies `index.html` to `404.html`. GitHub Pages serves no
  server-side rewrites, so a direct hit on a deep route such as `/shop` would
  otherwise miss. The copy lets Pages return the app, and the Angular router then
  resolves the route from the URL. Those requests carry a 404 status code even
  though the correct page renders.
- An empty `.nojekyll` file is written so Pages publishes the output as-is.

### Renaming the repository

Change `baseHref` in [`angular.json`](angular.json) to match the new repository
name, keeping the leading and trailing slashes.

## Main routes
- `/` immersive homepage
- `/shop`
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

## Notes
- `src/index.html` is intentionally minimal; UI lives in Angular components.
- Product, farm and gifting imagery is a mix of your supplied assets and design-development placeholders.
- Replace any image in `src/assets/images/` later without restructuring the app.
- Bulk query and login are front-end UI demos only; connect them to your backend/CRM/auth provider for production.
- Health-related blog copy is intentionally general and food-use oriented; avoid disease-treatment claims without appropriate regulatory/legal review.
