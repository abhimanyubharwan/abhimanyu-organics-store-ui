import { Link } from "react-router-dom";
import { asset } from "../asset";
import { useCatalog, type Product } from "../catalog";

export default function ProductCard({ product }: { product: Product }) {
  const { add, toggleWish } = useCatalog();

  return (
    <article className="product-card reveal">
      <div className="product-media">
        {product.badge && <span className="badge">{product.badge}</span>}
        <button className="wish" onClick={() => toggleWish(product.id)}>
          ♡
        </button>
        <Link to={`/product/${product.id}`}>
          <img src={asset(product.image)} alt={product.name} />
        </Link>
      </div>
      <div className="product-body">
        <small>{product.subtitle}</small>
        <h3>{product.name}</h3>
        <div className="rating">
          ★ 4.8 <span>(96)</span>
        </div>
        <div className="price">
          ₹{product.price} {product.mrp && <del>₹{product.mrp}</del>}
        </div>
        <button className="btn small" onClick={() => add(product)}>
          Add to cart
        </button>
      </div>
    </article>
  );
}
