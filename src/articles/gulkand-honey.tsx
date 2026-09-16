import { Link } from "react-router-dom";

// Journal article: /blog/gulkand-honey. Listed in src/journal.ts.
//
// Keep it to food and tradition: no claims that gulkand treats or prevents
// anything, which food businesses in India can't make without evidence.

export const lead =
  "Rose petals, a jar of honey and a little patience: gulkand is one of India’s oldest sweet preserves, and one of its loveliest.";

export default function GulkandHoney() {
  return (
    <>
      <h2>What is gulkand?</h2>
      <p>
        Gulkand is a jam-like preserve of rose petals. Its name joins two Persian words, <i>gul</i>, a flower or rose,
        and <i>qand</i>, sugar, and the method is almost as simple as the name. Fragrant petals are layered with a
        sweetener in a glass jar, left to cure slowly (traditionally in gentle sunlight) and stirred every few days.
        Over a few weeks the petals soften and darken into a thick, glossy preserve that tastes the way a rose garden
        smells.
      </p>
      <p>
        Gulkand needs scented petals, which is why makers favour fragrant roses such as the Damask rose over florist
        roses bred mainly for their looks. Pushkar, in Rajasthan, is famous for its rose fields and its gulkand.
      </p>

      <h2>Why make it with honey?</h2>
      <p>
        Most gulkand is made with sugar or mishri. Gulkand honey uses honey instead, and that changes the jar in two
        ways.
      </p>
      <ul>
        <li>
          <b>Flavour.</b> Honey brings floral notes of its own and a rounder sweetness, so the rose tastes fuller
          rather than sugary.
        </li>
        <li>
          <b>Texture.</b> Instead of a grainy, sugary set, you get a glossy preserve that coats every petal and
          loosens easily into drinks.
        </li>
      </ul>
      <p>
        Honey and sugar have both been used to preserve fruit and flowers for centuries. Either way, gulkand is still a
        sweet food, so a spoonful makes a serving.
      </p>

      <h2>A summer tradition</h2>
      <p>
        In many Indian homes the gulkand jar comes out as the weather warms up. Ayurveda describes the rose as cooling,
        and a spoonful after lunch, or stirred into a glass of chilled milk, is how generations have greeted the
        summer. Gulkand is also the sweet heart of a meetha paan, folded into the betel leaf with fennel seeds and
        coconut.
      </p>

      <h2>Ways to enjoy gulkand honey</h2>
      <ul>
        <li>
          <b>By the spoon</b> after a meal, the traditional way.
        </li>
        <li>
          <b>With curd:</b> swirl it through thick curd, or blend it into a sweet lassi.
        </li>
        <li>
          <b>On desserts:</b> spoon it over vanilla ice cream, kulfi or chilled rabri.
        </li>
        <li>
          <b>On toast,</b> spread thinly, for a quick rose-scented breakfast.
        </li>
        <li>
          <b>In homemade meetha paan</b> or as a filling for coconut ladoos.
        </li>
      </ul>

      <aside className="recipe">
        <span className="eyebrow">Two-minute recipe</span>
        <h3>Gulkand honey milk</h3>
        <p className="recipe-serves">Serves 1</p>
        <ul>
          <li>250 ml chilled milk</li>
          <li>1–2 teaspoons gulkand honey</li>
          <li>A pinch of cardamom powder (optional)</li>
          <li>A few chopped pistachios or almonds</li>
        </ul>
        <p>
          Stir the gulkand honey into the milk until it loosens, or blend for a frothy glass. Top with the nuts and
          serve cold.
        </p>
      </aside>

      <p>
        Heat dulls the rose’s perfume, so add gulkand honey to cold or lukewarm drinks and desserts rather than
        cooking with it.
      </p>

      <h2>How to store it</h2>
      <p>
        Keep the jar tightly closed in a cool, dry place away from direct sunlight, and always use a clean, dry spoon:
        moisture is what spoils a preserve. With time the petals may settle and the honey may thicken or crystallise.
        That’s natural, so just stir. Enjoy it by the best-before date on the label.
      </p>

      <h2>Good to know</h2>
      <ul>
        <li>It’s a sweet food, best enjoyed a spoonful at a time.</li>
        <li>It contains honey, so it isn’t suitable for babies under 12 months.</li>
        <li>If you’re managing diabetes or another health condition, ask your doctor about sweet foods, honey included.</li>
      </ul>

      <aside className="article-cta">
        <span className="eyebrow light">Coming soon</span>
        <h3>Our Honey Gulkand is on its way.</h3>
        <p>It isn’t available to order online yet. Ask us about availability, or explore our honey in the meantime.</p>
        <div className="actions">
          <Link className="btn gold" to="/product/gulkand">
            See Honey Gulkand
          </Link>
          <Link className="btn light" to="/shop?cat=Honey">
            Shop honey
          </Link>
        </div>
      </aside>
    </>
  );
}
