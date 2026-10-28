"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { heroSlides as defaultSlides } from "@/lib/store";

/**
 * ============================================================================
 * HeroSlider Component
 * ============================================================================
 * 
 * Purpose:
 * Main homepage hero carousel displaying brand visual banners and key promotions.
 * 
 * Key Features:
 * 1. Seamless Infinite Looping: Uses cloned buffer slides [S_last, S_0, ..., S_last, S_0]
 *    so the slider can loop infinitely in both directions without jarring rewinds.
 * 2. Responsive 1200x800 Aspect Ratio: Fixed 3:2 canvas matching the Taitva design,
 *    centered on desktop and gracefully adapting on tablet and mobile.
 * 3. Gesture & Keyboard Navigation: Touch swiping on mobile, arrow keys on desktop,
 *    and on-hover autoplay pause.
 * 4. Tab Visibility Detection: Automatically pauses when user switches tabs to
 *    prevent runaway timers or skipped frames.
 * 5. Responsive Image Support: Uses HTML5 <picture> to serve dedicated mobile crops
 *    when available, with automatic fallback protection against broken links.
 */

export default function HeroSlider({
  slides,
  marketingBanners,
}: {
  /** Array of custom slide objects passed from Storefront CMS / MongoDB */
  slides?: any[];
  /** Optional secondary promotional banner strips */
  marketingBanners?: any[];
}) {
  // --------------------------------------------------------------------------
  // Component State
  // --------------------------------------------------------------------------

  // Track position in the extended slides array.
  // Starts at index 1 because index 0 is occupied by the cloned last slide buffer.
  const [slideIndex, setSlideIndex] = useState(1);

  // When true, CSS transitions (550ms cubic-bezier) animate track movement.
  // Temporarily set to false during infinite-loop boundary resets for invisible jumps.
  const [isTransitioning, setIsTransitioning] = useState(true);

  // Autoplay pause flag (triggered by active interaction or hidden tab).
  const [isPaused, setIsPaused] = useState(false);

  // Dragging and swipe tracking refs (supports both touch and mouse drag on desktop)
  const pointerStartX = useRef<number | null>(null);
  const isDraggingRef = useRef(false);
  const dragDistanceRef = useRef(0);
  const interactionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  // --------------------------------------------------------------------------
  // Slide Data Normalization & Infinite Loop Buffer
  // --------------------------------------------------------------------------

  // Fallback to default bundled slides if no CMS slides are provided or valid
  const activeSlides = useMemo(() => {
    if (Array.isArray(slides)) {
      return slides;
    }
    return defaultSlides;
  }, [slides]);

  const slideCount = activeSlides.length;

  /**
   * Cloned slides array for seamless infinite looping.
   * If we have 3 slides [A, B, C], the extended array becomes [C, A, B, C, A]:
   * - Index 0: Clone of Slide C (left buffer)
   * - Index 1: Real Slide A
   * - Index 2: Real Slide B
   * - Index 3: Real Slide C
   * - Index 4: Clone of Slide A (right buffer)
   */
  const extendedSlides = useMemo(() => {
    if (slideCount <= 1) return activeSlides;
    return [
      activeSlides[slideCount - 1], // Prepend clone of last slide
      ...activeSlides,              // Original slides
      activeSlides[0],              // Append clone of first slide
    ];
  }, [activeSlides, slideCount]);

  // --------------------------------------------------------------------------
  // Navigation Handlers (Next / Prev)
  // --------------------------------------------------------------------------

  /** Advances track to the next slide with smooth CSS animation */
  const nextSlide = useCallback(() => {
    if (slideCount <= 1) return;
    setSlideIndex((prev) => {
      // Guard against unbounded index overflow
      if (prev >= slideCount + 1) return 1;
      return prev + 1;
    });
    setIsTransitioning(true);
  }, [slideCount]);

  /** Moves track to the previous slide with smooth CSS animation */
  const prevSlide = useCallback(() => {
    if (slideCount <= 1) return;
    setSlideIndex((prev) => {
      // Guard against underflow
      if (prev <= 0) return slideCount;
      return prev - 1;
    });
    setIsTransitioning(true);
  }, [slideCount]);

  // --------------------------------------------------------------------------
  // Infinite Loop Seamless Snap Logic
  // --------------------------------------------------------------------------

  /**
   * Called when the CSS transform transition completes.
   * If we arrived at a cloned boundary slide:
   * 1. Turn off CSS transition (`isTransitioning = false`)
   * 2. Instantly jump to the real counterpart slide without visual flicker
   */
  const handleTransitionEnd = (e?: React.TransitionEvent<HTMLDivElement>) => {
    // Ignore transition events triggered by child elements
    if (e && e.target !== e.currentTarget) return;
    if (slideCount <= 1) return;

    if (slideIndex <= 0) {
      // Reached left clone -> instantly snap to real last slide
      setIsTransitioning(false);
      setSlideIndex(slideCount);
    } else if (slideIndex >= slideCount + 1) {
      // Reached right clone -> instantly snap to real first slide
      setIsTransitioning(false);
      setSlideIndex(1);
    }
  };

  /**
   * Seamlessly re-arms transition on the very next animation frame after an instant boundary jump
   */
  useEffect(() => {
    if (!isTransitioning) {
      const raf = requestAnimationFrame(() => {
        setIsTransitioning(true);
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [isTransitioning]);

  /**
   * Safety Watchdog:
   * If `onTransitionEnd` is dropped by the browser (e.g. background tab or rapid scrolling),
   * this safety timeout ensures the slider snaps back into bounds within 580ms.
   */
  useEffect(() => {
    if (slideCount <= 1) return;
    if (slideIndex >= slideCount + 1 || slideIndex <= 0) {
      const safetyTimer = setTimeout(() => {
        setIsTransitioning(false);
        setSlideIndex(slideIndex >= slideCount + 1 ? 1 : slideCount);
      }, 580);
      return () => clearTimeout(safetyTimer);
    }
  }, [slideIndex, slideCount]);

  /** Clamps index safely if slide count changes dynamically */
  useEffect(() => {
    if (slideIndex > slideCount + 1 || slideIndex < 0) {
      setIsTransitioning(false);
      setSlideIndex(1);
    }
  }, [slideCount, slideIndex]);

  // --------------------------------------------------------------------------
  // Autoplay & Visibility Lifecycle
  // --------------------------------------------------------------------------

  /** Pause carousel when browser tab is inactive to save CPU and avoid frame lag */
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        setIsPaused(true);
      } else {
        setIsPaused(false);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  /** Autoplay timer: advances slide every 5.5 seconds unless paused */
  useEffect(() => {
    if (slideCount <= 1 || isPaused) return;

    const timer = setInterval(() => {
      nextSlide();
    }, 5500);

    return () => clearInterval(timer);
  }, [slideCount, isPaused, nextSlide]);

  /**
   * Temporarily pauses autoplay for 7 seconds whenever the user manually interacts
   * (clicking arrows, swiping, or pressing pagination dots)
   */
  const handleInteraction = useCallback(() => {
    setIsPaused(true);
    if (interactionTimeoutRef.current) {
      clearTimeout(interactionTimeoutRef.current);
    }
    interactionTimeoutRef.current = setTimeout(() => {
      setIsPaused(false);
    }, 7000);
  }, []);

  // Clean up interaction timer on unmount
  useEffect(() => {
    return () => {
      if (interactionTimeoutRef.current) {
        clearTimeout(interactionTimeoutRef.current);
      }
    };
  }, []);

  // --------------------------------------------------------------------------
  // User Input Listeners (Keyboard & Pointer Drag / Swipe for Desktop & Mobile)
  // --------------------------------------------------------------------------

  /** Keyboard arrow navigation for accessibility */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      handleInteraction();
      prevSlide();
    } else if (e.key === "ArrowRight") {
      handleInteraction();
      nextSlide();
    }
  };

  /** Unified Pointer Drag Handlers (Smooth mouse drag on desktop & swipe on mobile) */
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return; // Only primary button
    pointerStartX.current = e.clientX;
    isDraggingRef.current = true;
    dragDistanceRef.current = 0;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || pointerStartX.current === null) return;
    const diff = e.clientX - pointerStartX.current;
    dragDistanceRef.current = diff;
  };

  const handlePointerUp = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    const diff = dragDistanceRef.current;
    const minSwipeDistance = 35;

    if (diff < -minSwipeDistance) {
      handleInteraction();
      nextSlide();
    } else if (diff > minSwipeDistance) {
      handleInteraction();
      prevSlide();
    }

    pointerStartX.current = null;
    setTimeout(() => {
      dragDistanceRef.current = 0;
    }, 100);
  };

  const handlePointerCancel = () => {
    isDraggingRef.current = false;
    pointerStartX.current = null;
    dragDistanceRef.current = 0;
  };

  /** Prevent link click if the user was dragging the slide horizontally */
  const handleLinkClick = (e: React.MouseEvent) => {
    if (Math.abs(dragDistanceRef.current) > 10) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  // --------------------------------------------------------------------------
  // Helper: Image URL Transformation
  // --------------------------------------------------------------------------

  /** Formats Cloudinary URLs to match the exact 1200x800 container dimensions edge-to-edge without padding sidebars */
  const getFormattedSlideImage = (url: string) => {
    if (!url || typeof url !== "string") return url;
    let formatted = url;
    if (formatted.includes("c_pad,w_1920,h_600")) {
      formatted = formatted.replace("c_pad,w_1920,h_600", "c_fill,g_auto,w_1200,h_800");
    }
    if (formatted.includes("c_pad,w_1200,h_800,b_auto")) {
      formatted = formatted.replace("c_pad,w_1200,h_800,b_auto", "c_fill,g_auto,w_1200,h_800");
    } else if (formatted.includes("c_pad,w_1200,h_800")) {
      formatted = formatted.replace("c_pad,w_1200,h_800", "c_fill,g_auto,w_1200,h_800");
    }
    return formatted;
  };

  if (slideCount === 0) return null;

  // Compute 0-based active index for pagination dots
  const activeNormalizedIndex =
    slideCount <= 1
      ? 0
      : slideIndex === 0
      ? slideCount - 1
      : slideIndex === slideCount + 1
      ? 0
      : slideIndex - 1;

  // --------------------------------------------------------------------------
  // Render JSX
  // --------------------------------------------------------------------------

  return (
    <section
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label="Pure Ayur Herbs Storefront Hero Banner"
      onKeyDown={handleKeyDown}
      className="w-full bg-white pt-0 pb-1 select-none outline-none"
    >
      {/* Container: Strict 1200x800 Canvas (max-w-[1200px] mx-auto) */}
      <div className="w-full md:mx-auto md:max-w-[1200px] px-0">
        
        {/* Banner Frame: Exact 1200x800 px Container (3:2 Aspect Ratio) */}
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          className="relative w-full max-w-[1200px] mx-auto aspect-[1200/800] overflow-hidden rounded-none bg-[#023915]/5 shadow-none cursor-grab active:cursor-grabbing touch-pan-y"
        >
          
          {/* Sliding Track: Moves horizontally via CSS translateX */}
          <div
            onTransitionEnd={handleTransitionEnd}
            className="flex w-full h-full will-change-transform"
            style={{
              transform: `translateX(-${slideIndex * 100}%)`,
              transition: isTransitioning
                ? "transform 550ms cubic-bezier(0.25, 1, 0.5, 1)"
                : "none",
            }}
          >
            {extendedSlides.map((slide, idx) => {
              const isSlideActive = idx === slideIndex;
              const slideImage =
                slide.image && typeof slide.image === "string" && slide.image.trim()
                  ? getFormattedSlideImage(slide.image)
                  : "/brand/hero-taitva-1200x800.jpg";
              const mobileImage =
                slide.mobileImage && typeof slide.mobileImage === "string" && slide.mobileImage.trim()
                  ? getFormattedSlideImage(slide.mobileImage)
                  : slideImage;

              return (
                <div
                  key={slide.id ? `${slide.id}_${idx}` : idx}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`Slide ${idx + 1}`}
                  aria-hidden={!isSlideActive}
                  className="w-full h-full shrink-0 relative flex items-center justify-center bg-[#f8faf5]"
                >
                  {/* Clickable Banner Link wrapping the whole slide */}
                  <Link
                    href={slide.href || slide.link || "/products"}
                    tabIndex={isSlideActive ? 0 : -1}
                    onClick={handleLinkClick}
                    draggable={false}
                    className="block size-full focus:outline-none cursor-pointer relative flex items-center justify-center select-none"
                  >
                    {/* HTML5 Picture Element for Responsive Mobile/Desktop Image Switching */}
                    <picture className="size-full flex items-center justify-center pointer-events-none">
                      {/* Mobile viewport source (under 640px) */}
                      <source media="(max-width: 639px)" srcSet={mobileImage} />
                      {/* Default Desktop & Tablet Image */}
                      <img
                        src={slideImage}
                        alt={slide.title || "Pure Ayur Herbs Ayurvedic Formulation Banner"}
                        draggable={false}
                        onError={(e) => {
                          // Automatic fallback protection if image fails to load
                          if (typeof window !== "undefined" && !e.currentTarget.src.endsWith("/brand/hero-wild-authentic-pure.jpg")) {
                            e.currentTarget.src = "/brand/hero-wild-authentic-pure.jpg";
                          }
                        }}
                        className="size-full object-cover object-center pointer-events-none"
                        loading={idx === 1 ? "eager" : "lazy"}
                        fetchPriority={idx === 1 ? "high" : "auto"}
                        decoding={idx === 1 ? "sync" : "async"}
                      />
                    </picture>
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Desktop Arrow Navigation Controls (Hidden on mobile, matching Taitva Desktop) */}
          {slideCount > 1 && (
            <>
              {/* Previous Slide Button */}
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  handleInteraction();
                  prevSlide();
                }}
                className="hidden md:flex absolute left-3 lg:left-4 top-1/2 -translate-y-1/2 size-10 lg:size-11 rounded-full bg-white/95 hover:bg-white border border-neutral-300 shadow-md items-center justify-center text-neutral-800 hover:text-black hover:scale-105 active:scale-95 transition cursor-pointer z-20"
                aria-label="Previous Slide"
              >
                <ChevronLeft className="size-5" />
              </button>

              {/* Next Slide Button */}
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  handleInteraction();
                  nextSlide();
                }}
                className="hidden md:flex absolute right-3 lg:right-4 top-1/2 -translate-y-1/2 size-10 lg:size-11 rounded-full bg-white/95 hover:bg-white border border-neutral-300 shadow-md items-center justify-center text-neutral-800 hover:text-black hover:scale-105 active:scale-95 transition cursor-pointer z-20"
                aria-label="Next Slide"
              >
                <ChevronRight className="size-5" />
              </button>
            </>
          )}
        </div>

        {/* Taitva Centered Pagination Dots (Directly Below Banner Frame) */}
        {slideCount > 1 && (
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-2.5 sm:mt-4 mb-1 sm:mb-2">
            {activeSlides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  handleInteraction();
                  setIsTransitioning(true);
                  setSlideIndex(i + 1);
                }}
                aria-label={`Go to slide ${i + 1}`}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  i === activeNormalizedIndex
                    ? "size-2.5 bg-[#023915] scale-110"
                    : "size-2 bg-neutral-300 hover:bg-neutral-400"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
