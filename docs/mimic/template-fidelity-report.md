# Template Fidelity Report

Date: 2026-03-31
Status: overlay scored

## Legend
- **Critical**: structural layout mismatch — missing column, section, or widget entirely
- **Major**: visible block-level difference — color scheme, spacing, or density divergence
- **Minor**: micro-level difference — font size, padding, or decorative detail
- **Intentional**: deliberate redesign choice documented as acceptable divergence

## Templates
- Home
- Article
- Category
- Author
- Search
- About
- Contact

## Per-Template Assessment

### Home
- Status: overlay scored
- **Critical deltas:**
  1. Missing right sidebar entirely (legacy has ad banners + "الأكثر قراءة" most-read widget in a ~300px right column)
  2. Missing breaking-news ticker/carousel strip below the header
  3. Missing "الأكثر قراءة" (most-read) horizontal carousel just above the footer (legacy has dark-blue band with 3-card slider)
- **Major deltas:**
  1. Header color scheme: legacy uses dark blue (#1a2744) band; current uses maroon/red accent border
  2. Hero layout: legacy uses overlapping image-grid with large hero + 2 side thumbnails; current uses card-based section blocks
  3. Ad banners absent (Whish Money, GR Yaris) — intentional for this phase
  4. Footer: legacy has social icons (FB, X, IG, YouTube, TikTok, Threads), WhatsApp group link, Google Play/App Store badges; current has text-only structured links
  5. Legacy has breadcrumb trail below header; current omits breadcrumbs on home
- **Minor deltas:**
  1. Nav font weight and letter-spacing differ slightly
  2. Section label styling (legacy uses pipe + bold; current uses uppercase + accent color)
  3. Legacy date stamp uses Gregorian format in header bar; current matches
- Evidence: legacy docs/visual-baseline/2026-03-31-002552/home-desktop.png; current docs/visual-baseline/2026-03-31-000049/home-desktop.png

### Article
- Status: overlay scored
- **Critical deltas:**
  1. Missing right sidebar entirely (legacy has ~300px sidebar with ad banners, "الأكثر قراءة" widget, and related articles)
  2. Missing social sharing buttons row (legacy has ShareThis bar with FB, Twitter, WhatsApp, etc.)
  3. Missing "قد يعجبك أيضاً" (you may also like) related-articles section below article body
- **Major deltas:**
  1. Header differences same as Home (blue → red)
  2. Article body is full-width single-column vs legacy 2-column layout
  3. Footer differences same as Home (missing app badges, social icons)
  4. Legacy shows author byline + date in a different position relative to image
- **Minor deltas:**
  1. Image corner radius differs (current has rounded-sm; legacy sharp)
  2. Body text leading/font-size close but not identical
  3. Metadata stripe placement (section badge position)
- Evidence: legacy docs/visual-baseline/2026-03-31-002552/article-desktop.png; current docs/visual-baseline/2026-03-31-000629/article-desktop.png

### Category
- Status: overlay scored
- **Critical deltas:**
  1. Missing right sidebar (legacy has ad banners + most-read widget)
  2. Missing "الأكثر قراءة" horizontal carousel above footer
- **Major deltas:**
  1. Header/footer differences same as Home
  2. Legacy card layout: 3-column image grid for top articles → 2-column image+text rows below; current shows empty state ("لا توجد مواد") due to category 36 having 0 articles in CMS at capture time
  3. Ad banners absent (intentional)
  4. Legacy has breadcrumb trail (الرئيسية > سياسة); current omits breadcrumbs
- **Minor deltas:**
  1. Section label pipe+bold vs uppercase+accent style
  2. Load More button styling difference
- Evidence: legacy docs/visual-baseline/2026-03-31-002552/category-desktop.png; current docs/visual-baseline/2026-03-31-001816/category-desktop.png
- Note: current screenshot shows empty category — re-capture with a populated section recommended for true layout scoring

### Author
- Status: overlay scored
- **Critical deltas:**
  1. Legacy author page not captured (legacy site returned error or different layout for /author/11); comparison based on current Next.js only
- **Major deltas:**
  1. Current author page shows clean card layout: profile image + name + role, then archive list of articles — structurally reasonable
  2. Header/footer match site-wide pattern (maroon accent header, structured text footer)
- **Minor deltas:**
  1. Author image shows alt text fallback (image URL may be broken in CMS)
  2. Archive article cards are text-only rows without thumbnails
- Evidence: current docs/visual-baseline/2026-03-31-001816/author-desktop.png
- Note: legacy author page was not available for comparison — treat as new design

### Search
- Status: overlay scored
- **Critical deltas:**
  1. Legacy search page returns ASP.NET server error (ArgumentNullException) — not a valid comparison target
- **Major deltas:**
  1. Current search page is fully functional: header card, paginated results list, load-more, crawlable pagination links
  2. Legacy search is broken in production — current implementation is a strict improvement
- **Minor deltas:** n/a (no valid legacy baseline)
- Evidence: legacy docs/visual-baseline/2026-03-31-002552/search-desktop.png (server error); current docs/visual-baseline/2026-03-31-001816/search-desktop.png
- Note: legacy search is non-functional; current is the new baseline

### About
- Status: overlay scored
- **Critical deltas:** none — both pages are single-column text content
- **Major deltas:**
  1. Legacy has right sidebar with ad banners + most-read widget; current is full-width
  2. Legacy shows breadcrumb (الرئيسية > من نحن); current omits breadcrumbs
  3. Footer differences match site-wide pattern noted in Home
  4. Legacy body text is plain paragraph with floating ad; current has structured "Mission" sub-section card
- **Minor deltas:**
  1. Content differs (legacy has founding history text; current has editorial mission statement)
  2. Section label pipe+bold vs uppercase+accent
  3. Body text size/leading minor variation
- Evidence: legacy docs/visual-baseline/2026-03-31-002552/about-desktop.png; current docs/visual-baseline/2026-03-31-001816/about-desktop.png
- Note: content divergence is expected during migration; structural layout is acceptable

### Contact
- Status: overlay scored
- **Critical deltas:** none — both pages are single-column info content
- **Major deltas:**
  1. Legacy has right sidebar with ad banners + most-read widget; current is full-width
  2. Legacy shows specific contact details (phone: 961-1-494280, fax: 961-1-480620, email: news@akhbaralyawm.com, physical address in Dekwaneh); current shows generic email addresses (tech@, editorial@) and social platform names
  3. Legacy has breadcrumb; current omits
  4. Footer differences match site-wide pattern
- **Minor deltas:**
  1. Current uses card-grid layout for contact channels; legacy uses simple text list
  2. Section label styling difference
- Evidence: legacy docs/visual-baseline/2026-03-31-002552/contact-desktop.png; current docs/visual-baseline/2026-03-31-001816/contact-desktop.png
- Note: contact details should be updated to match real legacy data (phone, fax, address)

## Cross-Template Structural Delta Summary

| Delta | Scope | Severity | Action |
|-------|-------|----------|--------|
| Missing right sidebar | Home, Article, Category, About, Contact | ~~Critical~~ **Resolved (Slice 06)** | ✅ Added sidebar component with most-read widget |
| Missing ad banner slots | All pages | Intentional | Deferred to ad-integration phase |
| Header color (blue→red) | All pages | Major | Align header brand colors to legacy palette |
| Missing breaking-news ticker | Home | Critical | Implement ticker component |
| Missing most-read carousel | Home, Category, About, Contact | Critical | Implement carousel component |
| Missing social sharing buttons | Article | Critical | Add share bar component |
| Missing related articles | Article | Critical | Add "you may also like" section |
| Missing breadcrumbs | Category, About, Contact | Major | Add breadcrumb component |
| Footer: missing app badges + social icons | All pages | Major | Update footer with real social/app links |
| Legacy search broken | Search | n/a | Current is improvement; no action |
| Legacy author unavailable | Author | n/a | Current design is new baseline |
| Contact details incomplete | Contact | Major | Port real phone/fax/address from legacy |
