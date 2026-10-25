"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import AnnouncementBar from "@/components/AnnouncementBar";
import SiteHeader from "@/components/SiteHeader";
import HeroSlider from "@/components/HeroSlider";
import ConcernFilter from "@/components/ConcernFilter";
import ProductRail from "@/components/ProductRail";
import TrustSection from "@/components/TrustSection";
import DoctorConsultationBanner from "@/components/DoctorConsultationBanner";
import AyurvedicQuizModal from "@/components/AyurvedicQuizModal";
import AboutSection from "@/components/AboutSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import RecentlyViewedSection from "@/components/RecentlyViewedSection";
import SiteFooter from "@/components/SiteFooter";
import MarketingBannerStrip from "@/components/MarketingBannerStrip";
import MarketingPopup from "@/components/MarketingPopup";
import SocialProofToast from "@/components/SocialProofToast";
import { StorefrontSkeleton } from "@/components/SkeletonLoader";
import { products, Product, concerns } from "@/lib/store";
import { getStorefrontData } from "@/lib/storefront-client";
import { X, User } from "lucide-react";
import GetAppModal from "@/components/GetAppModal";
import { trackMetaEvent } from "@/components/MetaPixel";

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

interface HomeClientProps {
  initialProducts?: Product[];
  initialCategories?: any[];
  initialCmsData?: any;
  initialMarketingData?: any;
}

