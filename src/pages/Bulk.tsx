import { useState, type FormEvent } from "react";
import { postJson } from "../api";

const TYPES = ["Bulk Purchase", "Retail Partnership", "Corporate Gifting", "Supplier / Vendor", "Private Label"];

export default function Bulk() {
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (state === "sending") return;
    const form = new FormData(event.currentTarget);
    const value = (name: string) => String(form.get(name) ?? "").trim();

    setState("sending");
    setError("");
    const result = await postJson<{ ok: true }>("enquiry.php", {
      name: value("name"),
      business: value("business"),
      email: value("email"),
      phone: value("phone"),
      type: value("type"),
      message: value("message"),
      // Hidden from people; bots that fill every field give themselves away.
      website: value("website"),
    });

    if (result.ok) {
      setState("sent");
    } else {
      setState("idle");
      setError(result.message);
    }
  };

  return (
    <>
      <section className="page-hero bulk-hero">
        <span className="eyebrow marked">Bulk Orders &amp; Supplier Partnerships</span>
        <h1>Let’s build a healthier supply chain together.</h1>
        <p>
          Retailers, distributors, gifting partners, private-label buyers, farms,
          packaging suppliers and service partners can start here.
        </p>
      </section>
      <section className="section shell bulk-grid">
        <div className="bulk-copy">
          <span className="eyebrow marked">Partner with purpose</span>
          <h2>
            Wholesale supply, supplier onboarding and business enquiries.
          </h2>
          <div className="partner-points">
            <span>Wholesale honey supply</span>
            <span>Corporate gifting</span>
            <span>Retail &amp; distribution</span>
            <span>Private label discussions</span>
            <span>Seasonal produce</span>
            <span>Supplier/vendor onboarding</span>
          </div>
        </div>

        {state === "sent" ? (
          <div className="query-form sent" role="status">
            <h2>Thank you — we have your enquiry.</h2>
            <p>We'll get back to you within two working days. For anything urgent, call +91 90502 62600.</p>
          </div>
        ) : (
          <form className="query-form" onSubmit={handleSubmit}>
            <h2>Send a business query</h2>
            <input name="name" required maxLength={80} placeholder="Full name" autoComplete="name" />
            <input name="business" required maxLength={120} placeholder="Business / organisation" autoComplete="organization" />
            <input name="email" required type="email" maxLength={120} placeholder="Email" autoComplete="email" />
            <input name="phone" required type="tel" maxLength={20} placeholder="Phone" autoComplete="tel" />
            <select name="type" defaultValue={TYPES[0]}>
              {TYPES.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
            <textarea name="message" rows={5} maxLength={2000} placeholder="Tell us what you need or what you supply..." />
            <input name="website" className="trap" tabIndex={-1} autoComplete="off" aria-hidden="true" />
            <button className="btn" disabled={state === "sending"}>
              {state === "sending" ? "Sending…" : "Submit Query"}
            </button>
            {error && (
              <p className="field-error" role="alert">
                {error}
              </p>
            )}
          </form>
        )}
      </section>
    </>
  );
}
