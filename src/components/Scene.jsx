import { useCallback, useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { scenes } from "../lib/content.js";
import grain from "../assets/grain.png";

// How a new place arrives. The old picture stays fully visible
// underneath, and the new one dissolves in on top of it: it fades in and
// settles from a tiny zoom. (A soft blur looked nice, but it made slower
// computers and phones stutter, so it is left out.) Only
// when it is fully in does the old picture go away. So the screen never
// dims halfway, and nothing jumps.
const DISSOLVE = { duration: 1.4, ease: [0.33, 0, 0.2, 1] };

// The pictures that are on screen right now, oldest first. A new place
// adds a picture on top. When the newest one is fully in, the ones under
// it are removed. If places change quickly, each new picture simply
// dissolves in over whatever is showing, so it stays smooth.
function useLayers(scene) {
  const [layers, setLayers] = useState(() => [{ id: 0, scene, ready: true }]);
  const nextId = useRef(1);

  useEffect(() => {
    setLayers((current) => {
      if (current[current.length - 1].scene === scene) return current;
      return [...current, { id: nextId.current++, scene, ready: false }];
    });
  }, [scene]);

  // A picture only starts to dissolve in once the browser has it ready
  // to draw, so it never pops in half loaded.
  const markReady = useCallback((id) => {
    setLayers((current) => current.map((layer) => (layer.id === id ? { ...layer, ready: true } : layer)));
  }, []);

  // The newest picture is fully in: the ones under it can go.
  const settle = useCallback((id) => {
    setLayers((current) => {
      const index = current.findIndex((layer) => layer.id === id);
      return index > 0 && index === current.length - 1 ? current.slice(index) : current;
    });
  }, []);

  return { layers, markReady, settle };
}

// One copy of the background picture. The same picture is drawn twice:
// once behind the characters, and once in front of their feet (only the
// blurry flowers at the bottom), so they look like they stand in the scene.
function Picture({ scene, x, y, reduceMotion, front }) {
  const { layers, markReady, settle } = useLayers(scene);

  return (
    <motion.div style={{ x, y }} className="absolute -inset-8">
      {/* A very slow drift, shared by every picture, so a new place never
          starts with a zoom jump. */}
      <motion.div
        className="absolute inset-0"
        animate={reduceMotion ? undefined : { scale: [1.02, 1.07] }}
        transition={{ duration: 40, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" }}
      >
        {layers.map((layer, index) => {
          const { src, look } = scenes[layer.scene];
          const edge = `${Math.round(look.flowers * 100)}%`;
          const frontMask = `linear-gradient(to top, black 0%, black calc(${edge} * 0.45), transparent ${edge})`;
          const first = index === 0;
          const show = first || layer.ready;
          return (
            <motion.img
              key={layer.id}
              src={src}
              alt=""
              draggable="false"
              decoding="async"
              onLoad={(event) => {
                const done = () => markReady(layer.id);
                const image = event.currentTarget;
                if (image.decode) {
                  image.decode().then(done, done);
                } else {
                  done();
                }
              }}
              className="absolute inset-0 h-full w-full select-none object-cover will-change-[opacity,transform]"
              style={front ? { WebkitMaskImage: frontMask, maskImage: frontMask } : undefined}
              initial={first ? false : { opacity: 0, scale: 1.035 }}
              animate={show ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.035 }}
              transition={reduceMotion ? { duration: 0.6 } : DISSOLVE}
              onAnimationComplete={() => show && !first && settle(layer.id)}
            />
          );
        })}
      </motion.div>
    </motion.div>
  );
}

// The background for the current place.
// When the place changes, the new picture dissolves in over the old one.
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
      <div className="absolute inset-0 opacity-[0.1] mix-blend-overlay" style={{ backgroundImage: `url(${grain})` }} />

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
