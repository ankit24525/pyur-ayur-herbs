"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
  return "bg-gradient-to-r from-[#4a0404] via-[#330202] to-[#1a0101]";
};

export default function HeroSlider({ slides }: { slides?: any[] }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  const activeSlides = slides && slides.length > 0 ? slides : defaultSlides;
  const slideCount = activeSlides.length;

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slideCount);
  }, [slideCount]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slideCount) % slideCount);
  }, [slideCount]);

  // Autoplay with Pause on Hover & Pause on Interaction
  useEffect(() => {
    if (slideCount <= 1 || isPaused) return;

    const timer = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(timer);
  }, [slideCount, isPaused, nextSlide]);

  // Resume autoplay after user interaction timeout
  const handleInteraction = () => {
    setIsPaused(true);
    // Resume after 7s of no interaction
    const resumeTimer = setTimeout(() => {
      setIsPaused(false);
    }, 7000);
    return () => clearTimeout(resumeTimer);
  };

  // Keyboard Navigation (ArrowLeft / ArrowRight)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      handleInteraction();
      prevSlide();
    } else if (e.key === "ArrowRight") {
      handleInteraction();
      nextSlide();
    }
  };

  // Touch Swipe Handlers for Mobile Devices
  const handleTouchStart = (e: React.TouchEvent) => {
    handleInteraction();
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diffX = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 35; // 35px minimum swipe

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
      ref={sliderRef}
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured Ayurvedic Remedies Hero Slider"
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative w-full overflow-hidden bg-[#17231b] touch-pan-y outline-none focus-visible:ring-2 focus-visible:ring-[#80a03c]"
    >
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {activeSlides.map((slide, idx) => (
          <div
            key={slide.id || idx}
            role="group"
            aria-roledescription="slide"
            aria-label={`Slide ${idx + 1} of ${slideCount}: ${slide.title || "Ayurvedic Campaign"}`}
            aria-hidden={currentSlide !== idx}
            style={getSlideBackgroundStyle(slide.bgColor, slide.fullWidthBanner)}
            className={`relative w-full shrink-0 overflow-hidden ${getSlideBackgroundClass(slide.bgColor, slide.fullWidthBanner)} text-white`}
          >
            {slide.fullWidthBanner ? (
              <a
                href={slide.href || "#shop"}
                tabIndex={currentSlide === idx ? 0 : -1}
                className="block w-full hover:opacity-95 transition-opacity"
              >
                <img
                  src={slide.image}
                  alt={slide.title || "Storefront Campaign Banner"}
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1200&q=80";
                  }}
                  className="w-full h-auto min-h-[180px] max-h-[240px] sm:max-h-[340px] md:max-h-[420px] lg:max-h-[500px] object-cover sm:object-contain bg-[#17231b]"
                />
              </a>
            ) : (
              /* KAPIVA-STYLE UNIFIED RESPONSIVE SLIDE (SAME SLIDE ARTWORK ON DESKTOP & MOBILE) */
              <div className="relative mx-auto flex max-w-[1440px] min-h-[220px] sm:min-h-[320px] md:min-h-[420px] lg:min-h-[480px] items-center justify-between px-3 py-4 sm:px-6 sm:py-8 md:px-10 lg:px-16 lg:py-12">
                {/* Central Safe Area - Left Column: Text & CTAs */}
                <div className="z-10 flex flex-col items-start text-left max-w-[58%] sm:max-w-[55%] md:max-w-xl shrink-0">
                  {slide.badge && (
                    <span className="mb-1 sm:mb-2 md:mb-3 inline-flex items-center gap-1 sm:gap-1.5 rounded-full bg-[#7ca038] px-2 py-0.5 sm:px-3 sm:py-1 text-[8px] sm:text-[10px] md:text-xs font-black uppercase tracking-wider text-white shadow-md">
                      <Sparkles className="size-2.5 sm:size-3 md:size-3.5 text-white" /> {slide.badge}
                    </span>
                  )}

                  <h1 className="text-xs sm:text-2xl md:text-4xl lg:text-5xl font-black leading-tight sm:leading-snug tracking-tight text-white line-clamp-3">
                    {slide.title}
                  </h1>

                  {slide.subtitle && (
                    <p className="mt-1 sm:mt-2 text-[9px] sm:text-xs lg:text-sm font-extrabold tracking-wider text-[#f2c94c] uppercase line-clamp-2">
                      {slide.subtitle}
                    </p>
                  )}

                  {slide.offer && (
                    <div className="mt-1.5 sm:mt-3 rounded-lg bg-black/25 px-2 py-1 sm:px-3.5 sm:py-1.5 text-[8px] sm:text-xs font-bold border border-white/20 backdrop-blur-xs text-white">
                      🎁 {slide.offer}
                    </div>
                  )}

                  {/* Action Buttons Pair */}
                  <div className="mt-2.5 sm:mt-5 flex flex-wrap items-center gap-1.5 sm:gap-3">
                    <a
                      href={slide.href || "#shop"}
                      tabIndex={currentSlide === idx ? 0 : -1}
                      className="inline-flex items-center justify-center rounded-lg sm:rounded-xl bg-[#7ca038] px-2.5 py-1.5 sm:px-5 sm:py-3 text-[9px] sm:text-xs md:text-sm font-black uppercase tracking-wider text-white shadow-md transition hover:bg-[#68882e] active:scale-95"
                    >
                      {slide.ctaText || "SHOP NOW"}
                    </a>
                    <a
                      href="#concerns"
                      tabIndex={currentSlide === idx ? 0 : -1}
                      className="hidden sm:inline-flex items-center justify-center rounded-xl border border-white/40 bg-black/20 px-4 py-3 text-xs md:text-sm font-bold uppercase tracking-wider text-white backdrop-blur-xs transition hover:bg-white/20 active:scale-95"
                    >
                      SELECT CONCERN
                    </a>
                  </div>
                </div>

                {/* Right Column: Uncropped Product & Bottle Showcase Image */}
                {slide.image && (
                  <div className="relative flex items-center justify-end w-[40%] sm:w-[42%] md:w-[45%] lg:w-[48%] h-full max-h-[160px] sm:max-h-[280px] md:max-h-[380px] lg:max-h-[440px] shrink-0 pointer-events-none">
                    <div className="relative w-full h-full flex items-center justify-center">
                      <img
                        src={slide.image}
                        alt={slide.title || "Product Showcase"}
                        onError={(e) => {
                          e.currentTarget.src = "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1200&q=80";
                        }}
                        className="max-h-full max-w-full object-contain drop-shadow-2xl transition-transform duration-500 hover:scale-105"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Slide Navigation Arrow Controls */}
      {slideCount > 1 && (
        <>
          <button
            onClick={() => {
              handleInteraction();
              prevSlide();
            }}
            className="absolute left-1.5 sm:left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-1.5 sm:p-2.5 text-white backdrop-blur-xs transition hover:bg-black/60 active:scale-95 z-10"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="size-4 sm:size-6" />
          </button>

          <button
            onClick={() => {
              handleInteraction();
              nextSlide();
            }}
            className="absolute right-1.5 sm:right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-1.5 sm:p-2.5 text-white backdrop-blur-xs transition hover:bg-black/60 active:scale-95 z-10"
            aria-label="Next Slide"
          >
            <ChevronRight className="size-4 sm:size-6" />
          </button>

          {/* Pagination Dots Indicator */}
          <div className="absolute bottom-2 sm:bottom-4 left-1/2 flex -translate-x-1/2 gap-1 sm:gap-2 z-10">
            {activeSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  handleInteraction();
                  setCurrentSlide(idx);
                }}
                className={`h-1.5 sm:h-2.5 rounded-full transition-all ${
                  currentSlide === idx ? "w-5 sm:w-8 bg-[#7ca038]" : "w-1.5 sm:w-2.5 bg-white/50"
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
