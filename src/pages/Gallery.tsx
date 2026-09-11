import { useState } from "react";
import { asset } from "../asset";

const TABS = ["All", "Farming", "Products", "Packaging", "Delivery"];

const ITEMS: [string, string][] = [
  ["Farming", "assets/images/farm-reference.jpg"],
  ["Products", "assets/images/beri.jpg"],
  ["Packaging", "assets/images/gifting.jpg"],
  ["Products", "assets/images/mini-jars.jpg"],
  ["Products", "assets/images/jamun.jpg"],
  ["Farming", "assets/images/range-reference.jpg"],
  ["Packaging", "assets/images/mini-collection.jpg"],
  ["Delivery", "assets/images/gifting.jpg"],
];

export default function Gallery() {
  const [tab, setTab] = useState("All");

  return (
    <>
      <section className="page-hero">
        <span>Gallery</span>
        <h1>Inside Abhimanyu Organics.</h1>
        <p>
          Farms, apiaries, extraction, packaging, dispatch and product
          showcases—all in one visual journal.
        </p>
      </section>
      <section className="section shell">
        <div className="filter-pills">
          {TABS.map((x) => (
            <button
              key={x}
              onClick={() => setTab(x)}
              className={tab === x ? "active" : undefined}
            >
              {x}
            </button>
          ))}
        </div>
        <div className="gallery-grid">
          {ITEMS.map(([category, image], i) => (
            <figure
              key={`${category}-${i}`}
              className={tab !== "All" && tab !== category ? "hide" : undefined}
            >
              <img src={asset(image)} alt={category} />
              <figcaption>{category}</figcaption>
            </figure>
          ))}
        </div>
      </section>
    </>
  );
}
