import { asset } from "./asset";

// Calls to the PHP API in public/api. Every failure comes back as an ApiError
// rather than a throw, so pages can always show the customer something useful.

export interface ApiError {
  ok: false;
  error: string;
  message: string;
  /** Per-field messages for form validation errors, keyed by field name. */
  fields?: Record<string, string>;
}

/** sessionStorage key: the order placed in this tab, so only it clears the cart. */
export const PENDING_ORDER_KEY = "ao.pending-order";

/** A mobile number as the API stores it: 10 digits, without +91 or a leading 0. */
export function normalisePhone(raw: string) {
  const digits = raw.replace(/\D/g, "");
  return digits.length > 10 ? digits.replace(/^(91|0)/, "") : digits;
}

const UNAVAILABLE: ApiError = {
  ok: false,
  error: "unavailable",
  message: "Ordering isn't available right now. Please try again shortly, or call +91 90502 62600.",
};

async function request<T extends { ok: true }>(path: string, init?: RequestInit): Promise<T | ApiError> {
  try {
    const response = await fetch(asset(`api/${path}`), {
      ...init,
      headers: { Accept: "application/json", ...(init?.body ? { "Content-Type": "application/json" } : {}) },
    });
    // A static-only copy of the site (the dev server, GitHub Pages) has no PHP
    // and answers with HTML; treat that the same as the API being down.
    if (!response.headers.get("content-type")?.includes("application/json")) return UNAVAILABLE;
    return (await response.json()) as T | ApiError;
  } catch {
    return UNAVAILABLE;
  }
}

export const getJson = <T extends { ok: true }>(path: string) => request<T>(path);

export const postJson = <T extends { ok: true }>(path: string, body: unknown) =>
  request<T>(path, { method: "POST", body: JSON.stringify(body) });
