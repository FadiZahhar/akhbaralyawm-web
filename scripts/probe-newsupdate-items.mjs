import { chromium } from "playwright";
const URLS = {
  legacy: "http://127.0.0.1:3000/legacy-snapshot/home-ar/index.html",
  cand: "http://127.0.0.1:3000/ar/v2",
};
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();

async function probe(url) {
  await p.goto(url, { waitUntil: "networkidle" });
  await p.waitForTimeout(500);
  return p.evaluate(() => {
    let root = null, bestH = 0;
    document.querySelectorAll(".new-news-area").forEach((el) => {
      const h = el.getBoundingClientRect().height;
      if (h > bestH) { bestH = h; root = el; }
    });
    const items = [...root.querySelectorAll(".newsUpdate-item")].map((el) => {
      const r = el.getBoundingClientRect();
      const a = el.querySelector("a");
      return {
        h: Math.round(r.height),
        w: Math.round(r.width),
        text: ((el.textContent) || "").trim().replace(/\s+/g, " ").slice(0, 80),
      };
    });
    // links not inside item
    const standaloneLinks = [...root.querySelectorAll("a")].filter(
      (a) => !a.closest(".newsUpdate-item"),
    ).map((a) => {
      const r = a.getBoundingClientRect();
      return { h: Math.round(r.height), text: a.textContent.trim().slice(0, 50) };
    });
    return { itemCount: items.length, items, standaloneCount: standaloneLinks.length, standaloneSample: standaloneLinks.slice(0, 5), rootH: bestH };
  });
}

const L = await probe(URLS.legacy);
const C = await probe(URLS.cand);
await b.close();

console.log("LEGACY:    items=", L.itemCount, "standaloneA=", L.standaloneCount, "rootH=", L.rootH);
console.log("CANDIDATE: items=", C.itemCount, "standaloneA=", C.standaloneCount, "rootH=", C.rootH);
console.log("\nItem-height histogram:");
const hist = (arr) => {
  const map = {};
  arr.forEach((i) => map[i.h] = (map[i.h] || 0) + 1);
  return map;
};
console.log("LEGACY h:", JSON.stringify(hist(L.items)));
console.log("CANDID h:", JSON.stringify(hist(C.items)));
console.log("\nSum heights legacy:", L.items.reduce((s, i) => s + i.h, 0));
console.log("Sum heights cand:  ", C.items.reduce((s, i) => s + i.h, 0));
console.log("\nFirst 5 legacy items:");
L.items.slice(0, 5).forEach((i) => console.log(`  h=${i.h} text=${i.text}`));
console.log("\nFirst 5 cand items:");
C.items.slice(0, 5).forEach((i) => console.log(`  h=${i.h} text=${i.text}`));
