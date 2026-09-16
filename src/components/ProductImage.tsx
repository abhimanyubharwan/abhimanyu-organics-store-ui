import type { Product } from "../catalog";
import { Drop, Gift, Hive, Jar, Leaf } from "./Icons";
import Photo from "./Photo";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Honey: Jar,
  "Ghee & Oils": Drop,
  "Bee Products": Hive,
  Speciality: Gift,
  "Seasonal Fruits": Leaf,
};

/**
 * Renders the product photo, or — for products not yet photographed — an
 * on-brand honeycomb tile. Deliberately not a stand-in photo of another jar.
 */
export default function ProductImage({
  product,
  sizes = "(max-width: 620px) 50vw, (max-width: 1080px) 33vw, 300px",
  eager,
}: {
  product: Product;
  sizes?: string;
  eager?: boolean;
}) {
  if (product.image) {
    return <Photo media={product.image} alt={product.name} sizes={sizes} priority={eager} />;
  }

  const Icon = ICONS[product.category] ?? Jar;

  return (
    <div className="ph" role="img" aria-label={`${product.name} — photography in progress`}>
      <Icon className="ph-icon" />
      <span className="ph-label">Photography in progress</span>
    </div>
  );
}
