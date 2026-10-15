"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { trackMetaEvent } from "./MetaPixel";
import Image from "next/image";
import Link from "next/link";
import {
  Star,
  ShoppingBag,
  Truck,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  ChevronDown,
  Plus,
  Minus,
  Sparkles,
  Award,
  X,
  Loader2,
  AlertCircle,
  Bell,
  ArrowRight,
  ArrowLeft,
  Search,
  Camera,
  Copy,
  Check,
  Phone,
  MessageCircle,
  HelpCircle,
  Shield,
  Clock,
  RefreshCw,
  Zap,
  Info,
} from "lucide-react";
import AnnouncementBar from "./AnnouncementBar";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import { ProductDetail } from "@/lib/product-detail-data";
import { Product } from "@/lib/store";
import { uploadReviewImage } from "@/lib/upload";

interface ProductDetailViewProps {
  product: ProductDetail;
  coupons?: any[];
  settings?: any;
}

export function ProductDetailView({ product, coupons, settings }: ProductDetailViewProps) {
  // Admin Panel Live State & Real-time Offers
  const [adminCoupons, setAdminCoupons] = useState<any[]>(() =>
    Array.isArray(coupons) && coupons.length > 0 ? coupons : []
  );
  const [storeSettings, setStoreSettings] = useState<any>(() => settings || {});
  const [selectedOfferCode, setSelectedOfferCode] = useState<string | null>(null);

  // Hydrate fresh coupons and settings from Admin DB
  useEffect(() => {
    fetch("/api/admin/coupons")
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.coupons) && data.coupons.length > 0) {
          setAdminCoupons(data.coupons);
        }
      })
      .catch(() => {});

    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.settings) {
          setStoreSettings(data.settings);
        }
      })
      .catch(() => {});
  }, []);
  // Variants or Kapiva-style pack bundle selector
  const variants =
    product.variants && product.variants.length > 0
      ? product.variants
      : [
          {
            id: `${product.id || "1"}-pack1`,
            name: "1 Pack (1 Month)",
            value: "1 Pack",
            price: Number(product.price) || 0,
            mrp: Number(product.mrp) || Math.round((Number(product.price) || 0) * 1.25),
            discount: product.discount || "SPECIAL OFFER",
            badge: "STANDARD PACK",
            inStock: product.inStock !== false,
          },
        ];

  const variantImages = (product.variants || []).map((v: any) => v.image).filter(Boolean);
  const baseGallery =
    product.gallery && product.gallery.length > 0
      ? product.gallery.filter(Boolean)
      : [product.image || "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=650&q=80"];
  const gallery = Array.from(new Set([...baseGallery, ...variantImages]));

  const ingredients = Array.isArray(product.ingredients) && product.ingredients.length > 0
    ? product.ingredients
    : [
        { name: "Himalayan Herbal Actives", description: "Wild-harvested potent botanical extracts.", action: "Primary Ayurvedic Active" },
        { name: "Classical Bio-Enhancers", description: "Improves bioavailability and cellular absorption.", action: "Absorption Catalyst" },
      ];

  const benefits = Array.isArray(product.benefits) && product.benefits.length > 0
    ? product.benefits
    : [
        { title: "100% Pure Botanical Extracts", desc: "Crafted strictly with whole herbal actives without synthetic binders.", icon: "🌿" },
        { title: "Senior Vaidya Formulated", desc: "Balanced classical Ayurvedic preparation backed by research.", icon: "🩺" },
        { title: "Certified AYUSH Facility", desc: "Prepared in GMP-certified hygienic labs with high bioavailability.", icon: "🛡️" },
        { title: "Safe for Daily Use", desc: "Non-habit forming, zero harmful chemicals, and gentle on the gut.", icon: "✨" },
      ];

  const dosageSteps = Array.isArray(product.dosageSteps) && product.dosageSteps.length > 0
    ? product.dosageSteps
    : [
        { step: 1, title: "Measure Dose", description: "Take the recommended quantity daily.", icon: "🥄", timing: "Daily" },
        { step: 2, title: "Mix with Warm Water", description: "Stir thoroughly in a glass of warm water or milk.", icon: "🥛", timing: "Warm Liquid" },
        { step: 3, title: "Consistent Routine", description: "Consume consistently for 60 to 90 days for peak results.", icon: "⏰", timing: "Consistent Care" },
      ];

  const suitableFor = product.suitableFor || {
    recommended: [
      "Adults seeking natural, long-term Ayurvedic balance",
      "Those wanting 100% herbal, chemical-free daily wellness",
      "Safe for continuous use across adult age groups (18-70+ years)",
    ],
    caution: [
      "Pregnant or lactating mothers should consult their physician before use",
      "Maintain a 45-minute gap if taking allopathic medications",
    ],
  };

  const whyAyurveda = product.whyAyurveda || [
    { title: "100% Himalayan Herbs", desc: "Sourced from pristine altitudes with high active phytochemicals.", icon: "🏔️" },
    { title: "Heavy Metal Tested", desc: "Strictly tested for Lead, Mercury & Arsenic in NABL labs.", icon: "🧪" },
    { title: "AYUSH & GMP Certified", desc: "Prepared according to traditional Charaka Samhita guidelines.", icon: "📜" },
    { title: "Doctor Formulated", desc: "Developed and approved by senior Ayurvedic Vaidyas.", icon: "👨‍⚕️" },
  ];

  const specifications = product.specifications || [
    { label: "Product Form", value: "Standardized Ayurvedic Formulation" },
    { label: "Shelf Life", value: "24 Months from Mfd." },
    { label: "Country of Origin", value: "India" },
    { label: "AYUSH License", value: "100% Certified Ayurvedic Proprietary Medicine" },
    { label: "Storage", value: "Store in a cool, dry place away from direct sunlight." },
  ];

  const faqs = Array.isArray(product.faqs) && product.faqs.length > 0 ? product.faqs : [];

  // State Management
  const [selectedImage, setSelectedImage] = useState(gallery[0]);
  const [selectedVariant, setSelectedVariant] = useState(variants[0]);
  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState("");
  const [pincodeVerified, setPincodeVerified] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [specificationsOpen, setSpecificationsOpen] = useState(false);
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);

  // Reviews State
  const [reviewsList, setReviewsList] = useState<any[]>(() =>
    Array.isArray(product.customerReviews) && product.customerReviews.length > 0
      ? product.customerReviews
      : []
  );
  const [showAllProductReviews, setShowAllProductReviews] = useState(false);
  const [selectedStarFilter, setSelectedStarFilter] = useState<number | null>(null);
  const [sortOption, setSortOption] = useState<"recent" | "highest" | "lowest" | "photos">("recent");
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: "",
    comment: "",
    customerName: "",
    location: "",
    orderIdOrPhone: "",
    image: "",
  });
  const [uploadingReviewImg, setUploadingReviewImg] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState<string | null>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);

  // Cart State for Header
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [appModalOpen, setAppModalOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [consultationModalOpen, setConsultationModalOpen] = useState(false);

  // Detect scroll for Mobile Sticky Buy Bar (Kapiva Feature)
  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== "undefined") {
        if (window.scrollY > 380) {
          setShowStickyBar(true);
        } else {
          setShowStickyBar(false);
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Sync initial variant
  useEffect(() => {
    const initialVariant = variants[0];
    setSelectedVariant(initialVariant);
    if (initialVariant?.image) {
      setSelectedImage(initialVariant.image);
    } else {
      setSelectedImage(gallery[0]);
    }
    setQuantity(1);
  }, [product.id, product.image]);

  // Click outside sort dropdown
  useEffect(() => {
    if (!isSortDropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target as Node)) {
        setIsSortDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSortDropdownOpen]);

  // Fetch reviews from API
  useEffect(() => {
    fetch(`/api/reviews?productId=${encodeURIComponent(product.id)}&slug=${encodeURIComponent(product.slug)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success && Array.isArray(data.reviews)) {
          setReviewsList(data.reviews);
        }
      })
      .catch((e) => console.error("Error loading product reviews:", e));
  }, [product.id, product.slug]);

  // Read Cart from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("pyur_cart");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            const valid = parsed.filter(
              (item: any) => item && item.product && typeof item.product === "object" && item.product.id
            );
            setCart(valid);
          }
        }
      } catch {}
    }
  }, []);

  // Track Meta Pixel ViewContent & Recently Viewed
  useEffect(() => {
    trackMetaEvent("ViewContent", {
      content_ids: [product.id],
      content_type: "product",
      value: product.price,
      currency: "INR",
    });

    if (typeof window !== "undefined" && product) {
      try {
        const stored = localStorage.getItem("pyur_recently_viewed");
        let list: string[] = stored ? JSON.parse(stored) : [];
        list = list.filter((slug) => slug !== product.slug);
        list.unshift(product.slug);
        if (list.length > 8) list = list.slice(0, 8);
        localStorage.setItem("pyur_recently_viewed", JSON.stringify(list));
      } catch {}
    }
  }, [product]);

  // Auto-open review modal if coming from email (?rate=true)
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const shouldRate = urlParams.get("rate") === "true";
        const paramOrderId = urlParams.get("orderId") || "";
        const paramName = urlParams.get("customerName") || "";
        const paramPhone = urlParams.get("phone") || "";

        if (shouldRate || paramOrderId) {
          setReviewForm((prev) => ({
            ...prev,
            orderIdOrPhone: paramOrderId || paramPhone || prev.orderIdOrPhone,
            customerName: paramName || prev.customerName,
          }));
          setReviewModalOpen(true);
        }

        if (window.location.hash === "#reviews") {
          setTimeout(() => {
            const el = document.getElementById("reviews");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }, 400);
        }
      } catch {}
    }
  }, []);

  // Calculations
  const currentVariant = selectedVariant || variants[0];
  const isAvailable = product.inStock !== false && currentVariant.inStock !== false;
  const unitPrice = Number(currentVariant.price) || 0;
  const unitMrp = Number(currentVariant.mrp || currentVariant.compareAt) || Math.round(unitPrice * 1.25);
  const savings = Math.max(0, unitMrp - unitPrice);
  const discountPercent = unitMrp > unitPrice ? Math.round(((unitMrp - unitPrice) / unitMrp) * 100) : 0;

  const totalRatingsCount = reviewsList.length > 0 ? reviewsList.length : (product.reviews || 248);
  const displayRating = useMemo(() => {
    if (reviewsList.length === 0) return product.rating || 4.8;
    const sum = reviewsList.reduce((acc, r) => acc + (Number(r.rating) || 5), 0);
    return Number((sum / reviewsList.length).toFixed(1));
  }, [reviewsList, product.rating]);

  const ratingBreakdown = useMemo(() => {
    const starCounts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviewsList.forEach((r) => {
      const star = Math.min(5, Math.max(1, Math.round(Number(r.rating) || 5)));
      starCounts[star] = (starCounts[star] || 0) + 1;
    });
    const total = reviewsList.length || 1;
    return [5, 4, 3, 2, 1].map((star) => {
      const count = starCounts[star] || 0;
      const percentage = reviewsList.length > 0 ? Math.round((count / total) * 100) : (star === 5 ? 84 : star === 4 ? 12 : 2);
      return { star, count: reviewsList.length > 0 ? count : (star === 5 ? 208 : star === 4 ? 30 : 5), percentage };
    });
  }, [reviewsList]);

  const sortedAndFilteredReviews = useMemo(() => {
    let list = [...reviewsList];
    if (selectedStarFilter !== null) {
      list = list.filter((r) => Math.min(5, Math.max(1, Math.round(Number(r.rating) || 5))) === selectedStarFilter);
    }
    if (sortOption === "highest") {
      list.sort((a, b) => (Number(b.rating) || 5) - (Number(a.rating) || 5));
    } else if (sortOption === "lowest") {
      list.sort((a, b) => (Number(a.rating) || 5) - (Number(b.rating) || 5));
    } else if (sortOption === "photos") {
      list = list.filter((r) => Boolean(r.image || (Array.isArray(r.images) && r.images.length > 0)));
    }
    return list;
  }, [reviewsList, selectedStarFilter, sortOption]);

  const sortLabels: Record<string, string> = {
    recent: "MOST RECENT",
    highest: "HIGHEST RATING",
    lowest: "LOWEST RATING",
    photos: "WITH PHOTOS",
  };

  // Dynamic contact channels from storeSettings
  const rawAdminPhone = storeSettings?.whatsappNumber || "917247824101";
  const whatsappNum = rawAdminPhone.replace(/\D/g, "") || "917247824101";
  const supportPhone = storeSettings?.supportPhone || whatsappNum;

  // Real-time calculation of applicable offers
  const displayOffers = useMemo(() => {
    const activeList = adminCoupons.filter((c: any) => {
      if (!c || c.status !== "Active") return false;
      if (c.applicableType === "Category" && c.applicableValue && product.category !== c.applicableValue) {
        return false;
      }
      if (c.applicableType === "Product" && c.applicableValue && String(product.id) !== String(c.applicableValue)) {
        return false;
      }
      return true;
    });

    const mapped = activeList.map((c: any) => {
      let discountText = "";
      if (c.type === "Percentage") {
        discountText = `${c.value}% Instant Off`;
      } else if (c.type === "Flat") {
        discountText = `₹${c.value} Flat Off`;
      } else if (c.type === "Free Shipping") {
        discountText = "Free Express Delivery";
      }

      let descText = "";
      if (c.minCartValue && Number(c.minCartValue) > 0) {
        descText = `Valid on orders ₹${c.minCartValue}+`;
      } else if (c.applicableType === "Category") {
        descText = `Valid on ${c.applicableValue}`;
      } else {
        descText = "Applicable at checkout on this order";
      }

      let badge = "ACTIVE OFFER";
      if (c.code === "PREPAID5") badge = "RECOMMENDED";
      else if (c.code === "AYUR100") badge = "BEST VALUE";
      else if (c.code === "PYUR10") badge = "POPULAR";

      return {
        code: c.code,
        discount: discountText,
        description: descText,
        badge,
      };
    });

    if (mapped.length === 0) {
      return [
        {
          code: "PREPAID5",
          discount: `${storeSettings?.prepaidDiscount || 5}% Instant Off`,
          description: "Get 5% instant discount on UPI / Online Prepaid orders",
          badge: "RECOMMENDED",
        },
        {
          code: "AYUR100",
          discount: "₹100 Flat Off",
          description: "Applicable on combo packs and orders ₹999+",
          badge: "SAVER",
        },
        {
          code: "PYUR10",
          discount: "10% Instant Off",
          description: "Special seasonal Ayurvedic wellness discount",
          badge: "POPULAR",
        },
      ];
    }

    return mapped;
  }, [adminCoupons, product, storeSettings]);

  const cartCount = cart.reduce((total, item) => total + (item.quantity || 1), 0);

  const mobileKeyBenefits = useMemo(() => {
    if (Array.isArray(product.benefits) && product.benefits.length >= 4) {
      return product.benefits.slice(0, 4).map((b) => b.title);
    }
    return [
      "Helps Regulate Blood Sugar Levels",
      "Boosts Insulin Sensitivity",
      "100% Ayurvedic & Safe",
      "Clinically Evaluated",
    ];
  }, [product.benefits]);

  const handleCopyCoupon = (code: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code);
    }
    setCopiedCoupon(code);
    setSelectedOfferCode(code);
    try {
      localStorage.setItem("pyur_applied_coupon", code);
    } catch {}
    setTimeout(() => setCopiedCoupon(null), 3000);
  };

  const handleAddToCart = (prod: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product && item.product.id === prod.id);
      let updated;
      if (existing) {
        updated = prev.map((item) =>
          item.product && item.product.id === prod.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        updated = [...prev, { product: prod, quantity: 1 }];
      }
      try {
        localStorage.setItem("pyur_cart", JSON.stringify(updated));
      } catch {}
      return updated;
    });

    try {
      trackMetaEvent("AddToCart", {
        content_name: prod.name,
        content_ids: [prod.id],
        content_type: "product",
        value: prod.price,
        currency: "INR",
      });
    } catch {}
  };

  const handleBuyNow = () => {
    const variantLabel = currentVariant.value || currentVariant.name || "";
    const variantImage = currentVariant.image ? `&variantImage=${encodeURIComponent(currentVariant.image)}` : "";
    const variantQuery = currentVariant?.id
      ? `&variantId=${encodeURIComponent(currentVariant.id)}&price=${unitPrice}&variantName=${encodeURIComponent(variantLabel)}${variantImage}`
      : "";
    const activeCouponCode = selectedOfferCode || (typeof window !== "undefined" ? localStorage.getItem("pyur_applied_coupon") : null);
    const couponQuery = activeCouponCode ? `&coupon=${encodeURIComponent(activeCouponCode)}` : "";
    window.location.href = `/checkout?productId=${product.id}&quantity=${quantity}${variantQuery}${couponQuery}`;
  };

  const handleVerifyPincode = (e: React.FormEvent) => {
    e.preventDefault();
    if (pincode.length === 6) {
      setPincodeVerified(true);
    }
  };

  return (
    <main className="min-h-screen bg-[#f8faf1] text-[#17231b] antialiased pb-24 lg:pb-0">
      {/* ========================================================================= */}
      {/* MOBILE APP HEADER (Exact match to screenshot)                             */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#e5e5e5] px-3.5 py-2.5 flex items-center justify-between lg:hidden shadow-2xs">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined" && window.history.length > 1) {
                window.history.back();
              } else {
                window.location.href = "/";
              }
            }}
            aria-label="Go Back"
            className="p-1 -ml-1 text-[#17231b] hover:text-[#244f31] cursor-pointer"
          >
            <ArrowLeft className="size-5" />
          </button>
          <Link href="/" className="flex items-center gap-2">
            <div className="size-7 rounded-full overflow-hidden border border-[#ddddd9] bg-white shrink-0 flex items-center justify-center p-0.5">
              <Image
                src="/brand/pure-ayur-logo.svg"
                alt="Pure Ayur Herbs"
                width={26}
                height={26}
                className="size-full object-contain"
                onError={(e: any) => {
                  e.currentTarget.src = "/icon.png";
                }}
              />
            </div>
            <span className="text-sm font-black text-[#17231b] tracking-tight">Pure Ayur Herbs</span>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/search" aria-label="Search Catalog" className="p-1 text-[#17231b] hover:text-[#244f31] cursor-pointer">
            <Search className="size-5 text-[#17231b]" />
          </Link>
          <Link href="/checkout" aria-label="Shopping Cart" className="relative p-1 text-[#17231b] cursor-pointer">
            <ShoppingBag className="size-5 text-[#17231b]" />
            <span className="absolute -top-0.5 -right-0.5 size-4 rounded-full bg-[#80a03c] text-white text-[10px] font-black flex items-center justify-center">
              {cartCount > 0 ? cartCount : 1}
            </span>
          </Link>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MOBILE HERO FOLD (Exact match to uploaded design)                          */}
      {/* ========================================================================= */}
      <section className="bg-white pb-6 lg:hidden border-b border-[#e5e5e5]">
        {/* Product Image Stage */}
        <div className="relative bg-[#f6f7f9] p-4 flex items-center justify-center min-h-[290px] overflow-hidden">
          {/* Top Right Badges */}
          <div className="absolute top-3 right-3 z-10 flex flex-col items-end gap-1.5">
            <span className="rounded-md bg-[#80a03c] px-2.5 py-1 text-xs font-black uppercase text-white shadow-xs">
              {discountPercent > 0 ? `${discountPercent}% OFF` : currentVariant.discount || "32% OFF"}
            </span>
            <span className="rounded-md bg-[#17231b]/95 px-2.5 py-0.5 text-[10px] font-bold text-amber-300 shadow-xs">
              100% AYUSH Certified
            </span>
          </div>

          <Image
            src={selectedImage || product.image}
            alt={`${product.name} - Pure Ayur Herbs`}
            width={480}
            height={480}
            unoptimized
            priority
            className="h-[250px] w-auto max-w-[85%] object-contain drop-shadow-sm"
          />
        </div>

        {/* Product Information Body */}
        <div className="px-4 pt-3.5">
          {/* Title */}
          <h1 className="text-base sm:text-lg font-black leading-snug text-[#17231b]">
            {product.name}
          </h1>

          {/* Subtitle */}
          {product.subtitle && (
            <p className="mt-1 text-xs font-medium text-[#666666] line-clamp-1 leading-relaxed">
              {product.subtitle}
            </p>
          )}

          {/* Ratings & Coins Pills */}
          <div className="mt-2.5 flex items-center gap-2 flex-wrap">
            <a
              href="#reviews"
              className="flex items-center gap-1 rounded-full bg-[#fffbf0] border border-amber-200/90 px-2.5 py-1 text-[11px] font-bold text-neutral-800 shadow-2xs"
            >
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="size-3 fill-amber-500 text-amber-500" />
                ))}
              </div>
              <span>{displayRating}</span>
              <span className="text-neutral-500">({totalRatingsCount.toLocaleString()} Reviews)</span>
            </a>

            <div className="flex items-center gap-1 rounded-full bg-[#f5f5f5] border border-neutral-200 px-2.5 py-1 text-[11px] font-bold text-neutral-700 shadow-2xs">
              <span>🪙</span>
              <span>100% Pure Coins</span>
            </div>
          </div>

          {/* Pricing Block */}
          <div className="mt-3">
            <div className="flex items-baseline gap-2.5">
              <span className="text-3xl font-black text-[#17231b]">₹{unitPrice}</span>
              {unitMrp > unitPrice && (
                <span className="text-base font-semibold text-neutral-400 line-through">₹{unitMrp}</span>
              )}
              {discountPercent > 0 && (
                <span className="rounded bg-[#eef5df] text-[#244f31] text-xs font-black px-2 py-0.5 border border-[#80a03c]/20">
                  {discountPercent}% OFF
                </span>
              )}
            </div>

            {savings > 0 && (
              <p className="mt-1 text-xs font-bold text-emerald-800">
                You save ₹{savings} (Inclusive of all taxes)
              </p>
            )}

            {/* Value Callout Box */}
            <div className="mt-2 rounded-lg bg-[#fff6d9] border border-amber-200/80 px-2.5 py-1.5 flex items-center gap-1.5 text-xs font-bold text-amber-950">
              <span>✨</span>
              <span>{product.perUnitCostText || "Effective cost: Just ₹8 per daily dose • 100% Sugar Free"}</span>
            </div>
          </div>

          {/* OFFERS FOR YOU (Carousel) */}
          {displayOffers.length > 0 && (
            <div className="mt-4 pt-1">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-black uppercase text-[#17231b] flex items-center gap-1.5">
                  🏷️ OFFERS FOR YOU ({displayOffers.length})
                </span>
                <span className="text-[11px] font-semibold text-neutral-500">
                  1-Click Copy &amp; Apply
                </span>
              </div>

              <div className="mt-1.5 flex gap-2.5 overflow-x-auto pb-1 scrollbar-none touch-pan-x -mx-4 px-4">
                {displayOffers.map((offer) => {
                  const isCopied = copiedCoupon === offer.code;
                  const isSelected = selectedOfferCode === offer.code;

                  return (
                    <div
                      key={offer.code}
                      className={`w-[230px] shrink-0 rounded-xl border p-2.5 shadow-2xs flex flex-col justify-between transition ${
                        isSelected
                          ? "border-[#244f31] ring-1 ring-[#244f31]/30 bg-[#fbfdf7]"
                          : "border-[#ddddd9] bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono text-xs font-black text-[#17231b]">
                            {offer.code}
                          </span>
                          <span className="text-[9px] font-black uppercase bg-[#eef5df] text-[#244f31] px-1.5 py-0.5 rounded border border-[#80a03c]/20">
                            {offer.discount}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyCoupon(offer.code)}
                          className={`px-2.5 py-1 rounded text-[10px] font-black uppercase transition shrink-0 cursor-pointer ${
                            isCopied
                              ? "bg-emerald-700 text-white"
                              : isSelected
                              ? "bg-[#244f31] text-white"
                              : "bg-[#eef5df] text-[#244f31] hover:bg-[#80a03c] hover:text-white"
                          }`}
                        >
                          {isCopied ? "COPIED ✓" : isSelected ? "APPLIED ✓" : "APPLY"}
                        </button>
                      </div>
                      <p className="text-[10px] text-neutral-500 mt-1.5 line-clamp-1">
                        {offer.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SELECT PACK SIZE */}
          <div className="mt-5 border-t border-[#e5e5e5] pt-3.5">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-black uppercase tracking-wider text-[#17231b]">
                SELECT PACK SIZE: <span className="text-[#80a03c] font-black">{currentVariant.value || currentVariant.name}</span>
              </label>
              <span className="text-[11px] font-semibold text-neutral-500">
                Choose for best savings
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {variants.map((v: any, idx: number) => {
                const isSelected = currentVariant.id === v.id;
                const vPrice = Number(v.price) || 0;
                const vMrp = Number(v.mrp || v.compareAt) || Math.round(vPrice * 1.25);
                const defaultBadges = ["STANDARD", "MOST POPULAR", "BEST VALUE - 3-MONTH"];
                const badgeText = v.badge || defaultBadges[idx] || "OFFER";
                const isFirst = idx === 0;

                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => {
                      setSelectedVariant(v);
                      if (v.image) setSelectedImage(v.image);
                    }}
                    className={`relative flex flex-col justify-between rounded-xl p-2.5 text-left transition cursor-pointer min-h-[96px] ${
                      isSelected
                        ? "border-2 border-[#244f31] bg-[#edf4e3] shadow-xs"
                        : "border border-[#ddddd9] bg-white hover:border-[#80a03c]"
                    }`}
                  >
                    {/* Top Floating Badge */}
                    <span
                      className={`absolute -top-2 left-2 px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider shadow-2xs truncate max-w-[90%] ${
                        isFirst
                          ? "bg-[#17231b] text-white"
                          : "bg-[#80a03c] text-white"
                      }`}
                    >
                      {badgeText}
                    </span>

                    <div className="pt-1.5">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-black text-[#17231b] truncate">
                          {v.value || v.name}
                        </span>
                        <span
                          className={`size-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected ? "border-[#244f31] bg-[#244f31]" : "border-[#ccc]"
                          }`}
                        >
                          {isSelected && <span className="size-1.5 rounded-full bg-white" />}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 pt-1 border-t border-neutral-200/60">
                      <div className="text-sm font-black text-[#17231b]">₹{vPrice}</div>
                      {idx === 1 && (
                        <span className="inline-block mt-0.5 text-[8px] font-black text-white bg-[#244f31] px-1.5 py-0.5 rounded">
                          Save More
                        </span>
                      )}
                      {idx === 2 && (
                        <span className="inline-block mt-0.5 text-[8px] font-black text-white bg-[#244f31] px-1.5 py-0.5 rounded">
                          3-Month Course
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* KEY BENEFITS */}
          <div className="mt-5 border-t border-[#e5e5e5] pt-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#17231b] mb-2.5">
              KEY BENEFITS
            </h3>
            <div className="grid grid-cols-2 gap-x-2 gap-y-2">
              {mobileKeyBenefits.map((item, idx) => (
                <div key={idx} className="flex items-start gap-1.5 text-[11px] font-bold text-[#17231b] leading-tight">
                  <Check className="size-3.5 text-emerald-700 shrink-0 mt-0.5" strokeWidth={3} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* TRUST BADGES */}
          <div className="mt-5 border-t border-[#e5e5e5] pt-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#17231b] mb-3">
              TRUST BADGES
            </h3>
            <div className="grid grid-cols-4 gap-2 items-center text-center">
              {/* AYUSH Seal */}
              <div className="flex flex-col items-center">
                <div className="size-13 sm:size-14 rounded-full border-2 border-[#244f31] p-0.5 flex items-center justify-center bg-white shadow-2xs">
                  <div className="size-full rounded-full border border-dashed border-[#244f31] flex flex-col items-center justify-center p-0.5 text-[8px] font-black leading-tight text-[#17231b]">
                    <span className="text-[6px] text-[#244f31] uppercase tracking-tighter">MINISTRY OF</span>
                    <span className="font-extrabold text-[9px] sm:text-[10px] text-[#244f31] tracking-wide">AYUSH</span>
                    <span className="text-[6px] text-[#244f31] uppercase tracking-tighter">Certified</span>
                  </div>
                </div>
              </div>
              {/* GMP Seal */}
              <div className="flex flex-col items-center">
                <div className="size-13 sm:size-14 rounded-full border-2 border-amber-700 p-0.5 flex items-center justify-center bg-white shadow-2xs">
                  <div className="size-full rounded-full border border-dashed border-amber-600 flex flex-col items-center justify-center p-0.5 text-[8px] font-black leading-tight text-amber-950">
                    <span className="text-[6px] text-amber-700 uppercase tracking-tighter">WHO-GMP</span>
                    <span className="font-extrabold text-[9px] sm:text-[10px] text-amber-900 tracking-wide">GMP</span>
                    <span className="text-[6px] text-amber-700 uppercase tracking-tighter">Certified</span>
                  </div>
                </div>
              </div>
              {/* 100% Natural Seal */}
              <div className="flex flex-col items-center">
                <div className="size-13 sm:size-14 rounded-full border-2 border-[#80a03c] p-0.5 flex items-center justify-center bg-white shadow-2xs">
                  <div className="size-full rounded-full border border-dashed border-[#80a03c] flex flex-col items-center justify-center p-0.5 text-[8px] font-black leading-tight text-[#17231b]">
                    <span className="font-extrabold text-[10px] sm:text-[11px] text-[#244f31] tracking-wide">100%</span>
                    <span className="text-[7px] sm:text-[8px] text-[#80a03c] uppercase font-black">NATURAL</span>
                    <span className="text-[6px] text-neutral-500 uppercase">Purity</span>
                  </div>
                </div>
              </div>
              {/* Lab Tested Seal */}
              <div className="flex flex-col items-center">
                <div className="size-13 sm:size-14 rounded-full border-2 border-[#244f31] p-0.5 flex items-center justify-center bg-white shadow-2xs">
                  <div className="size-full rounded-full border border-dashed border-[#244f31] flex flex-col items-center justify-center p-0.5 text-[8px] font-black leading-tight text-[#17231b]">
                    <span className="text-[6px] text-[#244f31] uppercase tracking-tighter">NABL LAB</span>
                    <span className="font-extrabold text-[8px] sm:text-[9px] text-[#244f31] tracking-wide">TESTED</span>
                    <span className="text-[6px] text-[#244f31] uppercase tracking-tighter">Heavy Metal Free</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* DESKTOP HEADER & BREADCRUMBS                                              */}
      {/* ========================================================================= */}
      <div className="hidden lg:block">
        {/* Top Announcement Bar */}
        <AnnouncementBar onOpenAppModal={() => setAppModalOpen(true)} />

        {/* Main Sticky Header */}
        <SiteHeader
          cart={cart}
          onUpdateQuantity={(id, delta) => {
            setCart((prev) =>
              prev
                .map((item) => (item.product?.id === id ? { ...item, quantity: item.quantity + delta } : item))
                .filter((i) => i.quantity > 0)
            );
          }}
          onRemoveItem={(id) => setCart((prev) => prev.filter((i) => i.product?.id !== id))}
          onOpenAppModal={() => setAppModalOpen(true)}
          onOpenLoginModal={() => setLoginModalOpen(true)}
          onOpenConsultationModal={() => setConsultationModalOpen(true)}
        />

        {/* Breadcrumbs Navigation (Kapiva Clean Style) */}
        <nav aria-label="Breadcrumb" className="mx-auto max-w-[1360px] px-4 py-3 text-xs text-[#666666] md:px-6">
          <ol className="flex items-center flex-wrap gap-1.5">
            <li>
              <Link href="/" className="hover:text-[#244f31] transition">
                Home
              </Link>
            </li>
            <li className="text-neutral-400">/</li>
            <li>
              <Link href={`/solution/${product.concernSlug || "ayurvedic-care"}`} className="hover:text-[#244f31] transition capitalize">
                {product.category || "Ayurvedic Care"}
              </Link>
            </li>
            <li className="text-neutral-400">/</li>
            <li className="font-bold text-[#17231b] truncate max-w-xs">{product.name}</li>
          </ol>
        </nav>
      </div>

      {/* ========================================================================= */}
      {/* 1. DESKTOP HERO SECTION: GALLERY (LEFT) + BUY BOX (RIGHT)                 */}
      {/* ========================================================================= */}
      <section className="mx-auto max-w-[1360px] px-4 pb-12 md:px-6 hidden lg:block">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
          {/* LEFT: GALLERY & BADGES */}
          <div className="grid gap-4 lg:col-span-6 lg:grid-cols-12">
            {/* Desktop Vertical Thumbnails (Kapiva Signature) */}
            {gallery.length > 1 && (
              <div className="order-2 flex gap-2.5 overflow-x-auto lg:order-1 lg:col-span-2 lg:flex-col lg:overflow-visible">
                {gallery.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(imgUrl)}
                    className={`size-16 sm:size-18 shrink-0 overflow-hidden rounded-xl border-2 p-1 transition cursor-pointer ${
                      selectedImage === imgUrl
                        ? "border-[#244f31] bg-[#eef5df] ring-2 ring-[#244f31]/20 shadow-xs"
                        : "border-[#ddddd9] bg-white hover:border-[#80a03c]"
                    }`}
                  >
                    <Image src={imgUrl} alt={`${product.name} thumbnail ${idx + 1}`} width={68} height={68} unoptimized className="size-full object-cover rounded-lg" />
                  </button>
                ))}
              </div>
            )}

            {/* Main Stage Image Card */}
            <div
              className={`order-1 relative overflow-hidden rounded-2xl border border-[#ddddd9] bg-white p-4 sm:p-6 shadow-xs lg:order-2 ${
                gallery.length > 1 ? "lg:col-span-10" : "lg:col-span-12"
              }`}
            >
              {/* Discount Ribbon Badge */}
              <div className="absolute top-3 right-3 z-10 flex flex-col items-end gap-1.5">
                <span className="rounded-full bg-[#80a03c] px-3 py-1 text-xs font-black uppercase text-white shadow-xs">
                  {discountPercent > 0 ? `${discountPercent}% OFF` : currentVariant.discount || "SPECIAL OFFER"}
                </span>
                <span className="rounded-full bg-[#17231b]/90 backdrop-blur-xs px-2.5 py-0.5 text-[10px] font-bold text-amber-300">
                  AYUSH Certified
                </span>
              </div>

              {/* Mobile Rating Bubble inside photo */}
              <div className="absolute bottom-3 left-3 z-10 lg:hidden">
                <a
                  href="#reviews"
                  className="flex items-center gap-1 rounded-full bg-white/95 backdrop-blur-xs px-2.5 py-1 text-[11px] font-bold text-[#17231b] shadow-sm border border-neutral-200"
                >
                  <Star className="size-3.5 fill-amber-500 text-amber-500" />
                  <span>{displayRating}</span>
                  <span className="text-neutral-500">({totalRatingsCount})</span>
                </a>
              </div>

              <Image
                src={selectedImage || product.image}
                alt={`${product.name} - Pure Ayur Herbs`}
                title={product.name}
                width={650}
                height={650}
                unoptimized
                priority
                className="mx-auto h-[320px] sm:h-[460px] w-full object-contain transition-transform duration-300 hover:scale-[1.02]"
              />
            </div>
          </div>

          {/* RIGHT: PRODUCT INFO & BUY BOX */}
          <div className="rounded-2xl border border-[#ddddd9] bg-white p-5 sm:p-7 shadow-xs lg:col-span-6 md:p-8">
            {/* Tag / Eyebrow */}
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-[#80a03c]">
                <Sparkles className="size-3.5" /> {product.tag || "100% CERTIFIED AYURVEDIC"}
              </span>
              <span className="text-[10px] font-bold bg-[#eef5df] text-[#244f31] px-2 py-0.5 rounded-full border border-emerald-200">
                In Stock &amp; Ready to Ship
              </span>
            </div>

            {/* Title */}
            <h1 className="mt-2 text-2xl font-black leading-tight text-[#17231b] sm:text-3xl">
              {product.name}
            </h1>

            {/* Subtitle / Clinical One-liner (Kapiva Style) */}
            {product.subtitle && (
              <p className="mt-1.5 text-xs sm:text-sm font-medium text-[#4c4c4c] leading-relaxed">
                {product.subtitle}
              </p>
            )}

            {/* Star Rating & Jump to Reviews (Kapiva Rating Pill) */}
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <a
                href="#reviews"
                className="flex items-center gap-1.5 rounded-full bg-[#f8faf1] border border-[#ddddd9] px-3 py-1 text-xs font-bold text-[#244f31] hover:bg-[#eef5df] transition cursor-pointer"
              >
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`size-3.5 ${
                        s <= Math.round(displayRating) ? "fill-amber-500 text-amber-500" : "fill-neutral-200 text-neutral-300"
                      }`}
                    />
                  ))}
                </div>
                <span>{displayRating}/5</span>
                <span className="text-[#666666]">({totalRatingsCount} Reviews)</span>
              </a>

              {product.showCoins !== false && Number(product.coins || 0) > 0 && (
                <div className="inline-flex items-center gap-1 rounded-full bg-[#fff6d9] px-2.5 py-1 text-[11px] font-bold text-[#6b5700] border border-amber-200">
                  <span>Earn 🪙 {Number(product.coins) * quantity} Pure Coins</span>
                </div>
              )}
            </div>

            {/* ======================================================= */}
            {/* PRICING BLOCK (Kapiva Large Bold Price + Savings + Unit) */}
            {/* ======================================================= */}
            <div className="mt-5 border-y border-[#ddddd9] py-4 bg-[#fbfdf7]/60 -mx-5 px-5 sm:-mx-7 sm:px-7 rounded-sm">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-3xl sm:text-4xl font-black text-[#17231b]">₹{unitPrice}</span>
                {unitMrp > unitPrice && (
                  <span className="text-lg font-semibold text-[#888888] line-through">₹{unitMrp}</span>
                )}
                {discountPercent > 0 && (
                  <span className="rounded-md bg-[#eef5df] border border-[#80a03c]/40 px-2.5 py-0.5 text-xs font-black text-[#244f31]">
                    {discountPercent}% OFF
                  </span>
                )}
              </div>

              {savings > 0 && (
                <p className="mt-1 text-xs font-bold text-emerald-800">
                  You save ₹{savings} (Inclusive of all taxes)
                </p>
              )}

              {/* Kapiva Cost per Unit / Value Callout (e.g., Just ₹3 per roti / ₹8 per dose) */}
              <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-[#fff6d9] border border-amber-200/80 px-2.5 py-1 text-xs font-bold text-amber-950">
                <span>✨</span>
                <span>{product.perUnitCostText || "Value for money • Effective daily holistic care"}</span>
              </div>
            </div>

            {/* ======================================================= */}
            {/* OFFERS FOR YOU (Admin Panel Connected Coupon Box)        */}
            {/* ======================================================= */}
            {displayOffers.length > 0 && (
              <div className="mt-5 rounded-xl border border-dashed border-[#80a03c] bg-[#f8faf1] p-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-[#ddddd9]">
                  <span className="text-xs font-black uppercase tracking-wider text-[#244f31] flex items-center gap-1.5">
                    🏷️ Offers For You ({displayOffers.length})
                  </span>
                  <span className="text-[10px] font-bold text-neutral-500">
                    {selectedOfferCode ? `Active: ${selectedOfferCode}` : "1-Click Copy & Apply"}
                  </span>
                </div>

                <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
                  {displayOffers.map((offer) => {
                    const isCopied = copiedCoupon === offer.code;
                    const isSelected = selectedOfferCode === offer.code;

                    return (
                      <div
                        key={offer.code}
                        className={`flex items-center justify-between rounded-lg bg-white border p-2.5 shadow-2xs transition ${
                          isSelected ? "border-[#244f31] ring-2 ring-[#244f31]/20 bg-[#fbfdf7]" : "border-[#ddddd9]"
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-mono text-xs font-black text-[#17231b] tracking-wide">
                              {offer.code}
                            </span>
                            <span className="text-[9px] font-black uppercase bg-[#eef5df] text-[#244f31] px-1.5 py-0.5 rounded border border-[#80a03c]/20">
                              {offer.discount}
                            </span>
                          </div>
                          <p className="text-[10px] text-neutral-500 mt-0.5 truncate">
                            {offer.description}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyCoupon(offer.code)}
                          className={`px-3 py-1.5 rounded text-[11px] font-black transition shrink-0 cursor-pointer ${
                            isCopied
                              ? "bg-emerald-700 text-white"
                              : isSelected
                              ? "bg-[#244f31] text-white"
                              : "bg-[#eef5df] text-[#244f31] hover:bg-[#80a03c] hover:text-white"
                          }`}
                        >
                          {isCopied ? "COPIED ✓" : isSelected ? "APPLIED ✓" : "APPLY"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ======================================================= */}
            {/* PACK SELECTION / BUNDLE CARDS (Kapiva Pack Selector)    */}
            {/* ======================================================= */}
            <div className="mt-5 border-t border-[#ddddd9] pt-4">
              <div className="flex items-center justify-between mb-2.5">
                <label className="block text-xs font-black uppercase tracking-wider text-[#17231b]">
                  Select Pack Size: <span className="text-[#80a03c] font-black">{currentVariant.value || currentVariant.name}</span>
                </label>
                <span className="text-[10px] font-semibold text-neutral-500">
                  Choose for best savings
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                {variants.map((v: any) => {
                  const isSelected = currentVariant.id === v.id;
                  const vPrice = Number(v.price) || 0;
                  const vMrp = Number(v.mrp || v.compareAt) || Math.round(vPrice * 1.25);
                  const vSavings = Math.max(0, vMrp - vPrice);

                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => {
                        setSelectedVariant(v);
                        if (v.image) setSelectedImage(v.image);
                      }}
                      className={`relative flex flex-col justify-between rounded-xl border p-3 text-left transition cursor-pointer ${
                        isSelected
                          ? "border-[#244f31] bg-[#f4f7eb] ring-2 ring-[#244f31]/30 shadow-xs"
                          : "border-[#ddddd9] bg-white hover:border-[#80a03c] hover:bg-[#fafbf6]"
                      }`}
                    >
                      {v.badge && (
                        <span
                          className={`absolute -top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shadow-2xs ${
                            isSelected
                              ? "bg-[#244f31] text-white"
                              : "bg-[#80a03c] text-white"
                          }`}
                        >
                          {v.badge}
                        </span>
                      )}

                      <div className="pt-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-[#17231b] truncate">
                            {v.value || v.name}
                          </span>
                          <span
                            className={`size-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                              isSelected ? "border-[#244f31] bg-[#244f31]" : "border-[#ccc]"
                            }`}
                          >
                            {isSelected && <span className="size-1.5 rounded-full bg-white" />}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-neutral-200/60 flex items-baseline justify-between">
                        <div>
                          <div className="text-sm font-black text-[#244f31]">₹{vPrice}</div>
                          {vMrp > vPrice && (
                            <div className="text-[10px] text-neutral-400 line-through">₹{vMrp}</div>
                          )}
                        </div>
                        {vSavings > 0 && (
                          <span className="text-[9px] font-bold text-emerald-800 bg-[#eef5df] px-1.5 py-0.5 rounded">
                            Save ₹{vSavings}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ======================================================= */}
            {/* PINCODE DELIVERY ESTIMATOR (Kapiva Pincode Bar)          */}
            {/* ======================================================= */}
            <div className="mt-5 rounded-xl border border-[#ddddd9] bg-[#f8faf1] p-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#17231b]">
                  <MapPin className="size-4 text-[#80a03c]" />
                  <span>Verify pincode for accurate delivery</span>
                </div>
                {pincodeVerified && (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-[#244f31]">
                    <CheckCircle2 className="size-3.5 text-[#80a03c]" /> Serviceable Pincode
                  </span>
                )}
              </div>
              <form onSubmit={handleVerifyPincode} className="mt-2.5 flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                  placeholder="Enter 6-digit Delivery Pincode"
                  className="flex-1 rounded-lg border border-[#ddddd9] bg-white px-3 py-2 text-xs outline-none focus:border-[#244f31] font-mono"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-[#244f31] px-4 py-2 text-xs font-black uppercase tracking-wider text-white hover:bg-[#1d3b24] transition cursor-pointer"
                >
                  CHECK
                </button>
              </form>
              {pincodeVerified && (
                <p className="mt-2 text-xs font-bold text-[#244f31] flex items-center gap-1.5">
                  <span>🚚</span>
                  <span>Estimated Delivery by <b>Tomorrow, 4:00 PM</b> (Cash on Delivery Available)</span>
                </p>
              )}
            </div>

            {/* ======================================================= */}
            {/* ACTION BUTTONS (ADD TO BASKET + BUY NOW INSTANT)        */}
            {/* ======================================================= */}
            {isAvailable ? (
              <div className="mt-6 space-y-3">
                <div className="flex flex-col gap-3 sm:flex-row">
                  {/* Quantity Counter */}
                  <div className="flex h-12 items-center justify-between rounded-xl border border-[#ddddd9] px-4 bg-[#f8faf1] sm:w-36">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="p-1 text-[#244f31] hover:scale-110 transition cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="size-4" />
                    </button>
                    <span className="text-sm font-black text-[#17231b]">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => q + 1)}
                      className="p-1 text-[#244f31] hover:scale-110 transition cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      <Plus className="size-4" />
                    </button>
                  </div>

                  {/* Add to Basket Button */}
                  <button
                    type="button"
                    onClick={() => {
                      const hasCustomVariant = variants.length > 1;
                      const variantLabel = currentVariant.name || currentVariant.value || "";
                      const displayName =
                        hasCustomVariant && variantLabel && !product.name.includes(variantLabel)
                          ? `${product.name} (${variantLabel})`
                          : product.name;
                      const cartItemId = hasCustomVariant ? `${product.id}-${currentVariant.id}` : product.id;

                      handleAddToCart({
                        id: cartItemId,
                        name: displayName,
                        slug: product.slug,
                        concern: product.category,
                        price: unitPrice,
                        compareAt: unitMrp,
                        rating: Number(product.rating) || 5.0,
                        reviews: Number(product.reviews) || 0,
                        badge: currentVariant.badge || product.discount || "NEW",
                        image: currentVariant.image || product.image,
                        ingredients: ingredients.map((i) => i.name),
                        description: product.description || "",
                        coinsEarned: product.showCoins !== false ? Number(product.coins || 0) : 0,
                        showCoins: product.showCoins !== false && Number(product.coins || 0) > 0,
                        deliveryDays: "3 - 5 Days",
                        inStock: true,
                      });
                    }}
                    className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border-2 border-[#80a03c] bg-white text-xs font-black uppercase tracking-widest text-[#244f31] shadow-xs transition hover:bg-[#eef5df] cursor-pointer"
                  >
                    <ShoppingBag className="size-4 text-[#80a03c]" />
                    <span>ADD TO BASKET</span>
                  </button>
                </div>

                {/* Primary Buy Now Button (High Conversion) */}
                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="h-13 w-full rounded-xl bg-[#244f31] text-xs sm:text-sm font-black uppercase tracking-widest text-white shadow-lg transition hover:bg-[#1a3823] hover:shadow-xl active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
                >
                  <Zap className="size-4 fill-amber-300 text-amber-300" />
                  <span>BUY NOW (CASH ON DELIVERY AVAILABLE)</span>
                </button>
              </div>
            ) : (
              <div className="mt-6 space-y-3">
                <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-900">
                  <div className="flex items-center gap-2 font-black uppercase tracking-wider text-amber-800">
                    <AlertCircle className="size-4" /> Temporarily Out of Stock
                  </div>
                  <p className="mt-1 text-amber-700">
                    Our Vaidyas brew small herbal batches to guarantee potency. Next batch restocking is underway.
                  </p>
                </div>
                <a
                  href={`https://wa.me/${whatsappNum}?text=${encodeURIComponent(`Hello Pure Ayur Herbs, please notify me when ${product.name} is restocked.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] text-xs font-black uppercase tracking-wider text-white shadow-md hover:bg-[#128C7E] cursor-pointer"
                >
                  <Bell className="size-4" />
                  <span>Notify Me on WhatsApp When Restocked</span>
                </a>
              </div>
            )}

            {/* ======================================================= */}
            {/* DIFFICULTY PLACING ORDER? (Kapiva WhatsApp & Call Box)  */}
            {/* ======================================================= */}
            <div className="mt-5 rounded-xl border border-emerald-200 bg-[#f4f7eb] p-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-[#17231b] flex items-center gap-1.5">
                    <span>💬</span> Difficulty placing an online order?
                  </h4>
                  <p className="text-[11px] text-neutral-600 mt-0.5">
                    Our Ayurvedic specialists can place the order for you directly!
                  </p>
                </div>
              </div>
              <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <a
                  href={`https://wa.me/${whatsappNum}?text=${encodeURIComponent(
                    `Namaste! I want to order ${product.name} (${currentVariant.name || currentVariant.value || "1 Pack"}) at ₹${unitPrice}${
                      selectedOfferCode ? ` with offer coupon ${selectedOfferCode}` : ""
                    }. Please assist me with Cash on Delivery.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 rounded-lg bg-[#25D366] text-white py-2.5 px-3 text-xs font-bold hover:bg-[#1ebd5a] transition shadow-xs cursor-pointer"
                >
                  <MessageCircle className="size-4" />
                  <span>Order on WhatsApp</span>
                </a>
                <a
                  href={`tel:+${supportPhone.replace(/\D/g, "")}`}
                  className="flex items-center justify-center gap-1.5 rounded-lg bg-[#244f31] text-white py-2.5 px-3 text-xs font-bold hover:bg-[#1d3b24] transition shadow-xs cursor-pointer"
                >
                  <Phone className="size-4" />
                  <span>Call to Order</span>
                </a>
              </div>
            </div>

            {/* 4 Trust Badges Matrix */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2.5 border-t border-[#ddddd9] pt-4 text-center">
              <div className="flex flex-col items-center gap-1 rounded-xl bg-[#f8faf1]/80 p-2 sm:bg-transparent sm:p-0">
                <span className="text-xl">🌿</span>
                <span className="text-[10px] sm:text-[11px] font-bold text-[#17231b] leading-tight">100% Ayurvedic</span>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-xl bg-[#f8faf1]/80 p-2 sm:bg-transparent sm:p-0">
                <span className="text-xl">🩺</span>
                <span className="text-[10px] sm:text-[11px] font-bold text-[#17231b] leading-tight">AYUSH Certified</span>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-xl bg-[#f8faf1]/80 p-2 sm:bg-transparent sm:p-0">
                <span className="text-xl">🚚</span>
                <span className="text-[10px] sm:text-[11px] font-bold text-[#17231b] leading-tight">Free Fast Delivery</span>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-xl bg-[#f8faf1]/80 p-2 sm:bg-transparent sm:p-0">
                <span className="text-xl">💵</span>
                <span className="text-[10px] sm:text-[11px] font-bold text-[#17231b] leading-tight">Cash on Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. BENEFITS OF [PRODUCT NAME] (Kapiva Benefits Section)                   */}
      {/* ========================================================================= */}
      <section className="bg-white py-14 border-y border-[#ddddd9]">
        <div className="mx-auto max-w-[1360px] px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-black uppercase tracking-widest text-[#80a03c]">
              CLINICAL AYURVEDIC FORMULA
            </span>
            <h2 className="mt-1 text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#17231b]">
              Benefits of {product.name}
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-[#666666]">
              Synergistic multi-herb extracts formulated according to classical texts to restore internal balance.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((b, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-[#ddddd9] bg-[#f8faf1] p-6 shadow-xs hover:shadow-md transition hover:-translate-y-1 duration-200"
              >
                <div className="size-12 rounded-xl bg-white border border-[#ddddd9] flex items-center justify-center text-2xl shadow-2xs mb-4">
                  {b.icon || "🌿"}
                </div>
                <h3 className="text-sm font-black text-[#17231b] leading-snug">{b.title}</h3>
                <p className="mt-2 text-xs text-[#555555] leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. KEY INGREDIENTS SECTION (Kapiva Herb Gallery)                          */}
      {/* ========================================================================= */}
      <section className="mx-auto max-w-[1360px] px-4 py-14 md:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-black uppercase tracking-widest text-[#80a03c]">
            STANDARDIZED BOTANICALS
          </span>
          <h2 className="mt-1 text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#17231b]">
            Key Potent Ingredients
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-[#666666]">
            Every herb is sourced at full maturity from pristine altitudes and laboratory-tested for active bio-compounds.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ingredients.map((ing, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-[#ddddd9] bg-white p-5 shadow-xs flex flex-col justify-between hover:border-[#80a03c] transition"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="size-11 rounded-full bg-[#eef5df] border border-emerald-200 flex items-center justify-center text-xl shrink-0">
                    🌿
                  </div>
                  {ing.action && (
                    <span className="text-[10px] font-black uppercase bg-[#f4f7eb] text-[#244f31] px-2 py-0.5 rounded border border-emerald-200">
                      {ing.action}
                    </span>
                  )}
                </div>
                <h3 className="mt-3 text-sm font-black text-[#17231b]">{ing.name}</h3>
                {ing.sanskritName && (
                  <p className="text-[11px] italic text-[#80a03c] font-medium">{ing.sanskritName}</p>
                )}
                <p className="mt-2 text-xs text-[#666666] leading-relaxed">{ing.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. SUITABLE FOR SECTION (Kapiva Who is it for?)                           */}
      {/* ========================================================================= */}
      <section className="bg-white py-14 border-y border-[#ddddd9]">
        <div className="mx-auto max-w-[1360px] px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-black uppercase tracking-widest text-[#80a03c]">
              WHO CAN CONSUME
            </span>
            <h2 className="mt-1 text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#17231b]">
              Suitable For
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 max-w-4xl mx-auto">
            {/* Recommended Box */}
            <div className="rounded-2xl border border-emerald-200 bg-[#f8faf1] p-6 shadow-xs">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-emerald-200">
                <span className="size-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-black">
                  ✓
                </span>
                <h3 className="text-sm font-black uppercase tracking-wider text-[#244f31]">
                  Recommended For:
                </h3>
              </div>
              <ul className="space-y-3">
                {suitableFor.recommended.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-[#2b3a2f] leading-relaxed">
                    <CheckCircle2 className="size-4 text-[#80a03c] shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Caution Box */}
            <div className="rounded-2xl border border-amber-200 bg-[#fffdf5] p-6 shadow-xs">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-amber-200">
                <span className="size-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-black">
                  !
                </span>
                <h3 className="text-sm font-black uppercase tracking-wider text-amber-900">
                  Usage Guidance:
                </h3>
              </div>
              <ul className="space-y-3">
                {suitableFor.caution.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-amber-900 leading-relaxed">
                    <Info className="size-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. HOW TO USE / DAILY RITUAL (Kapiva 3-Step Guide)                        */}
      {/* ========================================================================= */}
      <section className="mx-auto max-w-[1360px] px-4 py-14 md:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-black uppercase tracking-widest text-[#80a03c]">
            DAILY USAGE
          </span>
          <h2 className="mt-1 text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#17231b]">
            How to Use - Daily Ritual
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-[#666666]">
            Follow this simple daily routine consistently for 60 to 90 days for peak rejuvenation.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3 max-w-4xl mx-auto">
          {dosageSteps.map((s, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center text-center rounded-2xl border border-[#ddddd9] bg-white p-7 shadow-xs hover:shadow-md transition"
            >
              <div className="relative mb-4">
                <span className="flex size-14 items-center justify-center rounded-full bg-[#eef5df] text-2xl font-black text-[#244f31]">
                  {s.icon || "🥄"}
                </span>
                <span className="absolute -top-1 -right-1 size-5 rounded-full bg-[#244f31] text-white text-[10px] font-black flex items-center justify-center">
                  {s.step || idx + 1}
                </span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#80a03c]">
                {s.timing || `Step ${s.step || idx + 1}`}
              </span>
              <h3 className="mt-1 text-sm font-black text-[#17231b]">{s.title}</h3>
              <p className="mt-2 text-xs text-[#666666] leading-relaxed">{s.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#eef5df] border border-emerald-200 px-4 py-1.5 text-xs font-bold text-[#244f31]">
            <span>💡</span>
            <span>Ayurvedic Tip: Consistency is key. Allow herbs 60-90 days to systematically nourish body tissues.</span>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. WHY PURE AYUR HERBS? (Kapiva "Why Kapiva?" Section)                    */}
      {/* ========================================================================= */}
      <section className="bg-white py-14 border-y border-[#ddddd9]">
        <div className="mx-auto max-w-[1360px] px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-black uppercase tracking-widest text-[#80a03c]">
              THE AYURVEDIC DIFFERENCE
            </span>
            <h2 className="mt-1 text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#17231b]">
              Why Pure Ayur Herbs?
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-[#666666]">
              Authentic ancient formulations modernized with clinical safety protocols.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {whyAyurveda.map((item, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-[#ddddd9] bg-[#f8faf1] p-6 shadow-xs text-center flex flex-col items-center"
              >
                <div className="size-14 rounded-full bg-white border border-[#ddddd9] flex items-center justify-center text-3xl shadow-2xs mb-4">
                  {item.icon}
                </div>
                <h3 className="text-sm font-black text-[#17231b]">{item.title}</h3>
                <p className="mt-2 text-xs text-[#666666] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. PRODUCT SPECIFICATIONS (Kapiva Expandable Table)                       */}
      {/* ========================================================================= */}
      <section className="mx-auto max-w-[1360px] px-4 py-12 md:px-6">
        <div className="max-w-3xl mx-auto rounded-2xl border border-[#ddddd9] bg-white overflow-hidden shadow-xs">
          <button
            type="button"
            onClick={() => setSpecificationsOpen((prev) => !prev)}
            className="w-full flex items-center justify-between p-5 text-left bg-[#f8faf1] hover:bg-[#eef5df] transition cursor-pointer"
          >
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#80a03c]">
                STATUTORY INFORMATION
              </span>
              <h3 className="text-base font-black text-[#17231b] mt-0.5">
                Product Specifications &amp; Manufacturer Details
              </h3>
            </div>
            <ChevronDown
              className={`size-5 text-[#244f31] transition-transform ${specificationsOpen ? "rotate-180" : ""}`}
            />
          </button>

          {specificationsOpen && (
            <div className="p-5 border-t border-[#ddddd9] divide-y divide-neutral-100 text-xs">
              {specifications.map((spec, idx) => (
                <div key={idx} className="py-2.5 grid grid-cols-3 gap-4">
                  <span className="font-bold text-[#17231b]">{spec.label}</span>
                  <span className="col-span-2 text-neutral-600 font-medium">{spec.value}</span>
                </div>
              ))}
              <div className="py-2.5 grid grid-cols-3 gap-4">
                <span className="font-bold text-[#17231b]">Marketed By</span>
                <span className="col-span-2 text-neutral-600 font-medium">Pure Ayur Herbs Private Limited, Botanical Enclave, Sector 62, Noida, UP - 201301</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. FREE DOCTOR CONSULTATION BANNER (Kapiva Style)                         */}
      {/* ========================================================================= */}
      <section className="mx-auto max-w-[1360px] px-4 pb-12 md:px-6">
        <div className="rounded-3xl bg-gradient-to-r from-[#17231b] to-[#244f31] p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="inline-block rounded-full bg-[#80a03c] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white">
              FREE VAIDYA ASSISTANCE
            </span>
            <h3 className="text-xl sm:text-2xl font-black">
              Need personalized dosage guidance for {product.name}?
            </h3>
            <p className="text-xs sm:text-sm text-neutral-300 max-w-xl">
              Connect with our certified Ayurvedic doctors on WhatsApp for custom lifestyle and diet advice.
            </p>
          </div>
          <a
            href={`https://wa.me/${whatsappNum}?text=${encodeURIComponent(
              `Namaste! I would like a free doctor consultation regarding ${product.name}.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 rounded-xl bg-[#25D366] hover:bg-[#128C7E] text-white px-6 py-3.5 text-xs font-black uppercase tracking-wider transition shadow-md cursor-pointer"
          >
            <MessageCircle className="size-4" />
            <span>Consult Doctor on WhatsApp</span>
          </a>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. CUSTOMER REVIEWS (Kapiva 5-Star Breakdown + Photos + Verified Badges)   */}
      {/* ========================================================================= */}
      <section id="reviews" className="mx-auto max-w-[1360px] px-4 py-16 md:px-6 border-t border-[#ddddd9]">
        <h2 className="text-2xl sm:text-3xl font-black text-[#17231b] text-center tracking-tight mb-8">
          Customer Reviews &amp; Experiences
        </h2>

        {/* Top Summary & Write a Review Button */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`size-5 ${
                    s <= Math.round(displayRating) ? "fill-amber-500 text-amber-500" : "fill-neutral-200 text-neutral-300"
                  }`}
                />
              ))}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-xs text-neutral-600 font-medium">
                {totalRatingsCount > 0 ? `Based on ${totalRatingsCount} Verified Ratings` : "No reviews yet"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setReviewError(null);
              setReviewSuccessMsg(null);
              setReviewModalOpen(true);
            }}
            className="border-2 border-[#244f31] bg-white hover:bg-[#244f31] hover:text-white text-[#244f31] px-5 sm:px-6 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition cursor-pointer shrink-0 shadow-xs"
          >
            WRITE A REVIEW
          </button>
        </div>

        {/* Rating Breakdown Bars */}
        <div className="space-y-1.5 mb-4 max-w-xl">
          {ratingBreakdown.map((item) => (
            <button
              type="button"
              key={item.star}
              onClick={() => setSelectedStarFilter(selectedStarFilter === item.star ? null : item.star)}
              className={`group w-full flex items-center gap-2 py-1 px-1.5 rounded transition text-left cursor-pointer hover:bg-white ${
                selectedStarFilter === item.star ? "bg-[#f4f7eb] ring-1 ring-[#80a03c]" : ""
              }`}
            >
              <div className="flex items-center gap-0.5 shrink-0">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`size-3.5 ${
                      s <= item.star ? "fill-amber-500 text-amber-500" : "fill-neutral-200 text-neutral-300"
                    }`}
                  />
                ))}
              </div>
              <div className="h-2.5 rounded-full border border-neutral-200 bg-white overflow-hidden relative flex-1">
                <div className="h-full bg-amber-500 transition-all duration-500" style={{ width: `${item.percentage}%` }} />
              </div>
              <div className="text-xs text-neutral-600 font-medium w-16 text-right shrink-0">
                {item.percentage}% ({item.count})
              </div>
            </button>
          ))}
        </div>

        {/* Filter and Sort Bar */}
        <div className="relative flex items-center justify-between mt-6 mb-6" ref={sortDropdownRef}>
          {selectedStarFilter !== null ? (
            <div className="flex items-center gap-2 bg-[#f4f7eb] text-[#244f31] border border-emerald-200 px-3 py-1 rounded-lg text-xs font-semibold">
              <span>Showing {selectedStarFilter}★ reviews</span>
              <button
                type="button"
                onClick={() => setSelectedStarFilter(null)}
                className="text-xs underline font-bold text-[#80a03c] cursor-pointer"
              >
                Clear
              </button>
            </div>
          ) : (
            <div />
          )}

          <div className="relative ml-auto">
            <button
              type="button"
              onClick={() => setIsSortDropdownOpen((prev) => !prev)}
              className="bg-[#244f31] hover:bg-[#1a3823] text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              <span>{sortLabels[sortOption] || "MOST RECENT"}</span>
              <ChevronDown className={`size-3.5 transition-transform ${isSortDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {isSortDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-neutral-200 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150">
                {(["recent", "highest", "lowest", "photos"] as const).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setSortOption(opt);
                      setIsSortDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-[#f8faf1] transition ${
                      sortOption === opt ? "text-[#244f31] font-bold bg-[#eef5df]" : "text-neutral-700"
                    }`}
                  >
                    {sortLabels[opt]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Reviews Grid */}
        {sortedAndFilteredReviews.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#ddddd9] bg-white p-8 text-center my-6 max-w-lg mx-auto">
            <p className="text-xs text-[#666666]">No customer reviews found matching this filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {(showAllProductReviews ? sortedAndFilteredReviews : sortedAndFilteredReviews.slice(0, 6)).map(
              (rev: any, idx: number) => {
                const ratingNum = Math.min(5, Math.max(1, Math.round(Number(rev.rating) || 5)));
                const isVerified = Boolean(rev.verifiedBuyer || rev.verified !== false);

                return (
                  <div
                    key={rev.id || idx}
                    className="rounded-2xl border border-[#ddddd9] bg-white p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-[#17231b] text-sm">
                          {rev.name || rev.customerName || "Verified Buyer"}
                        </div>
                        <span className="text-[10px] text-neutral-400">{rev.date || "Recently"}</span>
                      </div>

                      <div className="flex items-center gap-0.5 my-2">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`size-3.5 ${
                              s <= ratingNum ? "fill-amber-500 text-amber-500" : "fill-neutral-200 text-neutral-300"
                            }`}
                          />
                        ))}
                      </div>

                      <h4 className="font-bold text-[#17231b] text-xs sm:text-sm">{rev.title || "Authentic Ayurvedic Results"}</h4>
                      <p className="text-xs text-[#555555] mt-1 leading-relaxed">{rev.comment || rev.content}</p>

                      {Boolean(rev.image || (Array.isArray(rev.images) && rev.images.length > 0)) && (
                        <div className="mt-3">
                          <a
                            href={rev.image || rev.images[0]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative size-16 rounded-xl overflow-hidden border border-neutral-200 inline-block"
                          >
                            <Image
                              src={rev.image || rev.images[0]}
                              alt="Customer review photo"
                              width={64}
                              height={64}
                              unoptimized
                              className="size-full object-cover"
                            />
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px]">
                      {isVerified && (
                        <span className="inline-flex items-center gap-1 text-[#244f31] font-bold">
                          <CheckCircle2 className="size-3.5 text-[#80a03c]" /> Verified Purchase
                        </span>
                      )}
                      {rev.location && <span className="text-neutral-400 text-[10px]">{rev.location}</span>}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}

        {sortedAndFilteredReviews.length > 6 && (
          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={() => setShowAllProductReviews((prev) => !prev)}
              className="rounded-full bg-[#eef5df] px-6 py-2 text-xs font-bold text-[#244f31] hover:bg-[#d8e4bd] transition cursor-pointer"
            >
              {showAllProductReviews ? "Show less ↑" : `See all reviews (${sortedAndFilteredReviews.length}) →`}
            </button>
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 10. FAQS (Kapiva Accordion FAQ Section)                                   */}
      {/* ========================================================================= */}
      {faqs.length > 0 && (
        <section className="bg-white py-14 border-y border-[#ddddd9]">
          <div className="mx-auto max-w-[1360px] px-4 md:px-6">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-xs font-black uppercase tracking-widest text-[#80a03c]">
                QUESTIONS &amp; ANSWERS
              </span>
              <h2 className="mt-1 text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#17231b]">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-3 max-w-3xl mx-auto">
              {faqs.map((faq, idx) => (
                <div key={idx} className="rounded-2xl border border-[#ddddd9] bg-[#f8faf1] overflow-hidden shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                    className="flex w-full items-center justify-between p-4 sm:p-5 text-left text-xs sm:text-sm font-black text-[#17231b] cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={`size-4 text-[#80a03c] transition-transform shrink-0 ml-3 ${
                        activeFaq === idx ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {activeFaq === idx && (
                    <div className="px-4 pb-5 text-xs sm:text-sm text-[#555555] leading-relaxed border-t border-[#ddddd9] pt-3 bg-white">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 11. MOBILE FLOATING ACTION BAR (Exact match to screenshot)                */}
      {/* ========================================================================= */}
      {isAvailable && (
        <aside
          aria-label="Mobile Floating Action Bar"
          className="fixed bottom-3 left-3 right-3 z-40 bg-white/95 backdrop-blur-md rounded-2xl border border-[#ddddd9] p-2 shadow-[0_6px_25px_rgba(0,0,0,0.15)] lg:hidden flex items-center gap-2 max-w-md mx-auto animate-in slide-in-from-bottom duration-200"
        >
          {/* Left: Chat with Doctor */}
          <a
            href={`https://wa.me/${whatsappNum}?text=${encodeURIComponent(
              `Namaste Doctor! I am looking at ${product.name} on Pure Ayur Herbs and would like a consultation on dosage.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-xl border border-[#ddddd9] bg-white px-3 py-2.5 text-xs font-bold text-[#17231b] shadow-2xs hover:bg-[#f8faf1] transition shrink-0 cursor-pointer"
          >
            <span className="size-2 rounded-full bg-[#25D366] animate-pulse" />
            <span className="text-[11px] sm:text-xs font-bold">Chat with Doctor</span>
            <span className="rounded-full bg-[#eef5df] px-1.5 py-0.5 text-[9px] font-black text-[#244f31] border border-emerald-200">
              Online
            </span>
          </a>

          {/* Right: BUY NOW with floating Price pill */}
          <button
            type="button"
            onClick={handleBuyNow}
            className="relative flex-1 rounded-xl bg-[#1e4620] hover:bg-[#153417] text-white py-2.5 px-3 text-xs sm:text-sm font-black uppercase tracking-wider shadow-md active:scale-98 transition flex items-center justify-center cursor-pointer"
          >
            <span className="absolute -top-2.5 right-2 rounded-full bg-white text-[#17231b] border border-[#ddddd9] px-2 py-0.2 text-[10px] font-black shadow-2xs">
              ₹{unitPrice}
            </span>
            <span>BUY NOW</span>
          </button>
        </aside>
      )}

      {/* Desktop Sticky Purchase Bar */}
      {showStickyBar && isAvailable && (
        <aside
          aria-label="Desktop Sticky Bar"
          className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#ddddd9] px-6 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] hidden lg:block animate-in slide-in-from-bottom duration-200"
        >
          <div className="flex items-center justify-between gap-4 max-w-[1360px] mx-auto">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-lg overflow-hidden border border-[#ddddd9] shrink-0 bg-white">
                <Image src={selectedImage || product.image} alt={product.name} width={48} height={48} unoptimized className="size-full object-cover" />
              </div>
              <div>
                <h4 className="text-sm font-black text-[#17231b]">{product.name}</h4>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-base font-black text-[#244f31]">₹{unitPrice}</span>
                  {unitMrp > unitPrice && (
                    <span className="text-xs text-neutral-400 line-through">₹{unitMrp}</span>
                  )}
                  {selectedOfferCode && (
                    <span className="text-[10px] font-bold text-[#244f31] bg-[#eef5df] px-1.5 py-0.2 rounded border border-emerald-300">
                      {selectedOfferCode} applied
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleBuyNow}
              className="bg-[#244f31] hover:bg-[#1d3b24] text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-wider shadow-md active:scale-95 transition cursor-pointer flex items-center gap-1.5"
            >
              <Zap className="size-4 fill-amber-300 text-amber-300" />
              <span>BUY NOW (CASH ON DELIVERY)</span>
            </button>
          </div>
        </aside>
      )}

      {/* ========================================================================= */}
      {/* 12. WRITE A REVIEW MODAL                                                  */}
      {/* ========================================================================= */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-[#ddddd9] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#ddddd9] pb-4">
              <div>
                <h3 className="text-base font-black uppercase tracking-tight text-[#17231b]">Rate &amp; Review</h3>
                <p className="text-xs text-[#666666] mt-0.5 truncate max-w-xs">{product.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setReviewModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-lg transition"
              >
                <X className="size-5" />
              </button>
            </div>

            {reviewSuccessMsg ? (
              <div className="py-10 text-center space-y-3">
                <div className="size-14 rounded-full bg-[#eef5df] border border-[#80a03c] flex items-center justify-center mx-auto text-[#244f31]">
                  <CheckCircle2 className="size-8 text-[#80a03c]" />
                </div>
                <h4 className="text-base font-black text-[#17231b]">Review Submitted!</h4>
                <p className="text-xs text-[#666666] max-w-sm mx-auto">{reviewSuccessMsg}</p>
              </div>
            ) : (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!reviewForm.comment.trim()) {
                    setReviewError("Please enter your review comments.");
                    return;
                  }
                  if (!reviewForm.customerName.trim()) {
                    setReviewError("Please enter your name.");
                    return;
                  }
                  setSubmittingReview(true);
                  setReviewError(null);
                  try {
                    const isPhone = /^\d{10}$/.test(reviewForm.orderIdOrPhone.replace(/\D/g, ""));
                    const payload = {
                      productId: product.id,
                      productName: product.name,
                      rating: reviewForm.rating,
                      title: reviewForm.title || "Ayurvedic Formulation Review",
                      comment: reviewForm.comment,
                      customerName: reviewForm.customerName,
                      location: reviewForm.location || "India",
                      customerPhone: isPhone ? reviewForm.orderIdOrPhone.replace(/\D/g, "").slice(-10) : undefined,
                      orderId: !isPhone && reviewForm.orderIdOrPhone ? reviewForm.orderIdOrPhone.trim() : undefined,
                      image: reviewForm.image || undefined,
                      images: reviewForm.image ? [reviewForm.image] : undefined,
                    };

                    const res = await fetch("/api/reviews", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(payload),
                    });
                    const data = await res.json();
                    if (data && data.success) {
                      setReviewSuccessMsg(data.message || "Thank you! Your review has been submitted.");
                      if (data.review) {
                        setReviewsList((prev) => [
                          {
                            ...data.review,
                            isUserSubmitted: true,
                            verifiedBuyer: true,
                            date: "Today",
                          },
                          ...prev,
                        ]);
                      }
                      setTimeout(() => {
                        setReviewModalOpen(false);
                        setReviewSuccessMsg(null);
                      }, 1600);
                    } else {
                      setReviewError(data.error || "Failed to submit review.");
                    }
                  } catch {
                    setReviewError("Something went wrong while submitting your review.");
                  } finally {
                    setSubmittingReview(false);
                  }
                }}
                className="mt-5 space-y-4 text-xs"
              >
                <div>
                  <label className="block font-bold text-[#17231b] mb-1.5">Your Overall Rating *</label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                        className="p-1 text-2xl transition hover:scale-110"
                      >
                        <Star
                          className={`size-7 ${
                            star <= (hoverRating || reviewForm.rating)
                              ? "fill-amber-500 text-amber-500"
                              : "text-neutral-300 fill-none"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#17231b] mb-1">Your Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Sharma"
                      value={reviewForm.customerName}
                      onChange={(e) => setReviewForm({ ...reviewForm, customerName: e.target.value })}
                      className="w-full rounded-xl border border-[#ddddd9] p-2.5 outline-none focus:border-[#244f31] bg-white font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#17231b] mb-1">City / State</label>
                    <input
                      type="text"
                      placeholder="e.g. Jaipur, Rajasthan"
                      value={reviewForm.location}
                      onChange={(e) => setReviewForm({ ...reviewForm, location: e.target.value })}
                      className="w-full rounded-xl border border-[#ddddd9] p-2.5 outline-none focus:border-[#244f31] bg-white font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#17231b] mb-1">Detailed Review *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Share your authentic experience with this remedy..."
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    className="w-full rounded-xl border border-[#ddddd9] p-2.5 outline-none focus:border-[#244f31] bg-white font-medium resize-none"
                  />
                </div>

                {reviewError && (
                  <div className="rounded-xl bg-red-50 border border-red-200 p-2.5 text-xs text-red-700 font-semibold">
                    {reviewError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full rounded-xl bg-[#244f31] hover:bg-[#1d3b24] text-white py-3.5 text-xs font-black uppercase tracking-wider transition shadow-md disabled:opacity-60 cursor-pointer"
                >
                  {submittingReview ? "SUBMITTING REVIEW..." : "SUBMIT REVIEW"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Main Footer */}
      <SiteFooter />
    </main>
  );
}
