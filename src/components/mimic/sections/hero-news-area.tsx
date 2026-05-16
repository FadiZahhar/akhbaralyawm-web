import Link from "next/link";

import type { Locale } from "@/src/lib/i18n";

type SlideItem = {
  id: number;
  slugId: string;
  title: string;
  sectionTitle: string;
  imageUrl: string | null;
};

type UpdateItem = {
  id: number;
  slugId: string;
  title: string;
  time: string;
};

type SideCardItem = {
  id: number;
  slugId: string;
  title: string;
  sectionTitle: string;
  imageUrl: string | null;
};

type Props = {
  locale: Locale;
  liveLabel: string;
  slides: SlideItem[];
  updates: UpdateItem[];
  sideCards: SideCardItem[];
};

/**
 * Verbatim port of the legacy `<section class="new-news-area ptb-40">` hero
 * block. Three columns: col-lg-4 (لحظة بلحظة feed), col-lg-6 (owl-carousel
 * hero), col-lg-2 (3 small side cards).
 *
 * The owl-carousel is rendered server-side as a static "frozen" skeleton —
 * one visible card inside owl-stage-outer/owl-stage/owl-item.active — the
 * same pattern used by `most-read-strip.tsx`. Owl-nav buttons render as
 * non-interactive markup so the chrome (chevrons over the carousel corner)
 * matches the legacy pixel layout. The carousel does not auto-advance; that
 * tradeoff is intentional during the parity loop and will be revisited once
 * structural % converges.
 */
export function HeroNewsArea({ locale, liveLabel, slides, updates, sideCards }: Props) {
  return (
    <section className="new-news-area ptb-40">
      <div className="container">
        <div className="row">
          {/* Column 1 — live updates (col-lg-4) */}
          <div className="col-lg-4 col-md-12">
            <div className="new-news-list">
              <div className="newsUpdates">
                <a href={`/${locale}/category/26`}>
                  <h2>
                    <i className="far fa-clock" />
                    {liveLabel}
                  </h2>
                </a>
                <div className="container">
                  {updates.map((u) => (
                    <Link key={u.id} href={`/${locale}/news/${u.slugId}`}>
                      <div className="row newsUpdate-item">
                        <div className="col-2 col-sm-3 col-lg-2">{u.time}</div>
                        <div className="col-10 col-sm-9 col-lg-10">{u.title}</div>
                      </div>
                      <hr style={{ margin: "5px 0" }} />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Column 2 — main owl-carousel hero (col-lg-6) */}
          <div className="col-lg-6 col-md-12">
            <div className="new-news-slides owl-carousel owl-theme owl-rtl owl-loaded owl-drag">
              <div className="owl-stage-outer">
                <div className="owl-stage" style={{ width: "636px" }}>
                  {slides.slice(0, 1).map((s) => (
                    <div key={s.id} className="owl-item active" style={{ width: "636px" }}>
                      <div className="single-default-news">
                        {s.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={s.imageUrl} alt="" />
                        ) : (
                          <div style={{ aspectRatio: "636 / 397", background: "var(--mm-navy)" }} />
                        )}
                        <div className="news-content">
                          <h3>
                            <Link href={`/${locale}/news/${s.slugId}`}>{s.title}</Link>
                          </h3>
                        </div>
                        {s.sectionTitle && (
                          <div className="tags">
                            <Link href={`/${locale}/news/${s.slugId}`}>{s.sectionTitle}</Link>
                          </div>
                        )}
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

          {/* Column 3 — 3 small side cards (col-lg-2) */}
          <div className="col-lg-2 col-md-12">
            <div className="new-news-list">
              {sideCards.slice(0, 3).map((card) => (
                <div key={card.id} className="single-new-news">
                  {card.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={card.imageUrl} alt="" />
                  )}
                  <div className="news-content">
                    <h3>
                      <Link href={`/${locale}/news/${card.slugId}`}>{card.title}</Link>
                    </h3>
                  </div>
                  {card.sectionTitle && (
                    <div className="tags bg-3">
                      <Link href={`/${locale}/news/${card.slugId}`}>{card.sectionTitle}</Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
