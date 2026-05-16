#!/usr/bin/env node
// Pairwise visual diff: capture screenshots of /v2 (Next.js) and the legacy
// snapshot served from /legacy-snapshot/<name>/index.html, then produce a
// per-route mismatch percentage + a red-highlighted diff PNG.
//
// Why: This is the convergence signal for the "mimic" track. We want the
// number per template to drop monotonically as parity work lands.
//
// Usage (with `npm run dev` already running on http://localhost:3000):
//   node scripts/visual-diff.mjs
//   VISUAL_BASE_URL=http://localhost:3000 node scripts/visual-diff.mjs
//
// Output:
//   docs/visual-baseline/diff/<timestamp>/
//     home-ar-desktop.legacy.png
//     home-ar-desktop.v2.png
//     home-ar-desktop.diff.png
//     report.json   (per-route mismatch %)

import fs from "node:fs/promises";
import path from "node:path";

import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import { chromium } from "playwright";

const BASE_URL = (process.env.VISUAL_BASE_URL || "http://localhost:3000").replace(/\/+$/, "");

// Each target captures the same logical page in two places: the legacy
// snapshot (ground truth) and the Next.js /v2 route under comparison.
const TARGETS = [
  {
    key: "home-ar",
    legacy: "/legacy-snapshot/home-ar/index.html",
    candidate: "/ar/v2",
  },
  // Add more as snapshots get extracted, e.g.
  // { key: "home-fr", legacy: "/legacy-snapshot/home-fr/index.html", candidate: "/fr/v2" },
];

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];

// Allow narrowing the run from the CLI: `node scripts/visual-diff.mjs desktop`
const VIEWPORT_FILTER = process.argv.slice(2).filter((arg) => !arg.startsWith("-"));
const ACTIVE_VIEWPORTS = VIEWPORT_FILTER.length
  ? VIEWPORTS.filter((v) => VIEWPORT_FILTER.includes(v.name))
  : VIEWPORTS;

function timestampFolder() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

async function launchBrowser() {
  try {
    return await chromium.launch({ headless: true });
  } catch {
    try {
      return await chromium.launch({ headless: true, channel: "chrome" });
    } catch {
      return await chromium.launch({ headless: true, channel: "msedge" });
    }
  }
}

async function capture(page, url, outPath) {
  // The legacy CDN keeps long-poll/analytics connections open, so
  // `networkidle` never settles. `load` + a settle delay is reliable.
  await page.goto(url, { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: outPath, fullPage: true });

  // Collect bounding boxes of every <img> (and <picture>, <video>, <iframe>)
  // so the diff can exclude these areas from the mismatch count. The legacy
  // snapshot is frozen Apr 18, the candidate fetches live API responses;
  // article photos will always differ at the pixel level. Without this mask,
  // structural progress is invisible after iteration 3.
  const imgBoxes = await page.evaluate(() => {
    const rects = [];
    const nodes = document.querySelectorAll("img, picture, video, iframe, [style*='background-image']");
    for (const el of nodes) {
      const r = el.getBoundingClientRect();
      // getBoundingClientRect is viewport-relative; for full-page screenshots
      // we need page coordinates.
      const top = r.top + window.scrollY;
      const left = r.left + window.scrollX;
      if (r.width <= 0 || r.height <= 0) continue;
      rects.push({
        top: Math.max(0, Math.floor(top)),
        left: Math.max(0, Math.floor(left)),
        width: Math.ceil(r.width),
        height: Math.ceil(r.height),
      });
    }
    return rects;
  });

  // Text-leaf bounding boxes. Article headlines are data-driven (live API vs
  // frozen Apr 18 MHTML) — the rectangles where text is rendered will always
  // mismatch even when layout is perfect. Excluding them along with image
  // boxes isolates true structural drift (margins, padding, borders, icons).
  const textBoxes = await page.evaluate(() => {
    const rects = [];
    const SKIP = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE"]);
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
    let node = walker.currentNode;
    while ((node = walker.nextNode())) {
      if (SKIP.has(node.tagName)) continue;
      // Only count elements whose direct text content has actual letters/digits
      // AND whose only element children are inline icons/styling (i, span, br,
      // small, strong, em). This catches headlines, time stamps, button labels.
      let hasOwnText = false;
      let onlyInlineChildren = true;
      for (const child of node.childNodes) {
        if (child.nodeType === Node.TEXT_NODE) {
          if (/\S/.test(child.nodeValue)) hasOwnText = true;
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          const t = child.tagName;
          if (!(t === "I" || t === "SPAN" || t === "BR" || t === "SMALL" || t === "STRONG" || t === "EM" || t === "B")) {
            onlyInlineChildren = false;
            break;
          }
        }
      }
      if (!hasOwnText || !onlyInlineChildren) continue;
      const r = node.getBoundingClientRect();
      if (r.width <= 0 || r.height <= 0) continue;
      rects.push({
        top: Math.max(0, Math.floor(r.top + window.scrollY)),
        left: Math.max(0, Math.floor(r.left + window.scrollX)),
        width: Math.ceil(r.width),
        height: Math.ceil(r.height),
      });
    }
    return rects;
  });

  return { imgBoxes, textBoxes };
}

