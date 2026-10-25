"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { products as defaultProducts, Product } from "@/lib/store";
import { getStorefrontData } from "@/lib/storefront-client";
import { trackMetaEvent } from "@/components/MetaPixel";

export interface RecentlyViewedItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAt: number;
  discount: string;
  image: string;
  images?: string[];
  badge?: string;
}

export const DEFAULT_RECENTLY_VIEWED: RecentlyViewedItem[] = [
  {
    id: "prod_1788511912600",
    name: "MADHUNASHI SYP 500ML",
    slug: "madhunashi-syp",
    price: 349,
    compareAt: 499,
    discount: "30% OFF",
    badge: "POPULAR",
    image:
      "https://res.cloudinary.com/dwadcfj3b/image/upload/v1791381365/pure_ayur_herbs/products/ospkjprkxo1rzsb6ghmy.jpg",
    images: [
      "https://res.cloudinary.com/dwadcfj3b/image/upload/v1791381365/pure_ayur_herbs/products/ospkjprkxo1rzsb6ghmy.jpg",
    ],
  },
  {
    id: "prod_1788511819071",
    name: "MADHUNASHI POWDER",
    slug: "madhunashi-powder",
    price: 769,
    compareAt: 2199,
    discount: "65% OFF",
    badge: "AYUSH CERTIFIED",
    image:
      "https://res.cloudinary.com/dwadcfj3b/image/upload/v1791381364/pure_ayur_herbs/products/kleuwprcuiyj1duvlojh.jpg",
    images: [
      "https://res.cloudinary.com/dwadcfj3b/image/upload/v1791381364/pure_ayur_herbs/products/kleuwprcuiyj1duvlojh.jpg",
    ],
  },
  {
    id: "prod_1789129223995",
    name: "VIRJA GOLD MAJUN",
    slug: "virja-gold-majun",
    price: 399,
    compareAt: 499,
    discount: "20% OFF",
    badge: "POPULAR",
    image:
      "https://res.cloudinary.com/dwadcfj3b/image/upload/v1791381369/pure_ayur_herbs/products/x2yhpnwfcsesqdjjmzll.jpg",
    images: [
      "https://res.cloudinary.com/dwadcfj3b/image/upload/v1791381369/pure_ayur_herbs/products/x2yhpnwfcsesqdjjmzll.jpg",
    ],
  },
  {
    id: "prod_1788511960374",
    name: "FAT BURNER - METABOLISM SUPPORT JUICE",
    slug: "fat-burner",
    price: 399,
    compareAt: 599,
    discount: "33% OFF",
    badge: "TOP RATED",
    image:
      "https://res.cloudinary.com/dwadcfj3b/image/upload/v1791381366/pure_ayur_herbs/products/xemjcovn6mbh6edriszp.jpg",
    images: [
      "https://res.cloudinary.com/dwadcfj3b/image/upload/v1791381366/pure_ayur_herbs/products/xemjcovn6mbh6edriszp.jpg",
    ],
  },
  {
    id: "prod_1788947560528",
    name: "VIRJA POWDER 100% PURE MEN'S POWER",
    slug: "virja-powder",
    price: 749,
    compareAt: 1499,
    discount: "50% OFF",
    badge: "BESTSELLER",
    image:
      "https://res.cloudinary.com/dwadcfj3b/image/upload/v1791381368/pure_ayur_herbs/products/hmlzvpwldh0zgunukmxk.jpg",
    images: [
      "https://res.cloudinary.com/dwadcfj3b/image/upload/v1791381368/pure_ayur_herbs/products/hmlzvpwldh0zgunukmxk.jpg",
    ],
  },
  {
    id: "prod_1788512010828",
    name: "PERFECT 36 HERBAL TONING CREAM",
    slug: "perfect-36-cream",
    price: 598,
    compareAt: 799,
    discount: "25% OFF",
    badge: "SAFE & GENTLE",
    image:
      "https://res.cloudinary.com/dwadcfj3b/image/upload/v1791381367/pure_ayur_herbs/products/aux22j4iqo4xus6bbja4.jpg",
    images: [
      "https://res.cloudinary.com/dwadcfj3b/image/upload/v1791381367/pure_ayur_herbs/products/aux22j4iqo4xus6bbja4.jpg",
    ],
  },
];

interface RecentlyViewedSectionProps {
  currentProductSlug?: string;
  items?: RecentlyViewedItem[];
  allProducts?: Product[];
  onAddToCart?: (product: Product) => void;
}

