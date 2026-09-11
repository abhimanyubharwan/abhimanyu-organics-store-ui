import ProductCard from "../components/ProductCard";
import { useCatalog } from "../catalog";

export default function Wishlist() {
  const { products, wishlist } = useCatalog();
  const list = products.filter((p) => wishlist.includes(p.id));

  return (
    <>
      <section className="page-hero">
        <span>Wishlist</span>
        <h1>Saved for later.</h1>
        <p>Your favourite jars and farm-direct products in one place.</p>
      </section>
      <section className="section shell">
        <div className="product-grid">
          {list.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
        {list.length === 0 && (
          <div className="empty">
            Tap the heart on any product to save it here.
          </div>
        )}
      </section>
    </>
  );
}
