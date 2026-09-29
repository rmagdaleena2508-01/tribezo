// The C stack from the backend, running right here in the browser.
//
// stack.c and reverse.c are compiled to WebAssembly (public/stack.wasm) with
// "make wasm" in the backend folder. This means the game can flip words
// without any server, so it works on GitHub Pages and Vercel too.

const MAX_BYTES = 10 * 1024; // the same limit as the C server

// Flip text with the compiled stack. "wasm" is the loaded WebAssembly
// module's exports. "keep" is the player's name: those words are not
// flipped. Returns { english, xyz, pushes, pops }.
export function flip(wasm, text, keep = "") {
  // A zero byte would end the text early in C, so it is taken out.
  const english = text.replaceAll("\0", "");
  const bytes = new TextEncoder().encode(english);
  if (bytes.length > MAX_BYTES) throw new Error("The text is longer than 10 KB.");

  // Copy the text into the WebAssembly memory, with a zero byte at the end.
  const input = wasm.tribezo_input(bytes.length);
  if (!input) throw new Error("The stack ran out of memory.");
  new Uint8Array(wasm.memory.buffer, input, bytes.length + 1).set([...bytes, 0]);

  // The same for the name to keep, if there is one.
  let keepAt = 0;
  const keepBytes = new TextEncoder().encode(keep.replaceAll("\0", "").slice(0, 200));
  if (keepBytes.length > 0) {
    keepAt = wasm.tribezo_keep(keepBytes.length);
    if (!keepAt) throw new Error("The stack ran out of memory.");
    new Uint8Array(wasm.memory.buffer, keepAt, keepBytes.length + 1).set([...keepBytes, 0]);
  }

  const output = wasm.tribezo_reverse(input, keepAt);
  if (!output) throw new Error("The stack ran out of memory.");

  // Read the flipped text back, up to its zero byte. The memory may have
  // grown, so it is looked at again.
  const memory = new Uint8Array(wasm.memory.buffer);
  let end = output;
  while (memory[end] !== 0) end++;
  const xyz = new TextDecoder().decode(memory.subarray(output, end));

  return { english, xyz, pushes: Number(wasm.tribezo_pushes()), pops: Number(wasm.tribezo_pops()) };
}

let loading = null;

function loadStack() {
  const base = import.meta.env?.BASE_URL ?? "/";
  loading ??= WebAssembly.instantiateStreaming(fetch(`${base}stack.wasm`)).then(({ instance }) => instance.exports);
  return loading;
}

// Send English, get Calonis back. The words in "keep" (the player's name)
// stay the way they were typed.
// Returns { english, xyz, pushes, pops }, or throws if anything goes wrong.
export async function reverseText(text, keep = "") {
  try {
    return flip(await loadStack(), text, keep);
  } catch (error) {
    loading = null; // try loading again next time
    throw error;
  }
}
