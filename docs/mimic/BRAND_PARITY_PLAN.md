# Brand Parity Execution Plan

Date: 2026-04-18
Goal: Align the new Next.js site with the legacy Akhbar Al Yawm branding while keeping the modern component-based Tailwind architecture.

---

## Current State Summary

The Next.js site is **structurally complete** (7 templates, sidebar, most-read widget, breaking ticker, i18n) but visually diverges from the legacy brand in these key areas:

| Area | Legacy | Current (Next.js) | Gap |
|------|--------|--------------------|-----|
| **Color palette** | Navy `#142963` + Green `#2FA14B` | Maroon `#a1202f` + warm beige `#f2efe8` | **Major** |
| **Logo** | `/assets/img/logo.png` (200px) in navbar | Text-only "Akhbar Al Youm" badge | **Critical** |
| **Header top bar** | Light gray `#F5F6FA`, green date badge | Dark `bg-zinc-900` band | **Major** |
| **Nav links** | Navy bold 17px, green hover | Dark ink, maroon underline hover | **Major** |
| **Social icons** | IcoFont icons (FB, X, IG, YT, Nabd, TikTok, Threads) | Plain text labels | **Major** |
| **Search** | Click-to-expand overlay with icofont icon | Always-visible rounded input + button | **Minor** (functional) |
| **Footer** | Navy `#142963` bg, 3-col: social icons / app badges image / WhatsApp QR | Navy-ish `var(--ink)`, 3-col: text links | **Major** |
| **Copyright bar** | Darker navy `#0B1D4E` | `bg-black/20` over ink | **Minor** |
| **Hero layout** | 3-col news card grid (thumbnails + headlines) | Large image overlay + timestamped list | **Intentional redesign** |
| **Section titles** | `border-right: 3px green` pipe + bold | Uppercase accent label + bold title | **Minor** |
| **Mobile nav** | meanmenu.js hamburger | Horizontal scroll nav | **Major** |
| **Breadcrumbs** | Present on Category/About/Contact | Missing | **Major** |
| **Social share (Article)** | ShareThis bar (FB, Twitter, WhatsApp) | Missing | **Critical** |
| **Related articles** | "قد يعجبك أيضاً" section below article | Missing | **Critical** |
| **Fonts** | Open Sans (body) + Noto Kufi Arabic | Noto Kufi Arabic + Geist Mono | **Minor** |
| **Sticky header** | White bg + shadow on scroll | Not implemented | **Minor** |

---

## Execution Slices

### Slice A — Color Palette & CSS Variables (LOW RISK)
**What:** Update `globals.css` `:root` variables to match legacy palette.
**Files:** `app/globals.css`

| Variable | Current | Target |
|----------|---------|--------|
| `--page-bg` | `#f2efe8` (warm beige) | `#F5F6FA` (cool light gray) |
| `--background` | `#fffdf9` | `#FFFFFF` |
| `--panel` | `#fbf5ea` | `#F5F5F5` |
| `--foreground` | `#132864` | `#142963` (legacy navy) |
| `--ink` | `#1a1a1a` | `#142963` (navy for headings) |
| `--accent` | `#a1202f` (maroon) | `#2FA14B` (legacy green) |
| `--accent-strong` | `#7b1823` | `#238a3a` (darker green) |
| `--border-soft` | `rgba(19,40,100,0.12)` | `#EEEEEE` |

Also update the body background gradient to use neutral gray instead of warm beige tones.

**Risk:** Low — purely CSS variable swap, all components use variables.
**Estimate:** 1 file change.

---

### Slice B — Logo Integration (LOW RISK)
**What:** Download the legacy logo PNG and replace the text-only brand in the header.
**Files:** `public/assets/img/logo.png`, `src/components/site-header.tsx`

Steps:
1. Download logo from `https://www.akhbaralyawm.com/assets/img/logo.png` or extract from MHTML
2. Place at `public/assets/img/logo.png`
3. Replace text badge in `SiteHeader` with `<Image src="/assets/img/logo.png" alt="Akhbar Al Yawm" width={200} height={50} />`
4. Keep the `dict.site.name` as fallback alt text

