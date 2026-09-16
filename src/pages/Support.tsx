import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { normalisePhone, postJson, type ApiError } from "../api";
import { rupees, settings } from "../catalog";
import { Chat, Mail, Phone } from "../components/Icons";

const PHONE = "+91 90502 62600";
const PHONE_LINK = "tel:+919050262600";
const WHATSAPP_LINK = `https://wa.me/919050262600?text=${encodeURIComponent("Hi Abhimanyu Organics, I need help with ")}`;
const EMAIL = "organicsabhimanyu@gmail.com";

// Keep in step with AO_SUPPORT_TOPICS in public/api/support.php.
const TOPICS = ["Order & delivery", "Payment or refund", "Damaged or wrong item", "Product question", "Something else"];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const ORDER_PATTERN = /^AO\d{6}[A-Z0-9]{5}$/i;

const FAQ: { title: string; items: { q: string; a: ReactNode }[] }[] = [
  {
    title: "Orders & delivery",
    items: [
      {
        q: "How much does delivery cost?",
        a: (
          <>
            We deliver across India. Delivery is free on orders of {rupees(settings.freeShippingFrom)} or more, and a flat{" "}
            {rupees(settings.shippingFee)} below that.
          </>
        ),
      },
      {
        q: "How do I track my order?",
        a: (
          <>
            Open the link in your order confirmation email, or use <a href="#track">Track an order</a> on this page with
            your order number and the email or mobile number you ordered with. The order page updates once your order ships.
          </>
        ),
      },
      {
        q: "Can I change my address or cancel my order?",
        a: (
          <>
            Call or WhatsApp us on <a href={PHONE_LINK}>{PHONE}</a> with your order number as soon as you can. If your order
            hasn't been dispatched yet, we can usually still change or cancel it.
          </>
        ),
      },
      {
        q: "I didn’t get a confirmation email.",
        a: (
          <>
            Check your spam and promotions folders first. Still nothing? <a href="#contact">Send us a message</a> with your
            name and mobile number, and we'll find your order.
          </>
        ),
      },
    ],
  },
  {
    title: "Payments",
    items: [
      {
        q: "How can I pay?",
        a: settings.codEnabled ? (
          <>Pay online on Stripe's secure payment page, or choose Cash on Delivery and pay when your order arrives.</>
        ) : (
          <>Pay online on Stripe's secure payment page.</>
        ),
      },
      {
        q: "My payment failed, but money left my account.",
        a: (
          <>
            Your order page shows whether we received the payment. If it says the payment didn't go through but the money
            was taken, send us your order number and we'll check it with Stripe.
          </>
        ),
      },
      {
        q: "Do prices include taxes?",
        a: <>Yes. Every price on the site is the MRP, inclusive of all taxes.</>,
      },
    ],
  },
  {
    title: "Returns & refunds",
    items: [
      {
        q: "My order arrived damaged or leaking.",
        a: (
          <>
            We're sorry. Send us photos of the parcel and the jar with your order number, on WhatsApp or with the{" "}
            <a href="#contact">form below</a>, and we'll sort it out with you.
          </>
        ),
      },
      {
        q: "Can I return my order?",
        a: (
          <>
            Unopened items in their original packaging can be returned. Our <Link to="/refund-policy">refund policy</Link>{" "}
            explains the conditions, where to send them and how refunds are paid. For hygiene reasons, opened food
            products can't be returned.
          </>
        ),
      },
    ],
  },
  {
    title: "Our honey",
    items: [
      {
        q: "My honey has crystallised. Is it still good?",
        a: (
          <>
            Yes. Raw honey naturally crystallises over time, faster in cold weather, and it hasn't gone bad. To make it
            runny again, stand the closed jar in warm (not boiling) water and stir now and then. Please don't microwave it.
          </>
        ),
      },
      {
        q: "How should I store honey?",
        a: (
          <>
            At room temperature with the lid tightly closed, away from direct sunlight, using a clean, dry spoon. There's
            no need to refrigerate it: the cold only makes honey crystallise faster.
          </>
        ),
      },
      {
        q: "Can children have honey?",
        a: <>Children over one year old can. Please don't give honey to babies under 12 months.</>,
      },
      {
        q: "Do you take bulk or gifting orders?",
        a: (
          <>
            Yes. For wholesale, retail supply and corporate gifting, send us your requirement on the{" "}
            <Link to="/bulk">Bulk Orders</Link> page.
          </>
        ),
      },
    ],
  },
];

/** The static-site and not-configured answers talk about ordering; here we're not ordering. */
function apiMessage(result: ApiError, fallback: string) {
  return result.error === "unavailable" || result.error === "setup" ? fallback : result.message;
}

function useFieldErrors() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const props = (prefix: string, name: string) => ({
    id: `${prefix}-${name}`,
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `${prefix}-${name}-error` : undefined,
  });
  const errorFor = (prefix: string, name: string) =>
    errors[name] ? (
      <span className="field-error" id={`${prefix}-${name}-error`}>
        {errors[name]}
      </span>
    ) : null;
  const report = (prefix: string, found: Record<string, string>) => {
    setErrors(found);
    const first = Object.keys(found)[0];
    if (first) document.getElementById(`${prefix}-${first}`)?.focus();
    return !first;
  };
  return { errors, setErrors, props, errorFor, report };
}

