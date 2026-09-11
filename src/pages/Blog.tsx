import { Link } from "react-router-dom";
import { asset } from "../asset";

interface Post {
  slug: string;
  title: string;
  excerpt: string;
  image: string;
}

const POSTS: Post[] = [
  { slug: "raw-honey", title: "Why raw honey crystallizes", excerpt: "Raw honey changes texture naturally. Here’s why.", image: "assets/images/beri.jpg" },
  { slug: "honey-processing", title: "How honey is harvested & minimally processed", excerpt: "From comb to jar without losing the story of the bloom.", image: "assets/images/rosewood.jpg" },
  { slug: "bee-pollen", title: "Bee pollen: what it is & how people use it", excerpt: "A practical guide to this bee-collected product.", image: "assets/images/dry-fruit.jpg" },
  { slug: "beekeeping", title: "Responsible beekeeping 101", excerpt: "Colonies, seasons, forage and the work behind every jar.", image: "assets/images/farm-reference.jpg" },
  { slug: "wax-processing", title: "Beeswax after honey harvest", excerpt: "How wax is cleaned, processed and reused.", image: "assets/images/mini-jars.jpg" },
  { slug: "honey-health", title: "Everyday ways to use honey", excerpt: "Tea, breakfast, marinades, dressings and simple routines.", image: "assets/images/rosewood.jpg" },
  { slug: "honey-storage", title: "How to store natural honey", excerpt: "Temperature, moisture and crystallisation explained.", image: "assets/images/kashmiri.jpg" },
  { slug: "pollination", title: "Why bees matter beyond honey", excerpt: "Pollination, biodiversity and farms.", image: "assets/images/farm-reference.jpg" },
];

export default function Blog() {
  return (
    <>
      <section className="page-hero">
        <span>Journal</span>
        <h1>Honey, bees &amp; better living.</h1>
        <p>
          Educational stories about bee farming, pollen, honey and wax
          processing, storage, recipes and practical product use.
        </p>
      </section>
      <section className="section shell blog-grid">
        {POSTS.map((post) => (
          <Link key={post.slug} to={`/blog/${post.slug}`} className="blog-card">
            <img src={asset(post.image)} alt="" />
            <div>
              <span className="eyebrow">Journal</span>
              <h2>{post.title}</h2>
              <p>{post.excerpt}</p>
              <b>Read article →</b>
            </div>
          </Link>
        ))}
      </section>
    </>
  );
}
