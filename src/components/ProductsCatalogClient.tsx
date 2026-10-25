"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Check,
  X,
  Search,
  Home,
  User,
  Menu,
} from "lucide-react";
import AnnouncementBar from "@/components/AnnouncementBar";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Product, products as storeProducts } from "@/lib/store";
import { getStorefrontData } from "@/lib/storefront-client";
import { trackMetaEvent } from "@/components/MetaPixel";
import GetAppModal from "@/components/GetAppModal";

export interface CatalogDisplayItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAt: number;
  discount: string;
  badge?: string;
  productType: "Juice" | "Powder" | "Majun" | "Cream";
  size: "100ml" | "300ml" | "500ml" | "1000ml";
  variant: "Single" | "Pack of 2" | "Pack of 3" | "Pack of 6";
  images: string[];
  concern?: string;
}

// Curated bundle items export for backwards compatibility
export const ALL_CATALOG_ITEMS: CatalogDisplayItem[] = [];

const inferProductType = (name: string, category?: string): "Juice" | "Powder" | "Majun" | "Cream" => {
  const n = (name + " " + (category || "")).toLowerCase();
  if (n.includes("juice") || n.includes("syp") || n.includes("syrup") || n.includes("elixir") || n.includes("oil")) return "Juice";
  if (n.includes("powder") || n.includes("churna") || n.includes("shilajit")) return "Powder";
  if (n.includes("majun") || n.includes("paste") || n.includes("chyawanprash")) return "Majun";
  if (n.includes("cream") || n.includes("gel") || n.includes("lotion") || n.includes("ointment")) return "Cream";
  return "Powder";
};

const inferSize = (name: string): "100ml" | "300ml" | "500ml" | "1000ml" => {
  const n = name.toLowerCase();
  if (n.includes("1000ml") || n.includes("1l") || n.includes("1 liter")) return "1000ml";
  if (n.includes("500ml") || n.includes("500g") || n.includes("500gm")) return "500ml";
  if (n.includes("300ml") || n.includes("300g") || n.includes("200g") || n.includes("250g")) return "300ml";
  return "100ml";
};

const inferVariant = (name: string): "Single" | "Pack of 2" | "Pack of 3" | "Pack of 6" => {
  const n = name.toLowerCase();
  if (n.includes("pack of 6") || n.includes("pack 6") || n.includes("6 pack")) return "Pack of 6";
  if (n.includes("pack of 3") || n.includes("pack 3") || n.includes("3 pack") || n.includes("buy 2 get 1")) return "Pack of 3";
  if (n.includes("pack of 2") || n.includes("pack 2") || n.includes("2 pack") || n.includes("buy 1 get 1")) return "Pack of 2";
  return "Single";
};

const mapProductToCatalogItem = (p: Product): CatalogDisplayItem => {
  const price = Number(p.price) || 0;
  const compareAt = Number(p.compareAt || (p as any).mrp) || Math.round(price * 1.25);
  const discPercent = compareAt > price ? Math.round(((compareAt - price) / compareAt) * 100) : 0;
  const discountStr = (p as any).discount || (discPercent > 0 ? `${discPercent}% OFF` : "");
  const pImages = Array.isArray(p.images) && p.images.length > 0 ? p.images : [p.image];

  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    price,
    compareAt,
    discount: discountStr,
    badge: (p as any).badge || (discPercent >= 50 ? "SPECIAL OFFER" : discPercent > 0 ? "POPULAR" : undefined),
    productType: inferProductType(p.name, (p as any).category),
    size: inferSize(p.name),
    variant: inferVariant(p.name),
    images: pImages,
    concern: p.concern || (p as any).category || "Wellness",
  };
};

interface ProductsCatalogClientProps {
  initialTitle?: string;
  initialCategory?: string;
  initialProducts?: Product[];
}

