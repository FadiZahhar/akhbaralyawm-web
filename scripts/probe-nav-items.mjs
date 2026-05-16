import { chromium } from "playwright";
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
async function probe(url) {
  await p.goto(url, { waitUntil: "load" });
  await p.waitForTimeout(1500);
  return p.evaluate(() => {
    const nav = document.querySelector(".sinmun-nav .navbar-collapse, .sinmun-nav .navbar-nav");
    if (!nav) return { error: "no nav" };
    const r = nav.getBoundingClientRect();
    const items = [...nav.querySelectorAll("li, .nav-item")].map((el) => {
      const rr = el.getBoundingClientRect();
      const a = el.querySelector("a");
      return {
        text: a?.textContent?.trim().slice(0, 30),
        x: Math.round(rr.x),
        y: Math.round(rr.y),
        w: Math.round(rr.width),
        h: Math.round(rr.height),
      };
    });
    return { nav: { x: Math.round(r.x), w: Math.round(r.width), h: Math.round(r.height) }, items };
  });
}
console.log("LEGACY:");
console.log(JSON.stringify(await probe("http://127.0.0.1:3000/legacy-snapshot/home-ar/index.html"), null, 2));
console.log("CANDIDATE:");
console.log(JSON.stringify(await probe("http://127.0.0.1:3000/ar/v2?fixture=1"), null, 2));
await b.close();
