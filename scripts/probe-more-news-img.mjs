import { chromium } from "playwright";
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 1080 } });
const p = await ctx.newPage();
await p.goto("http://localhost:3000/ar/v2", { waitUntil: "load" });
await p.waitForTimeout(2500);
const r = await p.evaluate(() => {
  const img = document.querySelector(".more-news-area .news-image img");
  if (!img) return null;
  const cs = getComputedStyle(img);
  return {
    tagName: img.tagName,
    outerHtml: img.outerHTML.slice(0, 200),
    naturalW: img.naturalWidth,
    naturalH: img.naturalHeight,
    boxW: img.getBoundingClientRect().width,
    boxH: img.getBoundingClientRect().height,
    width: cs.width,
    height: cs.height,
    maxWidth: cs.maxWidth,
    maxHeight: cs.maxHeight,
    objectFit: cs.objectFit,
    aspectRatio: cs.aspectRatio,
  };
});
console.log(JSON.stringify(r, null, 2));
await b.close();
