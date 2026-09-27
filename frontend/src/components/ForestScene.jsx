import { useEffect } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { scenes } from "../lib/content.js";

// Makes the same "random" numbers every time, so the forest never
// changes shape when the page reloads.
function seededRandom(seed) {
  let value = seed;
  const next = () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
  // The first couple of numbers from a small seed are always tiny,
  // so skip them.
  next();
  next();
  return next;
}

// Build a row of trees: a trunk and a few round clumps of leaves each.
function makeTrees(seed, count, baseY, minHeight, maxHeight) {
  const random = seededRandom(seed);
  return Array.from({ length: count }, (_, i) => {
    const x = (i + random() * 0.8) * (1600 / count);
    const height = minHeight + random() * (maxHeight - minHeight);
    const width = 40 + random() * 60;
    const clumps = Array.from({ length: 4 }, () => ({
      dx: (random() - 0.5) * width * 1.4,
      dy: random() * height * 0.35,
      r: width * (0.55 + random() * 0.4),
    }));
    return { x, top: baseY - height, width, clumps };
  });
}

const FAR_TREES = makeTrees(7, 14, 620, 260, 420);
const NEAR_TREES = makeTrees(42, 8, 700, 330, 520);

const FIREFLIES = Array.from({ length: 14 }, (_, i) => {
  const random = seededRandom(100 + i);
  return { left: random() * 100, top: 35 + random() * 45, delay: random() * 6, size: 3 + random() * 3 };
});

// Move in 6 small jumps instead of smoothly, for a stop-motion feel.
const stepEase = (t) => Math.floor(t * 6) / 6;

function TreeRow({ trees, trunk, leaves }) {
  return (
    <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full">
      {trees.map((tree, i) => (
        <g key={i}>
          <rect x={tree.x - tree.width * 0.12} y={tree.top} width={tree.width * 0.24} height={900 - tree.top} fill={trunk} />
          {tree.clumps.map((clump, j) => (
            <circle key={j} cx={tree.x + clump.dx} cy={tree.top + clump.dy} r={clump.r} fill={leaves} />
          ))}
        </g>
      ))}
    </svg>
  );
}

// One background layer that drifts a little with the mouse.
// "depth" is how many pixels it can move. Front layers use bigger numbers.
function Layer({ x, y, depth, children }) {
  const moveX = useTransform(x, (value) => value * depth);
  const moveY = useTransform(y, (value) => value * depth * 0.4);
  return (
    <motion.div style={{ x: moveX, y: moveY }} className="absolute -inset-10">
      {children}
    </motion.div>
  );
}

// The forest behind the characters.
// If the scene has picture layers in content.js, those are used.
// If not, a forest is drawn instead.
export default function ForestScene({ scene = "forest-entry" }) {
  const reduceMotion = useReducedMotion();

  // Where the mouse is, from -0.5 (left or top) to 0.5 (right or bottom).
  // The spring makes the layers ease into place instead of jumping.
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 60, damping: 20 });
  const y = useSpring(rawY, { stiffness: 60, damping: 20 });

  useEffect(() => {
    if (reduceMotion) return;
    const onMove = (event) => {
      rawX.set(event.clientX / window.innerWidth - 0.5);
      rawY.set(event.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduceMotion, rawX, rawY]);

  const layers = scenes[scene]?.layers ?? [];

  if (layers.length > 0) {
    return (
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden bg-night">
        {layers.map((layer) => (
          <Layer key={layer.src} x={x} y={y} depth={layer.depth}>
            <img src={layer.src} alt="" draggable="false" className="h-full w-full select-none object-cover" />
          </Layer>
        ))}
      </div>
    );
  }

  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden bg-night">
      {/* Sky with soft light coming through the treetops */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#29473a] via-[#1d3326] to-[#0f1a14]" />
      <div className="absolute left-1/2 top-[-20%] h-[70%] w-[90%] -translate-x-1/2 rounded-full bg-[#e9d9a0] opacity-[0.12] blur-3xl" />

      <Layer x={x} y={y} depth={8}>
        <TreeRow trees={FAR_TREES} trunk="#1b3024" leaves="#22402e" />
      </Layer>

      {/* Beams of light */}
      <div className="absolute inset-0 opacity-[0.07]">
        {[18, 42, 66].map((left) => (
          <div
            key={left}
            className="absolute top-0 h-[80%] w-24 origin-top rotate-[18deg] bg-gradient-to-b from-[#fff5cc] to-transparent"
            style={{ left: `${left}%` }}
          />
        ))}
      </div>

      <Layer x={x} y={y} depth={18}>
        <TreeRow trees={NEAR_TREES} trunk="#2a1f17" leaves="#2b4c34" />
      </Layer>

      {/* The ground the characters stand on */}
      <Layer x={x} y={y} depth={24}>
        <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full">
          <path d="M0 700 Q400 660 800 690 T1600 680 L1600 900 L0 900 Z" fill="#2f4a2c" />
          <path d="M0 760 Q500 730 900 755 T1600 745 L1600 900 L0 900 Z" fill="#253d24" />
        </svg>
      </Layer>

      {/* Fireflies */}
      {!reduceMotion &&
        FIREFLIES.map((fly, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full bg-[#f3e38a]"
            style={{ left: `${fly.left}%`, top: `${fly.top}%`, width: fly.size, height: fly.size }}
            animate={{ opacity: [0, 0.9, 0], y: [0, -18, -30] }}
            transition={{ duration: 5, delay: fly.delay, repeat: Infinity, ease: stepEase }}
          />
        ))}

      {/* Big leaves in the front corners */}
      <Layer x={x} y={y} depth={36}>
        <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full">
          <path d="M-40 900 Q60 700 220 640 Q160 780 60 900 Z" fill="#13241a" />
          <path d="M40 900 Q120 760 300 730 Q220 830 150 900 Z" fill="#172c1f" />
          <path d="M1640 900 Q1540 690 1380 630 Q1440 780 1540 900 Z" fill="#13241a" />
        </svg>
      </Layer>
    </div>
  );
}
