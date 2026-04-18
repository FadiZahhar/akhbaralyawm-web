"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import type { FeedItemDto } from "@/src/lib/api";
import { getAssetUrl } from "@/src/lib/api";

const CYCLE_DELAY = 4000; // ms between auto-advances

type HomeHeroProps = {
  locale: string;
  lead: FeedItemDto | undefined;
  updates: FeedItemDto[];
  dict: {
    lastMoment: string;
    live: string;
  };
};

function formatHeroDate(value: string, locale: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-LB" : locale, {
    dateStyle: "medium",
  }).format(date);
}

export function HomeHero({ locale, lead, updates, dict }: HomeHeroProps) {
  const items = updates.slice(0, 8);
  const [activeIdx, setActiveIdx] = useState(0);
  const pausedRef = useRef(false);
  const listRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  // Auto-cycle
  useEffect(() => {
    if (items.length <= 1) return;
    const id = setInterval(() => {
      if (pausedRef.current) return;
      setActiveIdx((prev) => (prev + 1) % items.length);
    }, CYCLE_DELAY);
    return () => clearInterval(id);
  }, [items.length]);

  // Auto-scroll the list to keep active row visible
  useEffect(() => {
    const row = rowRefs.current[activeIdx];
    if (row && listRef.current) {
      row.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [activeIdx]);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageColRef = useRef<HTMLAnchorElement>(null);
  const [constrainedH, setConstrainedH] = useState<number | null>(null);

  // Measure the image column height and constrain the right column
  useEffect(() => {
    const measure = () => {
      if (imageColRef.current) {
        setConstrainedH(imageColRef.current.offsetHeight);
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const pause = useCallback(() => { pausedRef.current = true; }, []);
  const resume = useCallback(() => { pausedRef.current = false; }, []);

  const activeItem = items[activeIdx] ?? lead;
  const activeImage = activeItem ? getAssetUrl(activeItem.photoPath) : null;

  return (
    <div
      className="overflow-hidden rounded-sm border border-[color:var(--border-soft)] bg-white shadow-[0_20px_50px_rgba(13,35,77,0.08)]"
      onMouseEnter={pause}
      onMouseLeave={resume}
    >
      <div ref={containerRef} className="grid lg:grid-cols-[1.2fr_0.8fr]">
        {/* Image panel — square, crossfade between active items */}
        <Link
          ref={imageColRef}
          href={`/${locale}/news/${(activeItem ?? lead)?.slugId ?? ""}`}
          className="group relative block aspect-square overflow-hidden"
        >
          {/* Stack all images; only the active one is visible */}
          {items.map((item, idx) => {
            const url = getAssetUrl(item.photoPath);
            return url ? (
              <Image
                key={item.id}
                src={url}
                alt={item.title}
                fill
                sizes="(max-width: 1024px) 100vw, 55vw"
                className={`object-cover transition-opacity duration-700 ease-in-out ${
                  idx === activeIdx ? "opacity-100" : "opacity-0"
                }`}
                priority={idx === 0}
              />
            ) : null;
          })}
          {/* Fallback solid bg if no images at all */}
          {!activeImage && <div className="h-full w-full bg-[color:var(--panel)]" />}

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Title overlay */}
          <div className="absolute inset-x-0 bottom-0 space-y-2 p-5 sm:p-6">
            {activeItem?.sectionTitle ? (
              <span className="inline-flex rounded-sm bg-[color:var(--accent)] px-2.5 py-1 text-xs font-black text-white">
                {activeItem.sectionTitle}
              </span>
            ) : null}
            <h2 className="text-xl font-black leading-[1.7] text-white transition-opacity duration-500 sm:text-2xl">
              {activeItem?.title}
            </h2>
          </div>
        </Link>

        {/* Timestamped updates — scrollable, height constrained to match image */}
        <div
          className="flex flex-col overflow-hidden border-r border-[color:var(--border-soft)] lg:border-r-0 lg:border-l"
          style={constrainedH ? { maxHeight: constrainedH } : undefined}
        >
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[color:var(--border-soft)] px-5 py-3">
            <div className="flex items-center gap-2">
              <span className="inline-block h-4 w-1 rounded-sm bg-[color:var(--accent)]" />
              <h2 className="text-base font-black text-[color:var(--ink)]">{dict.lastMoment}</h2>
            </div>
            <span className="rounded-sm bg-[color:var(--accent)] px-2.5 py-0.5 text-[10px] font-black text-white">
              {dict.live}
            </span>
          </div>
          <div
            ref={listRef}
            className="min-h-0 flex-1 divide-y divide-[color:var(--border-soft)] overflow-y-auto scroll-smooth"
          >
            {items.map((item, idx) => (
              <Link
                key={item.id}
                ref={(el) => { rowRefs.current[idx] = el; }}
                href={`/${locale}/news/${item.slugId}`}
                onMouseEnter={() => { setActiveIdx(idx); pause(); }}
                onMouseLeave={resume}
                className={`relative flex items-start gap-3 px-5 py-3 transition-colors duration-500 ${
                  idx === activeIdx
                    ? "bg-[color:var(--panel)]"
                    : "bg-transparent hover:bg-[color:var(--panel)]"
                }`}
              >
                {/* Active-row left accent bar */}
                <span
                  className={`absolute inset-y-0 start-0 w-[3px] rounded-e bg-[color:var(--accent)] transition-opacity duration-500 ${
                    idx === activeIdx ? "opacity-100" : "opacity-0"
                  }`}
                />
                <span className="mt-1 shrink-0 text-xs font-bold tabular-nums text-[color:var(--accent)]">
                  {formatHeroDate(item.disdate, locale).split(" ").slice(0, 1).join("")}
                </span>
                <span
                  className={`text-sm font-bold leading-7 transition-colors duration-500 ${
                    idx === activeIdx
                      ? "text-[color:var(--accent)]"
                      : "text-[color:var(--ink)]"
                  }`}
                >
                  {item.title}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}