import { useEffect } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { scenes } from "../lib/content.js";

// The background picture for the current place.
// When the place changes, the new picture fades in over the old one.
// It drifts very slowly, and moves a little with the mouse for depth.
export default function Scene({ scene }) {
  const reduceMotion = useReducedMotion();

  // Where the mouse is, from -0.5 to 0.5. The spring makes it ease into place.
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useTransform(useSpring(rawX, { stiffness: 50, damping: 20 }), (v) => v * -24);
  const y = useTransform(useSpring(rawY, { stiffness: 50, damping: 20 }), (v) => v * -12);

  useEffect(() => {
    if (reduceMotion) return;
    const onMove = (event) => {
      rawX.set(event.clientX / window.innerWidth - 0.5);
      rawY.set(event.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduceMotion, rawX, rawY]);

  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden bg-night">
      <motion.div style={{ x, y }} className="absolute -inset-8">
        <AnimatePresence initial={false}>
          <motion.img
            key={scene}
            src={scenes[scene]}
            alt=""
            draggable="false"
            className="absolute inset-0 h-full w-full select-none object-cover"
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: reduceMotion ? 1.02 : [1.08, 1.02] }}
            exit={{ opacity: 0 }}
            transition={{
              opacity: { duration: 1.2, ease: "easeInOut" },
              scale: { duration: 24, ease: "linear" },
            }}
          />
        </AnimatePresence>
      </motion.div>

      {/* A soft shade at the top and bottom so text and buttons stay easy to read. */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/35 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/30 to-transparent" />
    </div>
  );
}
