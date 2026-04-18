/**
 * Generates an inline SVG shimmer placeholder for next/image blur-up effect.
 * Returns a base64-encoded data URL suitable for the `blurDataURL` prop.
 */

const shimmerSvg = (w: number, h: number) => `
<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#e2e5ec" offset="20%" />
      <stop stop-color="#f0f2f5" offset="50%" />
      <stop stop-color="#e2e5ec" offset="80%" />
    </linearGradient>
    <clipPath id="r"><rect width="${w}" height="${h}" rx="8" /></clipPath>
  </defs>
  <rect width="${w}" height="${h}" clip-path="url(#r)" fill="#e2e5ec" />
  <rect id="s" width="${w}" height="${h}" clip-path="url(#r)" fill="url(#g)" />
  <animate xlink:href="#s" attributeName="x" from="-${w}" to="${w}" dur="1.2s" repeatCount="indefinite" />
</svg>`;

function toBase64(str: string): string {
  if (typeof window === "undefined") {
    return Buffer.from(str).toString("base64");
  }
  return window.btoa(str);
}

export function shimmerPlaceholder(w = 700, h = 400): string {
  return `data:image/svg+xml;base64,${toBase64(shimmerSvg(w, h))}`;
}
