// All the words, poses, and pictures for Tribezo live here.
// To change what someone says, or to add real art, edit this file only.

// The longest message someone can send. The C server takes up to 10 KB.
// One character can take up to 4 bytes, so 2,000 characters always fits.
export const MAX_MESSAGE_LENGTH = 2000;

// How many pictures per second the characters flip through.
// 8 to 12 gives a stop-motion look.
export const FRAMES_PER_SECOND = 10;

// What the translator says when you first arrive, one bubble at a time.
export const introLines = [
  "Welcome to the forest! Meet the tribe.",
  "They are friendly, kind, and welcoming. But they don't know your language.",
  "They speak XYZ, which is English in reverse.",
  "Talk to me in English. I will reverse your words and tell them, and they will speak back to you.",
];

// Everything else the translator says.
export const translatorLines = {
  ready: "Go ahead. Type something below, and I will tell them.",
  relaying: "Let me tell them…",
  error: "I can't reach the tribe right now. Please try again in a moment.",
};

// The two characters.
//
// Each pose is a list of pictures shown one after another, over and over.
// While a list is empty, a simple drawing is shown instead.
// To use real art, put the pictures in public/characters/ and list them,
// like this:
//   idle: ["/characters/tribe-idle-1.png", "/characters/tribe-idle-2.png"],
export const characters = {
  translator: {
    name: "The translator",
    poses: {
      idle: [],
      talking: [],
      explaining: [],
      listening: [],
    },
  },
  tribe: {
    name: "The tribe member",
    poses: {
      idle: [],
      talking: [],
      welcome: [],
      pointing: [],
      laughing: [],
      confused: [],
    },
  },
};

// The backgrounds.
//
// Each scene is a list of picture layers, from the back to the front.
// "depth" is how far a layer moves when the mouse moves. Front layers
// should move more than back layers. While a list is empty, a drawn
// forest is shown instead. Example:
//   layers: [
//     { src: "/scenes/forest-entry-sky.png", depth: 4 },
//     { src: "/scenes/forest-entry-trees.png", depth: 12 },
//   ],
export const scenes = {
  "forest-entry": { layers: [] },
};
