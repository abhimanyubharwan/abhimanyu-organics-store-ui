import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { PENDING_ORDER_KEY, postJson } from "../api";
import { rupees, settings, useCatalog } from "../catalog";
import ProductImage from "../components/ProductImage";

export const INDIAN_STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh",
  "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep",
  "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry",
  "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
  "West Bengal",
];

type Payment = "stripe" | "cod";

interface Details {
  name: string;
  phone: string;
  email: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  notes: string;
}

const EMPTY: Details = { name: "", phone: "", email: "", line1: "", line2: "", city: "", state: "", pincode: "", notes: "" };

// Kept for this browser tab only, so returning from a cancelled payment does
// not mean typing the address again. Closing the tab forgets it.
const DETAILS_KEY = "ao.checkout.details";

function loadDetails(): Details {
  try {
    return { ...EMPTY, ...JSON.parse(sessionStorage.getItem(DETAILS_KEY) ?? "{}") };
  } catch {
    return EMPTY;
  }
}

/** Mirrors the server's rules in public/api/_lib.php, which have the final say. */
export function normalisePhone(raw: string) {
  const digits = raw.replace(/\D/g, "");
  return digits.length > 10 ? digits.replace(/^(91|0)/, "") : digits;
}

function validate(d: Details): Record<string, string> {
  const errors: Record<string, string> = {};
  if (d.name.trim().length < 2) errors.name = "Enter your full name.";
  if (!/^[6-9]\d{9}$/.test(normalisePhone(d.phone))) errors.phone = "Enter a 10-digit Indian mobile number.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email.trim())) errors.email = "Enter a valid email address.";
  if (d.line1.trim().length < 5) errors.line1 = "Enter your house number and street.";
  if (d.city.trim().length < 2) errors.city = "Enter your city or town.";
  if (!INDIAN_STATES.includes(d.state)) errors.state = "Choose your state.";
  if (!/^[1-9]\d{5}$/.test(d.pincode.trim())) errors.pincode = "Enter a 6-digit PIN code.";
  return errors;
}

interface OrderCreated {
  ok: true;
  orderId: string;
  token: string;
  next: "redirect" | "confirmation";
  url?: string;
}

