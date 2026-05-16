#!/usr/bin/env node
import { chromium } from "playwright";
const BASE_URL = (process.env.VISUAL_BASE_URL || "http://localhost:3000").replace(/\/+$/, "");

const b = await chromium.launch({ headless: true });
const c = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await c.newPage();
await p.goto(`${BASE_URL}/ar/v2`, { waitUntil: "load", timeout: 60000 });
await p.evaluate(() => document.fonts.ready);
await p.waitForTimeout(3000);

const data = await p.evaluate(() => {
  const links = Array.from(document.querySelectorAll(".navbar-nav > li > a"));
  return links.map(a => {
    const r = a.getBoundingClientRect();
    const cs = getComputedStyle(a);
    return {
      text: (a.textContent||"").trim(),
      top: Math.round(r.top + window.scrollY),
      left: Math.round(r.left + window.scrollX),
      w: Math.round(r.width),
      h: Math.round(r.height),
      color: cs.color,
      visibility: cs.visibility,
      opacity: cs.opacity,
      display: cs.display,
      position: cs.position,
      zIndex: cs.zIndex,
    };
  });
});
for (const d of data) console.log(JSON.stringify(d));

await b.close();
