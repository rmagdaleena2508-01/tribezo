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

// One copy of the background picture. The same picture is drawn twice:
// once behind the characters, and once in front of their feet (only the
// blurry flowers at the bottom), so they look like they stand in the scene.
function Picture({ scene, x, y, reduceMotion, front }) {
  const { src, look } = scenes[scene];
  const edge = `${Math.round(look.flowers * 100)}%`;
  const frontMask = `linear-gradient(to top, black 0%, black calc(${edge} * 0.45), transparent ${edge})`;

  return (
    <motion.div style={{ x, y }} className="absolute -inset-8">
      <AnimatePresence initial={false}>
        <motion.img
          key={scene}
          src={src}
          alt=""
          draggable="false"
          className="absolute inset-0 h-full w-full select-none object-cover"
          style={front ? { WebkitMaskImage: frontMask, maskImage: frontMask } : undefined}
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
  );
}

// The background for the current place.
// When the place changes, the new picture fades in over the old one.
// It drifts very slowly, and moves a little with the mouse for depth.
//
// Renders two layers: "back" goes behind the characters, "front" goes
// in front of them (the front flowers, film grain, and edge shading).
export default function Scene({ scene, layer }) {
  const reduceMotion = useReducedMotion();
  const { x, y } = useSceneMotion(reduceMotion);

  if (layer === "back") {
    return (
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden bg-night">
        <Picture scene={scene} x={x} y={y} reduceMotion={reduceMotion} />
      </div>
    );
  }

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <Picture scene={scene} x={x} y={y} reduceMotion={reduceMotion} front />

      {/* Film grain over the whole picture, characters included, so the
          clay characters and the voxel world share the same texture. */}
      <div className="absolute inset-0 bg-[url('/textures/grain.png')] opacity-[0.1] mix-blend-overlay" />

      {/* Soft dark edges, like a camera lens */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.35))]" />
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/35 to-transparent" />
    </div>
  );
}

// Where the mouse is, turned into a small movement for the background.
// Both layers follow the same mouse with the same spring, so they
// always move together.
function useSceneMotion(reduceMotion) {
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

  return { x, y };
}
