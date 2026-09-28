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
let uploads = 0;
let uploadFails = false;

const fakeGemini = createServer((req, res) => {
  let body = "";
  req.on("data", (chunk) => (body += chunk));
  req.on("end", () => {
    // The story book upload: step 1 gives an address, step 2 takes the PDF.
    if (req.url === "/upload/v1beta/files") {
      if (uploadFails) {
        res.writeHead(500).end();
        return;
      }
      res.writeHead(200, { "x-goog-upload-url": `http://127.0.0.1:${FAKE_PORT}/upload/v1beta/session` }).end("{}");
      return;
    }
    if (req.url === "/upload/v1beta/session") {
      uploads++;
      const expirationTime = new Date(Date.now() + 48 * 3600 * 1000).toISOString();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ file: { uri: "https://fake.example/files/zazo-story", expirationTime } }));
      return;
    }

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
    pose: "pointing",
    suggestion: "",
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
  assert.equal(answer.reply.length, 400);
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
});

test("requests from other websites are turned away", async () => {
  const response = await post(18764, { message: "Hi", name: "Ann" }, { Origin: "https://evil.example" });
  assert.equal(response.status, 403);
});


test("the story book PDF is uploaded once and attached to every message", async () => {
  await post(18764, { message: "Who is your grandmother?", name: "Ann" });
  await post(18764, { message: "And your father?", name: "Ann" });
  for (const request of requests) {
    const parts = request.body.contents.at(-1).parts;
    assert.deepEqual(parts[0], { fileData: { mimeType: "application/pdf", fileUri: "https://fake.example/files/zazo-story" } });
    assert.match(parts[1].text, /Zazo Story Book/);
  }
  assert.ok(uploads <= 4); // once per helper at start, never once per message
});

test("if uploading fails, the PDF is sent inside the message instead", async () => {
  uploadFails = true;
  const port = 18767;
  await startHelper(port, "AIzaTestKey");
  await new Promise((resolve) => setTimeout(resolve, 200));
  await post(port, { message: "Hi", name: "Ann" });
  uploadFails = false;
  const inline = requests.at(-1).body.contents.at(-1).parts[0].inlineData;
  assert.equal(inline.mimeType, "application/pdf");
  assert.ok(Buffer.from(inline.data, "base64").subarray(0, 5).toString() === "%PDF-");
});

test("Zazo sends back a suggested next question, short and clean", async () => {
  behavior["fast-model"] = ok({ reply: "Hello!", scene: "stay", pose: "welcome", suggestion: "How did you *meet* Benji?" });
  const answer = await (await post(18764, { message: "Hi", name: "Ann" })).json();
  assert.equal(answer.suggestion, "How did you meet Benji?");
  behavior["fast-model"] = ok({ reply: "Hello!", scene: "stay", pose: "welcome", suggestion: "x".repeat(300) });
  const long = await (await post(18764, { message: "Hi", name: "Ann" })).json();
  assert.equal(long.suggestion.length, 80);
});

// This one fills up the per-minute limit, so it runs last.
test("too many messages in a minute are slowed down", async () => {
  const statuses = [];
  for (let i = 0; i < 25; i++) {
    statuses.push((await post(18764, { message: "Hi", name: "Ann" })).status);
  }
  assert.ok(statuses.includes(429));
});
