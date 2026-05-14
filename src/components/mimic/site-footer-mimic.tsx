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

const LEGACY_ASSET_BASE = "/%D8%A7%D9%84%D9%8A%D9%88%D9%85_files";

const SOCIAL = [
  { href: "https://www.facebook.com/akhbaralyawm78/", label: "Facebook", image: `${LEGACY_ASSET_BASE}/1.png` },
  { href: "https://twitter.com/akhbaralyawm", label: "Twitter", image: `${LEGACY_ASSET_BASE}/2.png` },
  { href: "https://www.instagram.com/akhbaralyawmleb/", label: "Instagram", image: `${LEGACY_ASSET_BASE}/3.png` },
  { href: "https://www.youtube.com/channel/UCKbs9xURKdoJ3I99QqFygdQ?sub_confirmation=1", label: "YouTube", image: `${LEGACY_ASSET_BASE}/4.png` },
  { href: "https://nabd.com/akhbaralyawm", label: "Nabd", image: `${LEGACY_ASSET_BASE}/5.png` },
  { href: "https://www.tiktok.com/@akhbaralyawm.com", label: "TikTok", image: `${LEGACY_ASSET_BASE}/6.png` },
  { href: "https://www.threads.net/@akhbaralyawmleb", label: "Threads", image: `${LEGACY_ASSET_BASE}/7.png` },
];

export function SiteFooterMimic({ locale, dict, navDict, siteName }: Props) {
  const followLabel = dict?.followUs ?? (locale === "ar" ? "تواصلوا معنا عبر" : locale === "fr" ? "Suivez-nous via" : "Connect with us via");
  const appsLabel = locale === "ar" ? "حمل تطبيقات الهاتف المحمول" : locale === "fr" ? "Applications mobiles" : "Mobile apps";
  const whatsappLabel = locale === "ar" ? "انضم إلى مجموعة الواتساب" : locale === "fr" ? "Rejoindre le groupe WhatsApp" : "Join the WhatsApp group";
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
                      <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
                        <img src={image} alt={label} width="35" style={{ padding: "0 7px", marginTop: "-3px" }} />
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
                  <img
                    src={`${LEGACY_ASSET_BASE}/app.png`}
                    useMap="#footer-app-map"
                    style={{ maxWidth: "200px" }}
                    width="200"
                    alt="Akhbar Al Youm apps"
                  />
                  <map name="footer-app-map">
                    <area href="https://play.google.com/store/apps/details?id=com.akhbaralyawm.ios" shape="rect" coords="195,7,1,75" alt="Google Play" />
                    <area href="https://apps.apple.com/us/app/akhbar-al-yawm-news/id1578481588" shape="rect" coords="5,94,196,168" alt="App Store" />
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
                  <a target="_blank" rel="noopener noreferrer" href="https://chat.whatsapp.com/FOKLu6Psx3R4erpuDjDZIF">
                    <img src={`${LEGACY_ASSET_BASE}/whatsapp.png`} alt="WhatsApp" />
                  </a>
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
      </div>
    </footer>
  );
}
