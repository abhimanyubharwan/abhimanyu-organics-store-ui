import { Link } from "react-router-dom";
import { Returns } from "./Icons";

// The returns promise, as a gold seal beside the buy buttons.
//
// Every word here must stay true to the refund policy (src/policies.ts):
// orders can be cancelled within 5 days of delivery without giving a reason,
// but only for sealed jars in their original packaging (opened food cannot be
// returned for hygiene reasons). If the policy changes, change this too.

export default function PromiseSeal() {
  return (
    <div className="promise">
      <div className="promise-seal" aria-hidden="true">
        {/* The ring turns inside an HTML wrapper, so the curved text is not
            redrawn every frame. */}
        <span className="promise-spin">
          <svg viewBox="0 0 120 120">
            <defs>
              <path
                id="promise-ring"
                d="M60 60m-45 0a45 45 0 1 1 90 0a45 45 0 1 1-90 0"
              />
            </defs>
            <circle cx="60" cy="60" r="58" className="promise-rim" />
            <circle cx="60" cy="60" r="33" className="promise-core" />
            <text className="promise-ring-text">
              <textPath href="#promise-ring">
                ABHIMANYU ◆ OUR PROMISE ◆ EASY RETURNS ◆
              </textPath>
            </text>
          </svg>
        </span>
        <Returns className="promise-icon" />
      </div>
      <div className="promise-copy">
        <b>Easy 5-day returns · no reason needed</b>
        <span>
          Changed your mind about a sealed, unopened jar? Tell us within 5 days
          of delivery and we&rsquo;ll take it back.{" "}
          <Link to="/refund-policy">Refund policy</Link>
        </span>
      </div>
    </div>
  );
}
