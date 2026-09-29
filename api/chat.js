// The AI helper as a Vercel function, for the website online.
//
//   GET  /api/chat   answers {"ok":true,"ai":true|false}
//   POST /api/chat   the same as the helper on your computer (ai/server.js)
//
// The Gemini work is shared with the local helper, in ai/zazo-ai.js.
// The key is set in the Vercel project settings as GEMINI_API_KEY.
//
// Online, anyone could try to use this, so it adds its own guards:
//   1. Only our own websites can call it: the Vercel site itself, and the
//      addresses in ALLOWED_ORIGINS (the GitHub Pages site).
//   2. Each visitor gets a few messages a minute.
//   3. There is a daily limit, so the free Gemini quota is not used up.
// These limits are counted by each running copy of the function. Vercel
// may run a few copies, so they are a safety net, not a perfect count.

import { answerChat, hasKey } from "../ai/zazo-ai.js";

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "https://rmagdaleena2508-01.github.io")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const PER_VISITOR_PER_MINUTE = Number(process.env.PER_VISITOR_PER_MINUTE || 8);
const PER_DAY = Number(process.env.PER_DAY || 300);

// ---------- Who is asking ----------

// The website on the same address as this function, or one of the allowed
// websites. A request with no Origin at all is not from a browser page.
export function isAllowedOrigin(origin, host) {
  if (!origin) return false;
  return origin === `https://${host}` || ALLOWED_ORIGINS.includes(origin);
}

// ---------- Limits ----------

const visitors = new Map(); // visitor address, times of their recent messages
let day = new Date().toISOString().slice(0, 10);
let today = 0;

export function underLimits(visitor, now = Date.now()) {
  const date = new Date(now).toISOString().slice(0, 10);
  if (date !== day) {
    day = date;
    today = 0;
  }
  if (today >= PER_DAY) return false;

  const recent = (visitors.get(visitor) ?? []).filter((time) => now - time < 60_000);
  if (recent.length >= PER_VISITOR_PER_MINUTE) {
    visitors.set(visitor, recent);
    return false;
  }
  recent.push(now);
  visitors.set(visitor, recent);
  today++;

  // Forget visitors who have gone quiet, so this list stays small.
  if (visitors.size > 5000) {
    for (const [key, times] of visitors) {
      if (!times.some((time) => now - time < 60_000)) visitors.delete(key);
    }
  }
  return true;
}

// ---------- The function ----------

function send(res, status, body) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.status(status).send(JSON.stringify(body));
}

export default async function handler(req, res) {
  const origin = req.headers.origin;
  const host = req.headers["x-forwarded-host"] ?? req.headers.host;

  if (req.method === "GET") {
    send(res, 200, { ok: true, ai: hasKey() });
    return;
  }

  if (!isAllowedOrigin(origin, host)) {
    send(res, 403, { error: "not allowed" });
    return;
  }

  // Let the GitHub Pages site call this from its own address.
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Vary", "Origin");

  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods", "POST");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Access-Control-Max-Age", "600");
    res.status(204).end();
    return;
  }
  if (req.method !== "POST") {
    send(res, 405, { error: "use POST" });
    return;
  }

  // Vercel reads the JSON body already. Anything else is a bad request.
  const data = typeof req.body === "object" && req.body !== null ? req.body : null;
  if (!data) {
    send(res, 400, { error: "bad request" });
    return;
  }

  const visitor = String(req.headers["x-forwarded-for"] ?? "").split(",")[0].trim() || "unknown";
  const { status, body } = await answerChat(data, () => underLimits(visitor));
  send(res, status, body);
}
