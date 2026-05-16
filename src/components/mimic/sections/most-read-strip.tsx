// Iteration 2: verbatim port of the legacy "الأكثر قراءةً" most-read strip.
// Renders the exact `<section class="more-news-area">` markup from
// public/legacy-snapshot/home-ar/index.html so the scoped owl-carousel CSS
// styles it identically — without loading the owl-carousel JS (we render a
// frozen "scroll position 0" view instead).
//
// The legacy snapshot froze the carousel mid-scroll showing 4 cards at
// 398.667px each with 30px gutters. We render the same 4 visible slots as
// `owl-item active` so the CSS picks up the right rules. JS is not required
// because /v2 is read-only parity work; clicking through still navigates.

import type { Locale } from "@/src/lib/i18n";

type Item = {
  id: number;
  slugId: string;
  title: string;
  imageUrl: string | null;
};

type Props = {
  locale: Locale;
  sectionTitle: string;
  items: Item[];
};

// Match the legacy snapshot's frozen per-card width and gutter exactly. These
// values are taken from the inline `style` attributes on `.owl-item` in the
// MHTML capture so the visible card geometry is byte-equal.
const CARD_WIDTH_PX = 398.667;
const CARD_GUTTER_PX = 30;
const VISIBLE_CARDS = 4;

export function MostReadStrip({ locale, sectionTitle, items }: Props) {
  if (items.length === 0) return null;

  // Build a single contiguous track: clones on both ends mirror what owl
  // produces, so the scoped CSS sizing math (which sums all stage children)
  // resolves to the same total width as the legacy snapshot.
  const lead = items.slice(-VISIBLE_CARDS);
  const trail = items.slice(0, VISIBLE_CARDS);
  const stage = [
    ...lead.map((item) => ({ item, kind: "cloned" as const })),
    ...items.slice(0, VISIBLE_CARDS).map((item) => ({ item, kind: "active" as const })),
    ...items.slice(VISIBLE_CARDS).map((item) => ({ item, kind: "" as const })),
    ...trail.map((item) => ({ item, kind: "cloned" as const })),
  ];

  const totalSlots = stage.length;
  const stageWidth = totalSlots * (CARD_WIDTH_PX + CARD_GUTTER_PX);

  return (
    <section className="more-news-area">
      <div className="container">
        <div className="more-news-inner">
          <div className="section-title">
            <h2>{sectionTitle}</h2>
          </div>
          <div className="row">
            <div className="more-news-slides owl-carousel owl-theme owl-rtl owl-loaded owl-drag">
              <div className="owl-stage-outer">
                <div
                  className="owl-stage"
                  style={{
                    transform: "translate3d(0px, 0px, 0px)",
                    transition: "0.25s",
                    width: `${stageWidth}px`,
                  }}
                >
                  {stage.map(({ item, kind }, idx) => (
                    <div
                      key={`${item.id}-${idx}`}
                      className={`owl-item${kind ? ` ${kind}` : ""}`}
                      style={{ width: `${CARD_WIDTH_PX}px`, marginLeft: `${CARD_GUTTER_PX}px` }}
                    >
                      <div className="col-lg-12 col-md-12">
                        <div className="single-more-news">
                          {item.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.imageUrl} alt="" />
                          ) : null}
                          <div className="news-content">
                            <h3>
                              <a href={`/${locale}/news/${item.slugId}`}>{item.title}</a>
                            </h3>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
