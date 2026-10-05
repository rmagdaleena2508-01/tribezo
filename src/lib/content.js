// All the words, characters, scenes, and music for Tribezo live here.
// To change what someone says, or to swap a picture, edit this file only.

// The longest message someone can send. The C server takes up to 10 KB.
// One character can take up to 4 bytes, so 2,000 characters always fits.
export const MAX_MESSAGE_LENGTH = 2000;

// The longest name someone can pick.
export const MAX_NAME_LENGTH = 20;

// ---------- Characters ----------

// Each pose is one picture. Benji's pictures are flipped so he faces
// Zazo, because Benji stands on the right and Zazo on the left.
// "shape" is the width and height of every picture, so a character
// keeps the same size when the pose changes.
// Every picture path starts with the site's base address. It is "/" on
// Vercel and "/tribezo/" on GitHub Pages.
const BASE = import.meta.env.BASE_URL;
const asset = (path) => `${BASE}${path}`;

const pose = (who, name) => asset(`characters/${who}-${name}.webp`);
const posesFor = (who) =>
  Object.fromEntries(
    ["idle", "talking", "welcome", "pointing", "laughing", "confused"].map((name) => [name, pose(who, name)])
  );

export const characters = {
  zazo: { name: "Zazo", shape: "398 / 715", poses: posesFor("zazo") },
  benji: { name: "Benji", shape: "434 / 714", poses: posesFor("benji") },
};

// ---------- Scenes ----------

// Every scene has its picture and a "look" that makes the characters
// match its light, so they feel like they are really standing there:
//
//   scale      how big the characters are here (1 is normal)
//   filter     color changes for the characters (brightness, saturation…)
//   tint       colored light laid over the characters
//   shade      a second, darker light (only at night)
//   sun        which side the light comes from: "left", "right", or
//              "middle" (like a campfire between them)
//   rim        the color of the thin line of light on the sunny edge
//   shadow     how dark the shadow under their feet is (0 to 1)
//   flowers    how much of the bottom of the picture is drawn again in
//              front of their feet, so they stand in the flowers (0 to 1)
const day = {
  scale: 1,
  filter: "brightness(1.03) saturate(1.06)",
  tint: { color: "#ffe9c4", blend: "soft-light", opacity: 0.35 },
  shade: null,
  sun: "left",
  rim: "rgba(255, 244, 214, 0.6)",
  shadow: 0.42,
  flowers: 0.13,
};

export const scenes = {
  "hero-meadow": { src: asset("scenes/hero-meadow.webp"), look: day },
  "island-arrival": {
    src: asset("scenes/island-arrival.webp"),
    look: { ...day, tint: { color: "#fff0cc", blend: "soft-light", opacity: 0.35 } },
  },
  "jungle-path": {
    src: asset("scenes/jungle-path.webp"),
    look: {
      ...day,
      filter: "brightness(0.96) saturate(1.05)",
      tint: { color: "#bfe28f", blend: "soft-light", opacity: 0.38 },
      rim: "rgba(236, 255, 200, 0.5)",
      shadow: 0.5,
    },
  },
  village: { src: asset("scenes/village.webp"), look: { ...day, scale: 0.95 } },
  "family-hut": {
    src: asset("scenes/family-hut.webp"),
    look: {
      ...day,
      scale: 1.08,
      filter: "brightness(0.98) saturate(1.1) sepia(0.08)",
      tint: { color: "#ffb867", blend: "soft-light", opacity: 0.45 },
      rim: "rgba(255, 206, 132, 0.65)",
      shadow: 0.55,
      flowers: 0.1,
    },
  },
  waterfall: {
    src: asset("scenes/waterfall.webp"),
    look: { ...day, tint: { color: "#d8f2ff", blend: "soft-light", opacity: 0.32 }, rim: "rgba(236, 250, 255, 0.6)" },
  },
  lookout: {
    src: asset("scenes/lookout.webp"),
    look: { ...day, scale: 0.95, filter: "brightness(1.05) saturate(1.05)", shadow: 0.36 },
  },
  "fire-camp": {
    src: asset("scenes/fire-camp.webp"),
    look: {
      ...day,
      scale: 0.95,
      filter: "brightness(0.64) saturate(0.85) contrast(1.06)",
      tint: { color: "#ff9a45", blend: "soft-light", opacity: 0.6 },
      shade: { color: "#2d4180", blend: "multiply", opacity: 0.35 },
      sun: "middle",
      rim: "rgba(255, 160, 72, 0.8)",
      shadow: 0.62,
    },
  },
};

