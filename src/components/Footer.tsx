import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer>
      <div className="shell footer-grid">
        <div>
          <div className="brand footbrand">
            ✦ <b>ABHIMANYU ORGANICS</b>
          </div>
          <p>Pure products. Better people. A healthier tomorrow.</p>
        </div>
        <div>
          <h4>Shop</h4>
          <Link to="/shop">Honey</Link>
          <Link to="/shop">Ghee &amp; Oils</Link>
          <Link to="/seasonal">Seasonal Fruits</Link>
          <Link to="/gifting">Gifting</Link>
        </div>
        <div>
          <h4>Learn</h4>
          <Link to="/blog">Journal</Link>
          <Link to="/gallery">Gallery</Link>
          <Link to="/our-story">Our Story</Link>
        </div>
        <div>
          <h4>Business</h4>
          <Link to="/bulk">Bulk Orders</Link>
          <Link to="/bulk">Supplier Enquiry</Link>
          <p>9050262600</p>
        </div>
      </div>
      <div className="shell copyright">
        © 2026 Abhimanyu Organics · Gurgaon, Haryana
      </div>
    </footer>
  );
}
