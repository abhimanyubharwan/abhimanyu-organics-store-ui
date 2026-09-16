import { Link } from "react-router-dom";
import Photo from "../components/Photo";
import { media } from "../media";

// There are no customer accounts yet. Checkout works as a guest, and every
// order confirmation links back to its own status page.
export default function Account() {
  return (
    <section className="account-page">
      <div className="account-visual">
        <Photo media={media.jarBeri} alt="" sizes="(max-width: 980px) 100vw, 58vw" priority />
        <div>
          <span className="eyebrow light">Your honey shelf</span>
          <h1>No account needed.</h1>
        </div>
      </div>
      <div className="login-card">
        <span className="eyebrow">Ordering</span>
        <h2>Check out as a guest</h2>
        <p className="account-copy">
          Add what you like to your cart and check out with your delivery details.
          Your confirmation email has a link to follow your order.
        </p>
        <Link className="btn gold" to="/shop?cat=Honey">
          Shop honey
        </Link>
        <p className="account-copy">
          Questions about an order? Call or WhatsApp <a href="tel:+919050262600">+91 90502 62600</a>
          {" "}or email <a href="mailto:organicsabhimanyu@gmail.com">organicsabhimanyu@gmail.com</a>.
        </p>
      </div>
    </section>
  );
}
