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
                <SocialIcon platform={link.platform} className="h-4 w-4 fill-current" />
              </a>
            ))}
          </div>
        </section>

        {/* Column 2: App download badges */}
        <section className="space-y-5 border-b border-white/10 pb-6 lg:border-b-0 lg:border-e lg:pb-0 lg:pe-6">
          <h2 className="text-base font-bold text-white">{dict.appsAndCommunity}</h2>
          <p className="text-sm leading-7 text-[#CCCCCC]">{dict.appsDescription}</p>
          <a
            href="https://play.google.com/store/apps/details?id=com.akhbaralyawm.ios"
            target="_blank"
            rel="noreferrer noopener"
            aria-label={`${dict.androidApp} / ${dict.iphoneApp}`}
            className="block"
          >
            <Image
              src="/assets/img/app.png"
              alt={`${dict.androidApp} / ${dict.iphoneApp}`}
              width={200}
              height={168}
              className="h-auto w-[200px]"
            />
          </a>
        </section>

        {/* Column 3: WhatsApp group */}
        <section className="space-y-5">
          <h2 className="text-base font-bold text-white">{dict.whatsappGroup}</h2>
          <a
            href="https://chat.whatsapp.com/FOKLu6Psx3R4erpuDjDZIF"
            target="_blank"
            rel="noreferrer noopener"
            aria-label="WhatsApp"
            className="block"
          >
            <Image
              src="/assets/img/whatsapp.png"
              alt="WhatsApp"
              width={200}
              height={80}
              className="h-auto w-[200px]"
            />
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