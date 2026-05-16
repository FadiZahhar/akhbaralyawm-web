import { chromium } from "playwright";
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await p.goto("http://127.0.0.1:3000/sourcehtml/homear.html", { waitUntil: "networkidle" });
const info = await p.evaluate(() => {
  const big = [...document.querySelectorAll("body *")].filter((e) => {
    const r = e.getBoundingClientRect();
    return r.width > 800 && r.height > 100;
  });
  return {
    h: document.body.scrollHeight,
    sections: document.querySelectorAll("section").length,
    areas: document.querySelectorAll("[class*='-area']").length,
    bigCount: big.length,
    sample: big.slice(0, 40).map((e) => {
      const r = e.getBoundingClientRect();
      return {
        tag: e.tagName,
        cls: (e.className || "").toString().trim().split(/\s+/).slice(0, 4).join("."),
        id: e.id,
        top: Math.round(r.top + scrollY),
        h: Math.round(r.height),
      };
    }),
  };
});
console.log(JSON.stringify(info, null, 2));
await b.close();
