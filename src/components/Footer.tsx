import { Link } from "react-router-dom";
import { BeeMark } from "./Icons";

export default function Footer() {
  return (
    <footer>
      <div className="foot-crown" aria-hidden="true">
        <i />
        <BeeMark className="foot-crown-mark" />
        <i />
      </div>
      <div className="shell footer-grid">
        <div>
          <div className="foot-brand">
            <BeeMark className="brand-mark" />
            <span className="brand-name">
              <b>Abhimanyu</b>
              <b>Organics</b>
              <small>Goodness lives here</small>
            </span>
          </div>
          <p>
            Raw, unprocessed honey from our own bee farms — plus the pantry
            essentials and seasonal harvests that grow alongside them.
          </p>
        </div>
        <div>
          <h4>Shop</h4>
          <Link to="/shop?cat=Honey">Honey</Link>
          <Link to="/shop?cat=Ghee %26 Oils">Ghee &amp; Oils</Link>
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
          <h4>Help</h4>
          <Link to="/support">Help &amp; support</Link>
          <Link to="/support#track">Track your order</Link>
          <Link to="/refund-policy">Refund policy</Link>
          <Link to="/privacy-policy">Privacy policy</Link>
          <Link to="/terms-and-conditions">Terms &amp; conditions</Link>
          <a href="mailto:organicsabhimanyu@gmail.com">organicsabhimanyu@gmail.com</a>
        </div>
        <div>
          <h4>Business</h4>
          <Link to="/bulk">Bulk Orders</Link>
          <Link to="/bulk">Supplier Enquiry</Link>
          <a href="tel:+919050262600">+91 90502 62600</a>
        </div>
      </div>
      <div className="shell copyright">
        <span>© 2026 Abhimanyu Organics · Gurgaon &amp; Hisar, Haryana</span>
        <span>Pure products. Better people. A healthier tomorrow.</span>
      </div>
    </footer>
  );
}
