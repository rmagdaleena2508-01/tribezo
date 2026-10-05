import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { characters } from "../lib/content.js";

// One character, lit to match the scene they are standing in.
//
// The pictures come from a different style than the backgrounds, so a
// few tricks help them blend in (all plain CSS, no extra library):
//   1. A color filter that matches the scene's brightness and colors.
//   2. The scene's light color laid over the character (only over the
//      character's shape, using the picture itself as a mask).
//   3. A soft shade on the side away from the light.
//   4. A thin line of light on the sunny edge (a "rim light").
//   5. A soft shadow on the ground under the feet.
// The scene also draws its blurry front flowers over the feet, and a
// film grain over everything (see Scene.jsx).
//
// side: "left" (Zazo) or "right" (Benji), used to work out where the
// light hits when it comes from the middle, like a campfire.
// How a new pose comes in: quick, so it keeps up with the talk.
const POSE_IN = { duration: 0.18, ease: [0.33, 0, 0.2, 1] };
const POSE_OUT = { duration: 0.12, ease: "easeOut" };

// Which pose is solid on screen ("base"), and which one is fading in on
// top of it ("incoming"). The base only changes once the new pose is fully
// in, so there is always one solid pose and the character never vanishes.
function usePoseLayers(pose) {
  const [state, setState] = useState({ base: pose, incoming: null });

  useEffect(() => {
    setState((current) => {
      if (pose === (current.incoming ?? current.base)) return current;
      if (pose === current.base) return { base: current.base, incoming: null };
      return { base: current.base, incoming: pose };
    });
  }, [pose]);

  const settle = useCallback((name) => {
    setState((current) => (current.incoming === name ? { base: name, incoming: null } : current));
  }, []);

  return { ...state, settle };
}

export default function Character({ who, pose, look, side }) {
  const character = characters[who];
  const wanted = character.poses[pose] ? pose : "idle";
  const { base, incoming, settle } = usePoseLayers(wanted);

  // Which way the light comes from, as seen by this character.
  const lightFrom = look.sun === "middle" ? (side === "left" ? "right" : "left") : look.sun;
  const rimX = lightFrom === "left" ? -2 : 2;
  const shadeDirection = lightFrom === "left" ? "to right" : "to left";

  // Only paint inside the character's shape.
  const maskStyle = (image) => ({
    WebkitMaskImage: `url(${image})`,
    maskImage: `url(${image})`,
    WebkitMaskSize: "100% 100%",
    maskSize: "100% 100%",
  });

  return (
    <div
      role="img"
      aria-label={`${character.name}, ${pose}`}
      className="relative h-full"
      style={{ aspectRatio: character.shape }}
    >
      {/* Shadow on the ground */}
      <div
        aria-hidden="true"
        className="absolute bottom-[0.5%] left-[12%] right-[12%] h-[5%] rounded-[50%] blur-md"
        style={{ background: `rgba(0, 0, 0, ${look.shadow})` }}
      />

      {/* Every pose is loaded and stacked, so a change never waits for a
          picture. The new pose fades in quickly on top of the old one,
          which stays solid underneath until the new one is fully in. Even
          when poses change fast, one pose is always solid on screen. */}
      {Object.entries(character.poses).map(([name, src]) => {
        const isIncoming = name === incoming;
        const isBase = name === base;
        return (
          <motion.div
            key={name}
            initial={false}
            animate={{ opacity: isIncoming || isBase ? 1 : 0 }}
            transition={isIncoming ? POSE_IN : POSE_OUT}
            onAnimationComplete={() => isIncoming && settle(name)}
            className="absolute inset-0 isolate will-change-[opacity]"
            style={{ zIndex: isIncoming ? 3 : isBase ? 2 : 1 }}
            aria-hidden={!isBase}
          >
            <img
              src={src}
              alt=""
              draggable="false"
              className="absolute inset-0 h-full w-full select-none"
              style={{
                filter: `${look.filter} drop-shadow(${rimX}px -1px 0 ${look.rim})`,
                transition: "filter 1.2s ease",
              }}
            />

            {/* The scene's light color */}
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{
                ...maskStyle(src),
                background: look.tint.color,
                mixBlendMode: look.tint.blend,
                opacity: look.tint.opacity,
                transition: "background 1.2s ease, opacity 1.2s ease",
              }}
            />

            {/* Moonlight, only at night */}
            {look.shade && (
              <div
                aria-hidden="true"
                className="absolute inset-0"
                style={{
                  ...maskStyle(src),
                  background: look.shade.color,
                  mixBlendMode: look.shade.blend,
                  opacity: look.shade.opacity,
                }}
              />
            )}

            {/* The side away from the light is a little darker */}
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{
                ...maskStyle(src),
                background: `linear-gradient(${shadeDirection}, transparent 35%, rgba(0, 0, 0, 0.28))`,
                mixBlendMode: "multiply",
              }}
            />
          </motion.div>
        );
      })}
    </div>
  );
}
