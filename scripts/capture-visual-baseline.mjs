#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

import { chromium } from "playwright";

const DEFAULT_BASE_URL = process.env.VISUAL_BASE_URL || "http://localhost:3000";
const DEFAULT_SEARCH_QUERY = process.env.VISUAL_SEARCH_QUERY || "لبنان";
const DEFAULT_AUTHOR_PATH = process.env.VISUAL_AUTHOR_PATH || "";

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 1024, height: 768 },
  { name: "mobile", width: 390, height: 844 },
];

function normalizeBaseUrl(value) {
  return value.replace(/\/+$/, "");
}

function timestampFolder() {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, "0");
  const datePart = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const timePart = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  return `${datePart}-${timePart}`;
}

async function tryFetch(url) {
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      return null;
    }
    return response.text();
  } catch {
    return null;
  }
}

function pickFirst(urls, needle) {
  return urls.find((value) => value.includes(needle)) || null;
}

async function discoverRouteCandidates(baseUrl) {
  const sitemapXml = await tryFetch(`${baseUrl}/sitemap.xml`);
  const urls = sitemapXml
    ? [...sitemapXml.matchAll(/<loc>(.*?)<\/loc>/g)].map((entry) => entry[1])
    : [];

  const firstCategory = pickFirst(urls, "/category/");
  const firstArticle = pickFirst(urls, "/news/");

  const toPath = (absoluteOrNull) => {
    if (!absoluteOrNull) {
      return null;
    }

    const parsed = new URL(absoluteOrNull);
    return `${parsed.pathname}${parsed.search}`;
  };

  return {
    category: toPath(firstCategory),
    article: toPath(firstArticle),
  };
}

function buildRouteList({ category, article }, searchQuery, authorPath) {
  const routes = [
    { key: "home", path: "/" },
    { key: "mix", path: "/mix" },
    { key: "about", path: "/about" },
    { key: "contact", path: "/contact" },
    { key: "search", path: `/search?q=${encodeURIComponent(searchQuery)}` },
  ];

  if (category) {
    routes.push({ key: "category", path: category });
  }

  if (article) {
    routes.push({ key: "article", path: article });
  }

  if (authorPath) {
    routes.push({ key: "author", path: authorPath.startsWith("/") ? authorPath : `/${authorPath}` });
  }

  return routes;
}

async function captureScreenshots(baseUrl, routes, outputDir) {
  let browser;

  try {
    browser = await chromium.launch({ headless: true });
  } catch {
    try {
      browser = await chromium.launch({ headless: true, channel: "chrome" });
    } catch {
      browser = await chromium.launch({ headless: true, channel: "msedge" });
    }
  }

  const manifest = [];

  try {
    for (const viewport of VIEWPORTS) {
      const context = await browser.newContext({ viewport });
      const page = await context.newPage();

      for (const route of routes) {
        const targetUrl = `${baseUrl}${route.path}`;
        const fileName = `${route.key}-${viewport.name}.png`;
        const filePath = path.join(outputDir, fileName);

        await page.goto(targetUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
        await page.waitForTimeout(1200);
        await page.screenshot({ path: filePath, fullPage: true });

        manifest.push({
          route: route.key,
          path: route.path,
          viewport: viewport.name,
          file: fileName,
          capturedAt: new Date().toISOString(),
        });
      }

      await context.close();
    }
  } finally {
    await browser.close();
  }

  await fs.writeFile(path.join(outputDir, "manifest.json"), JSON.stringify(manifest, null, 2), "utf8");
}

async function main() {
  const baseUrl = normalizeBaseUrl(DEFAULT_BASE_URL);
  const discovered = await discoverRouteCandidates(baseUrl);
  const routes = buildRouteList(discovered, DEFAULT_SEARCH_QUERY, DEFAULT_AUTHOR_PATH);

  const outputDir = path.join(process.cwd(), "docs", "visual-baseline", timestampFolder());
  await fs.mkdir(outputDir, { recursive: true });

  await captureScreenshots(baseUrl, routes, outputDir);

  console.log(`Saved ${routes.length * VIEWPORTS.length} screenshots to ${outputDir}`);
}

main().catch((error) => {
  console.error(`Failed to capture visual baseline: ${error.message}`);
  process.exit(1);
});
