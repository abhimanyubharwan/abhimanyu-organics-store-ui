import ProductCard from "../components/ProductCard";
import { useCatalog } from "../catalog";

export default function Seasonal() {
  const { products } = useCatalog();
  const list = products.filter((p) => p.category === "Seasonal Fruits");

  return (
    <>
      <section className="page-hero seasonal-hero">
        <span className="eyebrow marked">Seasonal Goodness</span>
        <h1>Fresh when nature says ready.</h1>
        <p>
          Ber and guava are offered in season, based on harvest and dispatch
          quality.
        </p>
      </section>
      <section className="section shell">
        <div className="season-process">
          <b>
            01 <small>Harvest</small>
          </b>
          <b>
            02 <small>Sort &amp; pack</small>
          </b>
          <b>
            03 <small>Availability</small>
          </b>
          <b>
            04 <small>Dispatch</small>
          </b>
        </div>
        <div className="product-grid">
          {list.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </>
  );
}
