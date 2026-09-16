import { useId } from "react";

// A drawn cover for the Gulkand honey article — a rose of layered petals with
// drops of honey, in the site's royal green and gold — because there is no
// photograph of gulkand yet (see `cover` in src/journal.ts). Decorative, like
// the photos' empty alt text, so hidden from screen readers.

const PETAL = "M0 0C-92-30-118-168-46-222C-18-242 18-242 46-222C118-168 92-30 0 0Z";
const DROP = "M0-60C18-30 34-8 34 14A34 34 0 0 1-34 14C-34-8-18-30 0-60Z";

// Outermost first: [petals, scale, rotation offset, gradient, edge colour]
const RINGS: [number, number, number, string, string][] = [
  [8, 1, 0, "outer", "rgba(217,184,112,.55)"],
  [8, 0.74, 22.5, "mid", "rgba(217,184,112,.6)"],
  [6, 0.5, 10, "inner", "rgba(233,205,140,.65)"],
  [5, 0.3, 40, "mid", "rgba(233,205,140,.7)"],
];

// Petals that have fallen away: [x, y, rotation, scale, opacity]
const LOOSE: [number, number, number, number, number][] = [
  [250, 250, -35, 0.38, 0.9],
  [975, 215, 40, 0.33, 0.9],
  [1010, 690, 150, 0.42, 0.9],
  [215, 700, -140, 0.36, 0.8],
  [140, 470, -80, 0.26, 0.6],
  [1080, 450, 95, 0.24, 0.6],
];

// [x, y, scale]
const DROPS: [number, number, number][] = [
  [812, 222, 0.62],
  [372, 700, 0.5],
  [905, 610, 0.38],
];

const PETAL_SHADES: Record<string, [string, string, string]> = {
  outer: ["#5e0f28", "#9c2a48", "#d4677e"],
  mid: ["#6d1530", "#b43d5a", "#e98ea0"],
  inner: ["#7a1a36", "#c9546f", "#f4b3bf"],
};

export default function RoseHoneyArt({ className }: { className?: string }) {
  // Ids must be unique on the page. useId matches between the home page's
  // pre-render and hydration, but its punctuation isn't safe inside url(#…).
  const id = `rh${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const url = (name: string) => `url(#${id}-${name})`;

  return (
    <svg className={className} viewBox="0 0 1200 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <defs>
        {/* Drawn once and reused by every petal, which keeps the markup small. */}
        <path id={`${id}-petal`} d={PETAL} />
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#16392a" />
          <stop offset=".55" stopColor="#0e2a1c" />
          <stop offset="1" stopColor="#0a2016" />
        </linearGradient>
        <radialGradient id={`${id}-glow`}>
          <stop offset="0" stopColor="#f2bc4b" stopOpacity=".42" />
          <stop offset=".6" stopColor="#e3a22a" stopOpacity=".1" />
          <stop offset="1" stopColor="#e3a22a" stopOpacity="0" />
        </radialGradient>
        <pattern id={`${id}-comb`} width="76.2" height="132" patternUnits="userSpaceOnUse">
          <path
            d="M38.1-44 76.2-22v44L38.1 44 0 22v-44zM38.1 88l38.1 22v44l-38.1 22L0 154v-44zM0 22l38.1 22v44L0 110l-38.1-22V44zM76.2 22l38.1 22v44l-38.1 22-38.1-22V44z"
            fill="none"
            stroke="#d9b870"
            strokeWidth="1.2"
          />
        </pattern>
        <radialGradient id={`${id}-comb-fade`} r=".62">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset=".45" stopColor="#fff" stopOpacity=".55" />
          <stop offset="1" stopColor="#fff" stopOpacity=".1" />
        </radialGradient>
        <mask id={`${id}-comb-mask`}>
          <rect width="1200" height="900" fill={url("comb-fade")} />
        </mask>
        {Object.entries(PETAL_SHADES).map(([name, [base, middle, tip]]) => (
          <radialGradient key={name} id={`${id}-${name}`} cx="0" cy="0" r="240" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor={base} />
            <stop offset=".58" stopColor={middle} />
            <stop offset="1" stopColor={tip} />
          </radialGradient>
        ))}
        <linearGradient id={`${id}-loose`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#8e2342" />
          <stop offset="1" stopColor="#e58b9d" />
        </linearGradient>
        <linearGradient id={`${id}-honey`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fce3a2" />
          <stop offset=".45" stopColor="#f1bb4d" />
          <stop offset="1" stopColor="#b8751a" />
        </linearGradient>
        <linearGradient id={`${id}-gold`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f6dc9a" />
          <stop offset=".5" stopColor="#d9b870" />
          <stop offset="1" stopColor="#b8893a" />
        </linearGradient>
      </defs>

      <rect width="1200" height="900" fill={url("bg")} />
      <rect width="1200" height="900" fill={url("comb")} opacity=".16" mask={url("comb-mask")} />
      <ellipse cx="600" cy="450" rx="520" ry="420" fill={url("glow")} />
      <circle cx="600" cy="450" r="330" fill="none" stroke={url("gold")} strokeWidth="1.5" opacity=".55" />
      <circle cx="600" cy="450" r="352" fill="none" stroke={url("gold")} strokeDasharray="2 10" strokeLinecap="round" opacity=".6" />

      {LOOSE.map(([x, y, rotate, scale, opacity], i) => (
        <use
          key={i}
          href={`#${id}-petal`}
          transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`}
          fill={url("loose")}
          stroke="rgba(217,184,112,.5)"
          strokeWidth={1.6 / scale}
          opacity={opacity}
        />
      ))}

      <g transform="translate(600 450)">
        {RINGS.map(([count, scale, offset, shade, edge]) => (
          <g key={scale} fill={url(shade)} stroke={edge} strokeWidth={2 / scale}>
            {Array.from({ length: count }, (_, i) => (
              <use key={i} href={`#${id}-petal`} transform={`rotate(${offset + (360 / count) * i}) scale(${scale})`} />
            ))}
          </g>
        ))}
        <circle r="30" fill="#5e0f28" />
        <path d="M0-4C10-6 14 6 6 12-4 20-20 10-18-4-16-20 4-28 18-20" fill="none" stroke={url("gold")} strokeWidth="3" strokeLinecap="round" />
      </g>

      {DROPS.map(([x, y, scale], i) => (
        <g key={i} transform={`translate(${x} ${y}) scale(${scale})`}>
          <path d={DROP} fill={url("honey")} />
          <path d="M-14 6C-16-6-10-18-4-26" fill="none" stroke="rgba(255,255,255,.7)" strokeWidth="5" strokeLinecap="round" />
        </g>
      ))}
    </svg>
  );
}
