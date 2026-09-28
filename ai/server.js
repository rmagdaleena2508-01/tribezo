// A small helper server that asks Gemini what Zazo should say.
//
//   GET  /api/chat/health   answers {"ok":true,"ai":true|false}
//   POST /api/chat          send {"message", "name", "history"}, get back
//                           {"reply", "scene", "pose"} in plain English
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
import { ANSWER_SCHEMA, POSES, SCENES, systemPrompt } from "./prompt.js";

const PORT = Number(process.env.PORT ?? 8764);
const API_KEY = process.env.GEMINI_API_KEY ?? "";
const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const GEMINI_URL = process.env.GEMINI_API_URL || "https://generativelanguage.googleapis.com/v1beta";

const MAX_BODY = 8 * 1024; // bytes
const MAX_MESSAGE = 2000; // characters
const MAX_NAME = 20;
const MAX_HISTORY = 6; // earlier turns sent along, so Zazo remembers the chat
const MAX_REPLY = 400;
const TIMEOUT_MS = 10_000;

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
  const { message, name, history = [] } = data;
  if (typeof message !== "string" || message.trim().length === 0 || message.length > MAX_MESSAGE) return null;
  if (typeof name !== "string" || name.length === 0 || name.length > MAX_NAME) return null;
  if (!Array.isArray(history) || history.length > MAX_HISTORY) return null;
  for (const turn of history) {
    if (typeof turn !== "object" || turn === null) return null;
    if (typeof turn.you !== "string" || typeof turn.zazo !== "string") return null;
    if (turn.you.length > MAX_MESSAGE || turn.zazo.length > MAX_REPLY) return null;
  }
  return { message: message.trim(), name, history };
}

// ---------- Asking Gemini ----------

async function askGemini({ message, name, history }) {
  // Earlier turns first, so Gemini knows what was already said.
  const contents = [];
  for (const turn of history) {
    contents.push({ role: "user", parts: [{ text: turn.you }] });
    contents.push({ role: "model", parts: [{ text: turn.zazo }] });
  }
  contents.push({ role: "user", parts: [{ text: message }] });

  const response = await fetch(`${GEMINI_URL}/models/${encodeURIComponent(MODEL)}:generateContent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // The key goes in a header, not the address, so it never shows up in logs.
      "x-goog-api-key": API_KEY,
    },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt(name) }] },
      contents,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: ANSWER_SCHEMA,
        temperature: 0.8,
        maxOutputTokens: 300,
      },
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`Gemini answered ${response.status}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof text !== "string") throw new Error("Gemini sent no text");

  // Double-check everything, even though Gemini was told the shape.
  const answer = JSON.parse(text);
  const reply = typeof answer.reply === "string" ? answer.reply.trim().slice(0, MAX_REPLY) : "";
  if (!reply) throw new Error("Gemini sent an empty reply");
  return {
    reply,
    scene: SCENES.includes(answer.scene) ? answer.scene : "stay",
    pose: POSES.includes(answer.pose) ? answer.pose : "talking",
  };
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
    send(res, 200, await askGemini(request));
  } catch (error) {
    // Log a short reason for the developer. Never log the key or the message.
    console.error(`AI call failed: ${error.message}`);
    send(res, 502, { error: "the AI did not answer" });
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Tribezo AI helper is listening on http://127.0.0.1:${PORT}`);
  console.log(API_KEY ? `Using ${MODEL}.` : "No GEMINI_API_KEY found, so Zazo will use his fixed answers.");
});
