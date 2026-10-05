import { motion, useReducedMotion } from "framer-motion";
import { hero } from "../lib/content.js";
import FallingTitle, { fallingTitleSeconds } from "./FallingTitle.jsx";
import GlassButton from "./GlassButton.jsx";

const TITLE = "Tribezo";
const TEXT_AT = fallingTitleSeconds(TITLE); // the tagline and button come in after the title

// The first screen: the Tribezo title falls onto a wall as "ozebirT", then
// hops into "Tribezo" (see FallingTitle.jsx). That shows the whole idea of
// the game in a few seconds.

export default function Hero({ onBegin }) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-6 text-center">
      <FallingTitle text={TITLE} className="text-[clamp(3.5rem,14vw,9rem)] short:text-[clamp(3rem,18vh,6rem)]" />

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: reduceMotion ? 0 : TEXT_AT, duration: 0.6 }}
        className="title-text mt-4 max-w-md font-display text-lg font-medium sm:text-xl short:mt-2 short:text-base"
      >
        {hero.tagline}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: reduceMotion ? 0 : TEXT_AT + 0.4, duration: 0.6 }}
        className="mt-8 short:mt-4"
      >
        <GlassButton onClick={onBegin} autoFocus className="rounded-full px-10 py-3.5 font-display text-lg font-semibold short:py-2.5">
          {hero.begin}
        </GlassButton>
      </motion.div>
    </div>
  );
}
