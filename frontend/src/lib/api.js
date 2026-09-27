// Talking to the C server.
//
// The website only calls /api/... on its own address. Vite passes those
// calls on to the C server, so the browser never talks to it directly.

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