function loadPng(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath)
      .then((buf) => {
        const png = new PNG();
        png.parse(buf, (err, data) => (err ? reject(err) : resolve(data)));
      })
      .catch(reject);
  });
}

// Zones (in CSS px from the top of the full-page screenshot) we report on
// independently, so per-iteration progress is visible even when most of the
// page is still drifting. Heights are approximate; we crop to whatever the
// shared image height supports.
const ZONES = [
  { name: "full", top: 0, height: Infinity },
  { name: "header", top: 0, height: 250 },
  { name: "body-fold", top: 250, height: 900 }, // first viewport below header
  { name: "footer", top: -650, height: 650 }, // negative top = from the bottom
];

function cropToCommonSize(a, b) {
  // pixelmatch requires identical dimensions. Crop both to the smallest shared
  // box from the top-left. This is the standard convention for full-page shots
  // that may differ in length. We report the *uncropped* heights separately so
  // page-height drift remains visible.
  const width = Math.min(a.width, b.width);
  const height = Math.min(a.height, b.height);
  const crop = (src) => {
    if (src.width === width && src.height === height) return src;
    const out = new PNG({ width, height });
    for (let y = 0; y < height; y += 1) {
      const srcStart = (src.width * y) * 4;
      const dstStart = (width * y) * 4;
      src.data.copy(out.data, dstStart, srcStart, srcStart + width * 4);
    }
    return out;
  };
  return [crop(a), crop(b), width, height];
}

function buildImgExclusionMask(width, height, boxesA, boxesB) {
  // Bitmap: 1 byte per pixel, 1 = excluded.
  const mask = new Uint8Array(width * height);
  const paint = (boxes) => {
    for (const box of boxes) {
      const top = Math.max(0, Math.min(height, box.top));
      const left = Math.max(0, Math.min(width, box.left));
      const right = Math.max(0, Math.min(width, box.left + box.width));
      const bottom = Math.max(0, Math.min(height, box.top + box.height));
      for (let y = top; y < bottom; y += 1) {
        const rowStart = y * width;
        for (let x = left; x < right; x += 1) {
          mask[rowStart + x] = 1;
        }
      }
    }
  };
  paint(boxesA);
  paint(boxesB);
  return mask;
}

