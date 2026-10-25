"use client";

import { useState, use, useEffect } from "react";
import Link from "next/link";
import { Filter, ChevronDown, Sparkles, HelpCircle } from "lucide-react";
import AnnouncementBar from "@/components/AnnouncementBar";
import SiteHeader from "@/components/SiteHeader";
import ConcernFilter from "@/components/ConcernFilter";
import ProductCard from "@/components/ProductCard";
import { ProductCardSkeleton, StorefrontSkeleton } from "@/components/SkeletonLoader";
import DoctorConsultationBanner from "@/components/DoctorConsultationBanner";
import SiteFooter from "@/components/SiteFooter";
import { concerns, products, Product } from "@/lib/store";
import { getStorefrontData } from "@/lib/storefront-client";
import { generateBreadcrumbSchema, SITE_URL } from "@/lib/seo-schema";
import { concernDetailsMap } from "@/lib/solution-data";

export default function SolutionPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const [sortBy, setSortBy] = useState("popular");
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Modal States
  const [appModalOpen, setAppModalOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [consultationModalOpen, setConsultationModalOpen] = useState(false);

  // Cart State for Header
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);

  useEffect(() => {
    const syncCart = () => {
      if (typeof window === "undefined") return;
      try {
        const stored = localStorage.getItem("pyur_cart");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            const valid = parsed.filter(
              (item: any) => item && item.product && typeof item.product === "object" && item.product.id
            );
            setCart(valid);
            return;
          }
        }
        setCart([]);
      } catch {
        setCart([]);
      }
    };

    syncCart();
    window.addEventListener("storage", syncCart);
    window.addEventListener("pyur_cart_updated", syncCart);

    if (typeof window !== "undefined") {
      try {

        const cached = localStorage.getItem("pyur_storefront_cache");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.products && Array.isArray(parsed.products)) {
            setCatalog(parsed.products);
          }
          if (parsed.categories && Array.isArray(parsed.categories)) {
            setCategories(parsed.categories);
          }
          setIsDataLoaded(true);
        }
      } catch {}
    }

    const loadData = () => {
      getStorefrontData()
        .then((data) => {
          if (data && data.products && Array.isArray(data.products)) {
            setCatalog(data.products);
          }
          if (data && data.categories && Array.isArray(data.categories)) {
            setCategories(data.categories);
          }
          setIsDataLoaded(true);
          try {
            localStorage.setItem("pyur_storefront_cache", JSON.stringify(data));
          } catch {}
        })
        .catch(() => setIsDataLoaded(true));
    };

    loadData();

    const handleLiveUpdate = (e: any) => {
      if (e?.detail?.key === "products" && Array.isArray(e.detail.value)) {
        setCatalog(e.detail.value);
      }
      if (e?.detail?.key === "categories" && Array.isArray(e.detail.value)) {
        setCategories(e.detail.value);
      }
      loadData();
    };

    window.addEventListener("pyur_storefront_updated", handleLiveUpdate);
    window.addEventListener("storage", loadData);

    return () => {
      window.removeEventListener("storage", syncCart);
      window.removeEventListener("pyur_cart_updated", syncCart);
      window.removeEventListener("pyur_storefront_updated", handleLiveUpdate);
      window.removeEventListener("storage", loadData);
    };
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

  const handleBuyNow = (product: Product) => {
    window.location.href = `/checkout?productId=${product.id}&quantity=1`;
  };

  const details = concernDetailsMap[slug] || {
    title: slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ") + " Ayurvedic Remedies",
    subtitle: "AUTHENTIC AYURVEDIC FORMULATIONS CERTIFIED BY VAIDYAS",
    bg: "from-[#1d3b24] via-[#244f31] to-[#122c1b]",
    description: "Discover our full range of 100% natural Ayurvedic juices, resins, and wellness elixirs.",
  };

  // Filter products by slug or matching category
  const normalizedSlug = slug.toLowerCase().replace(/[^a-z0-9]+/g, "");
  const filteredProducts = catalog.filter((p) => {
    const pConcernNorm = (p.concern || "").toLowerCase().replace(/[^a-z0-9]+/g, "");
    return pConcernNorm.includes(normalizedSlug) || normalizedSlug.includes(pConcernNorm) || slug === "all";
  });

  const displayProducts = filteredProducts.length > 0 ? filteredProducts : catalog;

  const sortedProducts = [...displayProducts].sort((a, b) => {
    if (sortBy === "price-low") return a.price - b.price;
    if (sortBy === "price-high") return b.price - a.price;
    if (sortBy === "rating") return b.rating - a.rating;
    return b.reviews - a.reviews;
  });

  if (!isDataLoaded) {
    return <StorefrontSkeleton />;
  }

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: details.title, path: `/solution/${slug}` },
  ]);

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: details.title,
    description: details.description,
    url: `${SITE_URL}/solution/${slug}`,
    isPartOf: {
      "@type": "WebSite",
      name: "Pure Ayur Herbs",
      url: SITE_URL,
    },
  };

  return (
    <main className="min-h-screen bg-white text-neutral-900">
      {/* Google Rich Snippets: Solution Breadcrumbs */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {/* Google Rich Snippets: Collection Category Page */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />

      {/* Announcement Ticker */}
      <AnnouncementBar onOpenAppModal={() => setAppModalOpen(true)} />

      {/* Main Header */}
      <SiteHeader
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onOpenAppModal={() => setAppModalOpen(true)}
        onOpenLoginModal={() => setLoginModalOpen(true)}
        onOpenConsultationModal={() => setConsultationModalOpen(true)}
        products={catalog}
      />

      {/* Breadcrumbs Navigation */}
      <div className="mx-auto max-w-[1440px] px-4 py-3 text-xs text-neutral-500 md:px-6">
        <Link href="/" className="hover:text-[#023915]">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="font-bold text-neutral-900">{details.title}</span>
      </div>

      {/* Hero Header Banner */}
      <section className={`bg-gradient-to-r ${details.bg} py-12 text-white`}>
        <div className="mx-auto max-w-[1440px] px-4 md:px-6">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-[#f2c94c]">
              <Sparkles className="size-3.5" /> AYURVEDIC SOLUTION GUIDE
            </span>
            <h1 className="mt-2 text-2xl font-bold leading-tight sm:text-4xl">
              {details.title}
            </h1>
            <p className="mt-1 text-xs font-bold uppercase tracking-wider text-neutral-200">
              {details.subtitle}
            </p>
            <p className="mt-3 text-xs leading-relaxed text-white/80 md:text-sm">
              {details.description}
            </p>
          </div>
        </div>
      </section>

      {/* Concern Filter Bar */}
      <ConcernFilter
        selectedConcern={null}
        onSelectConcern={(c) => {
          if (c) {
            const targetSlug = c.toLowerCase().replace(/[^a-z0-9]+/g, "-");
            window.location.href = `/solution/${targetSlug}`;
          } else {
            window.location.href = "/";
          }
        }}
      />

      {/* Products Catalog Listing Section */}
      <section className="mx-auto max-w-[1440px] px-4 py-8 md:px-6">
        {/* Sort & Count Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200 pb-4">
          <div className="flex items-center gap-2">
            <Filter className="size-4 text-[#023915]" />
            <span className="text-xs font-bold text-neutral-900 md:text-sm">
              Showing {sortedProducts.length} Ayurvedic Formulations
            </span>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-neutral-500">Sort By:</label>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none rounded-lg border border-neutral-200 bg-white py-1.5 pl-3 pr-8 text-xs font-bold text-neutral-900 outline-none focus:border-[#023915]"
              >
                <option value="popular">Bestsellers & Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-neutral-500" />
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {sortedProducts.length === 0 ? (
          <div className="mx-auto max-w-lg rounded-3xl border border-neutral-200 bg-[#f8f9fa] p-8 sm:p-12 text-center shadow-xs my-8">
            <div className="mx-auto flex size-20 items-center justify-center rounded-2xl bg-[#c2d4c5]/40 border border-[#023915]/20 text-3xl mb-5 shadow-xs">
              <span>{categories.find((c: any) => (c.name || "").toLowerCase() === details.title?.toLowerCase())?.icon || "🌿"}</span>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#c2d4c5]/40 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#023915]">
              ⏳ Formulations Coming Soon
            </span>
            <h3 className="mt-4 text-2xl font-bold text-neutral-900 sm:text-3xl">
              {details.title} Formulations Coming Soon!
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-neutral-600">
              Our expert Ayurvedic Vaidyas are currently preparing 100% natural, certified gold-grade formulations for <strong>{details.title}</strong>. Authentic remedies will be available here very soon!
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/"
                className="w-full sm:w-auto rounded-xl bg-[#023915] px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-md transition hover:bg-black"
              >
                Explore All Available Remedies
              </Link>
              <a
                href={`https://wa.me/917247824101?text=${encodeURIComponent(`नमस्ते! मुझे ${details.title} के आयुर्वेदिक इलाज के बारे में जानकारी चाहिए।`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto rounded-xl border border-[#25D366] bg-[#25D366]/10 px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-[#128C7E] transition hover:bg-[#25D366]/20 flex items-center justify-center gap-1.5"
              >
                <span>Ask Doctor on WhatsApp</span>
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10 items-start">
            {sortedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                onBuyNow={handleBuyNow}
              />
            ))}
          </div>
        )}
      </section>

      {/* Solution FAQ Guide */}
      <section className="bg-white py-12 border-y border-neutral-200">
        <div className="mx-auto max-w-[1440px] px-4 md:px-6">
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle className="size-5 text-[#023915]" />
            <h2 className="text-xl font-bold uppercase tracking-tight text-neutral-900 sm:text-2xl">
              Ayurvedic Solution Guide & FAQs
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-neutral-200 bg-[#f8f9fa] p-5">
              <h3 className="text-sm font-bold text-neutral-900">How does Ayurveda help in long-term wellness?</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-neutral-600">
                Unlike quick chemical patches, Ayurveda works on balancing your core Agni (digestive fire) and Doshas (Vata, Pitta, Kapha) to treat root causes rather than just masking symptoms.
              </p>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-[#f8f9fa] p-5">
              <h3 className="text-sm font-bold text-neutral-900">Are these remedies 100% natural & safe?</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-neutral-600">
                Yes, all Pure Ayur Herb products are 100% plant-based, cold-pressed, free from added refined sugars, and certified by the Ministry of AYUSH.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <SiteFooter />
    </main>
  );
}
