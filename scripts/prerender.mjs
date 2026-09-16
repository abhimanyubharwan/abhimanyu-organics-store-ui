// Runs after both Vite builds (see "build" in package.json). Renders the home
// page into dist/index.html so it paints before any JavaScript runs.
import { readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const DIST = path.resolve("dist");
const SSR = path.resolve("dist-ssr");
const MOUNT = '<div id="root"></div>';

const shell = await readFile(path.join(DIST, "index.html"), "utf8");
if (!shell.includes(MOUNT) || !shell.includes("</head>")) {
  throw new Error(`prerender: ${MOUNT} or </head> not found in dist/index.html`);
}

// GitHub Pages answers every deep link (/shop, /product/jamun, ...) with
// 404.html, so it stays the empty shell.
await writeFile(path.join(DIST, "404.html"), shell);

const { render, base } = await import(pathToFileURL(path.join(SSR, "entry-server.js")).href);
const markup = render(base);

// Hosts that answer deep links with index.html instead would show the home
// page's markup under the wrong URL until JavaScript replaced it. This hides
// it on any path other than home; main.tsx then renders the right page fresh.
const guard =
  `<script>if(location.pathname.replace(/\\/?$/,"/")!==${JSON.stringify(base)})` +
  `document.documentElement.setAttribute("data-deep-link","")</script>` +
  `<style>[data-deep-link] #root{display:none}</style>`;

const page = shell
  .replace("</head>", `  ${guard}\n  </head>`)
  .replace(MOUNT, `<div id="root" data-prerendered="${base}">${markup}</div>`);
await writeFile(path.join(DIST, "index.html"), page);
await rm(SSR, { recursive: true, force: true });

console.log(
  `prerender: home page (${(markup.length / 1024).toFixed(1)} KB of HTML) -> dist/index.html; empty shell -> dist/404.html`,
);
