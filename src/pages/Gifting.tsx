import { Link } from "react-router-dom";
import Photo from "../components/Photo";
import { media } from "../media";

export default function Gifting() {
  return (
    <>
      <section className="page-hero gift-hero">
        <span className="eyebrow marked">Premium Gifting</span>
        <h1>Nature, beautifully packed.</h1>
        <p>
          Curated honey boxes for festivals, weddings, teams, clients and
          meaningful moments.
        </p>
      </section>
      <section className="section shell gifting-grid">
        <Photo media={media.giftTrio} alt="A three-jar Abhimanyu Organics gift box" sizes="(max-width: 980px) 92vw, 580px" />
        <div>
          <span className="eyebrow">Build a memorable box</span>
          <h2>Choose honey. Add a note. Make it yours.</h2>
          <p>
            Mini honey flights, premium jars, bee pollen, honey gulkand and
            bespoke sleeves can all be configured for bulk and personal gifting.
          </p>
          <Link className="btn" to="/bulk">
            Corporate gifting enquiry →
          </Link>
        </div>
      </section>
    </>
  );
}
