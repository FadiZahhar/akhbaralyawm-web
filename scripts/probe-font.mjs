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
    // Measure text width using canvas
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    const m = ctx.measureText(a.textContent);
    // Also check if Cairo font is available
    const cairoLoaded = document.fonts && document.fonts.check(`17px Cairo`);
    return {
      text: a.textContent,
      fontFamily: cs.fontFamily,
      fontWeight: cs.fontWeight,
      fontSize: cs.fontSize,
      ctxFont: ctx.font,
      textWidthPx: m.width,
      cairoLoaded,
      loadedFonts: Array.from(document.fonts).map(f => `${f.family} ${f.weight} ${f.status}`).slice(0, 20),
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
