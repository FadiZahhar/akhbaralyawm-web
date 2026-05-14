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
  sectionTitle?: string;
  youtubeUrl?: string | null;
};

type Props = {
  locale: string;
  sectionTitle: string;
  sectionHref: string;
  items: Item[];
};

export function VideoNewsArea({ locale, sectionTitle, sectionHref, items }: Props) {
  const isRtl = locale === "ar";
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: items.length > 2,
    direction: isRtl ? "rtl" : "ltr",
    align: "start",
  });
  const [activeBtn, setActiveBtn] = useState<"prev" | "next">("next");

  const scrollPrev = useCallback(() => { emblaApi?.scrollPrev(); setActiveBtn("prev"); }, [emblaApi]);
  const scrollNext = useCallback(() => { emblaApi?.scrollNext(); setActiveBtn("next"); }, [emblaApi]);

  if (items.length === 0) return null;

  return (
    <section className="video-news-area ptb-40">
      <div className="container">
        <div className="section-title d-flex align-items-center justify-content-between">
          <Link href={sectionHref}>
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

        <div className="embla" ref={emblaRef}>
          <div className="embla__container" style={{ gap: 16 }}>
            {items.map((it) => (
              <div key={it.id} className="mimic-video-slide" style={{ flex: "0 0 calc(33.3333% - 11px)", minWidth: 0 }}>
                <div className="single-default-news">
                  {it.imageUrl ? (
                    <Image src={it.imageUrl} alt="" width={520} height={325} unoptimized />
                  ) : (
                    <div style={{ width: "100%", aspectRatio: "520 / 325", background: "#222" }} />
                  )}
                  <div className="news-content">
                    <h3>
                      <Link href={`/${locale}/news/${it.slugId}`}>{it.title}</Link>
                    </h3>
                  </div>
                  {it.sectionTitle ? (
                    <div className="tags">
                      <Link href={sectionHref}>{it.sectionTitle}</Link>
                    </div>
                  ) : null}
                  <div className="video-btn">
                    <a
                      href={it.youtubeUrl || `/${locale}/news/${it.slugId}`}
                      target={it.youtubeUrl ? "_blank" : undefined}
                      rel={it.youtubeUrl ? "noopener noreferrer" : undefined}
                      className={it.youtubeUrl ? "popup-youtube" : undefined}
                      aria-label={it.youtubeUrl ? "Open video" : "Open article"}
                    >
                      <IcoFontIcon name="play-alt-3" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <style>{`
          @media (max-width: 991px){ .mimic-root .mimic-video-slide{ flex: 0 0 calc(50% - 8px) !important; } }
          @media (max-width: 575px){ .mimic-root .mimic-video-slide{ flex: 0 0 100% !important; } }
        `}</style>
      </div>
    </section>
  );
}
