import { useState } from "react";
import { Link } from "react-router-dom";
import { defaultPack, isOnSale, rupees, useCatalog, type Product } from "../catalog";
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
  const onSale = isOnSale(product);
  const [packId, setPackId] = useState(defaultPack(product)?.id ?? "");
  const pack = product.packs.find((k) => k.id === packId);
  const badge = onSale ? product.badge : "Coming soon";

  return (
    <article className={onSale ? "product-card reveal" : "product-card reveal is-soon"}>
      <div className="product-media">
        {badge && (
          <span className={badge === "Premium" ? "badge foil" : badge === "Coming soon" ? "badge soft" : "badge"}>
            {badge}
          </span>
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

        {onSale && pack ? (
          <>
            <div className="card-buy">
              {product.packs.length > 1 ? (
                <label className="pack-select">
                  <span className="visually-hidden">Pack size for {product.name}</span>
                  <select value={packId} onChange={(event) => setPackId(event.target.value)}>
                    {product.packs.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.label}
                      </option>
                    ))}
                  </select>
                </label>
              ) : (
                <span className="pack-single">{pack.label}</span>
              )}
              <span className="price">{rupees(pack.price)}</span>
            </div>
            <button className="btn small" onClick={() => add(product, pack.id)}>
              Add to cart
            </button>
          </>
        ) : (
          <p className="soon-note">Not available to order yet</p>
        )}
      </div>
    </article>
  );
}
