// Tests for the AI helper. Run with: npm test
//
// These never call the real Gemini. A tiny fake Gemini runs on this
// computer instead, so the tests are free, fast, and need no key.

import { test, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const SERVER = fileURLToPath(new URL("../server.js", import.meta.url));
const FAKE_PORT = 18763;

// How the fake Gemini behaves, per model. Each value is a function that
// gets the request and returns [status, body].
const ok = (answer) => () => [200, { candidates: [{ finishReason: "STOP", content: { parts: [{ text: JSON.stringify(answer) }] } }] }];
let behavior = {};
let requests = [];

const fakeGemini = createServer((req, res) => {
  let body = "";
  req.on("data", (chunk) => (body += chunk));
  req.on("end", () => {
    const model = decodeURIComponent(req.url.split("/models/")[1].split(":")[0]);
    const request = { model, headers: req.headers, url: req.url, body: JSON.parse(body) };
    requests.push(request);
    const [status, reply] = (behavior[model] ?? ok({ reply: "Hi!", scene: "stay", pose: "idle" }))(request);
    res.writeHead(status, { "Content-Type": "application/json" });
    res.end(JSON.stringify(reply));
  });
});

const helpers = [];

// Start the helper on a port, with or without a key.
// restSeconds: how long a busy model rests. 0 turns resting off, so the
// tests do not affect each other. Leave it out to use the normal times.
function startHelper(port, key, restSeconds = "0") {
  const env = {
    PATH: process.env.PATH,
    PORT: String(port),
    GEMINI_API_KEY: key,
    GEMINI_MODEL: "fast-model",
    GEMINI_BACKUP_MODEL: "backup-model",
    GEMINI_EXTRA_MODELS: "third-model",
    GEMINI_API_URL: `http://127.0.0.1:${FAKE_PORT}/v1beta`,
  };
  if (restSeconds !== null) env.GEMINI_REST_SECONDS = restSeconds;
  const child = spawn(process.execPath, [SERVER], {
    env,
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
  await startHelper(18764, "AIzaTestKey");
  await startHelper(18765, "");
  await startHelper(18766, "AIzaTestKey", null); // normal resting times
});

after(() => {
  helpers.forEach((child) => child.kill());
  fakeGemini.close();
});

beforeEach(() => {
  behavior = {};
  requests = [];
});

test("health says whether the AI is set up", async () => {
  const withKey = await (await fetch("http://127.0.0.1:18764/api/chat/health")).json();
  const withoutKey = await (await fetch("http://127.0.0.1:18765/api/chat/health")).json();
  assert.deepEqual(withKey, { ok: true, ai: true });
  assert.deepEqual(withoutKey, { ok: true, ai: false });
});

test("a normal message gets Zazo's answer from the fast model", async () => {
  behavior["fast-model"] = ok({ reply: "Come, I will show you the Singing Falls!", scene: "waterfall", pose: "pointing" });
  const response = await post(18764, { message: "Where is the water?", name: "Ann" });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    reply: "Come, I will show you the Singing Falls!",
    scene: "waterfall",
    benji: "",
    pose: "pointing",
    choices: [],
    source: "ai",
  });
  assert.deepEqual(requests.map((r) => r.model), ["fast-model"]);
});

test("the request asks for little thinking, safe answers, and JSON", async () => {
  await post(18764, { message: "Hi", name: "Ann" });
  const { generationConfig, safetySettings } = requests[0].body;
  assert.equal(generationConfig.thinkingConfig.thinkingLevel, "low");
  assert.equal(generationConfig.responseMimeType, "application/json");
  assert.ok(generationConfig.maxOutputTokens >= 1024);
  assert.ok(safetySettings.every((s) => s.threshold === "BLOCK_LOW_AND_ABOVE"));
});

test("Zazo's files, the name, and the current place are all sent", async () => {
  await post(18764, { message: "Hi", name: "Ann", scene: "family-hut" });
  const instructions = requests[0].body.systemInstruction.parts[0].text;
  assert.match(instructions, /34 summers old/); // from character.md
  assert.match(instructions, /These rules always win/); // from rules.md
  assert.match(instructions, /Example answers/); // from examples.md
  assert.match(instructions, /visitor named Ann/);
  assert.match(instructions, /standing at your family hut/);
});

