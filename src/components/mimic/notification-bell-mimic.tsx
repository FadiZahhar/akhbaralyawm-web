"use client";

// Notification bell — subscribes/unsubscribes to web push via OneSignal v16.
//
// Reads NEXT_PUBLIC_ONESIGNAL_APP_ID at build time. When the env var is empty
// we render a disabled placeholder (so the footer still looks right in dev).
// The OneSignal page SDK is loaded on demand from CDN; the service worker
// file at /OneSignalSDKWorker.js (in public/) handles incoming pushes.
//
// Bell states (icon-only):
//   - off (default)       → outline bell, click prompts subscribe
//   - on (subscribed)     → filled bell, click unsubscribes
//   - denied              → muted bell + disabled (browser blocked prompt)
//   - unavailable         → muted bell + disabled (no App ID configured)

import { useEffect, useState } from "react";

const SDK_URL = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js";
const APP_ID = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID ?? "";

declare global {
  interface Window {
    OneSignal?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    OneSignalDeferred?: Array<(os: any) => void>; // eslint-disable-line @typescript-eslint/no-explicit-any
  }
}

type State = "loading" | "off" | "on" | "denied" | "unavailable";

type Props = {
  /** Visually-hidden label for a11y (localised) */
  ariaLabel: string;
};

function loadSdk() {
  if (typeof document === "undefined") return;
  if (document.querySelector(`script[src="${SDK_URL}"]`)) return;
  const s = document.createElement("script");
  s.src = SDK_URL;
  s.async = true;
  s.defer = true;
  document.head.appendChild(s);
}

export function NotificationBellMimic({ ariaLabel }: Props) {
  const [state, setState] = useState<State>("loading");

  useEffect(() => {
    if (!APP_ID) {
      setState("unavailable");
      return;
    }
    if (typeof window === "undefined") return;

    loadSdk();
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async (OneSignal) => {
      try {
        await OneSignal.init({
          appId: APP_ID,
          serviceWorkerPath: "/OneSignalSDKWorker.js",
          allowLocalhostAsSecureOrigin: true,
        });
        const subscribed = OneSignal.User?.PushSubscription?.optedIn ?? false;
        const perm = OneSignal.Notifications?.permission ?? false;
        if (perm === "denied") {
          setState("denied");
        } else {
          setState(subscribed ? "on" : "off");
        }
        OneSignal.User?.PushSubscription?.addEventListener?.("change", (ev: { current: { optedIn: boolean } }) => {
          setState(ev.current.optedIn ? "on" : "off");
        });
      } catch {
        setState("unavailable");
      }
    });
  }, []);

  async function handleClick() {
    if (state === "loading" || state === "denied" || state === "unavailable") return;
    const OS = window.OneSignal;
    if (!OS) return;
    try {
      if (state === "off") {
        await OS.Notifications.requestPermission();
        const subscribed = OS.User?.PushSubscription?.optedIn ?? false;
        const perm = OS.Notifications?.permission;
        if (perm === "denied") setState("denied");
        else setState(subscribed ? "on" : "off");
      } else if (state === "on") {
        await OS.User.PushSubscription.optOut();
        setState("off");
      }
    } catch {
      /* ignore */
    }
  }

  const disabled = state === "loading" || state === "denied" || state === "unavailable";
  const iconClass =
    state === "on"
      ? "icofont-notification"
      : state === "denied"
        ? "icofont-bell-alt"
        : "icofont-bell";

  return (
    <button
      type="button"
      className={`mimic-notify-bell mimic-notify-bell--${state}`}
      onClick={handleClick}
      aria-label={ariaLabel}
      aria-pressed={state === "on"}
      disabled={disabled}
      title={ariaLabel}
    >
      <i className={iconClass} aria-hidden="true" />
    </button>
  );
}
