import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Where the site lives. "/" on your computer and on Vercel. The GitHub
// Pages build sets VITE_BASE=/tribezo/ because the site is in that folder.
const BASE = process.env.VITE_BASE || "/";

// Where Zazo's AI answers come from. Empty means this same site, which is
// true on your computer and on Vercel. The GitHub Pages build sets it to
// the Vercel address.
const API_BASE = process.env.VITE_API_BASE || "";

// The AI helper on your computer (ai/server.js). The words are flipped in
// the browser now, so the C server is not needed to play.
const AI_HELPER = "http://127.0.0.1:8764";
const proxy = {
  "/api/chat": { target: AI_HELPER, changeOrigin: true },
};

// Rules for what the built website is allowed to load and talk to.
// Anything not listed here is blocked by the browser.
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  // 'wasm-unsafe-eval' lets the page run the C stack compiled to WebAssembly.
  "script-src 'self' 'wasm-unsafe-eval'",
  "style-src 'self' https://fonts.googleapis.com",
  "font-src https://fonts.gstatic.com",
  "img-src 'self' data:",
  "media-src 'self'",
  // The page may only talk to itself, and to the Vercel AI function.
  `connect-src 'self'${API_BASE ? ` ${new URL(API_BASE).origin}` : ""}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

// Add the rules above to index.html, but only in the built website.
// While building, Vite needs to add its own small scripts and styles,
// which these rules would block.
function contentSecurityPolicy() {
  return {
    name: "content-security-policy",
    apply: "build",
    transformIndexHtml(html) {
      return html.replace(
        '<meta charset="UTF-8" />',
        `<meta charset="UTF-8" />\n    <meta http-equiv="Content-Security-Policy" content="${CONTENT_SECURITY_POLICY}" />`
      );
    },
  };
}

export default defineConfig({
  base: BASE,
  plugins: [react(), contentSecurityPolicy()],

  // Only this computer can open the website while building it.
  server: { host: "127.0.0.1", port: 8766, strictPort: true, proxy },
  preview: { host: "127.0.0.1", port: 8767, strictPort: true, proxy },

  // No source maps, so the built website does not ship the original code.
  build: { sourcemap: false },
});
