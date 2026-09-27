import { motion } from "framer-motion";
import { characters } from "../lib/content.js";
import { useFrame } from "../hooks/useFrame.js";
import PlaceholderFigure from "./PlaceholderFigure.jsx";

// One character on stage.
// If the pose has pictures in content.js, flip through them like a flip book.
// If not, show the drawn placeholder.
export default function Character({ who, pose }) {
  const frame = useFrame();
  const character = characters[who];
  const frames = character.poses[pose]?.length ? character.poses[pose] : character.poses.idle;

  return (
    <div role="img" aria-label={character.name} className="h-full w-full">
      {/* A tiny hop each time the pose changes, like a puppet being moved. */}
      <motion.div
        key={pose}
        initial={{ y: 6 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 600, damping: 18 }}
        className="h-full w-full"
      >
        {frames.length > 0 ? (
          <img
            src={frames[frame % frames.length]}
            alt=""
            draggable="false"
            className="h-full w-full select-none object-contain object-bottom"
          />
        ) : (
          <PlaceholderFigure who={who} pose={pose} frame={frame} />
        )}
      </motion.div>
    </div>
  );
}
