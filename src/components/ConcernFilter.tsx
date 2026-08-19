"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { concerns as staticConcerns } from "@/lib/store";

interface ConcernFilterProps {
  selectedConcern: string | null;
  onSelectConcern: (concernName: string | null) => void;
}

export default function ConcernFilter({ selectedConcern, onSelectConcern }: ConcernFilterProps) {
  const [categories, setCategories] = useState<any[]>([]);
  const [expanded, setExpanded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/admin/all")
      .then((res) => res.json())
      .then((data) => {
        if (data.categories && data.categories.length > 0) {
          setCategories(data.categories);
        } else {
          setCategories(staticConcerns);
        }
      })
      .catch(() => {
        setCategories(staticConcerns);
      });
  }, []);

  // Sync state triggers
  useEffect(() => {
    const handleSync = () => {
      fetch("/api/admin/all")
        .then((res) => res.json())
        .then((data) => {
          if (data.categories && data.categories.length > 0) {
            setCategories(data.categories);
          }
        });
    };
    window.addEventListener("focus", handleSync);
    return () => window.removeEventListener("focus", handleSync);
  }, []);

  const handleScroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.5; // Scroll half of the view container width
      scrollRef.current.scrollTo({
        left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section id="concerns" className="mx-auto max-w-[1440px] px-4 py-4 md:px-6 md:py-6">
      {/* Desktop View: Horizontal Chips Carousel (hidden on mobile) */}
      <div className="relative group/carousel hidden md:block">
        {/* Left Chevron Button */}
        <button
          onClick={() => handleScroll("left")}
          className="absolute -left-2 top-1/2 z-20 -translate-y-1/2 rounded-full border border-[#ddddd9] bg-white/95 p-1.5 shadow-md hover:bg-[#f8faf1] text-[#244f31] flex items-center justify-center transition opacity-0 group-hover/carousel:opacity-100 duration-200 md:size-8"
          title="Scroll Left"
          type="button"
        >
          <ChevronLeft className="size-5" />
        </button>

        {/* Horizontal Chips Carousel without wrap */}
        <div
          ref={scrollRef}
          className="no-scrollbar flex flex-row flex-nowrap items-center gap-3 overflow-x-auto pb-2 scroll-smooth min-w-0"
        >
          {/* "All Remedies" Chip */}
          <button
            onClick={() => onSelectConcern(null)}
            className={`flex shrink-0 items-center gap-2 rounded-lg border px-4 py-2 text-xs font-bold transition md:px-5 md:py-2.5 md:text-sm ${
              selectedConcern === null
                ? "border-[#244f31] bg-[#eef5df] text-[#244f31] shadow-xs ring-1 ring-[#244f31]"
                : "border-[#ddddd9] bg-white text-[#17231b] hover:border-[#80a03c] hover:bg-[#f8faf1]"
            }`}
          >
            <Check className={`size-4 text-[#80a03c] transition-opacity duration-200 ${selectedConcern === null ? "opacity-100" : "opacity-40"}`} />
            <span>All Remedies</span>
          </button>

          {/* Individual Concern Chips */}
          {categories.map((c) => {
            const isSelected = selectedConcern === c.name;
            return (
              <button
                key={c.id}
                onClick={() => onSelectConcern(isSelected ? null : c.name)}
                className={`flex shrink-0 items-center gap-2.5 rounded-lg border px-4 py-2 text-xs font-bold transition md:px-5 md:py-2.5 md:text-sm ${
                  isSelected
                    ? "border-[#244f31] bg-[#eef5df] text-[#244f31] shadow-xs ring-1 ring-[#244f31]"
                    : "border-[#ddddd9] bg-white text-[#17231b] hover:border-[#80a03c] hover:bg-[#f8faf1]"
                }`}
              >
                <div className="relative flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#ddddd9] md:size-8">
                  <Image
                    src={c.image}
                    alt={c.name}
                    width={32}
                    height={32}
                    unoptimized
                    className="size-full object-cover"
                  />
                </div>
                <span>{c.name}</span>
                {isSelected && <Check className="size-4 text-[#80a03c]" />}
              </button>
            );
          })}
        </div>

        {/* Right Chevron Button */}
        <button
          onClick={() => handleScroll("right")}
          className="absolute -right-2 top-1/2 z-20 -translate-y-1/2 rounded-full border border-[#ddddd9] bg-white/95 p-1.5 shadow-md hover:bg-[#f8faf1] text-[#244f31] flex items-center justify-center transition opacity-0 group-hover/carousel:opacity-100 duration-200 md:size-8"
          title="Scroll Right"
          type="button"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>

      {/* Mobile View: Kapiva-Style Wrapped Chips (hidden on desktop) */}
      <div className="md:hidden flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-[#17231b] flex items-center gap-1.5">
            <span>🌱 Select Concern:</span>
          </span>
          {selectedConcern && (
            <span className="text-[10px] font-black uppercase text-[#244f31] bg-[#eef5df] border border-[#244f31]/20 rounded-md px-1.5 py-0.5">
              ✓ Active
            </span>
          )}
        </div>

        {/* Wrapped Chips list */}
        <div className="flex flex-wrap gap-2.5">
          {/* All Remedies Chip */}
          <button
            onClick={() => onSelectConcern(null)}
            className={`flex items-center gap-1 rounded-lg border px-3.5 py-2 text-xs font-bold transition ${
              selectedConcern === null
                ? "border-[#244f31] bg-[#eef5df] text-[#244f31] shadow-xs ring-1 ring-[#244f31]"
                : "border-[#ddddd9] bg-white text-[#17231b]"
            }`}
          >
            <span>All Remedies</span>
          </button>

          {/* Individual Concern Chips (sliced based on expanded state) */}
          {(expanded ? categories : categories.slice(0, 3)).map((c) => {
            const isSelected = selectedConcern === c.name;
            return (
              <button
                key={c.id}
                onClick={() => onSelectConcern(isSelected ? null : c.name)}
                className={`flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-xs font-bold transition ${
                  isSelected
                    ? "border-[#244f31] bg-[#eef5df] text-[#244f31] shadow-xs ring-1 ring-[#244f31]"
                    : "border-[#ddddd9] bg-white text-[#17231b]"
                }`}
              >
                <span>{c.name}</span>
              </button>
            );
          })}
        </div>

        {/* Expand / Collapse Button */}
        {categories.length > 3 && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="text-xs font-extrabold text-[#c9704c] hover:text-[#244f31] flex items-center gap-0.5 mt-1 self-start select-none"
          >
            <span>{expanded ? "See less ▲" : "See more ▼"}</span>
          </button>
        )}
      </div>
    </section>
  );
}
