import { chromium } from "playwright";
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
const apiCalls = new Map();
p.on("request", (req) => {
  const u = req.url();
  if (/\/api\/|akhbar|backend/i.test(u) || (!u.includes("127.0.0.1:3000") && !u.includes("fonts.g"))) {
    apiCalls.set(u, (apiCalls.get(u) || 0) + 1);
  }
});
await p.goto("http://127.0.0.1:3000/ar/v2", { waitUntil: "networkidle" });
await p.waitForTimeout(2000);
console.log("External / API requests during /ar/v2:");
[...apiCalls.entries()].slice(0, 50).forEach(([u, n]) => console.log(`  [${n}x] ${u}`));
await b.close();
