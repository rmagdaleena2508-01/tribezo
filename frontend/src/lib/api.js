// Talking to the AI helper.
//
// Flipping words happens in the browser, with the C stack compiled to
// WebAssembly (see stack.js). Only Zazo's AI answers need a server:
//   on your computer, Vite passes /api/chat to the helper in ai/server.js
//   on Vercel, /api/chat is the function in api/chat.js
//   on GitHub Pages, VITE_API_BASE points at the Vercel address

const API_BASE = import.meta.env.VITE_API_BASE ?? "";

// Ask the AI helper what Zazo says back, in plain English.
// history is a few earlier turns, [{ you, zazo }], so Zazo remembers the chat.
// scene is where Zazo and the visitor are standing right now.
// Returns { reply, scene, pose, suggestion }, or throws if the AI is off or fails.
// The caller then uses Zazo's fixed answers instead.
export async function askZazo(message, name, history, scene) {
  const response = await fetch(`${API_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, name, history, scene }),
    // The helper may try a second model, so give it a little extra time.
    signal: AbortSignal.timeout(17000),
  });

  if (!response.ok) {
    throw new Error(`The AI helper answered ${response.status}.`);
  }

  const data = await response.json();
  if (typeof data.reply !== "string" || typeof data.scene !== "string" || typeof data.pose !== "string") {
    throw new Error("The AI helper's answer did not look right.");
  }
  const suggestion = typeof data.suggestion === "string" ? data.suggestion.slice(0, 80) : "";
  return { reply: data.reply, scene: data.scene, pose: data.pose, suggestion };
}
