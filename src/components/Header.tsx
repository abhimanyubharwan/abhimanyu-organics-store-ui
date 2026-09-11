import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useCatalog } from "../catalog";

export default function Header() {
  const { cart, wishlist } = useCatalog();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <div className="topbar">
        <span>✦ Free shipping on orders above ₹999</span>
        <span>100% Natural · Lab Tested · Pan India Delivery</span>
        <span>☎ +91 90502 62600</span>
      </div>
      <header className="nav shell">
        <Link to="/" className="brand">
          <span className="bee">✦</span>
          <b>
            ABHIMANYU
            <br />
            ORGANICS
          </b>
          <small>Goodness Lives Here</small>
        </Link>
        <nav className={menuOpen ? "open" : undefined}>
          <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : undefined)}>
            Home
          </NavLink>
          <Link to="/shop">Shop</Link>
          <Link to="/shop?cat=Honey">Honey</Link>
          <Link to="/seasonal">Seasonal Fruits</Link>
          <Link to="/gifting">Gifting</Link>
          <Link to="/our-story">Our Story</Link>
          <Link to="/blog">Blog</Link>
          <Link to="/gallery">Gallery</Link>
          <Link to="/bulk">Bulk Orders</Link>
        </nav>
        <div className="nav-actions">
          <Link to="/wishlist">
            ♡ <i>{wishlist.length}</i>
          </Link>
          <Link to="/account">♙</Link>
          <Link to="/cart">
            🛒 <i>{cart.length}</i>
          </Link>
          <button className="hamb" onClick={() => setMenuOpen((v) => !v)}>
            ☰
          </button>
        </div>
      </header>
    </>
  );
}
