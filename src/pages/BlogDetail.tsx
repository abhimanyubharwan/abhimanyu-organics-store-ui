import { useEffect, type ComponentType } from "react";
import { Link, useParams } from "react-router-dom";
import JournalCover from "../components/JournalCover";
import Photo from "../components/Photo";
import { media } from "../media";
import { POSTS, formatPostDate } from "../journal";
import GulkandHoney, { lead as gulkandHoneyLead } from "../articles/gulkand-honey";

// Posts with a written article of their own. The others show the shared
// introduction further down until theirs is written.
const ARTICLES: Record<string, { lead: string; Body: ComponentType }> = {
  "gulkand-honey": { lead: gulkandHoneyLead, Body: GulkandHoney },
};

export default function BlogDetail() {
  const { slug = "" } = useParams();
  const post = POSTS.find((p) => p.slug === slug);
  const article = post ? ARTICLES[post.slug] : undefined;

  // The browser tab, bookmarks and search results show the article's own title.
  useEffect(() => {
    if (!post) return;
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const before = { title: document.title, description: description?.content ?? "" };
    document.title = `${post.title} · Abhimanyu Organics`;
    if (description && article) description.content = article.lead;
    return () => {
      document.title = before.title;
      if (description) description.content = before.description;
    };
  }, [post, article]);

  if (post && article) {
    const { Body } = article;
    return (
      <article className="article shell">
        <span className="eyebrow">Abhimanyu Organics Journal</span>
        <h1>{post.title}</h1>
        {post.date && (
          <p className="article-meta">
            <time dateTime={post.date}>{formatPostDate(post.date)}</time>
            {post.readMinutes ? ` · ${post.readMinutes} min read` : null}
          </p>
        )}
        <p className="lead">{article.lead}</p>
        <JournalCover cover={post.cover} sizes="(max-width: 820px) 100vw, 780px" priority />
        <Body />
        <Link className="btn" to="/blog">
          ← Back to Journal
        </Link>
      </article>
    );
  }

  return (
    <article className="article shell">
      <span className="eyebrow">Abhimanyu Organics Journal</span>
      <h1 className={post ? undefined : "from-slug"}>{post?.title ?? slug.replaceAll("-", " ")}</h1>
      <p className="lead">
        A practical, farm-first guide designed for customers who want to
        understand honey, bees and natural products—not just buy them.
      </p>
      <Photo media={media.jarsRosewood} alt="" sizes="(max-width: 820px) 100vw, 780px" priority />
      <h2>What happens at the source</h2>
      <p>
        Every honey season begins with flowering crops and forage. Bee colonies
        are placed where nectar flow is strong, monitored carefully and harvested
        only when the comb is ready.
      </p>
      <h2>Why minimal handling matters</h2>
      <p>
        Natural honey can vary by season, region, aroma and colour.
        Crystallisation can occur and does not automatically mean the honey is
        spoiled.
      </p>
      <h2>How to use it</h2>
      <p>
        Use honey as a food ingredient: drizzle over breakfast, add to lukewarm
        drinks, make dressings and marinades, or pair with nuts, fruit and
        yoghurt. For medical conditions, allergies, infants or therapeutic use,
        consult a qualified health professional.
      </p>
      <h2>How to store it</h2>
      <p>
        Keep the jar tightly closed in a dry place away from excess heat and
        moisture. Do not refrigerate unless you specifically want a firmer
        texture.
      </p>
      <Link className="btn" to="/blog">
        ← Back to Journal
      </Link>
    </article>
  );
}
