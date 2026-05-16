// Enumerate top-level section bands in both pages to find vertical drift.
import { chromium } from "playwright";

const LEGACY = "http://127.0.0.1:3000/legacy-snapshot/home-ar/index.html";
const CAND = "http://127.0.0.1:3000/ar/v2";

async function collect(page, url) {
  await page.goto(url, { waitUntil: "networkidle" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(500);
  return page.evaluate(() => {
    const found = [];
    document.querySelectorAll("section, [class*='-area']").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.height < 100 || r.width < 800) return;
      // skip nested
      found.push({
        cls: (el.className || "").toString().trim().split(/\s+/).slice(0, 4).join("."),
        tag: el.tagName,
        top: Math.round(r.top + window.scrollY),
        h: Math.round(r.height),
      });
    });
    // dedupe overlapping (keep outermost)
    found.sort((a, b) => a.top - b.top || b.h - a.h);
    return found;
  });
}

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const L = await collect(page, LEGACY);
const C = await collect(page, CAND);
await browser.close();

// align by class signature
console.log("LEGACY".padEnd(70), "CANDIDATE".padEnd(70), "Δtop");
const max = Math.max(L.length, C.length);
for (let i = 0; i < max; i++) {
  const l = L[i] || {};
  const c = C[i] || {};
  const ls = `${l.tag || "-"} ${l.cls || ""} top=${l.top} h=${l.h}`.padEnd(70);
  const cs = `${c.tag || "-"} ${c.cls || ""} top=${c.top} h=${c.h}`.padEnd(70);
  const d = l.top !== undefined && c.top !== undefined ? c.top - l.top : "";
  console.log(ls, cs, d);
}
