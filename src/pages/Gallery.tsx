import { useState } from "react";
import Photo from "../components/Photo";
import { media, type Media } from "../media";

const TABS = ["All", "Farming", "Products", "Packaging", "Delivery"];

const ITEMS: [string, Media][] = [
  ["Farming", media.jarInHand],
  ["Products", media.jarBeri],
  ["Packaging", media.giftBox],
  ["Products", media.giftTrio],
  ["Products", media.jarJamun],
  ["Farming", media.jarsRosewood],
  ["Packaging", media.miniFlight],
  ["Delivery", media.jarDryFruit],
];

export default function Gallery() {
  const [tab, setTab] = useState("All");

  return (
    <>
      <section className="page-hero">
        <span className="eyebrow marked">Gallery</span>
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
              <Photo media={image} alt={category} sizes="(max-width: 620px) 100vw, (max-width: 980px) 50vw, 25vw" />
              <figcaption>{category}</figcaption>
            </figure>
          ))}
        </div>
      </section>
    </>
  );
}
