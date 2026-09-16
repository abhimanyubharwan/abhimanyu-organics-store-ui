// Build-time only. scripts/prerender.mjs renders the home page to HTML with
// this, so the first screen paints straight from index.html instead of waiting
// for the JavaScript bundle to download and run. main.tsx then hydrates it.
import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import App from "./App";
import { CatalogProvider } from "./catalog";

export const base = import.meta.env.BASE_URL;

export function render(url: string): string {
  return renderToString(
    <StrictMode>
      <StaticRouter basename={base} location={url}>
        <CatalogProvider>
          <App />
        </CatalogProvider>
      </StaticRouter>
    </StrictMode>,
  );
}
