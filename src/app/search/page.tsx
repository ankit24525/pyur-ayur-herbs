"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, SlidersHorizontal, ArrowUpDown, Sparkles, ShoppingBag } from "lucide-react";
import AnnouncementBar from "@/components/AnnouncementBar";
import SiteHeader from "@/components/SiteHeader";
import ProductCard from "@/components/ProductCard";
import SiteFooter from "@/components/SiteFooter";
import WhatsAppWidget from "@/components/WhatsAppWidget";
import AyurvedicQuizModal from "@/components/AyurvedicQuizModal";
import { Product } from "@/lib/store";

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConcern, setSelectedConcern] = useState("all");
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "rating">("featured");

  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [appModalOpen, setAppModalOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [consultationModalOpen, setConsultationModalOpen] = useState(false);

  // Sync cart from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("pyur_cart");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setCart(parsed.filter((i: any) => i && i.product && i.product.id));
          }
        }
      } catch {}
    }
  }, []);

  // Sync query when searchParams change
  useEffect(() => {
    setQuery(searchParams.get("q") || "");
  }, [searchParams]);

  // Load products from storefront API
  useEffect(() => {
    fetch("/api/storefront", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data.products && Array.isArray(data.products)) {
          setCatalog(data.products);
        }
      })
      .catch((err) => console.error("Error loading products:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleAddToCart = (product: Product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id);
      let updated;
      if (existing) {
        updated = prevCart.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        updated = [...prevCart, { product, quantity: 1 }];
      }
      try {
        localStorage.setItem("pyur_cart", JSON.stringify(updated));
        window.dispatchEvent(new Event("pyur_cart_updated"));
      } catch {}
      return updated;
    });
  };

  const handleBuyNow = (product: Product) => {
    handleAddToCart(product);
    window.location.href = `/checkout?productId=${product.slug || product.id}&quantity=1`;
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart((prevCart) => {
      const updated = prevCart
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as { product: Product; quantity: number }[];
      try {
        localStorage.setItem("pyur_cart", JSON.stringify(updated));
        window.dispatchEvent(new Event("pyur_cart_updated"));
      } catch {}
      return updated;
    });
  };

  const handleRemoveItem = (productId: string) => {
    setCart((prevCart) => {
      const updated = prevCart.filter((item) => item.product.id !== productId);
      try {
        localStorage.setItem("pyur_cart", JSON.stringify(updated));
        window.dispatchEvent(new Event("pyur_cart_updated"));
      } catch {}
      return updated;
    });
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
    "Shilajit",
    "Sugar Care",
    "Hair Growth Oil",
    "Amla Juice",
    "Liver Detox",
    "Ashwagandha",
  ];

  return (
    <div className="flex min-h-screen flex-col bg-[#fdfdfc] text-[#17231b]">
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

      <main className="flex-1">
        {/* Header Search Banner */}
        <section className="border-b border-[#ddddd9] bg-gradient-to-b from-[#f4f7eb] to-white py-8 px-4 sm:px-6">
          <div className="mx-auto max-w-4xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eef5df] px-3 py-1 text-xs font-black uppercase tracking-wider text-[#244f31]">
              <Sparkles className="size-3.5" />
              Ayurvedic Remedy Finder
            </span>
            <h1 className="mt-3 text-2xl font-black text-[#17231b] md:text-4xl">
              {query ? `Search Results for "${query}"` : "Search Pure Ayur Herbs"}
            </h1>
            <p className="mt-2 text-xs font-medium text-[#666666] md:text-sm">
              Explore 100% pure Himalayan Shilajit, herbal juices, oils, and classical formulations.
            </p>

            {/* On-page Search Input */}
            <div className="mt-6 flex items-center gap-2 rounded-xl border border-[#ddddd9] bg-white p-2 shadow-sm focus-within:border-[#244f31] focus-within:ring-2 focus-within:ring-[#244f31]/20">
              <Search className="size-5 shrink-0 text-[#666666] ml-2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by remedy name, health concern, or ingredient..."
                className="w-full text-sm outline-none placeholder:text-[#999999] px-2 py-1"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="rounded-md px-2 py-1 text-xs font-bold text-[#666666] hover:bg-[#f8faf1]"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick Keyword Pills */}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 text-xs text-[#666666]">
              <span className="font-bold text-[#17231b]">Popular:</span>
              {popularTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setQuery(tag)}
                  className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold transition ${
                    query.toLowerCase() === tag.toLowerCase()
                      ? "border-[#244f31] bg-[#244f31] text-white"
                      : "border-[#ddddd9] bg-white text-[#244f31] hover:bg-[#f4f7eb]"
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
          <div className="flex flex-col gap-4 border-b border-[#ddddd9] pb-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Category / Concern Chips */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedConcern("all")}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  selectedConcern === "all"
                    ? "bg-[#244f31] text-white shadow-xs"
                    : "bg-[#f8faf1] text-[#17231b] hover:bg-[#eef2db]"
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
                      ? "bg-[#244f31] text-white shadow-xs"
                      : "bg-[#f8faf1] text-[#17231b] hover:bg-[#eef2db]"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <ArrowUpDown className="size-4 text-[#666666]" />
              <span className="text-xs font-semibold text-[#666666]">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="rounded-lg border border-[#ddddd9] bg-white px-2.5 py-1 text-xs font-bold text-[#17231b] outline-none"
              >
                <option value="featured">Featured / Best Matches</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {/* Active Status */}
          <div className="mt-4 flex items-center justify-between text-xs text-[#666666]">
            <span>
              Showing <strong className="text-[#17231b]">{filteredProducts.length}</strong> remedies
              {query && (
                <span>
                  {" "}
                  for "<strong className="text-[#244f31]">{query}</strong>"
                </span>
              )}
            </span>
          </div>

          {/* Loading Skeleton */}
          {loading ? (
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-6 lg:grid-cols-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="h-72 animate-pulse rounded-xl bg-gray-100" />
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            /* Product Grid */
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-6 lg:grid-cols-4">
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
            <div className="my-16 rounded-2xl border border-dashed border-[#ddddd9] bg-[#fdfdfa] p-8 text-center sm:p-12">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#f4f7eb] text-[#244f31]">
                <Search className="size-6" />
              </div>
              <h3 className="mt-4 text-base font-bold text-[#17231b] sm:text-lg">
                No remedies found matching "{query}"
              </h3>
              <p className="mx-auto mt-2 max-w-md text-xs text-[#666666]">
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
                  className="rounded-lg bg-[#244f31] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#17231b]"
                >
                  View All Products
                </button>
                <Link
                  href="/#concerns"
                  className="rounded-lg border border-[#ddddd9] bg-white px-4 py-2 text-xs font-bold text-[#17231b] transition hover:bg-[#f8faf1]"
                >
                  Browse Health Concerns
                </Link>
              </div>
            </div>
          )}
        </section>
      </main>

      <SiteFooter />
      <WhatsAppWidget />
      <AyurvedicQuizModal onAddToCart={handleAddToCart} />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#fdfdfc] p-10 text-center text-sm font-bold text-[#244f31]">Loading search results...</div>}>
      <SearchContent />
    </Suspense>
  );
}
