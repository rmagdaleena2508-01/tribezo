import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { hero } from "../lib/content.js";

const TITLE = "Tribezo";

// The title screen, shown after the name.
// The title first shows up backwards ("ozebirT"), then the letters slide
// into place, which shows the whole idea of the game in one second.
export default function Hero({ name, onBegin }) {
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
      <p className="mb-2 text-lg text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">Hi, {name}. Welcome to</p>

      <h1
        aria-label={TITLE}
        className="flex font-serif text-[clamp(3.5rem,14vw,9rem)] font-semibold leading-none tracking-tight text-white drop-shadow-[0_6px_24px_rgba(0,0,0,0.35)]"
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
        className="mt-4 max-w-md text-lg text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] sm:text-xl"
      >
        {hero.tagline}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 0.6 }}
        className="mt-8"
      >
        <button type="button" onClick={onBegin} autoFocus className="glass-button rounded-full px-10 py-3.5 text-lg font-medium">
          {hero.begin}
        </button>
      </motion.div>
    </div>
  );
}
