#!/usr/bin/env node
// Probe header zone differences between legacy MHTML snapshot and /v2 candidate.
// Compares bounding boxes of header sub-regions to find what's drifting in
// the top 250px where structural mismatch is still 28%.

import { chromium } from "playwright";

const BASE_URL = (process.env.VISUAL_BASE_URL || "http://localhost:3000").replace(/\/+$/, "");

const SELECTORS = [
  "header.header-area",
  ".top-header",
  ".top-header .logo",
  ".top-header .header-search-form",
  ".top-header .header-social",
  ".navbar-area",
  ".navbar-brand",
  ".navbar-nav",
  ".navbar-nav > li",
  ".navbar-nav > li > a",
  ".header-date",
  ".weather",
];

async function probe(page, url, label) {
  await page.goto(url, { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(2000);
  const data = await page.evaluate((selectors) => {
    const out = {};
    for (const sel of selectors) {
      const nodes = Array.from(document.querySelectorAll(sel));
      out[sel] = nodes.slice(0, 8).map((el) => {
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        return {
          top: Math.round(r.top + window.scrollY),
          left: Math.round(r.left + window.scrollX),
          width: Math.round(r.width),
          height: Math.round(r.height),
          font: cs.fontFamily.split(",")[0].replace(/['"]/g, "").trim() + " " + cs.fontSize + " " + cs.fontWeight,
          color: cs.color,
          text: (el.textContent || "").trim().slice(0, 30),
        };
      });
    }
    return out;
  }, SELECTORS);
  console.log(`\n=== ${label} (${url}) ===`);
  for (const sel of SELECTORS) {
    const rows = data[sel];
    if (!rows.length) {
      console.log(`  ${sel}: (none)`);
      continue;
    }
    console.log(`  ${sel} (${rows.length}):`);
    for (const r of rows) {
      console.log(`    [${r.top},${r.left}] ${r.width}x${r.height}  ${r.font}  ${r.color}  "${r.text}"`);
    }
  }
}

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

await probe(page, `${BASE_URL}/legacy-snapshot/home-ar/index.html`, "LEGACY");
await probe(page, `${BASE_URL}/ar/v2`, "CANDIDATE");

await browser.close();
