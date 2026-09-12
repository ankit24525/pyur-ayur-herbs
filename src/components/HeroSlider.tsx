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
  return "bg-gradient-to-r from-[#1d3b24] via-[#244f31] to-[#0f2416]";
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
              /* UNIFIED DESKTOP-STYLE LAYOUT FOR ALL SCREENS (MOBILE + TABLET + DESKTOP) */
              <div className="relative mx-auto flex max-w-[1440px] flex-col gap-6 px-4 py-6 sm:px-6 sm:py-10 md:flex-row md:items-center md:justify-between md:py-12 lg:px-12 lg:py-16">
                {/* Left Column: Text Content & Dual Action Buttons */}
                <div className="z-10 flex flex-col items-start text-left max-w-full md:max-w-xl">
                  {slide.badge && (
                    <span className="mb-2 inline-flex items-center gap-1 rounded-full bg-[#80a03c] px-2.5 py-0.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-white shadow-md md:mb-3 md:px-3.5 md:py-1">
                      <Sparkles className="size-3 md:size-3.5" /> {slide.badge}
                    </span>
                  )}

                  <h1 className="text-xl font-black leading-tight tracking-tight text-white sm:text-3xl lg:text-5xl">
                    {slide.title}
                  </h1>

                  {slide.subtitle && (
                    <p className="mt-1.5 text-[11px] font-bold tracking-widest text-[#f2c94c] uppercase sm:text-xs lg:text-sm lg:mt-2.5">
                      {slide.subtitle}
                    </p>
                  )}

                  {slide.offer && (
                    <div className="mt-2.5 rounded-lg bg-white/10 px-3 py-1.5 text-[10px] font-semibold backdrop-blur-md border border-white/20 sm:text-xs lg:mt-4 lg:px-4 lg:py-2">
                      🎁 {slide.offer}
                    </div>
                  )}

                  {/* Dual Action Buttons (SHOP NOW & SELECT CONCERN) */}
                  <div className="mt-4 flex flex-row items-center gap-2.5 sm:gap-4 lg:mt-6">
                    <a
                      href={slide.href || "#shop"}
                      className="inline-flex items-center justify-center rounded-xl bg-[#80a03c] px-4 py-2.5 text-[11px] font-black uppercase tracking-wider text-white shadow-lg transition hover:bg-[#6c8930] hover:shadow-xl active:scale-95 sm:px-6 sm:py-3.5 sm:text-xs lg:text-sm"
                    >
                      {slide.ctaText || "SHOP NOW"}
                    </a>
                    <a
                      href="#concerns"
                      className="inline-flex items-center justify-center rounded-xl border border-white/40 bg-white/10 px-3.5 py-2.5 text-[11px] font-bold uppercase tracking-wider text-white transition hover:bg-white/20 sm:px-6 sm:py-3.5 sm:text-xs lg:text-sm"
                    >
                      SELECT CONCERN
                    </a>
                  </div>
                </div>

                {/* Right Column: Desktop-Style Product Showcase Image Card */}
                {slide.image && (
                  <div className="relative w-full max-w-full md:max-w-md lg:max-w-lg shrink-0">
                    <div className="relative overflow-hidden rounded-2xl border border-white/15 shadow-2xl bg-black/20 aspect-[16/10] sm:aspect-[4/3]">
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
                  currentSlide === idx ? "w-6 bg-[#80a03c]" : "w-2 bg-white/50"
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
