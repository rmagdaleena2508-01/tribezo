import { fallbackReplies, places, replies, tour } from "./content.js";

// Zazo's fixed answers, used when the AI is not available.
//
// memory keeps track of where the tour is and which fallback is next:
//   { tourStop, fallback }
// here is the place Zazo is standing right now.
// Returns { says, pose, scene, benji, memory }.

// Words that mean "let's go somewhere".
const GO = /\b(go|take|see|show|visit|walk|climb|sit|come|let'?s|can we|could we|bring)\b/;

export function zazoReply(english, name, memory, here) {
  const text = english.toLowerCase().trim();
  const fill = (line) => line.replaceAll("{name}", name);

  // Asking to go to a place, like "Can we go to the beach?"
  if (GO.test(text)) {
    const place = places.find((p) => p.scene !== here && p.words.test(text));
    if (place) {
      return { says: fill(place.arrive), pose: "pointing", scene: place.scene, memory };
    }
  }

  for (const reply of replies) {
    if (!reply.match.test(text)) continue;

    if (reply.tour) {
      const stop = tour[memory.tourStop % tour.length];
      return {
        says: fill(stop.says),
        pose: stop.pose,
        scene: stop.scene,
        memory: { ...memory, tourStop: memory.tourStop + 1 },
      };
    }
    return { says: fill(reply.says), pose: reply.pose, scene: reply.scene, memory };
  }

  const fallback = fallbackReplies[memory.fallback % fallbackReplies.length];
  return {
    says: fill(fallback.says),
    pose: fallback.pose,
    scene: undefined,
    benji: fallback.benji,
    memory: { ...memory, fallback: memory.fallback + 1 },
  };
}
