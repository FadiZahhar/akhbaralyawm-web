import { chromium } from "playwright";
import fs from "node:fs/promises";

const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await p.goto("http://127.0.0.1:3000/legacy-snapshot/home-ar/index.html", { waitUntil: "load" });
await p.waitForTimeout(2500);
const r = await p.evaluate(() => {
  const out = {};
  const sections = document.querySelectorAll(
    "section.popular-news-area, section.hot-news-area, section.video-news-area, section.more-news-area",
  );
  sections.forEach((s) => {
    const title = s.querySelector("h2")?.textContent?.trim() || "";
    const cards = [
      ...s.querySelectorAll(
        ".news-content h3 a, .single-around-the-world-news h3 a, .single-most-news a",
      ),
    ].slice(0, 12);
    if (!title) return;
    out[title] = cards.map((a) => ({
      href: a.getAttribute("href") || "",
      title: a.textContent.trim(),
    }));
  });
  return out;
});
await fs.writeFile("tests/fixtures/legacy-sections-ar.json", JSON.stringify(r, null, 2), "utf8");
console.log("sections:", Object.keys(r).length, "total cards:", Object.values(r).reduce((s, a) => s + a.length, 0));
await b.close();
