import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The site is a GitHub Pages project site, so it is served from a sub-path
// rather than the domain root. Everything that builds a URL at runtime goes
// through asset() in src/asset.ts, which reads this same value.
export default defineConfig({
  base: "/abhimanyu-organics-store-ui/",
  plugins: [react()],
});
