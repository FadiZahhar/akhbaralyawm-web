"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { shimmerPlaceholder } from "@/src/lib/shimmer";

type VideoItem = {
  id: number;
  title: string;
  thumbnail: string | null;
  youtubeId: string;
};

type VideoProgramsProps = {
  sectionTitle: string;
  items: VideoItem[];
};

export function VideoPrograms({ sectionTitle, items }: VideoProgramsProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    direction: "rtl",
    align: "start",
    slidesToScroll: 1,
  });

  const pausedRef = useRef(false);
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  // Auto-play every 5s, pause on hover
  useEffect(() => {
    if (!emblaApi) return;
    const rootNode = emblaApi.rootNode();
    const pause = () => { pausedRef.current = true; };
    const resume = () => { pausedRef.current = false; };
    rootNode.addEventListener("mouseenter", pause);
    rootNode.addEventListener("mouseleave", resume);

    const id = setInterval(() => {
      if (pausedRef.current) return;
      emblaApi.scrollNext();
    }, 5000);

    return () => {
      clearInterval(id);
      rootNode.removeEventListener("mouseenter", pause);
      rootNode.removeEventListener("mouseleave", resume);
    };
  }, [emblaApi]);

  // Close modal on Escape key
  useEffect(() => {
    if (!activeVideo) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveVideo(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [activeVideo]);

  if (items.length === 0) return null;

  return (
    <>
      <section className="video-programs-section w-full bg-[#142963] py-10">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Header: title + arrows */}
          <div className="mb-6 flex items-center justify-between">
            <h2 className="border-s-[3px] border-[#2FA14B] ps-2.5 text-[25px] font-bold text-white">
              {sectionTitle}
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={scrollPrev}
                aria-label="Previous"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white/70 transition hover:border-[#2FA14B] hover:text-[#2FA14B]"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
              <button
                type="button"
                onClick={scrollNext}
                aria-label="Next"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white/70 transition hover:border-[#2FA14B] hover:text-[#2FA14B]"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
            </div>
          </div>

          {/* Carousel */}
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="-ms-5 flex">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="min-w-0 flex-[0_0_100%] ps-5 sm:flex-[0_0_50%]"
                >
                  <button
                    type="button"
                    onClick={() => setActiveVideo(item)}
                    className="group block w-full text-start"
                  >
                    {/* Thumbnail with play button */}
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                      {item.thumbnail ? (
                        <Image
                          src={item.thumbnail}
                          alt={item.title}
                          fill
                          sizes="(max-width: 640px) 100vw, 50vw"
                          placeholder="blur"
                          blurDataURL={shimmerPlaceholder(640, 360)}
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-[#0f2027]" />
                      )}
                      {/* Dark overlay */}
                      <div className="absolute inset-0 bg-black/20 transition-colors duration-300 group-hover:bg-black/10" />
                      {/* Section badge — hidden until backend supplies a per-item label */}
                      {/* Play button — pulsing */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="video-play-btn flex h-14 w-14 items-center justify-center rounded-full bg-white/90 shadow-lg transition-transform duration-300 group-hover:scale-110">
                          <svg
                            width="22"
                            height="22"
                            viewBox="0 0 24 24"
                            fill="#142963"
                          >
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </span>
                      </div>
                    </div>
                    {/* Title */}
                    <p className="mt-3 line-clamp-2 text-[15px] font-bold leading-relaxed text-white/90 transition-colors group-hover:text-[#2FA14B]">
                      {item.title}
                    </p>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Video Modal */}
      {activeVideo && (
        <div
          className="video-modal-overlay fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveVideo(null);
          }}
          role="dialog"
          aria-modal="true"
          aria-label={activeVideo.title}
        >
          <div className="video-modal-content relative w-[90vw] max-w-4xl">
            {/* Close button */}
            <button
              type="button"
              onClick={() => setActiveVideo(null)}
              className="absolute -top-10 end-0 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
              aria-label="Close"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            {/* YouTube embed */}
            <div className="relative aspect-video w-full overflow-hidden rounded-xl border-2 border-white/10 shadow-2xl">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${activeVideo.youtubeId}?autoplay=1&rel=0`}
                title={activeVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            </div>
            {/* Title below video */}
            <p className="mt-4 text-center text-lg font-bold text-white">
              {activeVideo.title}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
