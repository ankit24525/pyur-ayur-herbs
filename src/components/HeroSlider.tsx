"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { heroSlides as defaultSlides } from "@/lib/store";

const getSlideBackgroundStyle = (bgColor?: string, isFullWidth?: boolean): React.CSSProperties => {
  if (isFullWidth || !bgColor) return {};
  const trimmed = bgColor.trim();
  if (
    trimmed.startsWith("#") ||
    trimmed.startsWith("rgb") ||
    trimmed.startsWith("hsl") ||
    trimmed.startsWith("linear-gradient")
  ) {
    return { background: trimmed };
  }
  return {};
};

const getSlideBackgroundClass = (bgColor?: string, isFullWidth?: boolean): string => {
  if (isFullWidth) return "";
  const trimmed = bgColor?.trim() || "";
  if (
    trimmed.startsWith("#") ||
    trimmed.startsWith("rgb") ||
    trimmed.startsWith("hsl") ||
    trimmed.startsWith("linear-gradient")
  ) {
    return "";
  }
  if (trimmed.startsWith("from-") || trimmed.includes("bg-")) {
    return trimmed.startsWith("bg-") ? trimmed : `bg-gradient-to-r ${trimmed}`;
  }
  return "bg-gradient-to-r from-[#590d0d] via-[#400808] to-[#260404]";
};

