import { motion } from "framer-motion";
import { characters } from "../lib/content.js";
import { useFrame } from "../hooks/useFrame.js";

// Tiny nudges, one per frame: move right, move up, turn (in degrees).
// Real stop-motion puppets never sit perfectly still.
const WOBBLE = [
  [0, 0, 0],
  [0.6, -0.5, 0.25],
  [-0.4, 0.3, -0.2],
];

// While talking, the character bobs a little more, like each word
// is a new frame.
const TALK_BOB = [0, -3, -1, -4];

// One character standing in a corner of the screen.
export default function Character({ who, pose }) {
  const frame = useFrame();
  const character = characters[who];
  const src = character.poses[pose] ?? character.poses.idle;

  const [dx, dy, turn] = WOBBLE[frame % WOBBLE.length];
  const bob = pose === "talking" ? TALK_BOB[frame % TALK_BOB.length] : 0;

  return (
    <div role="img" aria-label={`${character.name}, ${pose}`} className="h-full">
      {/* A small hop each time the pose changes, like a puppet being moved. */}
      <motion.div
        key={pose}
        initial={{ y: 10 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 600, damping: 16 }}
        className="h-full"
      >
        <img
          src={src}
          alt=""
          draggable="false"
          className="h-full w-auto max-w-none select-none drop-shadow-[0_18px_18px_rgba(0,0,0,0.35)]"
          style={{
            transform: `translate(${dx}px, ${dy + bob}px) rotate(${turn}deg)`,
            transformOrigin: "50% 100%",
          }}
        />
      </motion.div>
    </div>
  );
}
