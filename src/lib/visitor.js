import { MAX_NAME_LENGTH } from "./content.js";

// Checking the visitor's name. The name is only kept while the page is
// open. It is never saved, and it is asked for again on every visit.

// Letters from any language, plus spaces, dots, dashes, and apostrophes.
const NAME_PATTERN = /^[\p{L}\p{M}][\p{L}\p{M} .'-]*$/u;

export function cleanName(raw) {
  return raw.trim().replace(/\s+/g, " ");
}

export function isValidName(name) {
  return name.length >= 1 && name.length <= MAX_NAME_LENGTH && NAME_PATTERN.test(name);
}
