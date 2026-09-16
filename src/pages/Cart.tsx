import { useCatalog } from "../catalog";
import ProductImage from "../components/ProductImage";

export default function Cart() {
  const { cart } = useCatalog();
  const total = cart.reduce((sum, p) => sum + p.price, 0);

  return (
    <>
      <section className="page-hero">
        <span className="eyebrow marked">Your Cart</span>
        <h1>Good choices, ready to go.</h1>
      </section>
      <section className="section shell cart-grid">
        <div>
          {cart.map((p, i) => (
            <article key={`${p.id}-${i}`} className="cart-row">
              <ProductImage product={p} sizes="96px" />
              <div>
                <h3>{p.name}</h3>
                <small>{p.subtitle}</small>
              </div>
              <b>₹{p.price}</b>
            </article>
          ))}
          {cart.length === 0 && (
            <div className="empty">Your cart is empty. Add something pure.</div>
          )}
        </div>
        <aside className="summary">
          <h2>Order Summary</h2>
          <p>
            <span>Subtotal</span>
            <b>₹{total}</b>
          </p>
          <p>
            <span>Shipping</span>
            <b>{total >= 999 ? "FREE" : "Calculated at checkout"}</b>
          </p>
          <hr />
          <p>
            <span>Total</span>
            <b>₹{total}</b>
          </p>
          <button className="btn">Proceed to Checkout</button>
        </aside>
      </section>
    </>
  );
}
