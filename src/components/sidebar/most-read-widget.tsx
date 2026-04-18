import Image from "next/image";
import Link from "next/link";

import type { FeedItemDto } from "@/src/lib/api";
import { getAssetUrl } from "@/src/lib/api";

type MostReadWidgetProps = {
  locale: string;
  label: string;
  items: FeedItemDto[];
};

export function MostReadWidget({ locale, label, items }: MostReadWidgetProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="rounded-sm border border-[color:var(--border-soft)] bg-white px-5 py-6 shadow-[0_14px_36px_rgba(13,35,77,0.08)]">
      <div className="mb-4 flex items-center gap-3 border-b border-[color:var(--border-soft)] pb-3">
        <span className="inline-block h-5 w-1 rounded-sm bg-[color:var(--accent)]" />
        <h2 className="text-lg font-black text-[color:var(--ink)]">{label}</h2>
      </div>

      <div className="space-y-3">
        {items.slice(0, 5).map((item) => {
          const imageUrl = getAssetUrl(item.photoPath);
          return (
            <Link
              key={item.id}
              href={`/${locale}/news/${item.slugId}`}
              className="group flex items-center gap-3 rounded-md border border-transparent px-2 py-2 transition-all duration-300 hover:border-[color:var(--border-soft)] hover:bg-[color:var(--panel)] hover:shadow-sm"
            >
              {/* Thumbnail */}
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-[color:var(--panel)]">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={item.title}
                    fill
                    sizes="56px"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-[color:var(--muted)]">
                    <svg className="h-5 w-5 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="m21 15-5-5L5 21" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Title */}
              <span className="flex-1 text-sm font-extrabold leading-6 text-[color:var(--ink)] transition-colors duration-300 group-hover:text-[color:var(--accent)]">
                {item.title}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
