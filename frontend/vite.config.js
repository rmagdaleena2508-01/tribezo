import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The C server from Phase 2.
const API_SERVER = "http://127.0.0.1:8765";

// Send every /api request to the C server. The browser only ever talks to
// this website, so the C server never has to be opened up to other sites.
const proxy = {
  "/api": { target: API_SERVER, changeOrigin: true },
};

// Rules for what the built website is allowed to load and talk to.
// Anything not listed here is blocked by the browser.
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' https://fonts.googleapis.com",
  "font-src https://fonts.gstatic.com",
  "img-src 'self' data:",
  "media-src 'self'",
  "connect-src 'self'",
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
  plugins: [react(), contentSecurityPolicy()],

  // Only this computer can open the website while building it.
  server: { host: "127.0.0.1", port: 8766, strictPort: true, proxy },
  preview: { host: "127.0.0.1", port: 8767, strictPort: true, proxy },

  // No source maps, so the built website does not ship the original code.
  build: { sourcemap: false },
});
