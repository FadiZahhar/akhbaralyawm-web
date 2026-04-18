"use client";

import { SocialIcon } from "@/src/components/social-icons";

type SocialShareProps = {
  url: string;
  title: string;
  dict: {
    share: string;
    copyLink: string;
    copied: string;
  };
};

export function SocialShare({ url, title, dict }: SocialShareProps) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const channels = [
    {
      platform: "facebook" as const,
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      platform: "x" as const,
      label: "X",
      href: `https://x.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      platform: "whatsapp" as const,
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    },
  ];

  function handleCopy() {
    navigator.clipboard.writeText(url).then(() => {
      const btn = document.getElementById("copy-link-btn");
      if (btn) {
        btn.textContent = dict.copied;
        setTimeout(() => {
          btn.textContent = dict.copyLink;
        }, 2000);
      }
    });
  }

  return (
    <div className="flex flex-row-reverse flex-wrap items-center gap-3">
      <span className="text-sm font-semibold text-[#8A8A8A]">{dict.share}</span>
      {channels.map((ch) => (
        <a
          key={ch.platform}
          href={ch.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={ch.label}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#142963] transition hover:bg-[#2FA14B]"
        >
          <SocialIcon platform={ch.platform} className="h-5 w-5 fill-white" />
        </a>
      ))}
      <button
        type="button"
        id="copy-link-btn"
        onClick={handleCopy}
        className="inline-flex h-10 items-center gap-1.5 rounded-full border border-[#DCDCDC] bg-white px-4 text-xs font-semibold text-[#142963] transition hover:border-[#2FA14B] hover:text-[#2FA14B]"
      >
        {dict.copyLink}
      </button>
    </div>
  );
}
