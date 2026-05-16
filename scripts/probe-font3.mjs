#!/usr/bin/env node
import { chromium } from "playwright";
const BASE_URL = (process.env.VISUAL_BASE_URL || "http://localhost:3000").replace(/\/+$/, "");

const b = await chromium.launch({ headless: true });
const c = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await c.newPage();
const reqs = [];
p.on("response", (r) => { if (r.url().includes("font") || r.url().includes("woff")) reqs.push(`${r.status()} ${r.url().slice(0, 120)}`); });

await p.goto(`${BASE_URL}/legacy-snapshot/home-ar/index.html`, { waitUntil: "load", timeout: 60000 });
await p.evaluate(() => document.fonts.ready);
await p.waitForTimeout(3000);

const data = await p.evaluate(() => {
  const a = document.querySelector(".navbar-nav > li:nth-child(2) > a");
  const cs = getComputedStyle(a);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
  return {
    textWidth: ctx.measureText(a.textContent).width,
    loadedNoto: Array.from(document.fonts).filter(f => f.family.includes("Noto") && f.status === "loaded").length,
  };
});
console.log("LEGACY data:", JSON.stringify(data));
console.log("font requests:");
for (const r of reqs) console.log(" ", r);
await b.close();
