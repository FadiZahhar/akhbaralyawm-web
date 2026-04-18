"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import Link from "next/link";

type FeaturedItem = {
  id: number;
  slugId: string;
  title: string;
  imageUrl: string | null;
  locale: string;
};

type FeaturedSectionSliderProps = {
  locale: string;
  sectionTitle: string;
  sectionLink: string;
  items: FeaturedItem[];
};

export function FeaturedSectionSlider({
  locale,
  sectionTitle,
  sectionLink,
  items,
}: FeaturedSectionSliderProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    direction: "rtl",
    align: "start",
    slidesToScroll: 1,
  });

  const pausedRef = useRef(false);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanPrev(emblaApi.canScrollPrev());
    setCanNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);

    const rootNode = emblaApi.rootNode();
    const pause = () => {
      pausedRef.current = true;
    };
    const resume = () => {
      pausedRef.current = false;
    };
    rootNode.addEventListener("mouseenter", pause);
    rootNode.addEventListener("mouseleave", resume);

    const id = setInterval(() => {
      if (pausedRef.current) return;
      emblaApi.scrollNext();
    }, 4000);

    return () => {
      clearInterval(id);
      rootNode.removeEventListener("mouseenter", pause);
      rootNode.removeEventListener("mouseleave", resume);
    };
  }, [emblaApi, onSelect]);

  if (items.length === 0) return null;

  return (
    <section className="space-y-4 rounded-sm border border-[color:var(--border-soft)] bg-white p-5 shadow-[0_12px_30px_rgba(13,35,77,0.06)] sm:p-6">
      {/* Header: title + arrows */}
      <div className="flex items-center justify-between gap-4 border-b border-[color:var(--border-soft)] pb-3">
        <h2 className="border-s-[3px] border-[color:var(--accent)] ps-2.5 text-[25px] font-bold text-[color:var(--ink)]">
          {sectionTitle}
        </h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={scrollPrev}
            aria-label="السابق"
            className="flex h-8 w-8 items-center justify-center rounded-sm border border-[color:var(--border-soft)] bg-white text-[color:var(--ink)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={scrollNext}
            aria-label="التالي"
            className="flex h-8 w-8 items-center justify-center rounded-sm border border-[color:var(--border-soft)] bg-white text-[color:var(--ink)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Carousel */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="-ms-4 flex">
          {items.map((item) => (
            <div
              key={item.id}
              className="min-w-0 flex-[0_0_50%] ps-4 sm:flex-[0_0_33.333%] lg:flex-[0_0_25%]"
            >
              <Link
                href={`/${item.locale}/news/${item.slugId}`}
                className="group block"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 rounded-lg bg-[#142963]" />
                  )}
                </div>
                <h3 className="mt-3 line-clamp-2 text-[15px] font-bold leading-relaxed text-[color:var(--ink)] transition-colors group-hover:text-[color:var(--accent)]">
                  {item.title}
                </h3>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
