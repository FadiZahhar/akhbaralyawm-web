// Iteration 5: verbatim port of the legacy 3-column section grids used for
// non-carousel sections (أخبار محلية / العرب والعالم / متفرقات).
//
// Two layout variants from the legacy markup:
//   - "default"  → `<section class="popular-news-area ptb-40 default-news-area">`
//                  with section-title at the top of a single col-lg-12 column
//                  (used by أخبار محلية).
//   - "hot"      → `<section class="hot-news-area ptb-40">` with an extra
//                  `around-the-world-news pt-40` wrapper (used by العرب والعالم
//                  and متفرقات).
//
// Both render the same `col-lg-4 col-md-6 single-around-the-world-news` card.

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
  variant: "default" | "hot";
  /** Allow `pb-40` instead of `ptb-40` for the second hot-news section. */
  sectionClassName?: string;
};

function Cards({ locale, items }: { locale: Locale; items: Item[] }) {
  return (
    <>
      {items.map((item) => (
        <div key={item.id} className="col-lg-4 col-md-6">
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
      ))}
    </>
  );
}

function ViewMore({ href }: { href: string }) {
  return (
    <a href={href} className="view-more">
      عرض المزيد <i className="icofont-rounded-double-left" />
    </a>
  );
}

export function SectionGrid({
  locale,
  sectionTitle,
  sectionHref,
  items,
  variant,
  sectionClassName,
}: Props) {
  if (items.length === 0) return null;

  if (variant === "default") {
    return (
      <section
        className={
          `popular-news-area ${sectionClassName ?? "ptb-40"} default-news-area`.trim()
        }
      >
        <div className="container">
          <div className="row">
            <div className="col-lg-12 col-md-12">
              <div className="section-title">
                <h2>{sectionTitle}</h2>
                <ViewMore href={sectionHref} />
              </div>
              <div className="row">
                <Cards locale={locale} items={items} />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // variant === "hot"
  return (
    <section className={`hot-news-area ${sectionClassName ?? "ptb-40"}`.trim()}>
      <div className="container">
        <div className="row">
          <div className="col-lg-12 col-md-12">
            <div className="row">
              <div className="col-lg-12 col-md-12">
                <div className="around-the-world-news pt-40">
                  <div className="section-title">
                    <h2>{sectionTitle}</h2>
                    <ViewMore href={sectionHref} />
                  </div>
                  <div className="row">
                    <Cards locale={locale} items={items} />
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
