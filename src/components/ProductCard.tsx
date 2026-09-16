import { Link } from "react-router-dom";
import { useCatalog, type Product } from "../catalog";
import { Heart } from "./Icons";
import ProductImage from "./ProductImage";

export default function ProductCard({
  product,
  sizes,
}: {
  product: Product;
  /** Rendered width of the photo; see <Photo>. Defaults suit a 4-up grid. */
  sizes?: string;
}) {
  const { add, toggleWish, wishlist } = useCatalog();
  const wished = wishlist.includes(product.id);

  return (
    <article className="product-card reveal">
      <div className="product-media">
        {product.badge && (
          <span className={product.badge === "Premium" ? "badge foil" : "badge"}>{product.badge}</span>
        )}
        <button
          className={wished ? "wish on" : "wish"}
          onClick={() => toggleWish(product.id)}
          aria-pressed={wished}
          aria-label={wished ? `Remove ${product.name} from wishlist` : `Save ${product.name}`}
        >
          <Heart filled={wished} />
        </button>
        <Link to={`/product/${product.id}`} tabIndex={-1} aria-hidden="true">
          <ProductImage product={product} sizes={sizes} />
        </Link>
      </div>
      <div className="product-body">
        <small>{product.subtitle}</small>
        <h3>
          <Link to={`/product/${product.id}`}>{product.name}</Link>
        </h3>
        <div className="rating" aria-label="Rated 4.8 out of 5 from 96 reviews">
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
