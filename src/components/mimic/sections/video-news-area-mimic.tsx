// Iteration 16: real Embla-powered carousel (was a frozen owl snapshot).

import type { Locale } from "@/src/lib/i18n";
import { OwlEmblaCarousel } from "../owl-embla-carousel";

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

export function VideoNewsArea({ locale, sectionTitle, sectionHref, items }: Props) {
  if (items.length === 0) return null;

  return (
    <section className="video-news-area ptb-40">
      <div className="container">
        <div className="section-title">
          <a href={sectionHref}>
            <h2>{sectionTitle}</h2>
          </a>
        </div>
        <div className="row">
          <OwlEmblaCarousel carouselClassName="video-news-slides">
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
          </OwlEmblaCarousel>
        </div>
      </div>
    </section>
  );
}
