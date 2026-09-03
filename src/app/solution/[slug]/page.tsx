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

const concernDetailsMap: Record<
  string,
  { title: string; subtitle: string; bg: string; description: string }
> = {
  "sugar-management": {
    title: "Sugar Management Ayurvedic Remedies",
    subtitle: "CLINICALLY BACKED 11-HERB FORMULATIONS FOR GLUCOSE BALANCE",
    bg: "from-[#1d3b24] via-[#244f31] to-[#122c1b]",
    description:
      "Explore 100% natural cold-pressed juices and Ayurvedic remedies made from Karela, Jamun, Gudmar, and Methi to help regulate fasting and post-meal blood sugar levels.",
  },
  "gym-and-fitness": {
    title: "Gym & Fitness Ayurvedic Formulations",
    subtitle: "NATURAL STAMINA, STRENGTH & MUSCLE RECOVERY RITUALS",
    bg: "from-[#2d6b3f] via-[#1d4629] to-[#0f2416]",
    description:
      "Engineered with pure Himalayan Shilajit, Ashwagandha, and Nirgundi joint care juices to boost peak workout endurance and muscle recovery.",
  },
  energy: {
    title: "Energy & Vitality Botanicals",
    subtitle: "RECHARGE DAILY STAMINA WITHOUT SYNTHETIC CAFFEINE",
    bg: "from-[#3e2c1e] via-[#244f31] to-[#17231b]",
    description:
      "Traditional Rasayanas enriched with 80+ trace minerals and fulvic acid to fight daily fatigue and keep you active all day.",
  },
  "skin-and-hair": {
    title: "Skin Radiance & Hair Growth Elixirs",
    subtitle: "26-HERB KUMKUMADI KASHMIRI SAFFRON RITUALS",
    bg: "from-[#3e2c1e] via-[#63432b] to-[#2b1d13]",
    description:
      "Authentic Saffron skin serums and wild Amla Vitamin C juices to fade dark spots, restore natural glow, and nourish hair roots.",
  },
  "heart-health": {
    title: "Arjuna Cardiac & Heart Care Solutions",
    subtitle: "TRADITIONAL BOTANICAL TONICS FOR BP & LIPID BALANCE",
    bg: "from-[#1d3b24] via-[#244f31] to-[#0f2416]",
    description:
      "Pure Arjuna bark extractions blended with Garlic and Guggul to maintain arterial wellness and healthy blood pressure levels.",
  },
  "liver-care": {
    title: "Liver Cleanse & Detox Solutions",
    subtitle: "DEEP ORGAN DETOX FOR FATTY LIVER & GUT HEALTH",
    bg: "from-[#2d6b3f] via-[#1d4629] to-[#122c1b]",
    description:
      "Potent detox juices infused with Bhumi Amla, Punarnava, and Kalmegh to flush toxins and boost digestive enzymes.",
  },
  "daily-ayurveda": {
    title: "Daily Ayurvedic Groceries & Tonics",
    subtitle: "PURE WILD-SOURCED IMMUNITY & DIGESTIVE CARE",
    bg: "from-[#1d3b24] via-[#244f31] to-[#122c1b]",
    description:
      "Cold-pressed organic Amla juices and daily Triphala gut routines for overall family health and vital longevity.",
  },
  "womens-health": {
    title: "Women's Period Harmony & Hormonal Care",
    subtitle: "SHATAVARI & ASHOKA FORMULATION FOR HORMONAL BALANCE",
    bg: "from-[#3e2c1e] via-[#244f31] to-[#122c1b]",
    description:
      "Nourishing uterine tonics designed to balance hormones, ease menstrual cramps, and regulate monthly period cycles.",
  },
};

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
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("pyur_cart");
        if (stored) {
          setCart(JSON.parse(stored));
        } else {
          setCart([]);
        }
      } catch {}
    }

    fetch("/api/storefront", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data.products && Array.isArray(data.products)) {
          setCatalog(data.products);
        }
        if (data.categories && Array.isArray(data.categories)) {
          setCategories(data.categories);
        }
        setIsDataLoaded(true);
      })
      .catch(() => setIsDataLoaded(true));
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
      try { localStorage.setItem("pyur_cart", JSON.stringify(updated)); } catch {}
      return updated;
    });
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
      try { localStorage.setItem("pyur_cart", JSON.stringify(updated)); } catch {}
      return updated;
    });
  };

  const handleRemoveItem = (productId: string) => {
    setCart((prevCart) => {
      const updated = prevCart.filter((item) => item.product.id !== productId);
      try { localStorage.setItem("pyur_cart", JSON.stringify(updated)); } catch {}
      return updated;
    });
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

  return (
    <main className="min-h-screen bg-[#f8faf1] text-[#17231b]">
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
      />

      {/* Hero Header Banner */}
      <section className={`bg-gradient-to-r ${details.bg} py-12 text-white`}>
        <div className="mx-auto max-w-[1440px] px-4 md:px-6">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-[#f2c94c]">
              <Sparkles className="size-3.5" /> AYURVEDIC SOLUTION GUIDE
            </span>
            <h1 className="mt-2 text-2xl font-black leading-tight sm:text-4xl">
              {details.title}
            </h1>
            <p className="mt-1 text-xs font-bold uppercase tracking-wider text-[#80a03c]">
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
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-[#ddddd9] pb-4">
          <div className="flex items-center gap-2">
            <Filter className="size-4 text-[#80a03c]" />
            <span className="text-xs font-bold text-[#17231b] md:text-sm">
              Showing {sortedProducts.length} Ayurvedic Formulations
            </span>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-[#666666]">Sort By:</label>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none rounded-lg border border-[#ddddd9] bg-white py-1.5 pl-3 pr-8 text-xs font-bold text-[#17231b] outline-none focus:border-[#244f31]"
              >
                <option value="popular">Bestsellers & Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-[#666666]" />
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {!isDataLoaded && sortedProducts.length === 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
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
      <section className="bg-white py-12 border-y border-[#ddddd9]">
        <div className="mx-auto max-w-[1440px] px-4 md:px-6">
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle className="size-5 text-[#80a03c]" />
            <h2 className="text-xl font-black uppercase tracking-tight text-[#17231b] sm:text-2xl">
              Ayurvedic Solution Guide & FAQs
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-[#ddddd9] bg-[#f8faf1] p-5">
              <h3 className="text-sm font-bold text-[#17231b]">How does Ayurveda help in long-term wellness?</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-[#666666]">
                Unlike quick chemical patches, Ayurveda works on balancing your core Agni (digestive fire) and Doshas (Vata, Pitta, Kapha) to treat root causes rather than just masking symptoms.
              </p>
            </div>
            <div className="rounded-xl border border-[#ddddd9] bg-[#f8faf1] p-5">
              <h3 className="text-sm font-bold text-[#17231b]">Are these remedies 100% natural & safe?</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-[#666666]">
                Yes, all Pyur Ayur Herb products are 100% plant-based, cold-pressed, free from added refined sugars, and certified by the Ministry of AYUSH.
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
