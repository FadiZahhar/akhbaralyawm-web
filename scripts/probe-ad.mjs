import { chromium } from "playwright";
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await p.goto("http://localhost:3000/ar", { waitUntil: "networkidle" });
await p.waitForTimeout(800);
const r = await p.evaluate(() => {
  const img = document.querySelector('img[alt="Whish banner"]');
  let el = img;
  const chain = [];
  while (el && el.tagName !== "BODY") {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    chain.push({
      tag: el.tagName,
      cls: (el.className || "").toString().slice(0, 80),
      x: Math.round(r.left),
      w: Math.round(r.width),
      disp: cs.display,
      ta: cs.textAlign,
      mx: cs.marginLeft + "/" + cs.marginRight,
      maxW: cs.maxWidth,
    });
    el = el.parentElement;
  }
  return chain;
});
console.log(JSON.stringify(r, null, 2));
await b.close();
