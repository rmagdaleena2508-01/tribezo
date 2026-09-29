import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { hero } from "../lib/content.js";
import GlassButton from "./GlassButton.jsx";

const TITLE = "Tribezo";
const LAST = TITLE.length - 1;

// How the title arrives.
// 1. A stone wall slides in where the title will sit.
// 2. The letters drop onto the wall one by one, backwards ("ozebirT").
//    Each one squashes a little when it lands, and bounces twice.
// 3. The letters hop over each other into the right order ("Tribezo").
//    A letter that has further to go jumps higher.
// That shows the whole idea of the game in a few seconds.
const WALL_SECONDS = 0.5;
const DROP_GAP = 0.11; // time between one letter dropping and the next
const DROP_SECONDS = 1.0;
const ARRANGE_AT = WALL_SECONDS + LAST * DROP_GAP + DROP_SECONDS + 0.3;
const ARRANGE_SECONDS = 0.9;
const TEXT_AT = ARRANGE_AT + ARRANGE_SECONDS; // the tagline and button come in after

// The shape of one drop: fall, land, bounce, land, small bounce, rest.
const DROP_TIMES = [0, 0.5, 0.64, 0.78, 0.89, 1];
const DROP_EASE = ["easeIn", "easeOut", "easeIn", "easeOut", "easeIn"];

export default function Hero({ onBegin }) {
  const reduceMotion = useReducedMotion();
  const [arranged, setArranged] = useState(Boolean(reduceMotion));

  useEffect(() => {
    if (reduceMotion) return undefined;
    const timer = setTimeout(() => setArranged(true), ARRANGE_AT * 1000);
    return () => clearTimeout(timer);
  }, [reduceMotion]);

  // Every letter in "Tribezo" is different, so each letter can be its own key.
  // framer-motion's "layout" moves each letter to its new spot.
  const letters = arranged ? [...TITLE] : [...TITLE].reverse();
  const fallFrom = -Math.round(window.innerHeight * 0.75);

  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-6 text-center">
      <div className="relative flex flex-col items-center font-display text-[clamp(3.5rem,14vw,9rem)] leading-none short:text-[clamp(3rem,18vh,6rem)]">
        <h1
          aria-label={TITLE}
          className="title-text relative z-10 flex font-bold tracking-tight"
        >
          {letters.map((letter) => {
            const home = TITLE.indexOf(letter); // its place in "Tribezo"
            const dropOrder = LAST - home; // backwards, so "o" drops first
            const hop = 0.18 + Math.abs(home - (LAST - home)) * 0.05; // in em, higher for longer trips

            return (
              <motion.span
                key={letter}
                layout={!reduceMotion}
                aria-hidden="true"
                className="inline-block origin-bottom"
                initial={reduceMotion ? false : { y: fallFrom, opacity: 0 }}
                animate={
                  arranged
                    ? { y: ["0em", `-${hop}em`, "0em"], scaleY: [1, 1.04, 0.9, 1], scaleX: [1, 0.97, 1.06, 1], opacity: 1 }
                    : {
                        y: [fallFrom, 0, -34, 0, -10, 0],
                        scaleY: [1.12, 1.12, 0.94, 1, 0.98, 1],
                        scaleX: [0.9, 0.9, 1.05, 1, 1.01, 1],
                        opacity: 1,
                      }
                }
                transition={
                  arranged
                    ? {
                        layout: { type: "spring", stiffness: 140, damping: 18 },
                        y: { duration: ARRANGE_SECONDS * 0.8, ease: ["easeOut", "easeIn"], times: [0, 0.45, 1] },
                        scaleY: { duration: ARRANGE_SECONDS, times: [0, 0.3, 0.8, 1] },
                        scaleX: { duration: ARRANGE_SECONDS, times: [0, 0.3, 0.8, 1] },
                      }
                    : {
                        delay: WALL_SECONDS + dropOrder * DROP_GAP,
                        duration: DROP_SECONDS,
                        times: DROP_TIMES,
                        ease: DROP_EASE,
                        opacity: { delay: WALL_SECONDS + dropOrder * DROP_GAP, duration: 0.15 },
                      }
                }
              >
                {letter}
              </motion.span>
            );
          })}
        </h1>

        {/* The wall the letters land on */}
        <motion.div
          aria-hidden="true"
          className="title-wall"
          initial={reduceMotion ? false : { scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: WALL_SECONDS, ease: "easeOut" }}
        />
      </div>

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
