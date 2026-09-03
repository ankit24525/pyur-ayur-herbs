"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AnnouncementBar from "@/components/AnnouncementBar";
import SiteHeader from "@/components/SiteHeader";
import HeroSlider from "@/components/HeroSlider";
import ConcernFilter from "@/components/ConcernFilter";
import ProductRail from "@/components/ProductRail";
import TrustSection from "@/components/TrustSection";
import AyurvedicQuizModal from "@/components/AyurvedicQuizModal";
import TestimonialsSection from "@/components/TestimonialsSection";
import SiteFooter from "@/components/SiteFooter";
import { StorefrontSkeleton, HeroSkeleton, ConcernFilterSkeleton, ProductRailSkeleton } from "@/components/SkeletonLoader";
import { products, Product, concerns } from "@/lib/store";
import { X, Smartphone, User, CheckCircle2 } from "lucide-react";

const getShortName = (name: string) => {
  if (name.includes("Sugar")) return "Sugar";
  if (name.includes("Gym")) return "Gym";
  if (name.includes("Energy")) return "Energy";
  if (name.includes("Heart")) return "Heart";
  if (name.includes("Liver")) return "Liver";
  if (name.includes("Daily")) return "Daily";
  if (name.includes("Skin")) return "Skin";
  if (name.includes("Women")) return "For Her";
  return name;
};

