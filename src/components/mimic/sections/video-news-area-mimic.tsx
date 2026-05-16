// Iteration 6: verbatim port of legacy `<section class="video-news-area ptb-40">`.
// Same frozen owl-stage pattern as `most-read-strip.tsx` and
// `popular-news-carousel.tsx`. 3 visible cards at 633 px wide + 30 px gutter.

import type { Locale } from "@/src/lib/i18n";

type Item = {
  id: number;
  slugId: string;
  title: string;
  imageUrl: string | null;
  sectionTitle?: string;
  youtubeUrl?: string | null;
};

type Props = {
  locale: Locale;
  sectionTitle: string;
  sectionHref: string;
  items: Item[];
};

const CARD_WIDTH_PX = 633;
const CARD_GUTTER_PX = 30;
const VISIBLE_CARDS = 3;

export function VideoNewsArea({ locale, sectionTitle, sectionHref, items }: Props) {
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
    <section className="video-news-area ptb-40">
      <div className="container">
        <div className="section-title">
          <a href={sectionHref}>
            <h2>{sectionTitle}</h2>
          </a>
        </div>
        <div className="row">
          <div className="video-news-slides owl-carousel owl-theme owl-rtl owl-loaded owl-drag">
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
                      <div className="single-default-news">
                        {item.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.imageUrl} alt="" />
                        ) : null}
                        <div className="news-content">
                          <h3>
                            <a href={`/${locale}/news/${item.slugId}`}>{item.title}</a>
                          </h3>
                        </div>
                        {item.sectionTitle ? (
                          <div className="tags">
                            <a href={sectionHref}>{item.sectionTitle}</a>
                          </div>
                        ) : null}
                        <div className="video-btn">
                          <a
                            href={item.youtubeUrl || `/${locale}/news/${item.slugId}`}
                            className={item.youtubeUrl ? "popup-youtube" : undefined}
                            target={item.youtubeUrl ? "_blank" : undefined}
                            rel={item.youtubeUrl ? "noopener noreferrer" : undefined}
                          >
                            <i className="icofont-play-alt-3" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="owl-nav">
              <button type="button" role="presentation" className="owl-prev">
                <i className="icofont-rounded-right" />
              </button>
              <button type="button" role="presentation" className="owl-next">
                <i className="icofont-rounded-left" />
              </button>
            </div>
            <div className="owl-dots disabled" />
          </div>
        </div>
      </div>
    </section>
  );
}