**Risk:** Low — single component edit.

---

### Slice C — Header Restyling (MEDIUM RISK)
**What:** Restyle the header layers to match legacy layout.
**Files:** `src/components/site-header.tsx`

Changes:
1. **Top bar:** Change from `bg-zinc-900 text-white` → `bg-[#F5F6FA] text-[#8A8A8A]` (legacy light gray utility bar)
2. **Date badge:** Add green `bg-[#2FA14B]` date badge on the right side
3. **Social icons:** Replace text labels with SVG icons for FB, X, IG, YT, Nabd (use lucide-react or inline SVGs)
4. **Logo bar:** Logo on the left, search on the right (keep current layout but use logo image)
5. **Nav bar:** Style links as `font-bold text-[17px] text-[#142963]` with green hover (`hover:text-[#2FA14B]`)
6. **Sticky behavior:** Add `is-sticky` style (white bg + shadow on scroll) — requires a small client component wrapper

**Risk:** Medium — visual rework of a server component; test across 3 locales.

---

### Slice D — Social Media Icons (LOW RISK)
**What:** Replace plain text social links with proper icons across header and footer.
**Files:** `src/components/site-header.tsx`, `src/components/site-footer.tsx`

Options (pick one):
- **Option 1:** Use `react-icons` package (has IcoFont equivalents via `react-icons/fa`, `react-icons/fi`)
- **Option 2:** Inline SVG icons for the 7 platforms (FB, X, IG, YT, Nabd, TikTok, Threads) — zero bundle impact
- **Option 3:** Download legacy icon PNGs (`/assets/icons/1-7.png`) and use `<Image>`

**Recommended:** Option 2 (inline SVGs) — lightweight, no extra dependency.

Add missing platforms: TikTok (`https://www.tiktok.com/@akhbaralyawm.com`) and Threads (`https://www.threads.net/@akhbaralyawmleb`).

**Risk:** Low.

---

### Slice E — Footer Brand Alignment (LOW RISK)
**What:** Restyle footer to match legacy layout.
**Files:** `src/components/site-footer.tsx`

Changes:
1. Background → `bg-[#142963]` (explicit navy instead of `var(--ink)`)
2. Column 1: Social media icon buttons (same SVGs from Slice D)
3. Column 2: App download badges — add Google Play + App Store badge images (`public/assets/img/google-play.png`, `public/assets/img/app-store.png`)
4. Column 3: WhatsApp QR code image + group link
5. Copyright bar: `bg-[#0B1D4E]`
6. Column titles: match legacy wording (تواصلوا معنا عبر / حمل تطبيقات الهاتف / انضم إلى مجموعة الواتساب)

**Risk:** Low — self-contained component.

---

### Slice F — Mobile Hamburger Navigation (MEDIUM RISK)
**What:** Add a responsive hamburger menu for mobile instead of horizontal scrolling nav.
**Files:** `src/components/site-header.tsx` (or extract `mobile-nav.tsx` client component)

Changes:
1. Hide horizontal `<nav>` on mobile (`hidden md:flex`)
2. Add hamburger icon button visible on mobile
3. Create slide-out or dropdown panel with nav items
4. Client component with `useState` for open/close

**Risk:** Medium — requires client component, test across viewports and RTL/LTR.

---

### Slice G — Breadcrumbs (LOW RISK)
**What:** Add breadcrumb component for Category, About, Contact, Article pages.
**Files:** New `src/components/breadcrumbs.tsx`, update page layouts

Steps:
1. Create a generic `<Breadcrumbs items={[{label, href}]} />` component
2. Style: `text-sm text-[#8A8A8A]` with `>` separator, last item active
3. Add to Category, About, Contact, and Article page templates

**Risk:** Low — additive, no existing code changed.

---