export default function HeroSlider({ slides }: { slides?: any[] }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const activeSlides = slides && slides.length > 0 ? slides : defaultSlides;

  // Auto-play interval (5s)
  useEffect(() => {
    if (activeSlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [activeSlides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);

  // Touch Swipe Handlers for Mobile Devices
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diffX = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 35; // minimum 35px swipe

    if (diffX > minSwipeDistance) {
      nextSlide();
    } else if (diffX < -minSwipeDistance) {
      prevSlide();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <section
      className="relative w-full overflow-hidden bg-[#17231b] touch-pan-y"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {activeSlides.map((slide, idx) => (
          <div
            key={slide.id || idx}
            style={getSlideBackgroundStyle(slide.bgColor, slide.fullWidthBanner)}
            className={`relative w-full shrink-0 overflow-hidden ${getSlideBackgroundClass(slide.bgColor, slide.fullWidthBanner)} text-white`}
          >
            {slide.fullWidthBanner ? (
              <a
                href={slide.href || "#shop"}
                className="block w-full hover:opacity-95 transition-opacity"
              >
                <img
                  src={slide.image}
                  alt={slide.title || "Storefront Banner"}
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1200&q=80";
                  }}
                  className="w-full h-auto max-h-[220px] sm:max-h-[340px] md:max-h-[420px] lg:max-h-[500px] object-cover sm:object-contain bg-[#17231b]"
                />
              </a>
            ) : (
              <div className="relative mx-auto flex max-w-[1440px] flex-col items-center justify-between px-4 pt-6 pb-4 sm:px-6 sm:pt-10 md:flex-row md:py-12 lg:px-12 lg:py-16">
                {/* 📱 MOBILE VIEW (md:hidden) — Exact Requested Centered Design */}
                <div className="flex flex-col items-center text-center w-full max-w-md md:hidden space-y-3.5 mb-2">
                  {/* Pill Badge */}
                  {slide.badge && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#7ca038] px-3.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-md">
                      <Sparkles className="size-3" /> {slide.badge}
                    </span>
                  )}

                  {/* Main Centered Title */}
                  <h1 className="text-2xl font-black leading-tight tracking-tight text-white px-2">
                    {slide.title}
                  </h1>

                  {/* Gold Subtitle */}
                  {slide.subtitle && (
                    <p className="text-[11px] font-extrabold tracking-widest text-[#f2c94c] uppercase">
                      {slide.subtitle}
                    </p>
                  )}

                  {/* Discount Offer Pill */}
                  {slide.offer && (
                    <div className="w-full max-w-xs rounded-xl bg-black/25 px-4 py-2 text-[11px] font-bold border border-white/15 backdrop-blur-xs text-white">
                      🎁 {slide.offer}
                    </div>
                  )}

                  {/* Vertical Action Buttons Stack */}
                  <div className="flex flex-col gap-2.5 w-full max-w-xs pt-1">
                    <a
                      href={slide.href || "#shop"}
                      className="w-full inline-flex items-center justify-center rounded-xl bg-[#7ca038] py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg active:scale-95 transition hover:bg-[#68882e]"
                    >
                      {slide.ctaText || "SHOP NOW"}
                    </a>
                    <a
                      href="#concerns"
                      className="w-full inline-flex items-center justify-center rounded-xl border border-white/50 bg-black/20 py-2.5 text-xs font-extrabold uppercase tracking-widest text-white backdrop-blur-xs transition hover:bg-white/10 active:scale-95"
                    >
                      SELECT CONCERN
                    </a>
                  </div>
                </div>

                {/* Mobile Bottom Product Showcase Image */}
                {slide.image && (
                  <div className="relative w-full max-w-xs sm:max-w-sm shrink-0 md:hidden flex justify-center mt-2">
                    <div className="relative w-full overflow-hidden flex items-center justify-center">
                      <img
                        src={slide.image}
                        alt={slide.title || "Banner"}
                        onError={(e) => {
                          e.currentTarget.src = "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1200&q=80";
                        }}
                        className="w-full max-h-[260px] object-contain drop-shadow-2xl"
                      />
                    </div>
                  </div>
                )}

                {/* 💻 DESKTOP & TABLET VIEW (hidden md:flex) — Rich Side-by-Side Showcase */}
                <div className="hidden md:flex md:flex-row md:items-center md:justify-between md:gap-8 w-full">
                  <div className="z-10 flex flex-col items-start text-left max-w-xl">
                    {slide.badge && (
                      <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-[#80a03c] px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-md">
                        <Sparkles className="size-3.5" /> {slide.badge}
                      </span>
                    )}

                    <h1 className="text-3xl lg:text-5xl font-black leading-tight tracking-tight text-white">
                      {slide.title}
                    </h1>

                    {slide.subtitle && (
                      <p className="mt-2 text-xs lg:text-sm font-bold tracking-widest text-[#f2c94c] uppercase">
                        {slide.subtitle}
                      </p>
                    )}

                    {slide.offer && (
                      <div className="mt-4 rounded-lg bg-white/10 px-4 py-2 text-xs font-semibold backdrop-blur-md border border-white/20">
                        🎁 {slide.offer}
                      </div>
                    )}

                    <div className="mt-6 flex items-center gap-4">
                      <a
                        href={slide.href || "#shop"}
                        className="inline-flex items-center justify-center rounded-xl bg-[#80a03c] px-6 py-3.5 text-sm font-black uppercase tracking-widest text-white shadow-lg transition hover:bg-[#6c8930] hover:shadow-xl active:scale-95"
                      >
                        {slide.ctaText || "SHOP NOW"}
                      </a>
                      <a
                        href="#concerns"
                        className="inline-flex items-center justify-center rounded-xl border border-white/40 bg-white/10 px-6 py-3.5 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-white/20"
                      >
                        SELECT CONCERN
                      </a>
                    </div>
                  </div>

                  {slide.image && (
                    <div className="relative w-full max-w-md lg:max-w-lg shrink-0">
                      <div className="relative overflow-hidden rounded-2xl border border-white/15 shadow-2xl bg-black/20 aspect-[4/3]">
                        <img
                          src={slide.image}
                          alt={slide.title || "Banner"}
                          onError={(e) => {
                            e.currentTarget.src = "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1200&q=80";
                          }}
                          className="size-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Slide Navigation Controls */}
      {activeSlides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white backdrop-blur-xs transition hover:bg-black/60 sm:left-4 z-10"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="size-5 sm:size-6" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white backdrop-blur-xs transition hover:bg-black/60 sm:right-4 z-10"
            aria-label="Next Slide"
          >
            <ChevronRight className="size-5 sm:size-6" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 z-10">
            {activeSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all ${
                  currentSlide === idx ? "w-6 bg-[#7ca038]" : "w-2 bg-white/50"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
