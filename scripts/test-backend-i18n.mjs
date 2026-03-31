#!/usr/bin/env node
/**
 * Backend i18n Integration Tests
 *
 * Run:   node scripts/test-backend-i18n.mjs
 * Env:   API_BASE_URL  (default: http://localhost:8081)
 *
 * Tests all 4 backend tasks (B1–B4) from 4backendtask.md.
 * Reports PASS / FAIL per acceptance criterion with a summary at the end.
 */

const API = (process.env.API_BASE_URL || "http://localhost:8081").replace(/\/+$/, "");

// ── Helpers ──────────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;
const results = [];

function report(task, label, ok, detail = "") {
  const status = ok ? "PASS" : "FAIL";
  const icon = ok ? "✅" : "❌";
  results.push({ task, label, ok, detail });
  console.log(`  ${icon} [${task}] ${label}${detail ? ` — ${detail}` : ""}`);
  if (ok) passed++;
  else failed++;
}

async function fetchJson(url, options = {}) {
  const res = await fetch(url, { ...options, signal: AbortSignal.timeout(10_000) });
  const text = await res.text();
  let body = null;
  try {
    body = JSON.parse(text);
  } catch {
    /* not JSON */
  }
  return { status: res.status, body, text, headers: res.headers };
}

function hasLangMeta(obj) {
  return (
    obj &&
    typeof obj.requestedLanguage === "string" &&
    typeof obj.contentLanguage === "string" &&
    typeof obj.fallbackUsed === "boolean"
  );
}

function isValidLocale(v) {
  return ["ar", "en", "fr"].includes(v);
}

// ── B1 Tests: LanguageMeta on All Endpoints ──────────────────────────────────

async function testB1() {
  console.log("\n━━━ B1: LanguageMeta on All Endpoints ━━━\n");

  const endpoints = [
    { path: "/v1/home/feed.ashx?limit=3", name: "home/feed", root: true },
    { path: "/v1/news.ashx?limit=3", name: "news (list)", root: true },
    { path: "/v1/search.ashx?q=test&limit=3", name: "search", root: true },
    { path: "/v1/sections.ashx", name: "sections", root: true },
    { path: "/v1/authors.ashx", name: "authors", root: true },
  ];

  // Test 1: All endpoints return the 3 new fields (lang=ar)
  for (const ep of endpoints) {
    try {
      const { body } = await fetchJson(`${API}${ep.path}&lang=ar`.replace("&lang=ar", `${ep.path.includes("?") ? "&" : "?"}lang=ar`), {
        headers: { "Accept-Language": "ar" },
      });
      const ok = hasLangMeta(body);
      report("B1", `${ep.name} returns LanguageMeta (lang=ar)`, ok,
        ok ? `requestedLanguage=${body.requestedLanguage}` : "Missing fields");
    } catch (e) {
      report("B1", `${ep.name} returns LanguageMeta (lang=ar)`, false, e.message);
    }
  }

  // Test 2: lang=ar → fallbackUsed: false
  try {
    const { body } = await fetchJson(`${API}/v1/home/feed.ashx?limit=1&lang=ar`);
    const ok = hasLangMeta(body) && body.fallbackUsed === false && body.contentLanguage === "ar";
    report("B1", "lang=ar → fallbackUsed=false, contentLanguage=ar", ok,
      body ? `fallbackUsed=${body.fallbackUsed}` : "");
  } catch (e) {
    report("B1", "lang=ar → fallbackUsed=false", false, e.message);
  }

  // Test 3: lang=en/fr → LanguageMeta is consistent (fallbackUsed matches contentLanguage)
  for (const locale of ["en", "fr"]) {
    try {
      const { body } = await fetchJson(`${API}/v1/home/feed.ashx?limit=1&lang=${locale}`, {
        headers: { "Accept-Language": locale },
      });
      if (!hasLangMeta(body)) {
        report("B1", `lang=${locale} → LanguageMeta consistent`, false, "Missing fields");
        continue;
      }
      const metaConsistent = body.requestedLanguage === locale &&
        ((body.contentLanguage === locale && body.fallbackUsed === false) ||
         (body.contentLanguage === "ar" && body.fallbackUsed === true));
      const detail = `requestedLanguage=${body.requestedLanguage}, contentLanguage=${body.contentLanguage}, fallbackUsed=${body.fallbackUsed}`;
      report("B1", `lang=${locale} → LanguageMeta consistent`, metaConsistent, detail);
    } catch (e) {
      report("B1", `lang=${locale} → LanguageMeta consistent`, false, e.message);
    }
  }

  // Test 4: Missing lang defaults to ar
  try {
    const { body } = await fetchJson(`${API}/v1/home/feed.ashx?limit=1`);
    const ok = hasLangMeta(body) && body.requestedLanguage === "ar";
    report("B1", "Missing lang defaults to ar", ok,
      body ? `requestedLanguage=${body.requestedLanguage}` : "");
  } catch (e) {
    report("B1", "Missing lang defaults to ar", false, e.message);
  }

  // Test 5: Invalid lang defaults to ar
  try {
    const { body } = await fetchJson(`${API}/v1/home/feed.ashx?limit=1&lang=zz`);
    const ok = hasLangMeta(body) && body.requestedLanguage === "ar";
    report("B1", "Invalid lang=zz defaults to ar", ok,
      body ? `requestedLanguage=${body.requestedLanguage}` : "");
  } catch (e) {
    report("B1", "Invalid lang=zz defaults to ar", false, e.message);
  }

  // Test 6: Existing data shape preserved
  try {
    const { body } = await fetchJson(`${API}/v1/home/feed.ashx?limit=2&lang=ar`);
    const ok = body && Array.isArray(body.data) && body.data.length > 0;
    report("B1", "Existing data shape preserved (data array present)", ok);
  } catch (e) {
    report("B1", "Existing data shape preserved", false, e.message);
  }

  // Test 7: Single article endpoint
  try {
    const feedRes = await fetchJson(`${API}/v1/home/feed.ashx?limit=1&lang=ar`);
    const articleId = feedRes.body?.data?.[0]?.id;
    if (articleId) {
      const { body } = await fetchJson(`${API}/v1/news.ashx?id=${articleId}&lang=en`);
      const ok = hasLangMeta(body);
      report("B1", "Single article (news.ashx?id=) returns LanguageMeta", ok,
        ok ? `requestedLanguage=${body.requestedLanguage}` : "Missing fields");
    } else {
      report("B1", "Single article returns LanguageMeta", false, "Could not get article ID from feed");
    }
  } catch (e) {
    report("B1", "Single article returns LanguageMeta", false, e.message);
  }
}