### Slice H — Article Social Sharing (LOW RISK)
**What:** Add social share buttons on Article pages.
**Files:** New `src/components/article/social-share.tsx`, update `app/[locale]/news/[slugId]/page.tsx`

Buttons: Facebook, X/Twitter, WhatsApp, Copy Link
Implementation: Client component using `navigator.share` + fallback share URLs.
Style: Row of icon buttons below article title or above body.

**Risk:** Low — additive.

---

### Slice I — Related Articles Section (LOW RISK)
**What:** Add "قد يعجبك أيضاً" (You May Also Like) section below article body.
**Files:** New `src/components/article/related-articles.tsx`, update article page

Steps:
1. Fetch related articles by same section/category from API
2. Display 3-4 cards in a grid below the article body
3. Reuse existing `StoryCard` component

**Risk:** Low — reuses existing components and API.

---

### Slice J — Section Title Styling (LOW RISK)
**What:** Match legacy section title pattern: green left/right border pipe + bold text.
**Files:** `src/components/home/home-section-block.tsx`

Change from uppercase accent label to:
```
border-r-[3px] border-[#2FA14B] pr-2.5 text-[25px] font-bold
```
(RTL: `border-r` maps to the start side)

**Risk:** Low.

---

## Execution Order (Recommended)

```
Phase 1 — Foundation (no structural changes)
  ├── Slice A: Color palette swap
  ├── Slice B: Logo integration
  └── Slice J: Section title styling

Phase 2 — Header & Footer (visual identity)
  ├── Slice C: Header restyling
  ├── Slice D: Social media icons
  └── Slice E: Footer alignment

Phase 3 — Navigation & Structure
  ├── Slice F: Mobile hamburger nav
  └── Slice G: Breadcrumbs

Phase 4 — Article Enhancements
  ├── Slice H: Social sharing
  └── Slice I: Related articles
```

**Phase 1** is zero-risk and immediately transforms the color identity.
**Phase 2** completes the brand header/footer.
**Phase 3–4** address structural gaps.

---

## Assets Needed

| Asset | Source | Destination |
|-------|--------|-------------|
| Logo PNG | Legacy site or MHTML extraction | `public/assets/img/logo.png` |
| Favicon | Legacy site | `public/favicon.ico` |
| Google Play badge | Standard asset | `public/assets/img/google-play.png` |
| App Store badge | Standard asset | `public/assets/img/app-store.png` |
| WhatsApp QR | Legacy site | `public/assets/img/whatsapp-qr.png` |
| Social icon SVGs | Create inline | Embedded in components |

---

## What We Keep (Modern Stack)

- ✅ Next.js App Router + Server Components
- ✅ Tailwind CSS utility classes
- ✅ Component-based architecture (`src/components/`)
- ✅ i18n with dictionary files (`ar.json`, `en.json`, `fr.json`)
- ✅ SEO: JSON-LD, canonical, sitemap, robots
- ✅ Image optimization via `next/image`
- ✅ CSS variables for theming
- ✅ TypeScript type safety
- ✅ Responsive grid layouts
- ✅ Breaking news ticker
- ✅ Most-read sidebar widget

---

## What Changes (Brand Alignment)

- 🔄 Color palette: maroon → green/navy
- 🔄 Logo: text → image
- 🔄 Header: dark → light top bar, add icons
- 🔄 Footer: text links → icon buttons + badge images
- 🔄 Nav: add hamburger for mobile
- ➕ Breadcrumbs
- ➕ Social share buttons
- ➕ Related articles
- 🔄 Section title styling

---

## Out of Scope (Intentional)

- ❌ Ad banner slots (deferred to ad-integration phase)
- ❌ Legacy hero 3-image grid (current hero is an intentional redesign improvement)
- ❌ meanmenu.js / Owl Carousel / Bootstrap (replaced by Tailwind + native solutions)
- ❌ Magnific Popup / Animate.css (not needed)
- ❌ Open Sans font (Noto Kufi Arabic covers both Arabic and Latin)
