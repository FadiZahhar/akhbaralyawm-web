#!/usr/bin/env node
import { chromium } from "playwright";
const BASE_URL = (process.env.VISUAL_BASE_URL || "http://localhost:3000").replace(/\/+$/, "");

const SELECTORS = ["header.header-area", "section.more-news-area", ".more-news-area .container .row", ".more-news-area .single-around-the-world-news"];

async function probe(page, url, label) {
  await page.goto(url, { waitUntil: "load", timeout: 60000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(2500);
  const data = await page.evaluate((sels) => {
    const out = {};
    for (const sel of sels) {
      const el = document.querySelector(sel);
      if (!el) { out[sel] = null; continue; }
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      out[sel] = {
        top: Math.round(r.top + window.scrollY),
        height: Math.round(r.height),
        marTop: cs.marginTop,
        marBot: cs.marginBottom,
        padTop: cs.paddingTop,
        padBot: cs.paddingBottom,
      };
    }
    return out;
  }, SELECTORS);
  console.log(`\n=== ${label} ===`);
  for (const sel of SELECTORS) {
    const r = data[sel];
    if (!r) { console.log(`  ${sel}: (none)`); continue; }
    console.log(`  ${sel}: top=${r.top} h=${r.height} m=${r.marTop}/${r.marBot} p=${r.padTop}/${r.padBot}`);
  }
}

const b = await chromium.launch({ headless: true });
const c = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await c.newPage();
await probe(p, `${BASE_URL}/legacy-snapshot/home-ar/index.html`, "LEGACY");
await probe(p, `${BASE_URL}/ar/v2`, "CANDIDATE");
await b.close();