export default function Home() {
  const router = useRouter();
  const [selectedConcern, setSelectedConcern] = useState<string | null>(null);
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [cmsData, setCmsData] = useState<any>({
    announcement: null,
    heroSlides: [],
    consultationBanner: null,
  });
  const [isDataLoaded, setIsDataLoaded] = useState<boolean>(false);

  // Load real-time database products and layout from /api/storefront + Instant Local Cache
  useEffect(() => {
    // 1. Instant cache hydration (0ms paint)
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
          if (parsed.content) {
            setCmsData(parsed.content);
          }
          setIsDataLoaded(true);
        }
      } catch {}
    }

    // 2. Fetch live data from backend
    const loadStorefrontData = () => {
      fetch("/api/storefront", { cache: "no-store" })
        .then((res) => res.json())
        .then((data) => {
          if (data.products && Array.isArray(data.products)) {
            setCatalog(data.products);
          }
          if (data.categories && Array.isArray(data.categories)) {
            setCategories(data.categories);
          }
          if (data.content) {
            setCmsData(data.content);
          }
          setIsDataLoaded(true);
          try {
            localStorage.setItem("pyur_storefront_cache", JSON.stringify(data));
          } catch {}
        })
        .catch((e) => {
          console.error("Error loading storefront layout:", e);
          setIsDataLoaded(true);
        });
    };

    loadStorefrontData();

    // 3. Real-time listener for live updates from Admin panel
    const handleLiveUpdate = (e: any) => {
      if (e?.detail?.key === "products" && Array.isArray(e.detail.value)) {
        setCatalog(e.detail.value);
      }
      if (e?.detail?.key === "categories" && Array.isArray(e.detail.value)) {
        setCategories(e.detail.value);
      }
      loadStorefrontData();
    };

    window.addEventListener("pyur_storefront_updated", handleLiveUpdate);
    window.addEventListener("storage", loadStorefrontData);

    return () => {
      window.removeEventListener("pyur_storefront_updated", handleLiveUpdate);
      window.removeEventListener("storage", loadStorefrontData);
    };
  }, []);

  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);

  // Load cart from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("pyur_cart");
      if (stored) {
        try {
          setCart(JSON.parse(stored));
        } catch (e) {
          console.error("Failed to parse cart:", e);
        }
      } else {
        // Default item if cart is empty
        const defaultCart = [{ product: products[0], quantity: 1 }];
        setCart(defaultCart);
        localStorage.setItem("pyur_cart", JSON.stringify(defaultCart));
      }
    }
  }, []);

  // Save cart to localStorage on updates
  const saveCartState = (newCart: { product: Product; quantity: number }[]) => {
    setCart(newCart);
    localStorage.setItem("pyur_cart", JSON.stringify(newCart));
  };

  // Modal States
  const [appModalOpen, setAppModalOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [consultationModalOpen, setConsultationModalOpen] = useState(false);

  // Cart Handlers
  const handleAddToCart = (product: Product) => {
    let nextCart = [...cart];
    const existing = nextCart.find((item) => item.product.id === product.id);
    if (existing) {
      nextCart = nextCart.map((item) =>
        item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      nextCart.push({ product, quantity: 1 });
    }
    saveCartState(nextCart);
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    const nextCart = cart
      .map((item) => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      })
      .filter(Boolean) as { product: Product; quantity: number }[];
    saveCartState(nextCart);
  };

  const handleRemoveItem = (productId: string) => {
    const nextCart = cart.filter((item) => item.product.id !== productId);
    saveCartState(nextCart);
  };

  const handleBuyNow = (product: Product) => {
    router.push(`/checkout?productId=${product.id}&quantity=1`);
  };

  if (!isDataLoaded) {
    return <StorefrontSkeleton />;
  }

  // Filter products by selected concern if active
  const filteredProducts = selectedConcern
    ? catalog.filter((p) => (p.concern || "").toLowerCase() === selectedConcern.toLowerCase())
    : catalog;

  return (
    <main className="min-h-screen bg-[#f8faf1] text-[#17231b]">
      {/* Top Announcement Ticker Bar */}
      <AnnouncementBar data={cmsData.announcement} onOpenAppModal={() => setAppModalOpen(true)} />

      {/* Main Sticky Header */}
      <SiteHeader
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onOpenAppModal={() => setAppModalOpen(true)}
        onOpenLoginModal={() => setLoginModalOpen(true)}
        onOpenConsultationModal={() => setConsultationModalOpen(true)}
        products={catalog}
      />

      {/* Mobile Circular Category Selector (Kapiva-Style) - Mobile Only */}
      <div className="md:hidden bg-white border-b border-[#ddddd9] py-3.5 px-4 overflow-x-auto no-scrollbar flex gap-5 scroll-smooth min-w-0">
        {categories.map((c) => {
          const isSelected = selectedConcern === c.name;
          const shortName = getShortName(c.name);
          return (
            <button
              key={c.id || c.name}
              onClick={() => {
                setSelectedConcern(isSelected ? null : c.name);
                // Scroll to products catalog grid
                document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="flex flex-col items-center gap-1.5 shrink-0"
            >
              <div className={`size-14 rounded-full flex items-center justify-center text-2xl border transition duration-200 ${
                isSelected 
                  ? "border-[#244f31] bg-[#eef5df] shadow-xs" 
                  : "border-[#ddddd9] bg-[#f8faf1] hover:border-[#80a03c]"
              }`}>
                <span>{c.icon || "🌿"}</span>
              </div>
              <span className={`text-[10px] font-bold tracking-tight text-center ${isSelected ? "text-[#244f31]" : "text-[#17231b]"}`}>
                {shortName}
              </span>
            </button>
          );
        })}
      </div>

      {/* Hero Banner Slider Carousel */}
      <HeroSlider slides={cmsData.heroSlides} />

      {/* "SELECT CONCERN" Filter Section */}
      <ConcernFilter
        selectedConcern={selectedConcern}
        onSelectConcern={(concern) => setSelectedConcern(concern)}
        categories={categories}
      />

      {/* Main Shop / Products Section */}
      <div id="shop">
        {catalog.length === 0 ? (
          <div className="mx-auto max-w-[1440px] px-4 py-16 text-center">
            <div className="mx-auto max-w-md rounded-2xl border border-dashed border-[#ddddd9] bg-white p-8 shadow-xs">
              <span className="text-4xl">🌿</span>
              <h3 className="mt-3 text-lg font-bold text-[#17231b]">No Products in Catalog</h3>
              <p className="mt-1 text-xs text-[#666666]">
                No products are currently published in the store. Add new products from the Admin Panel to display them here instantly.
              </p>
            </div>
          </div>
        ) : selectedConcern ? (
          <ProductRail
            title={`Remedies for ${selectedConcern}`}
            subtitle={`Showing ${filteredProducts.length} Ayurvedic formulations`}
            items={filteredProducts}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
          />
        ) : (
          <>
            {/* 1. All Bestselling Remedies Rail */}
            <ProductRail
              title="Top Bestselling Ayurvedic Remedies"
              subtitle="All authentic gold-grade Ayurvedic juices, resins & elixirs"
              items={catalog}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
            />

            {/* 2. Dynamic Rails for every category with active products */}
            {categories.map((cat: any) => {
              const catProducts = catalog.filter(
                (p) => (p.concern || "").toLowerCase() === (cat.name || "").toLowerCase()
              );
              if (catProducts.length === 0) return null;
              return (
                <ProductRail
                  key={cat.id || cat.name}
                  title={`${cat.icon ? `${cat.icon} ` : ""}${cat.name} Formulations`}
                  subtitle={`100% natural Ayurvedic care for ${cat.name}`}
                  categorySlug={cat.id || (cat.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-")}
                  items={catProducts}
                  onAddToCart={handleAddToCart}
                  onBuyNow={handleBuyNow}
                />
              );
            })}
          </>
        )}
      </div>



      {/* Why Pyur Ayur Herbs Trust Section */}
      <TrustSection />

      {/* 2-Minute Health Assessment Quiz */}
      <AyurvedicQuizModal onAddToCart={handleAddToCart} />

      {/* Customer Reviews & Transformations */}
      <TestimonialsSection />

      {/* Main Footer */}
      <SiteFooter />

      {/* Get App Modal */}
      {appModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setAppModalOpen(false)}
          />
          <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl text-center">
            <button
              onClick={() => setAppModalOpen(false)}
              className="absolute right-4 top-4 rounded-full p-1 text-[#666666] hover:bg-[#f8faf1]"
            >
              <X className="size-5" />
            </button>
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[#244f31] text-white shadow-md mb-4">
              <Smartphone className="size-8 text-[#f2c94c]" />
            </div>
            <h3 className="text-xl font-black text-[#17231b]">Download Pyur Ayur App</h3>
            <p className="mt-2 text-xs text-[#666666]">
              Get 15% OFF on app-first orders & earn 2X Pyur Coins on every purchase!
            </p>
            <div className="mt-5 space-y-2">
              <button
                onClick={() => {
                  alert("Redirecting to Google Play Store...");
                  setAppModalOpen(false);
                }}
                className="w-full rounded-xl bg-[#244f31] py-3 text-xs font-bold text-white shadow hover:bg-[#1d3b24]"
              >
                DOWNLOAD FOR ANDROID (PLAY STORE)
              </button>
              <button
                onClick={() => {
                  alert("Redirecting to Apple App Store...");
                  setAppModalOpen(false);
                }}
                className="w-full rounded-xl border border-[#244f31] py-3 text-xs font-bold text-[#244f31] hover:bg-[#eef5df]"
              >
                DOWNLOAD FOR iOS (APP STORE)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      {loginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setLoginModalOpen(false)}
          />
          <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <button
              onClick={() => setLoginModalOpen(false)}
              className="absolute right-4 top-4 rounded-full p-1 text-[#666666] hover:bg-[#f8faf1]"
            >
              <X className="size-5" />
            </button>
            <div className="flex items-center gap-2">
              <User className="size-5 text-[#244f31]" />
              <h3 className="text-lg font-bold text-[#17231b]">Login to Pyur Ayur</h3>
            </div>
            <p className="mt-1 text-xs text-[#666666]">
              Enter your mobile number to get OTP and manage your orders & Pyur Coins.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert("OTP Sent to your mobile number!");
                setLoginModalOpen(false);
              }}
              className="mt-4 space-y-3"
            >
              <input
                type="tel"
                required
                maxLength={10}
                placeholder="Enter 10-digit mobile number"
                className="w-full rounded-lg border border-[#ddddd9] px-3 py-2.5 text-xs outline-none focus:border-[#244f31]"
              />
              <button
                type="submit"
                className="w-full rounded-xl bg-[#244f31] py-3 text-xs font-black tracking-widest text-white shadow hover:bg-[#1d3b24]"
              >
                GET OTP & CONTINUE
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
