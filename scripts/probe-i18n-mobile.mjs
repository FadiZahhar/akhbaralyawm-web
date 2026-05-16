import { chromium } from "playwright";
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
const p = await ctx.newPage();
const routes = ["/en", "/fr", "/en/category/29", "/fr/category/29", "/en/about", "/fr/about"];
for (const r of routes) {
  const resp = await p.goto("http://127.0.0.1:3000" + r, { waitUntil: "networkidle" });
  await p.waitForTimeout(700);
  const info = await p.evaluate(() => {
    const dir = document.documentElement.getAttribute("dir");
    const lang = document.documentElement.getAttribute("lang");
    const drawerToggle = !!document.querySelector(".mimic-mobile-nav-toggle");
    const hasHeader = !!document.querySelector(".header-area");
    const hasFooter = !!document.querySelector(".footer-top-area, footer");
    const navItems = [...document.querySelectorAll(".mimic-mobile-nav-list a")].length;
    return {
      sw: document.body.scrollWidth,
      cw: window.innerWidth,
      overflow: document.body.scrollWidth > window.innerWidth,
      dir, lang, drawerToggle, hasHeader, hasFooter, navItems,
    };
  });
  console.log(r, resp?.status(), JSON.stringify(info));
}
await b.close();
