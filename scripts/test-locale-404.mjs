#!/usr/bin/env node
/**
 * Verifies post-apiapp migration semantics: when an article has no
 * translation in the requested locale, the backend returns HTTP 404 with
 * `{ error: { code: "not_found" } }` — NOT a 200 with `fallbackUsed:true`.
 *
 * Run:  node scripts/test-locale-404.mjs --id <article-id>
 *       (defaults to env ARTICLE_ID_AR_ONLY or 1)
 * Env:  API_BASE_URL  (default: http://localhost:8081)
 */

const API = (process.env.API_BASE_URL || "http://localhost:8081").replace(/\/+$/, "");

const args = process.argv.slice(2);
const idFlag = args.indexOf("--id");
const ARTICLE_ID =
  idFlag >= 0 ? args[idFlag + 1] : process.env.ARTICLE_ID_AR_ONLY || "1";

let failures = 0;

function ok(label, cond, detail = "") {
  const icon = cond ? "✅" : "❌";
  console.log(`  ${icon} ${label}${detail ? ` — ${detail}` : ""}`);
  if (!cond) failures++;
}

async function fetchJson(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
  const text = await res.text();
  let body = null;
  try {
    body = JSON.parse(text);
  } catch {
    /* not JSON */
  }
  return { status: res.status, body };
}

async function checkLocale(lang) {
  const url = `${API}/v1/articles/by-id/${ARTICLE_ID}?lang=${lang}`;
  console.log(`\n→ GET ${url}`);
  const { status, body } = await fetchJson(url);

  if (status === 200) {
    ok(
      `${lang}: 200 → fallbackUsed must be false`,
      body?.fallbackUsed === false || body?.fallbackUsed === undefined,
      `got fallbackUsed=${body?.fallbackUsed}`,
    );
    ok(
      `${lang}: 200 → translationStatus must be empty`,
      !body?.translationStatus,
      `got translationStatus="${body?.translationStatus ?? ""}"`,
    );
    if (body?.lang) {
      ok(
        `${lang}: lang.requested === lang.content`,
        body.lang.requested === body.lang.content,
        `requested=${body.lang.requested} content=${body.lang.content}`,
      );
    }
  } else if (status === 404) {
    ok(
      `${lang}: 404 envelope has error.code="not_found"`,
      body?.error?.code === "not_found",
      `got ${JSON.stringify(body?.error ?? body)}`,
    );
  } else {
    ok(`${lang}: unexpected status ${status}`, false, JSON.stringify(body));
  }
}

(async () => {
  console.log(`API_BASE_URL=${API}`);
  console.log(`ARTICLE_ID=${ARTICLE_ID}`);

  for (const lang of ["ar", "en", "fr"]) {
    try {
      await checkLocale(lang);
    } catch (err) {
      ok(`${lang}: request failed`, false, String(err));
    }
  }

  console.log(failures === 0 ? "\nAll checks passed." : `\n${failures} check(s) failed.`);
  process.exit(failures === 0 ? 0 : 1);
})();
