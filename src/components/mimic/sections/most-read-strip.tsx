// Iteration 16: real Embla-powered carousel (was a frozen owl snapshot).
// Markup keeps every legacy owl-carousel class so the scoped CSS still styles
// it identically; behaviour now: real drag/swipe, RTL loop, autoplay, working
// .owl-prev / .owl-next buttons.

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
  items: Item[];
};

const CARD_GUTTER_PX = 20;

export function MostReadStrip({ locale, sectionTitle, items }: Props) {
  if (items.length === 0) return null;

  return (
    <section className="more-news-area">
      <div className="container">
        <div className="more-news-inner">
          <div className="section-title">
            <h2>{sectionTitle}</h2>
          </div>
          <div className="row">
            <OwlEmblaCarousel carouselClassName="more-news-slides">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="owl-item active"
                  style={{
                    flex: `0 0 calc((100% - ${CARD_GUTTER_PX * 3}px) / 3)`,
                    width: `calc((100% - ${CARD_GUTTER_PX * 3}px) / 3)`,
                    marginInline: `${CARD_GUTTER_PX / 2}px`,
                  }}
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
            </OwlEmblaCarousel>
          </div>
        </div>
      </div>
    </section>
  );
}
