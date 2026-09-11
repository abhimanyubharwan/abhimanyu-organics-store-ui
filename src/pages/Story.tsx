import { asset } from "../asset";

export default function Story() {
  return (
    <>
      <section className="page-hero story-hero">
        <span>Our Story</span>
        <h1>Beekeeping first. Brand second.</h1>
        <p>
          From generations around farms and bee boxes to a modern
          natural-products brand.
        </p>
      </section>
      <section className="section shell story-editorial">
        <img src={asset("assets/images/farm-reference.jpg")} alt="" />
        <div>
          <span className="eyebrow">Why we do it</span>
          <h2>Pure products, better farms, healthier tomorrow.</h2>
          <p>
            We work close to source, keep processing thoughtful and celebrate the
            people behind every harvest.
          </p>
          <div className="timeline">
            <b>
              01 <small>Floral season</small>
            </b>
            <b>
              02 <small>Bee migration &amp; nectar flow</small>
            </b>
            <b>
              03 <small>Harvest &amp; testing</small>
            </b>
            <b>
              04 <small>Minimal processing</small>
            </b>
            <b>
              05 <small>Packing &amp; dispatch</small>
            </b>
          </div>
        </div>
      </section>
    </>
  );
}
