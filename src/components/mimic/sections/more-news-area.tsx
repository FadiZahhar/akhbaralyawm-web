import Link from "next/link";
import Image from "next/image";

import { getAssetUrl, type FeedItemDto } from "@/src/lib/api";
import type { Locale } from "@/src/lib/i18n";

type Props = {
  locale: Locale;
  items: FeedItemDto[];
};

/**
 * Three-up "around the world" / latest cards (image left, title right).
 * Mirrors the `.more-news-area` block from the legacy theme.
 */
export function MoreNewsArea({ locale, items }: Props) {
  const cards = items.slice(0, 3);
  if (cards.length === 0) return null;

  return (
    <section className="more-news-area mt-5 tb">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-12 col-md-12">
            <div className="row">
              {cards.map((item) => {
                const src = getAssetUrl(item.photoPath, locale);
                const href = `/${locale}/news/${item.slugId}`;

                return (
                  <div key={item.id} className="col-12 col-md-4">
                    <div className="single-around-the-world-news mb-3">
                      <div className="row">
                        <div className="col-5">
                          <div className="news-image">
                            <Link href={href} aria-label={item.title}>
                              {src ? (
                                <Image src={src} alt="" width={220} height={183} unoptimized />
                              ) : (
                                <div style={{ width: "100%", height: "100%", background: "var(--mm-panel)", aspectRatio: "220 / 183" }} />
                              )}
                            </Link>
                          </div>
                        </div>
                        <div className="col-7 row align-items-center">
                          <div className="news-content here p-0">
                            <h3 className="txt">
                              <Link href={href}>{item.title}</Link>
                            </h3>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
