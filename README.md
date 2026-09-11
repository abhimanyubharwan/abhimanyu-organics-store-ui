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
