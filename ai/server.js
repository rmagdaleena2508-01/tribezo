// A small helper server that asks Gemini what Zazo should say.
//
//   GET  /api/chat/health   answers {"ok":true,"ai":true|false}
//   POST /api/chat          send {"message", "name", "history", "scene"},
//                           get back {"reply", "scene", "pose", "source"}
//                           in plain English
//
// Who Zazo is and the rules he follows are in the zazo/ folder.
//
// The C server still does all the reversing. This helper only writes
// Zazo's answer in normal English.
//
// The Gemini key is read from the .env file in this folder. It stays on
// this computer: it is never sent to the website, and never written to
// the logs.
//
// Run with: npm start

import { createServer } from "node:http";
import { ANSWER_SCHEMA, POSES, SAFE_REPLY, SCENES, systemPrompt } from "./prompt.js";

const PORT = Number(process.env.PORT ?? 8764);
const API_KEY = process.env.GEMINI_API_KEY ?? "";
const GEMINI_URL = process.env.GEMINI_API_URL || "https://generativelanguage.googleapis.com/v1beta";

// The models to try, in order. On the free plan, Google often says a
// model is busy (503) or over its quota (429), so there are several.
// The first two can be changed in .env, and GEMINI_EXTRA_MODELS can
// replace the rest (a comma separated list).
const MODELS = [
  process.env.GEMINI_MODEL || "gemini-flash-lite-latest",
  process.env.GEMINI_BACKUP_MODEL || "gemini-3.8-flash",
  ...(process.env.GEMINI_EXTRA_MODELS || "gemini-3.6-flash,gemini-3.1-flash-lite,gemini-3.5-flash").split(","),
]
  .map((model) => model.trim())
  .filter((model, i, all) => model && all.indexOf(model) === i);

// When a model says it is busy or out of quota, it rests for a while and
// the next models answer instead, so the visitor does not wait for a
// model that will say no again.
const REST_SECONDS = { 503: 30, 429: 60, 404: 3600, timeout: 20 };
const restUntil = new Map(); // model name, time it can be tried again
function rest(model, reason) {
  const seconds = process.env.GEMINI_REST_SECONDS !== undefined ? Number(process.env.GEMINI_REST_SECONDS) : REST_SECONDS[reason] ?? 0;
  if (seconds > 0) restUntil.set(model, Date.now() + seconds * 1000);
}
const isResting = (model) => (restUntil.get(model) ?? 0) > Date.now();

const MAX_BODY = 8 * 1024; // bytes
const MAX_MESSAGE = 2000; // characters
const MAX_NAME = 20;
const MAX_HISTORY = 6; // earlier turns sent along, so Zazo remembers the chat
const MAX_REPLY = 400;
const TRY_TIMEOUT_MS = 6_000; // one try at one model (they usually answer in 2 to 5 seconds)
const TOTAL_TIMEOUT_MS = 15_000; // every try together, so the visitor never waits too long

// No more than this many AI calls per minute, so the free quota lasts.
const CALLS_PER_MINUTE = 20;
let recentCalls = [];

// ---------- Small helpers ----------

function send(res, status, body) {
  const json = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(json),
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  });
  res.end(json);
}

