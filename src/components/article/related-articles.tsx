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
            <article
              key={item.id}
              className="flex gap-3 rounded-sm border border-[#EEEEEE] bg-white p-3 shadow-sm transition hover:shadow-md"
            >
              {photoUrl ? (
                <Image
                  src={photoUrl}
                  alt={item.title}
                  width={120}
                  height={80}
                  className="h-20 w-[120px] shrink-0 rounded-sm object-cover"
                />
              ) : (
                <div className="h-20 w-[120px] shrink-0 rounded-sm bg-[#F5F6FA]" />
              )}
              <div className="flex flex-col justify-center gap-1">
                <span className="text-[11px] font-bold text-[#2FA14B]">{item.sectionTitle}</span>
                <h3 className="line-clamp-2 text-sm font-bold leading-5 text-[#142963]">
                  <Link href={`/${locale}/news/${item.slugId}`} className="transition hover:text-[#2FA14B]">
                    {item.title}
                  </Link>
                </h3>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
