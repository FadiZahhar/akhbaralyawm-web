import { chromium } from "playwright";
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 1080 } });
const p = await ctx.newPage();
await p.goto("http://localhost:3000/ar/v2", { waitUntil: "load" });
await p.waitForTimeout(2500);
const r = await p.evaluate(() => {
  const items = document.querySelectorAll(".newsUpdates > .container .newsUpdate-item");
  const hrs = document.querySelectorAll(".newsUpdates > .container hr");
  const links = document.querySelectorAll(".newsUpdates > .container > a");
  return {
    itemCount: items.length,
    hrCount: hrs.length,
    linkCount: links.length,
    firstItemHeight: items[0] ? items[0].getBoundingClientRect().height : null,
    firstLinkHeight: links[0] ? links[0].getBoundingClientRect().height : null,
    firstLinkOuterHtml: links[0] ? links[0].outerHTML.slice(0, 500) : null,
    firstLinkDisplay: links[0] ? getComputedStyle(links[0]).display : null,
  };
});
console.log(JSON.stringify(r, null, 2));
await b.close();
