import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { asset } from "../asset";
import { media } from "../media";
import { Close, Pause, Play } from "./Icons";
import Photo from "./Photo";

const FILM = asset("assets/video/brand-story.mp4");

/**
 * The brand film: a 6.5-second silent loop of a Rosewood jar turning in the
 * hand, framed in the same royal arch as the hero photograph.
 *
 * Nothing downloads until the film plays. Underneath it sits a poster that is
 * the film's exact first frame, served like any other photo, so playback
 * starts without a jump.
 *
 * - `start="immediately"` plays at once — the visitor asked for it.
 * - `start="when-visible"` plays while the film is on screen, unless the
 *   visitor prefers reduced motion or has Save-Data on; then it waits for the
 *   play button. Once someone pauses it, scrolling never restarts it.
 */
export default function StoryFilm({
  start,
  sizes,
}: {
  start: "immediately" | "when-visible";
  /** Rendered width of the poster; see <Photo>. */
  sizes: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const pausedByVisitor = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    if (start === "immediately") {
      video.play().catch(() => {});
      return;
    }

    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (saveData || reduced || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) video.pause();
        else if (!pausedByVisitor.current) video.play().catch(() => {});
      },
      { threshold: 0.4 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [start]);

  const toggle = () => {
    const video = ref.current;
    if (!video) return;
    pausedByVisitor.current = !video.paused;
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  };

  return (
    <div className={["film", playing && "is-playing", ready && "is-ready"].filter(Boolean).join(" ")}>
      <Photo media={media.storyPoster} alt="" sizes={sizes} priority={start === "immediately"} />
      <video
        ref={ref}
        muted
        loop
        playsInline
        preload="none"
        disablePictureInPicture
        aria-label="Abhimanyu Organics brand film: a jar of Rosewood honey turning in the hand"
        onLoadedData={() => setReady(true)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      >
        <source src={FILM} type="video/mp4" />
      </video>
      <button
        type="button"
        className="film-toggle"
        onClick={toggle}
        aria-label={playing ? "Pause the film" : "Play the film"}
      >
        {playing ? <Pause /> : <Play />}
      </button>
    </div>
  );
}

/**
 * The film in a lightbox, opened by "Watch our story" on the home page.
 * A native <dialog> provides the focus trap, Escape to close and an inert
 * page behind it; the film only mounts while the dialog is open.
 */
export function StoryFilmDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="film-dialog"
      aria-labelledby="film-title"
      onClose={onClose}
      onClick={(event) => {
        // A click on the dialog element itself, not its content, is a click
        // on the dimmed backdrop.
        if (event.target === event.currentTarget) onClose();
      }}
    >
      {open && (
        <div className="film-stage">
          <button type="button" className="film-close" onClick={onClose} aria-label="Close the film">
            <Close />
          </button>
          <StoryFilm start="immediately" sizes="(max-width: 760px) 60vw, 400px" />
          <div className="film-caption">
            <span className="eyebrow light marked">Our story</span>
            <h2 id="film-title">Beekeeping first. Brand second.</h2>
            <p>
              Our hives travel with the bloom. Nothing is heated, nothing is
              blended, nothing is hurried.
            </p>
            <Link className="link-more" to="/our-story" onClick={onClose}>
              Read our story <span>→</span>
            </Link>
          </div>
        </div>
      )}
    </dialog>
  );
}
