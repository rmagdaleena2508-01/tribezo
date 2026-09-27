import { MAX_NAME_LENGTH } from "./content.js";

// The visitor's name is kept only in this browser. It is never saved on
// a server. Some browsers block storage (like private windows), so every
// read and write is wrapped in try/catch and the site still works.

const KEY = "tribezo.name";

export function loadName() {
  try {
    const name = localStorage.getItem(KEY);
    return name && isValidName(name) ? name : "";
  } catch {
    return "";
  }
}

export function saveName(name) {
  try {
    localStorage.setItem(KEY, name);
  } catch {
    // Storage is blocked. The name still works until the page closes.
  }
}

export function forgetName() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // Nothing to do.
  }
}

// Letters from any language, plus spaces, dots, dashes, and apostrophes.
const NAME_PATTERN = /^[\p{L}\p{M}][\p{L}\p{M} .'-]*$/u;

export function cleanName(raw) {
  return raw.trim().replace(/\s+/g, " ");
}

export function isValidName(name) {
  return name.length >= 1 && name.length <= MAX_NAME_LENGTH && NAME_PATTERN.test(name);
}
