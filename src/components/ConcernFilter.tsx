"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Image from "next/image";

interface ConcernFilterProps {
  selectedConcern: string | null;
  onSelectConcern: (concernName: string | null) => void;
  categories?: any[];
}

export const DEFAULT_HEALTH_GOALS = [
  {
    id: "sugar",
    name: "Sugar Management",
    concernKey: "Sugar Management",
    image: "/brand/nourish-supplements.jpg",
  },
  {
    id: "energy",
    name: "Energy and Vitality",
    concernKey: "Energy and Vitality",
    image: "/brand/nourish-superfoods.jpg",
  },
  {
    id: "nutrition",
    name: "Nutrition & Detox",
    concernKey: "Nutrition",
    image: "/brand/nourish-nutrition.jpg",
  },
  {
    id: "fitness",
    name: "Gym and Fitness",
    concernKey: "Gym and Fitness",
    image:
      "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "women",
    name: "Womens Health",
    concernKey: "Womens Health",
    image:
      "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "skin",
    name: "Skin and Hair",
    concernKey: "Skin and Hair",
    image:
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "heart",
    name: "Heart Health",
    concernKey: "Heart Health",
    image:
      "https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "liver",
    name: "Liver Care",
    concernKey: "Liver Care",
    image:
      "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "daily",
    name: "Daily Ayurveda",
    concernKey: "Daily Ayurveda",
    image:
      "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80",
  },
];

