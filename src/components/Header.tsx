import { useEffect, useRef, useState, type ComponentType } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useCatalog } from "../catalog";
import {
  Bee,
  BeeMark,
  Book,
  Cart,
  Chat,
  ChevronDown,
  Drop,
  Flask,
  Gift,
  Heart,
  Hive,
  Jar,
  Leaf,
  Menu,
  Phone,
  Truck,
  User,
  Wordmark,
} from "./Icons";

// Always visible in the bar.
const LINKS: [string, string][] = [
  ["/", "Home"],
  ["/shop", "Shop"],
  ["/our-story", "Our Story"],
  ["/gallery", "Gallery"],
];

// Tucked under "More" on wide screens; listed in full in the phone menu.
const MORE_LINKS: [string, string, ComponentType<{ className?: string }>][] = [
  ["/shop?cat=Honey", "Honey", Jar],
  ["/seasonal", "Seasonal Fruits", Leaf],
  ["/gifting", "Gifting", Gift],
  ["/blog", "Journal", Book],
  ["/bulk", "Bulk Orders", Hive],
];

/** Announcement ticker speed, in CSS pixels per second. */
const TICKER_SPEED = 42;

export default function Header() {
  const { count, wishlist } = useCatalog();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const trackRef = useRef<HTMLDivElement>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const inMore = MORE_LINKS.some(([to]) => !to.includes("?") && pathname.startsWith(to));

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        setScrolled(window.scrollY > 40);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setMoreOpen(false);
  }, [pathname]);

  // Close the More menu on an outside click or Escape.
  useEffect(() => {
    if (!moreOpen) return;
    const onDown = (e: PointerEvent) => {
      if (!moreRef.current?.contains(e.target as Node)) setMoreOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMoreOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [moreOpen]);

  // Announcement ticker. Driven from JS rather than a CSS animation so every
  // frame lands on a whole device pixel — sub-pixel offsets blur the text.
  useEffect(() => {
    const track = trackRef.current;
    const bar = track?.parentElement;
    if (!track || !bar || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let last = 0;
    let offset = 0;
    let paused = false;
    const pause = () => (paused = true);
    const resume = () => (paused = false);

    const tick = (now: number) => {
      if (last && !paused) {
        const loop = track.offsetWidth / 2;
        offset = (offset + (TICKER_SPEED * (now - last)) / 1000) % loop;
        const dpr = window.devicePixelRatio || 1;
        track.style.transform = `translateX(${-Math.round(offset * dpr) / dpr}px)`;
      }
      last = now;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    bar.addEventListener("mouseenter", pause);
    bar.addEventListener("mouseleave", resume);
    bar.addEventListener("focusin", pause);
    bar.addEventListener("focusout", resume);
    return () => {
      cancelAnimationFrame(frame);
      bar.removeEventListener("mouseenter", pause);
      bar.removeEventListener("mouseleave", resume);
      bar.removeEventListener("focusin", pause);
      bar.removeEventListener("focusout", resume);
    };
  }, []);

  return (
    <div className={scrolled ? "site-head solid" : "site-head"}>
      <div className="topbar">
        {/* Two identical runs scroll as one loop; the copy is hidden from
            assistive tech and the tab order. */}
        <div className="topbar-track" ref={trackRef}>
          {[false, true].map((copy) => (
            <div className="topbar-inner" key={String(copy)} aria-hidden={copy || undefined}>
              <span>
                <Truck className="topbar-icon" />
                Free delivery on orders of <b>₹999+</b>
              </span>
              <span>
                <Drop className="topbar-icon" />
                Raw honey, straight from the hive
              </span>
              <span>
                <Leaf className="topbar-icon" />
                100% Natural
              </span>
              <span>
                <Flask className="topbar-icon" />
                Lab Tested
              </span>
              <span>
                <Bee className="topbar-icon" />
                Pan India Delivery
              </span>
              <Link to="/support" tabIndex={copy ? -1 : undefined}>
                <Chat className="topbar-icon" />
                Help &amp; support
              </Link>
              <a href="tel:+919050262600" tabIndex={copy ? -1 : undefined}>
                <Phone className="topbar-icon" />
                Call <b>+91 90502 62600</b>
              </a>
            </div>
          ))}
        </div>
      </div>

      <header className="nav shell">
        <Link to="/" className="brand" aria-label="Abhimanyu Organics, home">
          <BeeMark className="brand-mark" />
          <span className="brand-name">
            <Wordmark className="brand-word" />
            <small>Goodness lives here</small>
          </span>
        </Link>

        <nav className={menuOpen ? "open" : undefined} aria-label="Main">
          {LINKS.map(([to, label]) => (
            <NavLink
              key={label}
              to={to}
              end={to === "/"}
              className={({ isActive }) => (isActive ? "active" : undefined)}
            >
              {label}
            </NavLink>
          ))}
          <div className={moreOpen ? "nav-more open" : "nav-more"} ref={moreRef}>
            <button
              type="button"
              className={inMore ? "nav-more-btn active" : "nav-more-btn"}
              aria-expanded={moreOpen}
              aria-haspopup="true"
              onClick={() => setMoreOpen((v) => !v)}
            >
              More
              <ChevronDown className="nav-more-chevron" />
            </button>
            <div className="nav-more-menu">
              {MORE_LINKS.map(([to, label, Icon]) => (
                <NavLink
                  key={label}
                  to={to}
                  className={({ isActive }) => (isActive && !to.includes("?") ? "active" : undefined)}
                >
                  <Icon className="nav-more-icon" />
                  {label}
                </NavLink>
              ))}
            </div>
          </div>
          {/* The top bar carries this link on wide screens; phones hide the top
              bar's links, so the menu gets it instead. */}
          <NavLink to="/support" className={({ isActive }) => (isActive ? "active menu-only" : "menu-only")}>
            Help &amp; support
          </NavLink>
        </nav>

        <div className="nav-actions">
          <Link className="icon-btn" to="/wishlist" aria-label={`Wishlist, ${wishlist.length} items`}>
            <Heart />
            {wishlist.length > 0 && <i>{wishlist.length}</i>}
          </Link>
          <Link className="icon-btn" to="/account" aria-label="Account">
            <User />
          </Link>
          <Link className="icon-btn" to="/cart" aria-label={`Cart, ${count} items`}>
            <Cart />
            {count > 0 && <i>{count}</i>}
          </Link>
          <button
            className="icon-btn hamb"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-label="Menu"
          >
            <Menu />
          </button>
        </div>
      </header>
    </div>
  );
}
