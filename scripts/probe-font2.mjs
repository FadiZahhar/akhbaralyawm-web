#!/usr/bin/env node
import { chromium } from "playwright";
const BASE_URL = (process.env.VISUAL_BASE_URL || "http://localhost:3000").replace(/\/+$/, "");

const b = await chromium.launch({ headless: true });
const c = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await c.newPage();
const reqs = [];
p.on("response", (r) => { if (r.url().includes("font")) reqs.push(`${r.status()} ${r.url()}`); });

await p.goto(`${BASE_URL}/ar/v2`, { waitUntil: "load", timeout: 60000 });
await p.evaluate(() => document.fonts.ready);
await p.waitForTimeout(3000);

const data = await p.evaluate(() => {
  const a = document.querySelector(".navbar-nav > li:nth-child(2) > a");
  const cs = getComputedStyle(a);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
  return {
    fontFamily: cs.fontFamily,
    textWidth: ctx.measureText(a.textContent).width,
    loadedNoto: Array.from(document.fonts).filter(f => f.family.includes("Noto") && f.status === "loaded").length,
  };
});
console.log("data:", JSON.stringify(data, null, 2));
console.log("font requests:");
for (const r of reqs) console.log(" ", r);
await b.close();
