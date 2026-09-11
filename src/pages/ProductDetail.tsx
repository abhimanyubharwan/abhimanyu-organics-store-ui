import { useParams } from "react-router-dom";
import { asset } from "../asset";
import { useCatalog } from "../catalog";

export default function ProductDetail() {
  const { id } = useParams();
  const { products, add, toggleWish } = useCatalog();
  const p = products.find((x) => x.id === id) ?? products[0];

  return (
    <>
      <section className="section shell product-page">
        <div className="product-stage">
          <img src={asset(p.image)} alt={p.name} />
          <div className="soft-orbit" />
        </div>
        <div className="product-info">
          <span className="eyebrow">{p.category}</span>
          <h1>{p.name}</h1>
          <div className="rating">
            ★★★★★ <span>4.8 (96 reviews)</span>
          </div>
          <h2>
            ₹{p.price} {p.mrp && <del>₹{p.mrp}</del>}
          </h2>
          <p>
            {p.subtitle}. Carefully sourced and packed with a focus on purity,
            origin and taste.
          </p>
          <div className="benefit-icons">
            <span>Raw &amp; natural</span>
            <span>No added sugar</span>
            <span>Farm direct</span>
            <span>Pan India delivery</span>
          </div>
          <div className="actions">
            <button className="btn" onClick={() => add(p)}>
              Add to Cart
            </button>
            <button className="btn ghost" onClick={() => toggleWish(p.id)}>
              ♡ Wishlist
            </button>
          </div>
        </div>
      </section>
      <section className="section shell origin-story">
        <div>
          <span className="eyebrow">From bloom to bottle</span>
          <h2>A product with a place, season and story.</h2>
          <p>
            Use this section for floral origin, harvest notes, batch information,
            taste profile, crystallisation guidance and lab-test details.
          </p>
        </div>
        <img src={asset("assets/images/farm-reference.jpg")} alt="" />
      </section>
    </>
  );
}
