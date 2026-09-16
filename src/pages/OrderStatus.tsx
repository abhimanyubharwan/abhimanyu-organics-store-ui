import { useEffect, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { PENDING_ORDER_KEY, getJson, type ApiError } from "../api";
import { rupees, useCatalog } from "../catalog";

type Status =
  | "awaiting_payment"
  | "paid"
  | "cod_confirmed"
  | "payment_failed"
  | "expired"
  | "shipped"
  | "delivered"
  | "cancelled";

interface OrderView {
  ok: true;
  order: {
    id: string;
    status: Status;
    paymentMethod: "stripe" | "cod";
    createdAt: string;
    customer: { name: string; email: string; phone: string };
    address: { line1: string; line2: string; city: string; state: string; pincode: string };
    items: { name: string; pack: string; qty: number; unitPrice: number; lineTotal: number }[];
    subtotal: number;
    shipping: number;
    total: number;
  };
}

const HEADLINES: Record<Status, [string, string]> = {
  awaiting_payment: ["Confirming your payment…", "This usually takes a few seconds."],
  paid: ["Thank you! Your payment is received.", "We're preparing your order now."],
  cod_confirmed: ["Thank you! Your order is placed.", "Please keep the cash ready when it arrives."],
  payment_failed: ["Your payment didn't go through.", "No money was taken. Your cart is still here to try again."],
  expired: ["That payment session expired.", "No money was taken. Your cart is still here to try again."],
  shipped: ["Your order is on its way.", "It has left our farm."],
  delivered: ["Your order was delivered.", "Enjoy every spoonful."],
  cancelled: ["This order was cancelled.", "Contact us if that's unexpected."],
};

const SETTLED: Status[] = ["paid", "cod_confirmed", "shipped", "delivered"];

export default function OrderStatus() {
  const { id = "" } = useParams();
  const [params] = useSearchParams();
  const token = params.get("t") ?? "";
  const sessionId = params.get("session_id") ?? "";
  const { clear } = useCatalog();
  const [view, setView] = useState<OrderView | ApiError | null>(null);
  const [gaveUp, setGaveUp] = useState(false);
  const cleared = useRef(false);

  useEffect(() => {
    let alive = true;
    let attempts = 0;
    let timer = 0;
    const query = new URLSearchParams({ id, t: token, ...(sessionId ? { session_id: sessionId } : {}) });

    const load = async () => {
      const result = await getJson<OrderView>(`order-status.php?${query}`);
      if (!alive) return;
      setView(result);
      // Stripe normally confirms within seconds of the redirect; keep asking
      // for about half a minute before telling the customer to watch email.
      if (result.ok && result.order.status === "awaiting_payment") {
        if (++attempts < 12) timer = window.setTimeout(load, 2500);
        else setGaveUp(true);
      }
    };
    void load();
    return () => {
      alive = false;
      window.clearTimeout(timer);
    };
  }, [id, token, sessionId]);

  // Empty the cart once, and only for the order placed in this tab — never
  // because someone later opens an old confirmation link.
  useEffect(() => {
    if (cleared.current || !view?.ok || !SETTLED.includes(view.order.status)) return;
    try {
      if (sessionStorage.getItem(PENDING_ORDER_KEY) === view.order.id) {
        clear();
        sessionStorage.removeItem(PENDING_ORDER_KEY);
      }
    } catch {
      /* storage unavailable */
    }
    cleared.current = true;
  }, [view, clear]);

  if (!view) {
    return (
      <section className="page-hero compact">
        <span className="eyebrow marked">Your order</span>
        <h1>Loading your order…</h1>
      </section>
    );
  }

  if (!view.ok) {
    return (
      <section className="page-hero compact">
        <span className="eyebrow marked">Your order</span>
        <h1>We couldn't open this order.</h1>
        <p>{view.message}</p>
      </section>
    );
  }

  const { order } = view;
  const [headline, sub] = HEADLINES[order.status];
  const retry = order.status === "payment_failed" || order.status === "expired";

  return (
    <>
      <section className={`page-hero compact order-hero status-${order.status}`}>
        <span className="eyebrow marked">Order {order.id}</span>
        <h1>{headline}</h1>
        <p>
          {gaveUp
            ? "Stripe hasn't confirmed yet. If you completed the payment, a confirmation email will follow shortly."
            : sub}
        </p>
        {retry && (
          <p>
            <Link className="btn gold" to="/checkout">
              Try again
            </Link>
          </p>
        )}
      </section>

      <section className="section shell order-grid">
        <div className="checkout-card">
          <h2>Items</h2>
          <ul className="summary-items plain">
            {order.items.map((item, i) => (
              <li key={i}>
                <span>
                  {item.name}
                  <small>
                    {item.pack} · {item.qty} × {rupees(item.unitPrice)}
                  </small>
                </span>
                <b>{rupees(item.lineTotal)}</b>
              </li>
            ))}
          </ul>
          <div className="summary">
            <p>
              <span>Subtotal</span>
              <b>{rupees(order.subtotal)}</b>
            </p>
            <p>
              <span>Delivery</span>
              <b>{order.shipping === 0 ? "FREE" : rupees(order.shipping)}</b>
            </p>
            <hr />
            <p className="summary-total">
              <span>{order.paymentMethod === "cod" ? "To pay on delivery" : "Total"}</span>
              <b>{rupees(order.total)}</b>
            </p>
          </div>
        </div>

        <div className="checkout-card">
          <h2>Delivering to</h2>
          <address>
            {order.customer.name}
            <br />
            {order.address.line1}
            {order.address.line2 && (
              <>
                <br />
                {order.address.line2}
              </>
            )}
            <br />
            {order.address.city}, {order.address.state} {order.address.pincode}
            <br />
            {order.customer.phone}
          </address>
          <p className="order-help">
            A confirmation is on its way to <b>{order.customer.email}</b>. Questions about your order? Call or WhatsApp{" "}
            <a href="tel:+919050262600">+91 90502 62600</a> with your order number.
          </p>
          <Link className="link-more" to="/shop">
            Continue shopping <span>→</span>
          </Link>
        </div>
      </section>
    </>
  );
}
