import { chromium } from "playwright";
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 1080 } });
const p = await ctx.newPage();
for (const u of [
  "http://localhost:3000/legacy-snapshot/home-ar/index.html",
  "http://localhost:3000/ar/v2",
]) {
  await p.goto(u, { waitUntil: "load", timeout: 90_000 });
  await p.waitForTimeout(2500);
  const r = await p.evaluate(() => {
    const card = document.querySelector(".more-news-area .single-around-the-world-news");
    const img = document.querySelector(".more-news-area .news-image img");
    const sec = document.querySelector(".more-news-area");
    return {
      sectionH: sec ? Math.round(sec.getBoundingClientRect().height) : null,
      cardH: card ? Math.round(card.getBoundingClientRect().height) : null,
      imgW: img ? Math.round(img.getBoundingClientRect().width) : null,
      imgH: img ? Math.round(img.getBoundingClientRect().height) : null,
    };
  });
  console.log("=== " + u);
  console.log(JSON.stringify(r));
}
await b.close();
