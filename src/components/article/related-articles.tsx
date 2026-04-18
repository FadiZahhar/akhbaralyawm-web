import Link from "next/link";
import Image from "next/image";

import { getArticlesBySection, getAssetUrl } from "@/src/lib/api";
import type { Locale } from "@/src/lib/i18n";

type RelatedArticlesProps = {
  locale: Locale;
  sectionLink: string;
  excludeId: number;
  label: string;
};

export async function RelatedArticles({ locale, sectionLink, excludeId, label }: RelatedArticlesProps) {
  const feed = await getArticlesBySection(sectionLink, 1, 5, locale);
  const items = feed.items.filter((item) => item.id !== excludeId).slice(0, 4);

  if (items.length === 0) return null;

  return (
    <section className="space-y-4">
      <h2 className="border-s-[3px] border-[#2FA14B] ps-2.5 text-xl font-bold text-[#142963]">
        {label}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((item) => {
          const photoUrl = getAssetUrl(item.photoPath);
          return (
            <Link
              key={item.id}
              href={`/${locale}/news/${item.slugId}`}
              className="group relative block overflow-hidden rounded-lg"
            >
              <article className="relative aspect-[4/3] w-full">
                {photoUrl ? (
                  <Image
                    src={photoUrl}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 100vw, 50vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 bg-[#142963]" />
                )}
                {/* Dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                {/* Content overlay */}
                <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-4">
                  {item.sectionTitle && (
                    <span className="inline-block w-fit rounded-sm bg-[#2FA14B] px-2.5 py-0.5 text-xs font-bold text-white">
                      {item.sectionTitle}
                    </span>
                  )}
                  <h3 className="line-clamp-3 text-sm font-bold leading-snug text-white drop-shadow-sm">
                    {item.title}
                  </h3>
                </div>
              </article>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