async function diffPair(legacyPath, candidatePath, diffPath, imgMaskPath, legacyBoxes = [], candidateBoxes = [], legacyTextBoxes = [], candidateTextBoxes = []) {
  const [rawA, rawB] = await Promise.all([loadPng(legacyPath), loadPng(candidatePath)]);
  const legacyHeight = rawA.height;
  const candidateHeight = rawB.height;
  const [a, b, width, height] = cropToCommonSize(rawA, rawB);

  // Visual diff: matched pixels stay as a faded version of the source, mismatched
  // pixels are bright red. Good for human review.
  const diff = new PNG({ width, height });
  const mismatched = pixelmatch(a.data, b.data, diff.data, width, height, {
    threshold: 0.1,
    includeAA: false,
  });
  await fs.writeFile(diffPath, PNG.sync.write(diff));

  // Mask diff: transparent everywhere except mismatched pixels (alpha=255).
  // Used for accurate per-zone counting.
  const mask = new PNG({ width, height });
  pixelmatch(a.data, b.data, mask.data, width, height, {
    threshold: 0.1,
    includeAA: false,
    diffMask: true,
  });

  const total = width * height;

  // Image-exclusion mask: union of all <img>/<picture>/<video>/<iframe> boxes
  // from both legacy and candidate, clipped to the shared frame. Pixels under
  // this mask are dominated by photo content, which is data-driven and will
  // always differ between the frozen Apr 18 snapshot and the live API.
  // Excluding them gives a structural-mismatch number that actually moves
  // as layout/typography/chrome converge.
  const exclude = buildImgExclusionMask(
    width,
    height,
    [...legacyBoxes, ...legacyTextBoxes],
    [...candidateBoxes, ...candidateTextBoxes],
  );
  let excludedTotal = 0;
  for (let i = 0; i < exclude.length; i += 1) if (exclude[i]) excludedTotal += 1;

  // Also write the exclusion mask as a PNG (red = excluded) so reviewers can
  // see what's being ignored.
  if (imgMaskPath) {
    const maskPng = new PNG({ width, height });
    for (let i = 0; i < exclude.length; i += 1) {
      const off = i * 4;
      if (exclude[i]) {
        maskPng.data[off] = 255;
        maskPng.data[off + 1] = 0;
        maskPng.data[off + 2] = 0;
        maskPng.data[off + 3] = 128;
      } else {
        maskPng.data[off + 3] = 0;
      }
    }
    await fs.writeFile(imgMaskPath, PNG.sync.write(maskPng));
  }

  // Anchor footer zone to the *legacy* footer position. If the candidate is
  // taller, this measures legacy-footer vs candidate-at-that-row (likely the
  // candidate's middle content), surfacing height drift without inflating the
  // zone metric to ~100%.
  const zoneStats = [];
  let structuralMismatchedTotal = 0;
  for (const zone of ZONES) {
    let top;
    let zoneHeight;
    if (zone.name === "footer") {
      top = Math.max(0, legacyHeight - Math.abs(zone.top));
      zoneHeight = Math.min(Math.abs(zone.top), height - top);
    } else if (zone.top < 0) {
      top = Math.max(0, height + zone.top);
      zoneHeight = Math.min(zone.height, height - top);
    } else {
      top = zone.top;
      zoneHeight = zone.height === Infinity ? height - top : Math.min(zone.height, height - top);
    }
    if (zoneHeight <= 0) continue;

    let zoneMismatched = 0;
    let zoneStructural = 0;
    let zoneExcluded = 0;
    for (let y = top; y < top + zoneHeight; y += 1) {
      const rowStart = y * width;
      const alphaRowStart = rowStart * 4 + 3;
      for (let x = 0; x < width; x += 1) {
        const isExcluded = exclude[rowStart + x] === 1;
        if (isExcluded) zoneExcluded += 1;
        if (mask.data[alphaRowStart + x * 4] !== 0) {
          zoneMismatched += 1;
          if (!isExcluded) zoneStructural += 1;
        }
      }
    }
    if (zone.name === "full") structuralMismatchedTotal = zoneStructural;
    const zoneTotal = width * zoneHeight;
    const structuralDenominator = zoneTotal - zoneExcluded;
    zoneStats.push({
      zone: zone.name,
      top,
      height: zoneHeight,
      mismatchedPixels: zoneMismatched,
      mismatchPercent: zoneTotal === 0 ? 0 : Number(((zoneMismatched / zoneTotal) * 100).toFixed(3)),
      structuralMismatchedPixels: zoneStructural,
      structuralMismatchPercent:
        structuralDenominator === 0
          ? 0
          : Number(((zoneStructural / structuralDenominator) * 100).toFixed(3)),
      excludedPixels: zoneExcluded,
    });
  }

  const structuralDenom = total - excludedTotal;
  return {
    width,
    height,
    legacyHeight,
    candidateHeight,
    heightDeltaPx: candidateHeight - legacyHeight,
    mismatchedPixels: mismatched,
    mismatchPercent: total === 0 ? 0 : (mismatched / total) * 100,
    excludedPixels: excludedTotal,
    structuralMismatchedPixels: structuralMismatchedTotal,
    structuralMismatchPercent:
      structuralDenom === 0 ? 0 : Number(((structuralMismatchedTotal / structuralDenom) * 100).toFixed(3)),
    zones: zoneStats,
  };
}

