// Iteration 5: verbatim port of the legacy "خاص اليوم" popular-news carousel.
// Same pattern as `most-read-strip.tsx`: frozen owl-stage at scroll position 0
// with card widths/gutters taken from the MHTML inline styles.

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
  sectionHref: string;
  items: Item[];
};

// From the MHTML inline styles on `.popular-news-slides .owl-item`.
const CARD_WIDTH_PX = 301.5;
const CARD_GUTTER_PX = 30;
const VISIBLE_CARDS = 4;

export function PopularNewsCarousel({ locale, sectionTitle, sectionHref, items }: Props) {
  if (items.length === 0) return null;

  const lead = items.slice(-VISIBLE_CARDS);
  const trail = items.slice(0, VISIBLE_CARDS);
  const stage = [
    ...lead.map((item) => ({ item, kind: "cloned" as const })),
    ...items.slice(0, VISIBLE_CARDS).map((item) => ({ item, kind: "active" as const })),
    ...items.slice(VISIBLE_CARDS).map((item) => ({ item, kind: "" as const })),
    ...trail.map((item) => ({ item, kind: "cloned" as const })),
  ];
  const stageWidth = stage.length * (CARD_WIDTH_PX + CARD_GUTTER_PX);

  return (
    <section className="popular-news-area ptb-40">
      <div className="container">
        <div className="row">
          <div className="col-lg-12 col-md-12">
            <div className="section-title">
              <a style={{ color: "#142963" }} href={sectionHref}>
                <h2>{sectionTitle}</h2>
              </a>
            </div>

            <div className="row">
              <div className="popular-news-slides owl-carousel owl-theme owl-rtl owl-loaded owl-drag">
                <div className="owl-stage-outer" style={{ overflow: "hidden" }}>
                  <div
                    className="owl-stage"
                    style={{
                      display: "flex",
                      flexWrap: "nowrap",
                      transform: "translate3d(0px, 0px, 0px)",
                      transition: "0.25s",
                      width: `${stageWidth}px`,
                    }}
                  >
                    {stage.map(({ item, kind }, idx) => (
                      <div
                        key={`${item.id}-${idx}`}
                        className={`owl-item${kind ? ` ${kind}` : ""}`}
                        style={{
                          flex: "0 0 auto",
                          width: `${CARD_WIDTH_PX}px`,
                          marginLeft: `${CARD_GUTTER_PX}px`,
                        }}
                      >
                        <div className="col-lg-12 col-md-12">
                          <div className="single-around-the-world-news">
                            <div className="news-image">
                              <a href={`/${locale}/news/${item.slugId}`}>
                                {item.imageUrl ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={item.imageUrl} alt="" />
                                ) : null}
                              </a>
                            </div>
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
      </div>
    </section>
  );
}
