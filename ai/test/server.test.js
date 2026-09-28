// Tests for the AI helper. Run with: npm test
//
// These never call the real Gemini. A tiny fake Gemini runs on this
// computer instead, so the tests are free, fast, and need no key.

import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const SERVER = fileURLToPath(new URL("../server.js", import.meta.url));
const FAKE_PORT = 18763;

// What the fake Gemini answers next, and the last request it received.
let fakeAnswer = { reply: "Welcome to my island!", scene: "stay", pose: "welcome" };
let lastRequest = null;

const fakeGemini = createServer((req, res) => {
  let body = "";
  req.on("data", (chunk) => (body += chunk));
  req.on("end", () => {
    lastRequest = { headers: req.headers, url: req.url, body: JSON.parse(body) };
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ candidates: [{ content: { parts: [{ text: JSON.stringify(fakeAnswer) }] } }] }));
  });
});

const helpers = [];

// Start the helper on a port, with or without a key.
function startHelper(port, key) {
  const child = spawn(process.execPath, [SERVER], {
    env: {
      PATH: process.env.PATH,
      PORT: String(port),
      GEMINI_API_KEY: key,
      GEMINI_API_URL: `http://127.0.0.1:${FAKE_PORT}/v1beta`,
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  helpers.push(child);
  return new Promise((resolve) => child.stdout.once("data", () => resolve()));
}

function post(port, body, headers = {}) {
  return fetch(`http://127.0.0.1:${port}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

before(async () => {
  await new Promise((resolve) => fakeGemini.listen(FAKE_PORT, "127.0.0.1", resolve));
  await startHelper(18764, "test-key");
  await startHelper(18765, "");
});

after(() => {
  helpers.forEach((child) => child.kill());
  fakeGemini.close();
});

test("health says whether the AI is set up", async () => {
  const withKey = await (await fetch("http://127.0.0.1:18764/api/chat/health")).json();
  const withoutKey = await (await fetch("http://127.0.0.1:18765/api/chat/health")).json();
  assert.deepEqual(withKey, { ok: true, ai: true });
  assert.deepEqual(withoutKey, { ok: true, ai: false });
});

test("a normal message gets Zazo's answer", async () => {
  fakeAnswer = { reply: "Come, I will show you the Singing Falls!", scene: "waterfall", pose: "pointing" };
  const response = await post(18764, { message: "Where is the water?", name: "Ann", history: [] });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), fakeAnswer);
});

test("the key goes in a header, never in the address", async () => {
  await post(18764, { message: "Hi", name: "Ann" });
  assert.equal(lastRequest.headers["x-goog-api-key"], "test-key");
  assert.ok(!lastRequest.url.includes("test-key"));
});

test("the visitor's name and earlier turns are sent to Gemini", async () => {
  await post(18764, {
    message: "And now?",
    name: "Ann",
    history: [{ you: "Hello", zazo: "Hello, Ann!" }],
  });
  assert.match(lastRequest.body.systemInstruction.parts[0].text, /visitor named Ann/);
  assert.deepEqual(
    lastRequest.body.contents.map((c) => c.role),
    ["user", "model", "user"]
  );
});

test("unknown scenes and poses fall back to safe ones", async () => {
  fakeAnswer = { reply: "Hmm!", scene: "the moon", pose: "dancing" };
  const answer = await (await post(18764, { message: "Hi", name: "Ann" })).json();
  assert.equal(answer.scene, "stay");
  assert.equal(answer.pose, "talking");
});

test("very long replies are cut short", async () => {
  fakeAnswer = { reply: "a".repeat(1000), scene: "stay", pose: "idle" };
  const answer = await (await post(18764, { message: "Hi", name: "Ann" })).json();
  assert.equal(answer.reply.length, 400);
});

test("no key means the website should use the fixed answers", async () => {
  const response = await post(18765, { message: "Hi", name: "Ann" });
  assert.equal(response.status, 503);
});

test("bad requests are turned away", async () => {
  assert.equal((await post(18764, "not json")).status, 400);
  assert.equal((await post(18764, { message: "", name: "Ann" })).status, 400);
  assert.equal((await post(18764, { message: "Hi", name: "" })).status, 400);
  assert.equal((await post(18764, { message: "Hi", name: "x".repeat(21) })).status, 400);
  assert.equal((await post(18764, { message: "Hi", name: "Ann", history: "no" })).status, 400);
});

test("requests from other websites are turned away", async () => {
  const response = await post(18764, { message: "Hi", name: "Ann" }, { Origin: "https://evil.example" });
  assert.equal(response.status, 403);
});

test("too many messages in a minute are slowed down", async () => {
  fakeAnswer = { reply: "Hi!", scene: "stay", pose: "idle" };
  const statuses = [];
  for (let i = 0; i < 25; i++) {
    statuses.push((await post(18764, { message: "Hi", name: "Ann" })).status);
  }
  assert.ok(statuses.includes(429));
});
