import Link from "next/link";

import type { Locale } from "@/src/lib/i18n";

const SOCIAL_LINKS = [
  { href: "https://www.facebook.com/akhbaralyawm78/", label: "Facebook" },
  { href: "https://twitter.com/akhbaralyawm", label: "X" },
  { href: "https://www.instagram.com/akhbaralyawmleb/", label: "Instagram" },
  { href: "https://www.youtube.com/channel/UCKbs9xURKdoJ3I99QqFygdQ?sub_confirmation=1", label: "YouTube" },
  { href: "https://nabd.com/akhbaralyawm", label: "Nabd" },
];

export function SiteFooter({ locale = "ar" as Locale }: { locale?: Locale } = {}) {
  return (
    <footer className="mt-16 border-t-2 border-[color:var(--accent)] bg-[color:var(--ink)] text-white">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-3 lg:px-8">
        <section className="space-y-4 border-b border-white/10 pb-6 lg:border-b-0 lg:border-e lg:pb-0 lg:pe-6">
          <h2 className="text-base font-black uppercase tracking-[0.14em] text-white/95">أخبار اليوم</h2>
          <p className="text-sm leading-8 text-white/90">
            تجربة قراءة عربية حديثة مبنية على هيكلية Headless تضمن السرعة، الوضوح،
            والانسيابية عبر جميع الصفحات.
          </p>
          <div className="flex flex-wrap gap-2 text-sm text-white/95">
            {SOCIAL_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="rounded-sm border border-white/15 px-3 py-1.5 font-bold transition hover:border-white/35 hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </div>
        </section>

        <section className="space-y-4 border-b border-white/10 pb-6 lg:border-b-0 lg:border-e lg:pb-0 lg:pe-6">
          <h2 className="text-base font-black uppercase tracking-[0.14em] text-white/95">روابط سريعة</h2>
          <div className="grid gap-2.5 text-sm text-white/90">
            <Link href={`/${locale}/about`} className="font-semibold transition hover:text-white">
              من نحن
            </Link>
            <Link href={`/${locale}/contact`} className="font-semibold transition hover:text-white">
              اتصل بنا
            </Link>
            <Link href={`/${locale}/mix`} className="font-semibold transition hover:text-white">
              من كل شي
            </Link>
            <Link href={`/${locale}/search`} className="font-semibold transition hover:text-white">
              البحث
            </Link>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-base font-black uppercase tracking-[0.14em] text-white/95">تطبيقات ومجتمع</h2>
          <p className="text-sm leading-8 text-white/90">
            تابع النشر اليومي عبر واتساب والتطبيقات والمنصات الاجتماعية الرسمية.
          </p>
          <div className="grid gap-2.5 text-sm text-white/90">
            <a
              href="https://apps.apple.com/us/app/akhbar-al-yawm-news/id1578481588"
              target="_blank"
              rel="noreferrer"
              className="font-semibold transition hover:text-white"
            >
              تطبيق iPhone
            </a>
            <a
              href="https://play.google.com/store/apps/details?id=com.akhbaralyawm.ios"
              target="_blank"
              rel="noreferrer"
              className="font-semibold transition hover:text-white"
            >
              تطبيق Android
            </a>
            <a
              href="https://chat.whatsapp.com/FOKLu6Psx3R4erpuDjDZIF"
              target="_blank"
              rel="noreferrer"
              className="font-semibold transition hover:text-white"
            >
              مجموعة واتساب
            </a>
          </div>
        </section>
      </div>

      <div className="border-t border-white/10 bg-black/20">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-4 text-sm text-white/90 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <p className="font-semibold">أخبار اليوم. جميع الحقوق محفوظة.</p>
          <div className="flex items-center gap-3">
            <Link href={`/${locale}/about`} className="font-semibold transition hover:text-white">
              من نحن
            </Link>
            <span>/</span>
            <Link href={`/${locale}/contact`} className="font-semibold transition hover:text-white">
              اتصل بنا
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}