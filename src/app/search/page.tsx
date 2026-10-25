"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, SlidersHorizontal, ArrowUpDown, Sparkles, ShoppingBag } from "lucide-react";
import AnnouncementBar from "@/components/AnnouncementBar";
import SiteHeader from "@/components/SiteHeader";
import ProductCard from "@/components/ProductCard";
import SiteFooter from "@/components/SiteFooter";
import AyurvedicQuizModal from "@/components/AyurvedicQuizModal";
import { Product } from "@/lib/store";
import { getStorefrontData } from "@/lib/storefront-client";

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConcern, setSelectedConcern] = useState(searchParams.get("category") || "all");
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "rating">("featured");

  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [appModalOpen, setAppModalOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [consultationModalOpen, setConsultationModalOpen] = useState(false);

  // Sync cart from localStorage
  useEffect(() => {
    const syncCart = () => {
      if (typeof window === "undefined") return;
      try {
        const stored = localStorage.getItem("pyur_cart");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setCart(parsed.filter((i: any) => i && i.product && i.product.id));
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

  // Sync query and category when searchParams change
  useEffect(() => {
    setQuery(searchParams.get("q") || "");
    const cat = searchParams.get("category");
    if (cat) {
      setSelectedConcern(cat);
    }
  }, [searchParams]);

  // Load products from storefront API
  useEffect(() => {
    getStorefrontData()
      .then((data) => {
        if (data && data.products && Array.isArray(data.products)) {
          setCatalog(data.products);
        }
      })
      .catch((err) => console.error("Error loading products:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleAddToCart = (product: Product) => {
    let currentCart = cart;
    try {
      const stored = localStorage.getItem("pyur_cart");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) currentCart = parsed;
      }
    } catch {}

    const existing = currentCart.find((item) => item.product && item.product.id === product.id);
    let updated: { product: Product; quantity: number }[];
    if (existing) {
      updated = currentCart.map((item) =>
        item.product.id === product.id ? { ...item, quantity: (Number(item.quantity) || 1) + 1 } : item
      );
    } else {
      updated = [...currentCart, { product, quantity: 1 }];
    }

    setCart(updated);
    try {
      localStorage.setItem("pyur_cart", JSON.stringify(updated));
      setTimeout(() => {
        window.dispatchEvent(new Event("pyur_cart_updated"));
      }, 0);
    } catch {}
  };

  const handleBuyNow = (product: Product) => {
    handleAddToCart(product);
    window.location.href = `/checkout?productId=${product.slug || product.id}&quantity=1`;
  };

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

    const updated = currentCart.filter((item) => item && item.product && item.product.id !== productId);
    setCart(updated);
    try {
      localStorage.setItem("pyur_cart", JSON.stringify(updated));
      setTimeout(() => {
        window.dispatchEvent(new Event("pyur_cart_updated"));
      }, 0);
    } catch {}
  };

  // Distinct concerns available in catalog
  const concernsList = useMemo(() => {
    const list = Array.from(new Set(catalog.map((p) => p.concern).filter(Boolean)));
    return list;
  }, [catalog]);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    let result = catalog;

    const q = query.trim().toLowerCase();
    if (q) {
      const terms = q.split(/\s+/).filter(Boolean);
      result = result.filter((product) => {
        const name = (product.name || "").toLowerCase();
        const concern = (product.concern || "").toLowerCase();
        const desc = (product.description || "").toLowerCase();
        const badge = (product.badge || "").toLowerCase();
        const ingr = Array.isArray(product.ingredients)
          ? product.ingredients.join(" ").toLowerCase()
          : String(product.ingredients || "").toLowerCase();

        const haystack = `${name} ${concern} ${desc} ${badge} ${ingr}`;
        return terms.every((term) => haystack.includes(term));
      });
    }

    if (selectedConcern !== "all") {
      result = result.filter(
        (p) => (p.concern || "").toLowerCase() === selectedConcern.toLowerCase()
      );
    }

    const sorted = [...result];
    if (sortBy === "price-asc") {
      sorted.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      sorted.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      sorted.sort((a, b) => (b.rating || 5) - (a.rating || 5));
    }

    return sorted;
  }, [catalog, query, selectedConcern, sortBy]);

  const popularTags = [
    "Virja Powder",
    "Madhunashi",
    "Fat Burner",
    "Virja Gold Majun",
    "Perfect 36 Cream",
    "Sugar Management",
  ];

  return (
    <div className="flex min-h-screen flex-col bg-white text-neutral-900">
      <AnnouncementBar onOpenAppModal={() => setAppModalOpen(true)} />
      <SiteHeader
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onOpenAppModal={() => setAppModalOpen(true)}
        onOpenLoginModal={() => setLoginModalOpen(true)}
        onOpenConsultationModal={() => setConsultationModalOpen(true)}
        products={catalog}
      />

      <main className="flex-1 bg-white">
        {/* Header Search Banner */}
        <section className="border-b border-neutral-200/80 bg-[#f8f9fa] py-8 px-4 sm:px-6">
          <div className="mx-auto max-w-4xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#c2d4c5]/40 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#023915]">
              <Sparkles className="size-3.5" />
              Ayurvedic Remedy Finder
            </span>
            <h1 className="mt-3 text-2xl font-bold text-neutral-900 md:text-3xl">
              {query ? `Search Results for "${query}"` : "Search Pure Ayur Herbs"}
            </h1>
            <p className="mt-2 text-xs font-medium text-neutral-600 md:text-sm">
              Explore 100% certified Ayurvedic formulations including Virja Powder, Madhunashi, Fat Burner, and Perfect 36 Cream.
            </p>

            {/* On-page Search Input */}
            <div className="mt-6 flex items-center gap-2 rounded-xl border border-neutral-200 bg-white p-2 shadow-xs focus-within:border-[#023915] focus-within:ring-2 focus-within:ring-[#023915]/10">
              <Search className="size-5 shrink-0 text-neutral-400 ml-2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by remedy name, health concern, or ingredient..."
                className="w-full text-xs md:text-sm outline-none placeholder:text-neutral-400 px-2 py-1"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="rounded-md px-2 py-1 text-xs font-bold text-neutral-500 hover:bg-neutral-100"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick Keyword Pills */}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 text-xs text-neutral-600">
              <span className="font-bold text-neutral-900">Popular:</span>
              {popularTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setQuery(tag)}
                  className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold transition ${
                    query.toLowerCase() === tag.toLowerCase()
                      ? "border-[#023915] bg-[#023915] text-white"
                      : "border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-100"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Results Toolbar & Grid */}
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          {/* Filter Bar */}
          <div className="flex flex-col gap-4 border-b border-neutral-200/80 pb-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Category / Concern Chips */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedConcern("all")}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  selectedConcern === "all"
                    ? "bg-[#023915] text-white shadow-xs"
                    : "bg-[#f5f5f5] text-neutral-800 hover:bg-neutral-200"
                }`}
              >
                All Concerns ({catalog.length})
              </button>
              {concernsList.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedConcern(c)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    selectedConcern.toLowerCase() === c.toLowerCase()
                      ? "bg-[#023915] text-white shadow-xs"
                      : "bg-[#f5f5f5] text-neutral-800 hover:bg-neutral-200"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <ArrowUpDown className="size-4 text-neutral-400" />
              <span className="text-xs font-semibold text-neutral-500">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="rounded-lg border border-neutral-200 bg-white px-2.5 py-1 text-xs font-bold text-neutral-900 outline-none"
              >
                <option value="featured">Featured / Best Matches</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {/* Active Status */}
          <div className="mt-4 flex items-center justify-between text-xs text-neutral-500">
            <span>
              Showing <strong className="text-neutral-900">{filteredProducts.length}</strong> remedies
              {query && (
                <span>
                  {" "}
                  for "<strong className="text-[#023915]">{query}</strong>"
                </span>
              )}
            </span>
          </div>

          {/* Loading Skeleton */}
          {loading ? (
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10 items-start">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="aspect-square w-full animate-pulse rounded-xl bg-neutral-100" />
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            /* Product Grid */
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10 items-start">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onBuyNow={handleBuyNow}
                />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="my-16 rounded-2xl border border-dashed border-neutral-200 bg-[#f8f9fa] p-8 text-center sm:p-12">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#c2d4c5]/40 text-[#023915]">
                <Search className="size-6" />
              </div>
              <h3 className="mt-4 text-base font-bold text-neutral-900 sm:text-lg">
                No remedies found matching "{query}"
              </h3>
              <p className="mx-auto mt-2 max-w-md text-xs text-neutral-500">
                We couldn't find an exact match. Check the spelling or try searching by health concern like
                Sugar Management, Energy, or Liver Care.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setSelectedConcern("all");
                  }}
                  className="rounded-lg bg-[#023915] px-4 py-2 text-xs font-bold text-white transition hover:bg-black"
                >
                  View All Products
                </button>
                <Link
                  href="/#concerns"
                  className="rounded-lg border border-neutral-200 bg-white px-4 py-2 text-xs font-bold text-neutral-800 transition hover:bg-neutral-50"
                >
                  Browse Health Concerns
                </Link>
              </div>
            </div>
          )}
        </section>
      </main>

      <SiteFooter />
      <AyurvedicQuizModal onAddToCart={handleAddToCart} />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white p-10 text-center text-sm font-bold text-[#023915]">Loading search results...</div>}>
      <SearchContent />
    </Suspense>
  );
}
