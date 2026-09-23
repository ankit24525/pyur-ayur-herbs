"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, ShieldCheck, ChevronLeft, ChevronRight } from "lucide-react";

export interface BannerItem {
  id?: string;
  name?: string;
  title?: string;
  subtitle?: string;
  image?: string;
  link?: string;
  ctaText?: string;
  placement?: string;
  status?: string;
}

interface MarketingBannerStripProps {
  banners?: BannerItem[];
  placement?: string;
}

const FALLBACK_BANNER: BannerItem = {
  id: "ban_1",
  name: "100% Certified Ayurvedic Formulations for Peak Vitality & Daily Wellness",
  title: "100% Certified Ayurvedic Formulations for Peak Vitality & Daily Wellness",
  subtitle: "Formulated by certified Ayurvedic Vaidyas with pure botanical extracts. Backed by gold-grade AYUSH & GMP certified manufacturing.",
  image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1400&q=80",
  link: "/products/virja-powder",
  ctaText: "Explore Pure Formulations",
  placement: "Homepage Middle Strip",
  status: "Active",
};

export default function MarketingBannerStrip({
  banners = [],
  placement = "Homepage Middle Strip",
}: MarketingBannerStripProps) {
  const [liveBanners, setLiveBanners] = useState<BannerItem[]>(() => {
    if (Array.isArray(banners) && banners.length > 0) return banners;
    return [];
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const autoRotateTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync with incoming parent prop
  useEffect(() => {
    if (Array.isArray(banners)) {
      setLiveBanners(banners);
    }
  }, [banners]);

  // Real-time synchronization listeners for 0ms cross-tab & local updates
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleLiveSync = (e: any) => {
      if (e?.detail?.key === "marketing" && Array.isArray(e?.detail?.value?.banners)) {
        setLiveBanners(e.detail.value.banners);
      }
    };

    window.addEventListener("pyur_storefront_updated", handleLiveSync);

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel("pyur_storefront_sync");
      channel.onmessage = (event) => {
        if (event?.data?.type === "SYNC" && event.data.key === "marketing" && Array.isArray(event.data.value?.banners)) {
          setLiveBanners(event.data.value.banners);
        }
      };
    } catch {}

    return () => {
      window.removeEventListener("pyur_storefront_updated", handleLiveSync);
      if (channel) {
        try {
          channel.close();
        } catch {}
      }
    };
  }, []);

  // Filter active banners matching placement
  const displayList = useMemo(() => {
    const list = liveBanners && liveBanners.length > 0 ? liveBanners : banners;
    const active = list.filter((b) => b && (b.status === "Active" || !b.status));

    if (placement && placement !== "all") {
      const target = placement.toLowerCase();
      const matched = active.filter((b) => {
        const p = (b.placement || "").toLowerCase();
        if (target.includes("middle") || target.includes("homepage")) {
          return p.includes("middle") || p.includes("homepage") || p.includes("strip") || p === "all";
        }
        if (target.includes("consult")) {
          return p.includes("consult") || p === "all";
        }
        return p.includes(target) || p === "all";
      });

      if (matched.length > 0) {
        return matched;
      }

      // If specific non-homepage placement requested and no banner configured, return empty
      if (target.includes("consult") || target.includes("drawer")) {
        return [];
      }
    }

    if (active.length > 0) return active;
    // Only show fallback on middle homepage strip
    if (placement.toLowerCase().includes("middle") || placement.toLowerCase().includes("homepage")) {
      return [FALLBACK_BANNER];
    }
    return [];
  }, [liveBanners, banners, placement]);

  // Auto-rotation when multiple banners are active
  useEffect(() => {
    if (displayList.length <= 1 || isPaused) {
      if (autoRotateTimerRef.current) clearInterval(autoRotateTimerRef.current);
      return;
    }

    autoRotateTimerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayList.length);
    }, 7000);

    return () => {
      if (autoRotateTimerRef.current) clearInterval(autoRotateTimerRef.current);
    };
  }, [displayList.length, isPaused]);

  if (displayList.length === 0) return null;

  const safeIndex = currentIndex % displayList.length;
  const activeBanner = displayList[safeIndex] || displayList[0];

  const bannerTitle = (activeBanner.title || activeBanner.name || "100% Certified Ayurvedic Formulations").trim();
  const bannerSubtitle = (activeBanner.subtitle || "").trim();
  const targetLink = activeBanner.link?.trim() || "#shop";
  const ctaText = activeBanner.ctaText?.trim() || "Explore Pure Formulations";
  const displayImage =
    activeBanner.image?.trim() ||
    "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1400&q=80";

  return (
    <section
      id={placement && placement.toLowerCase().includes("consult") ? "marketing-banner-consultation" : "marketing-banner"}
      className="mx-auto max-w-[1440px] px-4 py-6 md:py-8 scroll-mt-20"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#152e1d] via-[#244f31] to-[#2d5f3d] text-white shadow-xl transition-all">
        {/* Subtle decorative botanical pattern blobs */}
        <div className="pointer-events-none absolute -right-20 -top-20 size-80 rounded-full bg-[#80a03c]/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 -bottom-20 size-80 rounded-full bg-[#f2c94c]/15 blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 p-6 sm:p-8 md:p-10">
          {/* Text Content */}
          <div className="max-w-2xl text-center md:text-left flex-1">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#f2c94c] backdrop-blur-sm mb-3">
              <Sparkles className="size-3.5" />
              <span>Special Herbal Promotion</span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white leading-tight">
              {bannerTitle}
            </h2>

            {bannerSubtitle && (
              <p className="mt-3 text-xs sm:text-sm md:text-base text-[#ddddd9] leading-relaxed max-w-xl">
                {bannerSubtitle}
              </p>
            )}

            <div className="mt-6 flex flex-wrap items-center justify-center md:justify-start gap-4">
              <Link
                href={targetLink}
                className="inline-flex items-center gap-2 rounded-xl bg-[#f2c94c] px-6 py-3.5 text-xs font-black uppercase tracking-wider text-[#17231b] shadow-lg transition-all hover:bg-[#ffe066] hover:scale-105 active:scale-95 cursor-pointer"
              >
                <span>{ctaText}</span>
                <ArrowRight className="size-4 text-[#17231b]" />
              </Link>

              <div className="inline-flex items-center gap-1.5 text-xs text-white/80 font-medium">
                <ShieldCheck className="size-4 text-[#80a03c]" />
                <span>100% AYUSH & GMP Certified</span>
              </div>
            </div>
          </div>

          {/* Banner Hero Graphic */}
          {displayImage && (
            <div className="w-full md:w-5/12 max-w-sm shrink-0">
              <div className="relative aspect-4/3 sm:aspect-16/10 w-full overflow-hidden rounded-2xl border-2 border-white/20 shadow-2xl">
                <img
                  src={displayImage}
                  alt={bannerTitle}
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
              </div>
            </div>
          )}
        </div>

        {/* Multi-banner navigation dots & arrow controls if more than 1 banner */}
        {displayList.length > 1 && (
          <div className="relative z-10 flex items-center justify-between px-6 pb-4 pt-1 border-t border-white/10">
            <div className="flex items-center gap-1.5">
              {displayList.map((b, idx) => (
                <button
                  key={b.id || idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === safeIndex ? "w-6 bg-[#f2c94c]" : "w-2 bg-white/40 hover:bg-white/70"
                  }`}
                  aria-label={`Show banner ${idx + 1}`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentIndex((prev) => (prev - 1 + displayList.length) % displayList.length)}
                className="size-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer"
                aria-label="Previous banner"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentIndex((prev) => (prev + 1) % displayList.length)}
                className="size-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer"
                aria-label="Next banner"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