// ---------- The start screen ----------

export const hero = {
  scene: "hero-meadow",
  tagline: "An island where every word comes out backwards.",
  begin: "Begin",
};

// ---------- The fiction notice (after the story, before the name) ----------

export const disclaimer = {
  title: "A Work of Fiction",
  paragraphs: [
    "Tribezo is a work of fiction. Zazo, Benji, the Tribezo islands, the Calonis language, and every person, place, and event in this game are imaginary. They were created entirely from the game developer's imagination and creativity.",
    "These characters do not depict, represent, or refer to any real person, tribe, community, culture, or language, living or dead. Any resemblance to real people, places, or events is purely coincidental.",
    "Zazo's replies are written by AI as you play. They are meant for fun, and they may not always be accurate.",
  ],
  button: "I understand",
};

// ---------- The story (about 40 seconds) ----------

// One step per tap. "xyz" lines were made with the real C stack
// (make demo), so they match exactly what the server would say.
export const story = [
  {
    scene: "island-arrival",
    caption:
      "Past the edge of every map lies a little island that no one has visited in a very long time. Until today.",
  },
  {
    scene: "jungle-path",
    caption: "Meet Zazo, leader of the islands. He is warm, kind, and always happy to see a visitor.",
    zazo: { pose: "welcome", xyz: "olleH, relevart! emocleW!" },
  },
  {
    scene: "village",
    caption: "There's just one problem. Everything Zazo says comes out… backwards.",
    zazo: { pose: "confused", xyz: "ohW era uoy? erehW era uoy morf?" },
  },
  {
    scene: "village",
    caption: "Luckily, someone here speaks both languages.",
    zazo: { pose: "idle" },
    benji: {
      pose: "talking",
      says: "Hi, I'm Benji! Zazo speaks Calonis, which is English in reverse. Talk to me in English, I'll flip your words with my stack, and he'll understand you.",
    },
  },
];

// ---------- Asking for the name (right after the story) ----------

export const nameScreen = {
  benjiAsks: "Before we go in, what should I call you?",
  question: "Your name",
  badName: "Please use 1 to 20 letters.",
};

// ---------- Benji's lines ----------

export const benjiLines = {
  relaying: "Let me tell him…",
  // How Benji starts every translation of Zazo's words. He takes turns
  // with these, so it sounds natural. {words} is what Zazo said.
  translates: ["He says, “{words}”", "He is saying, “{words}”", "Zazo says that “{words}”"],
  error: "I can't reach Zazo right now. Please try again in a moment.",
};

// What Zazo says when the story ends, and how Benji explains it.
// {name} is swapped for your name. Zazo asks a question right away, so
// the talk starts on its own.
export const greeting = {
  zazo: "Hello, {name}! Welcome to my islands! A real visitor, how wonderful! Where did you sail from?",
  benji: "He says, “Hello, {name}! Welcome to my islands! A real visitor, how wonderful! Where did you sail from?”",
  benjiNote: "He asked where you come from. Tell him in English, or tap an answer below. I'll pass it on.",
  choices: ["I come from a big city", "Where are the other people?", "Can you show me around?"],
};

// ---------- Places ----------

