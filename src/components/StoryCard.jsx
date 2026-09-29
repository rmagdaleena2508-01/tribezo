import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

// The glass card at the bottom of the screen during the story.
// It shows the caption, a dot for each step, and the Next and Skip buttons.
export default function StoryCard({ caption, step, steps, onNext, onSkip }) {
  const isLast = step === steps - 1;

  return (
    <motion.div
      key={step}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="glass rounded-3xl px-5 pb-4 pt-5 sm:px-7 short:px-4 short:pb-2.5 short:pt-3"
    >
      <p aria-live="polite" className="font-display text-xl font-medium leading-snug sm:text-2xl short:text-base">
        {caption}
      </p>

      <div className="mt-4 flex items-center justify-between gap-3 short:mt-2">
        <button
          type="button"
          onClick={onSkip}
          className="text-sm text-white/85 underline-offset-4 hover:underline"
        >
          Skip
        </button>

        {/* One dot per step. The current one is wider. */}
        <div aria-hidden="true" className="flex items-center gap-1.5">
          {Array.from({ length: steps }, (_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step ? "w-6 bg-white" : "w-1.5 bg-white/50"
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={onNext}
          autoFocus
          className="flex items-center gap-1.5 rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-ink shadow-md [text-shadow:none] hover:bg-white"
        >
          {isLast ? "Continue" : "Next"}
          <ArrowRight size={16} />
        </button>
      </div>
    </motion.div>
  );
}
