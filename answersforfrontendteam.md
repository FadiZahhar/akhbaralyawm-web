# Answers for the Front-End Team

> Date: 2026-04-27
> Source of truth: live `akhbaralyawm` DB + `ApiApp/v1/*` handlers as of this commit.

---

## 1) EN/FR section IDs

**There are no separate EN/FR section IDs — and there shouldn't be.** Sections are a single row in `TBS_Section`; locale only changes the `title`/`slug` via `TBS_Section_Translation`. The **AR ids are the canonical ids for all locales**.

Mapping for the requested AR ids (titles confirmed against the live DB):

| Section id (all locales) | AR title (current) | AR slug (`link`) | Suggested EN | Suggested FR |
|---|---|---|---|---|
| 29 | خاص اليوم | `29` | Today's Special | Spécial du Jour |
| 30 | العرب والعالم | `30` | Arabs & World | Arabes et Monde |
| 33 | رياضة | `33` | Sports | Sports |
| 39 | تكنولوجيا | `39` | Technology | Technologie |
| 45 | سياسة | `45` | Politics | Politique |
| 46 | اقتصاد | `46` | Economy | Économie |
| 56 | البرامج | `56` | Programs | Programmes |

"29 featured" and "56 programs" → **same ids 29 and 56** (semantic labels, not separate sections).

**EN/FR translations are NOT yet populated** in `TBS_Section_Translation` (current counts: ar=27, en=1, fr=1). Until the editor team backfills them, calling `/v1/sections?lang=en` returns the AR title with `fallbackUsed: true` and `contentLanguage: "ar"` — which is correct per `backendfix.md` §0.4. Front-end can keep fallback labels client-side, but **don't hardcode different ids per locale**.

**Action for the front-end:** use one ID map (`featured: 29, programs: 56, sports: 33, …`). The EN/FR labels and slugs come from the API automatically once translations are seeded.

---

## 2) EN/FR CMS page IDs

Same model — pages are single rows, only the locale text changes.

| Page id | Purpose | EN | FR |
|---|---|---|---|
| 1 | About | `title: "About Us"`, `slug: "about-us"` ✅ in DB | `title: "À Propos"`, `slug: "a-propos"` ✅ in DB |
| 2 | Contact | not yet translated (NULL) | not yet translated (NULL) |

So: **about=1, contact=2 across all locales**. EN/FR for page 1 are already live; page 2 needs editor backfill (`UPDATE`/`INSERT` into `TBS_Pages_Translation` for `page_id=2, locale='en'/'fr'`).

Front-end should call:

- `/v1/pages/by-id/1?lang=en`
- `/v1/pages/by-slug/about-us?lang=en`

Both supported, both return the new schema with `slug`, `oldSlugs`, `canonicalSlug`, `ETag`.

---

## 3) UI copy defaults

**Defaults are fine — keep them client-side.** These are pure presentation strings; they don't belong in the API. None of them is translatable content from the CMS.

| Key | EN | FR |
|---|---|---|
| `newsTag` | News | Actualités |
| `ad` | Advertisement | Publicité |
| `noContent` | Not yet available in this language | Pas encore disponible dans cette langue |
| `programsLabel` | Programs | Programmes |

If you ever want CMS-editable copy, we'd add a `/v1/i18n/strings?lang=` endpoint — not needed today.

---

## 4) Strategy 2A vs 2B

**Go with 2A now, 2B later — but the migration is tiny because the IDs don't change.**

What you can use **today** (already shipped):

- Slug-based lookups are live:
  - `/v1/articles/by-slug/{slug}?lang=`
  - `/v1/sections/by-slug/{slug}?lang=`
  - `/v1/pages/by-slug/{slug}?lang=`
  - `/v1/authors/by-slug/{slug}?lang=`
- Filter news list by section slug: `/v1/news?sectionSlug=politics&lang=en&page=1&limit=12`.
- Each detail response carries `slug`, `canonicalSlug`, `oldSlugs[]`, `ETag`, and (for articles) `tags[]`, `youtubeUrl`, `statusId`.
- `canonicalSlug` is the EN/FR slug when content is translated, else the AR slug — front-end should 301 to canonical when the requested slug differs from `canonicalSlug`.

Recommended path:

1. **Now (2A):** ship one ID map `{featured:29, politics:45, world:30, sports:33, tech:39, economy:46, programs:56}`. Hit the API with the AR id and `lang=en|fr`. The API returns localized title/slug + `fallbackUsed` so you can render the correct label automatically.
2. **As soon as editors seed EN/FR translations**, start preferring slug routes: `/sections/by-slug/politics`, `/news?sectionSlug=politics`. No code path change in the API — just front-end URL building. The IDs stay valid forever.
3. **2B is not an ID migration** — it's a migration of *URL building* from `/{lang}/section/{id}` to `/{lang}/section/{slug}`. The ID map can stay as a fallback resolver.

So your pick (2A now, 2B later) is correct. There is no breaking step in between.

---

## TL;DR for the FE PR

- One ID map shared across locales. AR ids ARE the canonical ids.
- `about=1, contact=2` everywhere. Page 2 needs editor translation.
- Keep UI strings (`newsTag`, `ad`, `noContent`, `programsLabel`) in the FE i18n bundle. Defaults are good.
- Build URLs with `slug`/`canonicalSlug` from the API response (already returned). When `fallbackUsed=true`, render the AR slug with `lang=en|fr` query — backend handles it.
- Honour the `ETag`: send back as `If-None-Match` to get free 304s on detail pages.
- `.ashx` URLs still work but carry `Deprecation: true` + `Sunset` headers — finish migrating to clean `/v1/...` paths.

---

## Backend follow-ups (for editor / data team)

These are not blocking the FE, but should be queued:

1. Backfill `TBS_Section_Translation` rows for locales `en` and `fr` for sections 29, 30, 33, 39, 45, 46, 56 (and any others used in nav).
2. Backfill `TBS_Pages_Translation` for `page_id = 2` (Contact) in `en` and `fr`.
3. Until then, `fallbackUsed: true` + AR text is the documented contract — front-end MUST render it without breaking layout.
