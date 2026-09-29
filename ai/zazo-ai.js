// Everything that talks to Gemini for Zazo, shared by two places:
//   server.js      the helper you run on your own computer (npm start)
//   ../api/chat.js the same thing as a Vercel function, for the website online
//
// Who Zazo is and the rules he follows are in the zazo/ folder. His full
// life story is in story/zazo-story.pdf, which is uploaded to Gemini and
// attached to every message, so Gemini looks things up in it first.
//
// The Gemini key comes from GEMINI_API_KEY (the .env file on your computer,
// or the project settings on Vercel). It is never sent to the website and
// never written to the logs.

import { readFileSync } from "node:fs";
import { ANSWER_SCHEMA, POSES, SAFE_REPLY, SCENES, STORY_NOTE, systemPrompt } from "./prompt.js";

const API_KEY = process.env.GEMINI_API_KEY ?? "";
const GEMINI_URL = process.env.GEMINI_API_URL || "https://generativelanguage.googleapis.com/v1beta";
const UPLOAD_URL = GEMINI_URL.replace(/\/v1beta$/, "/upload/v1beta");

// The models to try, in order. On the free plan, Google often says a
// model is busy (503) or over its quota (429), so there are several.
// The first two can be changed in .env, and GEMINI_EXTRA_MODELS can
// replace the rest (a comma separated list).
export const MODELS = [
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

export const MAX_BODY = 8 * 1024; // bytes
const MAX_MESSAGE = 2000; // characters
const MAX_NAME = 20;
const MAX_HISTORY = 6; // earlier turns sent along, so Zazo remembers the chat
const MAX_REPLY = 400;
const MAX_SUGGESTION = 80;
const TRY_TIMEOUT_MS = 6_000; // one try at one model (they usually answer in 2 to 5 seconds)
const TOTAL_TIMEOUT_MS = 15_000; // every try together, so the visitor never waits too long

export const hasKey = () => API_KEY.length > 0;

// Gemini keys start with "AIza" or "AQ.". Anything else is usually a copy
// and paste slip, like an extra letter at the start.
export const keyLooksRight = () => /^(AIza|AQ\.)/.test(API_KEY);

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

// ---------- The story book PDF ----------

// The PDF is read once, when the helper starts.
const STORY_PDF = readFileSync(new URL("./story/zazo-story.pdf", import.meta.url));

// Once uploaded, Gemini keeps the file for 48 hours. We remember where it
// is and upload it again shortly before it runs out.
let storyFile = null; // { uri, expiresAt }

async function uploadStory() {
  // Step 1: tell Gemini a PDF is coming. It answers with a private
  // address to send the file to.
  const start = await fetch(`${UPLOAD_URL}/files`, {
    method: "POST",
    headers: {
      "x-goog-api-key": API_KEY,
      "Content-Type": "application/json",
      "X-Goog-Upload-Protocol": "resumable",
      "X-Goog-Upload-Command": "start",
      "X-Goog-Upload-Header-Content-Length": String(STORY_PDF.length),
      "X-Goog-Upload-Header-Content-Type": "application/pdf",
    },
    body: JSON.stringify({ file: { display_name: "The Zazo Story Book" } }),
    signal: AbortSignal.timeout(10_000),
  });
  const sendTo = start.headers.get("x-goog-upload-url");
  // Only ever send the file back to Gemini itself.
  if (!start.ok || !sendTo || new URL(sendTo).origin !== new URL(UPLOAD_URL).origin) {
    throw new Error(`the upload could not start (${start.status})`);
  }

  // Step 2: send the PDF.
  const done = await fetch(sendTo, {
    method: "POST",
    headers: { "X-Goog-Upload-Offset": "0", "X-Goog-Upload-Command": "upload, finalize" },
    body: STORY_PDF,
    signal: AbortSignal.timeout(20_000),
  });
  const data = await done.json().catch(() => ({}));
  if (!done.ok || typeof data?.file?.uri !== "string") throw new Error(`the upload failed (${done.status})`);

  const expires = Date.parse(data.file.expirationTime ?? "") || Date.now() + 47 * 3600 * 1000;
  storyFile = { uri: data.file.uri, expiresAt: expires };
  console.log("Uploaded the Zazo Story Book PDF to Gemini.");
}

// The story book, ready to attach to a message. If uploading does not
// work, the PDF is sent inside the message instead, so Zazo still has it.
let uploading = null; // an upload that is already on its way, so it only happens once
async function storyPart() {
  if (!storyFile || storyFile.expiresAt - Date.now() < 10 * 60 * 1000) {
    uploading ??= uploadStory().finally(() => (uploading = null));
    try {
      await uploading;
    } catch (error) {
      console.error(`Could not upload the story book, so it is sent inside the message: ${error.message}`);
      return { inlineData: { mimeType: "application/pdf", data: STORY_PDF.toString("base64") } };
    }
  }
  return { fileData: { mimeType: "application/pdf", fileUri: storyFile.uri } };
}

// ---------- One try at one model ----------

async function askOnce(model, { message, name, history, scene }, timeLeft) {
  // Earlier turns first, so Gemini knows what was already said.
  const contents = [];
  for (const turn of history) {
    contents.push({ role: "user", parts: [{ text: turn.you }] });
    contents.push({ role: "model", parts: [{ text: turn.zazo }] });
  }
  // The newest message comes with the story book, so Gemini can look
  // things up in it.
  contents.push({ role: "user", parts: [await storyPart(), { text: STORY_NOTE }, { text: message }] });

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
    // The uploaded story book was not found (it may have run out). Upload
    // it again on the next try.
    if (/file/i.test(reason) && [400, 403, 404].includes(response.status)) {
      storyFile = null;
      throw new GeminiError(`Gemini could not open the story book: ${reason.slice(0, 120)}`, { retry: true });
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
  // The next question to suggest to the visitor. Short and plain, or none.
  const suggestion =
    typeof answer.suggestion === "string" ? cleanReply(answer.suggestion).slice(0, MAX_SUGGESTION) : "";
  return {
    reply,
    scene: SCENES.includes(answer.scene) ? answer.scene : "stay",
    pose: POSES.includes(answer.pose) ? answer.pose : "talking",
    suggestion,
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

// Upload the story book early, so the first message is fast.
export function warmUp() {
  if (hasKey()) storyPart().catch(() => {});
}

// Answer one chat message. "data" is what the website sent, already read
// as JSON. "allow" is the caller's limit on how many messages it takes;
// it is only asked about messages that passed every check.
// Returns { status, body } for the caller to send back.
export async function answerChat(data, allow = () => true) {
  // No key: the website falls back to Zazo's fixed answers.
  if (!hasKey()) return { status: 503, body: { error: "the AI is not set up" } };

  const request = checkRequest(data);
  if (!request) return { status: 400, body: { error: "bad request" } };

  if (!allow()) return { status: 429, body: { error: "too many messages, please wait a moment" } };

  try {
    return { status: 200, body: { ...(await askGemini(request)), source: "ai" } };
  } catch {
    // The reason was already logged. Never log the key or the message.
    return { status: 502, body: { error: "the AI did not answer" } };
  }
}
