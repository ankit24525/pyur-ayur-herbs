"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { trackMetaEvent } from "@/components/MetaPixel";
import { getStorefrontData } from "@/lib/storefront-client";

export interface BestSellerItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAt: number;
  discount: string;
  badge?: string;
  images: string[];
}

export const DEFAULT_BEST_SELLERS: BestSellerItem[] = [
  {
    id: "bs-1",
    name: "PACK OF 3 - MADHUNASHI SUGAR CARE FORMULA",
    slug: "madhunashi-powder",
    price: 599,
    compareAt: 1999,
    discount: "70% OFF",
    badge: "BUY 2 GET 1 FREE",
    images: [
      "https://res.cloudinary.com/dwadcfj3b/image/upload/v1791381364/pure_ayur_herbs/products/kleuwprcuiyj1duvlojh.jpg",
      "https://res.cloudinary.com/dwadcfj3b/image/upload/v1791381365/pure_ayur_herbs/products/ospkjprkxo1rzsb6ghmy.jpg",
    ],
  },
  {
    id: "bs-2",
    name: "PACK OF 2 FAT BURNER JUICE",
    slug: "fat-burner",
    price: 699,
    compareAt: 999,
    discount: "30% OFF",
    badge: "PACK OF 2",
    images: [
      "https://res.cloudinary.com/dwadcfj3b/image/upload/v1791381366/pure_ayur_herbs/products/xemjcovn6mbh6edriszp.jpg",
    ],
  },
  {
    id: "bs-3",
    name: "PACK OF 2 VIRJA GOLD MAJUN VITALITY ELIXIR",
    slug: "virja-gold-majun",
    price: 499,
    compareAt: 1999,
    discount: "75% OFF",
    badge: "BUY 1 GET 1",
    images: [
      "https://res.cloudinary.com/dwadcfj3b/image/upload/v1791381369/pure_ayur_herbs/products/x2yhpnwfcsesqdjjmzll.jpg",
      "https://res.cloudinary.com/dwadcfj3b/image/upload/v1791381368/pure_ayur_herbs/products/hmlzvpwldh0zgunukmxk.jpg",
    ],
  },
  {
    id: "bs-4",
    name: "PERFECT 36 BREAST BODY TONING CREAM",
    slug: "perfect-36-cream",
    price: 598,
    compareAt: 799,
    discount: "25% OFF",
    badge: "SAFE & GENTLE",
    images: [
      "https://res.cloudinary.com/dwadcfj3b/image/upload/v1791381367/pure_ayur_herbs/products/aux22j4iqo4xus6bbja4.jpg",
    ],
  },
  {
    id: "bs-5",
    name: "VIRJA POWDER MEN'S STAMINA & ENERGY BOOSTER",
    slug: "virja-powder",
    price: 1199,
    compareAt: 1499,
    discount: "20% OFF",
    badge: "BESTSELLER",
    images: [
      "https://res.cloudinary.com/dwadcfj3b/image/upload/v1791381368/pure_ayur_herbs/products/hmlzvpwldh0zgunukmxk.jpg",
    ],
  },
  {
    id: "bs-6",
    name: "MADHUNASHI SYRUP 500ML - SUGAR MANAGEMENT",
    slug: "madhunashi-syp",
    price: 410,
    compareAt: 499,
    discount: "18% OFF",
    badge: "POPULAR",
    images: [
      "https://res.cloudinary.com/dwadcfj3b/image/upload/v1791381365/pure_ayur_herbs/products/ospkjprkxo1rzsb6ghmy.jpg",
    ],
  },
];

interface BestSellersSectionProps {
  onAddToCart?: (product: any) => void;
  items?: BestSellerItem[];
  currentProductSlug?: string;
}