// Only answer requests that come from this computer, the same check as
// the C server. Host must be this computer. Origin, if a browser sent
// one, must be a page on this computer.
function isFromThisComputer(req) {
  const local = /^(localhost|127\.0\.0\.1)(:\d+)?$/i;
  const host = req.headers.host ?? "";
  const origin = req.headers.origin;
  if (!local.test(host)) return false;
  if (origin !== undefined && !/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)) return false;
  return true;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY) {
        reject(new Error("too big"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function underRateLimit() {
  const now = Date.now();
  recentCalls = recentCalls.filter((time) => now - time < 60_000);
  if (recentCalls.length >= CALLS_PER_MINUTE) return false;
  recentCalls.push(now);
  return true;
}

// Check what the website sent. Returns the clean values, or null.
function checkRequest(data) {
  if (typeof data !== "object" || data === null) return null;
  const { message, name, history = [], scene = "village" } = data;
  if (typeof message !== "string" || message.trim().length === 0 || message.length > MAX_MESSAGE) return null;
  if (typeof name !== "string" || name.length === 0 || name.length > MAX_NAME) return null;
  if (typeof scene !== "string" || !SCENES.includes(scene)) return null;
  if (!Array.isArray(history) || history.length > MAX_HISTORY) return null;
  for (const turn of history) {
    if (typeof turn !== "object" || turn === null) return null;
    if (typeof turn.you !== "string" || typeof turn.zazo !== "string") return null;
    if (turn.you.length > MAX_MESSAGE || turn.zazo.length > MAX_REPLY) return null;
  }
  return { message: message.trim(), name, history, scene };
}

// ---------- Asking Gemini ----------

// Ask Gemini to block anything unsafe for children, even at a low chance.
const SAFETY_SETTINGS = [
  "HARM_CATEGORY_HARASSMENT",
  "HARM_CATEGORY_HATE_SPEECH",
  "HARM_CATEGORY_SEXUALLY_EXPLICIT",
  "HARM_CATEGORY_DANGEROUS_CONTENT",
].map((category) => ({ category, threshold: "BLOCK_LOW_AND_ABOVE" }));

// Some models do not take the "think a little" setting. They are
// remembered here, so the setting is left out for them next time.
const noThinkingSetting = new Set();

class GeminiError extends Error {
  constructor(message, { retry = false, rest = null } = {}) {
    super(message);
    this.retry = retry; // true if another model might work
    this.rest = rest; // why this model should rest for a while, if it should
  }
}

// Pull the JSON object out of Gemini's text, even if it added extra words
// or wrapped it in a code block.
function readJson(text) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end <= start) throw new GeminiError("Gemini sent no JSON", { retry: true });
  return JSON.parse(text.slice(start, end + 1));
}

// Clean up Zazo's words: no stars, hashes, or backticks, and not too long.
function cleanReply(text) {
  return text.replace(/[*#`_]/g, "").replace(/\s+/g, " ").trim().slice(0, MAX_REPLY);
}

async function askOnce(model, { message, name, history, scene }, timeLeft) {
  // Earlier turns first, so Gemini knows what was already said.
  const contents = [];
  for (const turn of history) {
    contents.push({ role: "user", parts: [{ text: turn.you }] });
    contents.push({ role: "model", parts: [{ text: turn.zazo }] });
  }
  contents.push({ role: "user", parts: [{ text: message }] });

  const generationConfig = {
    responseMimeType: "application/json",
    responseSchema: ANSWER_SCHEMA,
    temperature: 0.9,
    // Thinking uses up the answer's space, and Zazo's answers are short,
    // so the model is asked to think only a little.
    maxOutputTokens: 1024,
  };
  if (!noThinkingSetting.has(model)) generationConfig.thinkingConfig = { thinkingLevel: "low" };

  let response;
  try {
    response = await fetch(`${GEMINI_URL}/models/${encodeURIComponent(model)}:generateContent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // The key goes in a header, not the address, so it never shows up in logs.
        "x-goog-api-key": API_KEY,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt(name, scene) }] },
        contents,
        generationConfig,
        safetySettings: SAFETY_SETTINGS,
      }),
      signal: AbortSignal.timeout(Math.min(TRY_TIMEOUT_MS, timeLeft)),
    });
  } catch {
    throw new GeminiError("Gemini took too long or could not be reached", { retry: true, rest: "timeout" });
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const reason = data?.error?.message ?? "";
    // This model does not take the thinking setting: try it again without.
    if (response.status === 400 && /thinking/i.test(reason) && !noThinkingSetting.has(model)) {
      noThinkingSetting.add(model);
      return askOnce(model, { message, name, history, scene }, timeLeft);
    }
    // Busy, over quota, or gone: another model might work.
    const retry = response.status === 429 || response.status >= 500 || response.status === 404;
    const restReason = response.status >= 500 ? 503 : response.status;
    throw new GeminiError(`Gemini answered ${response.status}: ${reason.slice(0, 160)}`, { retry, rest: retry ? restReason : null });
  }

  // Blocked for safety: Zazo kindly changes the subject.
  const candidate = data?.candidates?.[0];
  if (data?.promptFeedback?.blockReason || ["SAFETY", "PROHIBITED_CONTENT", "BLOCKLIST", "SPII"].includes(candidate?.finishReason)) {
    return { ...SAFE_REPLY, note: "blocked for safety" };
  }

  const text = candidate?.content?.parts?.map((part) => part.text ?? "").join("") ?? "";
  if (!text) throw new GeminiError(`Gemini sent no text (${candidate?.finishReason ?? "no reason"})`, { retry: true });

  // Double-check everything, even though Gemini was told the shape.
  let answer;
  try {
    answer = readJson(text);
  } catch (error) {
    if (error instanceof GeminiError) throw error;
    throw new GeminiError(`Gemini sent broken JSON (${candidate?.finishReason ?? "no reason"})`, { retry: true });
  }
  const reply = typeof answer.reply === "string" ? cleanReply(answer.reply) : "";
  if (!reply) throw new GeminiError("Gemini sent an empty reply", { retry: true });
  return {
    reply,
    scene: SCENES.includes(answer.scene) ? answer.scene : "stay",
    pose: POSES.includes(answer.pose) ? answer.pose : "talking",
  };
}

// Try each model in order, skipping the ones that are resting, until one
// answers or the time runs out. If every model is resting, try them all
// anyway, because one of them may be ready again.
async function askGemini(request) {
  const started = Date.now();
  const ready = MODELS.filter((model) => !isResting(model));
  const order = ready.length > 0 ? ready : MODELS;
  let lastError;
  for (const model of order) {
    const timeLeft = TOTAL_TIMEOUT_MS - (Date.now() - started);
    if (timeLeft < 1500) break;
    try {
      const answer = await askOnce(model, request, timeLeft);
      restUntil.delete(model);
      console.log(`AI answered with ${model} in ${Date.now() - started} ms${answer.note ? ` (${answer.note})` : ""}`);
      delete answer.note;
      return answer;
    } catch (error) {
      lastError = error;
      console.error(`AI try with ${model} failed: ${error.message}`);
      if (error instanceof GeminiError && error.rest) rest(model, error.rest);
      if (!(error instanceof GeminiError) || !error.retry) break;
    }
  }
  throw lastError ?? new Error("no time left");
}

// ---------- The server ----------

const server = createServer(async (req, res) => {
  if (!isFromThisComputer(req)) {
    send(res, 403, { error: "not allowed" });
    return;
  }

  const path = (req.url ?? "").split("?")[0];

  if (path === "/api/chat/health") {
    send(res, 200, { ok: true, ai: API_KEY.length > 0 });
    return;
  }

  if (path !== "/api/chat") {
    send(res, 404, { error: "not found" });
    return;
  }
  if (req.method !== "POST") {
    send(res, 405, { error: "use POST" });
    return;
  }

  // No key yet: the website falls back to Zazo's fixed answers.
  if (!API_KEY) {
    send(res, 503, { error: "the AI is not set up" });
    return;
  }

  let request;
  try {
    request = checkRequest(JSON.parse(await readBody(req)));
  } catch {
    request = null;
  }
  if (!request) {
    send(res, 400, { error: "bad request" });
    return;
  }

  if (!underRateLimit()) {
    send(res, 429, { error: "too many messages, please wait a moment" });
    return;
  }

  try {
    send(res, 200, { ...(await askGemini(request)), source: "ai" });
  } catch (error) {
    // The reason was already logged above. Never log the key or the message.
    send(res, 502, { error: "the AI did not answer" });
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Tribezo AI helper is listening on http://127.0.0.1:${PORT}`);
  if (!API_KEY) {
    console.log("No GEMINI_API_KEY found, so Zazo will use his fixed answers.");
    return;
  }
  console.log(`Models, in order: ${MODELS.join(", ")}.`);
  // Gemini keys start with "AIza" or "AQ.". Anything else is usually a
  // copy and paste slip, like an extra letter at the start.
  if (!/^(AIza|AQ\.)/.test(API_KEY)) {
    console.log("Warning: the key does not look like a Gemini key. Check GEMINI_API_KEY in .env for extra letters.");
  }
});
