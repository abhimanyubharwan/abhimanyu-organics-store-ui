import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { useCatalog } from "../catalog";

const CATEGORIES = [
  "All",
  "Honey",
  "Ghee & Oils",
  "Bee Products",
  "Speciality",
  "Seasonal Fruits",
];

export default function Shop() {
  const { products } = useCatalog();
  const [searchParams] = useSearchParams();
  const initial = searchParams.get("cat");
  const [cat, setCat] = useState(
    initial && CATEGORIES.includes(initial) ? initial : "All",
  );

  const list = products.filter((p) => cat === "All" || p.category === cat);

  return (
    <>
      <section className="page-hero">
        <span>Shop</span>
        <h1>Pure products from farms &amp; hives.</h1>
        <p>
          Honey stays at the heart of our range, complemented by natural pantry
          essentials and seasonal harvests.
        </p>
      </section>
      <section className="section shell">
        <div className="filter-pills">
          {CATEGORIES.map((x) => (
            <button
              key={x}
              onClick={() => setCat(x)}
              className={cat === x ? "active" : undefined}
            >
              {x}
            </button>
          ))}
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
