import Link from "next/link";
import { headers } from "next/headers";

import { isLocale, getDictionary, type Locale } from "@/src/lib/i18n";

export default async function RootNotFound() {
  const headerStore = await headers();
  const rawLocale = headerStore.get("x-locale") ?? "ar";
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "ar";
  const dict = await getDictionary(locale);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-6 px-4 py-16 text-center sm:px-6">
      <h1 className="text-[2.5rem] font-black text-[color:var(--ink)]">404</h1>
      <p className="text-lg text-zinc-600">{dict.common.notFound}</p>
      <Link
        href={`/${locale}`}
        className="rounded-sm border border-[color:var(--accent)] bg-white px-6 py-3 text-sm font-extrabold text-[color:var(--accent-strong)] transition hover:bg-[color:var(--panel)]"
      >
        {dict.nav.home}
      </Link>
    </main>
  );
}
