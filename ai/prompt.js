// Builds the instructions Gemini gets with every message.
//
// Zazo's full life story is in story/zazo-story.pdf, which server.js
// attaches to every message. The rules and a short summary live in plain
// text files in the zazo/ folder, so they are easy to change:
//   zazo/character.md   who Zazo is, his life, his island, and Benji
//   zazo/rules.md       how he answers, and the safety rules
//   zazo/examples.md    example answers that show his voice
//
// The files are read once, when the helper starts.

import { readFileSync } from "node:fs";

const read = (name) => readFileSync(new URL(`./zazo/${name}`, import.meta.url), "utf8").trim();
const CHARACTER = read("character.md");
const RULES = read("rules.md");
const EXAMPLES = read("examples.md");

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

// The full instructions: the three files, plus what is true right now.
export function systemPrompt(visitorName, currentScene = "village") {
  const place = PLACE_NAMES[currentScene] ?? PLACE_NAMES.village;
  return [
    CHARACTER,
    RULES,
    EXAMPLES,
    `# Right now

- You are talking with a visitor named ${visitorName}.
- You and the visitor are standing at ${place}.
- Answer with JSON: "reply" is what you say, "scene" is one of ${SCENES.join(", ")}, "pose" is one of ${POSES.join(", ")}, and "suggestion" is a short question the visitor could ask you next.`,
  ].join("\n\n");
}

// Sent with the story book PDF, so Gemini knows what it is.
export const STORY_NOTE =
  "The attached PDF is The Zazo Story Book. It has the true facts about Zazo, his family, the history of the island, and how to show visitors around. Look up the answer in it before you reply. The visitor's message is below.";

// The shape of the answer Gemini must give back.
export const ANSWER_SCHEMA = {
  type: "OBJECT",
  properties: {
    reply: { type: "STRING", description: "What Zazo says, in plain simple English. 1 to 3 short sentences." },
    scene: { type: "STRING", enum: SCENES, description: "Where Zazo takes the visitor, or stay." },
    pose: { type: "STRING", enum: POSES, description: "How Zazo stands while he says it." },
    suggestion: {
      type: "STRING",
      description:
        "A short, fun question the visitor could ask Zazo next, written as the visitor would say it, about something in the story book they have not asked yet. At most 8 words.",
    },
  },
  required: ["reply", "scene", "pose", "suggestion"],
  propertyOrdering: ["reply", "scene", "pose", "suggestion"],
};

// What Zazo says if Gemini blocks a message for safety.
export const SAFE_REPLY = {
  reply: "Hmm, that is not something we talk about on the island. Shall I show you the Singing Falls instead?",
  scene: "stay",
  pose: "confused",
  suggestion: "Yes, show me the Singing Falls!",
};
