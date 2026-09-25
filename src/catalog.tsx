import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import data from "./catalog.json";
import { media, type Media } from "./media";

// src/catalog.json is the single source of truth for what is for sale and at
// what price. The build also copies it to /api/catalog.json, where the PHP
// order API reads it, so the server always prices an order itself rather than
// trusting totals sent by the browser.

export interface Pack {
  id: string;
  label: string;
  /** Rupees, MRP inclusive of all taxes. */
  price: number;
  /** A regular running pack: bottled continuously and kept in ready stock. */
  popular?: boolean;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  subtitle: string;
  collection?: string;
  badge?: string;
  /** Shown on the product page, e.g. how the mini pack is filled. */
  note?: string;
  /**
   * A photograph *of this product*. Left undefined when no such photo exists
   * yet — ProductImage then draws a branded placeholder instead. Deliberately
   * never a photo of a different jar: the label is legible in every shot, so
   * the customer would be looking at a product they will not receive.
   */
  image?: Media;
  /** More photographs of the same product, shown as thumbnails on its page. */
  gallery?: Media[];
  /** Empty for products that are not on sale yet ("coming soon"). */
  packs: Pack[];
}

interface RawProduct extends Omit<Product, "image" | "gallery"> {
  photo?: string;
  gallery?: string[];
}

export const settings = {
  freeShippingFrom: data.shipping.freeFrom,
  shippingFee: data.shipping.fee,
  codEnabled: data.cod.enabled,
};

export const products: Product[] = (data.products as RawProduct[]).map(({ photo, gallery, ...rest }) => ({
  ...rest,
  image: photo ? media[photo as keyof typeof media] : undefined,
  gallery: gallery?.map((key) => media[key as keyof typeof media]),
}));

/** Old product addresses that still arrive from links and search results. */
export const PRODUCT_ALIASES: Record<string, string> = {
  litchi: "lychee",
  acacia: "kashmiri-acacia",
};

export const isOnSale = (product: Product) => product.packs.length > 0;

export const defaultPack = (product: Product): Pack | undefined =>
  product.packs.find((pack) => pack.popular) ?? product.packs[0];

export const lowestPrice = (product: Product) =>
  Math.min(...product.packs.map((pack) => pack.price));

export const skuOf = (productId: string, packId: string) => `${productId}:${packId}`;

export function resolveSku(sku: string): { product: Product; pack: Pack } | null {
  const [productId, packId] = sku.split(":");
  const product = products.find((p) => p.id === productId);
  const pack = product?.packs.find((k) => k.id === packId);
  return product && pack ? { product, pack } : null;
}

export const shippingFor = (subtotal: number) =>
  subtotal === 0 || subtotal >= settings.freeShippingFrom ? 0 : settings.shippingFee;

export const rupees = (amount: number) => `₹${amount.toLocaleString("en-IN")}`;

export const MAX_QTY = 20;

/* ------------------------------------------------------------------ cart --- */

export interface CartItem {
  sku: string;
  product: Product;
  pack: Pack;
  qty: number;
  lineTotal: number;
}

interface CatalogValue {
  products: Product[];
  items: CartItem[];
  /** Total number of jars in the cart. */
  count: number;
  subtotal: number;
  shipping: number;
  total: number;
  wishlist: string[];
  /** The most recent addition, for the "added to cart" notice. */
  lastAdded: { item: CartItem; at: number } | null;
  add: (product: Product, packId?: string, qty?: number) => void;
  setQty: (sku: string, qty: number) => void;
  remove: (sku: string) => void;
  clear: () => void;
  toggleWish: (id: string) => void;
}

type Line = { sku: string; qty: number };

const CART_KEY = "ao.cart.v1";
const WISH_KEY = "ao.wishlist.v1";

// Storage can be missing or throw (private windows, blocked site data), and the
// saved cart may name products that have since changed. Either way the site
// must still work, so every read is defensive.
function readLines(): Line[] {
  try {
    const saved = JSON.parse(localStorage.getItem(CART_KEY) ?? "[]");
    if (!Array.isArray(saved)) return [];
    return saved
      .filter((l): l is Line => typeof l?.sku === "string" && Number.isInteger(l?.qty))
      .filter((l) => resolveSku(l.sku))
      .map((l) => ({ sku: l.sku, qty: Math.min(Math.max(l.qty, 1), MAX_QTY) }));
  } catch {
    return [];
  }
}

