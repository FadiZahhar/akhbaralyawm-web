"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function RouteProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const prevPath = useRef(pathname + searchParams.toString());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startProgress = useCallback(() => {
    setVisible(true);
    setProgress(15);

    // Simulate loading progress
    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 90;
        }
        return prev + Math.random() * 12;
      });
    }, 200);
  }, []);

  const completeProgress = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setProgress(100);
    setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 300);
  }, []);

  useEffect(() => {
    const current = pathname + searchParams.toString();
    if (prevPath.current !== current) {
      completeProgress();
      prevPath.current = current;
    }
  }, [pathname, searchParams, completeProgress]);

  // Listen to click events on internal links to start progress
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const anchor = (e.target as HTMLElement)?.closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("http") || href.startsWith("#") || href.startsWith("mailto:")) return;
      // Internal navigation detected
      startProgress();
    }

    document.addEventListener("click", handleClick, { capture: true });
    return () => document.removeEventListener("click", handleClick, { capture: true });
  }, [startProgress]);

  if (!visible) return null;

  return (
    <div
      className="route-progress-bar"
      role="progressbar"
      aria-valuenow={Math.round(progress)}
    >
      <div
        className="route-progress-fill"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