async function main() {
  const outDir = path.resolve(process.cwd(), "docs", "visual-baseline", "diff", timestampFolder());
  await fs.mkdir(outDir, { recursive: true });

  const browser = await launchBrowser();
  const report = [];

  try {
    for (const viewport of ACTIVE_VIEWPORTS) {
      const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
      const page = await context.newPage();

      for (const target of TARGETS) {
        const legacyShot = path.join(outDir, `${target.key}-${viewport.name}.legacy.png`);
        const candidateShot = path.join(outDir, `${target.key}-${viewport.name}.v2.png`);
        const diffShot = path.join(outDir, `${target.key}-${viewport.name}.diff.png`);

        try {
          const legacyCap = await capture(page, `${BASE_URL}${target.legacy}`, legacyShot);
          const candidateCap = await capture(page, `${BASE_URL}${target.candidate}`, candidateShot);
          const imgMaskShot = path.join(outDir, `${target.key}-${viewport.name}.imgmask.png`);
          const result = await diffPair(
            legacyShot,
            candidateShot,
            diffShot,
            imgMaskShot,
            legacyCap.imgBoxes,
            candidateCap.imgBoxes,
            legacyCap.textBoxes,
            candidateCap.textBoxes,
          );
          report.push({
            target: target.key,
            viewport: viewport.name,
            legacy: target.legacy,
            candidate: target.candidate,
            ...result,
            mismatchPercent: Number(result.mismatchPercent.toFixed(3)),
          });
          // eslint-disable-next-line no-console
          console.log(
            `${target.key} [${viewport.name}]: raw=${result.mismatchPercent.toFixed(2)}%  structural=${result.structuralMismatchPercent.toFixed(2)}%  (excluded ${result.excludedPixels} img-px, heightDelta=${result.heightDeltaPx >= 0 ? "+" : ""}${result.heightDeltaPx}px)`,
          );
          for (const zone of result.zones) {
            // eslint-disable-next-line no-console
            console.log(
              `  └─ ${zone.zone.padEnd(10)} raw=${zone.mismatchPercent.toFixed(2).padStart(6)}%  structural=${zone.structuralMismatchPercent.toFixed(2).padStart(6)}%`,
            );
          }
        } catch (err) {
          report.push({
            target: target.key,
            viewport: viewport.name,
            error: err.message,
          });
          console.error(`${target.key} [${viewport.name}] failed:`, err.message);
        }
      }

      await context.close();
    }
  } finally {
    await browser.close();
  }

  await fs.writeFile(path.join(outDir, "report.json"), JSON.stringify(report, null, 2), "utf8");
  console.log(`\nReport written to ${path.relative(process.cwd(), outDir)}/report.json`);
}

main().catch((err) => {
  console.error(err.stack || err.message);
  process.exit(1);
});
