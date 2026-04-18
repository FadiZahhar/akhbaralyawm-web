import Image from "next/image";
import Link from "next/link";

import type { Locale } from "@/src/lib/i18n";
import { SOCIAL_LINKS, SocialIcon } from "@/src/components/social-icons";

type SiteFooterProps = {
  locale?: Locale;
  dict: {
    brand: string;
    brandDescription: string;
    quickLinks: string;
    appsAndCommunity: string;
    appsDescription: string;
    iphoneApp: string;
    androidApp: string;
    whatsappGroup: string;
    allRights: string;
  };
  navDict: {
    about: string;
    contact: string;
    mix: string;
    search: string;
  };
};

export function SiteFooter({ locale = "ar" as Locale, dict, navDict }: SiteFooterProps) {
  return (
    <footer className="mt-16 bg-[#142963] text-white">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-3 lg:px-8">
        {/* Column 1: Social media icons */}
        <section className="space-y-5 border-b border-white/10 pb-6 lg:border-b-0 lg:border-e lg:pb-0 lg:pe-6">
          <h2 className="text-base font-bold text-white">{dict.brand}</h2>
          <div className="flex flex-wrap gap-2.5">
            {SOCIAL_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                aria-label={link.label}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-[#CCCCCC] transition hover:bg-[#2FA14B] hover:text-white"
              >
                <SocialIcon platform={link.platform} className="h-4 w-4" />
              </a>
            ))}
          </div>
        </section>

        {/* Column 2: App download badges */}
        <section className="space-y-5 border-b border-white/10 pb-6 lg:border-b-0 lg:border-e lg:pb-0 lg:pe-6">
          <h2 className="text-base font-bold text-white">{dict.appsAndCommunity}</h2>
          <p className="text-sm leading-7 text-[#CCCCCC]">{dict.appsDescription}</p>
          <div className="flex flex-wrap gap-3">
            <a
              href="https://play.google.com/store/apps/details?id=com.akhbaralyawm.ios"
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/20 px-3 text-sm font-semibold text-[#CCCCCC] transition hover:border-white/40 hover:text-white"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-1.004l2.834 1.64a1 1 0 010 1.732l-2.834 1.64-2.54-2.54 2.54-2.472zM5.864 3.458l10.937 6.333-2.302 2.302-8.635-8.635z"/></svg>
              {dict.androidApp}
            </a>
            <a
              href="https://apps.apple.com/us/app/akhbar-al-yawm-news/id1578481588"
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/20 px-3 text-sm font-semibold text-[#CCCCCC] transition hover:border-white/40 hover:text-white"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
              {dict.iphoneApp}
            </a>
          </div>
        </section>

        {/* Column 3: WhatsApp group */}
        <section className="space-y-5">
          <h2 className="text-base font-bold text-white">{dict.whatsappGroup}</h2>
          <a
            href="https://chat.whatsapp.com/FOKLu6Psx3R4erpuDjDZIF"
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#1da851]"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            WhatsApp
          </a>
          <div className="mt-4 grid gap-2.5 text-sm text-[#CCCCCC]">
            <Link href={`/${locale}/about`} className="font-semibold transition hover:text-white">
              {navDict.about}
            </Link>
            <Link href={`/${locale}/contact`} className="font-semibold transition hover:text-white">
              {navDict.contact}
            </Link>
          </div>
        </section>
      </div>

      {/* Copyright bar — legacy dark navy */}
      <div className="bg-[#0B1D4E]">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-5 text-sm text-[#CCCCCC] sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <p className="font-semibold">{dict.allRights}</p>
          <ul className="flex items-center gap-3 font-semibold">
            <li>
              <Link href={`/${locale}/about`} className="transition hover:text-white">
                {navDict.about}
              </Link>
            </li>
            <li aria-hidden="true" className="text-white/30">|</li>
            <li>
              <Link href={`/${locale}/contact`} className="transition hover:text-white">
                {navDict.contact}
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}