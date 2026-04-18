"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type TickerItem = {
  id: number;
  slugId: string;
  title: string;
  photoUrl: string | null;
};

type BreakingTickerProps = {
  locale: string;
  label: string;
  items: TickerItem[];
};

/**
 * Smooth CSS-translated marquee ticker.
 * Doubles the item list for seamless infinite loop.
 * Pauses on hover. Respects prefers-reduced-motion.
 */
export function BreakingTicker({ locale, label, items }: BreakingTickerProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [halfWidth, setHalfWidth] = useState(0);

  // Measure half-width (one copy of items) to set keyframe destination
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const measure = () => setHalfWidth(track.scrollWidth / 2);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [items.length]);

  if (items.length === 0) return null;

  const doubled = [...items, ...items];

  // Speed: ~50px/s → duration = totalWidth / 50
  const duration = halfWidth > 0 ? halfWidth / 50 : 40;

  return (
    <div
      className="border-b border-[color:var(--border-soft)] bg-white"
      aria-live="off"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-4 py-2 sm:px-6 lg:px-8">
        {/* "عاجل" badge */}
        <span className="shrink-0 rounded bg-[#c0392b] px-3 py-1 text-xs font-black text-white">
          {label}
        </span>

        {/* Marquee viewport */}
        <div className="relative min-w-0 flex-1 overflow-hidden">
          <div
            ref={trackRef}
            className="marquee-track flex items-center whitespace-nowrap"
            style={{
              animationDuration: `${duration}s`,
              animationPlayState: paused ? "paused" : "running",
            }}
          >
            {doubled.map((item, i) => (
              <span key={`${item.id}-${i}`} className="inline-flex shrink-0 items-center">
                {/* Dot separator (skip before the very first item) */}
                {i > 0 && (
                  <span className="mx-3 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[#2FA14B] opacity-50" />
                )}
                <Link
                  href={`/${locale}/news/${item.slugId}`}
                  className="inline-flex items-center gap-2 text-[13px] font-bold leading-6 text-[color:var(--ink)] transition-colors hover:text-[#2FA14B]"
                >
                  {item.photoUrl ? (
                    <Image
                      src={item.photoUrl}
                      alt=""
                      width={28}
                      height={28}
                      className="h-7 w-7 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <span className="h-7 w-7 shrink-0 rounded-full bg-[color:var(--panel)]" />
                  )}
                  {item.title}
                </Link>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