// Every place on the island, for the Places menu. Picking one takes you
// straight there, and Zazo starts by telling you about the place.
// "words" are what you might say to mean that place, for Zazo's fixed
// answers. "arrive" is what he says when you get there without the AI.
export const places = [
  {
    scene: "island-arrival",
    name: "The beach",
    words: /\b(beach|sand|sea|ocean|canoes?|turtles?|shore)\b/,
    arrive:
      "To the beach! Feel that soft white sand? This is where every visitor lands, and where the sea turtles lay their eggs. The sea brought you here, so the sea must like you!",
  },
  {
    scene: "jungle-path",
    name: "The jungle path",
    words: /\b(jungle|path|trees?|vines?|parrots?|forest)\b/,
    arrive:
      "Into the jungle we go! Stay close, the parrots will tell everyone you are here. Those mossy stones were put here by the very first people.",
  },
  {
    scene: "village",
    name: "The village",
    words: /\b(village|huts|goats?|home base)\b/,
    arrive:
      "Back to the village! This is where we eat, dance, and argue about who caught the biggest fish. The goats act like they own it. They do.",
  },
  {
    scene: "family-hut",
    name: "Zazo's family hut",
    words: /\b(your hut|family hut|your home|your house|rugs?|carvings?)\b/,
    arrive:
      "Come in, come in! My mother wove all these rugs, and those 212 little animals on the shelf? I carved every one. Sit, a guest never leaves our hut hungry!",
  },
  {
    scene: "waterfall",
    name: "The Singing Falls",
    words: /\b(waterfall|falls|singing falls|pool|swim|swimming|water)\b/,
    arrive:
      "Here are the Singing Falls! Close your eyes and listen. Do you hear it humming? Kiki swims here every hot day, faster than any fish.",
  },
  {
    scene: "lookout",
    name: "The lookout hill",
    words: /\b(lookout|hill|view|sunset|lune island|see everything)\b/,
    arrive:
      "Up the lookout hill! From here you can see every island. That far one is Lune, where my family is right now. Grandmother Ama is probably dancing!",
  },
  {
    scene: "fire-camp",
    name: "The campfire at night",
    words: /\b(campfire|fire|night|stars|moon|stories|drums?)\b/,
    arrive:
      "Night comes fast here! The fire is warm and the stars are out. When everyone is home, we sing here until the moon is high. This is the best time for stories.",
  },
];

// ---------- What Zazo says back ----------

