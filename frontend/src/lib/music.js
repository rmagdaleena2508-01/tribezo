import { Howl } from "howler";
import { music } from "./content.js";

// Background music with howler.js.
//
// Browsers only allow sound after the visitor taps or clicks something,
// so nothing plays until start() is called from the "Begin" button.
// When the scene changes to one with a different track, the old track
// fades out while the new one fades in.

const MUTE_KEY = "tribezo.muted";

let started = false;
let muted = readMuted();
let currentName = null;
let current = null; // the Howl that is playing now
const cache = {};

function readMuted() {
  try {
    return localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    return false;
  }
}

// True if at least one track is set in content.js.
export const hasMusic = Object.values(music.tracks).some(Boolean);

function load(name) {
  const src = music.tracks[name];
  if (!src) return null;
  if (!cache[name]) {
    cache[name] = new Howl({ src: [src], loop: true, volume: 0, html5: true });
  }
  return cache[name];
}

function fadeOut(howl) {
  if (!howl) return;
  howl.fade(howl.volume(), 0, music.fadeMs);
  // Pause it once the fade is over, unless it was picked again meanwhile.
  // A timer is used instead of howler's "fade" event, because that event
  // does not always fire when two fades overlap.
  setTimeout(() => {
    if (howl !== current) howl.pause();
  }, music.fadeMs + 100);
}

function fadeIn(howl) {
  if (!howl) return;
  if (!howl.playing()) {
    howl.volume(0);
    howl.play();
  }
  howl.fade(howl.volume(), muted ? 0 : music.volume, music.fadeMs);
}

// Call once, from a click or tap.
export function startMusic(scene) {
  started = true;
  playForScene(scene);
}

// Switch to the track for this scene, if it is different.
export function playForScene(scene) {
  if (!started || !hasMusic) return;
  const name = music.sceneTracks[scene];
  if (name === currentName) return;

  const next = load(name);
  fadeOut(current);
  currentName = name;
  current = next;
  fadeIn(current);
}

export function isMuted() {
  return muted;
}

export function setMuted(value) {
  muted = value;
  try {
    localStorage.setItem(MUTE_KEY, value ? "1" : "0");
  } catch {
    // Storage is blocked. Muting still works until the page closes.
  }
  if (current) current.fade(current.volume(), muted ? 0 : music.volume, 400);
}
