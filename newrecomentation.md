# Why home works but other pages 404 on EN/FR

There are two completely different rendering patterns across the site:

## 1. Home page → "graceful empty" pattern

`app/[locale]/page.tsx` calls list endpoints (`getHomeFeed`, `getSections`, etc.). Each one runs through the strict-isolation gate in `src/lib/api.ts`:

```ts
isPureLocale(langMeta, locale)  // false when fallbackUsed === true
```

When the backend serves an AR fallback for `?lang=en`, the gate **drops the items** and returns an empty array. The home page just renders fewer cards / hides whole sliders → the page still loads. That's why it "works."

## 2. Every other page → "hard 404" pattern

- **Category** (`app/[locale]/category/[slug]/page.tsx`): `getSectionBySlugOrId(slug, locale)` returns `null` if the section was an AR fallback → `notFound()`.
- **Article** (`app/[locale]/news/[slugId]/page.tsx`): `getArticleById(id, locale)` returns `null` → `notFound()`.
- **Author**, **Mix**, **Search** detail pages: same pattern.

So when you land on `/en/category/<arabic-slug>` or `/en/news/<arabic-slug>-12345`:

1. The slug in the URL is still Arabic (a separate problem — see `backendfix.md` §7).
2. Backend has no EN row → returns AR with `fallbackUsed=true`.
3. FE's strict-isolation gate rejects it → `notFound()`.

The home page is the **only** page in the app that tolerates missing translations, because lists can be empty but a detail page cannot exist without its main entity.

---

# What needs to change

This is **99% a backend content problem**, not a code bug.

## Backend (the real fix — already specified in backendfix.md)

The backend needs **per-locale translation rows** for:

| Table | What's missing |
|---|---|
| `TBS_News_Translation` | EN/FR title, body, slug for each article |
| `TBS_Section_Translation` | EN/FR title, slug for each section |
| `TBS_Authors_Translation` | EN/FR name, bio, slug for each author |
| `TBS_Pages_Translation` | EN/FR title, body for static pages |

Until those rows exist, the backend will keep responding with `fallbackUsed: true` + Arabic content for `?lang=en|fr`, and the FE will keep refusing to render it (per your "no Arabic fallback, ever" rule).

This is exactly what `backendfix.md` §1, §2.2, and §7 ask the backend team to do. Once they backfill EN/FR translations, every page starts working in every language. **No frontend change is required for the page templates themselves** — they're already locale-aware.

## Frontend options (only if you can't wait for backend)

You have three trade-offs to choose from. **Pick one:**

| Option | Behavior on EN/FR when backend lacks translation | Reverses your policy? |
|---|---|---|
| **A. Status quo (current)** | 404 on every detail/category page | No — strictly enforces "no AR fallback" |
| **B. Soft fallback with banner** | Render the AR content with a visible "Not yet available in this language" notice (already partially in place via `FallbackNotice` component) | **Yes** — this is what you originally said you didn't want |
| **C. Redirect to AR equivalent** | `/en/news/<slug>` → 302 → `/ar/news/<slug>` | Partial — the user lands on AR for that one item |

Right now you're on Option **A**. The home page only "works" because empty lists are valid; detail/category pages can't exist empty.

---

# Recommendation

1. **Send `backendfix.md` to the backend team and prioritize §1 (per-locale slugs) + §2.2 (per-locale section/author translations) + §7 (slug schema).** Until those land, EN/FR will only meaningfully cover items that have been translated.
2. **Decide on a stopgap UX.** If the current 404 experience is too harsh during the translation backfill, implement **Option C** (redirect missing-translation detail pages to the AR equivalent so the user at least sees content).
