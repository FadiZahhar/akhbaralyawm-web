// Iteration 16: real Embla-powered carousel (was a frozen owl snapshot).
// Legacy CSS classes preserved so the section paints identically.

import type { Locale } from "@/src/lib/i18n";
import { OwlEmblaCarousel } from "../owl-embla-carousel";

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

const CARD_WIDTH_PX = 301.5;
const CARD_GUTTER_PX = 30;

export function PopularNewsCarousel({ locale, sectionTitle, sectionHref, items }: Props) {
  if (items.length === 0) return null;

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
              <OwlEmblaCarousel carouselClassName="popular-news-slides">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="owl-item active"
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
              </OwlEmblaCarousel>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
