import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { media } from "../media";
import type { Post } from "../journal";
import Photo from "../components/Photo";
import JournalCover from "../components/JournalCover";
import ProductCard from "../components/ProductCard";
import { StoryFilmDialog } from "../components/StoryFilm";
import ProductImage from "../components/ProductImage";
import { isOnSale, lowestPrice, rupees, useCatalog } from "../catalog";
import { Arrow, Drop, Gift, Hive, Jar, Leaf, Play } from "../components/Icons";

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

// Newest first; four fit the row.
const JOURNAL: [string, Post["cover"], string, string][] = [
  ["gulkand-honey", "rose-honey", "Gulkand honey, explained", "Rose petals, honey and a summer ritual."],
  ["raw-honey", media.jarBeri, "Why raw honey crystallizes", "A natural sign, not a defect."],
  ["bee-pollen", media.jarDryFruit, "Bee pollen, from hive to table", "What it is and how people use it."],
  ["beekeeping", media.jarInHand, "Inside responsible beekeeping", "Small bees, big changes."],
];

/* ------------------------------------------------------------ honey drip --- */

// [centre x, length, bulb radius] on a 1440-wide canvas. Irregular on purpose:
// evenly spaced drips read as a pattern, uneven ones read as honey.
const DRIPS: [number, number, number][] = [
  [58, 25, 4], [172, 39, 5.5], [296, 22, 3.5], [428, 52, 6.5], [556, 28, 4],
  [684, 20, 3], [806, 35, 5], [936, 58, 7], [1062, 25, 3.8], [1178, 44, 6],
  [1296, 22, 3.5], [1392, 31, 4.5],
];
// A darker pour hanging behind the front one, peeking out between its drips.
const BACK_DRIPS: [number, number, number][] = [
  [110, 29, 3.8], [238, 23, 3.4], [362, 35, 4], [492, 22, 3], [620, 42, 4.5],
  [742, 25, 3.4], [870, 22, 3], [1000, 38, 4], [1120, 27, 3.4], [1238, 22, 3],
  [1344, 36, 4],
];
const BAND = 11;

// A drip's neck and bulb, from where it leaves the band to where it rejoins.
// Returns the outline and the x where it starts.
function tongue(cx: number, len: number, r: number, top = BAND): [string, number] {
  const cy = len - r;
  const left = cx - r * 2.6;
  return [
    `C${cx - r * 1.1} ${top} ${cx - r * 0.7} ${cy - r * 2.4} ${cx - r * 0.95} ${cy - r * 0.3}` +
    `A${r} ${r} 0 1 0 ${cx + r * 0.95} ${cy - r * 0.3}` +
    `C${cx + r * 0.7} ${cy - r * 2.4} ${cx + r * 1.1} ${top} ${cx + r * 2.6} ${top}`,
    left,
  ];
}

// The whole pour as one outline: band, sagging between drips, plus every drip.
function pourPath(drips: [number, number, number][], band: number): string {
  let d = `M0 0V${band}`;
  let x = 0;
  for (const [cx, len, r] of drips) {
    const [curve, left] = tongue(cx, len, r, band);
    // Sag a little between drips, the way a thick pour does.
    d += `Q${(x + left) / 2} ${band + 3.5} ${left} ${band}${curve}`;
    x = cx + r * 2.6;
  }
  return `${d}Q${(x + 1440) / 2} ${band + 3.5} 1440 ${band}V0Z`;
}

// A single drip on its own, so it can stretch independently. It starts a few
// units inside the band, which hides the seam.
function dripPath([cx, len, r]: [number, number, number]): string {
  const [curve, left] = tongue(cx, len, r);
  return `M${left} ${BAND - 5}V${BAND}${curve}V${BAND - 5}Z`;
}

// The band alone: flat across under each drip (the drip covers it) and
// sagging between them.
function bandPath(): string {
  let d = `M0 0V${BAND}`;
  let x = 0;
  for (const [cx, , r] of DRIPS) {
    const left = cx - r * 2.6;
    d += `Q${(x + left) / 2} ${BAND + 3.5} ${left} ${BAND}H${cx + r * 2.6}`;
    x = cx + r * 2.6;
  }
  return `${d}Q${(x + 1440) / 2} ${BAND + 3.5} 1440 ${BAND}V0Z`;
}

const FRONT_D = pourPath(DRIPS, BAND);
const BACK_D = pourPath(BACK_DRIPS, BAND + 2);
const BAND_D = bandPath();

// Tiny air bubbles caught in the band: [x, y, r].
const BUBBLES: [number, number, number][] = [
  [84, 6, 1], [240, 5, 0.8], [352, 7, 1.2], [512, 5, 0.9], [640, 7, 1.1], [760, 5, 0.7],
  [880, 7, 1], [1010, 5, 1.2], [1130, 7, 0.9], [1240, 5, 1], [1350, 7, 0.8],
];

