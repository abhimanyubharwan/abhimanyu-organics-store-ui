import { useEffect } from "react";

// Fades `.reveal` elements in as they scroll into view by adding `is-visible`.
//
// It watches the DOM rather than scanning once. A single scan at mount missed
// everything rendered later — every page reached by client-side navigation
// and every card swapped in by a filter pill — and those stayed at opacity 0,
// which left the Shop grid blank.
export function useReveal(): void {
  useEffect(() => {
    const root = document.documentElement;
    const show = (el: Element) => el.classList.add("is-visible");
    const pending = () => document.querySelectorAll(".reveal:not(.is-visible)");

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !("IntersectionObserver" in window)) {
      pending().forEach(show);
      const mo = new MutationObserver(() => pending().forEach(show));
      mo.observe(document.body, { childList: true, subtree: true });
      return () => mo.disconnect();
    }

    // The home page arrives pre-rendered and fully visible. Anything already on
    // screen when this runs stays visible rather than blinking out and back.
    pending().forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) show(el);
    });

    // Only hide content once we know something will reveal it again.
    root.classList.add("js-reveal");

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          show(entry.target);
          io.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );

    const watched = new WeakSet<Element>();
    const scan = () =>
      pending().forEach((el) => {
        if (watched.has(el)) return;
        watched.add(el);
        io.observe(el);
      });

    // A keyed reorder moves an existing node, which arrives here as a removal
    // followed by an addition. Forgetting it on removal lets scan() pick it
    // straight back up; otherwise a moved, not-yet-revealed card stays hidden.
    const forget = (el: Element) => {
      io.unobserve(el);
      watched.delete(el);
    };

    const mo = new MutationObserver((records) => {
      for (const record of records) {
        record.removedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;
          if (node.matches(".reveal")) forget(node);
          node.querySelectorAll(".reveal").forEach(forget);
        });
      }
      scan();
    });

    scan();
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
      root.classList.remove("js-reveal");
    };
  }, []);
}
