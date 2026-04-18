"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import Link from "next/link";
import { shimmerPlaceholder } from "@/src/lib/shimmer";

type SlideItem = {
  id: number;
  slugId: string;
  title: string;
  sectionTitle: string;
  imageUrl: string | null;
  locale: string;
};

type CategorySliderProps = {
  items: SlideItem[];
  label: string;
};

const AUTOPLAY_DELAY = 5000;

export function CategorySlider({ items, label }: CategorySliderProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, direction: "rtl", align: "center" },
  );

  const [activeBtn, setActiveBtn] = useState<"prev" | "next">("next");
  const activeBtnRef = useRef(activeBtn);
  activeBtnRef.current = activeBtn;
  const pausedRef = useRef(false);

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
    setActiveBtn("prev");
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
    setActiveBtn("next");
  }, [emblaApi]);

  const greenBtn = "flex h-8 w-8 items-center justify-center rounded-sm bg-[#2FA14B] text-white shadow backdrop-blur-sm transition-colors duration-300 hover:bg-[#268a3e]";
  const greyBtn = "flex h-8 w-8 items-center justify-center rounded-sm bg-white/90 text-[#142963] shadow backdrop-blur-sm transition-colors duration-300 hover:bg-[#2FA14B] hover:text-white";

  // Custom autoplay that respects direction based on activeBtn
  useEffect(() => {
    if (!emblaApi) return;

    const rootNode = emblaApi.rootNode();

    const pause = () => { pausedRef.current = true; };
    const resume = () => { pausedRef.current = false; };

    rootNode.addEventListener("mouseenter", pause);
    rootNode.addEventListener("mouseleave", resume);

    const id = setInterval(() => {
      if (pausedRef.current) return;
      if (activeBtnRef.current === "next") {
        emblaApi.scrollNext();
      } else {
        emblaApi.scrollPrev();
      }
    }, AUTOPLAY_DELAY);

    return () => {
      clearInterval(id);
      rootNode.removeEventListener("mouseenter", pause);
      rootNode.removeEventListener("mouseleave", resume);
    };
  }, [emblaApi]);

  if (items.length === 0) return null;

  return (
    <section>
      <div className="relative">
        {/* Carousel viewport */}
        <div className="overflow-hidden rounded-lg" ref={emblaRef}>
          <div className="flex">
            {items.map((item) => (
              <div key={item.id} className="min-w-0 flex-[0_0_100%]">
                <Link
                  href={`/${item.locale}/news/${item.slugId}`}
                  className="group relative block aspect-[4/3] w-full overflow-hidden"
                >
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 400px"
                      placeholder="blur"
                      blurDataURL={shimmerPlaceholder(400, 300)}
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-[#142963]" />
                  )}
                  {/* Dark gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  {/* Content */}
                  <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-5">
                    {item.sectionTitle && (
                      <span className="inline-block w-fit rounded bg-[#2FA14B] px-3 py-1 text-xs font-bold text-white">
                        {item.sectionTitle}
                      </span>
                    )}
                    <h3 className="line-clamp-3 text-base font-bold leading-relaxed text-white drop-shadow-sm">
                      {item.title}
                    </h3>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation arrows — top-left pair */}
        <div className="absolute left-3 top-3 z-10 flex gap-1.5">
          <button
            type="button"
            onClick={scrollNext}
            aria-label="Next slide"
            className={activeBtn === "next" ? greenBtn : greyBtn}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={scrollPrev}
            aria-label="Previous slide"
            className={activeBtn === "prev" ? greenBtn : greyBtn}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