function HoneyDrip() {
  return (
    <svg
      className="hero-drip"
      viewBox="0 0 1440 72"
      preserveAspectRatio="xMidYMin slice"
      aria-hidden="true"
    >
      <defs>
        {/* One gradient in page units, so band and drips shade as one body:
            pale gold at the surface, deepening to amber at the tips. */}
        <linearGradient id="honey-body" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="62">
          <stop offset="0" stopColor="#FFE9B0" />
          <stop offset=".1" stopColor="#FBC862" />
          <stop offset=".38" stopColor="#EFA42E" />
          <stop offset=".72" stopColor="#D1800F" />
          <stop offset="1" stopColor="#A85C04" />
        </linearGradient>
        <linearGradient id="honey-back" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="46">
          <stop offset="0" stopColor="#E8A437" />
          <stop offset=".5" stopColor="#CF830F" />
          <stop offset="1" stopColor="#9E5604" />
        </linearGradient>
        {/* Bright skin of light along the top surface. */}
        <linearGradient id="honey-surface" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".75" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        {/* The glint that travels along the pour. */}
        <linearGradient id="honey-sheen" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset=".5" stopColor="#FFF6DA" stopOpacity=".7" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <filter id="honey-shadow" x="-5%" y="-20%" width="110%" height="160%">
          <feGaussianBlur stdDeviation="3.5" />
        </filter>
        <clipPath id="honey-clip">
          <path d={FRONT_D} />
        </clipPath>
      </defs>

      {/* Soft warm shadow the pour casts on the page. */}
      <path d={FRONT_D} transform="translate(0 4)" fill="rgba(140, 80, 6, .22)" filter="url(#honey-shadow)" />

      {/* The deeper pour behind, for depth. */}
      <path className="honey-back" d={BACK_D} fill="url(#honey-back)" opacity=".9" />

      {/* Front pour: band plus drips that slowly stretch and settle. */}
      <path d={BAND_D} fill="url(#honey-body)" />
      {DRIPS.map((drip, i) => {
        const [cx, len, r] = drip;
        return (
          <g
            key={cx}
            className="drip"
            style={{ animationDuration: `${5.5 + (i % 4) * 1.3}s`, animationDelay: `${-i * 0.9}s` }}
          >
            <path d={dripPath(drip)} fill="url(#honey-body)" />
            {/* Glossy highlight on the bulb, and a pin-point glint. */}
            <ellipse
              cx={cx - r * 0.38}
              cy={len - r * 1.2}
              rx={r * 0.24}
              ry={r * 0.5}
              transform={`rotate(-18 ${cx - r * 0.38} ${len - r * 1.2})`}
              fill="rgba(255, 250, 235, .78)"
            />
            <circle cx={cx + r * 0.38} cy={len - r * 0.5} r={r * 0.12} fill="rgba(255, 255, 255, .7)" />
            {/* Light running down the neck. */}
            <path
              d={`M${cx - r * 0.55} ${BAND + 2}C${cx - r * 0.5} ${len - r * 3} ${cx - r * 0.62} ${len - r * 2.2} ${cx - r * 0.6} ${len - r * 1.9}`}
              stroke="rgba(255, 246, 220, .45)"
              strokeWidth={Math.max(1, r * 0.16)}
              strokeLinecap="round"
              fill="none"
            />
          </g>
        );
      })}

      {/* Surface light, bubbles and the travelling glint, kept inside the honey. */}
      <g clipPath="url(#honey-clip)">
        <rect x="0" y="0" width="1440" height="5" fill="url(#honey-surface)" />
        {BUBBLES.map(([x, y, r]) => (
          <circle key={x} cx={x} cy={y} r={r} fill="rgba(255, 248, 225, .5)" />
        ))}
        <rect className="honey-glint" x="-320" y="0" width="320" height="72" fill="url(#honey-sheen)" />
      </g>
      <path d="M0 1H1440" stroke="rgba(255, 244, 210, .9)" strokeWidth="1.2" />

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

  // The hero's animations (the pour, the slow drift of the photo) pause once
  // it scrolls out of view.
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
    return () => idle.disconnect();
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
        {/* The photograph fills the hero; a soft ivory wash on the left keeps
            the headline readable, and fades out before it reaches the jar. */}
        <div className="hero-photo">
          <Photo
            media={media.heroMeadow}
            alt="A jar of Abhimanyu Organics honey on a wooden table in a sunlit meadow, with beehives and wildflowers behind it"
            sizes="(max-width: 980px) 640px, 100vw"
            priority
          />
          <Link
            className="hero-watch"
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
            <span className="hero-watch-ring">
              <Play />
            </span>
            <span className="hero-watch-text">
              Watch
              <br />
              Our Story
            </span>
          </Link>
        </div>
        <HoneyDrip />

        <div className="shell hero-grid">
          <div className="hero-copy">
            <span className="hero-kicker">Pure · Raw · Wild forest blooms</span>
            <h1 className="hero-title">
              Pure Honey
              <br />
              From <em className="gilt">Our Bees</em>
              <br />
              To <em className="gilt">Your Home.</em>
            </h1>
            <p className="hero-sub">
              <b>Raw. Unprocessed. Unfiltered.</b>
              <br />
              Straight from nature&rsquo;s finest blooms to your family.
            </p>
            <div className="hero-actions">
              <Link className="hero-btn primary" to="/shop?cat=Honey">
                Shop Honey <Arrow />
              </Link>
              <Link className="hero-btn outline" to="/our-story">
                Explore Our Story
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
          {JOURNAL.map(([slug, cover, title, excerpt]) => (
            <Link key={slug} to={`/blog/${slug}`} className="journal-card reveal">
              <div className="journal-media">
                <JournalCover
                  cover={cover}
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
