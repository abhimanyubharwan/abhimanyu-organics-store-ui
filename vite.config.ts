import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import catalog from "./src/catalog.json";

// The PHP order API (public/api) prices every order from the same catalogue
// the shop displays, so the build publishes a copy next to it.
const catalogForApi: Plugin = {
  name: "catalog-for-api",
  apply: "build",
  generateBundle() {
    this.emitFile({ type: "asset", fileName: "api/catalog.json", source: JSON.stringify(catalog) });
  },
};

// The public path the site is served from. It is "/" for a site at a domain
// root — the Hostinger setup. A host that serves from a sub-folder sets
// BASE_PATH instead, as the GitHub Pages workflow does:
//
//   BASE_PATH=/abhimanyu-organics-store-ui/
//
// Everything that builds a URL at runtime goes through asset() in src/asset.ts,
// and the router takes the same value as its basename.
export default defineConfig(({ mode }) => ({
  base: loadEnv(mode, ".", "").BASE_PATH || "/",
  plugins: [react(), catalogForApi],
  server: {
    // Build output, the upload ZIP and the original photos are not app
    // source. Watching them made the dev server crash on Windows when a ZIP
    // was still being written (EBUSY).
    watch: { ignored: ["**/dist/**", "**/dist-ssr/**", "**/release/**", "**/media-src/**"] },
  },
}));
