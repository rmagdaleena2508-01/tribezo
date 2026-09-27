import { fallbackReplies, replies, tour } from "./content.js";

// Pick what Zazo says back, in English. The C server turns it into XYZ.
//
// This is a simple, fixed list of answers for now. In Phase 5 an AI
// model will write Zazo's answers instead.
//
// memory keeps track of where the tour is and which fallback is next:
//   { tourStop, fallback }
// Returns { says, pose, scene, memory }.
export function zazoReply(english, name, memory) {
  const text = english.toLowerCase().trim();
  const fill = (line) => line.replaceAll("{name}", name);

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
    memory: { ...memory, fallback: memory.fallback + 1 },
  };
}
