// Mimic (v2) layout — loads the scoped legacy stylesheets (Bootstrap RTL +
// the original akhbaralyawm style.css/responsive.css/rtl.css) which have all
// been prefixed with `.mimic-root` by scripts/build-mimic-legacy-css.mjs so
// they cannot leak into the rest of the site.
import "@/src/components/mimic/legacy/index.css";
import "@/src/components/mimic/mimic.css";

export default function MimicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mimic-root">
      {/* The legacy snapshot loads Noto Kufi Arabic from Google Fonts (not the
          next/font subset bundled with the rest of the site). Pixel-parity
          measurements showed the next/font Noto produced glyph widths ~10%
          wider than the Google CDN version, which broke nav-link wrap counts
          and header heights. React 19 hoists these <link> tags into <head>. */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@100;200;300;400;500;600;700;800;900&display=swap"
      />
      {/* Legacy also loads Cairo (and Kanit) at runtime via a second Google
          Fonts request — and since the legacy CSS declares `font-family: Cairo`
          everywhere, that's the font actually used for headlines/nav. Loading
          it here matches the legacy text metrics exactly. */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Cairo:wght@200..1000&family=Kanit:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
      />
      {children}
    </div>
  );
}

