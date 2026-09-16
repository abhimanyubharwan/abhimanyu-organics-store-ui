import { Link } from "react-router-dom";
import JournalCover from "../components/JournalCover";
import { POSTS } from "../journal";

export default function Blog() {
  return (
    <>
      <section className="page-hero">
        <span className="eyebrow marked">Journal</span>
        <h1>Honey, bees &amp; better living.</h1>
        <p>
          Educational stories about bee farming, pollen, honey and wax
          processing, storage, recipes and practical product use.
        </p>
      </section>
      <section className="section shell blog-grid">
        {POSTS.map((post) => (
          <Link key={post.slug} to={`/blog/${post.slug}`} className="blog-card">
            <JournalCover cover={post.cover} sizes="(max-width: 620px) 100vw, 220px" />
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
