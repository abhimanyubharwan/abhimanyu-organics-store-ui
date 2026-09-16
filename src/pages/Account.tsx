import Photo from "../components/Photo";
import { media } from "../media";

export default function Account() {
  return (
    <section className="account-page">
      <div className="account-visual">
        <Photo media={media.jarBeri} alt="" sizes="(max-width: 980px) 100vw, 58vw" priority />
        <div>
          <span className="eyebrow light">Your honey shelf, remembered.</span>
          <h1>Welcome back to the farm.</h1>
        </div>
      </div>
      <div className="login-card">
        <span className="eyebrow">Customer Account</span>
        <h2>Sign in or continue</h2>
        <input placeholder="Mobile number" />
        <button className="btn">Continue securely</button>
        <div className="or">or</div>
        <button className="social-login">Continue with Google</button>
        <button className="social-login">Continue with WhatsApp</button>
        <p>Orders · Addresses · Wishlist · Reorder · Coupons</p>
      </div>
    </section>
  );
}