test("the whole story book is in the instructions, not a PDF", async () => {
  await post(18764, { message: "Who is Tiri?", name: "Ann" });
  const { systemInstruction, contents } = requests[0].body;
  assert.match(systemInstruction.parts[0].text, /Chapter 1: How the islands learned to speak backwards/);
  assert.deepEqual(contents.at(-1).parts, [{ text: "Who is Tiri?" }]);
});

test("Zazo is told which places the visitor has seen", async () => {
  await post(18764, { message: "Show me around", name: "Ann", scene: "village", seen: ["island-arrival", "jungle-path"] });
  const instructions = requests[0].body.systemInstruction.parts[0].text;
  assert.match(instructions, /has seen: the beach, the jungle path/);
  assert.match(instructions, /has not seen yet: your family hut, the Singing Falls, the lookout hill, the campfire at night/);
});

test("the key goes in a header, never in the address", async () => {
  await post(18764, { message: "Hi", name: "Ann" });
  assert.equal(requests[0].headers["x-goog-api-key"], "AIzaTestKey");
  assert.ok(!requests[0].url.includes("AIzaTestKey"));
});

test("earlier turns are sent so Zazo remembers the chat", async () => {
  await post(18764, { message: "And now?", name: "Ann", history: [{ you: "Hello", zazo: "Hello, Ann!" }] });
  assert.deepEqual(
    requests[0].body.contents.map((c) => c.role),
    ["user", "model", "user"]
  );
});

test("a busy fast model hands over to the backup model", async () => {
  behavior["fast-model"] = () => [503, { error: { message: "high demand" } }];
  behavior["backup-model"] = ok({ reply: "Hello from the backup!", scene: "stay", pose: "welcome" });
  const answer = await (await post(18764, { message: "Hi", name: "Ann" })).json();
  assert.equal(answer.reply, "Hello from the backup!");
  assert.deepEqual(requests.map((r) => r.model), ["fast-model", "backup-model"]);
});

test("when two models are busy or out of quota, the third one answers", async () => {
  behavior["fast-model"] = () => [503, { error: { message: "busy" } }];
  behavior["backup-model"] = () => [429, { error: { message: "quota" } }];
  behavior["third-model"] = ok({ reply: "Third time lucky!", scene: "stay", pose: "laughing" });
  const answer = await (await post(18764, { message: "Hi", name: "Ann" })).json();
  assert.equal(answer.reply, "Third time lucky!");
});

test("a busy model rests, so the next message skips it", async () => {
  behavior["fast-model"] = () => [503, { error: { message: "busy" } }];
  behavior["backup-model"] = ok({ reply: "Backup here!", scene: "stay", pose: "idle" });
  await post(18766, { message: "Hi", name: "Ann" });
  requests = [];
  await post(18766, { message: "Hi again", name: "Ann" });
  assert.deepEqual(requests.map((r) => r.model), ["backup-model"]);
});

test("a model that does not take the thinking setting is asked again without it", async () => {
  let calls = 0;
  behavior["fast-model"] = (request) => {
    calls++;
    if (request.body.generationConfig.thinkingConfig) {
      return [400, { error: { message: "Thinking level LOW is not supported for this model." } }];
    }
    return ok({ reply: "No thinking needed!", scene: "stay", pose: "idle" })();
  };
  const answer = await (await post(18764, { message: "Hi", name: "Ann" })).json();
  assert.equal(answer.reply, "No thinking needed!");
  assert.equal(calls, 2);
});

test("JSON wrapped in extra words or a code block is still read", async () => {
  behavior["fast-model"] = () => [200, {
    candidates: [{ finishReason: "STOP", content: { parts: [{ text: 'Here you go:\n```json\n{"reply":"Hi *there*!","scene":"stay","pose":"idle"}\n```' }] } }],
  }];
  const answer = await (await post(18764, { message: "Hi", name: "Ann" })).json();
  assert.equal(answer.reply, "Hi there!"); // stars are removed too
});

