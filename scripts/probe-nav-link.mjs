#!/usr/bin/env node
import { chromium } from "playwright";
const BASE_URL = (process.env.VISUAL_BASE_URL || "http://localhost:3000").replace(/\/+$/, "");

async function inspect(page, url, label) {
  await page.goto(url, { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(2000);
  const data = await page.evaluate(() => {
    const a = document.querySelector(".navbar-nav > li:nth-child(2) > a");
    if (!a) return null;
    const cs = getComputedStyle(a);
    const r = a.getBoundingClientRect();
    return {
      html: a.outerHTML,
      text: a.textContent,
      bbox: { w: r.width, h: r.height },
      padding: cs.padding,
      margin: cs.margin,
      lineHeight: cs.lineHeight,
      fontSize: cs.fontSize,
      display: cs.display,
      minHeight: cs.minHeight,
      whiteSpace: cs.whiteSpace,
    };
  });
  console.log(`\n${label}:`, JSON.stringify(data, null, 2));
}

const b = await chromium.launch({ headless: true });
const c = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await c.newPage();
await inspect(p, `${BASE_URL}/legacy-snapshot/home-ar/index.html`, "LEGACY");
await inspect(p, `${BASE_URL}/ar/v2`, "CANDIDATE");
await b.close();