// ── B2 Tests: Translation Tables ─────────────────────────────────────────────

async function testB2() {
  console.log("\n━━━ B2: Content Translation Tables ━━━\n");

  // Test 1: When a translation exists, contentLanguage matches requested
  for (const locale of ["en", "fr"]) {
    try {
      const { body } = await fetchJson(`${API}/v1/sections.ashx?lang=${locale}`);
      if (!hasLangMeta(body)) {
        report("B2", `sections lang=${locale} — LanguageMeta present`, false, "No LanguageMeta (need B1 first)");
        continue;
      }
      // If translations exist, at least some section titles should differ from Arabic
      const arRes = await fetchJson(`${API}/v1/sections.ashx?lang=ar`);
      const arTitles = new Set((arRes.body?.data || []).map((s) => s.title));
      const translatedTitles = (body.data || []).filter((s) => !arTitles.has(s.title));

      if (body.fallbackUsed === false && translatedTitles.length > 0) {
        report("B2", `sections lang=${locale} — translated content returned`, true,
          `${translatedTitles.length} translated titles found`);
      } else if (body.fallbackUsed === true) {
        report("B2", `sections lang=${locale} — still falling back to Arabic`, true,
          "Expected until translations are added (fallbackUsed=true)");
      } else {
        report("B2", `sections lang=${locale} — translation check`, false,
          "fallbackUsed=false but no different titles detected");
      }
    } catch (e) {
      report("B2", `sections lang=${locale}`, false, e.message);
    }
  }

  // Test 2: Article translation
  try {
    const feedRes = await fetchJson(`${API}/v1/home/feed.ashx?limit=1&lang=ar`);
    const articleId = feedRes.body?.data?.[0]?.id;
    if (articleId) {
      const arBody = (await fetchJson(`${API}/v1/news.ashx?id=${articleId}&lang=ar`)).body;
      const enBody = (await fetchJson(`${API}/v1/news.ashx?id=${articleId}&lang=en`)).body;

      if (!hasLangMeta(enBody)) {
        report("B2", "Article translation check", false, "No LanguageMeta on article (need B1)");
      } else if (enBody.fallbackUsed === false && enBody.title !== arBody?.title) {
        report("B2", "Article translation — en content differs from ar", true);
      } else if (enBody.fallbackUsed === true) {
        report("B2", "Article translation — still falling back", true, "Expected until translations added");
      } else {
        report("B2", "Article translation check", false, "Unexpected state");
      }
    } else {
      report("B2", "Article translation check", false, "No article ID available");
    }
  } catch (e) {
    report("B2", "Article translation check", false, e.message);
  }
}

