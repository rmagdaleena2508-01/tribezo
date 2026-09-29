// Builds the instructions Gemini gets with every message.
//
// Everything Zazo knows is in plain text files, so they are easy to change:
//   zazo/character.md     who Zazo is, his island, and Benji
//   zazo/rules.md         how he talks, moves around, and stays safe
//   zazo/examples.md      example answers that show his voice
//   story/zazo-story.md   The Zazo Story Book, his whole life story
//
// The story book is short (a few thousand words), so the whole book goes
// right into the instructions. Gemini reads it all every time, which is
// more reliable than looking things up in a PDF. The PDF version is still
// made for reading (tools/make_story_pdf.mjs), but Gemini uses the text.
//
// The files are read once, when the helper starts. The parts that never
// change come first and the parts that change ("Right now") come last,
// so Gemini can reuse its work on the long, unchanging start.

import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`./${path}`, import.meta.url), "utf8").trim();
const CHARACTER = read("zazo/character.md");
const RULES = read("zazo/rules.md");
const EXAMPLES = read("zazo/examples.md");
const STORY_BOOK = read("story/zazo-story.md");

// Places Zazo can take the visitor. "stay" means do not move.
export const SCENES = [
  "stay",
  "island-arrival",
  "jungle-path",
  "village",
  "family-hut",
  "waterfall",
  "lookout",
  "fire-camp",
];
export const PLACES = SCENES.slice(1);

// How Zazo can stand.
export const POSES = ["idle", "talking", "welcome", "pointing", "laughing", "confused"];

// Plain names for the places, so Zazo knows where he is standing.
const PLACE_NAMES = {
  "island-arrival": "the beach",
  "jungle-path": "the jungle path",
  village: "the village",
  "family-hut": "your family hut",
  waterfall: "the Singing Falls",
  lookout: "the lookout hill",
  "fire-camp": "the campfire at night",
};

// The part of the instructions that never changes.
const STEADY = [CHARACTER, RULES, EXAMPLES, `# The Zazo Story Book\n\n${STORY_BOOK.replace(/^# The Zazo Story Book\s*/, "")}`].join(
  "\n\n"
);

// The full instructions: the steady part, plus what is true right now.
export function systemPrompt(visitorName, currentScene = "village", seen = []) {
  const place = PLACE_NAMES[currentScene] ?? PLACE_NAMES.village;
  const seenNames = seen.map((scene) => PLACE_NAMES[scene]).filter(Boolean);
  const notSeen = PLACES.filter((scene) => scene !== currentScene && !seen.includes(scene)).map((scene) => PLACE_NAMES[scene]);
  return `${STEADY}

# Right now

- You are talking with a visitor named ${visitorName}.
- You and the visitor are standing at ${place}.
- Places the visitor has seen: ${seenNames.length > 0 ? seenNames.join(", ") : "only this one"}.
- Places the visitor has not seen yet: ${notSeen.length > 0 ? notSeen.join(", ") : "none, they have seen everything"}.
- Answer with JSON: "reply" is what you say, "benji" is Benji's short note or an empty string, "scene" is one of ${SCENES.join(", ")}, "pose" is one of ${POSES.join(", ")}, and "choices" is 2 or 3 things the visitor could say next.`;
}

// The shape of the answer Gemini must give back.
export const ANSWER_SCHEMA = {
  type: "OBJECT",
  properties: {
    reply: {
      type: "STRING",
      description: "What Zazo says, in plain simple English. 2 to 4 short sentences: react, answer, one colorful detail, and often a question back.",
    },
    benji: {
      type: "STRING",
      description: "Benji's own short, calm note to the visitor, at most 20 words. An empty string most of the time.",
    },
    scene: { type: "STRING", enum: SCENES, description: "Where Zazo takes the visitor right now, or stay." },
    pose: { type: "STRING", enum: POSES, description: "How Zazo stands while he says it." },
    choices: {
      type: "ARRAY",
      items: { type: "STRING" },
      minItems: 2,
      maxItems: 3,
      description: "2 or 3 short, different things the visitor could say next, as the visitor would say them. At most 8 words each.",
    },
  },
  required: ["reply", "benji", "scene", "pose", "choices"],
  propertyOrdering: ["reply", "benji", "scene", "pose", "choices"],
};

// What Zazo says if Gemini blocks a message for safety.
export const SAFE_REPLY = {
  reply: "Hmm, that is not something we talk about on the island. But I know something fun! Shall I show you the Singing Falls?",
  benji: "",
  scene: "stay",
  pose: "confused",
  choices: ["Yes, show me the Singing Falls!", "Tell me about your family"],
};