export default function Checkout() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { items, subtotal, shipping, total, clear } = useCatalog();
  // Checkout is never pre-rendered, so reading storage while rendering is safe,
  // and it avoids saving the empty form over the stored details first.
  const [details, setDetails] = useState<Details>(loadDetails);
  const [payment, setPayment] = useState<Payment>("stripe");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState(params.get("cancelled") ? "Payment was cancelled. Your cart is still here, so you can try again." : "");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    try {
      sessionStorage.setItem(DETAILS_KEY, JSON.stringify(details));
    } catch {
      /* not essential */
    }
  }, [details]);

  const field = (name: keyof Details) => ({
    id: `co-${name}`,
    name,
    value: details[name],
    onChange: (event: { target: { value: string } }) => setDetails((d) => ({ ...d, [name]: event.target.value })),
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `co-${name}-error` : undefined,
  });

  const errorFor = (name: keyof Details) =>
    errors[name] ? (
      <span className="field-error" id={`co-${name}-error`}>
        {errors[name]}
      </span>
    ) : null;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    const found = validate(details);
    setErrors(found);
    if (Object.keys(found).length) {
      setMessage("Please check the highlighted details.");
      document.getElementById(`co-${Object.keys(found)[0]}`)?.focus();
      return;
    }

    setSubmitting(true);
    setMessage("");
    const result = await postJson<OrderCreated>("order.php", {
      items: items.map((item) => ({ sku: item.sku, qty: item.qty })),
      customer: { name: details.name.trim(), phone: normalisePhone(details.phone), email: details.email.trim() },
      address: {
        line1: details.line1.trim(),
        line2: details.line2.trim(),
        city: details.city.trim(),
        state: details.state,
        pincode: details.pincode.trim(),
      },
      notes: details.notes.trim(),
      payment,
    });

    if (!result.ok) {
      setSubmitting(false);
      setErrors(result.fields ?? {});
      setMessage(result.message);
      return;
    }

    try {
      sessionStorage.setItem(PENDING_ORDER_KEY, result.orderId);
    } catch {
      /* the confirmation page then simply leaves the cart alone */
    }

    if (result.next === "redirect" && result.url) {
      window.location.assign(result.url);
      return;
    }
    clear();
    navigate(`/order/${result.orderId}?t=${result.token}`, { replace: true });
  };

  if (items.length === 0) {
    return (
      <section className="page-hero">
        <span className="eyebrow marked">Checkout</span>
        <h1>Your cart is empty.</h1>
        <p>
          <Link className="btn gold" to="/shop?cat=Honey">
            Shop honey
          </Link>
        </p>
      </section>
    );
  }

  return (
    <>
      <section className="page-hero compact">
        <span className="eyebrow marked">Checkout</span>
        <h1>Almost yours.</h1>
      </section>

      <form className="section shell checkout-grid" onSubmit={submit} noValidate>
        <div className="checkout-main">
          {message && (
            <p className="form-message" role="alert">
              {message}
            </p>
          )}

          <fieldset className="checkout-card">
            <legend>Contact</legend>
            <div className="form-grid">
              <label className="span-2">
                Full name
                <input {...field("name")} autoComplete="name" required />
                {errorFor("name")}
              </label>
              <label>
                Mobile number
                <input {...field("phone")} type="tel" inputMode="tel" autoComplete="tel-national" placeholder="10-digit mobile" required />
                {errorFor("phone")}
              </label>
              <label>
                Email
                <input {...field("email")} type="email" autoComplete="email" placeholder="For your order confirmation" required />
                {errorFor("email")}
              </label>
            </div>
          </fieldset>

          <fieldset className="checkout-card">
            <legend>Delivery address</legend>
            <div className="form-grid">
              <label className="span-2">
                House no., building, street
                <input {...field("line1")} autoComplete="address-line1" required />
                {errorFor("line1")}
              </label>
              <label className="span-2">
                <span>
                  Area, landmark <span className="optional">(optional)</span>
                </span>
                <input {...field("line2")} autoComplete="address-line2" />
              </label>
              <label>
                City / town
                <input {...field("city")} autoComplete="address-level2" required />
                {errorFor("city")}
              </label>
              <label>
                PIN code
                <input {...field("pincode")} inputMode="numeric" autoComplete="postal-code" maxLength={6} required />
                {errorFor("pincode")}
              </label>
              <label className="span-2">
                State
                <select {...field("state")} autoComplete="address-level1" required>
                  <option value="">Choose your state</option>
                  {INDIAN_STATES.map((state) => (
                    <option key={state}>{state}</option>
                  ))}
                </select>
                {errorFor("state")}
              </label>
              <label className="span-2">
                <span>
                  Delivery note <span className="optional">(optional)</span>
                </span>
                <textarea {...field("notes")} rows={2} maxLength={300} />
              </label>
            </div>
          </fieldset>

          <fieldset className="checkout-card">
            <legend>Payment</legend>
            <div className="pay-options">
              <label className={payment === "stripe" ? "pay-option on" : "pay-option"}>
                <input type="radio" name="payment" value="stripe" checked={payment === "stripe"} onChange={() => setPayment("stripe")} />
                <span>
                  <b>Pay online</b>
                  <small>Secure payment on Stripe. You'll come back here once it's done.</small>
                </span>
              </label>
              {settings.codEnabled && (
                <label className={payment === "cod" ? "pay-option on" : "pay-option"}>
                  <input type="radio" name="payment" value="cod" checked={payment === "cod"} onChange={() => setPayment("cod")} />
                  <span>
                    <b>Cash on Delivery</b>
                    <small>Pay in cash when your order arrives.</small>
                  </span>
                </label>
              )}
            </div>
          </fieldset>
        </div>

        <aside className="summary checkout-summary">
          <h2>Your order</h2>
          <ul className="summary-items">
            {items.map((item) => (
              <li key={item.sku}>
                <span className="summary-thumb">
                  <ProductImage product={item.product} sizes="56px" />
                  <i>{item.qty}</i>
                </span>
                <span>
                  {item.product.name}
                  <small>{item.pack.label}</small>
                </span>
                <b>{rupees(item.lineTotal)}</b>
              </li>
            ))}
          </ul>
          <p>
            <span>Subtotal</span>
            <b>{rupees(subtotal)}</b>
          </p>
          <p>
            <span>Delivery</span>
            <b>{shipping === 0 ? "FREE" : rupees(shipping)}</b>
          </p>
          <hr />
          <p className="summary-total">
            <span>Total</span>
            <b>{rupees(total)}</b>
          </p>
          <button className="btn gold" type="submit" disabled={submitting}>
            {submitting ? "Placing order…" : payment === "stripe" ? `Pay ${rupees(total)} securely` : `Place order · ${rupees(total)}`}
          </button>
          <small className="summary-note">
            By placing this order you agree to our <Link to="/terms-and-conditions">terms</Link> and{" "}
            <Link to="/refund-policy">refund policy</Link>. MRP inclusive of all taxes.
          </small>
          <Link className="text-btn" to="/cart">
            ← Edit cart
          </Link>
        </aside>
      </form>
    </>
  );
}
