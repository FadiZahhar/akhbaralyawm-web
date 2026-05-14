// Mimic (v2) layout — loads the scoped legacy stylesheets (Bootstrap RTL +
// the original akhbaralyawm style.css/responsive.css/rtl.css) which have all
// been prefixed with `.mimic-root` by scripts/build-mimic-legacy-css.mjs so
// they cannot leak into the rest of the site.
import "@/src/components/mimic/legacy/index.css";
import "@/src/components/mimic/mimic.css";

export default function MimicLayout({ children }: { children: React.ReactNode }) {
  return <div className="mimic-root">{children}</div>;
}