test("an answer cut off in the middle goes to the next model", async () => {
  behavior["fast-model"] = () => [200, { candidates: [{ finishReason: "MAX_TOKENS", content: { parts: [{ text: '{"reply": "Hel' }] } }] }];
  behavior["backup-model"] = ok({ reply: "Hello!", scene: "stay", pose: "idle" });
  const answer = await (await post(18764, { message: "Hi", name: "Ann" })).json();
  assert.equal(answer.reply, "Hello!");
});

test("a message blocked for safety gets Zazo's kind change of subject", async () => {
  behavior["fast-model"] = () => [200, { candidates: [{ finishReason: "SAFETY" }] }];
  const answer = await (await post(18764, { message: "something unsafe", name: "Ann" })).json();
  assert.match(answer.reply, /not something we talk about on the island/);
  assert.deepEqual(requests.map((r) => r.model), ["fast-model"]);
});

test("unknown scenes and poses fall back to safe ones", async () => {
  behavior["fast-model"] = ok({ reply: "Hmm!", scene: "the moon", pose: "dancing" });
  const answer = await (await post(18764, { message: "Hi", name: "Ann" })).json();
  assert.equal(answer.scene, "stay");
  assert.equal(answer.pose, "talking");
});

test("very long replies are cut short", async () => {
  behavior["fast-model"] = ok({ reply: "a".repeat(1000), scene: "stay", pose: "idle" });
  const answer = await (await post(18764, { message: "Hi", name: "Ann" })).json();
  assert.equal(answer.reply.length, 600);
});

test("when every model fails, the website is told to use the fixed answers", async () => {
  behavior["fast-model"] = () => [503, { error: { message: "busy" } }];
  behavior["backup-model"] = () => [503, { error: { message: "busy" } }];
  behavior["third-model"] = () => [503, { error: { message: "busy" } }];
  const response = await post(18764, { message: "Hi", name: "Ann" });
  assert.equal(response.status, 502);
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
  assert.equal((await post(18764, { message: "Hi", name: "Ann", scene: "the moon" })).status, 400);
  assert.equal((await post(18764, { message: "Hi", name: "Ann", seen: ["the moon"] })).status, 400);
});

test("requests from other websites are turned away", async () => {
  const response = await post(18764, { message: "Hi", name: "Ann" }, { Origin: "https://evil.example" });
  assert.equal(response.status, 403);
});


test("Benji's note and the visitor's choices come back short and clean", async () => {
  behavior["fast-model"] = ok({
    reply: "Hello!",
    benji: "He means the *goats*.",
    scene: "stay",
    pose: "welcome",
    choices: ["How did you *meet* Benji?", "How did you *meet* Benji?", "x".repeat(300), "one", "two"],
  });
  const answer = await (await post(18764, { message: "Hi", name: "Ann" })).json();
  assert.equal(answer.benji, "He means the goats.");
  assert.deepEqual(answer.choices, ["How did you meet Benji?", "x".repeat(60), "one"]);
});

test("an empty Benji note, written as (empty), is left out", async () => {
  behavior["fast-model"] = ok({ reply: "Hello!", benji: "(empty)", scene: "stay", pose: "welcome", choices: [] });
  const answer = await (await post(18764, { message: "Hi", name: "Ann" })).json();
  assert.equal(answer.benji, "");
});

test("going to the place Zazo is already in counts as staying", async () => {
  behavior["fast-model"] = ok({ reply: "Here we are!", scene: "waterfall", pose: "pointing" });
  const answer = await (await post(18764, { message: "Go to the falls", name: "Ann", scene: "waterfall" })).json();
  assert.equal(answer.scene, "stay");
});

// This one fills up the per-minute limit, so it runs last.
test("too many messages in a minute are slowed down", async () => {
  const statuses = [];
  for (let i = 0; i < 25; i++) {
    statuses.push((await post(18764, { message: "Hi", name: "Ann" })).status);
  }
  assert.ok(statuses.includes(429));
});
