import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LoaderCircle, X } from "lucide-react";
import { setDucked } from "../lib/music.js";

const VIDEO = `${import.meta.env.BASE_URL}video/stack-explained.mp4`;
const POSTER = `${import.meta.env.BASE_URL}video/stack-poster.jpg`;

// "How the stack works": a 4 minute class for people learning DSA. It
// explains what a data structure is, what a stack is, where stacks are used
// in algorithms and everyday apps, and how Tribezo's stack flips words when
// Benji and Zazo speak, using real screens from the game. The video is made
// by tools/make_stack_video.py, and its words are in
// tools/stack-video-script.md.
//
// For smooth playing:
// - The video file keeps its index at the start ("fast start"), so it plays
//   while it is still downloading.
// - Once the game is on screen, the browser quietly loads the start of the
//   video, so it begins at once when the button is pressed.
// - While the video waits for more data, a small spinner shows, so it never
//   looks stuck.
// Warm up the start of the video before it is needed. Only the first part
// is fetched (preload="metadata" style), so it costs very little.
export function useWarmStackVideo(ready) {
  useEffect(() => {
    if (!ready) return undefined;
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.src = VIDEO;
    return () => {
      video.removeAttribute("src");
      video.load();
    };
  }, [ready]);
}

export default function StackVideo({ open, onClose }) {
  const closeButton = useRef(null);
  const [waiting, setWaiting] = useState(true);

  // The music and birds fade down while the video is open.
  useEffect(() => {
    if (!open) return undefined;
    setDucked(true);
    return () => setDucked(false);
  }, [open]);

  // Close with the Escape key, and move focus into the window when it opens.
  useEffect(() => {
    if (!open) return undefined;
    closeButton.current?.focus();
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="video"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={(event) => {
            event.stopPropagation(); // a click here only closes the video, it does not move the talk along
            onClose();
          }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="video-title"
            initial={{ scale: 0.96, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, y: 10 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-4xl overflow-hidden rounded-3xl border border-parchment/15 bg-night/95 shadow-2xl short:max-w-[min(56rem,calc((100svh-5rem)*16/9))]"
          >
            <div className="flex items-center justify-between px-5 py-3 short:py-1.5">
              <h2 id="video-title" className="font-display text-xl font-semibold short:text-base">
                How the stack works
              </h2>
              <button
                ref={closeButton}
                type="button"
                onClick={onClose}
                aria-label="Close the video"
                className="grid h-10 w-10 place-items-center rounded-full text-parchment/70 hover:bg-parchment/10 hover:text-parchment"
              >
                <X size={20} />
              </button>
            </div>
            <div className="relative">
              <video
                poster={POSTER}
                controls
                autoPlay
                playsInline
                preload="auto"
                onLoadStart={() => setWaiting(true)}
                onWaiting={() => setWaiting(true)}
                onPlaying={() => setWaiting(false)}
                onCanPlay={() => setWaiting(false)}
                className="block aspect-video w-full bg-black"
              >
                <source src={VIDEO} type="video/mp4" />
                Your browser cannot play this video.
              </video>
              {waiting && (
                <div aria-hidden="true" className="pointer-events-none absolute inset-0 grid place-items-center">
                  <LoaderCircle size={44} className="animate-spin text-parchment/90 drop-shadow" />
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
