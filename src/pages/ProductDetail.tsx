import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Photo from "../components/Photo";
import ProductImage from "../components/ProductImage";
import QtyStepper from "../components/QtyStepper";
import { Heart } from "../components/Icons";
import { media } from "../media";
import {
  PRODUCT_ALIASES,
  defaultPack,
  isOnSale,
  rupees,
  settings,
  useCatalog,
  type Product,
} from "../catalog";

export default function ProductDetail() {
  const { id = "" } = useParams();
  const { products } = useCatalog();
  const product = products.find((p) => p.id === (PRODUCT_ALIASES[id] ?? id));

  if (!product) {
    return (
      <section className="page-hero">
        <span className="eyebrow marked">Shop</span>
        <h1>We couldn't find that product.</h1>
        <p>
          <Link className="link-more" to="/shop">
            Browse the shop <span>→</span>
          </Link>
        </p>
      </section>
    );
  }

  // Keyed by product, so moving from one product page to another starts with
  // that product's own default pack and a quantity of one.
  return <ProductView key={product.id} product={product} />;
}

function ProductView({ product }: { product: Product }) {
  const navigate = useNavigate();
  const { add, toggleWish, wishlist } = useCatalog();
  const wished = wishlist.includes(product.id);
  const onSale = isOnSale(product);
  const [packId, setPackId] = useState(defaultPack(product)?.id ?? "");
  const [qty, setQty] = useState(1);
  const photos = product.image ? [product.image, ...(product.gallery ?? [])] : [];
  const [shown, setShown] = useState(0);
  const pack = product.packs.find((k) => k.id === packId);
  const hasReadyStock = product.packs.some((k) => k.popular);
  const subtitleRepeatsCollection =
    !!product.collection && product.collection.toLowerCase().startsWith(product.subtitle.toLowerCase());

  return (
    <>
      <section className="section shell product-page">
        <div className="product-media reveal">
          <div className="product-stage">
            {photos.length > 1 ? (
              <Photo media={photos[shown]} alt={product.name} sizes="(max-width: 980px) 70vw, 440px" priority />
            ) : (
              <ProductImage product={product} sizes="(max-width: 980px) 70vw, 440px" eager />
            )}
            <div className="soft-orbit" />
          </div>
          {photos.length > 1 && (
            <div className="product-thumbs">
              {photos.map((photo, i) => (
                <button
                  key={photo.name}
                  type="button"
                  className={i === shown ? "product-thumb on" : "product-thumb"}
                  aria-label={`Show photo ${i + 1} of ${photos.length}`}
                  aria-pressed={i === shown}
                  onClick={() => setShown(i)}
                >
                  <Photo media={photo} alt="" sizes="84px" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="product-info reveal">
          <span className="eyebrow marked">{product.collection ?? product.category}</span>
          <h1>{product.name}</h1>
          {(!subtitleRepeatsCollection || product.badge) && (
            <p className="product-sub">
              {!subtitleRepeatsCollection && product.subtitle}
              {product.badge && <span className="tag">{product.badge}</span>}
            </p>
          )}

          {onSale && pack ? (
            <>
              <div className="price-row">
                {rupees(pack.price * qty)}
                <small>{qty > 1 ? `${qty} × ${rupees(pack.price)} · MRP incl. of all taxes` : "MRP incl. of all taxes"}</small>
              </div>

              <fieldset className="pack-options">
                <legend>Pack size</legend>
                {product.packs.map((k) => (
                  <label key={k.id} className={k.id === packId ? "pack-option on" : "pack-option"}>
                    <input
                      type="radio"
                      name="pack"
                      value={k.id}
                      checked={k.id === packId}
                      onChange={() => setPackId(k.id)}
                    />
                    <b>
                      {k.label}
                      {k.popular && <i className="ready" aria-label="Ready stock">◆</i>}
                    </b>
                    <small>{rupees(k.price)}</small>
                  </label>
                ))}
              </fieldset>
              {hasReadyStock && <p className="pack-legend">◆ Ready stock: bottled continuously, so it ships fastest.</p>}

              <div className="actions">
                <QtyStepper value={qty} onChange={setQty} label={`${product.name}, ${pack.label}`} />
                <button className="btn gold" onClick={() => add(product, pack.id, qty)}>
                  Add to cart
                </button>
                <button
                  className="btn"
                  onClick={() => {
                    add(product, pack.id, qty);
                    navigate("/checkout");
                  }}
                >
                  Buy now
                </button>
                <button className="icon-btn wish-inline" onClick={() => toggleWish(product.id)} aria-pressed={wished} aria-label={wished ? "Remove from wishlist" : "Save to wishlist"}>
                  <Heart filled={wished} />
                </button>
              </div>

              {product.note && <p className="product-note">{product.note}</p>}

              <ul className="product-facts">
                <li>
                  Free delivery on orders of {rupees(settings.freeShippingFrom)}+, otherwise {rupees(settings.shippingFee)}
                </li>
                {settings.codEnabled && <li>Cash on Delivery available</li>}
                <li>Pan India delivery</li>
              </ul>
            </>
          ) : (
            <>
              <p className="soon-panel">
                <b>Coming soon.</b> This product isn't available to order online yet.
              </p>
              <div className="actions">
                <Link className="btn gold" to="/bulk">
                  Ask about availability
                </Link>
                <button className="btn ghost" onClick={() => toggleWish(product.id)} aria-pressed={wished}>
                  <Heart filled={wished} /> {wished ? "Saved" : "Wishlist"}
                </button>
              </div>
            </>
          )}

          <div className="benefit-icons">
            <span>Raw &amp; natural</span>
            <span>No added sugar</span>
            <span>Farm direct</span>
            <span>Lab tested</span>
          </div>
        </div>
      </section>

      <section className="section shell origin-story">
        <div className="reveal">
          <span className="eyebrow marked">From bloom to bottle</span>
          <h2>Our hives travel with the bloom.</h2>
          <p>
            Mustard in winter, litchi in spring, wild forest through the
            monsoon. We move our boxes with the flowering season, leave enough
            honey in the hive for the colony, and extract cold. Nothing is
            heated, nothing is blended, nothing is hurried.
          </p>
          <Link className="link-more" to="/our-story">
            Our story <span>→</span>
          </Link>
        </div>
        <div className="reveal">
          <Photo
            media={media.jarsRosewood}
            alt="Abhimanyu Organics honey jars"
            sizes="(max-width: 980px) 92vw, 580px"
          />
        </div>
      </section>
    </>
  );
}
