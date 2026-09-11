import { useState } from "react";
import { Link } from "react-router-dom";
import { asset } from "../asset";
import ProductCard from "../components/ProductCard";
import { useCatalog } from "../catalog";

const FILTERS = ["All", "Honey", "Ghee & Oils", "Bee Products", "Seasonal Fruits"];

export default function Home() {
  const { products } = useCatalog();
  const [filter, setFilter] = useState("All");

  const best = products
    .filter((p) => filter === "All" || p.category === filter)
    .slice(0, 5);
  const honeys = products.filter((p) => p.category === "Honey");

  return (
    <>
      <section className="hero">
        <div
          className="hero-bg"
          style={{ "--img": `url(${asset("assets/images/hero-reference.jpg")})` } as React.CSSProperties}
        />
        <div className="shell hero-grid">
          <div className="hero-copy reveal">
            <span className="eyebrow">Pure · Raw · Unprocessed</span>
            <h1>
              Pure Honey.
              <br />
              From <em>Our Bees</em>
              <br />
              To Your Home.
            </h1>
            <p>
              Straight from nature’s finest blooms to your family. Farm-direct
              honey, thoughtful gifting and natural pantry essentials.
            </p>
            <div className="actions">
              <Link className="btn" to="/shop">
                Shop Honey →
              </Link>
              <Link className="btn ghost" to="/our-story">
                Explore Our Story
              </Link>
            </div>
          </div>
          <div className="hero-art">
            <img
              className="float-jar"
              src={asset("assets/images/beri.jpg")}
              alt="Abhimanyu Organics honey"
            />
            <div className="orbit">
              100% RAW
              <br />&amp; PURE
            </div>
            <div className="bee-float b1">🐝</div>
            <div className="bee-float b2">🐝</div>
          </div>
        </div>
        <div className="shell trustbar">
          <span>◉ Direct from Bee Farms</span>
          <span>◌ Raw &amp; Unprocessed</span>
          <span>⊘ No Added Sugar</span>
          <span>⚗ Lab Tested &amp; Certified</span>
          <span>▣ Pan India Delivery</span>
        </div>
      </section>

      <section className="section shell">
        <div className="section-head">
          <div>
            <span className="eyebrow">Shop the farm</span>
            <h2>Explore Our Bestselling Products</h2>
          </div>
          <Link to="/shop">View all →</Link>
        </div>
        <div className="filter-pills">
          {FILTERS.map((x) => (
            <button
              key={x}
              onClick={() => setFilter(x)}
              className={filter === x ? "active" : undefined}
            >
              {x}
            </button>
          ))}
        </div>
        <div className="product-grid five">
          {best.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section className="section shell honey-ribbon">
        <div className="section-head">
          <div>
            <span className="eyebrow">One bloom, one story</span>
            <h2>Our Honey Varieties</h2>
          </div>
          <Link to="/shop">View All Honey →</Link>
        </div>
        <div className="horizontal-scroll">
          {honeys.map((p) => (
            <Link key={p.id} to={`/product/${p.id}`} className="mini-honey">
              <img src={asset(p.image)} alt={p.name} />
              <b>{p.name}</b>
              <small>₹{p.price}</small>
            </Link>
          ))}
        </div>
      </section>

      <section className="section shell beyond">
        <div className="section-head">
          <div>
            <span className="eyebrow">Beyond Honey</span>
            <h2>Farm-direct goodness for everyday living</h2>
          </div>
        </div>
        <div className="beyond-grid">
          <Link to="/shop" className="feature-card">
            <span>Desi Bilona Ghee</span>
            <small>Traditional &amp; Pure</small>
          </Link>
          <Link to="/shop" className="feature-card">
            <span>Cold Pressed Coconut Oil</span>
            <small>Cold pressed</small>
          </Link>
          <Link to="/shop" className="feature-card">
            <span>Cold Pressed Mustard Oil</span>
            <small>Farm pantry</small>
          </Link>
          <Link to="/shop" className="feature-card">
            <span>Bee Pollen</span>
            <small>Nature’s superfood</small>
          </Link>
          <Link to="/shop" className="feature-card">
            <span>Honey Gulkand</span>
            <small>Rose petal wellness blend</small>
          </Link>
        </div>
      </section>

      <section className="farm-story">
        <div className="shell story-grid">
          <div className="story-card reveal">
            <span className="eyebrow">From our farms to your family</span>
            <h2>Beekeeping for a better tomorrow.</h2>
            <p>
              Responsible beekeeping, honest sourcing and minimal processing keep
              our products closer to nature.
            </p>
            <Link className="btn" to="/our-story">
              Discover Our Story →
            </Link>
            <div className="stats">
              <b>
                5000+<small>Happy customers</small>
              </b>
              <b>
                250+<small>Bee hives</small>
              </b>
              <b>
                20+<small>Honey varieties</small>
              </b>
            </div>
          </div>
          <img src={asset("assets/images/farm-reference.jpg")} alt="Our farms" />
        </div>
      </section>

      <section className="section shell split-cards">
        <Link
          className="premium-card gift"
          to="/gifting"
          style={{ "--img": `url(${asset("assets/images/gifting.jpg")})` } as React.CSSProperties}
        >
          <span className="eyebrow">Premium Gifting</span>
          <h2>Thoughtful. Pure. Natural.</h2>
          <p>
            Curated honey collections for celebrations, weddings and corporate
            gifting.
          </p>
          <b>Explore gifting →</b>
        </Link>
        <Link
          className="premium-card seasonal"
          to="/seasonal"
          style={{ "--img": `url(${asset("assets/images/range-reference.jpg")})` } as React.CSSProperties}
        >
          <span className="eyebrow">Seasonal Harvest</span>
          <h2>Ber &amp; Guava, when nature says ready.</h2>
          <p>Limited batches, farm fresh and dispatched in season.</p>
          <b>See seasonal produce →</b>
        </Link>
      </section>

      <section className="section shell">
        <div className="section-head">
          <div>
            <span className="eyebrow">Latest from our journal</span>
            <h2>Learn Honey. Bees. Better Living.</h2>
          </div>
          <Link to="/blog">Read all stories →</Link>
        </div>
        <div className="journal-grid">
          <Link to="/blog/raw-honey" className="journal-card">
            <img src={asset("assets/images/rosewood.jpg")} alt="" />
            <h3>Why Raw Honey Crystallizes</h3>
            <p>A natural sign, not a defect.</p>
          </Link>
          <Link to="/blog/bee-pollen" className="journal-card">
            <img src={asset("assets/images/dry-fruit.jpg")} alt="" />
            <h3>Bee Pollen: from hive to table</h3>
            <p>What it is and how people use it.</p>
          </Link>
          <Link to="/blog/beekeeping" className="journal-card">
            <img src={asset("assets/images/farm-reference.jpg")} alt="" />
            <h3>Inside Responsible Beekeeping</h3>
            <p>Small bees, big changes.</p>
          </Link>
          <Link to="/blog/honey-health" className="journal-card">
            <img src={asset("assets/images/beri.jpg")} alt="" />
            <h3>Everyday ways to use honey</h3>
            <p>Food, drinks and simple wellness routines.</p>
          </Link>
        </div>
      </section>

      <section className="section shell gallery-teaser">
        <div>
          <span className="eyebrow">Gallery</span>
          <h2>Behind every jar is a journey.</h2>
          <p>
            Farming, bee boxes, extraction, packaging, dispatch and customer
            showcases.
          </p>
          <Link className="btn" to="/gallery">
            Explore Gallery →
          </Link>
        </div>
        <div className="mosaic">
          <img src={asset("assets/images/farm-reference.jpg")} alt="" />
          <img src={asset("assets/images/mini-jars.jpg")} alt="" />
          <img src={asset("assets/images/gifting.jpg")} alt="" />
          <img src={asset("assets/images/rosewood.jpg")} alt="" />
        </div>
      </section>

      <section className="section shell bulk-banner">
        <div>
          <span className="eyebrow light">
            For Bulk Orders &amp; Supplier Partnerships
          </span>
          <h2>Partner with purpose.</h2>
          <p>
            Wholesale honey, retail supply, gifting, private label, seasonal
            produce and supplier onboarding.
          </p>
        </div>
        <Link className="btn lightbtn" to="/bulk">
          Send Enquiry →
        </Link>
      </section>
    </>
  );
}
