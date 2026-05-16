// Quick one-off probe: measure inner column heights of the hero row in both
// the legacy snapshot and the candidate /v2 page. Helps identify which column
// is responsible for the giant 7625px hero in legacy.

import { chromium } from "playwright";

const BASE = process.env.VISUAL_BASE_URL || "http://localhost:3000";

const PAGES = [
  { name: "legacy", url: `${BASE}/legacy-snapshot/home-ar/index.html` },
  { name: "candidate", url: `${BASE}/ar/v2` },
];

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
const page = await ctx.newPage();

for (const target of PAGES) {
  await page.goto(target.url, { waitUntil: "load", timeout: 60_000 });
  await page.waitForTimeout(2500);

  const measurements = await page.evaluate(() => {
    const section = document.querySelector("section.new-news-area.ptb-40");
    if (!section) return null;
    const cols = section.querySelectorAll(":scope > .container > .row > [class*='col-lg-']");
    const inner = (root, sel) => {
      const el = root.querySelector(sel);
      return el ? Math.round(el.getBoundingClientRect().height) : null;
    };
    return {
      section: Math.round(section.getBoundingClientRect().height),
      columnCount: cols.length,
      columns: Array.from(cols).map((c) => ({
        className: c.className,
        height: Math.round(c.getBoundingClientRect().height),
      })),
      newsUpdates: inner(section, ".newsUpdates"),
      newsUpdatesInner: inner(section, ".newsUpdates > .container"),
      owlStageOuter: inner(section, ".new-news-slides .owl-stage-outer"),
      owlStage: inner(section, ".new-news-slides .owl-stage"),
    };
  });

  console.log(`\n=== ${target.name} ===`);
  console.log(JSON.stringify(measurements, null, 2));
}

await browser.close();
