#!/usr/bin/env node
// Section-height profiler. For both the legacy snapshot and the /v2 candidate
// it lists every top-level <section>/<header>/<footer>/<div.default-news-area>
// child of <body>, recording its rendered height. The two lists are then
// aligned by source order so per-section drift is obvious.
//
// Goal: identify which sections contribute the +154 px page-height delta the
// pixel diff is currently bottlenecked on (see docs/mimic/README.md iter 4).
//
// Usage (with `npm run dev` running on http://localhost:3000):
//   node scripts/section-heights.mjs
//   VISUAL_BASE_URL=http://localhost:3000 node scripts/section-heights.mjs

import { chromium } from "playwright";

const BASE_URL = (process.env.VISUAL_BASE_URL || "http://localhost:3000").replace(/\/+$/, "");

const PAIR = {
  legacy: "/legacy-snapshot/home-ar/index.html",
  candidate: "/ar/v2",
};

async function launchBrowser() {
  try {
    return await chromium.launch({ headless: true });
  } catch {
    try {
      return await chromium.launch({ headless: true, channel: "chrome" });
    } catch {
      return await chromium.launch({ headless: true, channel: "msedge" });
    }
  }
}

async function profile(page, url) {
  await page.goto(url, { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(2500);
  return page.evaluate(() => {
    // Walk every direct or nested top-level structural block. We include
    // <section>, <header>, <footer>, <main>, and any <div> whose class list
    // contains one of the well-known legacy section wrappers. Anything with
    // zero rendered height is dropped (display:none, etc.).
    //
    // `default-news-area` is intentionally treated as a *container*, not a
    // section — legacy has top-level sibling sections while the candidate
    // wraps the same sections inside one `<div class="default-news-area">`.
    // If we counted it as outermost, the candidate would collapse to a single
    // 11k-px row and the comparison would be useless.
    const WRAPPER_CLASSES = [
      "more-news-area",
      "new-news-area",
      "popular-news-area",
      "around-the-world-news-area",
      "video-news-area",
      "hot-news-area",
      "page-title-area",
      "footer-area",
      "top-header",
    ];
    const CONTAINER_CLASSES = ["default-news-area"];
    const all = Array.from(
      document.querySelectorAll(
        ["header", "footer", "main", "section", "nav", ...WRAPPER_CLASSES.map((c) => `div.${c}`)].join(","),
      ),
    );
    // Keep only outermost matches (no ancestor that is also in the list).
    // Containers in CONTAINER_CLASSES are *not* considered ancestors for this
    // purpose — children of a container still surface as outermost.
    const set = new Set(all);
    const isContainer = (el) =>
      CONTAINER_CLASSES.some((c) => el.classList && el.classList.contains(c));
    const outermost = all.filter((el) => {
      let p = el.parentElement;
      while (p) {
        if (set.has(p) && !isContainer(p)) return false;
        p = p.parentElement;
      }
      return true;
    });
    return outermost.map((el, idx) => {
      const rect = el.getBoundingClientRect();
      return {
        idx,
        tag: el.tagName.toLowerCase(),
        cls: (el.getAttribute("class") || "").split(/\s+/).slice(0, 4).join(" "),
        top: Math.round(rect.top + window.scrollY),
        height: Math.round(rect.height),
        marker:
          el.id ||
          (el.querySelector("h1, h2, .section-title h2")?.textContent || "").trim().slice(0, 40),
      };
    });
  });
}

function pad(s, n) {
  s = String(s);
  if (s.length >= n) return s.slice(0, n);
  return s + " ".repeat(n - s.length);
}

async function main() {
  const browser = await launchBrowser();
  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();

    const legacy = await profile(page, `${BASE_URL}${PAIR.legacy}`);
    const candidate = await profile(page, `${BASE_URL}${PAIR.candidate}`);

    console.log(
      `\nlegacy:    ${legacy.length} sections, totalHeight=${legacy.reduce((s, x) => s + x.height, 0)} px`,
    );
    console.log(
      `candidate: ${candidate.length} sections, totalHeight=${candidate.reduce((s, x) => s + x.height, 0)} px\n`,
    );

    // Side-by-side alignment by source order. We don't try to be clever; we
    // just zip the two lists and show where they desync.
    const rows = Math.max(legacy.length, candidate.length);
    console.log(
      pad("#", 3),
      pad("legacy tag/class", 40),
      pad("L.h", 6),
      pad("C.h", 6),
      pad("Δ", 6),
      pad("legacy marker", 36),
      "candidate tag/class",
    );
    console.log("-".repeat(140));
    let runningDelta = 0;
    for (let i = 0; i < rows; i += 1) {
      const L = legacy[i];
      const C = candidate[i];
      const lh = L ? L.height : 0;
      const ch = C ? C.height : 0;
      const delta = ch - lh;
      runningDelta += delta;
      const flag = Math.abs(delta) >= 20 ? " *" : "";
      console.log(
        pad(i, 3),
        pad(L ? `${L.tag}.${L.cls}` : "—", 40),
        pad(lh, 6),
        pad(ch, 6),
        pad((delta >= 0 ? "+" : "") + delta + flag, 6),
        pad(L ? L.marker : "—", 36),
        C ? `${C.tag}.${C.cls}` : "—",
      );
    }
    console.log("-".repeat(140));
    console.log(`Cumulative Δ (candidate − legacy): ${runningDelta >= 0 ? "+" : ""}${runningDelta} px`);

    await context.close();
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err.stack || err.message);
  process.exit(1);
});
