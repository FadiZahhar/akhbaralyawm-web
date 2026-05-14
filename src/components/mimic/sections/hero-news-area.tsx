"use client";

import Image from "next/image";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";

import { ChevronLeftIcon, ChevronRightIcon, IcoFontIcon } from "../icons";

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

type Props = {
  locale: string;
  liveLabel: string;
  slides: SlideItem[];
  updates: UpdateItem[];
};

export function HeroNewsArea({ locale, liveLabel, slides, updates }: Props) {
  const isRtl = locale === "ar";
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    direction: isRtl ? "rtl" : "ltr",
    align: "center",
  });

  const [activeBtn, setActiveBtn] = useState<"prev" | "next">("next");

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
    setActiveBtn("prev");
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
    setActiveBtn("next");
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi || slides.length <= 1) return;
    const id = window.setInterval(() => {
      if (activeBtn === "prev") emblaApi.scrollPrev();
      else emblaApi.scrollNext();
    }, 5000);
    return () => window.clearInterval(id);
  }, [emblaApi, slides.length, activeBtn]);

  return (
    <section className="new-news-area ptb-40">
      <div className="container">
        <div className="row">
          {/* Left: Live updates (لحظة بلحظة) - col-lg-4 to match legacy */}
          <div className="col-lg-4 col-md-12">
            <div className="new-news-list">
              <div className="newsUpdates">
                <a href={`/${locale}/category/26`}>
                  <h2>
                    <IcoFontIcon name="clock-time" />
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

          {/* Right: Full article carousel - col-lg-6 to match legacy */}
          <div className="col-lg-6 col-md-12">
            <div className="new-news-slides">
              <div className="embla" ref={emblaRef}>
                <div className="embla__container">
                  {slides.map((s) => (
                    <div key={s.id} className="embla__slide">
                      <article className="single-default-news">
                        <Link href={`/${locale}/news/${s.slugId}`}>
                          {s.imageUrl ? (
                            <Image
                              src={s.imageUrl}
                              alt={s.title}
                              width={780}
                              height={488}
                              priority
                              unoptimized
                            />
                          ) : (
                            <div style={{ aspectRatio: "16 / 10", background: "var(--mm-navy)" }} />
                          )}
                        </Link>
                        <div className="news-content">
                          <h3>
                            <Link href={`/${locale}/news/${s.slugId}`}>{s.title}</Link>
                          </h3>
                        </div>
                        {s.sectionTitle && (
                          <div className="tags">
                            <a href="#">{s.sectionTitle}</a>
                          </div>
                        )}
                      </article>
                    </div>
                  ))}
                </div>
              </div>

              {slides.length > 1 && (
                <div className={`slider-nav ${isRtl ? "is-rtl" : "is-ltr"}`}>
                  <button
                    type="button"
                    onClick={scrollPrev}
                    aria-label="Previous slide"
                    className={activeBtn === "prev" ? "active" : ""}
                  >
                    {isRtl ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                  </button>
                  <button
                    type="button"
                    onClick={scrollNext}
                    aria-label="Next slide"
                    className={activeBtn === "next" ? "active" : ""}
                  >
                    {isRtl ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
