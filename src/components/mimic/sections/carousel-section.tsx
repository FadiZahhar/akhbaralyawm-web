"use client";

import Image from "next/image";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useState } from "react";

import { ChevronLeftIcon, ChevronRightIcon, IcoFontIcon } from "../icons";

type Item = {
  id: number;
  slugId: string;
  title: string;
  imageUrl: string | null;
};

type Props = {
  locale: string;
  sectionTitle: string;
  sectionHref: string;
  items: Item[];
  /** Visual variant. `popular` = grey panel, `default` = white, `hot` = green strip card. */
  variant?: "popular" | "default" | "hot";
};

export function CarouselSection({ locale, sectionTitle, sectionHref, items, variant = "popular" }: Props) {
  const isRtl = locale === "ar";
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: items.length > 4,
    direction: isRtl ? "rtl" : "ltr",
    align: "start",
    slidesToScroll: 1,
  });
  const [activeBtn, setActiveBtn] = useState<"prev" | "next">("next");

  const scrollPrev = useCallback(() => { emblaApi?.scrollPrev(); setActiveBtn("prev"); }, [emblaApi]);
  const scrollNext = useCallback(() => { emblaApi?.scrollNext(); setActiveBtn("next"); }, [emblaApi]);

  if (items.length === 0) return null;

  if (variant === "default") {
    return (
      <section className="popular-news-area ptb-40 default-news-area">
        <div className="container">
          <div className="row">
            <div className="col-lg-12 col-md-12">
              <div className="section-title">
                <Link href={sectionHref} style={{ color: "#142963" }}>
                  <h2>{sectionTitle}</h2>
                </Link>
                <Link href={sectionHref} className="view-more">
                  عرض المزيد <IcoFontIcon name="rounded-double-left" />
                </Link>
              </div>

              <div className="row">
                {items.slice(0, 3).map((it) => (
                  <div key={it.id} className="col-lg-4 col-md-6">
                    <div className="single-around-the-world-news">
                      <div className="news-image">
                        <Link href={`/${locale}/news/${it.slugId}`}>
                          {it.imageUrl ? (
                            <Image src={it.imageUrl} alt="" width={400} height={300} unoptimized />
                          ) : (
                            <div style={{ width: "100%", aspectRatio: "4 / 3", background: "var(--mm-panel)" }} />
                          )}
                        </Link>
                      </div>
                      <div className="news-content">
                        <h3>
                          <Link href={`/${locale}/news/${it.slugId}`}>{it.title}</Link>
                        </h3>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const sectionClass =
    variant === "popular"
      ? "popular-news-area ptb-40"
      : variant === "hot"
        ? "hot-news-area"
        : "default-news-area ptb-40";
  const useAroundWorldCard = variant === "popular";
  const cardClass = variant === "hot" ? "hot-news-card" : "popular-card";

  return (
    <section className={sectionClass}>
      <div className="container">
        <div className="section-title">
          <Link href={sectionHref} style={variant === "popular" ? { color: "#142963" } : undefined}>
            <h2>{sectionTitle}</h2>
          </Link>
          <div className="slider-nav is-static" style={{ position: "static", display: "inline-flex", gap: 6 }}>
            <button
              type="button"
              onClick={scrollPrev}
              aria-label="Previous"
              className={activeBtn === "prev" ? "active" : ""}
            >
              {isRtl ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </button>
            <button
              type="button"
              onClick={scrollNext}
              aria-label="Next"
              className={activeBtn === "next" ? "active" : ""}
            >
              {isRtl ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            </button>
          </div>
        </div>

        <div className={`embla ${variant === "popular" ? "popular-news-slides" : ""}`} ref={emblaRef}>
          <div className="embla__container" style={{ gap: 16 }}>
            {items.map((it) => (
              <div
                key={it.id}
                className="mimic-carousel-slide"
                style={{ flex: "0 0 calc(25% - 12px)", minWidth: 0 }}
              >
                {useAroundWorldCard ? (
                  <div className="col-lg-12 col-md-12">
                    <div className="single-around-the-world-news">
                      <div className="news-image">
                        <Link href={`/${locale}/news/${it.slugId}`}>
                          {it.imageUrl ? (
                            <Image src={it.imageUrl} alt="" width={400} height={300} unoptimized />
                          ) : (
                            <div style={{ width: "100%", aspectRatio: "4 / 3", background: "var(--mm-panel)" }} />
                          )}
                        </Link>
                      </div>
                      <div className="news-content">
                        <h3>
                          <Link href={`/${locale}/news/${it.slugId}`}>{it.title}</Link>
                        </h3>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={`single-default-news ${cardClass}`}>
                    <Link href={`/${locale}/news/${it.slugId}`}>
                      {it.imageUrl ? (
                        <Image src={it.imageUrl} alt="" width={400} height={300} unoptimized />
                      ) : (
                        <div style={{ width: "100%", aspectRatio: "4 / 3", background: "var(--mm-panel)" }} />
                      )}
                    </Link>
                    <div className="news-content">
                      <h3>
                        <Link href={`/${locale}/news/${it.slugId}`}>{it.title}</Link>
                      </h3>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <style>{`
          @media (max-width: 991px){ .mimic-root .mimic-carousel-slide{ flex: 0 0 calc(50% - 8px) !important; } }
          @media (max-width: 575px){ .mimic-root .mimic-carousel-slide{ flex: 0 0 100% !important; } }
        `}</style>
      </div>
    </section>
  );
}
