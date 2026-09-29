// Tests for the Vercel function's guards (api/chat.js). Run with: npm test
// No key is set here, so nothing is ever sent to Gemini.

import { test } from "node:test";
import assert from "node:assert/strict";

delete process.env.GEMINI_API_KEY;
process.env.ALLOWED_ORIGINS = "https://rmagdaleena2508-01.github.io";
process.env.PER_VISITOR_PER_MINUTE = "3";
process.env.PER_DAY = "5";
const { default: handler, isAllowedOrigin, underLimits } = await import("../../api/chat.js");

// A pretend Vercel request and response.
async function call({ method = "POST", origin, host = "tribezo.vercel.app", body = { message: "Hi", name: "Ann" } }) {
  const headers = { host, "x-forwarded-for": "1.2.3.4" };
  if (origin) headers.origin = origin;
  const res = {
    statusCode: 0,
    headers: {},
    body: "",
    setHeader(key, value) {
      this.headers[key.toLowerCase()] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    send(text) {
      this.body = text;
    },
    end() {},
  };
  await handler({ method, headers, body }, res);
  return res;
}

test("only our own websites are allowed", () => {
  assert.ok(isAllowedOrigin("https://tribezo.vercel.app", "tribezo.vercel.app"));
  assert.ok(isAllowedOrigin("https://rmagdaleena2508-01.github.io", "tribezo.vercel.app"));
  assert.ok(!isAllowedOrigin("https://tribezo-evil.vercel.app", "tribezo.vercel.app"));
  assert.ok(!isAllowedOrigin("https://evil.example", "tribezo.vercel.app"));
  assert.ok(!isAllowedOrigin(undefined, "tribezo.vercel.app"));
});

test("requests from other websites, or from no website, are turned away", async () => {
  assert.equal((await call({ origin: "https://evil.example" })).statusCode, 403);
  assert.equal((await call({})).statusCode, 403);
});

test("the GitHub Pages site gets permission to call the function", async () => {
  const pre = await call({ method: "OPTIONS", origin: "https://rmagdaleena2508-01.github.io" });
  assert.equal(pre.statusCode, 204);
  assert.equal(pre.headers["access-control-allow-origin"], "https://rmagdaleena2508-01.github.io");
  assert.equal(pre.headers["access-control-allow-methods"], "POST");
});

test("with no key, the website is told to use the fixed answers", async () => {
  const res = await call({ origin: "https://tribezo.vercel.app" });
  assert.equal(res.statusCode, 503);
});

test("each visitor gets a few messages a minute, and there is a daily limit", () => {
  const start = Date.parse("2026-01-01T10:00:00Z");
  assert.ok(underLimits("a", start));
  assert.ok(underLimits("a", start + 1));
  assert.ok(underLimits("a", start + 2));
  assert.ok(!underLimits("a", start + 3)); // 4th message in a minute
  assert.ok(underLimits("a", start + 61_000)); // a minute later is fine
  assert.ok(underLimits("b", start + 61_001)); // the 5th message today
  assert.ok(!underLimits("c", start + 61_002)); // the 6th, so the day is full
  assert.ok(underLimits("b", Date.parse("2026-01-02T10:00:00Z"))); // a new day
});
