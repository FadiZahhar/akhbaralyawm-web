import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound, permanentRedirect } from "next/navigation";

import { getArticlesByAuthor, getAssetUrl, getAuthorBySlugOrId } from "@/src/lib/api";

type PageParams = {
  slug: string;
};

type PageProps = {
  params: Promise<PageParams>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const author = await getAuthorBySlugOrId(slug);

  if (!author) {
    return {
      title: "الكاتب غير موجود",
    };
  }

  return {
    title: author.title,
    description: `صفحة الكاتب ${author.title}`,
    alternates: {
      canonical: `/author/${author.link}`,
    },
  };
}

export default async function AuthorPage({ params }: PageProps) {
  const { slug } = await params;
  const author = await getAuthorBySlugOrId(slug);

  if (!author) {
    notFound();
  }

  if (slug !== author.link) {
    permanentRedirect(`/author/${author.link}`);
  }

  const imageUrl = getAssetUrl(author.photoPath);
  const articles = await getArticlesByAuthor(author.link, 1, 12);

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <nav className="text-sm text-zinc-500">
        <Link href="/" className="hover:text-emerald-700">
          الرئيسية
        </Link>
        <span className="px-2">/</span>
        <span>الكتّاب</span>
      </nav>

      <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
        <div className="grid gap-6 p-6 md:grid-cols-[220px_minmax(0,1fr)] md:p-8">
          <div>
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={author.title}
                width={800}
                height={800}
                className="aspect-square w-full rounded-2xl bg-zinc-100 object-cover"
              />
            ) : (
              <div className="aspect-square w-full rounded-2xl bg-zinc-100" />
            )}
          </div>

          <div className="space-y-4">
            <p className="text-sm font-medium text-emerald-700">كاتب</p>
            <h1 className="text-3xl font-bold text-zinc-900">{author.title}</h1>
            {author.bodyHtml ? (
              <section
                className="prose prose-zinc max-w-none leading-8"
                dangerouslySetInnerHTML={{ __html: author.bodyHtml }}
              />
            ) : (
              <p className="text-sm leading-7 text-zinc-600">
                سيتم ربط أرشيف المقالات الخاص بهذا الكاتب في المرحلة التالية بعد استكمال
                توسيع واجهات الـ API العامة.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-zinc-900">أرشيف الكاتب</h2>

        {articles?.items.length ? (
          <div className="space-y-3">
            {articles.items.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4"
              >
                <h3 className="text-lg font-semibold leading-8 text-zinc-900">
                  <Link href={`/news/${item.slugId}`} className="hover:text-emerald-700">
                    {item.title}
                  </Link>
                </h3>
                {item.summary ? (
                  <p className="mt-2 text-sm leading-7 text-zinc-600">{item.summary}</p>
                ) : null}
              </article>
            ))}
          </div>
        ) : (
          <p className="text-sm leading-7 text-zinc-600">
            أرشيف المقالات غير متاح حالياً من خلال الـ API العام. سيتم عرضه تلقائياً فور
            تفعيل endpoint مخصص للمقالات حسب الكاتب.
          </p>
        )}
      </section>
    </main>
  );
}