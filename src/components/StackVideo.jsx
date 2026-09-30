import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

const VIDEO = `${import.meta.env.BASE_URL}video/stack-explained.mp4`;
const POSTER = `${import.meta.env.BASE_URL}video/stack-poster.jpg`;

// "How the stack works": a 3 minute video for people learning
// DSA. It explains what a stack is, where stacks are used in real life,
// their good and bad sides, and how Tribezo's stack flips words when Benji
// and Zazo speak. The video is made by tools/make_stack_video.py, and its
// words are in tools/stack-video-script.md.
export default function StackVideo({ open, onClose }) {
  const closeButton = useRef(null);

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
            <video
              src={VIDEO}
              poster={POSTER}
              controls
              autoPlay
              playsInline
              preload="metadata"
              className="block aspect-video w-full bg-black"
            >
              Your browser cannot play this video.
            </video>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