export default function BestSellersSection({
  onAddToCart,
  items,
  currentProductSlug,
}: BestSellersSectionProps) {
  const [displayItems, setDisplayItems] = useState<BestSellerItem[]>(() => {
    const source = items || DEFAULT_BEST_SELLERS;
    if (currentProductSlug) {
      const filtered = source.filter((item) => item.slug !== currentProductSlug);
      return filtered.length > 0 ? filtered : source;
    }
    return source;
  });

  const [activeImageIndices, setActiveImageIndices] = useState<Record<string, number>>({});
  const [addedIds, setAddedIds] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isInteractingRef = useRef(false);

  useEffect(() => {
    if (items && items.length > 0) {
      const filtered = currentProductSlug
        ? items.filter((item) => item.slug !== currentProductSlug)
        : items;
      setDisplayItems(filtered.length > 0 ? filtered : items);
      return;
    }

    getStorefrontData(true)
      .then((data) => {
        if (data && Array.isArray(data.products) && data.products.length > 0) {
          const liveMapped: BestSellerItem[] = data.products.map((p: any) => {
            const price = Number(p.price) || 0;
            const compareAt = Number(p.compareAt || p.mrp) || Math.round(price * 1.25);
            const discPercent = compareAt > price ? Math.round(((compareAt - price) / compareAt) * 100) : 0;
            return {
              id: p.id,
              name: p.name,
              slug: p.slug,
              price,
              compareAt,
              discount: p.discount || (discPercent > 0 ? `${discPercent}% OFF` : ""),
              badge: p.badge || (discPercent >= 50 ? "SPECIAL OFFER" : "BESTSELLER"),
              images: Array.isArray(p.images) && p.images.length > 0 ? p.images : [p.image],
            };
          });

          const filtered = currentProductSlug
            ? liveMapped.filter((item) => item.slug !== currentProductSlug)
            : liveMapped;
          if (filtered.length > 0) {
            setDisplayItems(filtered);
            return;
          }
        }
        const source = DEFAULT_BEST_SELLERS;
        const filtered = currentProductSlug
          ? source.filter((item) => item.slug !== currentProductSlug)
          : source;
        setDisplayItems(filtered.length > 0 ? filtered : source);
      })
      .catch(() => {
        const source = DEFAULT_BEST_SELLERS;
        const filtered = currentProductSlug
          ? source.filter((item) => item.slug !== currentProductSlug)
          : source;
        setDisplayItems(filtered.length > 0 ? filtered : source);
      });
  }, [currentProductSlug, items]);

  const handlePrevImage = (id: string, total: number) => {
    setActiveImageIndices((prev) => {
      const current = prev[id] || 0;
      return { ...prev, [id]: current <= 0 ? total - 1 : current - 1 };
    });
  };

  const handleNextImage = (id: string, total: number) => {
    setActiveImageIndices((prev) => {
      const current = prev[id] || 0;
      return { ...prev, [id]: current >= total - 1 ? 0 : current + 1 };
    });
  };

  const handleAdd = (item: BestSellerItem) => {
    const currentImgIdx = activeImageIndices[item.id] || 0;
    const currentImg = item.images[currentImgIdx] || item.images[0];

    const cartProduct = {
      id: item.id,
      name: item.name,
      slug: item.slug,
      concern: "Ayurvedic Care",
      price: item.price,
      compareAt: item.compareAt,
      rating: 5.0,
      reviews: 142,
      badge: item.badge || "BESTSELLER",
      image: currentImg,
      images: item.images,
      ingredients: ["100% Himalayan Herbs"],
      description: item.name,
      coinsEarned: Math.round(item.price * 0.05),
      showCoins: true,
      deliveryDays: "3 - 5 Days",
      inStock: true,
    };

    if (onAddToCart) {
      onAddToCart(cartProduct);
    } else {
      try {
        const stored = localStorage.getItem("pyur_cart");
        let cart = stored ? JSON.parse(stored) : [];
        const existing = cart.find(
          (i: any) => i && i.product && i.product.id === cartProduct.id
        );
        if (existing) {
          cart = cart.map((i: any) =>
            i.product.id === cartProduct.id
              ? { ...i, quantity: (i.quantity || 1) + 1 }
              : i
          );
        } else {
          cart.push({ product: cartProduct, quantity: 1 });
        }
        localStorage.setItem("pyur_cart", JSON.stringify(cart));
        setTimeout(() => {
          window.dispatchEvent(new Event("pyur_cart_updated"));
        }, 0);
      } catch {}
    }

    try {
      trackMetaEvent("AddToCart", {
        content_name: item.name,
        content_ids: [item.id],
        content_type: "product",
        value: item.price,
        currency: "INR",
      });
    } catch {}

    setAddedIds((prev) => [...prev, item.id]);
    setTimeout(() => {
      setAddedIds((prev) => prev.filter((id) => id !== item.id));
    }, 2000);
  };

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, clientWidth, scrollWidth } = scrollContainerRef.current;
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll <= 0) return;

    // Two products visible at a time: calculate current index
    const itemWidth = (clientWidth - 12) / 2;
    if (itemWidth > 0) {
      const idx = Math.round(scrollLeft / (itemWidth + 12));
      setActiveIndex(Math.min(Math.max(0, idx), displayItems.length - 1));
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
    if (displayItems.length <= 2) return;
    const interval = setInterval(() => {
      if (isInteractingRef.current || !scrollContainerRef.current) return;
      setActiveIndex((prev) => {
        const next = prev >= displayItems.length - 2 ? 0 : prev + 1;
        scrollToItem(next);
        return next;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [displayItems.length]);

  if (!displayItems || displayItems.length === 0) return null;

  const renderCard = (item: BestSellerItem) => {
    const currentImgIdx = activeImageIndices[item.id] || 0;
    const currentImage = item.images[currentImgIdx] || item.images[0];
    const hasMultipleImages = item.images.length > 1;
    const isAdded = addedIds.includes(item.id);

    return (
      <div
        key={item.id}
        className="group relative flex flex-col justify-between h-full rounded-2xl border border-transparent hover:border-neutral-200/90 hover:shadow-md p-2.5 sm:p-3 bg-white transition-all duration-300"
      >
        <div>
          {/* Image Stage */}
          <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-white flex items-center justify-center mb-2.5">
            {/* Floating Promotional Badge */}
            {item.badge && (
              <div className="absolute top-2 left-2 z-10 pointer-events-none">
                {item.badge.includes("BUY") ? (
                  <span className="inline-block bg-gradient-to-r from-red-600 to-amber-600 text-white font-black text-[9px] sm:text-[10px] uppercase px-2 py-0.5 rounded shadow-xs tracking-wider">
                    {item.badge}
                  </span>
                ) : (
                  <span className="inline-block bg-[#023915] text-white font-black text-[9px] sm:text-[10px] uppercase px-2 py-0.5 rounded shadow-xs tracking-wider">
                    {item.badge}
                  </span>
                )}
              </div>
            )}

            {/* Product Packshot */}
            <Link href={`/products/${item.slug}`} className="size-full block p-2">
              <Image
                src={currentImage}
                alt={item.name}
                width={400}
                height={400}
                unoptimized
                className="size-full object-contain group-hover:scale-105 transition-transform duration-500"
              />
            </Link>

            {/* Circular Chevrons (Bottom Right) to flip images */}
            {hasMultipleImages && (
              <div className="absolute bottom-2 right-2 z-10 hidden md:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handlePrevImage(item.id, item.images.length);
                  }}
                  aria-label="Previous image"
                  className="size-6 sm:size-7 rounded-full bg-white/95 border border-neutral-200 shadow-2xs flex items-center justify-center text-neutral-700 hover:text-black hover:scale-105 transition cursor-pointer"
                >
                  <ChevronLeft className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleNextImage(item.id, item.images.length);
                  }}
                  aria-label="Next image"
                  className="size-6 sm:size-7 rounded-full bg-white/95 border border-neutral-200 shadow-2xs flex items-center justify-center text-neutral-700 hover:text-black hover:scale-105 transition cursor-pointer"
                >
                  <ChevronRight className="size-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Title */}
          <Link
            href={`/products/${item.slug}`}
            className="block font-bold text-xs sm:text-sm text-neutral-900 uppercase tracking-tight line-clamp-1 hover:text-[#023915] transition"
            title={item.name}
          >
            {item.name}
          </Link>

          {/* Price Row */}
          <div className="flex items-baseline gap-2 mt-1.5 flex-wrap">
            <span className="text-sm sm:text-base font-extrabold text-neutral-900">
              ₹{item.price.toLocaleString("en-IN")}
            </span>
            {item.compareAt > item.price && (
              <span className="text-xs text-neutral-400 font-semibold line-through">
                ₹{item.compareAt.toLocaleString("en-IN")}
              </span>
            )}
            {item.discount && (
              <span className="text-xs font-black text-emerald-800">
                {item.discount}
              </span>
            )}
          </div>
        </div>

        {/* Add to Bag Button (Revealed on hover on desktop, accessible on mobile) */}
        <div className="mt-3.5 pt-0.5 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto max-md:opacity-100 max-md:pointer-events-auto transition-opacity duration-200">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleAdd(item);
            }}
            className={`w-full rounded-xl py-2.5 text-xs font-bold uppercase tracking-wider transition cursor-pointer text-center flex items-center justify-center gap-1.5 shadow-2xs ${
              isAdded
                ? "bg-[#023915] text-white border border-[#023915]"
                : "border border-[#023915] text-[#023915] hover:bg-[#023915] hover:text-white bg-white"
            }`}
          >
            {isAdded ? (
              <>
                <Check className="size-3.5 stroke-[3]" />
                <span>Added to Bag</span>
              </>
            ) : (
              <span>Add to Bag</span>
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <section className="mx-auto max-w-[1200px] px-4 py-8 sm:py-12 md:px-6 border-t border-neutral-200/60">
      {/* Header & View All button */}
      <div className="mb-6 sm:mb-8">
        <h2 className="font-serif text-2xl sm:text-3xl text-neutral-900 font-bold uppercase tracking-tight">
          BEST SELLERS
        </h2>
        <Link
          href="/products?title=Best+Sellers"
          className="inline-block mt-2.5 rounded-full border border-neutral-700 px-5 py-1 text-xs font-medium text-neutral-800 hover:bg-neutral-900 hover:text-white transition cursor-pointer"
        >
          View All
        </Link>
      </div>

      {/* Desktop View: Clean 4-Column Grid */}
      <div className="hidden md:grid md:grid-cols-4 gap-4 sm:gap-6">
        {displayItems.slice(0, 4).map((item) => renderCard(item))}
      </div>

      {/* Mobile View: 2-Product Horizontal Swipe Slider with Dynamic Dots */}
      <div className="md:hidden">
        {displayItems.length <= 2 ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {displayItems.map((item) => renderCard(item))}
          </div>
        ) : (
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
              {displayItems.map((item) => (
                <div
                  key={item.id}
                  className="w-[calc(50%-6px)] shrink-0 snap-start flex flex-col"
                >
                  {renderCard(item)}
                </div>
              ))}
            </div>

            {/* Pagination Dots */}
            <div className="flex items-center justify-center gap-1.5 mt-5">
              {displayItems.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => scrollToItem(i)}
                  aria-label={`Go to best seller product ${i + 1}`}
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
    </section>
  );
}
