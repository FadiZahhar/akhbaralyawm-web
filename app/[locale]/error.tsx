"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { Locale } from "@/src/lib/i18n";

const locales = ["ar", "en", "fr"] as const;

const messages: Record<Locale, { serverError: string; retry: string; home: string }> = {
  ar: { serverError: "حدث خطأ في الخادم، يرجى المحاولة لاحقاً.", retry: "إعادة المحاولة", home: "الرئيسية" },
  en: { serverError: "A server error occurred. Please try again later.", retry: "Retry", home: "Home" },
  fr: { serverError: "Une erreur serveur s'est produite. Veuillez réessayer plus tard.", retry: "Réessayer", home: "Accueil" },
};

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ reset }: ErrorProps) {
  const pathname = usePathname();
  const segment = pathname.split("/")[1] as Locale | undefined;
  const locale: Locale = segment && locales.includes(segment as Locale) ? (segment as Locale) : "ar";
  const t = messages[locale];

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-6 px-4 py-16 text-center sm:px-6">
      <h1 className="text-[2.5rem] font-black text-[color:var(--ink)]">500</h1>
      <p className="text-lg text-zinc-600">
        {t.serverError}
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-sm border border-[color:var(--accent)] bg-white px-6 py-3 text-sm font-extrabold text-[color:var(--accent-strong)] transition hover:bg-[color:var(--panel)]"
        >
          {t.retry}
        </button>
        <Link
          href={`/${locale}`}
          className="rounded-sm border border-[color:var(--border-soft)] bg-white px-6 py-3 text-sm font-extrabold text-[color:var(--ink)] transition hover:bg-[color:var(--panel)]"
        >
          {t.home}
        </Link>
      </div>
    </main>
  );
}
