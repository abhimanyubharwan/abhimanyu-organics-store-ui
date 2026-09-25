import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { rupees, settings } from "./catalog";

// Frequently asked questions: the full list on the Support page, and a short
// pick of the most common ones at the foot of the home page. One source, so
// the two can never disagree. Answers must stay true to the refund policy and
// the catalogue settings they quote.

export const PHONE = "+91 90502 62600";
export const PHONE_LINK = "tel:+919050262600";

export const FAQ: { title: string; items: { q: string; a: ReactNode }[] }[] = [
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
        q: "Is your honey really raw and pure?",
        a: (
          <>
            Yes. It comes from our own hives and is extracted cold: nothing is heated, nothing is blended, and no sugar is
            ever added. Every batch is lab tested before it's bottled.
          </>
        ),
      },
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

/** The five questions a first-time honey buyer asks most, for the home page. */
const HOME_QUESTIONS = [
  "Is your honey really raw and pure?",
  "My honey has crystallised. Is it still good?",
  "How much does delivery cost?",
  "How can I pay?",
  "Can I return my order?",
];

export const HOME_FAQ = HOME_QUESTIONS.map((q) => {
  const item = FAQ.flatMap((group) => group.items).find((i) => i.q === q);
  if (!item) throw new Error(`Home FAQ question not found: ${q}`);
  return item;
});
