import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCatalog } from "../catalog";
import { Close } from "./Icons";
import ProductImage from "./ProductImage";

/** A short "added to cart" confirmation with a way straight to the cart. */
export default function AddedToast() {
  const { lastAdded, count } = useCatalog();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!lastAdded) return;
    setVisible(true);
    const timer = window.setTimeout(() => setVisible(false), 4500);
    return () => window.clearTimeout(timer);
  }, [lastAdded]);

  if (!lastAdded) return null;
  const { item } = lastAdded;

  return (
    <div className={visible ? "toast show" : "toast"} role="status" aria-live="polite" inert={!visible}>
      <span className="toast-thumb">
        <ProductImage product={item.product} sizes="56px" />
      </span>
      <span className="toast-text">
        <b>Added to cart</b>
        <small>
          {item.product.name} · {item.pack.label}
        </small>
      </span>
      <Link className="btn small" to="/cart" onClick={() => setVisible(false)}>
        View cart ({count})
      </Link>
      <button type="button" className="toast-close" onClick={() => setVisible(false)} aria-label="Dismiss">
        <Close />
      </button>
    </div>
  );
}
