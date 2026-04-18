/**
 * Banner silhouette fallback component
 * Inspired by the akhbaralyawm logo (geometric "L" shape)
 * Renders when banner images fail to load
 */
export function BannerSilhouetteFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#142963] to-[#0C1E4B]">
      <svg
        viewBox="0 0 300 300"
        className="h-32 w-32 text-[#2FA14B]"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Logo-inspired "L" silhouette */}
        <defs>
          <linearGradient id="silhouetteFade" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="currentColor" stopOpacity="0.9" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0.5" />
          </linearGradient>
        </defs>

        {/* Main vertical stroke of "L" */}
        <rect x="70" y="40" width="35" height="180" rx="8" fill="url(#silhouetteFade)" />

        {/* Horizontal stroke of "L" */}
        <rect x="70" y="195" width="120" height="35" rx="8" fill="url(#silhouetteFade)" />

        {/* Small accent square (inspired by green corner) */}
        <rect x="210" y="215" width="30" height="30" rx="6" fill="#2FA14B" fillOpacity="0.8" />
      </svg>
    </div>
  );
}