export default function RecentlyViewedSection({
  currentProductSlug,
  items,
  allProducts,
  onAddToCart,
}: RecentlyViewedSectionProps) {
  const [liveProducts, setLiveProducts] = useState<Product[]>(() =>
    Array.isArray(allProducts) && allProducts.length > 0 ? allProducts : []
  );
  const [displayItems, setDisplayItems] = useState<RecentlyViewedItem[]>(
    () => items || DEFAULT_RECENTLY_VIEWED
  );
  const [activeImageIndices, setActiveImageIndices] = useState<Record<string, number>>({});
  const [addedIds, setAddedIds] = useState<string[]>([]);

  // Keep live catalog synced from props or storefront API
  useEffect(() => {
    if (Array.isArray(allProducts) && allProducts.length > 0) {
      setLiveProducts(allProducts);
    } else {
      getStorefrontData()
        .then((data) => {
          if (data?.products && Array.isArray(data.products) && data.products.length > 0) {
            setLiveProducts(data.products);
          }
        })
        .catch(() => {});
    }
  }, [allProducts]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (items && items.length > 0) {
      const filtered = currentProductSlug
        ? items.filter((i) => i.slug !== currentProductSlug)
        : items;
      setDisplayItems(filtered.length > 0 ? filtered : items);
      return;
    }

    try {
      const productCatalog = liveProducts.length > 0 ? liveProducts : defaultProducts;
      const stored = localStorage.getItem("pyur_recently_viewed");
      let slugs: string[] = [];

      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            slugs = parsed.filter(Boolean);
          }
        } catch {}
      }

      // Filter out current product slug
      const filteredSlugs = slugs.filter((s) => s && s !== currentProductSlug);

      // Match stored products with real-time prices
      const matched: RecentlyViewedItem[] = [];
      const seenSlugs = new Set<string>();

      filteredSlugs.forEach((slug) => {
        const found = productCatalog.find(
          (p) =>
            p.slug === slug ||
            p.id === slug ||
            p.slug?.toLowerCase() === slug.toLowerCase()
        );
        if (found && !seenSlugs.has(found.slug)) {
          seenSlugs.add(found.slug);
          const price = Number(found.price) || 0;
          const compareAt = Number(found.compareAt) || Math.round(price * 1.3);
          const discount =
            compareAt > price
              ? `${Math.round(((compareAt - price) / compareAt) * 100)}% OFF`
              : "SPECIAL";
          matched.push({
            id: found.id,
            name: (found.name || "").toUpperCase(),
            slug: found.slug,
            price,
            compareAt,
            discount,
            image: found.image,
            images:
              found.images && found.images.length > 0
                ? found.images
                : [found.image],
            badge: found.badge,
          });
        }
      });

      // Backfill with other products from productCatalog
      const catalogBackfill: RecentlyViewedItem[] = [];
      productCatalog.forEach((p) => {
        if (p.slug !== currentProductSlug && !seenSlugs.has(p.slug)) {
          seenSlugs.add(p.slug);
          const price = Number(p.price) || 0;
          const compareAt = Number(p.compareAt) || Math.round(price * 1.3);
          const discount =
            compareAt > price
              ? `${Math.round(((compareAt - price) / compareAt) * 100)}% OFF`
              : "SPECIAL";
          catalogBackfill.push({
            id: p.id,
            name: (p.name || "").toUpperCase(),
            slug: p.slug,
            price,
            compareAt,
            discount,
            image: p.image,
            images:
              p.images && p.images.length > 0 ? p.images : [p.image],
            badge: p.badge,
          });
        }
      });

      // Fallback defaults if still needed
      const defaultBackfill = DEFAULT_RECENTLY_VIEWED.filter(
        (def) => def.slug !== currentProductSlug && !seenSlugs.has(def.slug)
      );

      const combined = [...matched, ...catalogBackfill, ...defaultBackfill].slice(0, 4);
      if (combined.length > 0) {
        setDisplayItems(combined);
      }
    } catch {}
  }, [currentProductSlug, liveProducts, items]);

  const handlePrevImage = (e: React.MouseEvent, id: string, total: number) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveImageIndices((prev) => {
      const current = prev[id] || 0;
      return { ...prev, [id]: current <= 0 ? total - 1 : current - 1 };
    });
  };

  const handleNextImage = (e: React.MouseEvent, id: string, total: number) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveImageIndices((prev) => {
      const current = prev[id] || 0;
      return { ...prev, [id]: current >= total - 1 ? 0 : current + 1 };
    });
  };

  const handleAddToCart = (e: React.MouseEvent, item: RecentlyViewedItem) => {
    e.preventDefault();
    e.stopPropagation();

    const itemImages = item.images && item.images.length > 0 ? item.images : [item.image];
    const currentImg = itemImages[activeImageIndices[item.id] || 0] || item.image;

    const fullProduct = (liveProducts.length > 0 ? liveProducts : defaultProducts).find(
      (p) => p.id === item.id || p.slug === item.slug
    );

    const cartProduct: Product = {
      id: item.id,
      name: fullProduct?.name || item.name,
      slug: item.slug,
      price: item.price,
      compareAt: item.compareAt,
      image: currentImg,
      images: itemImages,
      concern: fullProduct?.concern || "Ayurvedic Care",
      rating: fullProduct?.rating || 5,
      reviews: fullProduct?.reviews || 142,
      badge: item.badge || fullProduct?.badge || "",
      ingredients: fullProduct?.ingredients || ["100% Himalayan Herbs"],
      description: fullProduct?.description || item.name,
      coinsEarned: fullProduct?.coinsEarned || Math.round(item.price * 0.05),
      showCoins: true,
      deliveryDays: fullProduct?.deliveryDays || "3 - 5 Days",
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

  const [activeIndex, setActiveIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isInteractingRef = useRef(false);

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

  const renderCard = (item: RecentlyViewedItem) => {
    const itemImages =
      item.images && item.images.length > 0 ? item.images : [item.image];
    const currentImgIndex = activeImageIndices[item.id] || 0;
    const currentDisplayImage = itemImages[currentImgIndex] || item.image;
    const isAdded = addedIds.includes(item.id);

    return (
      <div
        key={item.id}
        className="group relative flex flex-col justify-between h-full rounded-2xl border border-transparent hover:border-neutral-200/90 hover:shadow-md p-2.5 sm:p-3 bg-white transition-all duration-300"
      >
        <div>
          {/* Image Container */}
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-white mb-2.5 flex items-center justify-center">
            {/* Promotional Badge */}
            {item.badge && (
              <div className="absolute top-2 left-2 z-10 pointer-events-none">
                <span className="inline-block bg-[#023915] text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-xs">
                  {item.badge}
                </span>
              </div>
            )}

            {/* Main Link to Product */}
            <Link
              href={`/products/${item.slug}`}
              className="size-full flex items-center justify-center"
            >
              <Image
                src={currentDisplayImage}
                alt={item.name}
                width={400}
                height={400}
                unoptimized
                className="size-full object-contain p-2 group-hover:scale-105 transition-transform duration-500"
              />
            </Link>

            {/* Image Navigation Arrows (Shown on Hover on Desktop if multiple images, Hidden on Mobile) */}
            {itemImages.length > 1 && (
              <div className="absolute bottom-2 right-2 z-10 hidden md:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={(e) =>
                    handlePrevImage(e, item.id, itemImages.length)
                  }
                  aria-label="Previous image"
                  className="size-6 sm:size-7 rounded-full bg-white/95 border border-neutral-200 shadow-2xs flex items-center justify-center text-neutral-700 hover:text-black hover:scale-105 transition cursor-pointer"
                >
                  <ChevronLeft className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={(e) =>
                    handleNextImage(e, item.id, itemImages.length)
                  }
                  aria-label="Next image"
                  className="size-6 sm:size-7 rounded-full bg-white/95 border border-neutral-200 shadow-2xs flex items-center justify-center text-neutral-700 hover:text-black hover:scale-105 transition cursor-pointer"
                >
                  <ChevronRight className="size-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Title */}
          <Link href={`/products/${item.slug}`} className="block">
            <h3
              className="font-bold text-xs sm:text-sm text-neutral-900 uppercase tracking-tight line-clamp-1 hover:text-[#023915] transition"
              title={item.name}
            >
              {item.name}
            </h3>
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
            onClick={(e) => handleAddToCart(e, item)}
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
    <section className="mx-auto max-w-[1200px] px-4 py-8 sm:py-12 md:px-6">
      <h2 className="font-serif text-2xl sm:text-3xl text-neutral-900 font-bold uppercase tracking-tight mb-6 sm:mb-8">
        RECENTLY VIEWED
      </h2>

      {/* Desktop View: Clean 4-Column Grid */}
      <div className="hidden md:grid md:grid-cols-4 gap-4 sm:gap-6">
        {displayItems.map((item) => renderCard(item))}
      </div>

      {/* Mobile View */}
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
                  aria-label={`Go to recently viewed product ${i + 1}`}
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