function TrackOrder() {
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const { setErrors, props, errorFor, report } = useFieldErrors();

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    const found: Record<string, string> = {};
    if (!ORDER_PATTERN.test(orderId.replace(/[^a-z0-9]/gi, ""))) {
      found.orderId = "Enter your order number. It starts with AO, like AO260916-7KQ2M.";
    }
    const value = contact.trim();
    if (value.includes("@") ? !EMAIL_PATTERN.test(value) : normalisePhone(value).length !== 10) {
      found.contact = "Enter the email or 10-digit mobile number you ordered with.";
    }
    setMessage("");
    if (!report("fo", found)) return;

    setBusy(true);
    const result = await postJson<{ ok: true; orderId: string; token: string }>("order-lookup.php", {
      orderId,
      contact: value,
    });
    if (!result.ok) {
      setBusy(false);
      setErrors(result.fields ?? {});
      setMessage(
        apiMessage(result, `We can't look up orders right now. Please call or WhatsApp ${PHONE} with your order number.`),
      );
      return;
    }
    navigate(`/order/${encodeURIComponent(result.orderId)}?t=${result.token}`);
  };

  return (
    <form className="checkout-card support-form reveal" onSubmit={submit} noValidate>
      <div className="form-grid">
        <label className="span-2">
          Order number
          <input
            {...props("fo", "orderId")}
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="e.g. AO260916-7KQ2M"
            autoCapitalize="characters"
            autoComplete="off"
            spellCheck={false}
            required
          />
          {errorFor("fo", "orderId")}
        </label>
        <label className="span-2">
          Email or mobile number
          <input
            {...props("fo", "contact")}
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="The one you used at checkout"
            autoComplete="off"
            required
          />
          {errorFor("fo", "contact")}
        </label>
      </div>
      {message && (
        <p className="form-message" role="alert">
          {message}
        </p>
      )}
      <button className="btn gold" type="submit" disabled={busy}>
        {busy ? "Looking…" : "Find my order"}
      </button>
    </form>
  );
}

interface MessageFields {
  name: string;
  email: string;
  phone: string;
  orderId: string;
  topic: string;
  message: string;
}

function validateMessage(f: MessageFields): Record<string, string> {
  const errors: Record<string, string> = {};
  if (f.name.trim().length < 2) errors.name = "Enter your name.";
  if (!EMAIL_PATTERN.test(f.email.trim())) errors.email = "Enter a valid email address.";
  if (f.phone.replace(/\D/g, "").length < 10) errors.phone = "Enter a phone number we can call.";
  if (f.message.trim().length < 10) errors.message = "Tell us a little more, so we can help.";
  return errors;
}

