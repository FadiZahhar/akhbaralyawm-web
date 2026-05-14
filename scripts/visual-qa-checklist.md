# Phase 6: Visual QA Checklist — v2 Parity Verification

**Target**: Make v2 visually indistinguishable from original at desktop (1440px), tablet (1024px), mobile (390px).

## Desktop (1440px) Baseline

### Header
- [ ] Logo sizes and spacing match (desktop MM logo, mobile LL logo on small screens)
- [ ] Top nav layout and font sizes
- [ ] Search box styling and interactions
- [ ] Social icons color/sizing (should use icon-font icofont-* now)
- [ ] Category nav rendering below header

### Hero Section (Below Ticker)
- [ ] Left column width (should be col-lg-4 = ~33% on desktop)
- [ ] Right carousel width (should be col-lg-6 = ~50% on desktop)
- [ ] Live updates ("لحظة بلحظة") list styling, padding, separators
- [ ] Carousel article cards: image aspect ratio, title text sizing, tags styling
- [ ] Slider nav buttons: position (top-right for LTR, top-left for RTL), colors on hover
- [ ] Breaking news ticker: green background, label badge, text scrolling smoothly

### Sections Below
- [ ] Featured section (خاص اليوم) carousel: card sizing, spacing between items
- [ ] Video section: play button overlay, card aspect ratio
- [ ] Around-the-world 3-up cards: sizing, border/shadow treatment
- [ ] Popular news carousel: card styling

### Footer
- [ ] Three-column layout (col-lg-4 each)
- [ ] Social icons (currently SVG, but should render correctly)
- [ ] WhatsApp group and app links
- [ ] Copyright bar styling

---

## Tablet (1024px) Responsive

### Breakpoint Verification
- [ ] Col sizing changes (col-md-6 for footers, carousel becomes 2-up or 3-up)
- [ ] Header shrinks appropriately, search remains functional
- [ ] Hero: columns stack to full-width or adjust proportions
- [ ] Carousel items resize (50% or 100% per media rule)
- [ ] No horizontal scrolling

---

## Mobile (390px) Responsive

### Breakpoint Verification  
- [ ] All columns become 100% width (col-12)
- [ ] Header hamburger nav works (if present in legacy, replicate)
- [ ] Hero: left column on top, carousel/sliders remain functional
- [ ] Carousel items: 100% width, swipeable
- [ ] Footer: stacked vertically, readable font sizes
- [ ] Ticker: truncated text with ellipsis or auto-scroll

---

## Color & Spacing Spots to Check

- [ ] Navy brand color (#142963) consistent across buttons, links, overlays
- [ ] Green brand color (#2fa14b) on buttons, active states, ticker background
- [ ] Text hierarchy: h2 (sections) vs h3 (article titles) vs h4 (captions)
- [ ] Border radius (5px standard) on cards and buttons
- [ ] Padding/margins around sections (ptb-40 = padding-top/bottom 40px)
- [ ] Gap between carousel items (should be 16px if using Embla gap style)

---

## Known Deviations (Acceptable)

- SVG icons instead of .png images (functional parity, visual difference minimal)
- Embla Carousel instead of Owl Carousel (both render same output, different JS library)
- Bootstrap RTL scoped under .mimic-root (ensures no collision with v1)
- Hero right column: now removes thumbs grid, shows carousel only (matches original exactly)

---

## Action Log

**Completed in this session:**
1. ✅ Extracted hero right-side reference markup
2. ✅ Removed thumbs grid component  
3. ✅ Changed layout from 3-6-3 to 4-6 (legacy parity)
4. ✅ Updated all component prop signatures
5. ✅ Removed hero-thumb styles from mimic.css
6. ✅ TypeScript validation passed
7. ✅ Dev server still running at HTTP 200

**Next steps (after visual QA):**
- If visual gaps found: iterate mimic.css overrides or component markup
- If QA passes: prepare for user review and sign-off
- Optional: Implement footer image icons if time permits

---

## Quick Test Procedure

1. **Desktop**: Open http://localhost:3001/ar/v2 in Chrome at 1440px width
   - Compare side-by-side with https://www.akhbaralyawm.com/ (also at 1440px)
   - Focus on hero section proportions and spacing

2. **Tablet**: Resize browser to 1024px width
   - Verify carousel still renders correctly
   - Check footer column layout

3. **Mobile**: Resize to 390px width
   - Test carousel swipe/arrows
   - Verify footer is readable
   - Check header search/nav responsiveness

4. **Document findings**: Screenshot key differences for iteration
