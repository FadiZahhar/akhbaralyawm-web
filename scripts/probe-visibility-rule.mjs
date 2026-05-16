#!/usr/bin/env node
// Find which CSS rule sets visibility:collapse on nav-link
import { chromium } from "playwright";
const BASE_URL = (process.env.VISUAL_BASE_URL || "http://localhost:3000").replace(/\/+$/, "");

const b = await chromium.launch({ headless: true });
const c = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await c.newPage();
const cdp = await c.newCDPSession(p);
await cdp.send("DOM.enable");
await cdp.send("CSS.enable");

await p.goto(`${BASE_URL}/ar/v2`, { waitUntil: "load", timeout: 60000 });
await p.waitForTimeout(2500);

const docTree = await cdp.send("DOM.getDocument", { depth: -1 });
function findNavLink(node) {
  if (node.attributes) {
    for (let i = 0; i < node.attributes.length; i += 2) {
      if (node.attributes[i] === "class" && node.attributes[i + 1].includes("nav-link")) return node;
    }
  }
  for (const child of node.children || []) {
    const f = findNavLink(child);
    if (f) return f;
  }
  return null;
}
const target = findNavLink(docTree.root);
console.log("found nav-link nodeId:", target?.nodeId);

const matched = await cdp.send("CSS.getMatchedStylesForNode", { nodeId: target.nodeId });
for (const m of matched.matchedCSSRules || []) {
  const rule = m.rule;
  for (const prop of rule.style?.cssProperties || []) {
    if (prop.name === "visibility") {
      const url = rule.styleSheetId ? (await cdp.send("CSS.getStyleSheetText", { styleSheetId: rule.styleSheetId })) : null;
      console.log("VISIBILITY rule:", rule.selectorList.text, "=", prop.value, "  active=", !prop.disabled, "  origin=", rule.origin);
    }
  }
}
for (const ih of matched.inherited || []) {
  for (const m of ih.matchedCSSRules || []) {
    const rule = m.rule;
    for (const prop of rule.style?.cssProperties || []) {
      if (prop.name === "visibility") {
        console.log("INHERITED VISIBILITY rule:", rule.selectorList.text, "=", prop.value, "  origin=", rule.origin);
      }
    }
  }
}
await b.close();
