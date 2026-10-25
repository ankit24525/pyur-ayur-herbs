"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import ProductCard from "./ProductCard";
import { Product } from "@/lib/store";

interface ProductRailProps {
  title: string;
  subtitle?: string;
  categorySlug?: string;
  items: Product[];
  onAddToCart?: (product: Product) => void;
  onBuyNow?: (product: Product) => void;
  disableMobileSlider?: boolean;
}

export default function ProductRail({
  title,
  subtitle,
  categorySlug,
  items,
  onAddToCart,
  onBuyNow,
  disableMobileSlider = false,
}: ProductRailProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isInteractingRef = useRef(false);

  if (!items || items.length === 0) return null;

  const isFreshArrivals =
    disableMobileSlider || title.toUpperCase().includes("FRESH ARRIVALS");

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, clientWidth, scrollWidth } = scrollContainerRef.current;
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll <= 0) return;

    // Two products visible at a time: calculate current index
    const itemWidth = (clientWidth - 12) / 2;
    if (itemWidth > 0) {
      const idx = Math.round(scrollLeft / (itemWidth + 12));
      setActiveIndex(Math.min(Math.max(0, idx), items.length - 1));
    }
  };

  const scrollToItem = (index: number) => {
    if (!scrollContainerRef.current) return;
    const { clientWidth } = scrollContainerRef.current;
    const itemWidth = (clientWidth - 12) / 2;
    scrollContainerRef.current.scrollTo({
      left: index * (itemWidth + 12),
      behavior: "smooth",
    });
    setActiveIndex(index);
  };

  // Auto-slide on mobile if more than 2 products
  useEffect(() => {
    if (isFreshArrivals || items.length <= 2) return;
    const interval = setInterval(() => {
      if (isInteractingRef.current || !scrollContainerRef.current) return;
      setActiveIndex((prev) => {
        const next = prev >= items.length - 2 ? 0 : prev + 1;
        scrollToItem(next);
        return next;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [items.length, isFreshArrivals]);

  const targetCategoryLink = categorySlug
    ? `/products?title=${encodeURIComponent(title.replace(/[^\w\s]/gi, "").trim())}`
    : "/products";

  return (
    <section className="mx-auto max-w-[1440px] px-4 md:px-8 py-6 md:py-10">
      {/* Rail Header */}
      {title && (
        <div className="text-center mb-3">
          <h2 className="text-xl md:text-3xl font-serif tracking-wider uppercase text-neutral-900 font-normal">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1 text-xs text-neutral-500 font-normal">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Centered Taitva Pill Button */}
      <div className="flex justify-center mb-6 sm:mb-8">
        <Link
          href={targetCategoryLink}
          className="rounded-full border border-neutral-700 px-5 py-1 text-xs font-medium text-neutral-800 hover:bg-neutral-900 hover:text-white transition"
        >
          View All
        </Link>
      </div>

      {/* Case A: Fresh Arrivals -> Always show 6 products in Grid (Never slider) */}
      {isFreshArrivals ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 items-start">
          {items.slice(0, 6).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
              onBuyNow={onBuyNow}
            />
          ))}
        </div>
      ) : (
        /* Case B: Category Formulation Rails (Sugar Management, Energy & Vitality, etc.) */
        <>
          {/* Desktop View: Clean 4-Column Grid */}
          <div className="hidden md:grid md:grid-cols-4 gap-6 items-start">
            {items.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
                onBuyNow={onBuyNow}
              />
            ))}
          </div>

          {/* Mobile View */}
          <div className="md:hidden">
            {/* If 2 or fewer products: Just show the 2 products side-by-side without slider/dots */}
            {items.length <= 2 ? (
              <div className="grid grid-cols-2 gap-3 items-start">
                {items.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={onAddToCart}
                    onBuyNow={onBuyNow}
                  />
                ))}
              </div>
            ) : (
              /* If more than 2 products: 2-Product Horizontal Swipe Slider with Dynamic Dots */
              <div>
                <div
                  ref={scrollContainerRef}
                  onScroll={handleScroll}
                  onTouchStart={() => {
                    isInteractingRef.current = true;
                  }}
                  onTouchEnd={() => {
                    setTimeout(() => {
                      isInteractingRef.current = false;
                    }, 3000);
                  }}
                  className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-2 pt-1 px-1 scroll-smooth"
                  style={{ WebkitOverflowScrolling: "touch" }}
                >
                  {items.map((product) => (
                    <div
                      key={product.id}
                      className="w-[calc(50%-6px)] shrink-0 snap-start flex flex-col"
                    >
                      <ProductCard
                        product={product}
                        onAddToCart={onAddToCart}
                        onBuyNow={onBuyNow}
                      />
                    </div>
                  ))}
                </div>

                {/* Pagination Dots: Dynamic number of dots matching the products in this category */}
                <div className="flex items-center justify-center gap-1.5 mt-5">
                  {items.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => scrollToItem(i)}
                      aria-label={`Go to product ${i + 1}`}
                      className={`rounded-full transition-all duration-300 cursor-pointer ${
                        i === activeIndex
                          ? "size-2.5 bg-[#023915] scale-110"
                          : "size-1.5 bg-neutral-300 hover:bg-neutral-400"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}
