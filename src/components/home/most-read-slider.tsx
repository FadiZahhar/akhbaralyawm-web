"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import Link from "next/link";
import { shimmerPlaceholder } from "@/src/lib/shimmer";

type MostReadItem = {
  id: number;
  slugId: string;
  title: string;
  imageUrl: string | null;
  locale: string;
};

type MostReadSliderProps = {
  label: string;
  items: MostReadItem[];
};

export function MostReadSlider({ label, items }: MostReadSliderProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    direction: "rtl",
    align: "start",
    slidesToScroll: 1,
  });

  const pausedRef = useRef(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);

    const rootNode = emblaApi.rootNode();
    const pause = () => { pausedRef.current = true; };
    const resume = () => { pausedRef.current = false; };
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

  const totalSlides = items.length;

  return (
    <section className="w-full bg-[#2FA14B] py-10">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header: title + arrows */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="border-s-[3px] border-white ps-2.5 text-[25px] font-bold text-white">
            {label}
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={scrollPrev}
              aria-label="السابق"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 text-white transition hover:bg-white hover:text-[#2FA14B]"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={scrollNext}
              aria-label="التالي"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 text-white transition hover:bg-white hover:text-[#2FA14B]"
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
                className="min-w-0 flex-[0_0_100%] ps-4 sm:flex-[0_0_50%] lg:flex-[0_0_33.333%]"
              >
                <Link
                  href={`/${item.locale}/news/${item.slugId}`}
                  className="group block"
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg shadow-lg">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        placeholder="blur"
                        blurDataURL={shimmerPlaceholder(600, 375)}
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-[#142963]" />
                    )}
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    {/* Title overlay */}
                    <div className="absolute inset-x-0 bottom-0 p-4">
                      <h3 className="line-clamp-2 text-[15px] font-bold leading-relaxed text-white drop-shadow-md">
                        {item.title}
                      </h3>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Progress dots */}
        <div className="mt-5 flex items-center justify-center gap-1.5">
          {Array.from({ length: Math.min(totalSlides, 10) }).map((_, i) => (
            <span
              key={i}
              className={`inline-block h-1.5 rounded-full transition-all duration-300 ${
                i === selectedIndex % Math.min(totalSlides, 10)
                  ? "w-6 bg-white"
                  : "w-1.5 bg-white/40"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
