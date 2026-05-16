#!/usr/bin/env node
// Inspect legacy vs candidate logo rendering specifically.
import { chromium } from "playwright";

const BASE_URL = (process.env.VISUAL_BASE_URL || "http://localhost:3000").replace(/\/+$/, "");

async function inspectLogo(page, url, label) {
  await page.goto(url, { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(2000);
  const data = await page.evaluate(() => {
    const out = [];
    const imgs = document.querySelectorAll(".navbar-brand img, .sinmun-nav .navbar-brand img");
    for (const img of imgs) {
      const r = img.getBoundingClientRect();
      const cs = getComputedStyle(img);
      out.push({
        cls: img.className,
        src: img.getAttribute("src"),
        wAttr: img.getAttribute("width"),
        top: Math.round(r.top + window.scrollY),
        left: Math.round(r.left + window.scrollX),
        width: Math.round(r.width),
        height: Math.round(r.height),
        display: cs.display,
        natW: img.naturalWidth,
        natH: img.naturalHeight,
      });
    }
    return out;
  });
  console.log(`\n=== ${label} ===`);
  for (const r of data) console.log(JSON.stringify(r));
}

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

await inspectLogo(page, `${BASE_URL}/legacy-snapshot/home-ar/index.html`, "LEGACY");
await inspectLogo(page, `${BASE_URL}/ar/v2`, "CANDIDATE");

await browser.close();
