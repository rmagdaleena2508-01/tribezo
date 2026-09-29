import { motion, useReducedMotion } from "framer-motion";
import { disclaimer } from "../lib/content.js";
import FallingTitle, { fallingTitleSeconds } from "./FallingTitle.jsx";
import GlassButton from "./GlassButton.jsx";

const TEXT_AT = fallingTitleSeconds(disclaimer.title);

// The fiction notice, shown after the story and before Benji asks for
// your name. The heading falls onto a wall in Calonis and hops into
// English, the same way as the Tribezo title.
export default function Disclaimer({ onDone }) {
  const reduceMotion = useReducedMotion();
  const later = (seconds) => ({ delay: reduceMotion ? 0 : seconds, duration: 0.6 });

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center overflow-y-auto px-4 py-6" data-lenis-prevent>
      <section
        aria-labelledby="disclaimer-title"
        className="glass w-full max-w-2xl rounded-[32px] bg-black/30 px-6 pb-7 pt-8 text-center sm:px-10 short:py-4"
      >
        <div id="disclaimer-title">
          <FallingTitle text={disclaimer.title} as="h2" className="text-[clamp(2.2rem,6.5vw,4rem)] short:text-[clamp(1.8rem,9vh,2.6rem)]" />
        </div>

        {disclaimer.paragraphs.map((paragraph, i) => (
          <motion.p
            key={paragraph}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={later(TEXT_AT + i * 0.25)}
            className={`mx-auto max-w-xl text-base font-semibold leading-relaxed text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.45)] short:text-sm ${i === 0 ? "mt-6 short:mt-3" : "mt-3 short:mt-1.5"}`}
          >
            {paragraph}
          </motion.p>
        ))}

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={later(TEXT_AT + disclaimer.paragraphs.length * 0.25 + 0.2)}
          className="mt-7 short:mt-3"
        >
          <GlassButton onClick={onDone} autoFocus className="mx-auto rounded-full px-10 py-3 font-display text-lg font-semibold short:py-2">
            {disclaimer.button}
          </GlassButton>
        </motion.div>
      </section>
    </div>
  );
}
