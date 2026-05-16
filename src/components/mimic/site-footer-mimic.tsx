// Iteration 1 footer: verbatim port of the legacy `<footer class="footer-area">`
// markup from public/legacy-snapshot/home-ar/index.html. Class names, element
// order, image dimensions, and inline styles are preserved so the scoped
// legacy CSS paints it identically to the snapshot.
//
// Image sources mirror legacy paths (/assets/icons/N.png, /assets/img/app.png,
// /assets/img/whatsapp.png); the matching files have been copied into
// public/assets so they resolve locally with identical bytes.

import Link from "next/link";

import type { Locale } from "@/src/lib/i18n";

type FooterDict = {
  followUs?: string;
  copyright?: string;
};

type NavDict = {
  about: string;
  contact: string;
  home: string;
};

type Props = {
  locale: Locale;
  dict?: FooterDict;
  navDict: NavDict;
  siteName: string;
};

const SOCIAL = [
  { href: "https://www.facebook.com/akhbaralyawm78/", label: "Facebook", image: "/assets/icons/1.png" },
  { href: "https://twitter.com/akhbaralyawm", label: "Twitter", image: "/assets/icons/2.png" },
  { href: "https://www.instagram.com/akhbaralyawmleb/", label: "Instagram", image: "/assets/icons/3.png" },
  {
    href: "https://www.youtube.com/channel/UCKbs9xURKdoJ3I99QqFygdQ?sub_confirmation=1",
    label: "YouTube",
    image: "/assets/icons/4.png",
  },
  { href: "https://nabd.com/akhbaralyawm", label: "Nabd", image: "/assets/icons/5.png" },
  { href: "https://www.tiktok.com/@akhbaralyawm.com", label: "TikTok", image: "/assets/icons/6.png" },
  { href: "https://www.threads.net/@akhbaralyawmleb", label: "Threads", image: "/assets/icons/7.png" },
];

export function SiteFooterMimic({ locale, dict, navDict, siteName }: Props) {
  const followLabel =
    dict?.followUs ??
    (locale === "ar" ? "تواصلوا معنا عبر" : locale === "fr" ? "Suivez-nous via" : "Connect with us via");
  const appsLabel =
    locale === "ar" ? "حمل تطبيقات الهاتف المحمول" : locale === "fr" ? "Applications mobiles" : "Mobile apps";
  const whatsappLabel =
    locale === "ar"
      ? "انضم إلى مجموعة الواتساب"
      : locale === "fr"
        ? "Rejoindre le groupe WhatsApp"
        : "Join the WhatsApp group";
  const copyright =
    dict?.copyright ??
    (locale === "ar"
      ? `${siteName} جميع الحقوق محفوظة`
      : locale === "fr"
        ? `${siteName} Tous droits réservés`
        : `${siteName} All rights reserved`);

  return (
    <footer className="footer-area">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-4 col-md-6">
            <div className="single-footer-widget">
              <h3>{followLabel}</h3>
              <div className="connect-social">
                <ul>
                  {SOCIAL.map(({ href, label, image }) => (
                    <li key={label}>
                      <a target="_blank" rel="noopener noreferrer" href={href} aria-label={label}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={image}
                          style={{ padding: "0 7px", marginTop: "-3px" }}
                          width={35}
                          alt={label}
                        />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="col-lg-4 col-md-6">
            <div className="single-footer-widget">
              <h3>{appsLabel}</h3>
              <div className="footer-latest-news-list">
                <div className="media latest-news-media align-items-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/assets/img/app.png"
                    useMap="#image-map"
                    style={{ maxWidth: "200px" }}
                    width={200}
                    alt="Akhbar Al Youm apps"
                  />
                  <map name="image-map">
                    <area
                      href="https://play.google.com/store/apps/details?id=com.akhbaralyawm.ios"
                      shape="rect"
                      coords="195,7,1,75"
                      alt="Google Play"
                    />
                    <area
                      href="https://apps.apple.com/us/app/akhbar-al-yawm-news/id1578481588"
                      shape="rect"
                      coords="5,94,196,168,196,164,196,166"
                      alt="App Store"
                    />
                  </map>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4 col-md-6">
            <div className="single-footer-widget">
              <h3>{whatsappLabel}</h3>
              <div className="footer-latest-news-list">
                <div className="media latest-news-media align-items-center">
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://chat.whatsapp.com/FOKLu6Psx3R4erpuDjDZIF"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/assets/img/whatsapp.png" alt="WhatsApp" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="copyright-area">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 col-md-12">
              <p>{copyright}</p>
            </div>

            <div className="col-lg-6 col-md-12">
              <ul className="footer-nav">
                <li>
                  <Link href={`/${locale}/about`}>{navDict.about}</Link>
                </li>
                <li>
                  <Link href={`/${locale}/v2`}>I</Link>
                </li>
                <li>
                  <Link href={`/${locale}/contact`}>{navDict.contact}</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
