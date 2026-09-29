import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

// A title whose letters fall onto a stone wall in Calonis, then hop into
// English. Used for "Tribezo" on the title screen and for the heading of
// the fiction notice.
//
// 1. A stone wall grows out from the middle, where the title will sit.
// 2. The letters drop onto the wall one by one, with each word backwards,
//    the way Zazo would say it ("Tribezo" lands as "ozebirT"). Each letter
//    squashes a little when it lands, and bounces twice.
// 3. The letters hop over each other into the right order. A letter that
//    has further to go jumps higher.

const WALL_SECONDS = 0.5;
const DROP_GAP = 0.11; // time between one letter dropping and the next
const DROP_SECONDS = 1.0;
const ARRANGE_SECONDS = 0.9;

// The shape of one drop: fall, land, bounce, land, small bounce, rest.
const DROP_TIMES = [0, 0.5, 0.64, 0.78, 0.89, 1];
const DROP_EASE = ["easeIn", "easeOut", "easeIn", "easeOut", "easeIn"];

const letterCount = (text) => text.replaceAll(" ", "").length;
const arrangeAt = (text) => WALL_SECONDS + (letterCount(text) - 1) * DROP_GAP + DROP_SECONDS + 0.3;

// How many seconds the whole title takes, so the things under it can
// wait for it.
export const fallingTitleSeconds = (text) => arrangeAt(text) + ARRANGE_SECONDS;

export default function FallingTitle({ text, as: Tag = "h1", className = "" }) {
  const reduceMotion = useReducedMotion();
  const [arranged, setArranged] = useState(Boolean(reduceMotion));

  useEffect(() => {
    if (reduceMotion) return undefined;
    const timer = setTimeout(() => setArranged(true), arrangeAt(text) * 1000);
    return () => clearTimeout(timer);
  }, [reduceMotion, text]);

  // Every letter gets its own number, so the same letter twice (like the
  // two "i"s in "Fiction") still moves on its own. "home" is its place in
  // its word. "drop" is when it falls: left to right, as it first lands.
  let next = 0;
  let dropCount = 0;
  const words = text.split(" ").map((word) => {
    const letters = [...word].map((letter, home) => ({ letter, home, id: next++ }));
    const landing = [...letters].reverse();
    landing.forEach((l) => (l.drop = dropCount++));
    return { letters, landing };
  });
  const fallFrom = -Math.round(window.innerHeight * 0.75);

  return (
    <div className={`relative flex flex-col items-center font-display leading-none ${className}`}>
      <Tag aria-label={text} className="title-text relative z-10 flex flex-wrap justify-center gap-x-[0.28em] font-bold tracking-tight">
        {words.map((word, w) => (
          <span key={w} aria-hidden="true" className="flex">
            {(arranged ? word.letters : word.landing).map((l) => {
              const last = word.letters.length - 1;
              const hop = 0.18 + Math.abs(l.home - (last - l.home)) * 0.05; // in em, higher for longer trips
              const delay = WALL_SECONDS + l.drop * DROP_GAP;
              return (
                <motion.span
                  key={l.id}
                  layout={!reduceMotion}
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
                          delay,
                          duration: DROP_SECONDS,
                          times: DROP_TIMES,
                          ease: DROP_EASE,
                          opacity: { delay, duration: 0.15 },
                        }
                  }
                >
                  {l.letter}
                </motion.span>
              );
            })}
          </span>
        ))}
      </Tag>

      {/* The wall the letters land on */}
      <motion.div
        aria-hidden="true"
        className="title-wall"
        initial={reduceMotion ? false : { scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: WALL_SECONDS, ease: "easeOut" }}
      />
    </div>
  );
}
