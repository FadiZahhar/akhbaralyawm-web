import { chromium } from "playwright";

const LEGACY = "http://127.0.0.1:3000/legacy-snapshot/home-ar/index.html";
const CAND = "http://127.0.0.1:3000/ar/v2";

async function collect(page, url) {
  await page.goto(url, { waitUntil: "networkidle" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(500);
  return page.evaluate(() => {
    // pick the largest .new-news-area (legacy has 4, 3 are zero-height)
    let root = null;
    let bestH = 0;
    document.querySelectorAll(".new-news-area").forEach((el) => {
      const h = el.getBoundingClientRect().height;
      if (h > bestH) { bestH = h; root = el; }
    });
    if (!root) return [];
    const found = [];
    // immediate descendants ≥80px tall
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
    let n;
    while ((n = walker.nextNode())) {
      const r = n.getBoundingClientRect();
      if (r.height < 60 || r.width < 200) continue;
      found.push({
        tag: n.tagName,
        cls: (n.className || "").toString().trim().split(/\s+/).slice(0, 4).join("."),
        top: Math.round(r.top + scrollY),
        h: Math.round(r.height),
      });
    }
    return found.sort((a, b) => a.top - b.top || b.h - a.h);
  });
}

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
const L = await collect(p, LEGACY);
const C = await collect(p, CAND);
await b.close();

console.log(`LEGACY count=${L.length}  CANDIDATE count=${C.length}`);
console.log("LEGACY".padEnd(70), "CANDIDATE".padEnd(70), "Δh");
const max = Math.max(L.length, C.length);
for (let i = 0; i < max; i++) {
  const l = L[i] || {};
  const c = C[i] || {};
  const ls = `${l.tag || "-"} ${l.cls || ""} top=${l.top} h=${l.h}`.padEnd(70);
  const cs = `${c.tag || "-"} ${c.cls || ""} top=${c.top} h=${c.h}`.padEnd(70);
  const d = l.h !== undefined && c.h !== undefined ? c.h - l.h : "";
  console.log(ls, cs, d);
}
