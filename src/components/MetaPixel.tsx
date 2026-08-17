"use client";

import { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

const PIXEL_ID = "123456789012345";

export function trackMetaEvent(eventName: string, customData?: Record<string, any>) {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", eventName, customData);
    console.log(`[Meta Pixel Client Trigger]: ${eventName}`, customData);
  }

  fetch("/api/events-sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      eventName,
      url: typeof window !== "undefined" ? window.location.href : "",
      clientData: customData,
    }),
  }).catch((e) => {
    // Use warn instead of error to prevent console/Next.js overlay from popping up on ad-blocker triggers
    console.warn(`[Meta CAPI] Event dispatch deferred/blocked for ${eventName}:`, e.message || e);
  });
}

function PixelTrackerInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    trackMetaEvent("PageView");
  }, [pathname, searchParams]);

  return null;
}

export default function MetaPixel() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!window.fbq) {
      const n = (window.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      }) as any;
      if (!window._fbq) window._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = "2.0";
      n.queue = [];

      const t = document.createElement("script");
      t.async = !0;
      t.src = "https://connect.facebook.net/en_US/fbevents.js";
      const s = document.getElementsByTagName("script")[0];
      s?.parentNode?.insertBefore(t, s);
    }

    window.fbq("init", PIXEL_ID);
  }, []);

  return (
    <Suspense fallback={null}>
      <PixelTrackerInner />
    </Suspense>
  );
}
