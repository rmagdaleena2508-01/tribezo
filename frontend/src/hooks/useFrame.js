import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { FRAMES_PER_SECOND } from "../lib/content.js";

// A counter that goes up a set number of times each second.
// Characters use it to wobble a tiny bit on every frame, like a
// stop-motion puppet. It stays at 0 for people who ask their device
// for less motion.
export function useFrame() {
  const [frame, setFrame] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;
    const timer = setInterval(() => setFrame((f) => f + 1), 1000 / FRAMES_PER_SECOND);
    return () => clearInterval(timer);
  }, [reduceMotion]);

  return frame;
}
