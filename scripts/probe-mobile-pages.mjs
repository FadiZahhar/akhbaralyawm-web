import { chromium } from "playwright";
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
const p = await ctx.newPage();
const routes = [
  "/ar",
  "/ar/category/29",
  "/ar/about",
  "/ar/contact",
  "/ar/search?q=test",
];
const slugs = ["home", "category", "about", "contact", "search"];
for (const r of routes) {
  await p.goto("http://127.0.0.1:3000" + r, { waitUntil: "networkidle" });
  await p.waitForTimeout(800);
  const info = await p.evaluate(() => {
    const overflow = document.body.scrollWidth > window.innerWidth;
    let culprit = null;
    if (overflow) {
      // find widest element
      const all = document.querySelectorAll("*");
      let max = window.innerWidth, picked = null;
      for (const el of all) {
        const r = el.getBoundingClientRect();
        if (r.right > max + 4) { max = r.right; picked = el; }
      }
      if (picked) culprit = {
        tag: picked.tagName.toLowerCase(),
        cls: (picked.className || "").toString().slice(0, 80),
        right: Math.round(picked.getBoundingClientRect().right),
      };
    }
    return {
      sw: document.body.scrollWidth,
      cw: window.innerWidth,
      overflow,
      culprit,
    };
  });
  console.log(r, JSON.stringify(info));
}
await b.close();
