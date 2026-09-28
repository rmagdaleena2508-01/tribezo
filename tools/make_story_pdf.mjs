// Turns the Zazo Story Book (ai/story/zazo-story.md) into a PDF
// (ai/story/zazo-story.pdf), using Google Chrome with no window.
//
// Run from the tribezo folder:
//   node tools/make_story_pdf.mjs
//
// The Markdown file is the one to edit. Run this again after every change,
// then restart the AI helper so it sends the new PDF to Gemini.

import { readFileSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const source = join(root, "ai/story/zazo-story.md");
const output = join(root, "ai/story/zazo-story.pdf");

const CHROME = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
].find((path) => {
  try {
    readFileSync(path);
    return true;
  } catch {
    return false;
  }
});
if (!CHROME) throw new Error("Could not find Google Chrome, Brave, or Chromium.");

// ---------- A very small Markdown to HTML converter ----------
// It only knows what the story book uses: headings, paragraphs, lists,
// tables, lines, bold, and italics.

const escape = (text) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const inline = (text) =>
  escape(text)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>");

function toHtml(markdown) {
  const lines = markdown.split("\n");
  const html = [];
  let paragraph = [];
  let list = null;
  let table = null;

  const flush = () => {
    if (paragraph.length) html.push(`<p>${inline(paragraph.join(" "))}</p>`);
    if (list) html.push(`<ul>${list.map((item) => `<li>${inline(item)}</li>`).join("")}</ul>`);
    if (table) {
      const [head, , ...rows] = table;
      const cells = (row) => row.split("|").slice(1, -1).map((cell) => cell.trim());
      html.push(
        `<table><thead><tr>${cells(head).map((c) => `<th>${inline(c)}</th>`).join("")}</tr></thead><tbody>` +
          rows.map((row) => `<tr>${cells(row).map((c) => `<td>${inline(c)}</td>`).join("")}</tr>`).join("") +
          "</tbody></table>"
      );
    }
    paragraph = [];
    list = null;
    table = null;
  };

  for (const line of lines) {
    const heading = line.match(/^(#{1,3}) (.*)$/);
    if (heading) {
      flush();
      html.push(`<h${heading[1].length}>${inline(heading[2])}</h${heading[1].length}>`);
    } else if (line.trim() === "---") {
      flush();
      html.push("<hr>");
    } else if (line.startsWith("|")) {
      if (!table) flush();
      table = table ?? [];
      table.push(line);
    } else if (line.startsWith("- ")) {
      if (!list) flush();
      list = list ?? [];
      list.push(line.slice(2));
    } else if (line.trim() === "") {
      flush();
    } else {
      paragraph.push(line.trim());
    }
  }
  flush();
  return html.join("\n");
}

const page = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>The Zazo Story Book</title>
<style>
  @page { size: A4; margin: 22mm 20mm; }
  body { font-family: Georgia, "Times New Roman", serif; color: #3a2618; font-size: 11.5pt; line-height: 1.55; }
  h1 { font-size: 30pt; color: #b9531f; margin: 0 0 4pt; }
  h2 { font-size: 17pt; color: #b9531f; margin: 22pt 0 6pt; page-break-after: avoid; }
  h1 + p em { color: #6b5040; }
  hr { border: none; border-top: 1px solid #e3d5bc; margin: 16pt 0; }
  table { border-collapse: collapse; width: 100%; margin: 8pt 0 12pt; font-size: 10.5pt; }
  tr { page-break-inside: avoid; }
  th, td { border: 1px solid #e3d5bc; padding: 5pt 7pt; text-align: left; vertical-align: top; }
  th { background: #fbf4e4; }
  ul { margin: 4pt 0 10pt; padding-left: 18pt; }
  li { margin: 2pt 0; }
</style></head>
<body>${toHtml(readFileSync(source, "utf8"))}</body></html>`;

const folder = mkdtempSync(join(tmpdir(), "zazo-story-"));
const htmlFile = join(folder, "story.html");
writeFileSync(htmlFile, page);
try {
  execFileSync(CHROME, [
    "--headless=new",
    "--disable-gpu",
    "--no-pdf-header-footer",
    `--print-to-pdf=${output}`,
    `file://${htmlFile}`,
  ], { stdio: "ignore" });
} finally {
  rmSync(folder, { recursive: true, force: true });
}
console.log(`Made ${output}`);
