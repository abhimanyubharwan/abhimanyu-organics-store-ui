import { useParams } from "react-router-dom";
import Photo from "../components/Photo";
import { media } from "../media";
import { useCatalog } from "../catalog";
import ProductImage from "../components/ProductImage";
import { Heart } from "../components/Icons";

export default function ProductDetail() {
  const { id } = useParams();
  const { products, add, toggleWish, wishlist } = useCatalog();
  const p = products.find((x) => x.id === id) ?? products[0];
  const wished = wishlist.includes(p.id);

  return (
    <>
      <section className="section shell product-page">
        <div className="product-stage reveal">
          <ProductImage product={p} sizes="(max-width: 980px) 70vw, 440px" eager />
          <div className="soft-orbit" />
        </div>
        <div className="product-info reveal">
          <span className="eyebrow marked">{p.category}</span>
          <h1>{p.name}</h1>
          <div className="rating">
            ★★★★★ <span>4.8 (96 reviews)</span>
          </div>
          <div className="price-row">
            ₹{p.price} {p.mrp && <del>₹{p.mrp}</del>}
          </div>
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
            <button className="btn gold" onClick={() => add(p)}>
              Add to cart
            </button>
            <button className="btn ghost" onClick={() => toggleWish(p.id)} aria-pressed={wished}>
              <Heart filled={wished} /> {wished ? "Saved" : "Wishlist"}
            </button>
          </div>
        </div>
      </section>

      <section className="section shell origin-story">
        <div className="reveal">
          <span className="eyebrow marked">From bloom to bottle</span>
          <h2>A product with a place, season and story.</h2>
          <p>
            Use this section for floral origin, harvest notes, batch
            information, taste profile, crystallisation guidance and lab-test
            details.
          </p>
        </div>
        <div className="reveal">
          <Photo
            media={media.jarsRosewood}
            alt="Abhimanyu Organics honey jars in three sizes"
            sizes="(max-width: 980px) 92vw, 580px"
          />
        </div>
      </section>
    </>
  );
}
