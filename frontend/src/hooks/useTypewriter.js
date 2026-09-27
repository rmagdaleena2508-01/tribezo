import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

const TICK_MS = 40;
const LONGEST_MS = 3000; // even a long paragraph finishes in about 3 seconds

// Show text a few letters at a time, like someone speaking.
// Calls onDone once all the text is showing.
export function useTypewriter(text, onDone) {
  const reduceMotion = useReducedMotion();
  const [count, setCount] = useState(0);

  // Split into real characters, so letters like "é" or emoji are never cut in half.
  const letters = Array.from(text);

  // Keep the latest onDone without restarting the typing when it changes.
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    const total = Array.from(text).length;

    if (reduceMotion || total === 0) {
      setCount(total);
      onDoneRef.current?.();
      return;
    }

    // Short text: one letter per tick. Long text: more letters per tick.
    const perTick = Math.max(1, Math.ceil(total / (LONGEST_MS / TICK_MS)));
    let shown = 0;
    setCount(0);

    const timer = setInterval(() => {
      shown = Math.min(total, shown + perTick);
      setCount(shown);
      if (shown === total) {
        clearInterval(timer);
        onDoneRef.current?.();
      }
    }, TICK_MS);

    return () => clearInterval(timer);
  }, [text, reduceMotion]);

  return letters.slice(0, count).join("");
}
