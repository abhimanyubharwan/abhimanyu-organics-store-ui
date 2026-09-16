import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { CatalogProvider } from "./catalog";
import "./styles.css";

const container = document.getElementById("root")!;

const app = (
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <CatalogProvider>
        <App />
      </CatalogProvider>
    </BrowserRouter>
  </StrictMode>
);

// Production index.html arrives with the home page already rendered into #root
// (scripts/prerender.mjs), tagged with the path it was rendered for. Attach to
// that markup only on that path. Anywhere else — a host that serves index.html
// for a deep link — the markup belongs to another page, so start clean.
const prerendered = container.dataset.prerendered;
const here = location.pathname.replace(/\/?$/, "/");

if (prerendered && prerendered === here) {
  hydrateRoot(container, app);
} else {
  if (prerendered) {
    container.replaceChildren();
    document.documentElement.removeAttribute("data-deep-link");
  }
  createRoot(container).render(app);
}
