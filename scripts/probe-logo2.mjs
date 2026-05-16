import { chromium } from "playwright";
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
async function probe(url) {
  await p.goto(url, { waitUntil: "load" });
  await p.waitForTimeout(1500);
  return p.evaluate(() => {
    const logos = [...document.querySelectorAll(".sinmun-nav .navbar-brand img, .sinmun-nav .navbar-brand")].map((el) => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return {
        tag: el.tagName,
        cls: el.className,
        display: cs.display,
        visibility: cs.visibility,
        w: Math.round(r.width),
        h: Math.round(r.height),
        x: Math.round(r.x),
      };
    });
    return logos;
  });
}
console.log("LEGACY logos:");
console.log(JSON.stringify(await probe("http://127.0.0.1:3000/legacy-snapshot/home-ar/index.html"), null, 2));
console.log("\nCANDIDATE logos:");
console.log(JSON.stringify(await probe("http://127.0.0.1:3000/ar/v2?fixture=1"), null, 2));
await b.close();