export default function HomeClient({
  initialProducts = [],
  initialCategories = [],
  initialCmsData = null,
  initialMarketingData = null,
}: HomeClientProps) {
  const router = useRouter();
  const [selectedConcern, setSelectedConcern] = useState<string | null>(null);

  // Initialize with server-rendered MongoDB data immediately (0ms paint, no hydration lag)
  const [catalog, setCatalog] = useState<Product[]>(() =>
    Array.isArray(initialProducts) && initialProducts.length > 0 ? initialProducts : products
  );
  const [categories, setCategories] = useState<any[]>(() =>
    Array.isArray(initialCategories) && initialCategories.length > 0 ? initialCategories : concerns
  );
  const [cmsData, setCmsData] = useState<any>(() =>
    initialCmsData || {
      announcement: null,
      heroSlides: [],
      consultationBanner: null,
      aboutUs: null,
    }
  );
  const [marketingData, setMarketingData] = useState<any>(() =>
    initialMarketingData || {
      banners: [],
      popups: [],
      notifications: [],
    }
  );
  const [isDataLoaded, setIsDataLoaded] = useState<boolean>(true);

  // Sync prop changes from Server Component on navigation or SSR updates
  useEffect(() => {
    if (initialProducts && initialProducts.length > 0) setCatalog(initialProducts);
  }, [initialProducts]);

  useEffect(() => {
    if (initialCategories && initialCategories.length > 0) setCategories(initialCategories);
  }, [initialCategories]);

  useEffect(() => {
    if (initialCmsData) setCmsData(initialCmsData);
  }, [initialCmsData]);

  useEffect(() => {
    if (initialMarketingData) setMarketingData(initialMarketingData);
  }, [initialMarketingData]);

  // Load real-time database products and layout from /api/storefront + Instant Local Cache
  useEffect(() => {
    // Clean up any stale client-side cache so fresh Server Component SSR data is never overwritten
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("pyur_storefront_cache");
      } catch {}
    }

    // 2. Fetch live data from backend with cache busting
    const loadStorefrontData = () => {
      getStorefrontData(true)
        .then((data) => {
          if (data && data.products && Array.isArray(data.products) && data.products.length > 0) {
            setCatalog(data.products);
          }
          if (data && data.categories && Array.isArray(data.categories) && data.categories.length > 0) {
            setCategories(data.categories);
          }
          if (data && data.content) {
            setCmsData(data.content);
          }
          if (data && data.marketing) {
            setMarketingData(data.marketing);
          }
          setIsDataLoaded(true);
        })
        .catch((e) => {
          console.error("Error loading storefront layout:", e);
          setIsDataLoaded(true);
        });
    };

    loadStorefrontData();

    // 3. Real-time listener for live updates from Admin panel (Instant 0ms cross-tab update)
    const handleLiveUpdate = (e: any) => {
      if (e?.detail?.key === "products" && Array.isArray(e.detail.value)) {
        setCatalog(e.detail.value);
      }
      if (e?.detail?.key === "categories" && Array.isArray(e.detail.value)) {
        setCategories(e.detail.value);
      }
      if (e?.detail?.key === "content" && e.detail.value) {
        setCmsData(e.detail.value);
      }
      if (e?.detail?.key === "marketing" && e.detail.value) {
        setMarketingData(e.detail.value);
      }
      loadStorefrontData();
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "pyur_storefront_cache" && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed.content) setCmsData(parsed.content);
          if (parsed.products && Array.isArray(parsed.products)) setCatalog(parsed.products);
          if (parsed.categories && Array.isArray(parsed.categories)) setCategories(parsed.categories);
          if (parsed.marketing) setMarketingData(parsed.marketing);
        } catch {}
      }
      loadStorefrontData();
    };

    window.addEventListener("pyur_storefront_updated", handleLiveUpdate);
    window.addEventListener("storage", handleStorageChange);

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel("pyur_storefront_sync");
      channel.onmessage = (event) => {
        if (event?.data?.type === "SYNC") {
          const { key, value } = event.data;
          if (key === "marketing" && value) setMarketingData(value);
          if (key === "content" && value) setCmsData(value);
          if (key === "products" && Array.isArray(value)) setCatalog(value);
          if (key === "categories" && Array.isArray(value)) setCategories(value);
          loadStorefrontData();
        }
      };
    } catch {}

    // Handle initial #shop anchor or hash change
    const handleHashScroll = () => {
      if (typeof window !== "undefined" && (window.location.hash === "#shop" || window.location.hash === "#products")) {
        setTimeout(() => {
          const el = document.getElementById("shop");
          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 150);
      }
    };
    handleHashScroll();
    window.addEventListener("hashchange", handleHashScroll);

    return () => {
      window.removeEventListener("pyur_storefront_updated", handleLiveUpdate);
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("hashchange", handleHashScroll);
      if (channel) {
        try {
          channel.close();
        } catch {}
      }
    };
  }, []);

  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);

  // Load cart from localStorage safely and subscribe to live changes
  useEffect(() => {
    const syncCart = () => {
      if (typeof window === "undefined") return;
      try {
        const stored = localStorage.getItem("pyur_cart");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            const valid = parsed.filter((item: any) => item && item.product && item.product.id && item.product.name);
            setCart(valid);
            if (valid.length !== parsed.length) {
              localStorage.setItem("pyur_cart", JSON.stringify(valid));
            }
          } else {
            setCart([]);
            localStorage.removeItem("pyur_cart");
          }
        } else {
          setCart([]);
        }
      } catch (e) {
        console.error("Failed to parse cart:", e);
        setCart([]);
        try { localStorage.removeItem("pyur_cart"); } catch {}
      }
    };

    syncCart();
    window.addEventListener("storage", syncCart);
    window.addEventListener("pyur_cart_updated", syncCart);
    return () => {
      window.removeEventListener("storage", syncCart);
      window.removeEventListener("pyur_cart_updated", syncCart);
    };
  }, []);

  // Save cart to localStorage on updates
  const saveCartState = (newCart: { product: Product; quantity: number }[]) => {
    setCart(newCart);
    localStorage.setItem("pyur_cart", JSON.stringify(newCart));
    setTimeout(() => {
      window.dispatchEvent(new Event("pyur_cart_updated"));
    }, 0);
  };

  // Dynamic Homepage Section Visibility Control
  const isSectionVisible = (sectionKey: string): boolean => {
    const visibility = cmsData?.sectionsVisibility || {};
    if (visibility[sectionKey] !== undefined) {
      return Boolean(visibility[sectionKey]);
    }
    // Backward compatibility checks for legacy properties
    if (sectionKey === "announcement" && cmsData?.announcement?.visible !== undefined) {
      return Boolean(cmsData.announcement.visible);
    }
    if (sectionKey === "consultationBanner" && cmsData?.consultationBanner?.visible !== undefined) {
      return Boolean(cmsData.consultationBanner.visible);
    }
    if (sectionKey === "aboutSection" && cmsData?.aboutUs?.visible !== undefined) {
      return Boolean(cmsData.aboutUs.visible);
    }
    if (sectionKey === "footer" && cmsData?.footer?.visible !== undefined) {
      return Boolean(cmsData.footer.visible);
    }
    return true;
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

    try {
      trackMetaEvent("AddToCart", {
        content_name: product.name,
        content_ids: [product.id],
        content_type: "product",
        value: product.price,
        currency: "INR",
      });
    } catch {}
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
    ? catalog.filter((p) => {
        const pConcern = (p.concern || "").toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]/g, "");
        const sConcern = selectedConcern.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]/g, "");
        return pConcern === sConcern || pConcern.includes(sConcern) || sConcern.includes(pConcern);
      })
    : catalog;

  // Fresh Arrivals: Always exactly 6 products, sorted newer to older (newest first)
  const freshArrivalsProducts = useMemo(() => {
    if (!catalog || catalog.length === 0) return [];
    const sorted = [...catalog].sort((a: any, b: any) => {
      if (a.createdAt && b.createdAt) {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      const numA = parseInt(String(a.id).replace(/\D/g, ""), 10);
      const numB = parseInt(String(b.id).replace(/\D/g, ""), 10);
      if (!isNaN(numA) && !isNaN(numB) && numA !== numB) {
        return numB - numA;
      }
      return 0;
    });

    if (sorted.length > 1 && sorted[0]?.id === catalog[0]?.id) {
      return [...catalog].reverse().slice(0, 6);
    }
    return sorted.slice(0, 6);
  }, [catalog]);

  return (
    <main className="min-h-screen bg-white text-neutral-900">
      {/* Top Announcement Ticker Bar */}
      {isSectionVisible("announcement") && (
        <AnnouncementBar
          data={cmsData.announcement}
          marketingBanners={marketingData?.banners}
          onOpenAppModal={() => setAppModalOpen(true)}
        />
      )}

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

      {/* Hero Banner Slider Carousel (Full Width Taitva Style) */}
      {isSectionVisible("heroSlider") && (
        <HeroSlider slides={cmsData.heroSlides} marketingBanners={marketingData?.banners} />
      )}

      {/* "NOURISH & THRIVE" 3 Category Circles (Taitva Style) */}
      {isSectionVisible("categoryFilter") && (
        <ConcernFilter
          selectedConcern={selectedConcern}
          onSelectConcern={(concern) => setSelectedConcern(concern)}
          categories={categories}
        />
      )}

      {/* Main Shop / Products Section (FRESH ARRIVALS) */}
      {isSectionVisible("productsCatalog") && (
        <div id="shop" className="scroll-mt-24">
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
          filteredProducts.length > 0 ? (
            <ProductRail
              title={selectedConcern.toUpperCase()}
              items={filteredProducts}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
            />
          ) : (
            <div className="mx-auto max-w-[1440px] px-4 py-12 md:py-16 text-center">
              <div className="mx-auto max-w-lg rounded-3xl border border-neutral-200 bg-white p-8 sm:p-12 shadow-sm text-center">
                <div className="mx-auto flex size-20 items-center justify-center rounded-2xl bg-[#c2d4c5]/20 border border-[#023915]/20 text-3xl mb-5 shadow-xs">
                  <span>{categories.find((c: any) => (c.name || "").toLowerCase() === selectedConcern.toLowerCase())?.icon || "🌿"}</span>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#023915]/10 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-[#023915]">
                  ⏳ Formulations Coming Soon
                </span>
                <h3 className="mt-4 text-2xl font-black text-neutral-900 sm:text-3xl">
                  {selectedConcern} Care Coming Soon!
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-neutral-600">
                  Our expert Ayurvedic Vaidyas are currently preparing 100% natural, certified gold-grade formulations for <strong>{selectedConcern}</strong>. Authentic remedies will be launching here very soon!
                </p>
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={() => setSelectedConcern(null)}
                    className="w-full sm:w-auto rounded-xl bg-[#023915] px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-md transition hover:bg-black cursor-pointer"
                  >
                    Explore All Available Remedies
                  </button>
                  <a
                    href={`https://wa.me/917247824101?text=${encodeURIComponent(`नमस्ते! मुझे ${selectedConcern} के आयुर्वेदिक इलाज के बारे में जानकारी चाहिए।`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto rounded-xl border border-[#25D366] bg-[#25D366]/10 px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-[#128C7E] transition hover:bg-[#25D366]/20 flex items-center justify-center gap-1.5"
                  >
                    <span>Ask Doctor on WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          )
        ) : (
          <>
            {/* 1. FRESH ARRIVALS Rail: Always exactly 6 products, sorted newer to older, in grid (never slider) */}
            <ProductRail
              title="FRESH ARRIVALS"
              subtitle="Recently formulated 100% natural Ayurvedic remedies"
              items={freshArrivalsProducts}
              disableMobileSlider={true}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
            />

            {/* Dynamic Promotional Marketing Banner Strip (Prime Middle Position) */}
            {isSectionVisible("marketingBanners") && (
              <MarketingBannerStrip banners={marketingData?.banners} placement="Homepage Middle Strip" />
            )}

            {/* 2. Dynamic Rails for every category with active products */}
            {categories.map((cat: any) => {
              const catProducts = catalog.filter((p) => {
                const pConcern = (p.concern || "").toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]/g, "");
                const cName = (cat.name || "").toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]/g, "");
                return pConcern === cName || pConcern.includes(cName) || cName.includes(pConcern);
              });
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
      )}

      {/* Dynamic Promotional Marketing Banner Strip (Above Consultation placement) */}
      {isSectionVisible("marketingBanners") && (
        <MarketingBannerStrip banners={marketingData?.banners} placement="Above Consultation" />
      )}

      {/* 1-on-1 Free Doctor Consultation Banner */}
      {isSectionVisible("consultationBanner") && (
        <DoctorConsultationBanner data={cmsData.consultationBanner} />
      )}

      {/* Heritage & Philosophy About Us Section */}
      {isSectionVisible("aboutSection") && (
        <AboutSection cmsAboutUs={cmsData?.aboutUs} />
      )}

      {/* Why Pure Ayur Herbs Trust Section */}
      {isSectionVisible("trustSection") && (
        <TrustSection bannerImage={cmsData?.trustSection?.image || cmsData?.trustBanner} />
      )}

      {/* 2-Minute Health Assessment Quiz */}
      {isSectionVisible("healthQuiz") && (
        <AyurvedicQuizModal onAddToCart={handleAddToCart} />
      )}

      {/* Recently Viewed Remedies */}
      <RecentlyViewedSection />

      {/* Customer Reviews & Transformations */}
      {isSectionVisible("testimonials") && (
        <TestimonialsSection />
      )}

      {/* Main Footer */}
      {isSectionVisible("footer") && (
        <SiteFooter />
      )}

      {/* Get App (Coming Soon) Modal */}
      <GetAppModal
        isOpen={appModalOpen}
        onClose={() => setAppModalOpen(false)}
      />

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
              <h3 className="text-lg font-bold text-[#17231b]">Login to Pure Ayur</h3>
            </div>
            <p className="mt-1 text-xs text-[#666666]">
              Enter your mobile number to get OTP and manage your orders & Pure Coins.
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
      {/* Exit-Intent & Promo Marketing Popup */}
      <MarketingPopup popups={marketingData?.popups} />

      {/* Live Social Proof Purchase Toasts */}
      <SocialProofToast notifications={marketingData?.notifications} />
    </main>
  );
}
