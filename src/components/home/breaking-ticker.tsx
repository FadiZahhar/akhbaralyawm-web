"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef } from "react";

type TickerItem = {
  id: number;
  slugId: string;
  title: string;
  photoUrl: string | null;
};

type BreakingTickerProps = {
  items: TickerItem[];
};

export function BreakingTicker({ items }: BreakingTickerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let animationId: number;
    let scrollPos = 0;
    const speed = 0.5;

    function step() {
      if (!el) return;
      scrollPos += speed;
      if (scrollPos >= el.scrollWidth / 2) {
        scrollPos = 0;
      }
      el.scrollLeft = scrollPos;
      animationId = requestAnimationFrame(step);
    }

    animationId = requestAnimationFrame(step);

    const pause = () => cancelAnimationFrame(animationId);
    const resume = () => {
      animationId = requestAnimationFrame(step);
    };

    el.addEventListener("mouseenter", pause);
    el.addEventListener("mouseleave", resume);

    return () => {
      cancelAnimationFrame(animationId);
      el.removeEventListener("mouseenter", pause);
      el.removeEventListener("mouseleave", resume);
    };
  }, []);

  if (items.length === 0) return null;

  const doubled = [...items, ...items];

  return (
    <div className="border-b border-[color:var(--border-soft)] bg-white">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-4 py-2.5 sm:px-6 lg:px-8">
        <span className="shrink-0 rounded-sm bg-[color:var(--accent)] px-3 py-1 text-xs font-black text-white">
          عاجل
        </span>
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-hidden"
        >
          {doubled.map((item, i) => (
            <Link
              key={`${item.id}-${i}`}
              href={`/news/${item.slugId}`}
              className="flex shrink-0 items-center gap-3 transition hover:text-[color:var(--accent-strong)]"
            >
              {item.photoUrl ? (
                <Image
                  src={item.photoUrl}
                  alt=""
                  width={48}
                  height={48}
                  className="h-10 w-10 shrink-0 rounded-sm object-cover"
                />
              ) : (
                <span className="h-10 w-10 shrink-0 rounded-sm bg-[color:var(--panel)]" />
              )}
              <span className="whitespace-nowrap text-sm font-bold text-[color:var(--ink)]">
                {item.title}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
