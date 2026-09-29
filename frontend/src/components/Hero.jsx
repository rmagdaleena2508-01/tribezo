import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { hero } from "../lib/content.js";
import GlassButton from "./GlassButton.jsx";

const TITLE = "Tribezo";

// The first screen: the Tribezo title.
// The title first shows up backwards ("ozebirT"), then the letters slide
// into place, which shows the whole idea of the game in one second.
export default function Hero({ onBegin }) {
  const reduceMotion = useReducedMotion();
  const [flipped, setFlipped] = useState(!reduceMotion);

  useEffect(() => {
    const timer = setTimeout(() => setFlipped(false), 1100);
    return () => clearTimeout(timer);
  }, []);

  // Every letter in "Tribezo" is different, so each letter can be its own key.
  // framer-motion's "layout" slides each letter to its new spot.
  const letters = flipped ? [...TITLE].reverse() : [...TITLE];

  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-6 text-center">
      <h1
        aria-label={TITLE}
        className="title-text flex font-display text-[clamp(3.5rem,14vw,9rem)] font-bold leading-none tracking-tight short:text-[clamp(3rem,18vh,6rem)]"
      >
        {letters.map((letter) => (
          <motion.span key={letter} layout aria-hidden="true" transition={{ type: "spring", stiffness: 260, damping: 22 }}>
            {letter}
          </motion.span>
        ))}
      </h1>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6, duration: 0.6 }}
        className="title-text mt-4 max-w-md font-display text-lg font-medium sm:text-xl short:mt-2 short:text-base"
      >
        {hero.tagline}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 0.6 }}
        className="mt-8 short:mt-4"
      >
        <GlassButton onClick={onBegin} autoFocus className="rounded-full px-10 py-3.5 font-display text-lg font-semibold short:py-2.5">
          {hero.begin}
        </GlassButton>
      </motion.div>
    </div>
  );
}
