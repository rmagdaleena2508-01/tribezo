import { Howl } from "howler";
import { music } from "./content.js";

// Background sound with howler.js, in two layers:
//   music     the piano (one track by day, a softer one at night)
//   ambience  the nature sounds under it (birds by day, quiet at night)
//
// Browsers only allow sound after the visitor taps or clicks something,
// so nothing plays until startMusic() is called from the "Begin" button.
// When the place changes to one with a different sound, the old one fades
// out while the new one fades in, in each layer on its own.

const MUTE_KEY = "tribezo.muted";

let started = false;
let muted = readMuted();
let ducked = false; // true while the stack video plays, so the two do not clash
const silent = () => muted || ducked;

function readMuted() {
  try {
    return localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    return false;
  }
}

// One layer of sound: it plays one looping file at a time, and fades
// from one to the next.
//   files      { name: url } the sounds this layer can play
//   volume     how loud it plays
//   streaming  true for long files (they start playing before they are
//              fully loaded); false for short loops (they are decoded
//              fully first, so they loop with no gap)
function makeLayer(files, volume, streaming) {
  const cache = {};
  let currentName;
  let current = null;

  const load = (name) => {
    const src = name && files[name];
    if (!src) return null;
    cache[name] ??= new Howl({ src: [src], loop: true, volume: 0, html5: streaming });
    return cache[name];
  };

  const fadeOut = (howl) => {
    if (!howl) return;
    howl.fade(howl.volume(), 0, music.fadeMs);
    // Pause it once the fade is over, unless it was picked again meanwhile.
    // A timer is used instead of howler's "fade" event, because that event
    // does not always fire when two fades overlap.
    setTimeout(() => {
      if (howl !== current) howl.pause();
    }, music.fadeMs + 100);
  };

  const fadeIn = (howl) => {
    if (!howl) return;
    if (!howl.playing()) {
      howl.volume(0);
      howl.play();
    }
    howl.fade(howl.volume(), silent() ? 0 : volume, music.fadeMs);
  };

  return {
    play(name) {
      if (name === currentName) return;
      const next = load(name);
      fadeOut(current);
      currentName = name;
      current = next;
      fadeIn(current);
    },
    // Turn the sound down to nothing, or back up, without changing what plays.
    hush(quiet, ms = 400) {
      if (current) current.fade(current.volume(), quiet ? 0 : volume, ms);
    },
  };
}

const musicLayer = makeLayer(music.tracks, music.volume, true);
const ambienceLayer = makeLayer(music.ambience ?? {}, music.ambienceVolume ?? 0.2, false);

// True if there is any sound at all, so the mute button only shows then.
export const hasMusic = [...Object.values(music.tracks), ...Object.values(music.ambience ?? {})].some(Boolean);

// Call once, from a click or tap.
export function startMusic(scene) {
  started = true;
  playForScene(scene);
}

// Switch to the sounds for this place, if they are different.
export function playForScene(scene) {
  if (!started || !hasMusic) return;
  musicLayer.play(music.sceneTracks[scene] ?? null);
  ambienceLayer.play(music.sceneAmbience?.[scene] ?? null);
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
  musicLayer.hush(silent());
  ambienceLayer.hush(silent());
}

// While the stack video plays, the music and birds fade down, then come
// back when it closes. This does not change the mute button.
export function setDucked(value) {
  ducked = value;
  musicLayer.hush(silent(), 700);
  ambienceLayer.hush(silent(), 700);
}
