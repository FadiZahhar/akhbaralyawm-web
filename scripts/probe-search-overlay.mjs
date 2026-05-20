import { chromium } from "playwright";

async function probe(viewport, label) {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport });
  const page = await ctx.newPage();
  await page.goto("http://localhost:3000/ar", { waitUntil: "networkidle" });

  const triggerCount = await page.locator(".mimic-search-trigger").count();
  const closed = await page.evaluate(() => {
    const ov = document.querySelector(".mimic-search-overlay");
    const panel = document.querySelector(".mimic-search-panel");
    return {
      hasOverlay: !!ov,
      isOpen: ov?.classList.contains("is-open") ?? null,
      panelTransform: panel ? getComputedStyle(panel).transform : null,
      panelVisible: panel ? panel.getBoundingClientRect().bottom : null,
    };
  });

  // Click first visible trigger
  const trig = page.locator(".mimic-search-trigger:visible").first();
  await trig.click();
  await page.waitForTimeout(400);

  const open = await page.evaluate(() => {
    const ovs = [...document.querySelectorAll(".mimic-search-overlay")];
    const ov = ovs.find((o) => o.classList.contains("is-open")) || ovs[0];
    const panel = ov?.querySelector(".mimic-search-panel");
    const closeBtn = ov?.querySelector(".mimic-search-close");
    return {
      overlayCount: ovs.length,
      isOpen: ov?.classList.contains("is-open") ?? null,
      panelTop: panel?.getBoundingClientRect().top ?? null,
      panelBottom: panel?.getBoundingClientRect().bottom ?? null,
      focused: document.activeElement?.tagName?.toLowerCase() ?? null,
      hasClose: !!closeBtn,
      bodyOverflow: getComputedStyle(document.body).overflow,
    };
  });

  // Close via close button (target the open one — tabindex=0)
  await page.locator('.mimic-search-close[tabindex="0"]').click();
  await page.waitForTimeout(400);
  const afterClose = await page.evaluate(() => {
    const ov = document.querySelector(".mimic-search-overlay");
    return {
      isOpen: ov?.classList.contains("is-open") ?? null,
      bodyOverflow: getComputedStyle(document.body).overflow,
    };
  });

  console.log(`\n=== ${label} (${viewport.width}x${viewport.height}) ===`);
  console.log("triggers:", triggerCount);
  console.log("closed initially:", closed);
  console.log("after click:", open);
  console.log("after close:", afterClose);

  await browser.close();
}

await probe({ width: 1440, height: 900 }, "desktop");
await probe({ width: 390, height: 844 }, "mobile");
