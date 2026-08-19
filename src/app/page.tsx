"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AnnouncementBar from "@/components/AnnouncementBar";
import SiteHeader from "@/components/SiteHeader";
import HeroSlider from "@/components/HeroSlider";
import ConcernFilter from "@/components/ConcernFilter";
import ProductRail from "@/components/ProductRail";
import DoctorConsultationBanner from "@/components/DoctorConsultationBanner";
import TrustSection from "@/components/TrustSection";
import AyurvedicQuizModal from "@/components/AyurvedicQuizModal";
import TestimonialsSection from "@/components/TestimonialsSection";
import PressSection from "@/components/PressSection";
import SiteFooter from "@/components/SiteFooter";
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
  const [catalog, setCatalog] = useState<Product[]>(products);
  const [categories, setCategories] = useState<any[]>(concerns);
  const [cmsData, setCmsData] = useState<any>({
    announcement: null,
    heroSlides: [],
    consultationBanner: null
  });

  // Load dynamic catalog and CMS layout settings from database on mount
  useEffect(() => {
    fetch("/api/admin/all", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data.products && data.products.length > 0) {
          setCatalog(data.products);
        }
        if (data.categories && data.categories.length > 0) {
          setCategories(data.categories);
        }
        if (data.content) {
          setCmsData(data.content);
        }
      })
      .catch((e) => console.error("Error loading storefront layout:", e));
  }, []);

  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([
    { product: products[0], quantity: 1 },
  ]);

  // Modal States
  const [appModalOpen, setAppModalOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [consultationModalOpen, setConsultationModalOpen] = useState(false);

  // Cart Handlers
  const handleAddToCart = (product: Product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as { product: Product; quantity: number }[]
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  };

  const handleBuyNow = (product: Product) => {
    router.push(`/checkout?productId=${product.id}&quantity=1`);
  };

  // Filter products by selected concern if active
  const filteredProducts = selectedConcern
    ? catalog.filter((p) => p.concern === selectedConcern)
    : catalog;

  const sugarProducts = catalog.filter((p) => p.concern === "Sugar Management");
  const fitnessProducts = catalog.filter(
    (p) => p.concern === "Gym & Fitness" || p.concern === "Energy & Vitality"
  );
  const skinDailyProducts = catalog.filter(
    (p) => p.concern === "Skin & Hair" || p.concern === "Daily Ayurveda" || p.concern === "Women's Health"
  );

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
      />

      {/* Mobile Circular Category Selector (Kapiva-Style) - Mobile Only */}
      <div className="md:hidden bg-white border-b border-[#ddddd9] py-3.5 px-4 overflow-x-auto no-scrollbar flex gap-5 scroll-smooth min-w-0">
        {categories.map((c) => {
          const isSelected = selectedConcern === c.name;
          const shortName = getShortName(c.name);
          return (
            <button
              key={c.id}
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
      />

      {/* Main Shop / Products Section */}
      <div id="shop">
        {selectedConcern ? (
          <ProductRail
            title={`Remedies for ${selectedConcern}`}
            subtitle={`Showing ${filteredProducts.length} Ayurvedic formulations`}
            items={filteredProducts}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
          />
        ) : (
          <>
            <ProductRail
              title="Kapiva-Style Bestselling Remedies"
              subtitle="Top-rated Ayurvedic juices, resins & elixirs backed by Vaidyas"
              items={catalog.slice(0, 4)}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
            />

            <ProductRail
              title="Sugar Management & Metabolic Care"
              subtitle="11-Herb Ayurvedic solutions for healthy glucose regulation"
              items={sugarProducts.length > 0 ? sugarProducts : catalog.slice(0, 4)}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
            />

            <ProductRail
              title="Energy, Stamina & Gym Fitness"
              subtitle="Pure Himalayan Shilajit and joint mobility formulas"
              items={fitnessProducts.length > 0 ? fitnessProducts : catalog.slice(2, 6)}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
            />

            <ProductRail
              title="Skin Radiance & Daily Wellness"
              subtitle="Kumkumadi Saffron, Amla Vitamin C, and Women's Period Harmony"
              items={skinDailyProducts.length > 0 ? skinDailyProducts : catalog.slice(4, 8)}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
            />
          </>
        )}
      </div>

      {/* Free Ayurvedic Doctor Consultation Banner */}
      <DoctorConsultationBanner
        data={cmsData.consultationBanner}
        openModalDirectly={consultationModalOpen}
        onCloseModal={() => setConsultationModalOpen(false)}
      />

      {/* Why Pyur Ayur Herbs Trust Section */}
      <TrustSection />

      {/* 2-Minute Health Assessment Quiz */}
      <AyurvedicQuizModal onAddToCart={handleAddToCart} />

      {/* Customer Reviews & Transformations */}
      <TestimonialsSection />

      {/* As Featured In Press Bar */}
      <PressSection />

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
