// Static files live in public/ and are served verbatim under the Vite base
// path. Relative URLs cannot be used directly: on a route like /product/jamun
// the browser would resolve them against /product/, not the site root.
export const asset = (path: string): string =>
  import.meta.env.BASE_URL + path.replace(/^\//, "");
