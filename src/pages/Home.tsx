import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { media } from "../media";
import Photo from "../components/Photo";
import ProductCard from "../components/ProductCard";
import { StoryFilmDialog } from "../components/StoryFilm";
import ProductImage from "../components/ProductImage";
import { isOnSale, lowestPrice, rupees, useCatalog } from "../catalog";
import {
  Arrow,
  Bee,
  Drop,
  Flask,
  Gift,
  Hive,
  Jar,
  Leaf,
  NoSugar,
  Play,
} from "../components/Icons";

const FILTERS = [
  "All",
  "Honey",
  "Ghee & Oils",
  "Bee Products",
  "Seasonal Fruits",
];

const TRUST = [
  "Direct from our bee farms",
  "Raw & unprocessed",
  "No added sugar",
  "Lab tested & certified",
  "Pan India delivery",
  "Supporting local beekeepers",
];

const BEYOND: [React.ComponentType<{ className?: string }>, string, string][] =
  [
    [Jar, "Desi Bilona Ghee", "Hand-churned, traditional"],
    [Drop, "Cold Pressed Coconut Oil", "Kachi ghani, unrefined"],
    [Leaf, "Cold Pressed Mustard Oil", "Farm pantry staple"],
    [Hive, "Bee Pollen", "Nature's superfood"],
    [Gift, "Honey Gulkand", "Rose petal wellness blend"],
  ];

const QUOTES: [string, string, string][] = [
  [
    "The first honey my family finished in under a month. You can actually taste which flower it came from.",
    "Ritika S.",
    "Verified buyer · Wild Forest",
  ],
  [
    "Ordered the mini flight as a Diwali gift for 40 clients. Packaging was genuinely premium and dispatch was on time.",
    "Aman Gupta",
    "Corporate gifting · Gurgaon",
  ],
  [
    "It crystallised in winter, which is exactly what raw honey should do. That's how I knew it was the real thing.",
    "Dr. Meera N.",
    "Verified buyer · Kashmiri Acacia",
  ],
];

const JOURNAL = [
  ["raw-honey", media.jarBeri, "Why raw honey crystallizes", "A natural sign, not a defect."],
  ["bee-pollen", media.jarDryFruit, "Bee pollen, from hive to table", "What it is and how people use it."],
  ["beekeeping", media.jarInHand, "Inside responsible beekeeping", "Small bees, big changes."],
  ["honey-health", media.miniFlight, "Everyday ways to use honey", "Food, drinks and simple routines."],
] as const;

/* ------------------------------------------------------------ honey drip --- */

// [centre x, length, bulb radius] on a 1440-wide canvas. Irregular on purpose:
// evenly spaced drips read as a pattern, uneven ones read as honey.
const DRIPS: [number, number, number][] = [
  [58, 40, 5], [172, 74, 7], [296, 30, 4.5], [428, 102, 8.5], [556, 46, 5.5],
  [684, 28, 4], [806, 66, 6.5], [936, 118, 9], [1062, 42, 5], [1178, 86, 7.5],
  [1296, 34, 4.5], [1392, 60, 6],
];
const BAND = 13;

function dripPath(): string {
  let d = `M0 0V${BAND}`;
  let x = 0;
  for (const [cx, len, r] of DRIPS) {
    const cy = len - r;
    const left = cx - r * 2.6;
    const right = cx + r * 2.6;
    // Sag a little between drips, the way a thick pour does.
    d += `Q${(x + left) / 2} ${BAND + 3} ${left} ${BAND}`;
    d += `C${cx - r * 1.1} ${BAND} ${cx - r * 0.7} ${cy - r * 2.4} ${cx - r * 0.95} ${cy - r * 0.3}`;
    d += `A${r} ${r} 0 1 0 ${cx + r * 0.95} ${cy - r * 0.3}`;
    d += `C${cx + r * 0.7} ${cy - r * 2.4} ${cx + r * 1.1} ${BAND} ${right} ${BAND}`;
    x = right;
  }
  return `${d}Q${(x + 1440) / 2} ${BAND + 3} 1440 ${BAND}V0Z`;
}

const DRIP_D = dripPath();