function ContactForm() {
  const [params] = useSearchParams();
  // Order pages link here as /support?order=AO…#contact.
  const [fields, setFields] = useState<MessageFields>(() => ({
    name: "",
    email: "",
    phone: "",
    orderId: params.get("order") ?? "",
    topic: TOPICS[0],
    message: "",
  }));
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [sentTo, setSentTo] = useState("");
  const sentRef = useRef<HTMLDivElement>(null);
  const { setErrors, props, errorFor, report } = useFieldErrors();

  useEffect(() => {
    if (sentTo) sentRef.current?.focus();
  }, [sentTo]);

  const field = (name: keyof MessageFields) => ({
    ...props("sp", name),
    name,
    value: fields[name],
    onChange: (event: { target: { value: string } }) => setFields((f) => ({ ...f, [name]: event.target.value })),
  });

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    setMessage("");
    if (!report("sp", validateMessage(fields))) return;

    setBusy(true);
    const result = await postJson<{ ok: true }>("support.php", {
      name: fields.name.trim(),
      email: fields.email.trim(),
      phone: fields.phone.trim(),
      orderId: fields.orderId.trim(),
      topic: fields.topic,
      message: fields.message.trim(),
      // Hidden from people; bots that fill every field give themselves away.
      website: String(new FormData(event.currentTarget).get("website") ?? ""),
    });
    setBusy(false);
    if (!result.ok) {
      setErrors(result.fields ?? {});
      setMessage(apiMessage(result, `We couldn't send your message right now. Please call or WhatsApp ${PHONE}, or email ${EMAIL}.`));
      return;
    }
    setSentTo(fields.email.trim());
  };

  if (sentTo) {
    return (
      <div className="checkout-card support-form support-sent" role="status" tabIndex={-1} ref={sentRef}>
        <h3>Thank you, we have your message.</h3>
        <p>
          We'll reply to <b>{sentTo}</b> promptly. For anything urgent, call or WhatsApp{" "}
          <a href={PHONE_LINK}>{PHONE}</a>.
        </p>
        <Link className="link-more" to="/shop">
          Continue shopping <span>→</span>
        </Link>
      </div>
    );
  }

  return (
    <form className="checkout-card support-form reveal" onSubmit={submit} noValidate>
      <div className="form-grid">
        <label>
          Your name
          <input {...field("name")} autoComplete="name" maxLength={80} required />
          {errorFor("sp", "name")}
        </label>
        <label>
          Email
          <input {...field("email")} type="email" autoComplete="email" maxLength={120} required />
          {errorFor("sp", "email")}
        </label>
        <label>
          Mobile number
          <input {...field("phone")} type="tel" inputMode="tel" autoComplete="tel" maxLength={20} required />
          {errorFor("sp", "phone")}
        </label>
        <label>
          <span>
            Order number <span className="optional">(optional)</span>
          </span>
          <input {...field("orderId")} placeholder="AO…" autoCapitalize="characters" autoComplete="off" spellCheck={false} maxLength={30} />
        </label>
        <label className="span-2">
          What's it about?
          <select {...field("topic")}>
            {TOPICS.map((topic) => (
              <option key={topic}>{topic}</option>
            ))}
          </select>
        </label>
        <label className="span-2">
          Message
          <textarea {...field("message")} rows={5} maxLength={2000} placeholder="Tell us what happened and how we can help." required />
          {errorFor("sp", "message")}
        </label>
      </div>
      <input name="website" className="trap" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      {message && (
        <p className="form-message" role="alert">
          {message}
        </p>
      )}
      <button className="btn gold" type="submit" disabled={busy}>
        {busy ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}

export default function Support() {
  const { hash } = useLocation();

  // Other pages link to /support#track and /support#contact. ScrollToTop has
  // just put the page at the top, so go to the section on the next frame.
  useEffect(() => {
    if (!hash) return;
    const frame = requestAnimationFrame(() => document.getElementById(hash.slice(1))?.scrollIntoView());
    return () => cancelAnimationFrame(frame);
  }, [hash]);

  return (
    <>
      <section className="page-hero compact">
        <span className="eyebrow marked">Help &amp; support</span>
        <h1>How can we help?</h1>
        <p>Track an order, find a quick answer, or talk to us directly.</p>
        <div className="support-jump">
          <a href="#track">Track an order</a>
          <a href="#faq">Quick answers</a>
          <a href="#contact">Send a message</a>
        </div>
      </section>

      <section className="section shell support-channels" aria-label="Contact us">
        <a className="support-channel reveal" href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
          <span className="support-icon">
            <Chat />
          </span>
          <b>Chat on WhatsApp</b>
          <span className="support-detail">{PHONE}</span>
          <small>Send your order number, and photos if anything's wrong.</small>
        </a>
        <a className="support-channel reveal" href={PHONE_LINK}>
          <span className="support-icon">
            <Phone />
          </span>
          <b>Call us</b>
          <span className="support-detail">{PHONE}</span>
          <small>Talk to us about an order, a delivery or our honey.</small>
        </a>
        <a className="support-channel reveal" href={`mailto:${EMAIL}`}>
          <span className="support-icon">
            <Mail />
          </span>
          <b>Email us</b>
          <span className="support-detail">{EMAIL}</span>
          <small>Best for longer questions, invoices and photos.</small>
        </a>
      </section>

      <section id="track" className="section shell support-split">
        <div className="support-copy reveal">
          <span className="eyebrow marked">Your order</span>
          <h2>Track an order</h2>
          <p>
            Every order confirmation email links to that order's page. Can't find the email? Enter your order number with
            the email or mobile number you used at checkout.
          </p>
          <p className="support-note">Your order number starts with AO. It's in your confirmation email and on the page you saw after ordering.</p>
        </div>
        <TrackOrder />
      </section>

      <section id="faq" className="section shell support-faq">
        <div className="section-head centered reveal">
          <div>
            <span className="eyebrow ornate">Quick answers</span>
            <h2>Questions we’re often asked</h2>
          </div>
        </div>
        <div className="faq-groups">
          {FAQ.map((group) => (
            <div key={group.title} className="faq-group reveal">
              <h3>{group.title}</h3>
              {group.items.map((item) => (
                <details key={item.q}>
                  <summary>{item.q}</summary>
                  <p>{item.a}</p>
                </details>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section id="contact" className="section shell support-split">
        <div className="support-copy reveal">
          <span className="eyebrow marked">Still need help?</span>
          <h2>Send us a message</h2>
          <p>
            Tell us what happened and how to reach you. If it's about an order, add the order number so we can look it up
            straight away.
          </p>
          <dl className="support-facts">
            <div>
              <dt>Address</dt>
              <dd>
                Abhimanyu Organics, #457, Suresh Kumar Bharwan, Panihar Chak, Hisar, Haryana 125001
              </dd>
            </div>
            <div>
              <dt>FSSAI Lic. No.</dt>
              <dd>20824006000036</dd>
            </div>
            <div>
              <dt>Policies</dt>
              <dd>
                <Link to="/refund-policy">Refunds</Link> · <Link to="/privacy-policy">Privacy</Link> ·{" "}
                <Link to="/terms-and-conditions">Terms</Link>
              </dd>
            </div>
          </dl>
        </div>
        <ContactForm />
      </section>
    </>
  );
}
