// Inline SVG so the icon set inherits currentColor and costs no extra request.
// Replaces the text glyphs (♙ ☎ ◉ ◌ ⊘ ⚗ ▣) the markup used before.

type P = { className?: string };

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function BeeMark({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 40 40" aria-hidden="true">
      <path
        d="M20 3.2 34.5 11.6v16.8L20 36.8 5.5 28.4V11.6z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        opacity=".55"
      />
      <ellipse cx="20" cy="22" rx="5.2" ry="7" fill="currentColor" />
      <path d="M15.2 19h9.6M15 23h10M16 27h8" stroke="#0b2413" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="20" cy="13.4" r="2.9" fill="currentColor" />
      <path d="M18.6 10.8 17 8.2M21.4 10.8 23 8.2" {...stroke} strokeWidth="1.3" />
      <path
        d="M14.6 17.2c-3.4-2.6-6.4-2.4-7.2-.5-.8 2 1.4 4.4 5 4.8M25.4 17.2c3.4-2.6 6.4-2.4 7.2-.5.8 2-1.4 4.4-5 4.8"
        {...stroke}
        strokeWidth="1.3"
        opacity=".85"
      />
    </svg>
  );
}

export function Bee({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 32 24" aria-hidden="true">
      <ellipse cx="17" cy="14" rx="7" ry="5" fill="currentColor" />
      <path d="M13 11.5h8M12.5 14.5h9M14 17.5h6" stroke="#0b2413" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="8.5" cy="13" r="3.2" fill="currentColor" />
      <path d="M7 10.2 5.4 7.8M10 10 11.4 7.6" {...stroke} strokeWidth="1.2" />
      <ellipse cx="16" cy="6.5" rx="6" ry="3.4" fill="currentColor" opacity=".45" transform="rotate(-18 16 6.5)" />
      <ellipse cx="21" cy="7.5" rx="5" ry="2.8" fill="currentColor" opacity=".3" transform="rotate(16 21 7.5)" />
    </svg>
  );
}

export function Heart({ className, filled }: P & { filled?: boolean }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 20.4 4.6 13.2a4.6 4.6 0 0 1 6.5-6.5l.9.9.9-.9a4.6 4.6 0 0 1 6.5 6.5z"
        {...stroke}
        fill={filled ? "currentColor" : "none"}
      />
    </svg>
  );
}

export function User({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8.2" r="3.7" {...stroke} />
      <path d="M4.8 20c.7-3.9 3.6-6 7.2-6s6.5 2.1 7.2 6" {...stroke} />
    </svg>
  );
}

export function Cart({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 4h2.2l2.2 10.4h9.9L19.5 7H6.2" {...stroke} />
      <circle cx="9.2" cy="19" r="1.5" {...stroke} />
      <circle cx="16.6" cy="19" r="1.5" {...stroke} />
    </svg>
  );
}

export function Menu({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h11" {...stroke} strokeWidth="1.8" />
    </svg>
  );
}

export function Hive({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true">
      <path d="M16 3.5 27 10v12L16 28.5 5 22V10z" {...stroke} />
      <path d="M16 11.5 21.5 15v6L16 24.5 10.5 21v-6z" {...stroke} opacity=".55" />
    </svg>
  );
}

export function Drop({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true">
      <path d="M16 4c5 6.2 8 10.3 8 13.6a8 8 0 0 1-16 0C8 14.3 11 10.2 16 4z" {...stroke} />
      <path d="M12.6 18.4a3.6 3.6 0 0 0 3.4 3.6" {...stroke} opacity=".6" />
    </svg>
  );
}

export function NoSugar({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="16" cy="16" r="11" {...stroke} />
      <path d="M8.5 8.5 23.5 23.5" {...stroke} />
      <path d="M12.5 14.5h7v5h-7z" {...stroke} opacity=".6" />
    </svg>
  );
}

export function Flask({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true">
      <path d="M13 4h6M14.5 4v8.2L8.4 24a2.6 2.6 0 0 0 2.3 4h10.6a2.6 2.6 0 0 0 2.3-4l-6.1-11.8V4" {...stroke} />
      <path d="M10.8 20h10.4" {...stroke} opacity=".6" />
    </svg>
  );
}

export function Truck({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true">
      <path d="M3 8h13v13H3zM16 12h5.6l3.8 4.2V21H16z" {...stroke} />
      <circle cx="9.5" cy="24" r="2.2" {...stroke} />
      <circle cx="21.5" cy="24" r="2.2" {...stroke} />
    </svg>
  );
}

export function Leaf({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true">
      <path d="M26 6c0 11-6.4 17-13.4 17A6.6 6.6 0 0 1 6 16.4C6 9.6 13.6 6 26 6z" {...stroke} />
      <path d="M22 10 8 26" {...stroke} opacity=".6" />
    </svg>
  );
}

export function Jar({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true">
      <path d="M11 4h10v3.4l2.4 2.8V26a2 2 0 0 1-2 2h-10.8a2 2 0 0 1-2-2V10.2L11 7.4z" {...stroke} />
      <path d="M8.6 15h14.8" {...stroke} opacity=".6" />
    </svg>
  );
}

export function Gift({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true">
      <path d="M5 13h22v14H5zM3.5 8.5h25V13h-25zM16 8.5V27" {...stroke} />
      <path d="M16 8.5c-3.6 0-6.4-.8-6.4-3S13.6 3.2 16 8.5zM16 8.5c3.6 0 6.4-.8 6.4-3S18.4 3.2 16 8.5z" {...stroke} />
    </svg>
  );
}

export function Arrow({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 20 20" width="15" height="15" aria-hidden="true">
      <path d="M3.5 10h13M11.5 5l5 5-5 5" {...stroke} />
    </svg>
  );
}

export function Play({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 20 20" width="15" height="15" aria-hidden="true">
      <path d="M6.5 4.2v11.6a.6.6 0 0 0 .9.5l9.1-5.8a.6.6 0 0 0 0-1L7.4 3.7a.6.6 0 0 0-.9.5z" fill="currentColor" />
    </svg>
  );
}

export function Pause({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 20 20" width="15" height="15" aria-hidden="true">
      <rect x="5" y="4" width="3.4" height="12" rx="1" fill="currentColor" />
      <rect x="11.6" y="4" width="3.4" height="12" rx="1" fill="currentColor" />
    </svg>
  );
}

export function Close({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
      <path d="M5 5l10 10M15 5 5 15" {...stroke} strokeWidth="1.8" />
    </svg>
  );
}
