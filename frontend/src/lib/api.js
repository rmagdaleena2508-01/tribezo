// Talking to the C server and the AI helper.
//
// The website only calls /api/... on its own address. Vite passes those
// calls on to the servers, so the browser never talks to them directly.

const TIMEOUT_MS = 8000;

// Send English, get XYZ back.
// Returns { english, xyz, pushes, pops }, or throws if anything goes wrong.
export async function reverseText(text) {
  // Give up if the server takes too long.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch("/api/reverse", {
      method: "POST",
      headers: { "Content-Type": "text/plain; charset=utf-8" },
      body: text,
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`The server answered ${response.status}.`);
    }

    // Only keep the parts we expect, and check they are the right kind.
    const data = await response.json();
    if (
      typeof data.english !== "string" ||
      typeof data.xyz !== "string" ||
      typeof data.pushes !== "number" ||
      typeof data.pops !== "number"
    ) {
      throw new Error("The server's answer did not look right.");
    }
    return { english: data.english, xyz: data.xyz, pushes: data.pushes, pops: data.pops };
  } finally {
    clearTimeout(timer);
  }
}

// Ask the AI helper what Zazo says back, in plain English.
// history is a few earlier turns, [{ you, zazo }], so Zazo remembers the chat.
// scene is where Zazo and the visitor are standing right now.
// Returns { reply, scene, pose }, or throws if the AI is off or fails.
// The caller then uses Zazo's fixed answers instead.
export async function askZazo(message, name, history, scene) {
  const response = await fetch("/api/chat", {
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
  return { reply: data.reply, scene: data.scene, pose: data.pose };
}
