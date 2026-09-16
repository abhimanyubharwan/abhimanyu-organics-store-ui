import { Link, useParams } from "react-router-dom";
import Photo from "../components/Photo";
import { media } from "../media";

export default function BlogDetail() {
  const { slug = "" } = useParams();

  return (
    <article className="article shell">
      <span className="eyebrow">Abhimanyu Organics Journal</span>
      <h1>{slug.replaceAll("-", " ")}</h1>
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
