// The AI helper for your own computer. It asks Gemini what Zazo should say.
//
//   GET  /api/chat/health   answers {"ok":true,"ai":true|false}
//   POST /api/chat          send {"message", "name", "history", "scene"},
//                           get back {"reply", "scene", "pose",
//                           "suggestion", "source"} in plain English
//
// The Gemini work itself is in zazo-ai.js, which the Vercel function
// (../api/chat.js) uses too. This file only adds the local server around
// it: it only answers this computer, and allows 20 messages a minute.
//
// The key is read from the .env file in this folder.
//
// Run with: npm start

import { createServer } from "node:http";
import { MAX_BODY, MODELS, answerChat, hasKey, keyLooksRight, warmUp } from "./zazo-ai.js";

const PORT = Number(process.env.PORT ?? 8764);

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

const server = createServer(async (req, res) => {
  if (!isFromThisComputer(req)) {
    send(res, 403, { error: "not allowed" });
    return;
  }

  const path = (req.url ?? "").split("?")[0];

  if (path === "/api/chat/health") {
    send(res, 200, { ok: true, ai: hasKey() });
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

  let data;
  try {
    data = JSON.parse(await readBody(req));
  } catch {
    send(res, 400, { error: "bad request" });
    return;
  }

  const { status, body } = await answerChat(data, underRateLimit);
  send(res, status, body);
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Tribezo AI helper is listening on http://127.0.0.1:${PORT}`);
  if (!hasKey()) {
    console.log("No GEMINI_API_KEY found, so Zazo will use his fixed answers.");
    return;
  }
  console.log(`Models, in order: ${MODELS.join(", ")}.`);
  warmUp();
  if (!keyLooksRight()) {
    console.log("Warning: the key does not look like a Gemini key. Check GEMINI_API_KEY in .env for extra letters.");
  }
});
