// Saving the chat on this device, with the browser's own storage
// (localStorage).
//
// - Everything stays in this browser, on this device. Nothing is sent
//   anywhere, and there is no database.
// - Only what the game needs is saved: the name, where you are, the places
//   you have seen, the chat history, the last few turns for the AI, and the
//   answer buttons. Never keys or passwords.
// - A save is kept for 30 days after the last visit, then thrown away.
// - "Start over" on the title screen wipes it.
//
// Browsers can say no to storage (private windows, full storage, or
// blocked cookies), and saved data can be broken or old. So every read and
// write is wrapped in try/catch, and a save is checked piece by piece
// before it is used. If anything is wrong, the game simply starts fresh.

import { scenes } from "./content.js";

const KEY = "tribezo:save";
const VERSION = 1; // goes up if the shape of a save ever changes
const KEEP_DAYS = 30;
const MAX_HISTORY = 60; // the History panel keeps the newest 60 messages
const MAX_TURNS = 10;

const isText = (value, max) => typeof value === "string" && value.length <= max;
const isPlace = (value) => typeof value === "string" && value in scenes && value !== "hero-meadow";

// Check a save piece by piece. Returns a clean copy, or null.
function check(data) {
  if (typeof data !== "object" || data === null || data.version !== VERSION) return null;
  if (typeof data.savedAt !== "number" || Date.now() - data.savedAt > KEEP_DAYS * 24 * 3600 * 1000) return null;
  if (!isText(data.name, 20) || data.name.trim().length === 0) return null;
  if (!isPlace(data.scene)) return null;

  const list = (value) => (Array.isArray(value) ? value : []);
  const seen = list(data.seen).filter(isPlace);
  const choices = list(data.choices).filter((choice) => isText(choice, 80)).slice(0, 3);
  const turns = list(data.turns)
    .filter((turn) => turn && isText(turn.you, 2000) && isText(turn.zazo, 600))
    .map(({ you, zazo }) => ({ you, zazo }))
    .slice(-MAX_TURNS);
  const history = list(data.history)
    .filter(
      (entry) =>
        entry &&
        isText(entry.english, 2000) &&
        isText(entry.xyz, 2000) &&
        isText(entry.reply, 600) &&
        isText(entry.replyXyz, 600) &&
        Number.isFinite(entry.pushes) &&
        Number.isFinite(entry.pops) &&
        (entry.source === "ai" || entry.source === "fixed")
    )
    .map(({ english, xyz, pushes, pops, reply, replyXyz, source }) => ({ english, xyz, pushes, pops, reply, replyXyz, source }))
    .slice(-MAX_HISTORY);
  const memory = {
    tourStop: Number.isInteger(data.memory?.tourStop) ? data.memory.tourStop : 0,
    fallback: Number.isInteger(data.memory?.fallback) ? data.memory.fallback : 0,
  };

  return { name: data.name, scene: data.scene, seen, choices, turns, history, memory };
}

// Read the save. Returns it, or null if there is none or it is no good.
export function loadSave() {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const save = check(JSON.parse(raw));
    if (!save) window.localStorage.removeItem(KEY); // old or broken: throw it away
    return save;
  } catch {
    return null;
  }
}

// Write the save. If the browser's storage is full, try once more with
// only the newest half of the history. If that fails too, carry on
// without saving: the game still works.
export function writeSave({ name, scene, seen, choices, turns, history, memory }) {
  const save = (keepHistory) =>
    window.localStorage.setItem(
      KEY,
      JSON.stringify({
        version: VERSION,
        savedAt: Date.now(),
        name,
        scene,
        seen,
        choices,
        turns: turns.slice(-MAX_TURNS),
        history: history.slice(-keepHistory).map(({ id: _id, ...entry }) => entry),
        memory,
      })
    );
  try {
    save(MAX_HISTORY);
  } catch {
    try {
      save(Math.floor(MAX_HISTORY / 2));
    } catch {
      // Storage is blocked or full. Nothing more to do.
    }
  }
}

// Wipe the save, for "Start over".
export function clearSave() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // Storage is blocked, so there is nothing to wipe.
  }
}
