"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Item = { id: number; slugId: string; title: string; locale: string };

type Props = {
  label: string;
  items: Item[];
  intervalMs?: number;
};

/**
 * Compact green "breaking" strip. Cycles through one headline at a time.
 */
export function NewsTickerStrip({ label, items, intervalMs = 5000 }: Props) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (items.length <= 1) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % items.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [items.length, intervalMs]);

  if (!visible || items.length === 0) return null;
  const current = items[index];

  return (
    <>
      <div id="close" className="new-slides mimic-top-ticker">
        <section className="new-news-area bg-color-none mb-4">
          <div className="container">
            <button type="button" className="mimic-ticker-close" aria-label="Close" onClick={() => setVisible(false)}>
              ×
            </button>
            <div className="mimic-ticker-track" dir="ltr" role="status" aria-live="polite">
              <Link
                href={`/${current.locale}/news/${current.slugId}`}
                className="mimic-ticker-link"
                key={current.id}
                dir="rtl"
                style={{ animation: "mimic-fade .35s ease" }}
              >
                {current.title}
              </Link>
            </div>
          </div>
        </section>
      </div>
      <style>{`@keyframes mimic-fade{from{opacity:.2}to{opacity:1}}`}</style>
    </>
  );
}
