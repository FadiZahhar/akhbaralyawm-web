import { chromium } from "playwright";
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
await p.goto("http://127.0.0.1:3000/legacy-snapshot/home-ar/index.html", { waitUntil: "networkidle" });
await p.waitForTimeout(500);
const out = await p.evaluate(() => {
  const all = document.querySelectorAll(".new-news-area");
  const info = { count: all.length, items: [] };
  all.forEach((el, i) => {
    const r = el.getBoundingClientRect();
    info.items.push({
      i,
      cls: el.className,
      top: Math.round(r.top + scrollY),
      h: Math.round(r.height),
      children: el.children.length,
    });
  });
  // also find by html search
  info.htmlHas = document.documentElement.innerHTML.includes("new-news-area");
  return info;
});
console.log(JSON.stringify(out, null, 2));
await b.close();
