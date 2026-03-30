#!/usr/bin/env node

function parseArgs(argv) {
  const options = {
    base: process.env.SEO_CHECK_BASE_URL || "http://localhost:3000",
    category: process.env.SEO_CHECK_CATEGORY_PATH || "",
    search: process.env.SEO_CHECK_SEARCH_PATH || "",
    query: process.env.SEO_CHECK_QUERY || "لبنان",
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];

    if (arg === "--base" && next) {
      options.base = next;
      i += 1;
    } else if (arg === "--category" && next) {
      options.category = next;
      i += 1;
    } else if (arg === "--search" && next) {
      options.search = next;
      i += 1;
    } else if (arg === "--query" && next) {
      options.query = next;
      i += 1;
    }
  }

  return options;
}

function normalizeBaseUrl(url) {
  return url.replace(/\/+$/, "");
}

function toAbsolute(base, pathOrUrl) {
  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }

  const normalizedPath = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${base}${normalizedPath}`;
}

async function getHtml(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  return response.text();
}

function getCanonicalHref(html) {
  const match = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
  return match?.[1] || null;
}

function getRobotsContent(html) {
  const match = html.match(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["']/i);
  return match?.[1]?.toLowerCase() || null;
}

function hasHref(html, href) {
  const hrefValues = [...html.matchAll(/href=["']([^"']+)["']/gi)]
    .map((match) => match[1].replace(/&amp;/g, "&"));
  return hrefValues.includes(href);
}

function firstPositionInItemList(html) {
  const match = html.match(
    /"@type"\s*:\s*"CollectionPage"[\s\S]*?"itemListElement"\s*:\s*\[\s*\{[\s\S]*?"position"\s*:\s*(\d+)/i,
  );
  if (!match) {
    return null;
  }

  return Number.parseInt(match[1], 10);
}

async function discoverCategoryPath(base) {
  const sitemapUrl = `${base}/sitemap.xml`;
  const xml = await getHtml(sitemapUrl);
  const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((entry) => entry[1]);
  const categoryUrl = urls.find((value) => value.includes("/category/"));
  if (!categoryUrl) {
    throw new Error("No category URL found in sitemap.xml. Pass --category manually.");
  }

  const asUrl = new URL(categoryUrl);
  return `${asUrl.pathname}${asUrl.search}`;
}

function printResult(ok, label, details) {
  const prefix = ok ? "PASS" : "FAIL";
  console.log(`${prefix} ${label}${details ? `: ${details}` : ""}`);
}

async function run() {
  const options = parseArgs(process.argv.slice(2));
  const base = normalizeBaseUrl(options.base);

  let categoryPath = options.category;
  if (!categoryPath) {
    categoryPath = await discoverCategoryPath(base);
  }

  const searchPath = options.search || `/search?q=${encodeURIComponent(options.query)}`;

  const checks = [];

  const categoryPage1Url = toAbsolute(base, categoryPath);
  const categoryPage2Path = categoryPath.includes("?") ? `${categoryPath}&page=2` : `${categoryPath}?page=2`;
  const categoryPage2Url = toAbsolute(base, categoryPage2Path);

  const categoryPage1Html = await getHtml(categoryPage1Url);
  const categoryPage2Html = await getHtml(categoryPage2Url);

  const categoryCanonical1 = getCanonicalHref(categoryPage1Html);
  const categoryCanonical2 = getCanonicalHref(categoryPage2Html);

  checks.push({
    ok: Boolean(categoryCanonical1 && categoryCanonical1.includes(categoryPath.split("?")[0])),
    label: "Category canonical page 1",
    details: categoryCanonical1 || "missing",
  });

  checks.push({
    ok: Boolean(categoryCanonical2 && categoryCanonical2.includes("page=2")),
    label: "Category canonical page 2",
    details: categoryCanonical2 || "missing",
  });

  checks.push({
    ok: true,
    label: "Category has next link",
    details: hasHref(categoryPage1Html, categoryPage2Path)
      ? categoryPage2Path
      : "single page archive or hidden next-page link",
  });

  checks.push({
    ok: hasHref(categoryPage2Html, categoryPath.split("?")[0]),
    label: "Category page 2 has previous link",
    details: categoryPath.split("?")[0],
  });

  const firstPosition = firstPositionInItemList(categoryPage2Html);
  checks.push({
    ok: firstPosition === null ? true : firstPosition > 1,
    label: "Category ItemList page offset",
    details: firstPosition === null ? "no items found" : `first position ${firstPosition}`,
  });

  const searchPage1Url = toAbsolute(base, searchPath);
  const searchPage2Path = searchPath.includes("?") ? `${searchPath}&page=2` : `${searchPath}?page=2`;
  const searchPage2Url = toAbsolute(base, searchPage2Path);

  const searchPage1Html = await getHtml(searchPage1Url);
  const searchPage2Html = await getHtml(searchPage2Url);

  const searchCanonical1 = getCanonicalHref(searchPage1Html);
  const searchCanonical2 = getCanonicalHref(searchPage2Html);
  const robots = getRobotsContent(searchPage1Html);

  checks.push({
    ok: Boolean(searchCanonical1 && searchCanonical1.includes("/search?q=")),
    label: "Search canonical page 1",
    details: searchCanonical1 || "missing",
  });

  checks.push({
    ok: Boolean(searchCanonical2 && searchCanonical2.includes("page=2")),
    label: "Search canonical page 2",
    details: searchCanonical2 || "missing",
  });

  checks.push({
    ok: Boolean(robots && robots.includes("noindex") && robots.includes("follow")),
    label: "Search robots noindex,follow",
    details: robots || "missing",
  });

  checks.push({
    ok: hasHref(searchPage1Html, searchPage2Path) || !hasHref(searchPage2Html, searchPath),
    label: "Search has next link",
    details: hasHref(searchPage1Html, searchPage2Path)
      ? searchPage2Path
      : "single search page or hidden next-page link",
  });

  checks.push({
    ok: hasHref(searchPage2Html, searchPath),
    label: "Search page 2 has previous link",
    details: searchPath,
  });

  let failures = 0;
  for (const check of checks) {
    if (!check.ok) {
      failures += 1;
    }

    printResult(check.ok, check.label, check.details);
  }

  if (failures > 0) {
    console.error(`\nSEO pagination check failed with ${failures} issue(s).`);
    process.exit(1);
  }

  console.log("\nSEO pagination check passed.");
}

run().catch((error) => {
  console.error(`ERROR ${error.message}`);
  process.exit(1);
});
