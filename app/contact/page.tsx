import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "اتصل بنا",
  description: "طرق التواصل مع فريق أخبار اليوم.",
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <header className="space-y-3 border-b border-[color:var(--border-soft)] pb-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--accent)]">Contact</p>
        <h1 className="text-3xl font-extrabold text-[color:var(--ink)]">اتصل بنا</h1>
      </header>

      <section className="rounded-[1.75rem] border border-[color:var(--border-soft)] bg-white p-6 leading-8 text-zinc-700 shadow-[0_16px_50px_rgba(13,35,77,0.08)] sm:p-8">
        <p>
          لأي استفسارات تحريرية أو تقنية، يمكنكم التواصل عبر القنوات الرسمية المرتبطة في
          ترويسة وتذييل الموقع. سيتم إضافة نموذج تواصل مباشر في المرحلة التالية من التحويل.
        </p>
        <ul className="mt-5 space-y-2 text-sm">
          <li>البريد التحريري: editorial@akhbaralyawm.com</li>
          <li>الدعم التقني: tech@akhbaralyawm.com</li>
          <li>منصات التواصل: Facebook, X, Instagram, YouTube</li>
        </ul>
      </section>
    </main>
  );
}