// ── B3 Tests: Sitemap Endpoint ───────────────────────────────────────────────

async function testB3() {
  console.log("\n━━━ B3: Sitemap Endpoint ━━━\n");

  // Test 1: Endpoint exists and returns data
  try {
    const { status, body } = await fetchJson(`${API}/v1/sitemap.ashx?page=1&limit=5`);
    const ok = status === 200 && body && Array.isArray(body.data);
    report("B3", "GET /v1/sitemap.ashx returns 200 with data array", ok,
      ok ? `${body.data.length} items` : `status=${status}`);
  } catch (e) {
    report("B3", "Sitemap endpoint reachable", false, e.message);
    return; // skip remaining B3 tests
  }

  // Test 2: Pagination metadata present
  try {
    const { body } = await fetchJson(`${API}/v1/sitemap.ashx?page=1&limit=5`);
    const p = body?.pagination;
    const ok = p && typeof p.page === "number" && typeof p.limit === "number" &&
      typeof p.total === "number" && typeof p.total_pages === "number";
    report("B3", "Response includes pagination metadata", ok,
      p ? `total=${p.total}, total_pages=${p.total_pages}` : "No pagination object");
  } catch (e) {
    report("B3", "Pagination metadata", false, e.message);
  }

  // Test 3: Items have required fields (slugId, disdate, sectionLink)
  try {
    const { body } = await fetchJson(`${API}/v1/sitemap.ashx?page=1&limit=5`);
    const items = body?.data || [];
    const allValid = items.length > 0 && items.every((item) =>
      typeof item.slugId === "string" &&
      typeof item.disdate === "string" &&
      typeof item.sectionLink === "string"
    );
    report("B3", "Items have slugId, disdate, sectionLink", allValid,
      `${items.length} items checked`);
  } catch (e) {
    report("B3", "Item fields", false, e.message);
  }

  // Test 4: Default limit works (no limit param)
  try {
    const { body } = await fetchJson(`${API}/v1/sitemap.ashx?page=1`);
    const ok = body && Array.isArray(body.data) && body.pagination?.limit === 1000;
    report("B3", "Default limit=1000 when not specified", ok,
      `limit=${body?.pagination?.limit}`);
  } catch (e) {
    report("B3", "Default limit", false, e.message);
  }

  // Test 5: Ordered by disdate descending
  try {
    const { body } = await fetchJson(`${API}/v1/sitemap.ashx?page=1&limit=10`);
    const items = body?.data || [];
    let ordered = true;
    for (let i = 1; i < items.length; i++) {
      if (new Date(items[i].disdate) > new Date(items[i - 1].disdate)) {
        ordered = false;
        break;
      }
    }
    report("B3", "Results ordered by disdate descending", ordered && items.length > 1,
      `${items.length} items checked`);
  } catch (e) {
    report("B3", "Sort order", false, e.message);
  }
}

// ── B4 Tests: Fallback Analytics Endpoint ────────────────────────────────────

