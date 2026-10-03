// Takes real screenshots of the game for the stack video.
//
// It opens the built game in Chrome with no window, skips to the chat with
// a saved visitor called Mary, asks Zazo "How old are you?", and saves a
// picture of every step, plus the History panel.
//
// Run the built game first (npm run build, then npm run preview), then:
//   npm i --no-save puppeteer-core
//   node tools/capture_game_shots.mjs <folder>
// The pictures in tools/video-shots/ were cut from these screenshots.

import puppeteer from "puppeteer-core";
const OUT = process.argv[2];
const browser = await puppeteer.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true, args: ["--window-size=1280,720"] });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 2 });
await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
await page.goto("http://127.0.0.1:8767/", { waitUntil: "networkidle0" });
await page.evaluate(() => localStorage.setItem("tribezo:save", JSON.stringify({ version: 1, savedAt: Date.now(), name: "Mary", scene: "village", seen: ["village"], choices: [], turns: [], history: [], memory: { tourStop: 0, fallback: 0 } })));
await page.reload({ waitUntil: "networkidle0" });
await wait(800);
const clickText = async (text) => {
  const ok = await page.evaluate((t) => { const b = [...document.querySelectorAll("button")].find((x) => x.textContent.trim().startsWith(t)); if (b) { b.click(); return true; } return false; }, text);
  if (!ok) throw new Error("no button " + text);
};
const shot = async (name) => { await wait(500); await page.screenshot({ path: `${OUT}/${name}.png` }); console.log("shot", name); };
await clickText("Continue as");
await wait(2500);
// finish the welcome back lines
for (let i = 0; i < 6; i++) { const more = await page.evaluate(() => !![...document.querySelectorAll("button")].find((b) => b.textContent.trim() === "Tap to continue")); if (!more) break; await clickText("Tap to continue"); await wait(300); await clickText("Tap to continue").catch(() => {}); await wait(600); }
await wait(1500);
await shot("chat-idle");
await page.type("#message", "How old are you?");
await page.keyboard.press("Enter");
await wait(4000);
const tapBtn = () => page.evaluate(() => { const b = [...document.querySelectorAll("button")].find((x) => x.textContent.trim() === "Tap to continue"); if (b) { b.click(); return true; } return false; });
for (let i = 0; i < 8; i++) {
  await wait(2500); // let the line type out
  const label = await page.evaluate(() => document.body.innerText.split("\n").slice(0, 6).join(" | "));
  await shot(`line-${i}`); console.log(label.slice(0, 160));
  if (!(await tapBtn())) break;
}
await wait(800);
// open History
await page.evaluate(() => [...document.querySelectorAll("button")].find((b) => b.textContent.includes("History"))?.click());
await wait(900); await shot("history");
await browser.close();
