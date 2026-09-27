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
const pose = (who, name) => `/characters/${who}-${name}.webp`;
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
  "hero-meadow": { src: "/scenes/hero-meadow.webp", look: day },
  "island-arrival": {
    src: "/scenes/island-arrival.webp",
    look: { ...day, tint: { color: "#fff0cc", blend: "soft-light", opacity: 0.35 } },
  },
  "jungle-path": {
    src: "/scenes/jungle-path.webp",
    look: {
      ...day,
      filter: "brightness(0.96) saturate(1.05)",
      tint: { color: "#bfe28f", blend: "soft-light", opacity: 0.38 },
      rim: "rgba(236, 255, 200, 0.5)",
      shadow: 0.5,
    },
  },
  village: { src: "/scenes/village.webp", look: { ...day, scale: 0.95 } },
  "family-hut": {
    src: "/scenes/family-hut.webp",
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
    src: "/scenes/waterfall.webp",
    look: { ...day, tint: { color: "#d8f2ff", blend: "soft-light", opacity: 0.32 }, rim: "rgba(236, 250, 255, 0.6)" },
  },
  lookout: {
    src: "/scenes/lookout.webp",
    look: { ...day, scale: 0.95, filter: "brightness(1.05) saturate(1.05)", shadow: 0.36 },
  },
  "fire-camp": {
    src: "/scenes/fire-camp.webp",
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
      says: "Hi, I'm Benji! Zazo speaks XYZ, which is English in reverse. Talk to me in English, I'll flip your words with my stack, and he'll understand you.",
    },
  },
];

// ---------- The name screen ----------

export const nameScreen = {
  title: "Welcome, traveler.",
  question: "What's your name?",
  badName: "Please use 1 to 20 letters.",
};

// ---------- Benji's lines ----------

export const benjiLines = {
  relaying: "Let me tell him…",
  error: "I can't reach Zazo right now. Please try again in a moment.",
};

// What Zazo says when the story ends, and how Benji explains it.
// {name} is swapped for your name.
export const greeting = {
  zazo: "Hello, {name}! Welcome to my islands!",
  benji: "He says, “Hello, {name}! Welcome to my islands!” Go on, say something to him.",
};

// ---------- What Zazo says back ----------

// Zazo checks these from top to bottom and uses the first one that
// matches what you said. {name} is swapped for your name.
export const replies = [
  {
    // "Where are the other people?"
    match: /\bwhere\b.*\b(people|everyone|everybody|others?|tribe|family|families|anyone|villagers)\b/,
    says: "They have gone on a 3-day vacation to another island to meet their families and relatives. I'm the only one taking care of the islands. Come, let me show you around!",
    pose: "pointing",
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
    says: "I am Zazo, leader of these islands. Benji is my good friend.",
    pose: "talking",
  },
  {
    match: /\bhow are you\b/,
    says: "I am very happy today, because I have a visitor!",
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
    says: "Hello, {name}! It is so good to see you.",
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

// When nothing matches, Zazo takes turns saying these.
export const fallbackReplies = [
  { says: "Ha! You talk in a funny way, {name}. I like it!", pose: "laughing" },
  { says: "Tell me more, friend.", pose: "talking" },
  { says: "Hmm… Benji, what does that mean?", pose: "confused" },
  { says: "The islands are happy you are here.", pose: "welcome" },
];

// ---------- Music ----------

// Put music files in public/music/ and list them here. A track left as
// null is skipped, so the site works fine with no music at all.
export const music = {
  tracks: {
    theme: null, // the start screen and the story, e.g. "/music/theme.mp3"
    island: null, // daytime on the island, e.g. "/music/island.mp3"
    night: null, // the campfire at night, e.g. "/music/night.mp3"
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
