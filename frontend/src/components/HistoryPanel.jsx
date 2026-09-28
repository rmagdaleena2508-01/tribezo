import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

// A side panel that lists everything said so far:
// the English, the XYZ, and how much work the stack did.
export default function HistoryPanel({ open, onClose, entries }) {
  const closeButton = useRef(null);

  // Close with the Escape key, and move focus into the panel when it opens.
  useEffect(() => {
    if (!open) return;
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
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40"
          />
          <motion.aside
            key="panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="history-title"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-parchment/10 bg-night/95 backdrop-blur-md"
          >
            <div className="flex items-center justify-between border-b border-parchment/10 px-5 py-4">
              <h2 id="history-title" className="font-display text-2xl font-semibold">
                What was said
              </h2>
              <button
                ref={closeButton}
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="grid h-10 w-10 place-items-center rounded-full text-parchment/70 hover:bg-parchment/10 hover:text-parchment"
              >
                <X size={20} />
              </button>
            </div>

            <div data-lenis-prevent className="flex-1 overflow-y-auto px-5 py-4">
              {entries.length === 0 ? (
                <p className="text-parchment/60">Nothing yet. Say something to Zazo!</p>
              ) : (
                <ol className="space-y-4">
                  {entries.map((entry) => (
                    <li key={entry.id} className="rounded-xl border border-parchment/10 bg-parchment/[0.04] p-4">
                      <p className="text-xs uppercase tracking-widest text-parchment/50">You said</p>
                      <p className="mb-3 whitespace-pre-wrap break-words">{entry.english}</p>
                      <p className="text-xs uppercase tracking-widest text-ember/80">Benji told Zazo</p>
                      <p className="whitespace-pre-wrap break-words">{entry.xyz}</p>
                      <p className="mb-3 font-mono text-xs text-parchment/50">
                        stack: {entry.pushes} pushes · {entry.pops} pops
                      </p>
                      <p className="text-xs uppercase tracking-widest text-ember/80">Zazo said</p>
                      <p className="mb-3 whitespace-pre-wrap break-words">{entry.replyXyz}</p>
                      <p className="text-xs uppercase tracking-widest text-parchment/50">Which means</p>
                      <p className="whitespace-pre-wrap break-words">{entry.reply}</p>
                      {/* Shows whether Gemini wrote the answer, or Zazo used a fixed one. */}
                      <p className="mt-2 font-mono text-[11px] text-parchment/40">
                        {entry.source === "ai" ? "answer by Gemini" : "fixed answer (AI not available)"}
                      </p>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
