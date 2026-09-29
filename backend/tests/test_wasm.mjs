// Checks that the WebAssembly build of the stack (build/stack.wasm) flips
// text exactly like the C version. Run with: make test-wasm

import { readFileSync } from "node:fs";
import { flip } from "../../src/lib/stack.js";

const { instance } = await WebAssembly.instantiate(readFileSync(new URL("../build/stack.wasm", import.meta.url)));
const wasm = instance.exports;

// The same cases as tests/test_reverse.c.
const cases = [
  ["", ""],
  ["hello", "olleh"],
  ["hello world", "olleh dlrow"],
  ["hello, world!", "olleh, dlrow!"],
  ["don't", "tno'd"],
  ["well-known", "nwon-kllew"],
  ["  hi  ", "  ih  "],
  ["line one\nline two", "enil eno\nenil owt"],
  ["123", "123"],
  ["room 42b", "moor 42b"],
  ["$100.50", "$100.50"],
  ["it costs $20.", "ti stsoc $20."],
  ["only ₹500!", "ylno ₹500!"],
  ["100 dollars", "100 dollars"],
  ["Rs 500", "Rs 500"],
  ["Rs500", "Rs500"],
  ["one dollar", "eno rallod"],
  ["Hello World", "olleH dlroW"],
  ["café ₹5", "facé ₹5"],
];

let failures = 0;
for (const [english, expected] of cases) {
  const { xyz } = flip(wasm, english);
  if (xyz !== expected) {
    console.log(`  FAIL: "${english}" gave "${xyz}", expected "${expected}"`);
    failures++;
  }
}

// The player's name stays the way it was typed.
const names = [
  ["hello, Mary!", "Mary", "olleh, Mary!"],
  ["Mary's hut", "Mary", "Mary's tuh"],
  ["hi Mary Ann", "Mary Ann", "ih Mary Ann"],
  ["Maryland", "Mary", "dnalyraM"],
];
for (const [english, keep, expected] of names) {
  const { xyz } = flip(wasm, english, keep);
  if (xyz !== expected) {
    console.log(`  FAIL: "${english}" keeping "${keep}" gave "${xyz}", expected "${expected}"`);
    failures++;
  }
}

// Counts: "hi, you" has 5 letters.
const counts = flip(wasm, "hi, you");
if (counts.pushes !== 5 || counts.pops !== 5) {
  console.log(`  FAIL: counts were ${counts.pushes} pushes and ${counts.pops} pops`);
  failures++;
}

// A long paragraph, many times in a row, to check memory is reused.
const sentence = "The tribe is kind, friendly, and welcoming! ".repeat(200);
for (let i = 0; i < 50; i++) {
  const { xyz } = flip(wasm, sentence);
  if (flip(wasm, xyz).xyz !== sentence) {
    console.log("  FAIL: flipping a long paragraph twice did not give it back");
    failures++;
    break;
  }
}

console.log("WebAssembly tests");
console.log(failures === 0 ? "  all passed" : `  ${failures} failed`);
process.exit(failures === 0 ? 0 : 1);