function HoneyDrip() {
  return (
    <svg
      className="hero-drip"
      viewBox="0 0 1440 140"
      preserveAspectRatio="xMidYMin slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="honey-pour" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFD983" />
          <stop offset=".35" stopColor="#F0B13D" />
          <stop offset="1" stopColor="#C97F12" />
        </linearGradient>
      </defs>
      <path d={DRIP_D} transform="translate(0 3)" fill="rgba(150, 96, 12, .16)" />
      <path d={DRIP_D} fill="url(#honey-pour)" />
      <path d="M0 4.5H1440" stroke="rgba(255,255,255,.5)" strokeWidth="1.4" />
      {DRIPS.map(([cx, len, r]) => (
        <ellipse
          key={cx}
          cx={cx - r * 0.34}
          cy={len - r * 1.25}
          rx={r * 0.26}
          ry={r * 0.42}
          fill="rgba(255,255,255,.6)"
        />
      ))}
      {/* Three drops let go of the longest drips, one after another. */}
      {[DRIPS[3], DRIPS[7], DRIPS[9]].map(([cx, len, r], i) => (
        <circle key={cx} className={`drop drop-${i + 1}`} cx={cx} cy={len + r * 0.4} r={r * 0.62} fill="#E9A232" />
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------ page --- */

export default function Home() {
  const { products } = useCatalog();
  const [filter, setFilter] = useState("All");
  const [filmOpen, setFilmOpen] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const railRef = useRef<HTMLDivElement>(null);

  // Hero motion. The light follows the pointer by transform alone, and the
  // hero's animations pause once it scrolls out of view.
  //
  // There is deliberately no scroll parallax: measured on a throttled CPU,
  // moving the artwork on every scroll frame cost more smoothness than any
  // other effect on the page, for a drift most visitors would never notice.
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const idle = new IntersectionObserver(([entry]) =>
      hero.classList.toggle("is-idle", !entry.isIntersecting),
    );
    idle.observe(hero);

    const spot = hero.querySelector<HTMLElement>(".hero-spot");
    const moves =
      window.matchMedia("(pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!spot || !moves) return () => idle.disconnect();

    let frame = 0;
    let px = 0;
    let py = 0;
    const paint = () => {
      frame = 0;
      spot.style.transform = `translate3d(${px}px, ${py}px, 0)`;
    };
    const onMove = (e: PointerEvent) => {
      const r = hero.getBoundingClientRect();
      px = e.clientX - r.left;
      py = e.clientY - r.top;
      if (!frame) frame = requestAnimationFrame(paint);
    };

    hero.addEventListener("pointermove", onMove);
    return () => {
      idle.disconnect();
      if (frame) cancelAnimationFrame(frame);
      hero.removeEventListener("pointermove", onMove);
    };
  }, []);

  const slide = (dir: 1 | -1) => {
    const rail = railRef.current;
    if (rail) rail.scrollBy({ left: dir * rail.clientWidth * 0.8, behavior: "smooth" });
  };

  const best = products
    .filter((p) => filter === "All" || p.category === filter)
    .slice(0, 5);
  const honeys = products.filter((p) => p.category === "Honey");

  return (
    <>
      {/* ---------------------------------------------------------------- hero */}
      <section className="hero" ref={heroRef}>
        <div className="hero-sky" aria-hidden="true">
          <div className="hero-sun" />
          <div className="hero-rays" />
          <div className="hero-comb" />
          <div className="hero-spot" />
        </div>
        <HoneyDrip />

        <div className="shell hero-grid">
          <div className="hero-copy">
            <span className="eyebrow ornate">Pure · Raw · Unprocessed</span>
            <h1 className="display">
              Pure honey.
              <br />
              From <em className="gilt">our bees</em>
              <br />
              to your home.
            </h1>
            <p className="lede">
              Our hives travel with the bloom — mustard in winter, litchi in
              spring, wild forest through the monsoon. Nothing is heated,
              nothing is blended, nothing is hurried.
            </p>
            <div className="hero-actions">
              <Link className="btn gold" to="/shop">
                Shop the harvest <Arrow />
              </Link>
              <Link
                className="btn ghost"
                to="/our-story"
                aria-haspopup="dialog"
                onClick={(event) => {
                  // A plain click plays the film right here. Modified clicks
                  // (new tab, new window) still open the Our Story page.
                  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                  event.preventDefault();
                  setFilmOpen(true);
                }}
              >
                <Play /> Watch our story
              </Link>
            </div>
            <div className="hero-proof">
              <div>
                <b>600+</b>
                <small>Bee hives</small>
              </div>
              <div>
                <b>20+</b>
                <small>Single-bloom honeys</small>
              </div>
              <div>
                <b>15,000+</b>
                <small>Families served</small>
              </div>
            </div>
          </div>

          <div className="hero-art">
            <div className="arch-glow" aria-hidden="true" />
            <div className="arch">
              <Photo
                media={media.jarInHand}
                alt="A jar of Abhimanyu Organics Rosewood honey held in hand"
                sizes="(max-width: 620px) 300px, (max-width: 980px) 340px, 440px"
                priority
              />
            </div>

            <div className="medallion">
              <Photo
                media={media.acaciaBox}
                alt="Kashmiri Acacia honey in a maroon and gold gift box"
                sizes="170px"
              />
            </div>

            <div className="seal" aria-hidden="true">
              {/* The ring turns inside an HTML wrapper: rotating the <svg>
                  itself re-drew the curved text every frame. */}
              <span className="seal-ring">
                <svg viewBox="0 0 120 120">
                  <defs>
                    <path id="seal-ring" d="M60 60m-47 0a47 47 0 1 1 94 0a47 47 0 1 1-94 0" />
                  </defs>
                  <circle cx="60" cy="60" r="58" fill="none" stroke="currentColor" strokeWidth=".8" />
                  <circle cx="60" cy="60" r="36" fill="none" stroke="currentColor" strokeWidth=".6" opacity=".6" />
                  <text className="seal-text">
                    <textPath href="#seal-ring" startOffset="0">
                      FARM DIRECT ◆ LAB TESTED ◆ NO ADDED SUGAR ◆
                    </textPath>
                  </text>
                </svg>
              </span>
              <span className="seal-core">
                100%
                <br />
                Raw &amp; Pure
              </span>
            </div>

            <span className="chip c1">
              <Hive /> Direct from our hives
            </span>
            <span className="chip c2">
              <Flask /> Lab tested, every batch
            </span>
            <span className="chip c3">
              <NoSugar /> Zero added sugar
            </span>

            <Bee className="bee-float b1" />
            <Bee className="bee-float b2" />
          </div>
        </div>
      </section>

      <StoryFilmDialog open={filmOpen} onClose={() => setFilmOpen(false)} />

      {/* ----------------------------------------------------------- trust bar */}
      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {[...TRUST, ...TRUST].map((t, i) => (
            <span key={i}>{t}</span>
          ))}
        </div>
      </div>

      {/* --------------------------------------------------------- bestsellers */}
      <section className="section shell">
        <div className="section-head reveal">
          <div>
            <span className="eyebrow marked">Shop the farm</span>
            <h2>The jars people come back for</h2>
          </div>
          <Link className="link-more" to="/shop">
            View all products <span>→</span>
          </Link>
        </div>
        <div className="filter-pills reveal">
          {FILTERS.map((x) => (
            <button
              key={x}
              onClick={() => setFilter(x)}
              className={filter === x ? "active" : undefined}
              aria-pressed={filter === x}
            >
              {x}
            </button>
          ))}
        </div>
        <div className="product-grid five">
          {best.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              sizes="(max-width: 620px) 50vw, (max-width: 1080px) 33vw, 240px"
            />
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------ honey varieties */}
      <section className="section tight shell cv">
        <div className="honey-rail-wrap reveal">
          <div className="section-head">
            <div>
              <span className="eyebrow marked">One bloom, one story</span>
              <h2>Our honey varieties</h2>
              <p>
                Each jar is named for the flower the bees worked that season, so
                the colour, aroma and thickness change through the year.
              </p>
            </div>
            <div className="rail-controls">
              <button className="rail-btn prev" onClick={() => slide(-1)} aria-label="Previous varieties">
                <Arrow />
              </button>
              <button className="rail-btn" onClick={() => slide(1)} aria-label="More varieties">
                <Arrow />
              </button>
              <Link className="link-more" to="/shop?cat=Honey">
                All honey <span>→</span>
              </Link>
            </div>
          </div>
          <div className="honey-rail" ref={railRef}>
            {honeys.map((p) => (
              <Link key={p.id} to={`/product/${p.id}`} className="mini-honey">
                <span className="mini-arch">
                  <ProductImage product={p} sizes="190px" />
                </span>
                <b>{p.name}</b>
                <small>{isOnSale(p) ? `From ${rupees(lowestPrice(p))}` : "Coming soon"}</small>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- beyond honey */}
      <section className="section shell cv">
        <div className="section-head reveal">
          <div>
            <span className="eyebrow marked">Beyond honey</span>
            <h2>Everything else the farm sends up</h2>
          </div>
          <Link className="link-more" to="/shop">
            Browse the pantry <span>→</span>
          </Link>
        </div>
        <div className="comb-grid">
          {BEYOND.map(([Icon, title, sub]) => (
            <Link key={title} to="/shop" className="comb-cell reveal">
              <span className="comb-medal">
                <Icon className="comb-icon" />
              </span>
              <b>{title}</b>
              <small>{sub}</small>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------- farm story */}
      <section className="farm-story cv">
        <div className="shell story-grid">
          <div className="story-card reveal">
            <span className="eyebrow marked">From our farms to your family</span>
            <h2>
              Beekeeping for a <em className="gilt">better</em> tomorrow.
            </h2>
            <p>
              We move our boxes with the flowering season, leave enough honey in
              the hive for the colony, and extract cold so the enzymes survive
              the trip to your kitchen. Responsible beekeeping isn't a claim on
              the label — it's the only way this works.
            </p>
            <Link className="btn" to="/our-story">
              Discover our story <Arrow />
            </Link>
            <div className="stats">
              <div>
                <b>15,000+</b>
                <small>Happy customers</small>
              </div>
              <div>
                <b>600+</b>
                <small>Bee hives</small>
              </div>
              <div>
                <b>20+</b>
                <small>Honey varieties</small>
              </div>
            </div>
          </div>
          <div className="story-media reveal">
            <Photo
              media={media.jarBeri}
              alt="A jar of Abhimanyu Organics Beri honey held in hand"
              sizes="(max-width: 980px) 92vw, 540px"
            />
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------- split cards */}
      <section className="section shell split-cards cv">
        <Link className="premium-card reveal" to="/gifting">
          <Photo media={media.giftTrio} alt="" sizes="(max-width: 980px) 100vw, 620px" />
          <span className="eyebrow light marked">Premium gifting</span>
          <h2>Thoughtful. Pure. Natural.</h2>
          <p>
            Velvet-lined boxes of mini jars for festivals, weddings and client
            gifting — personalised sleeves on request.
          </p>
          <span className="link-more">
            Explore gifting <span>→</span>
          </span>
        </Link>
        <Link className="premium-card reveal" to="/seasonal">
          <Photo media={media.jarsRosewood} alt="" sizes="(max-width: 980px) 100vw, 620px" />
          <span className="eyebrow light marked">Seasonal harvest</span>
          <h2>Ber &amp; guava, when nature says ready.</h2>
          <p>
            Limited batches picked at the farm and dispatched the same week.
            When the season closes, it closes.
          </p>
          <span className="link-more">
            See seasonal produce <span>→</span>
          </span>
        </Link>
      </section>

      {/* -------------------------------------------------------- testimonials */}
      <section className="section shell cv">
        <div className="section-head centered reveal">
          <div>
            <span className="eyebrow ornate">In their words</span>
            <h2>What our customers say</h2>
          </div>
        </div>
        <div className="quote-grid">
          {QUOTES.map(([quote, name, meta]) => (
            <figure key={name} className="quote-card reveal">
              <span className="rating" aria-label="5 out of 5 stars">★★★★★</span>
              <blockquote>{quote}</blockquote>
              <figcaption>
                <b>{name}</b>
                <small>{meta}</small>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------- journal */}
      <section className="section shell cv">
        <div className="section-head reveal">
          <div>
            <span className="eyebrow marked">Latest from our journal</span>
            <h2>Learn honey. Bees. Better living.</h2>
          </div>
          <Link className="link-more" to="/blog">
            Read all stories <span>→</span>
          </Link>
        </div>
        <div className="journal-grid">
          {JOURNAL.map(([slug, image, title, excerpt]) => (
            <Link key={slug} to={`/blog/${slug}`} className="journal-card reveal">
              <div className="journal-media">
                <Photo
                  media={image}
                  alt=""
                  sizes="(max-width: 620px) 100vw, (max-width: 1080px) 50vw, 300px"
                />
              </div>
              <div>
                <span className="eyebrow">Journal</span>
                <h3>{title}</h3>
                <p>{excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------ gallery teaser */}
      <section className="section shell gallery-teaser cv">
        <div className="reveal">
          <span className="eyebrow marked">Gallery</span>
          <h2>Behind every jar is a journey.</h2>
          <p>
            Bee boxes in the mustard fields, extraction day, the packing table,
            and the dispatch van pulling out at dawn.
          </p>
          <Link className="btn" to="/gallery">
            Explore the gallery <Arrow />
          </Link>
        </div>
        <div className="mosaic reveal">
          <figure>
            <Photo media={media.giftBox} alt="" sizes="(max-width: 980px) 50vw, 240px" />
          </figure>
          <figure>
            <Photo media={media.miniFlight} alt="" sizes="(max-width: 980px) 50vw, 240px" />
          </figure>
          <figure>
            <Photo media={media.jarJamun} alt="" sizes="(max-width: 980px) 50vw, 240px" />
          </figure>
          <figure>
            <Photo media={media.jarsRosewood} alt="" sizes="(max-width: 980px) 100vw, 490px" />
          </figure>
        </div>
      </section>

      {/* ---------------------------------------------------------------- bulk */}
      <section className="section shell cv">
        <div className="bulk-banner reveal">
          <div>
            <span className="eyebrow light marked">
              Bulk orders &amp; supplier partnerships
            </span>
            <h2>Partner with purpose.</h2>
            <p>
              Wholesale honey, retail supply, corporate gifting, private label
              and seasonal produce — tell us what you need and we'll quote
              within two working days.
            </p>
          </div>
          <Link className="btn gold" to="/bulk">
            Send an enquiry <Arrow />
          </Link>
        </div>
      </section>
    </>
  );
}