function readWishlist(): string[] {
  try {
    const saved = JSON.parse(localStorage.getItem(WISH_KEY) ?? "[]");
    return Array.isArray(saved) ? saved.filter((id) => products.some((p) => p.id === id)) : [];
  } catch {
    return [];
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable: the cart simply lasts for this visit */
  }
}

const CatalogContext = createContext<CatalogValue | null>(null);

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<Line[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [lastAdded, setLastAdded] = useState<CatalogValue["lastAdded"]>(null);
  // False until the saved cart has been restored *and rendered*. Saving before
  // then would overwrite what is in storage with the initial empty cart.
  const [ready, setReady] = useState(false);
  // Mirrors `lines` synchronously, so two quick clicks each build on the
  // other's result and no state updater has to carry side effects.
  const linesRef = useRef<Line[]>([]);

  const update = useCallback((change: (current: Line[]) => Line[]) => {
    const next = change(linesRef.current);
    linesRef.current = next;
    setLines(next);
    return next;
  }, []);

  // Restore after the first render, never during it: the home page is
  // pre-rendered with an empty cart, and hydration must see the same.
  useEffect(() => {
    update(() => readLines());
    setWishlist(readWishlist());
    setReady(true);

    // Keep several open tabs in step.
    const onStorage = (event: StorageEvent) => {
      if (event.key === CART_KEY) update(() => readLines());
      if (event.key === WISH_KEY) setWishlist(readWishlist());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [update]);

  useEffect(() => {
    if (ready) write(CART_KEY, lines);
  }, [ready, lines]);

  useEffect(() => {
    if (ready) write(WISH_KEY, wishlist);
  }, [ready, wishlist]);

  const add = useCallback((product: Product, packId?: string, qty = 1) => {
    const pack = product.packs.find((k) => k.id === packId) ?? defaultPack(product);
    if (!pack) return;
    const sku = skuOf(product.id, pack.id);
    const next = update((current) =>
      current.some((l) => l.sku === sku)
        ? current.map((l) => (l.sku === sku ? { ...l, qty: Math.min(l.qty + qty, MAX_QTY) } : l))
        : [...current, { sku, qty: Math.min(qty, MAX_QTY) }],
    );
    const line = next.find((l) => l.sku === sku)!;
    setLastAdded({
      item: { sku, product, pack, qty: line.qty, lineTotal: line.qty * pack.price },
      at: Date.now(),
    });
  }, [update]);

  const setQty = useCallback((sku: string, qty: number) => {
    update((current) =>
      qty < 1
        ? current.filter((l) => l.sku !== sku)
        : current.map((l) => (l.sku === sku ? { ...l, qty: Math.min(qty, MAX_QTY) } : l)),
    );
  }, [update]);

  const remove = useCallback((sku: string) => {
    update((current) => current.filter((l) => l.sku !== sku));
  }, [update]);

  const clear = useCallback(() => {
    update(() => []);
  }, [update]);

  const toggleWish = useCallback((id: string) => {
    setWishlist((current) =>
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id],
    );
  }, []);

  const value = useMemo<CatalogValue>(() => {
    const items = lines.flatMap((line): CartItem[] => {
      const found = resolveSku(line.sku);
      return found ? [{ ...found, sku: line.sku, qty: line.qty, lineTotal: line.qty * found.pack.price }] : [];
    });
    const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
    const shipping = shippingFor(subtotal);
    return {
      products,
      items,
      count: items.reduce((sum, item) => sum + item.qty, 0),
      subtotal,
      shipping,
      total: subtotal + shipping,
      wishlist,
      lastAdded,
      add,
      setQty,
      remove,
      clear,
      toggleWish,
    };
  }, [lines, wishlist, lastAdded, add, setQty, remove, clear, toggleWish]);

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog(): CatalogValue {
  const value = useContext(CatalogContext);
  if (!value) throw new Error("useCatalog must be used inside CatalogProvider");
  return value;
}
