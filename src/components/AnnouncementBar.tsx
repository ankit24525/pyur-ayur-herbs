"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { X, Sparkles, ChevronRight } from "lucide-react";
import { getStorefrontData } from "@/lib/storefront-client";

export interface AnnouncementData {
  visible?: boolean;
  text?: string;
  code?: string;
  btnText?: string;
  link?: string;
  bgImage?: string;
  timerDuration?: string;
  [key: string]: any;
}

interface AnnouncementBarProps {
  onOpenAppModal?: () => void;
  data?: AnnouncementData;
  marketingBanners?: any[];
}

const DEFAULT_ANNOUNCEMENT: AnnouncementData = {
  visible: true,
  text: "Free Kesar Sale Ends in",
  code: "FREEKESAR",
  btnText: "Claim Gift",
  link: "/#shop",
  bgImage: "/brand/top-botanical-banner.jpg",
  timerDuration: "07:34:59",
};

export default function AnnouncementBar({
  onOpenAppModal,
  data: initialData,
  marketingBanners = [],
}: AnnouncementBarProps) {
  const [dismissed, setDismissed] = useState<boolean>(false);
  const [liveData, setLiveData] = useState<AnnouncementData | null>(null);
  const [settings, setSettings] = useState<any>(null);

  // Time units state { hours, minutes, seconds }
  const [timeUnits, setTimeUnits] = useState<{
    hours: string;
    minutes: string;
    seconds: string;
  }>({
    hours: "07",
    minutes: "34",
    seconds: "59",
  });

  // 1. Initial client-side load and live listeners
  useEffect(() => {
    // Check dismissal state in session
    if (typeof window !== "undefined") {
      try {
        const isDismissed = sessionStorage.getItem("pyur_top_banner_dismissed");
        if (isDismissed === "true") {
          setDismissed(true);
        }
      } catch {}
    }

    const refreshData = () => {
      getStorefrontData()
        .then((resp) => {
          if (!resp) return;
          if (resp.settings) setSettings(resp.settings);

          // Check for a marketing banner targeted at the top announcement header
          const activeTopBanner = resp.marketing?.banners?.find(
            (b: any) =>
              b.status === "Active" &&
              (b.placement === "Top Header Bar" ||
                b.placement === "Top Announcement Bar" ||
                b.placement === "Top Bar")
          );

          if (activeTopBanner) {
            setLiveData({
              visible: true,
              text: activeTopBanner.title || activeTopBanner.name || "Special Ayurvedic Offer Ends in",
              code: activeTopBanner.subtitle?.includes("CODE")
                ? activeTopBanner.subtitle.split("CODE:")[1]?.trim()
                : "PURE10",
              btnText: activeTopBanner.ctaText || "Claim Offer",
              link: activeTopBanner.link || "/#shop",
              bgImage: activeTopBanner.image || "/brand/top-botanical-banner.jpg",
              timerDuration: "07:34:59",
            });
          } else if (resp.content?.announcement && Object.keys(resp.content.announcement).length > 0) {
            setLiveData(resp.content.announcement);
          }
        })
        .catch(() => {});
    };

    refreshData();

    const handleUpdate = () => refreshData();
    window.addEventListener("pyur_storefront_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("pyur_storefront_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  // 2. Resolve final announcement data safely with guaranteed fallbacks
  const activeAnnouncement: AnnouncementData = useMemo(() => {
    // A. Direct banner prop priority
    const topPropBanner = (marketingBanners || []).find(
      (b: any) =>
        b.status === "Active" &&
        (b.placement === "Top Header Bar" ||
          b.placement === "Top Announcement Bar" ||
          b.placement === "Top Bar")
    );
    if (topPropBanner) {
      return {
        visible: true,
        text: topPropBanner.title || topPropBanner.name || DEFAULT_ANNOUNCEMENT.text,
        code: topPropBanner.subtitle || DEFAULT_ANNOUNCEMENT.code,
        btnText: topPropBanner.ctaText || DEFAULT_ANNOUNCEMENT.btnText,
        link: topPropBanner.link || DEFAULT_ANNOUNCEMENT.link,
        bgImage: topPropBanner.image || DEFAULT_ANNOUNCEMENT.bgImage,
        timerDuration: DEFAULT_ANNOUNCEMENT.timerDuration,
      };
    }

    // B. Live data priority
    if (liveData && Object.keys(liveData).length > 0) {
      return {
        visible: liveData.visible !== false,
        text: liveData.text || DEFAULT_ANNOUNCEMENT.text,
        code: liveData.code || DEFAULT_ANNOUNCEMENT.code,
        btnText: liveData.btnText || DEFAULT_ANNOUNCEMENT.btnText,
        link: liveData.link || DEFAULT_ANNOUNCEMENT.link,
        bgImage: liveData.bgImage || DEFAULT_ANNOUNCEMENT.bgImage,
        timerDuration: liveData.timerDuration || DEFAULT_ANNOUNCEMENT.timerDuration,
      };
    }

    // C. Initial data from SSR/parent if valid
    if (initialData && Object.keys(initialData).length > 0 && initialData.text) {
      return {
        visible: initialData.visible !== false,
        text: initialData.text,
        code: initialData.code || DEFAULT_ANNOUNCEMENT.code,
        btnText: initialData.btnText || DEFAULT_ANNOUNCEMENT.btnText,
        link: initialData.link || DEFAULT_ANNOUNCEMENT.link,
        bgImage: initialData.bgImage || DEFAULT_ANNOUNCEMENT.bgImage,
        timerDuration: initialData.timerDuration || DEFAULT_ANNOUNCEMENT.timerDuration,
      };
    }

    // D. Default Kapiva-style top banner
    return DEFAULT_ANNOUNCEMENT;
  }, [liveData, initialData, marketingBanners]);

  // 3. Real-time live countdown timer (ticking every 1 second)
  useEffect(() => {
    // Parse duration (e.g. "07:34:59" or "08:00:00")
    const durationStr =
      activeAnnouncement.timerDuration ||
      settings?.flashSaleTimer ||
      "07:34:59";

    const parts = durationStr.split(":").map((p: string) => parseInt(p, 10) || 0);
    let totalSeconds = 0;
    if (parts.length === 3) {
      totalSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
      totalSeconds = parts[0] * 60 + parts[1];
    } else {
      totalSeconds = parts[0] || 27299; // ~7h 34m 59s
    }

    // Initialize session timer start
    let sessionStart = Date.now();
    if (typeof window !== "undefined") {
      try {
        const storedStart = sessionStorage.getItem("pyur_top_timer_start");
        if (storedStart) {
          sessionStart = parseInt(storedStart, 10);
        } else {
          sessionStorage.setItem("pyur_top_timer_start", String(sessionStart));
        }
      } catch {}
    }

    const updateTimer = () => {
      const now = Date.now();
      const elapsed = Math.floor((now - sessionStart) / 1000);
      let remaining = totalSeconds - (elapsed % totalSeconds);

      if (remaining <= 0) {
        // Fallback to time until midnight if timer expired
        const midnight = new Date();
        midnight.setHours(23, 59, 59, 999);
        remaining = Math.max(0, Math.floor((midnight.getTime() - now) / 1000));
      }

      const hrs = Math.floor(remaining / 3600);
      const mins = Math.floor((remaining % 3600) / 60);
      const secs = remaining % 60;

      setTimeUnits({
        hours: String(hrs).padStart(2, "0"),
        minutes: String(mins).padStart(2, "0"),
        seconds: String(secs).padStart(2, "0"),
      });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeAnnouncement.timerDuration, settings?.flashSaleTimer]);

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setDismissed(true);
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem("pyur_top_banner_dismissed", "true");
      } catch {}
    }
  };

  if (dismissed || activeAnnouncement.visible === false) {
    return null;
  }

  const bgUrl = activeAnnouncement.bgImage || "/brand/top-botanical-banner.jpg";
  const targetLink = activeAnnouncement.link || "/#shop";

  return (
    <div
      id="top-announcement-banner"
      className="relative z-40 w-full overflow-hidden text-white shadow-sm border-b border-[#1c3d25]/30 select-none"
      style={{
        backgroundImage: `linear-gradient(to right, rgba(13, 34, 21, 0.88), rgba(16, 44, 26, 0.72), rgba(13, 34, 21, 0.88)), url('${bgUrl}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="mx-auto flex h-11 sm:h-12 max-w-[1440px] items-center justify-between px-3 sm:px-4 md:px-6">
        {/* Left Spacer for absolute center alignment on desktop */}
        <div className="hidden md:flex items-center w-8 shrink-0" />

        {/* Center: Promotional Text & Live Circular Countdown Clocks */}
        <Link
          href={targetLink}
          className="flex-1 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-center group cursor-pointer"
        >
          {/* Main Sale Text */}
          <span className="text-xs sm:text-sm font-semibold tracking-wide text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)] group-hover:text-[#e4f1c5] transition-colors">
            {activeAnnouncement.text}
          </span>

          {/* Styled Circular Countdown Badges */}
          <div className="inline-flex items-center gap-1 sm:gap-1.5 font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
            {/* Hours */}
            <div className="flex items-center gap-1">
              <span className="flex items-center justify-center size-5 sm:size-6 rounded-full bg-white text-[#d32f2f] text-[11px] sm:text-xs font-black shadow-md ring-1 ring-black/10">
                {timeUnits.hours}
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-white/95 uppercase tracking-wider">
                HH :
              </span>
            </div>

            {/* Minutes */}
            <div className="flex items-center gap-1">
              <span className="flex items-center justify-center size-5 sm:size-6 rounded-full bg-white text-[#d32f2f] text-[11px] sm:text-xs font-black shadow-md ring-1 ring-black/10">
                {timeUnits.minutes}
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-white/95 uppercase tracking-wider">
                MM :
              </span>
            </div>

            {/* Seconds */}
            <div className="flex items-center gap-1">
              <span className="flex items-center justify-center size-5 sm:size-6 rounded-full bg-white text-[#d32f2f] text-[11px] sm:text-xs font-black shadow-md ring-1 ring-black/10">
                {timeUnits.seconds}
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-white/95 uppercase tracking-wider">
                SS
              </span>
            </div>
          </div>

          {/* Optional Promo Code Badge */}
          {activeAnnouncement.code && (
            <span className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-400/90 text-[#132a18] font-mono text-[10px] font-black tracking-wider uppercase shadow-sm">
              <Sparkles className="size-3" />
              {activeAnnouncement.code}
            </span>
          )}

          {/* Optional Action CTA Link */}
          {activeAnnouncement.btnText && (
            <span className="hidden sm:inline-flex items-center gap-0.5 text-[11px] font-bold text-[#b4d47c] group-hover:text-white underline underline-offset-2 transition-colors ml-1">
              <span>{activeAnnouncement.btnText}</span>
              <ChevronRight className="size-3" />
            </span>
          )}
        </Link>

        {/* Right: Close / Dismiss Button */}
        <div className="flex items-center justify-end shrink-0 pl-2">
          <button
            onClick={handleDismiss}
            className="rounded-full p-1 text-white/70 hover:text-white hover:bg-black/20 transition-all cursor-pointer"
            aria-label="Close announcement"
            title="Dismiss announcement"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
