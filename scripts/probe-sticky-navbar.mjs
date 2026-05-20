import { chromium } from "playwright";

const url = "http://localhost:3000/ar";

async function probe(viewport, label) {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: "networkidle" });

  const before = await page.evaluate(() => {
    const nav = document.querySelector(".navbar-area");
    const top = document.querySelector(".top-header");
    return {
      navTop: nav?.getBoundingClientRect().top ?? null,
      navPos: nav ? getComputedStyle(nav).position : null,
      navParent: nav?.parentElement?.className ?? null,
      topBottom: top?.getBoundingClientRect().bottom ?? null,
    };
  });

  await page.evaluate(() => window.scrollTo(0, 800));
  await page.waitForTimeout(300);

  const after = await page.evaluate(() => {
    const nav = document.querySelector(".navbar-area");
    const top = document.querySelector(".top-header");
    return {
      navTop: nav?.getBoundingClientRect().top ?? null,
      navPos: nav ? getComputedStyle(nav).position : null,
      navShadow: nav ? getComputedStyle(nav).boxShadow : null,
      topBottom: top?.getBoundingClientRect().bottom ?? null,
      scrollY: window.scrollY,
      bodyW: document.body.scrollWidth,
    };
  });

  console.log(`\n=== ${label} (${viewport.width}x${viewport.height}) ===`);
  console.log("BEFORE scroll:", before);
  console.log("AFTER  scroll:", after);

  await browser.close();
}

await probe({ width: 1440, height: 900 }, "desktop");
await probe({ width: 390, height: 844 }, "mobile");
