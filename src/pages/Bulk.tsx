import { useState, type FormEvent } from "react";

export default function Bulk() {
  const [sent, setSent] = useState(false);

  // Front-end demo only, exactly as in the Angular original: nothing is posted
  // anywhere. Wire this to a backend or CRM before using it for real enquiries.
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSent(true);
  };

  return (
    <>
      <section className="page-hero bulk-hero">
        <span>Bulk Orders &amp; Supplier Partnerships</span>
        <h1>Let’s build a healthier supply chain together.</h1>
        <p>
          Retailers, distributors, gifting partners, private-label buyers, farms,
          packaging suppliers and service partners can start here.
        </p>
      </section>
      <section className="section shell bulk-grid">
        <div className="bulk-copy">
          <span className="eyebrow">Partner with purpose</span>
          <h2>
            Wholesale supply, supplier onboarding and business enquiries.
          </h2>
          <div className="partner-points">
            <span>✓ Wholesale honey supply</span>
            <span>✓ Corporate gifting</span>
            <span>✓ Retail &amp; distribution</span>
            <span>✓ Private label discussions</span>
            <span>✓ Seasonal produce</span>
            <span>✓ Supplier/vendor onboarding</span>
          </div>
        </div>
        <form className="query-form" onSubmit={handleSubmit}>
          <h2>Send a business query</h2>
          <input required placeholder="Full name" />
          <input required placeholder="Business / organisation" />
          <input required type="email" placeholder="Email" />
          <input required placeholder="Phone" />
          <select defaultValue="Bulk Purchase">
            <option>Bulk Purchase</option>
            <option>Retail Partnership</option>
            <option>Corporate Gifting</option>
            <option>Supplier / Vendor</option>
            <option>Private Label</option>
          </select>
          <textarea
            rows={5}
            placeholder="Tell us what you need or what you supply..."
          />
          <button className="btn">Submit Query</button>
          {sent && (
            <p className="success">
              Thanks — your demo enquiry has been captured in the UI.
            </p>
          )}
        </form>
      </section>
    </>
  );
}
