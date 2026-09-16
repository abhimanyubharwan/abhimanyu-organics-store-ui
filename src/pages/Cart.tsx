import { Link } from "react-router-dom";
import { rupees, settings, useCatalog } from "../catalog";
import ProductImage from "../components/ProductImage";
import QtyStepper from "../components/QtyStepper";

export default function Cart() {
  const { items, count, subtotal, shipping, total, setQty, remove } = useCatalog();
  const toFreeDelivery = settings.freeShippingFrom - subtotal;

  return (
    <>
      <section className="page-hero">
        <span className="eyebrow marked">Your Cart</span>
        <h1>Good choices, ready to go.</h1>
      </section>

      <section className="section shell cart-grid">
        <div>
          {items.map((item) => (
            <article key={item.sku} className="cart-row">
              <Link to={`/product/${item.product.id}`} className="cart-thumb" tabIndex={-1} aria-hidden="true">
                <ProductImage product={item.product} sizes="96px" />
              </Link>
              <div className="cart-info">
                <h3>
                  <Link to={`/product/${item.product.id}`}>{item.product.name}</Link>
                </h3>
                <small>
                  {item.pack.label} · {rupees(item.pack.price)} each
                </small>
                <div className="cart-controls">
                  <QtyStepper
                    value={item.qty}
                    onChange={(qty) => setQty(item.sku, qty)}
                    label={`${item.product.name}, ${item.pack.label}`}
                  />
                  <button type="button" className="text-btn" onClick={() => remove(item.sku)}>
                    Remove
                  </button>
                </div>
              </div>
              <b className="cart-line-total">{rupees(item.lineTotal)}</b>
            </article>
          ))}

          {items.length === 0 && (
            <div className="empty">
              Your cart is empty.
              <Link className="btn gold" to="/shop?cat=Honey">
                Shop honey
              </Link>
            </div>
          )}
        </div>

        {items.length > 0 && (
          <aside className="summary">
            <h2>Order summary</h2>
            <p>
              <span>
                Subtotal ({count} {count === 1 ? "item" : "items"})
              </span>
              <b>{rupees(subtotal)}</b>
            </p>
            <p>
              <span>Delivery</span>
              <b>{shipping === 0 ? "FREE" : rupees(shipping)}</b>
            </p>
            {shipping > 0 && (
              <p className="free-nudge">Add {rupees(toFreeDelivery)} more for free delivery.</p>
            )}
            <hr />
            <p className="summary-total">
              <span>Total</span>
              <b>{rupees(total)}</b>
            </p>
            <Link className="btn gold" to="/checkout">
              Proceed to checkout
            </Link>
            <small className="summary-note">
              {settings.codEnabled ? "Pay online or Cash on Delivery. " : ""}MRP inclusive of all taxes.
            </small>
          </aside>
        )}
      </section>
    </>
  );
}
