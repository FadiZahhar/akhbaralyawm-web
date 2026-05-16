#!/usr/bin/env node
// Probe navbar vertical metrics to diagnose the 10px logo top offset.
import { chromium } from "playwright";
const BASE_URL = (process.env.VISUAL_BASE_URL || "http://localhost:3000").replace(/\/+$/, "");

const SELECTORS = [
  "header.header-area",
  ".navbar-area",
  ".sinmun-nav",
  ".sinmun-nav > .container",
  ".sinmun-nav .navbar",
  ".sinmun-nav .navbar-brand",
  ".sinmun-nav .navbar-brand img.mm",
  ".navbar-collapse",
  ".navbar-nav",
];

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
        padTop: cs.paddingTop,
        padBot: cs.paddingBottom,
        mTop: cs.marginTop,
        mBot: cs.marginBottom,
        display: cs.display,
        align: cs.alignItems,
      };
    }
    return out;
  }, SELECTORS);
  console.log(`\n=== ${label} ===`);
  for (const sel of SELECTORS) {
    const r = data[sel];
    if (!r) { console.log(`  ${sel}: (none)`); continue; }
    console.log(`  ${sel}: top=${r.top} h=${r.height} pad=${r.padTop}/${r.padBot} mar=${r.mTop}/${r.mBot} disp=${r.display} align=${r.align}`);
  }
}

const b = await chromium.launch({ headless: true });
const c = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await c.newPage();
await probe(p, `${BASE_URL}/legacy-snapshot/home-ar/index.html`, "LEGACY");
await probe(p, `${BASE_URL}/ar/v2`, "CANDIDATE");
await b.close();
