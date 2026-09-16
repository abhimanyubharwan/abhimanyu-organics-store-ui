import type { Post } from "../journal";
import Photo from "./Photo";
import RoseHoneyArt from "./RoseHoneyArt";

/** A Journal post's cover: its photograph, or its drawn cover. Decorative either way. */
export default function JournalCover({ cover, sizes, priority }: { cover: Post["cover"]; sizes: string; priority?: boolean }) {
  if (cover === "rose-honey") return <RoseHoneyArt className="journal-art" />;
  return <Photo media={cover} alt="" sizes={sizes} priority={priority} />;
}
