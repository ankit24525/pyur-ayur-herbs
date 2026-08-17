"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { heroSlides as defaultSlides } from "@/lib/store";

export default function HeroSlider({ slides }: { slides?: any[] }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const activeSlides = slides && slides.length > 0 ? slides : defaultSlides;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [activeSlides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);

  return (
    <section className="relative w-full overflow-hidden bg-[#17231b]">
      <div
        className="flex transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {activeSlides.map((slide, idx) => (
          <div
            key={slide.id || idx}
            className={`relative min-w-full shrink-0 ${slide.fullWidthBanner ? "" : `bg-gradient-to-r ${slide.bgColor || "from-[#1d3b24] via-[#244f31] to-[#0f2416]"}`} text-white`}
          >
            {slide.fullWidthBanner ? (
              <a
                href={slide.href}
                className="block w-full hover:opacity-95 transition-opacity"
              >
                <img
                  src={slide.image}
                  alt={slide.title || "Storefront Banner"}
                  className="w-full h-[240px] sm:h-[360px] lg:h-[450px] object-cover"
                />
              </a>
            ) : (
              <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between px-6 py-12 lg:flex-row lg:px-12 lg:py-16">
                {/* Content Box */}
                <div className="z-10 flex max-w-xl flex-col items-center text-center lg:items-start lg:text-left">
                  {slide.badge && (
                    <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-[#80a03c] px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-md">
                      <Sparkles className="size-3.5" /> {slide.badge}
                    </span>
                  )}

                  <h1 className="text-2xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                    {slide.title}
                  </h1>

                  {slide.subtitle && (
                    <p className="mt-3 text-xs font-bold tracking-widest text-[#f2c94c] uppercase sm:text-sm">
                      {slide.subtitle}
                    </p>
                  )}

                  {slide.offer && (
                    <div className="mt-4 rounded-lg bg-white/10 px-4 py-2 text-xs font-semibold backdrop-blur-md border border-white/20">
                      🎁 {slide.offer}
                    </div>
                  )}

                  <div className="mt-6 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
                    <a
                      href={slide.href}
                      className="inline-flex items-center justify-center rounded-lg bg-[#80a03c] px-6 py-3.5 text-xs font-black uppercase tracking-widest text-white shadow-lg transition hover:bg-[#6c8930] hover:shadow-xl sm:text-sm"
                    >
                      {slide.ctaText || "SHOP NOW"}
                    </a>
                    <a
                      href="#concerns"
                      className="inline-flex items-center justify-center rounded-lg border border-white/40 bg-white/10 px-6 py-3.5 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-white/20 sm:text-sm"
                    >
                      SELECT CONCERN
                    </a>
                  </div>
                </div>

                {/* Image Box */}
                {slide.image && (
                  <div className="relative mt-8 max-w-lg lg:mt-0 w-full lg:w-auto">
                    <div className="relative overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
                      <img
                        src={slide.image}
                        alt={slide.title}
                        className="h-[280px] w-full object-cover sm:h-[360px] lg:h-[400px] lg:w-[500px]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Slide Navigation Controls */}
      <button
        onClick={prevSlide}
        className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white transition hover:bg-black/70 md:left-6"
        aria-label="Previous Slide"
      >
        <ChevronLeft className="size-6" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white transition hover:bg-black/70 md:right-6"
        aria-label="Next Slide"
      >
        <ChevronRight className="size-6" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        {activeSlides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`h-2.5 rounded-full transition-all ${
              currentSlide === idx ? "w-8 bg-[#80a03c]" : "w-2.5 bg-white/50"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