// Zazo checks these from top to bottom and uses the first one that
// matches what you said. {name} is swapped for your name.
export const replies = [
  {
    // "Where are the other people?"
    match: /\bwhere\b.*\b(people|everyone|everybody|others?|tribe|family|families|anyone|villagers)\b/,
    says: "They sailed to Lune Island for 3 whole days, for my Grandmother Ama's 80th summer festival! I stayed to look after the islands, and the goats. So you are my very special guest, {name}. Shall I show you around?",
    pose: "pointing",
  },
  {
    match: /\bbenji\b/,
    says: "Ha, Benji! He came by boat 2 summers ago to learn new languages, and he loved it here so much that he stayed. He is so calm, and I am so loud. We are a good team! Do you speak other languages too?",
    pose: "talking",
  },
  {
    match: /\b(how old|your age)\b/,
    says: "I am 34 summers old! We count our age in summers here, because the sun is our oldest friend. Kiki says I am already an old coconut. How many summers are you?",
    pose: "laughing",
  },
  {
    match: /\b(family|mother|mom|sister|brother|grandfather|grandpa|parents)\b/,
    says: "Oh, my family! My mother Nala weaves our rugs, my father Koa builds canoes, and my little sister Kiki swims faster than anyone. Old Tumo, my grandfather, tells the best stories. Do you have brothers or sisters?",
    pose: "welcome",
  },
  {
    match: /\b(favou?rite food|like to eat|what do you eat)\b/,
    says: "Roasted sweet potato with honey! It is soft and sticky and sweet. I also love mangoes and coconut bread. What is the best food where you live?",
    pose: "laughing",
  },
  {
    match: /\b(every ?day|morning|what do you do)\b/,
    says: "Every morning I walk the beach, check the canoes, and say hello to the sea turtles. The turtles never say hello back, but I keep trying! What do you do in the morning?",
    pose: "talking",
  },
  {
    match: /\b(language|xyz|teach me|a word)\b/,
    says: "In my language, the letters of every word are turned around! Here is my favorite word: dneirf means friend. And now you are my dneirf, so you have to come back and visit.",
    pose: "laughing",
  },
  {
    match: /\b(show|tour|around|explore|let'?s go|come on|yes|yeah|sure|okay|ok|next|go on)\b/,
    tour: true,
  },
  {
    match: /\b(food|eat|hungry|fruit|snack)\b/,
    says: "Come to my hut! There is fresh fruit on the table.",
    pose: "pointing",
    scene: "family-hut",
  },
  {
    match: /\b(who are you|your name|who is zazo)\b/,
    says: "I am Zazo, leader of the Tribezo islands for 5 summers now! Benji is my good friend and my voice for you. And you are my guest, so ask me anything!",
    pose: "talking",
  },
  {
    match: /\bhow are you\b/,
    says: "I am so happy today, because I have a visitor! The island has been very quiet with everyone away. How are you, {name}?",
    pose: "laughing",
  },
  {
    match: /\b(thanks|thank you)\b/,
    says: "You are always welcome here, {name}.",
    pose: "welcome",
  },
  {
    match: /\b(bye|goodbye|see you)\b/,
    says: "Goodbye, {name}! Come back soon. The islands will miss you.",
    pose: "welcome",
  },
  {
    match: /^(hi|hello|hey|hola|namaste|good (morning|afternoon|evening))\b/,
    says: "Hello, {name}! It is so good to see you. Tell me, what would you like to do first?",
    pose: "welcome",
  },
];

// The tour, one stop each time you say "show me around", "yes", "next"…
export const tour = [
  {
    scene: "family-hut",
    says: "This is my family's hut. My mother wove these rugs herself. Sit down, have some fruit!",
    pose: "welcome",
  },
  {
    scene: "waterfall",
    says: "These are the Singing Falls. We drink this water, and the children swim here on hot days.",
    pose: "pointing",
  },
  {
    scene: "lookout",
    says: "From this hill you can see every island. The small one far away? That's where my people are now.",
    pose: "pointing",
  },
  {
    scene: "fire-camp",
    says: "Night comes fast here. When everyone is home, we sing around this fire until the moon is high.",
    pose: "laughing",
  },
  {
    scene: "village",
    says: "And we are back in the village! That's the whole island. Ask me anything, or say \"show me around\" to go again.",
    pose: "welcome",
  },
];

// Questions to suggest in the chat box. Zazo's AI suggests a fitting next
// question after each answer. These are used at the start, and whenever
// the AI has no suggestion. Each one is only suggested once.
export const suggestedQuestions = [
  "How did you meet Benji?",
  "Where are the other people?",
  "Tell me about your family",
  "Why do you speak backwards?",
  "How did you become the leader?",
  "What is your favorite food?",
  "Can you show me around?",
  "What are you afraid of?",
  "Teach me a word in your language",
  "What do you do every morning?",
];

// These are only used when the AI is not available, so they should fit
// any question and point the visitor to things Zazo can answer.
export const fallbackReplies = [
  {
    says: "Hmm, the sea is very loud today and I did not catch that! Ask me about my family, my food, or Benji. I love talking about all three.",
    pose: "confused",
  },
  {
    says: "Ooh, that is a good question, {name}. Let me think while we walk. Shall I show you around the island?",
    pose: "talking",
  },
  {
    says: "Benji, help me! I think our visitor asked something new. Ask me how old I am, or where my people went!",
    pose: "laughing",
    benji: "He did not catch that one. Try one of the questions below.",
  },
  {
    says: "I am not sure about that one, my friend. But I know every corner of this island. Want to see it?",
    pose: "welcome",
  },
];

// ---------- Music ----------

// Put music files in public/music/ and list them here. A track left as
// null is skipped, so the site works fine with no music at all.
export const music = {
  tracks: {
    theme: null, // the start screen and the story, e.g. asset("music/theme.mp3")
    island: null, // daytime on the island, e.g. asset("music/island.mp3")
    night: null, // the campfire at night, e.g. asset("music/night.mp3")
  },
  // Which track plays in which scene.
  sceneTracks: {
    "hero-meadow": "theme",
    "island-arrival": "theme",
    "jungle-path": "island",
    village: "island",
    "family-hut": "island",
    waterfall: "island",
    lookout: "island",
    "fire-camp": "night",
  },
  volume: 0.45,
  fadeMs: 1800,
};
