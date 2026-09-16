import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useCatalog } from "../catalog";
import { BeeMark, Cart, Heart, Menu, User } from "./Icons";

const LINKS: [string, string][] = [
  ["/", "Home"],
  ["/shop", "Shop"],
  ["/shop?cat=Honey", "Honey"],
  ["/seasonal", "Seasonal Fruits"],
  ["/gifting", "Gifting"],
  ["/our-story", "Our Story"],
  ["/blog", "Journal"],
  ["/gallery", "Gallery"],
  ["/bulk", "Bulk Orders"],
];

export default function Header() {
  const { cart, wishlist } = useCatalog();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();

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

  useEffect(() => setMenuOpen(false), [pathname]);

  return (
    <div className={scrolled ? "site-head solid" : "site-head"}>
      <div className="topbar">
        <div className="shell topbar-inner">
          <span>Free shipping on orders above ₹999</span>
          <span className="topbar-mid">100% Natural · Lab Tested · Pan India Delivery</span>
          <a href="tel:+919050262600">+91 90502 62600</a>
        </div>
      </div>

      <header className="nav shell">
        <Link to="/" className="brand" aria-label="Abhimanyu Organics, home">
          <BeeMark className="brand-mark" />
          <span className="brand-name">
            <b>Abhimanyu</b>
            <b>Organics</b>
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
        </nav>

        <div className="nav-actions">
          <Link className="icon-btn" to="/wishlist" aria-label={`Wishlist, ${wishlist.length} items`}>
            <Heart />
            {wishlist.length > 0 && <i>{wishlist.length}</i>}
          </Link>
          <Link className="icon-btn" to="/account" aria-label="Account">
            <User />
          </Link>
          <Link className="icon-btn" to="/cart" aria-label={`Cart, ${cart.length} items`}>
            <Cart />
            {cart.length > 0 && <i>{cart.length}</i>}
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