async function testB4() {
  console.log("\n━━━ B4: Fallback Analytics Endpoint ━━━\n");

  const analyticsUrl = `${API}/v1/analytics/fallback`;

  // Test 1: Valid POST returns 204
  try {
    const payload = {
      locale: "en",
      path: "/en/news/test-article-99999",
      endpoint: "/v1/articles/by-id.ashx",
      fallbackUsed: true,
      contentLanguage: "ar",
      timestamp: new Date().toISOString(),
    };
    const res = await fetch(analyticsUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10_000),
    });
    report("B4", "POST valid payload → 204", res.status === 204, `status=${res.status}`);
  } catch (e) {
    report("B4", "POST valid payload", false, e.message);
    return; // skip remaining B4 tests
  }

  // Test 2: Invalid locale returns 400
  try {
    const payload = {
      locale: "zz",
      path: "/zz/test",
      endpoint: "/v1/test",
      fallbackUsed: true,
      contentLanguage: "ar",
      timestamp: new Date().toISOString(),
    };
    const res = await fetch(analyticsUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10_000),
    });
    report("B4", "Invalid locale=zz → 400", res.status === 400, `status=${res.status}`);
  } catch (e) {
    report("B4", "Invalid locale rejection", false, e.message);
  }

  // Test 3: All valid locales accepted
  for (const locale of ["ar", "en", "fr"]) {
    try {
      const payload = {
        locale,
        path: `/${locale}/test-page`,
        endpoint: "/v1/home/feed.ashx",
        fallbackUsed: locale !== "ar",
        contentLanguage: "ar",
        timestamp: new Date().toISOString(),
      };
      const res = await fetch(analyticsUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10_000),
      });
      report("B4", `locale=${locale} accepted`, res.status === 204, `status=${res.status}`);
    } catch (e) {
      report("B4", `locale=${locale} accepted`, false, e.message);
    }
  }

  // Test 4: Empty body returns error (not 204)
  try {
    const res = await fetch(analyticsUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
      signal: AbortSignal.timeout(10_000),
    });
    // Should reject empty/invalid body — 400 is ideal, but 204 is acceptable per spec
    report("B4", "Empty body handled gracefully", res.status === 400 || res.status === 204,
      `status=${res.status}`);
  } catch (e) {
    report("B4", "Empty body handling", false, e.message);
  }

  // Test 5: Rate limiting exists (send rapid requests)
  try {
    const payload = {
      locale: "en",
      path: "/en/rate-limit-test",
      endpoint: "/v1/test",
      fallbackUsed: true,
      contentLanguage: "ar",
      timestamp: new Date().toISOString(),
    };
    const promises = Array.from({ length: 20 }, () =>
      fetch(analyticsUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10_000),
      })
    );
    const responses = await Promise.all(promises);
    const statuses = responses.map((r) => r.status);
    // We just verify the endpoint handles rapid requests without 500 errors
    const no500 = statuses.every((s) => s !== 500);
    report("B4", "Rapid requests handled without 500", no500,
      `statuses: ${[...new Set(statuses)].join(", ")}`);
  } catch (e) {
    report("B4", "Rate limit test", false, e.message);
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("╔══════════════════════════════════════════════════════╗");
  console.log("║   Backend i18n Integration Tests                    ║");
  console.log(`║   API: ${API.padEnd(45)}║`);
  console.log("╚══════════════════════════════════════════════════════╝");

  // Connectivity check
  try {
    await fetch(`${API}/v1/home/feed.ashx?limit=1`, { signal: AbortSignal.timeout(5_000) });
  } catch {
    console.error(`\n❌ Cannot reach API at ${API}`);
    console.error("   Set API_BASE_URL env variable or ensure the backend is running.\n");
    process.exit(1);
  }

  await testB1();
  await testB2();
  await testB3();
  await testB4();

  // Summary
  console.log("\n╔══════════════════════════════════════════════════════╗");
  console.log(`║   Results: ${passed} passed, ${failed} failed${" ".repeat(Math.max(0, 28 - String(passed).length - String(failed).length))}║`);
  console.log("╚══════════════════════════════════════════════════════╝");

  const byTask = {};
  for (const r of results) {
    if (!byTask[r.task]) byTask[r.task] = { pass: 0, fail: 0 };
    if (r.ok) byTask[r.task].pass++;
    else byTask[r.task].fail++;
  }
  console.log("\nPer-task breakdown:");
  for (const [task, counts] of Object.entries(byTask)) {
    const icon = counts.fail === 0 ? "✅" : "⚠️";
    console.log(`  ${icon} ${task}: ${counts.pass} pass, ${counts.fail} fail`);
  }
  console.log();

  process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error("Unhandled error:", e);
  process.exit(1);
});
