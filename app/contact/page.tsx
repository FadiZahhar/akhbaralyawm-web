import type { Metadata } from "next";

import { getHomeFeed } from "@/src/lib/api";
import { PageSidebar } from "@/src/components/sidebar/page-sidebar";

export const metadata: Metadata = {
  title: "اتصل بنا",
  description: "طرق التواصل مع فريق أخبار اليوم.",
  alternates: {
    canonical: "/contact",
  },
};

export default async function ContactPage() {
  const mostRead = await getHomeFeed(5);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="flex flex-col gap-8">
      <header className="space-y-3 rounded-sm border border-[color:var(--border-soft)] bg-white px-5 py-6 shadow-[0_14px_36px_rgba(13,35,77,0.06)] sm:px-6">
        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[color:var(--accent)]">Contact</p>
        <h1 className="text-[1.95rem] font-black text-[color:var(--ink)]">اتصل بنا</h1>
        <p className="max-w-3xl text-sm leading-8 text-zinc-600">
          قنوات التواصل الرسمية مع فريق التحرير والدعم في أخبار اليوم.
        </p>
      </header>

      <section className="space-y-6 rounded-sm border border-[color:var(--border-soft)] bg-white p-6 shadow-[0_16px_46px_rgba(13,35,77,0.07)] sm:p-8">
        <div className="border-b border-[color:var(--border-soft)] pb-4">
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[color:var(--accent)]">Channels</p>
          <h2 className="mt-2 text-[1.45rem] font-black text-[color:var(--ink)]">بيانات التواصل</h2>
        </div>

        <p className="text-[1.02rem] leading-9 text-zinc-700">
          لأي استفسارات تحريرية أو تقنية، يمكنكم التواصل عبر القنوات الرسمية المرتبطة في
          ترويسة وتذييل الموقع. سيتم إضافة نموذج تواصل مباشر في المرحلة التالية من التحويل.
        </p>

        <ul className="grid gap-3 text-sm text-zinc-700 sm:grid-cols-2">
          <li className="rounded-sm border border-[color:var(--border-soft)] bg-[color:var(--panel)] px-4 py-3">
            البريد التحريري: editorial@akhbaralyawm.com
          </li>
          <li className="rounded-sm border border-[color:var(--border-soft)] bg-[color:var(--panel)] px-4 py-3">
            الدعم التقني: tech@akhbaralyawm.com
          </li>
          <li className="rounded-sm border border-[color:var(--border-soft)] bg-[color:var(--panel)] px-4 py-3 sm:col-span-2">
            منصات التواصل: Facebook, X, Instagram, YouTube
          </li>
        </ul>
      </section>
      </div>
      <PageSidebar mostRead={mostRead} />
      </div>
    </main>
  );
}