export default function ProductsCatalogClient({
  initialTitle = "New Arrivals",
  initialCategory,
  initialProducts,
}: ProductsCatalogClientProps) {
  const [pageTitle, setPageTitle] = useState(initialTitle);
  const [catalogProducts, setCatalogProducts] = useState<Product[]>(() =>
    Array.isArray(initialProducts) && initialProducts.length > 0 ? initialProducts : []
  );

  useEffect(() => {
    if (initialProducts && initialProducts.length > 0) {
      setCatalogProducts(initialProducts);
    }
  }, [initialProducts]);

  useEffect(() => {
    getStorefrontData(true)
      .then((data) => {
        if (data && data.products && Array.isArray(data.products) && data.products.length > 0) {
          setCatalogProducts(data.products);
        }
      })
      .catch(() => {});

    const handleSync = (e: any) => {
      if (e?.detail?.key === "products" && Array.isArray(e.detail.value)) {
        setCatalogProducts(e.detail.value);
      }
    };
    window.addEventListener("pyur_storefront_updated", handleSync);
    return () => window.removeEventListener("pyur_storefront_updated", handleSync);
  }, []);
  const [selectedProductType, setSelectedProductType] = useState<string>("all");
  const [selectedSize, setSelectedSize] = useState<string>("all");
  const [selectedVariant, setSelectedVariant] = useState<string>("all");
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"popularity" | "price-asc" | "price-desc" | "discount">("popularity");

  // Mobile Drawers
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [sortDrawerOpen, setSortDrawerOpen] = useState(false);

  // Dropdown open states for desktop
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPageTitle(initialTitle);
  }, [initialTitle]);

  // Close desktop dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Packshot photo navigation state
  const [activeImageIndices, setActiveImageIndices] = useState<Record<string, number>>({});
  const [addedIds, setAddedIds] = useState<string[]>([]);
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [appModalOpen, setAppModalOpen] = useState(false);

  useEffect(() => {
    const syncCart = () => {
      if (typeof window === "undefined") return;
      try {
        const stored = localStorage.getItem("pyur_cart");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            const valid = parsed.filter(
              (i: any) => i && i.product && typeof i.product === "object" && i.product.id
            );
            setCart(valid);
          }
        } else {
          setCart([]);
        }
      } catch {}
    };

    syncCart();
    window.addEventListener("storage", syncCart);
    window.addEventListener("pyur_cart_updated", syncCart);
    return () => {
      window.removeEventListener("storage", syncCart);
      window.removeEventListener("pyur_cart_updated", syncCart);
    };
  }, []);

  const handleUpdateQuantity = (productId: string, delta: number) => {
    let currentCart = cart;
    try {
      const stored = localStorage.getItem("pyur_cart");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) currentCart = parsed;
      }
    } catch {}

    const updated = currentCart
      .map((item) => {
        if (item && item.product && item.product.id === productId) {
          const newQty = (Number(item.quantity) || 1) + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      })
      .filter(Boolean) as { product: Product; quantity: number }[];

    setCart(updated);
    try {
      localStorage.setItem("pyur_cart", JSON.stringify(updated));
      setTimeout(() => {
        window.dispatchEvent(new Event("pyur_cart_updated"));
      }, 0);
    } catch {}
  };

  const handleRemoveItem = (productId: string) => {
    let currentCart = cart;
    try {
      const stored = localStorage.getItem("pyur_cart");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) currentCart = parsed;
      }
    } catch {}

    const updated = currentCart.filter(
      (item) => item && item.product && item.product.id !== productId
    );

    setCart(updated);
    try {
      localStorage.setItem("pyur_cart", JSON.stringify(updated));
      setTimeout(() => {
        window.dispatchEvent(new Event("pyur_cart_updated"));
      }, 0);
    } catch {}
  };

  const handlePrevImage = (e: React.MouseEvent, id: string, total: number) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveImageIndices((prev) => {
      const cur = prev[id] || 0;
      return { ...prev, [id]: cur <= 0 ? total - 1 : cur - 1 };
    });
  };

  const handleNextImage = (e: React.MouseEvent, id: string, total: number) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveImageIndices((prev) => {
      const cur = prev[id] || 0;
      return { ...prev, [id]: cur >= total - 1 ? 0 : cur + 1 };
    });
  };

  const handleAddToCart = (item: CatalogDisplayItem) => {
    const currentImg = item.images[activeImageIndices[item.id] || 0] || item.images[0];
    const cartProduct: Product = {
      id: item.id,
      name: item.name,
      slug: item.slug,
      price: item.price,
      compareAt: item.compareAt,
      image: currentImg,
      images: item.images,
      concern: item.concern || "Wellness",
      rating: 5,
      reviews: 120,
      badge: item.badge || "",
      ingredients: ["Shilajit", "Ashwagandha", "Amla", "Sea Buckthorn"],
      description: item.name,
      coinsEarned: Math.floor(item.price * 0.1),
      deliveryDays: "2-3 business days",
      inStock: true,
    };

    let currentCart = cart;
    try {
      const stored = localStorage.getItem("pyur_cart");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) currentCart = parsed;
      }
    } catch {}

    const existing = currentCart.find((i) => i.product && i.product.id === cartProduct.id);
    let updated: { product: Product; quantity: number }[];
    if (existing) {
      updated = currentCart.map((i) =>
        i.product.id === cartProduct.id ? { ...i, quantity: (Number(i.quantity) || 1) + 1 } : i
      );
    } else {
      updated = [...currentCart, { product: cartProduct, quantity: 1 }];
    }

    setCart(updated);

    try {
      localStorage.setItem("pyur_cart", JSON.stringify(updated));
      setTimeout(() => {
        window.dispatchEvent(new Event("pyur_cart_updated"));
      }, 0);
    } catch {}

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

  // Filter & Sort Logic: strictly authentic products from live database
  const filteredItems = useMemo(() => {
    const sourceProducts =
      Array.isArray(catalogProducts) && catalogProducts.length > 0
        ? catalogProducts
        : Array.isArray(initialProducts) && initialProducts.length > 0
        ? initialProducts
        : storeProducts;

    let result = sourceProducts.map(mapProductToCatalogItem);

    // Product Type filter
    if (selectedProductType !== "all") {
      result = result.filter((item) => item.productType === selectedProductType);
    }

    // Size filter
    if (selectedSize !== "all") {
      result = result.filter((item) => item.size === selectedSize);
    }

    // Variant / Pack filter
    if (selectedVariant !== "all") {
      result = result.filter((item) => item.variant === selectedVariant);
    }

    // Price Range filter
    if (selectedPriceRange === "under-500") {
      result = result.filter((item) => item.price < 500);
    } else if (selectedPriceRange === "500-1000") {
      result = result.filter((item) => item.price >= 500 && item.price <= 1000);
    } else if (selectedPriceRange === "above-1000") {
      result = result.filter((item) => item.price > 1000);
    }

    // Sorting
    if (sortBy === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "discount") {
      result.sort((a, b) => {
        const discA = a.compareAt > a.price ? (a.compareAt - a.price) / a.compareAt : 0;
        const discB = b.compareAt > b.price ? (b.compareAt - b.price) / b.compareAt : 0;
        return discB - discA;
      });
    }

    return result;
  }, [catalogProducts, initialProducts, selectedProductType, selectedSize, selectedVariant, selectedPriceRange, sortBy]);

  const activeFilterCount =
    (selectedProductType !== "all" ? 1 : 0) +
    (selectedSize !== "all" ? 1 : 0) +
    (selectedVariant !== "all" ? 1 : 0) +
    (selectedPriceRange !== "all" ? 1 : 0);

  const hasActiveFilters = activeFilterCount > 0;

  const clearAllFilters = () => {
    setSelectedProductType("all");
    setSelectedSize("all");
    setSelectedVariant("all");
    setSelectedPriceRange("all");
    setSortBy("popularity");
  };

  return (
    <div className="flex min-h-screen flex-col bg-white text-neutral-900">
      <AnnouncementBar onOpenAppModal={() => setAppModalOpen(true)} />
      <SiteHeader
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onOpenAppModal={() => setAppModalOpen(true)}
        products={storeProducts}
      />

      <main className="flex-1 max-w-[1280px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-10 pb-24 md:pb-10">
        {/* Centered Serif Heading (Exact match to screenshot) */}
        <div className="text-center my-3 sm:my-6">
          <h1 className="font-serif text-3xl sm:text-4xl text-neutral-900 font-normal tracking-tight">
            {pageTitle}
          </h1>
        </div>

        {/* ========================================================================= */}
        {/* MOBILE FILTER & SORT SPLIT TOOLBAR (Exact match to screenshot)            */}
        {/* ========================================================================= */}
        <div className="md:hidden grid grid-cols-2 rounded-2xl bg-[#f5f5f5] p-1 my-4 border border-neutral-200/60 shadow-2xs">
          <button
            type="button"
            onClick={() => setFilterDrawerOpen(true)}
            className="flex items-center justify-center gap-2 py-3 text-xs font-bold text-neutral-900 border-r border-neutral-300 active:bg-neutral-200/60 transition cursor-pointer"
          >
            <SlidersHorizontal className="size-3.5 text-neutral-700" />
            <span>Filters {hasActiveFilters ? `(${activeFilterCount})` : ""}</span>
          </button>
          <button
            type="button"
            onClick={() => setSortDrawerOpen(true)}
            className="flex items-center justify-center gap-2 py-3 text-xs font-bold text-neutral-900 active:bg-neutral-200/60 transition cursor-pointer"
          >
            <SlidersHorizontal className="size-3.5 text-neutral-700" />
            <span className="truncate max-w-[130px]">
              Sort:{" "}
              {sortBy === "popularity"
                ? "Popularity"
                : sortBy === "price-asc"
                ? "Price Low-High"
                : sortBy === "price-desc"
                ? "Price High-Low"
                : "Discount"}
            </span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* DESKTOP FILTER & SORT TOOLBAR BAR                                         */}
        {/* ========================================================================= */}
        <div
          ref={dropdownRef}
          className="hidden md:flex relative bg-[#f5f5f5] rounded-xl px-6 py-2.5 flex-wrap items-center justify-between gap-3 text-xs text-neutral-800 my-6 shadow-2xs"
        >
          {/* Left Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-6">
            {/* 1. Product Type */}
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setActiveDropdown(activeDropdown === "type" ? null : "type")
                }
                className="flex items-center gap-1.5 font-medium hover:text-[#023915] transition cursor-pointer"
              >
                <span>
                  {selectedProductType === "all"
                    ? "Product Type"
                    : `Type: ${selectedProductType}`}
                </span>
                <ChevronDown
                  className={`size-3 text-neutral-500 transition-transform ${
                    activeDropdown === "type" ? "rotate-180" : ""
                  }`}
                />
              </button>

              {activeDropdown === "type" && (
                <div className="absolute left-0 top-full mt-2 w-48 rounded-xl bg-white border border-neutral-200 p-1.5 shadow-xl z-30 animate-in fade-in zoom-in-95 duration-100">
                  {[
                    { label: "All Types", val: "all" },
                    { label: "Juices / Kwath", val: "Juice" },
                    { label: "Powders / Churna", val: "Powder" },
                    { label: "Majun / Elixir", val: "Majun" },
                    { label: "Massage Creams", val: "Cream" },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => {
                        setSelectedProductType(opt.val);
                        setActiveDropdown(null);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs rounded-lg transition ${
                        selectedProductType === opt.val
                          ? "bg-[#c2d4c5]/30 text-[#023915] font-bold"
                          : "text-neutral-700 hover:bg-neutral-50"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Size */}
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setActiveDropdown(activeDropdown === "size" ? null : "size")
                }
                className="flex items-center gap-1.5 font-medium hover:text-[#023915] transition cursor-pointer"
              >
                <span>
                  {selectedSize === "all" ? "Size" : `Size: ${selectedSize}`}
                </span>
                <ChevronDown
                  className={`size-3 text-neutral-500 transition-transform ${
                    activeDropdown === "size" ? "rotate-180" : ""
                  }`}
                />
              </button>

              {activeDropdown === "size" && (
                <div className="absolute left-0 top-full mt-2 w-44 rounded-xl bg-white border border-neutral-200 p-1.5 shadow-xl z-30 animate-in fade-in zoom-in-95 duration-100">
                  {[
                    { label: "All Sizes", val: "all" },
                    { label: "100ml / 100g", val: "100ml" },
                    { label: "300ml / 300g", val: "300ml" },
                    { label: "500ml / 500g", val: "500ml" },
                    { label: "1000ml / 1kg", val: "1000ml" },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => {
                        setSelectedSize(opt.val);
                        setActiveDropdown(null);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs rounded-lg transition ${
                        selectedSize === opt.val
                          ? "bg-[#c2d4c5]/30 text-[#023915] font-bold"
                          : "text-neutral-700 hover:bg-neutral-50"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Colour/Variant */}
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setActiveDropdown(activeDropdown === "variant" ? null : "variant")
                }
                className="flex items-center gap-1.5 font-medium hover:text-[#023915] transition cursor-pointer"
              >
                <span>
                  {selectedVariant === "all"
                    ? "Colour/Variant"
                    : `Variant: ${selectedVariant}`}
                </span>
                <ChevronDown
                  className={`size-3 text-neutral-500 transition-transform ${
                    activeDropdown === "variant" ? "rotate-180" : ""
                  }`}
                />
              </button>

              {activeDropdown === "variant" && (
                <div className="absolute left-0 top-full mt-2 w-48 rounded-xl bg-white border border-neutral-200 p-1.5 shadow-xl z-30 animate-in fade-in zoom-in-95 duration-100">
                  {[
                    { label: "All Variants", val: "all" },
                    { label: "Single Unit", val: "Single" },
                    { label: "Pack of 2", val: "Pack of 2" },
                    { label: "Pack of 3", val: "Pack of 3" },
                    { label: "Pack of 6", val: "Pack of 6" },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => {
                        setSelectedVariant(opt.val);
                        setActiveDropdown(null);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs rounded-lg transition ${
                        selectedVariant === opt.val
                          ? "bg-[#c2d4c5]/30 text-[#023915] font-bold"
                          : "text-neutral-700 hover:bg-neutral-50"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 4. Price Range */}
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setActiveDropdown(activeDropdown === "price" ? null : "price")
                }
                className="flex items-center gap-1.5 font-medium hover:text-[#023915] transition cursor-pointer"
              >
                <span>
                  {selectedPriceRange === "all"
                    ? "Price Range"
                    : selectedPriceRange === "under-500"
                    ? "Under ₹500"
                    : selectedPriceRange === "500-1000"
                    ? "₹500 - ₹1,000"
                    : "Above ₹1,000"}
                </span>
                <ChevronDown
                  className={`size-3 text-neutral-500 transition-transform ${
                    activeDropdown === "price" ? "rotate-180" : ""
                  }`}
                />
              </button>

              {activeDropdown === "price" && (
                <div className="absolute left-0 top-full mt-2 w-44 rounded-xl bg-white border border-neutral-200 p-1.5 shadow-xl z-30 animate-in fade-in zoom-in-95 duration-100">
                  {[
                    { label: "All Prices", val: "all" },
                    { label: "Under ₹500", val: "under-500" },
                    { label: "₹500 – ₹1,000", val: "500-1000" },
                    { label: "Above ₹1,000", val: "above-1000" },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => {
                        setSelectedPriceRange(opt.val);
                        setActiveDropdown(null);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs rounded-lg transition ${
                        selectedPriceRange === opt.val
                          ? "bg-[#c2d4c5]/30 text-[#023915] font-bold"
                          : "text-neutral-700 hover:bg-neutral-50"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Sort Dropdown */}
          <div className="relative ml-auto">
            <button
              type="button"
              onClick={() =>
                setActiveDropdown(activeDropdown === "sort" ? null : "sort")
              }
              className="flex items-center gap-1.5 font-medium hover:text-[#023915] transition cursor-pointer"
            >
              <SlidersHorizontal className="size-3 text-neutral-600" />
              <span>
                Sort:{" "}
                {sortBy === "popularity"
                  ? "Popularity"
                  : sortBy === "price-asc"
                  ? "Price: Low to High"
                  : sortBy === "price-desc"
                  ? "Price: High to Low"
                  : "Highest Discount"}
              </span>
              <ChevronDown
                className={`size-3 text-neutral-500 transition-transform ${
                  activeDropdown === "sort" ? "rotate-180" : ""
                }`}
              />
            </button>

            {activeDropdown === "sort" && (
              <div className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-white border border-neutral-200 p-1.5 shadow-xl z-30 animate-in fade-in zoom-in-95 duration-100">
                {[
                  { label: "Popularity", val: "popularity" },
                  { label: "Price: Low to High", val: "price-asc" },
                  { label: "Price: High to Low", val: "price-desc" },
                  { label: "Highest Discount", val: "discount" },
                ].map((opt) => (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => {
                      setSortBy(opt.val as any);
                      setActiveDropdown(null);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs rounded-lg transition ${
                      sortBy === opt.val
                        ? "bg-[#c2d4c5]/30 text-[#023915] font-bold"
                        : "text-neutral-700 hover:bg-neutral-50"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Active Filters Pill Bar (Shown when active on desktop or mobile) */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mb-4 text-xs animate-in fade-in duration-150">
            <span className="text-neutral-500 font-medium">Active Filters:</span>
            {selectedProductType !== "all" && (
              <span className="inline-flex items-center gap-1 bg-[#c2d4c5]/30 text-[#023915] px-2.5 py-1 rounded-full font-semibold">
                Type: {selectedProductType}
                <button
                  type="button"
                  onClick={() => setSelectedProductType("all")}
                  className="hover:text-black cursor-pointer"
                >
                  <X className="size-3" />
                </button>
              </span>
            )}
            {selectedSize !== "all" && (
              <span className="inline-flex items-center gap-1 bg-[#c2d4c5]/30 text-[#023915] px-2.5 py-1 rounded-full font-semibold">
                Size: {selectedSize}
                <button
                  type="button"
                  onClick={() => setSelectedSize("all")}
                  className="hover:text-black cursor-pointer"
                >
                  <X className="size-3" />
                </button>
              </span>
            )}
            {selectedVariant !== "all" && (
              <span className="inline-flex items-center gap-1 bg-[#c2d4c5]/30 text-[#023915] px-2.5 py-1 rounded-full font-semibold">
                Variant: {selectedVariant}
                <button
                  type="button"
                  onClick={() => setSelectedVariant("all")}
                  className="hover:text-black cursor-pointer"
                >
                  <X className="size-3" />
                </button>
              </span>
            )}
            {selectedPriceRange !== "all" && (
              <span className="inline-flex items-center gap-1 bg-[#c2d4c5]/30 text-[#023915] px-2.5 py-1 rounded-full font-semibold">
                Price: {selectedPriceRange}
                <button
                  type="button"
                  onClick={() => setSelectedPriceRange("all")}
                  className="hover:text-black cursor-pointer"
                >
                  <X className="size-3" />
                </button>
              </span>
            )}
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-neutral-500 hover:text-[#023915] underline ml-2 cursor-pointer"
            >
              Clear all
            </button>
          </div>
        )}

        {/* 2-Column Mobile & 4-Column Desktop Product Catalog Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-neutral-300 rounded-2xl my-6">
            <p className="text-sm text-neutral-600">No products match your selected filters.</p>
            <button
              type="button"
              onClick={clearAllFilters}
              className="mt-3 inline-block rounded-full border border-neutral-800 px-5 py-1.5 text-xs font-semibold text-neutral-800 hover:bg-neutral-900 hover:text-white transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 items-start">
            {filteredItems.map((item) => {
              const currentImgIdx = activeImageIndices[item.id] || 0;
              const currentImage = item.images[currentImgIdx] || item.images[0];
              const totalImages = item.images.length;
              const isAdded = addedIds.includes(item.id);

              return (
                <div
                  key={item.id}
                  className="group relative flex flex-col justify-between rounded-2xl border border-transparent p-2 sm:p-2.5 transition-all duration-300 hover:border-neutral-200/90 hover:shadow-xs bg-white"
                >
                  <div>
                    {/* Square Image Box with Promo Badge & Hover Chevrons */}
                    <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-[#fbfbfb] flex items-center justify-center border border-neutral-100 group-hover:border-neutral-200 transition">
                      <Link
                        href={`/products/${item.slug}`}
                        className="size-full flex items-center justify-center p-2"
                      >
                        <Image
                          src={currentImage}
                          alt={item.name}
                          width={400}
                          height={400}
                          unoptimized
                          className="size-full object-contain transition-transform duration-300 group-hover:scale-103"
                        />
                      </Link>

                      {/* Promo Badge Overlay (Exact Match to Screenshot) */}
                      {item.badge && (
                        <div className="absolute top-2 left-2 z-10 pointer-events-none">
                          {item.badge.includes("BUY") ? (
                            <span className="inline-block bg-gradient-to-r from-red-600 to-amber-600 text-white font-black text-[9px] uppercase px-2 py-0.5 rounded shadow-xs tracking-wider">
                              {item.badge}
                            </span>
                          ) : (
                            <span className="inline-block bg-[#023915] text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-xs">
                              {item.badge}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Hover Image Chevrons < and > (Shown on Desktop, Hidden on Mobile) */}
                      {totalImages > 1 && (
                        <div className="absolute bottom-2.5 right-2.5 z-10 hidden md:flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button
                            type="button"
                            onClick={(e) => handlePrevImage(e, item.id, totalImages)}
                            aria-label="Previous photo"
                            className="size-7 rounded-full bg-white/95 border border-neutral-300 shadow-xs flex items-center justify-center text-neutral-800 hover:bg-neutral-900 hover:text-white transition cursor-pointer"
                          >
                            <ChevronLeft className="size-4" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleNextImage(e, item.id, totalImages)}
                            aria-label="Next photo"
                            className="size-7 rounded-full bg-white/95 border border-neutral-300 shadow-xs flex items-center justify-center text-neutral-800 hover:bg-neutral-900 hover:text-white transition cursor-pointer"
                          >
                            <ChevronRight className="size-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Product Title */}
                    <Link href={`/products/${item.slug}`} className="block mt-2.5">
                      <h3
                        className="font-bold text-xs sm:text-[13px] text-neutral-900 uppercase tracking-tight line-clamp-1 group-hover:text-[#023915] transition"
                        title={item.name}
                      >
                        {item.name}
                      </h3>
                    </Link>

                    {/* Price Row: ₹price ₹compareAt discount */}
                    <div className="flex items-baseline gap-2 mt-1 flex-wrap">
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

                  {/* Add to Bag Button (Visible on mobile, revealed on hover on desktop) */}
                  <div className="mt-3 pt-0.5 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto max-md:opacity-100 max-md:pointer-events-auto transition-opacity duration-200">
                    <button
                      type="button"
                      onClick={() => handleAddToCart(item)}
                      className={`w-full rounded-xl sm:rounded-2xl border py-2.5 text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs ${
                        isAdded
                          ? "bg-[#023915] text-white border-[#023915]"
                          : "bg-white text-neutral-900 border-neutral-900 hover:bg-[#023915] hover:text-white hover:border-[#023915]"
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="size-3.5 stroke-[2.5]" />
                          <span>Added to Bag</span>
                        </>
                      ) : (
                        <span>Add to Bag</span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Main Storefront Footer */}
      <SiteFooter />

      {/* ========================================================================= */}
      {/* MOBILE FILTER DRAWER (Bottom Sheet)                                       */}
      {/* ========================================================================= */}
      {filterDrawerOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end md:hidden animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setFilterDrawerOpen(false)}
          />
          <div className="relative z-10 max-h-[85vh] rounded-t-3xl bg-white p-5 shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="size-4 text-[#023915]" />
                <h3 className="text-base font-bold text-neutral-900">
                  Filters {hasActiveFilters ? `(${activeFilterCount})` : ""}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setFilterDrawerOpen(false)}
                className="rounded-full p-1.5 text-neutral-500 hover:bg-neutral-100 cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Filter Content */}
            <div className="flex-1 overflow-y-auto py-4 space-y-5 text-xs">
              {/* 1. Product Type */}
              <div>
                <span className="font-bold text-neutral-900 block mb-2 uppercase tracking-wide">
                  Product Type
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "All Types", val: "all" },
                    { label: "Juices / Kwath", val: "Juice" },
                    { label: "Powders / Churna", val: "Powder" },
                    { label: "Majun / Elixir", val: "Majun" },
                    { label: "Massage Creams", val: "Cream" },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => setSelectedProductType(opt.val)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                        selectedProductType === opt.val
                          ? "bg-[#023915] text-white shadow-xs"
                          : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Size */}
              <div>
                <span className="font-bold text-neutral-900 block mb-2 uppercase tracking-wide">
                  Size
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "All Sizes", val: "all" },
                    { label: "100ml / 100g", val: "100ml" },
                    { label: "300ml / 300g", val: "300ml" },
                    { label: "500ml / 500g", val: "500ml" },
                    { label: "1000ml / 1kg", val: "1000ml" },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => setSelectedSize(opt.val)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                        selectedSize === opt.val
                          ? "bg-[#023915] text-white shadow-xs"
                          : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Pack / Variant */}
              <div>
                <span className="font-bold text-neutral-900 block mb-2 uppercase tracking-wide">
                  Pack / Variant
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "All Variants", val: "all" },
                    { label: "Single Unit", val: "Single" },
                    { label: "Pack of 2", val: "Pack of 2" },
                    { label: "Pack of 3", val: "Pack of 3" },
                    { label: "Pack of 6", val: "Pack of 6" },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => setSelectedVariant(opt.val)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                        selectedVariant === opt.val
                          ? "bg-[#023915] text-white shadow-xs"
                          : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Price Range */}
              <div>
                <span className="font-bold text-neutral-900 block mb-2 uppercase tracking-wide">
                  Price Range
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "All Prices", val: "all" },
                    { label: "Under ₹500", val: "under-500" },
                    { label: "₹500 – ₹1,000", val: "500-1000" },
                    { label: "Above ₹1,000", val: "above-1000" },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => setSelectedPriceRange(opt.val)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                        selectedPriceRange === opt.val
                          ? "bg-[#023915] text-white shadow-xs"
                          : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Sticky Action Bar */}
            <div className="border-t border-neutral-200 pt-3 flex items-center gap-3">
              <button
                type="button"
                onClick={clearAllFilters}
                className="w-1/3 py-3 rounded-xl border border-neutral-300 text-xs font-bold text-neutral-700 hover:bg-neutral-100 transition cursor-pointer"
              >
                Clear All
              </button>
              <button
                type="button"
                onClick={() => setFilterDrawerOpen(false)}
                className="w-2/3 py-3 rounded-xl bg-[#023915] text-white text-xs font-bold transition hover:bg-black cursor-pointer shadow-md"
              >
                Apply ({filteredItems.length} Products)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MOBILE SORT DRAWER (Bottom Sheet)                                         */}
      {/* ========================================================================= */}
      {sortDrawerOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end md:hidden animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setSortDrawerOpen(false)}
          />
          <div className="relative z-10 rounded-t-3xl bg-white p-5 shadow-2xl animate-in slide-in-from-bottom duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <h3 className="text-base font-bold text-neutral-900 uppercase tracking-tight">
                Sort By
              </h3>
              <button
                type="button"
                onClick={() => setSortDrawerOpen(false)}
                className="rounded-full p-1.5 text-neutral-500 hover:bg-neutral-100 cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="py-3 space-y-1">
              {[
                { label: "Popularity", val: "popularity" },
                { label: "Price: Low to High", val: "price-asc" },
                { label: "Price: High to Low", val: "price-desc" },
                { label: "Highest Discount", val: "discount" },
              ].map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => {
                    setSortBy(opt.val as any);
                    setSortDrawerOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-3.5 rounded-xl text-left text-xs font-bold transition cursor-pointer ${
                    sortBy === opt.val
                      ? "bg-[#c2d4c5]/25 text-[#023915]"
                      : "text-neutral-700 hover:bg-neutral-50"
                  }`}
                >
                  <span>{opt.label}</span>
                  <span
                    className={`size-4 rounded-full border flex items-center justify-center ${
                      sortBy === opt.val
                        ? "border-[#023915] bg-[#023915]"
                        : "border-neutral-300"
                    }`}
                  >
                    {sortBy === opt.val && (
                      <span className="size-1.5 rounded-full bg-white" />
                    )}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mobile App Modal */}
      <GetAppModal isOpen={appModalOpen} onClose={() => setAppModalOpen(false)} />
    </div>
  );
}
