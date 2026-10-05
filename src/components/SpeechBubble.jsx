import { motion } from "framer-motion";
import { DotWave } from "ldrs/react";
import "ldrs/react/DotWave.css";
import { useTypewriter } from "../hooks/useTypewriter.js";

// A speech bubble above a character.
// The text types out a few letters at a time. Screen readers get the
// whole text at once, so they do not read it letter by letter.
//
// side: "left" or "right", which side of the screen the speaker is on.
// label: a small title above the text, like "Benji translates".
// showAll: true when the visitor tapped, so the rest of the text appears at once.
// hint: a small line at the bottom, like "Tap to continue".
// thinking: true while Zazo's answer is on its way. The bubble shows a
// small wave of dots (DotWave from LDRS, uiball.com/ldrs) next to his
// "mmH...", so it is clear he is still thinking.
export default function SpeechBubble({ text, side = "left", label, onDone, showAll, hint, thinking = false }) {
  const shown = useTypewriter(text, onDone, showAll);
  const finished = shown.length === text.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.96 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={`relative w-[min(80vw,24rem)] rounded-2xl border-2 border-ink/70 bg-parchment px-4 py-3 text-ink shadow-[4px_5px_0_rgba(58,38,24,0.35)] short:w-[min(44vw,20rem)] short:px-3 short:py-2 ${
        side === "left" ? "origin-bottom-left" : "origin-bottom-right"
      }`}
    >
      {label && (
        <p className={`mb-1 font-display text-xs font-semibold uppercase tracking-wider ${side === "left" ? "text-sash" : "text-mustard"}`}>{label}</p>
      )}

      <p className="sr-only" aria-live="polite">
        {text}
      </p>

      {/* data-lenis-prevent lets long text scroll inside the bubble. */}
      {thinking ? (
        <div aria-hidden="true" className="flex items-center gap-3 py-1 text-sash">
          <DotWave size={46} speed={1} color="currentColor" />
          <span className="text-base font-semibold text-ink short:text-sm">{shown}</span>
        </div>
      ) : (
        <p
          aria-hidden="true"
          data-lenis-prevent
          className="max-h-40 overflow-y-auto whitespace-pre-wrap break-words text-base font-semibold leading-snug short:max-h-24 short:text-sm"
        >
          {shown}
        </p>
      )}

      {hint && finished && (
        <p aria-hidden="true" className="mt-2 text-right text-xs font-bold text-ink-soft short:mt-1">
          {hint} ▸
        </p>
      )}

      {/* The little tail pointing down at the speaker */}
      <span
        aria-hidden="true"
        className={`absolute -bottom-[11px] h-5 w-5 rotate-45 border-b-2 border-r-2 border-ink/70 bg-parchment ${
          side === "left" ? "left-12" : "right-12"
        }`}
      />
    </motion.div>
  );
}
