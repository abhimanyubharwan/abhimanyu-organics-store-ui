import { media, type Media } from "./media";

// The Journal, newest first. A post listed in ARTICLES (src/pages/BlogDetail.tsx)
// has its own written article; the others still show the shared introduction.

export interface Post {
  slug: string;
  title: string;
  excerpt: string;
  /**
   * A photograph, or a drawn cover for a subject we have no photograph of —
   * never a photo of a different product standing in for it.
   */
  cover: Media | "rose-honey";
  /** Publication date (YYYY-MM-DD) of a written article. */
  date?: string;
  readMinutes?: number;
}

export const POSTS: Post[] = [
  {
    slug: "gulkand-honey",
    title: "Gulkand honey: rose petals, slowly steeped in honey",
    excerpt: "What gulkand is, why it’s made with honey instead of sugar, and simple ways to enjoy a spoonful.",
    cover: "rose-honey",
    date: "2026-09-17",
    readMinutes: 3,
  },
  { slug: "raw-honey", title: "Why raw honey crystallizes", excerpt: "Raw honey changes texture naturally. Here’s why.", cover: media.jarBeri },
  { slug: "honey-processing", title: "How honey is harvested & minimally processed", excerpt: "From comb to jar without losing the story of the bloom.", cover: media.jarsRosewood },
  { slug: "bee-pollen", title: "Bee pollen: what it is & how people use it", excerpt: "A practical guide to this bee-collected product.", cover: media.jarDryFruit },
  { slug: "beekeeping", title: "Responsible beekeeping 101", excerpt: "Colonies, seasons, forage and the work behind every jar.", cover: media.jarInHand },
  { slug: "wax-processing", title: "Beeswax after honey harvest", excerpt: "How wax is cleaned, processed and reused.", cover: media.giftTrio },
  { slug: "honey-health", title: "Everyday ways to use honey", excerpt: "Tea, breakfast, marinades, dressings and simple routines.", cover: media.jarsRosewood },
  { slug: "honey-storage", title: "How to store natural honey", excerpt: "Temperature, moisture and crystallisation explained.", cover: media.acaciaBox },
  { slug: "pollination", title: "Why bees matter beyond honey", excerpt: "Pollination, biodiversity and farms.", cover: media.giftBox },
];

/** "17 September 2026", the same wherever the reader is. */
export function formatPostDate(date: string) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
