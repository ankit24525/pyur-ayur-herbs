"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, ShieldCheck } from "lucide-react";

export interface BannerItem {
  id?: string;
  name: string;
  subtitle?: string;
  image?: string;
  link: string;
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
  subtitle: "Formulated by certified Ayurvedic Vaidyas with pure botanical extracts. Backed by gold-grade AYUSH & GMP certified manufacturing.",
  image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1400&q=80",
  link: "/products/virja-powder",
  ctaText: "Explore Pure Formulations",
  placement: "Homepage Middle Strip",
  status: "Active",
};

export default function MarketingBannerStrip({
  banners = [],
  placement,
}: MarketingBannerStripProps) {
  // If no banners provided or data still loading, use fallback active banner
  const bannerList = banners && banners.length > 0 ? banners : [FALLBACK_BANNER];

  // Filter by active status
  let activeBanners = bannerList.filter((b) => b.status === "Active");

  // Optional placement filter
  if (placement && activeBanners.length > 0) {
    const matched = activeBanners.filter(
      (b) =>
        (b.placement || "").toLowerCase().includes(placement.toLowerCase()) ||
        (b.placement || "").toLowerCase().includes("all")
    );
    if (matched.length > 0) {
      activeBanners = matched;
    }
  }

  const activeBanner = activeBanners[0] || (banners.length === 0 ? FALLBACK_BANNER : null);

  if (!activeBanner) return null;

  const targetLink = activeBanner.link?.trim() || "#shop";
  const displayImage =
    activeBanner.image?.trim() ||
    "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1400&q=80";

  return (
    <section id="marketing-banner" className="mx-auto max-w-[1440px] px-4 py-6 md:py-8 scroll-mt-20">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#152e1d] via-[#244f31] to-[#2d5f3d] text-white shadow-xl">
        {/* Subtle decorative botanical pattern blobs */}
        <div className="pointer-events-none absolute -right-20 -top-20 size-80 rounded-full bg-[#80a03c]/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 -bottom-20 size-80 rounded-full bg-[#f2c94c]/15 blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 p-6 sm:p-8 md:p-10">
          {/* Text Content */}
          <div className="max-w-2xl text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#f2c94c] backdrop-blur-sm mb-3">
              <Sparkles className="size-3.5" />
              <span>Special Herbal Promotion</span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white leading-tight">
              {activeBanner.name}
            </h2>

            {activeBanner.subtitle && (
              <p className="mt-3 text-xs sm:text-sm md:text-base text-[#ddddd9] leading-relaxed max-w-xl">
                {activeBanner.subtitle}
              </p>
            )}

            <div className="mt-6 flex flex-wrap items-center justify-center md:justify-start gap-4">
              <Link
                href={targetLink}
                className="inline-flex items-center gap-2 rounded-xl bg-[#f2c94c] px-6 py-3.5 text-xs font-black uppercase tracking-wider text-[#17231b] shadow-lg transition-all hover:bg-[#ffe066] hover:scale-105 active:scale-95 cursor-pointer"
              >
                <span>{activeBanner.ctaText || "Explore Pure Formulations"}</span>
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
                  alt={activeBanner.name}
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