export default function ConcernFilter({
  selectedConcern,
  onSelectConcern,
  categories,
}: ConcernFilterProps) {
  // Merge categories from props if available, otherwise use curated health goals
  const baseItems = useMemo(() => {
    if (Array.isArray(categories) && categories.length >= 3) {
      return categories.map((cat: any) => {
        const fallback =
          DEFAULT_HEALTH_GOALS.find(
            (d) =>
              d.id === cat.id ||
              d.name.toLowerCase() === (cat.name || "").toLowerCase() ||
              d.concernKey.toLowerCase() === (cat.name || "").toLowerCase()
          ) || DEFAULT_HEALTH_GOALS[0];

        const isSmallIcon =
          !cat.image ||
          cat.image.includes("w=120") ||
          cat.image.length < 5;

        return {
          id: cat.id || cat.name?.toLowerCase().replace(/\s+/g, "-"),
          name: cat.name || fallback.name,
          concernKey: cat.concernKey || cat.name || fallback.concernKey,
          image: isSmallIcon ? fallback.image : cat.image,
        };
      });
    }
    return DEFAULT_HEALTH_GOALS;
  }, [categories]);

  const itemCount = baseItems.length;

  // Tripled array for seamless infinite looping
  const extendedList = useMemo(() => {
    if (itemCount === 0) return [];
    return [...baseItems, ...baseItems, ...baseItems];
  }, [baseItems, itemCount]);

  // Start in middle batch
  const [currentIndex, setCurrentIndex] = useState(itemCount);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  // Swipe / Drag tracking
  const touchStartX = useRef<number | null>(null);
  const mouseStartX = useRef<number | null>(null);
  const isDragging = useRef<boolean>(false);
  const dragDistance = useRef<number>(0);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  const nextSlide = useCallback(() => {
    if (itemCount <= 3) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + 1);
  }, [itemCount]);

  const prevSlide = useCallback(() => {
    if (itemCount <= 3) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev - 1);
  }, [itemCount]);

  // Seamless infinite loop boundary jump
  const handleTransitionEnd = (e?: React.TransitionEvent<HTMLDivElement>) => {
    if (e && e.target !== e.currentTarget) return;
    if (itemCount <= 3) return;

    if (currentIndex >= itemCount * 2) {
      setIsTransitioning(false);
      setCurrentIndex((prev) => prev - itemCount);
    } else if (currentIndex < itemCount) {
      setIsTransitioning(false);
      setCurrentIndex((prev) => prev + itemCount);
    }
  };

  // Re-enable smooth transition after boundary jump
  useEffect(() => {
    if (!isTransitioning) {
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsTransitioning(true);
        });
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [isTransitioning]);

  // Auto-slide every 3.5 seconds
  useEffect(() => {
    if (isPaused || itemCount <= 3) return;

    autoPlayTimerRef.current = setInterval(() => {
      nextSlide();
    }, 3500);

    return () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    };
  }, [isPaused, nextSlide, itemCount]);

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    touchStartX.current = e.touches[0].clientX;
    dragDistance.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.touches[0].clientX;
    dragDistance.current = Math.abs(diff);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 40) {
      nextSlide();
    } else if (diff < -40) {
      prevSlide();
    }
    touchStartX.current = null;
    setTimeout(() => setIsPaused(false), 2000);
  };

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsPaused(true);
    isDragging.current = true;
    mouseStartX.current = e.clientX;
    dragDistance.current = 0;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || mouseStartX.current === null) return;
    const diff = mouseStartX.current - e.clientX;
    dragDistance.current = Math.abs(diff);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging.current || mouseStartX.current === null) return;
    const diff = mouseStartX.current - e.clientX;
    if (diff > 40) {
      nextSlide();
    } else if (diff < -40) {
      prevSlide();
    }
    isDragging.current = false;
    mouseStartX.current = null;
    setTimeout(() => setIsPaused(false), 2000);
  };

  const handleMouseLeave = () => {
    if (isDragging.current) {
      isDragging.current = false;
      mouseStartX.current = null;
      setIsPaused(false);
    }
  };

  const handleSelect = (item: (typeof baseItems)[0]) => {
    // If user dragged to slide, don't trigger selection
    if (dragDistance.current > 10) return;

    if (
      selectedConcern &&
      (selectedConcern.toLowerCase() === item.concernKey.toLowerCase() ||
        selectedConcern.toLowerCase() === item.name.toLowerCase() ||
        selectedConcern.toLowerCase().replace(/&/g, "and") ===
          item.name.toLowerCase().replace(/&/g, "and"))
    ) {
      onSelectConcern(null);
    } else {
      onSelectConcern(item.concernKey);
    }
  };

  const activeNormalizedIndex = itemCount > 0 ? currentIndex % itemCount : 0;

  return (
    <section
      id="concerns"
      className="mx-auto max-w-[1200px] px-3 sm:px-6 py-5 sm:py-8 md:py-10 select-none"
    >
      {/* Centered Serif Section Title: SHOP BY HEALTH GOAL */}
      <h2 className="text-base sm:text-xl md:text-2xl font-serif tracking-widest uppercase text-neutral-800 font-normal text-center mb-4 sm:mb-6">
        SHOP BY HEALTH GOAL
      </h2>

      {/* 3 Categories Slider Container (Strictly 3 visible, Auto-sliding, User Swipeable) */}
      <div
        className="relative mx-auto max-w-[360px] sm:max-w-[420px] md:max-w-[760px] overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => {
          setIsPaused(false);
          handleMouseLeave();
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* Slider Track (Displays exactly 3 items across container width, advances by 1 item) */}
        <div
          onTransitionEnd={handleTransitionEnd}
          className="flex will-change-transform"
          style={{
            width: `${(extendedList.length / 3) * 100}%`,
            transform: `translateX(-${(currentIndex * 100) / extendedList.length}%)`,
            transition: isTransitioning
              ? "transform 550ms cubic-bezier(0.25, 1, 0.5, 1)"
              : "none",
          }}
        >
          {extendedList.map((cat, idx) => {
            const isSelected =
              selectedConcern !== null &&
              (selectedConcern.toLowerCase() === cat.concernKey.toLowerCase() ||
                selectedConcern.toLowerCase() === cat.name.toLowerCase() ||
                selectedConcern.toLowerCase().replace(/&/g, "and") ===
                  cat.name.toLowerCase().replace(/&/g, "and"));

            return (
              <div
                key={`${cat.id}_${idx}`}
                style={{ width: `${100 / extendedList.length}%` }}
                className="shrink-0 px-1 sm:px-2 md:px-3 flex justify-center"
              >
                <button
                  type="button"
                  onClick={() => handleSelect(cat)}
                  className="group flex flex-col items-center cursor-pointer focus:outline-none w-full"
                >
                  {/* Card Frame:
                      - MOBILE (< md): Compact Elegant Arched Dome (max-w-[100px] aspect-[4/5] rounded-t-full rounded-b-sm)
                      - DESKTOP (md+): Perfect Circle Frame (aspect-square rounded-full md:max-w-[160px])
                  */}
                  <div
                    className={`relative w-full max-w-[100px] sm:max-w-[115px] md:max-w-[160px] mx-auto overflow-hidden transition-all duration-300 bg-[#f7f5f0] shadow-2xs
                      aspect-[4/5] rounded-t-full rounded-b-sm border border-neutral-200/80
                      md:aspect-square md:rounded-full md:border-neutral-200 md:bg-white
                      ${
                        isSelected
                          ? "border-2 border-[#023915] ring-2 ring-[#023915]/20 shadow-md scale-102"
                          : "group-hover:border-[#023915] group-hover:shadow-md group-hover:scale-102"
                      }`}
                  >
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      unoptimized
                      className="size-full object-cover group-hover:scale-105 transition-transform duration-500 pointer-events-none rounded-t-full md:rounded-full"
                    />
                  </div>

                  {/* Category Label Underneath */}
                  <span
                    className={`mt-1.5 sm:mt-2 text-[11px] sm:text-xs md:text-sm tracking-tight text-center transition-colors line-clamp-1 max-w-[95px] sm:max-w-[115px] md:max-w-none ${
                      isSelected
                        ? "font-bold text-[#023915]"
                        : "font-normal text-neutral-800 group-hover:text-[#023915]"
                    }`}
                  >
                    {cat.name}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Subtle Pagination Dots (Elongated active pill dot + round inactive dots) */}
      {itemCount > 3 && (
        <div className="flex items-center justify-center gap-1.5 mt-3.5 sm:mt-5">
          {baseItems.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setIsTransitioning(true);
                setCurrentIndex(itemCount + i);
              }}
              aria-label={`Go to category ${i + 1}`}
              className={`rounded-full transition-all duration-300 cursor-pointer ${
                i === activeNormalizedIndex
                  ? "w-4 sm:w-5 h-1 sm:h-1.5 bg-[#023915]"
                  : "size-1 sm:size-1.5 bg-neutral-300 hover:bg-neutral-400"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
