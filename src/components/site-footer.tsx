import Link from "next/link";

const SOCIAL_LINKS = [
  { href: "https://www.facebook.com/akhbaralyawm78/", label: "Facebook" },
  { href: "https://twitter.com/akhbaralyawm", label: "X" },
  { href: "https://www.instagram.com/akhbaralyawmleb/", label: "Instagram" },
  { href: "https://www.youtube.com/channel/UCKbs9xURKdoJ3I99QqFygdQ?sub_confirmation=1", label: "YouTube" },
  { href: "https://nabd.com/akhbaralyawm", label: "Nabd" },
];

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-[color:var(--border-soft)] bg-[color:var(--ink)] text-white">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-3 lg:px-8">
        <section className="space-y-4">
          <h2 className="text-lg font-bold">أخبار اليوم</h2>
          <p className="text-sm leading-7 text-white/75">
            تجربة قراءة عربية حديثة مبنية على هيكلية Headless تضمن السرعة، الوضوح،
            والانسيابية عبر جميع الصفحات.
          </p>
          <div className="flex flex-wrap gap-2 text-sm text-white/80">
            {SOCIAL_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-white/10 px-3 py-2 transition hover:border-white/25 hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold">روابط سريعة</h2>
          <div className="grid gap-2 text-sm text-white/75">
            <Link href="/about" className="transition hover:text-white">
              من نحن
            </Link>
            <Link href="/contact" className="transition hover:text-white">
              اتصل بنا
            </Link>
            <Link href="/mix" className="transition hover:text-white">
              من كل شي
            </Link>
            <Link href="/search" className="transition hover:text-white">
              البحث
            </Link>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold">تطبيقات ومجتمع</h2>
          <p className="text-sm leading-7 text-white/75">
            تابع النشر اليومي عبر واتساب والتطبيقات والمنصات الاجتماعية الرسمية.
          </p>
          <div className="grid gap-2 text-sm text-white/75">
            <a
              href="https://apps.apple.com/us/app/akhbar-al-yawm-news/id1578481588"
              target="_blank"
              rel="noreferrer"
              className="transition hover:text-white"
            >
              تطبيق iPhone
            </a>
            <a
              href="https://play.google.com/store/apps/details?id=com.akhbaralyawm.ios"
              target="_blank"
              rel="noreferrer"
              className="transition hover:text-white"
            >
              تطبيق Android
            </a>
            <a
              href="https://chat.whatsapp.com/FOKLu6Psx3R4erpuDjDZIF"
              target="_blank"
              rel="noreferrer"
              className="transition hover:text-white"
            >
              مجموعة واتساب
            </a>
          </div>
        </section>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-4 text-sm text-white/65 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <p>أخبار اليوم. جميع الحقوق محفوظة.</p>
          <div className="flex items-center gap-3">
            <Link href="/about" className="transition hover:text-white">
              من نحن
            </Link>
            <span>/</span>
            <Link href="/contact" className="transition hover:text-white">
              اتصل بنا
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}