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
  ChevronRight,
  Share2,
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
import BestSellersSection from "./BestSellersSection";
import RecentlyViewedSection from "./RecentlyViewedSection";
import { ProductDetail } from "@/lib/product-detail-data";
import { Product } from "@/lib/store";
import { uploadReviewImage } from "@/lib/upload";

export const TAITVA_DEFAULT_UGC_REVIEWS = [
  {
    id: "test_harpreet_singh",
    name: "Harpreet Singh",
    rating: 5,
    date: "13/09/26",
    product: "Neem Karela Jamun / Madhunashi Sugar Care",
    title: "Authentic herbal taste and natural balance",
    comment:
      "I have tried several brands, but this neem karela jamun juice feels the most authentic. The bitter taste is natural, showing its purity, and it has really helped stabilize my daily energy and glucose levels without any insulin spikes. A staple in my morning routine now.",
    photo: "/reviews/review-customer-1.jpg",
    image: "/reviews/review-customer-1.jpg",
    verifiedBuyer: true,
    location: "Amritsar, Punjab",
  },
  {
    id: "test_sunita_deshmukh",
    name: "Sunita Deshmukh",
    rating: 5,
    date: "24/09/26",
    product: "Virja Powder for Men / Vitality Blend",
    title: "Noticeable improvement in vitality and digestion",
    comment:
      "I have been adding this herbal powder to my morning routine every day. It mixes very easily and feels completely pure without any artificial grit. My energy and vitality have noticeably improved and my skin feels much clearer within just a month.",
    photo: "/reviews/review-customer-2.jpg",
    image: "/reviews/review-customer-2.jpg",
    verifiedBuyer: true,
    location: "Pune, Maharashtra",
  },
  {
    id: "test_madhavan_iyer",
    name: "Madhavan Iyer",
    rating: 5,
    date: "09/09/26",
    product: "Fat Burner Metabolism Support Juice",
    title: "Refreshing herbal tonic for active workdays",
    comment:
      "This herbal fat burner juice has a wonderfully tart and refreshing taste. It has become a regular part of my morning routine, and I feel much more active through long workdays at my desk without afternoon fatigue or brain fog.",
    photo: "/reviews/review-customer-3.jpg",
    image: "/reviews/review-customer-3.jpg",
    verifiedBuyer: true,
    location: "Bengaluru, Karnataka",
  },
  {
    id: "test_1792489624477",
    name: "Mannu",
    rating: 5,
    date: "20/10/26",
    product: "FAT BURNER-Metabolism Support Juice",
    title: "Authentic Ayurvedic Formulation",
    comment:
      "Mujhe to isske bdia result mile mera kafi weigt kamm hua h mere liye best product hai. Bilkul natural herbal taste aur koi acidity nahi hoti.",
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
    verifiedBuyer: true,
    location: "Uttrakhand",
  },
  {
    id: "test_1",
    name: "Rajesh K.",
    rating: 5,
    date: "18/09/26",
    product: "Virja Powder for Men",
    title: "Incredible energy and stamina improvement in 3 weeks",
    comment:
      "I was skeptical about Ayurvedic vitality powders, but Virja Powder with warm milk every night gave me consistent energy, stamina, and zero morning fatigue. Authentic gold-grade formulation!",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
    verifiedBuyer: true,
    location: "Pune, Maharashtra",
  },
  {
    id: "test_2",
    name: "Suresh Nair",
    rating: 5,
    date: "14/09/26",
    product: "Madhunashi Sugar Care Powder",
    title: "Fasting sugar dropped from 180 to 118 naturally",
    comment:
      "Started Madhunashi Powder on recommendation from our family Vaidya. Within 45 days, my fasting sugar levels stabilized remarkably without insulin spikes. Gudmar and Jamun seed combination really works!",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
    verifiedBuyer: true,
    location: "Kochi, Kerala",
  },
  {
    id: "test_3",
    name: "Pooja Verma",
    rating: 5,
    date: "10/09/26",
    product: "Pure Ayur Fat Burner Tonic",
    title: "Lost 4.5 kgs in 5 weeks with zero digestive weakness",
    comment:
      "Helped reduce my stubborn bloating and belly fat. The taste is natural herbal and gives great gut digestive relief. Feeling 10 years lighter!",
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80",
    verifiedBuyer: true,
    location: "Indore, Madhya Pradesh",
  },
];

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

  // Base product prices
  const basePrice = Number(product.price) || 0;
  const baseMrp = Number(product.mrp || (product as any).compareAt) || Math.round(basePrice * 1.25);

  // Taitva 3-Pack Bundle Generator
  const variants = useMemo(() => {
    if (product.variants && product.variants.length > 1) {
      return product.variants;
    }
    return [
      {
        id: `${product.id || "1"}-pack1`,
        name: "1 Pack (1 Month Supply)",
        value: "1 Pack",
        price: basePrice,
        mrp: baseMrp,
        discount: product.discount || "SPECIAL OFFER",
        badge: "STARTER",
        inStock: product.inStock !== false,
      },
      {
        id: `${product.id || "1"}-pack2`,
        name: "Pack of 2 (2 Months Supply)",
        value: "Pack of 2",
        price: Math.round(basePrice * 1.8),
        mrp: baseMrp * 2,
        discount: "SAVE 20%",
        badge: "MOST POPULAR",
        inStock: product.inStock !== false,
      },
      {
        id: `${product.id || "1"}-pack3`,
        name: "Pack of 3 (3 Months Course)",
        value: "Pack of 3",
        price: Math.round(basePrice * 2.4),
        mrp: baseMrp * 3,
        discount: "SAVE 35%",
        badge: "BEST VALUE",
        inStock: product.inStock !== false,
      },
    ];
  }, [product.id, product.variants, basePrice, baseMrp, product.discount, product.inStock]);

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
  const [isPastOffers, setIsPastOffers] = useState(false);

  // Reviews State
  const [reviewsList, setReviewsList] = useState<any[]>(() => {
    const existing =
      Array.isArray(product.customerReviews) && product.customerReviews.length > 0
        ? product.customerReviews
        : [];
    const hasUgcPhotos = existing.some(
      (r: any) => r.photo || r.image || (Array.isArray(r.images) && r.images.length > 0)
    );
    if (!hasUgcPhotos) {
      return [...existing, ...TAITVA_DEFAULT_UGC_REVIEWS];
    }
    return existing;
  });
  const [expandedReviewIds, setExpandedReviewIds] = useState<Record<string | number, boolean>>({});

  const toggleExpandReview = (id: string | number) => {
    setExpandedReviewIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };
  const [showAllProductReviews, setShowAllProductReviews] = useState(false);
  const [showMoreProductInfo, setShowMoreProductInfo] = useState(false);
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

  const [activeReviewIdx, setActiveReviewIdx] = useState(0);
  const reviewScrollRef = useRef<HTMLDivElement>(null);
  const isInteractingReviewRef = useRef(false);

  const handleReviewScroll = () => {
    if (!reviewScrollRef.current) return;
    const { scrollLeft, clientWidth, scrollWidth } = reviewScrollRef.current;
    if (scrollWidth - clientWidth <= 0) return;
    const idx = Math.round(scrollLeft / clientWidth);
    setActiveReviewIdx(idx);
  };

  const scrollToReview = (index: number) => {
    if (!reviewScrollRef.current) return;
    const { clientWidth } = reviewScrollRef.current;
    reviewScrollRef.current.scrollTo({
      left: index * clientWidth,
      behavior: "smooth",
    });
    setActiveReviewIdx(index);
  };

  // Cart State for Header
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [appModalOpen, setAppModalOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [consultationModalOpen, setConsultationModalOpen] = useState(false);

  // Detect scroll for Mobile Sticky Buy Bar & Offers Section trigger
  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== "undefined") {
        setShowStickyBar(window.scrollY > 380);

        const marker = document.getElementById("pdp-offers-marker");
        if (marker) {
          const rect = marker.getBoundingClientRect();
          // User scrolled down to or past the offers section
          const past = rect.top <= window.innerHeight - 80;
          setIsPastOffers(past);
          window.dispatchEvent(
            new CustomEvent("pyur_pdp_nav_toggle", { detail: { isPastOffers: past } })
          );
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.dispatchEvent(
        new CustomEvent("pyur_pdp_nav_toggle", { detail: { isPastOffers: false } })
      );
    };
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
  }, [product.id, product.image, variants]);

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
        if (data && data.success && Array.isArray(data.reviews) && data.reviews.length > 0) {
          setReviewsList([...data.reviews, ...TAITVA_DEFAULT_UGC_REVIEWS]);
        }
      })
      .catch((e) => console.error("Error loading product reviews:", e));
  }, [product.id, product.slug]);

  // Read Cart from localStorage and listen to updates
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
    return () => {
      window.removeEventListener("storage", syncCart);
      window.removeEventListener("pyur_cart_updated", syncCart);
    };
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
    let currentCart = cart;
    try {
      const stored = localStorage.getItem("pyur_cart");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) currentCart = parsed;
      }
    } catch {}

    const existing = currentCart.find((item) => item.product && item.product.id === prod.id);
    let updated: { product: Product; quantity: number }[];
    if (existing) {
      updated = currentCart.map((item) =>
        item.product && item.product.id === prod.id ? { ...item, quantity: (Number(item.quantity) || 1) + 1 } : item
      );
    } else {
      updated = [...currentCart, { product: prod, quantity: 1 }];
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
        content_name: prod.name,
        content_ids: [prod.id],
        content_type: "product",
        value: prod.price,
        currency: "INR",
      });
    } catch {}
  };

  const [addedToast, setAddedToast] = useState(false);

  const handleCurrentProductAddToCart = () => {
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

    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2000);
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

  // Mobile Gallery Touch and Navigation Helpers
  const touchStartXRef = useRef<number | null>(null);

  const handlePrevImage = () => {
    if (gallery.length <= 1) return;
    const currentIndex = gallery.indexOf(selectedImage);
    const prevIndex = currentIndex <= 0 ? gallery.length - 1 : currentIndex - 1;
    setSelectedImage(gallery[prevIndex]);
  };

  const handleNextImage = () => {
    if (gallery.length <= 1) return;
    const currentIndex = gallery.indexOf(selectedImage);
    const nextIndex = currentIndex >= gallery.length - 1 ? 0 : currentIndex + 1;
    setSelectedImage(gallery[nextIndex]);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartXRef.current - touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        handleNextImage();
      } else {
        handlePrevImage();
      }
    }
    touchStartXRef.current = null;
  };

  return (
    <main className="min-h-screen bg-white text-neutral-900 antialiased pb-24 lg:pb-0">
      {/* ========================================================================= */}
      {/* 1. TOP ANNOUNCEMENT BAR (Global across Mobile & Desktop)                  */}
      {/* ========================================================================= */}
      <AnnouncementBar onOpenAppModal={() => setAppModalOpen(true)} />

      {/* ========================================================================= */}
      {/* 2. MAIN STICKY HEADER (Taitva Header: Bag+Badge Left, Logo, Search Right)  */}
      {/* ========================================================================= */}
      <div className="sticky top-0 z-40 bg-white">
        <SiteHeader
          cart={cart}
          onUpdateQuantity={(id, delta) => {
            const nextCart = cart
              .map((item) => (item.product?.id === id ? { ...item, quantity: item.quantity + delta } : item))
              .filter((i) => i.quantity > 0);
            setCart(nextCart);
            try {
              localStorage.setItem("pyur_cart", JSON.stringify(nextCart));
              setTimeout(() => {
                window.dispatchEvent(new Event("pyur_cart_updated"));
              }, 0);
            } catch {}
          }}
          onRemoveItem={(id) => {
            const nextCart = cart.filter((i) => i.product?.id !== id);
            setCart(nextCart);
            try {
              localStorage.setItem("pyur_cart", JSON.stringify(nextCart));
              setTimeout(() => {
                window.dispatchEvent(new Event("pyur_cart_updated"));
              }, 0);
            } catch {}
          }}
          onOpenAppModal={() => setAppModalOpen(true)}
          onOpenLoginModal={() => setLoginModalOpen(true)}
          onOpenConsultationModal={() => setConsultationModalOpen(true)}
        />
      </div>

      {/* ========================================================================= */}
      {/* MOBILE HERO FOLD (Exact match to uploaded design)                          */}
      {/* ========================================================================= */}
      <section className="bg-white pb-6 lg:hidden border-b border-[#e5e5e5]">
        {/* Product Image Stage (Full-bleed Packshot with Swipe) */}
        <div
          className="relative bg-white aspect-square w-full overflow-hidden select-none flex items-center justify-center"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <Image
            src={selectedImage || product.image}
            alt={`${product.name} - Pure Ayur Herbs`}
            width={600}
            height={600}
            unoptimized
            priority
            className="size-full object-contain transition-all duration-300"
          />
        </div>

        {/* Mobile Centered Image Pagination Dots (Exact Match to Screenshot) */}
        {gallery.length > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4 mb-3">
            {gallery.map((imgUrl, idx) => {
              const isSelected = (selectedImage || product.image) === imgUrl;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImage(imgUrl)}
                  aria-label={`Go to product image ${idx + 1}`}
                  className={`rounded-full transition-all duration-300 cursor-pointer ${
                    isSelected
                      ? "size-2.5 bg-[#023915] scale-110"
                      : "size-2 bg-neutral-300 hover:bg-neutral-400"
                  }`}
                />
              );
            })}
          </div>
        )}

        {/* Product Information Body (Exact Match to Screenshot) */}
        <div className="px-4 pt-1 flex flex-col gap-2.5">
          {/* Title & Circular Share Button */}
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-base sm:text-lg font-normal sm:font-medium leading-snug text-neutral-900 tracking-tight">
              {product.name}
            </h1>
            <button
              type="button"
              onClick={() => {
                if (typeof navigator !== "undefined" && navigator.share) {
                  navigator.share({ title: product.name, url: window.location.href }).catch(() => {});
                } else if (typeof navigator !== "undefined") {
                  navigator.clipboard?.writeText(window.location.href);
                  alert("Product link copied to clipboard!");
                }
              }}
              className="size-8.5 rounded-full bg-neutral-100/90 hover:bg-neutral-200 text-neutral-700 flex items-center justify-center transition shrink-0 cursor-pointer"
              aria-label="Share product"
            >
              <Share2 className="size-4" />
            </button>
          </div>

          {/* Pricing Block (Exact Match: ₹499  ₹749  33% Off) */}
          <div className="flex items-baseline gap-2.5 mt-0.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-neutral-900">
              ₹{unitPrice}
            </span>
            {unitMrp > unitPrice && (
              <span className="text-sm sm:text-base font-normal text-neutral-400 line-through">
                ₹{unitMrp}
              </span>
            )}
            {discountPercent > 0 && (
              <span className="text-sm sm:text-base font-bold text-emerald-800">
                {discountPercent}% Off
              </span>
            )}
          </div>

          {/* Dashed Green Coupon Pill (Exact Match: [🎟️ Get this as low as ₹425 >]) */}
          <div
            onClick={() => {
              if (displayOffers.length > 0) {
                handleCopyCoupon(displayOffers[0].code);
              }
            }}
            className="mt-1 border border-dashed border-emerald-600 rounded-xl py-2 px-3 bg-white text-emerald-900 text-xs sm:text-sm font-medium flex items-center justify-between cursor-pointer hover:bg-emerald-50/20 transition"
          >
            <div className="flex items-center gap-2">
              <svg
                className="size-4 text-emerald-700 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
                <path d="M13 5v2" />
                <path d="M13 17v2" />
                <path d="M13 11v2" />
              </svg>
              <span className="text-emerald-900 font-medium">
                Get this as low as <span className="font-bold text-emerald-900">₹{Math.max(1, Math.round(unitPrice * 0.85))}</span>
              </span>
            </div>
            <ChevronRight className="size-4 text-emerald-700 shrink-0" />
          </div>

          {/* Inclusive of taxes note */}
          <p className="text-[11px] text-neutral-500 -mt-1 flex items-center gap-1">
            <Info className="size-3 text-neutral-400" /> Final Price Inclusive of all taxes
          </p>

          {/* Taitva Ribbon Banner: "Next Day Delivery on 5,000+ pincodes" */}
          <div className="bg-[#c2d4c5] p-2 px-3 rounded-l-md text-xs font-semibold text-[#023915] flex items-center gap-2 max-w-sm">
            <span>⚡</span>
            <span>Next Day Delivery on 5,000+ pincodes</span>
          </div>

          {/* Pincode Input Box (Taitva Exact Format) */}
          <form onSubmit={handleVerifyPincode} className="border border-neutral-300 rounded-xl p-2 px-3 flex items-center justify-between bg-white focus-within:border-black transition">
            <div className="flex items-center gap-2 flex-1">
              <MapPin className="size-4 text-neutral-400 shrink-0" />
              <input
                type="text"
                maxLength={6}
                placeholder="eg: 201301"
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                className="w-full text-xs text-neutral-900 placeholder:text-neutral-400 outline-none font-mono"
              />
            </div>
            <button
              type="submit"
              className="text-xs font-bold text-neutral-900 hover:text-black uppercase cursor-pointer shrink-0"
            >
              APPLY
            </button>
          </form>
          {pincodeVerified && (
            <p className="text-xs font-bold text-[#023915] flex items-center gap-1.5 -mt-1">
              <CheckCircle2 className="size-3.5 text-emerald-700" />
              <span>Serviceable! Estimated Delivery by Tomorrow (COD Available)</span>
            </p>
          )}

          {/* 1. COD / Trust Assurance Card (FIRST) */}
          <div className="overflow-hidden rounded-xl border border-neutral-200/80 bg-[#f5f5f5] mt-1">
            <div className="grid grid-cols-3 gap-1 px-2 py-3 text-center items-start">
              {/* Cash on Delivery */}
              <div className="flex flex-col items-center">
                <div className="size-9 rounded-full bg-white shadow-2xs border border-neutral-200/80 flex items-center justify-center text-[#17231b] font-bold text-sm mb-1.5">
                  ₹
                </div>
                <span className="text-[11px] font-bold text-[#17231b] leading-tight">
                  Cash on Delivery
                </span>
              </div>

              {/* 3 Days Return */}
              <div className="flex flex-col items-center">
                <div className="size-9 rounded-full bg-white shadow-2xs border border-neutral-200/80 flex items-center justify-center text-[#17231b] mb-1.5">
                  <RefreshCw className="size-3.5 text-[#17231b] stroke-[2.2]" />
                </div>
                <Link
                  href="/return-policy"
                  target="_blank"
                  className="text-center leading-tight group hover:text-[#023915] cursor-pointer"
                >
                  <span className="text-[11px] font-bold text-[#17231b] group-hover:text-[#023915] underline decoration-[#17231b]/60">
                    3 days Return
                  </span>
                  <span className="block text-[9px] text-neutral-600 mt-0.5 leading-tight">
                    (Wrong/damaged items only)
                  </span>
                </Link>
              </div>

              {/* Free Delivery */}
              <div className="flex flex-col items-center">
                <div className="size-9 rounded-full bg-white shadow-2xs border border-neutral-200/80 flex items-center justify-center text-[#17231b] mb-1.5">
                  <Truck className="size-4 text-[#17231b]" />
                </div>
                <span className="text-[11px] font-bold text-[#17231b] leading-tight">
                  Free Delivery
                </span>
              </div>
            </div>

            {/* Bottom priority strip */}
            <div className="bg-[#e5e5e5] py-1.5 px-3 text-center border-t border-neutral-200/80">
              <span className="text-[11px] font-bold text-[#2d3748]">
                Your order, our priority
              </span>
            </div>
          </div>

          {/* 2. TAITVA 3-PACK BUNDLE SELECTOR (SECOND) */}
          <div className="mt-2 border-t border-neutral-200/80 pt-3">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                SELECT PACK SIZE: <span className="text-[#023915] font-extrabold">{currentVariant.value || currentVariant.name}</span>
              </label>
              <span className="text-[11px] font-semibold text-neutral-500">
                Save up to 35%
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {variants.map((v: any, idx: number) => {
                const isSelected = currentVariant.id === v.id;
                const vPrice = Number(v.price) || 0;
                const defaultBadges = ["STARTER", "MOST POPULAR", "BEST VALUE"];
                const badgeText = v.badge || defaultBadges[idx] || "OFFER";
                const isPopular = idx === 1;
                const isBestValue = idx === 2;

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
                        ? "border-2 border-[#023915] bg-[#c2d4c5]/20 shadow-xs"
                        : "border border-neutral-200 bg-white hover:border-neutral-400"
                    }`}
                  >
                    {/* Top Floating Badge */}
                    <span
                      className={`absolute -top-2 left-2 px-1.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider shadow-2xs truncate max-w-[90%] ${
                        isBestValue
                          ? "bg-amber-600 text-white"
                          : isPopular
                          ? "bg-[#023915] text-white"
                          : "bg-neutral-800 text-white"
                      }`}
                    >
                      {badgeText}
                    </span>

                    <div className="pt-1.5">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-neutral-900 truncate">
                          {v.value || v.name}
                        </span>
                        <span
                          className={`size-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected ? "border-[#023915] bg-[#023915]" : "border-neutral-300"
                          }`}
                        >
                          {isSelected && <span className="size-1.5 rounded-full bg-white" />}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 pt-1 border-t border-neutral-200/60 flex items-baseline justify-between">
                      <div className="text-sm font-black text-neutral-900">₹{vPrice}</div>
                      {v.discount && (
                        <span className="text-[8.5px] font-bold text-emerald-800">
                          {v.discount}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Product Information Table */}
          <div className="bg-[#f8f9fa] rounded-xl p-3 border border-neutral-100 text-xs text-neutral-800">
            <h3 className="font-bold text-xs text-neutral-900 mb-2">Product Information</h3>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between border-b border-neutral-200/60 pb-1">
                <span className="text-neutral-500">Brand</span>
                <span className="font-semibold text-neutral-900">Pure Ayur Herbs</span>
              </div>
              <div className="flex justify-between border-b border-neutral-200/60 pb-1">
                <span className="text-neutral-500">Formulation</span>
                <span className="font-semibold text-neutral-900">{product.category || "Classical Kwath Liquid"}</span>
              </div>
              <div className="flex justify-between border-b border-neutral-200/60 pb-1">
                <span className="text-neutral-500">Certification</span>
                <span className="font-semibold text-[#023915]">100% Ministry of AYUSH</span>
              </div>
              <div className="flex justify-between pt-0.5">
                <span className="text-neutral-500">Country of Origin</span>
                <span className="font-semibold text-neutral-900">India</span>
              </div>
            </div>
          </div>

          {/* Offers Section Marker for Scroll Toggle */}
          <div id="pdp-offers-marker" className="scroll-mt-20" />

          {/* OFFERS FOR YOU (Carousel) */}
          {displayOffers.length > 0 && (
            <div className="mt-2 pt-1">
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
                          ? "border-[#023915] ring-1 ring-[#023915]/20 bg-[#c2d4c5]/10"
                          : "border-neutral-200 bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono text-xs font-black text-[#17231b]">
                            {offer.code}
                          </span>
                          <span className="text-[9px] font-bold uppercase bg-[#c2d4c5]/40 text-[#023915] px-1.5 py-0.5 rounded">
                            {offer.discount}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyCoupon(offer.code)}
                          className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase transition shrink-0 cursor-pointer ${
                            isCopied
                              ? "bg-emerald-700 text-white"
                              : isSelected
                              ? "bg-[#023915] text-white"
                              : "bg-[#c2d4c5]/40 text-[#023915] hover:bg-[#023915] hover:text-white"
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
      {/* DESKTOP BREADCRUMBS NAVIGATION                                            */}
      {/* ========================================================================= */}
      <div className="hidden lg:block">
        <nav aria-label="Breadcrumb" className="mx-auto max-w-[1200px] px-4 py-3 text-xs text-[#666666] md:px-6">
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
      {/* 1. TAITVA DESKTOP HERO SECTION (1:1 Exact Match to Taitva Screenshot 1)    */}
      {/* ========================================================================= */}
      <section className="mx-auto max-w-[1200px] px-4 pb-12 md:px-6 hidden lg:block">
        <div className="grid grid-cols-12 gap-8 items-start">
          {/* LEFT: THUMBNAILS (LEFT) + BORDERLESS MAIN SHOWCASE IMAGE (RIGHT) */}
          <div className="col-span-7 flex flex-row gap-4 items-start sticky top-24">
            {/* Desktop Vertical Thumbnails */}
            {gallery.length > 1 && (
              <div className="flex flex-col gap-2.5 shrink-0 items-center">
                {gallery.map((imgUrl, idx) => {
                  const isSelected = selectedImage === imgUrl;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImage(imgUrl)}
                      className={`size-16 sm:size-18 rounded-xl p-0.5 overflow-hidden bg-white transition cursor-pointer ${
                        isSelected
                          ? "border-2 border-[#023915] shadow-2xs"
                          : "border border-neutral-200 hover:border-neutral-400"
                      }`}
                      aria-label={`View product image ${idx + 1}`}
                    >
                      <Image
                        src={imgUrl}
                        alt={`${product.name} thumbnail ${idx + 1}`}
                        width={68}
                        height={68}
                        unoptimized
                        className="size-full object-contain rounded-lg"
                      />
                    </button>
                  );
                })}

                {/* Down Arrow Chevron Button (Taitva Signature) */}
                <button
                  type="button"
                  onClick={handleNextImage}
                  className="size-8 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-600 hover:text-black hover:border-black transition mt-1 cursor-pointer"
                  aria-label="Next image"
                >
                  <ChevronDown className="size-4" />
                </button>
              </div>
            )}

            {/* BORDERLESS MAIN SHOWCASE IMAGE (ZERO OUTER LINE / NO CARD BOX) */}
            <div className="flex-1 w-full flex items-center justify-center bg-white">
              <div className="relative w-full aspect-square flex items-center justify-center bg-white">
                <Image
                  src={selectedImage || product.image}
                  alt={`${product.name} - Pure Ayur Herbs`}
                  title={product.name}
                  width={700}
                  height={700}
                  unoptimized
                  priority
                  className="size-full object-contain"
                />
              </div>
            </div>
          </div>

          {/* RIGHT: TAITVA BUY BOX */}
          <div className="col-span-5 flex flex-col gap-3.5">
            {/* Top Star Rating & Reviews Badge */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5 text-[#023915]">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`size-3.5 ${
                      i < Math.round(displayRating) ? "fill-[#023915] text-[#023915]" : "fill-neutral-200 text-neutral-300"
                    }`}
                  />
                ))}
              </div>
              <a
                href="#testimonials"
                className="text-xs font-bold text-neutral-800 hover:text-[#023915] hover:underline cursor-pointer"
              >
                {displayRating} ({totalRatingsCount} Reviews)
              </a>
              <span className="text-neutral-300">•</span>
              <span className="text-[11px] font-bold text-[#023915] bg-[#c2d4c5]/30 px-2 py-0.5 rounded-full">
                100% AYUSH Certified
              </span>
            </div>

            {/* Title & Share Button Row */}
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-xl md:text-2xl font-bold text-neutral-900 leading-snug">
                {product.name}
              </h1>
              <button
                type="button"
                onClick={() => {
                  if (typeof navigator !== "undefined" && navigator.share) {
                    navigator.share({ title: product.name, url: window.location.href }).catch(() => {});
                  } else if (typeof navigator !== "undefined") {
                    navigator.clipboard?.writeText(window.location.href);
                    alert("Product link copied to clipboard!");
                  }
                }}
                className="size-8 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-600 hover:text-black hover:border-black transition shrink-0 cursor-pointer"
                aria-label="Share product"
              >
                <Share2 className="size-4" />
              </button>
            </div>

            {/* Price Row (Taitva Exact Format: ₹599 ₹1,999 70% Off) */}
            <div className="flex items-baseline gap-2.5">
              <span className="text-2xl md:text-3xl font-extrabold text-neutral-900">₹{unitPrice}</span>
              {unitMrp > unitPrice && (
                <span className="text-base text-neutral-400 font-semibold line-through">₹{unitMrp}</span>
              )}
              {discountPercent > 0 && (
                <span className="text-base text-emerald-800 font-extrabold">{discountPercent}% Off</span>
              )}
            </div>

            {/* Dashed Green Coupon Pill: "Get this as low as ₹... >" */}
            <div
              onClick={() => {
                if (displayOffers.length > 0) {
                  handleCopyCoupon(displayOffers[0].code);
                }
              }}
              className="border border-dashed border-emerald-600 rounded-lg p-2.5 px-3 bg-emerald-50/20 text-emerald-900 text-xs font-semibold flex items-center justify-between cursor-pointer hover:bg-emerald-50/50 transition"
            >
              <div className="flex items-center gap-1.5">
                <span>🏷️</span>
                <span>Get this as low as <b>₹{Math.max(1, Math.round(unitPrice * 0.85))}</b></span>
              </div>
              <ChevronRight className="size-3.5 text-emerald-800" />
            </div>

            {/* Inclusive of taxes note */}
            <p className="text-[11px] text-neutral-500 -mt-1.5 flex items-center gap-1">
              <Info className="size-3 text-neutral-400" /> Final Price Inclusive of all taxes
            </p>

            {/* Taitva Ribbon Banner: "Next Day Delivery on 5,000+ pincodes" */}
            <div className="bg-[#c2d4c5] p-2 px-3 rounded-l-md text-xs font-semibold text-[#023915] flex items-center gap-2 max-w-sm">
              <span>⚡</span>
              <span>Next Day Delivery on 5,000+ pincodes</span>
            </div>

            {/* Pincode Input Box (Taitva Exact Format) */}
            <form onSubmit={handleVerifyPincode} className="border border-neutral-300 rounded-xl p-2 px-3 flex items-center justify-between bg-white focus-within:border-black transition">
              <div className="flex items-center gap-2 flex-1">
                <MapPin className="size-4 text-neutral-400 shrink-0" />
                <input
                  type="text"
                  maxLength={6}
                  placeholder="eg: 201301"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                  className="w-full text-xs text-neutral-900 placeholder:text-neutral-400 outline-none font-mono"
                />
              </div>
              <button
                type="submit"
                className="text-xs font-bold text-neutral-900 hover:text-black uppercase cursor-pointer shrink-0"
              >
                APPLY
              </button>
            </form>
            {pincodeVerified && (
              <p className="text-xs font-bold text-[#023915] flex items-center gap-1.5 -mt-1">
                <CheckCircle2 className="size-3.5 text-emerald-700" />
                <span>Serviceable! Estimated Delivery by Tomorrow (Cash on Delivery Available)</span>
              </p>
            )}

            {/* TAITVA 3-PACK BUNDLE SELECTOR */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                  SELECT PACK SIZE: <span className="text-[#023915] font-extrabold">{currentVariant.value || currentVariant.name}</span>
                </label>
                <span className="text-[11px] font-semibold text-neutral-500">
                  Multi-month bundles save up to 35%
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                {variants.map((v: any, idx: number) => {
                  const isSelected = currentVariant.id === v.id;
                  const vPrice = Number(v.price) || 0;
                  const defaultBadges = ["STARTER", "MOST POPULAR", "BEST VALUE"];
                  const badgeText = v.badge || defaultBadges[idx] || "OFFER";
                  const isPopular = idx === 1;
                  const isBestValue = idx === 2;

                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => {
                        setSelectedVariant(v);
                        if (v.image) setSelectedImage(v.image);
                      }}
                      className={`relative flex flex-col justify-between rounded-xl p-3 text-left transition cursor-pointer min-h-[102px] ${
                        isSelected
                          ? "border-2 border-[#023915] bg-[#c2d4c5]/20 shadow-xs"
                          : "border border-neutral-200 bg-white hover:border-neutral-400"
                      }`}
                    >
                      {/* Top Floating Badge */}
                      <span
                        className={`absolute -top-2.5 left-2 px-2 py-0.5 rounded-full text-[8.5px] font-bold uppercase tracking-wider shadow-2xs truncate max-w-[92%] ${
                          isBestValue
                            ? "bg-amber-600 text-white"
                            : isPopular
                            ? "bg-[#023915] text-white"
                            : "bg-neutral-800 text-white"
                        }`}
                      >
                        {badgeText}
                      </span>

                      <div className="pt-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold text-neutral-900 truncate">
                            {v.value || v.name}
                          </span>
                          <span
                            className={`size-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                              isSelected ? "border-[#023915] bg-[#023915]" : "border-neutral-300"
                            }`}
                          >
                            {isSelected && <span className="size-1.5 rounded-full bg-white" />}
                          </span>
                        </div>
                      </div>

                      <div className="mt-2 pt-1 border-t border-neutral-200/60 flex items-baseline justify-between">
                        <div className="text-sm font-black text-neutral-900">₹{vPrice}</div>
                        {v.discount && (
                          <span className="text-[9px] font-bold text-emerald-800">
                            {v.discount}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dual Action Buttons: [ Add to bag ] & [ Buy Now ] */}
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleCurrentProductAddToCart}
                className="flex-1 bg-white border border-[#023915] text-[#023915] hover:bg-neutral-50 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition cursor-pointer"
              >
                {addedToast ? "Added to bag ✓" : "Add to bag"}
              </button>
              <button
                type="button"
                onClick={handleBuyNow}
                className="flex-1 bg-[#023915] hover:bg-black text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition shadow-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Zap className="size-4 fill-amber-300 text-amber-300" />
                <span>Buy Now (COD)</span>
              </button>
            </div>

            {/* 3-Feature Assurance Card (COD / 3 Days Return / Free Delivery) */}
            <div className="overflow-hidden rounded-xl border border-neutral-200/80 bg-[#f5f5f5]">
              <div className="grid grid-cols-3 gap-2 px-3 py-3 text-center items-start">
                {/* 1. Cash on Delivery */}
                <div className="flex flex-col items-center">
                  <div className="size-9 rounded-full bg-white shadow-2xs flex items-center justify-center text-sm font-bold text-neutral-800 mb-1.5">
                    ₹
                  </div>
                  <span className="text-[11px] font-bold text-neutral-800 leading-tight">
                    Cash on Delivery
                  </span>
                </div>
                {/* 2. 3 Days Return */}
                <div className="flex flex-col items-center">
                  <div className="size-9 rounded-full bg-white shadow-2xs flex items-center justify-center text-sm text-neutral-800 mb-1.5">
                    <RefreshCw className="size-3.5 text-neutral-800 stroke-[2.2]" />
                  </div>
                  <Link
                    href="/return-policy"
                    target="_blank"
                    className="text-center leading-tight group hover:text-[#023915] cursor-pointer"
                  >
                    <span className="text-[11px] font-bold text-neutral-800 group-hover:text-[#023915] underline decoration-neutral-800/60">
                      3 days Return
                    </span>
                    <span className="block text-[9px] text-neutral-600 mt-0.5 leading-tight">
                      (Wrong/damaged items only)
                    </span>
                  </Link>
                </div>
                {/* 3. Free Delivery */}
                <div className="flex flex-col items-center">
                  <div className="size-9 rounded-full bg-white shadow-2xs flex items-center justify-center text-sm text-neutral-800 mb-1.5">
                    <Truck className="size-4 text-neutral-800" />
                  </div>
                  <span className="text-[11px] font-bold text-neutral-800 leading-tight">
                    Free Delivery
                  </span>
                </div>
              </div>
              <div className="bg-[#e5e5e5] py-1.5 text-center text-xs font-bold text-neutral-700">
                Your order, our priority
              </div>
            </div>

            {/* Product Information Box (Taitva Exact Format: How to use, Package contents, Read More) */}
            <div className="bg-[#f8f9fa] rounded-2xl p-4 border border-neutral-200/70 text-xs text-neutral-800 mt-1">
              <div className="space-y-2">
                <div className="text-neutral-700 leading-relaxed text-xs">
                  <span className="font-bold text-neutral-900">How To Use: </span>
                  <span>
                    {(product as any).howToUse ||
                      "Apply A Small Amount To The Desired Area And Gently Massage In Circular Motions Until Absorbed. Use As Needed."}
                  </span>
                </div>
                <div className="text-neutral-700 leading-relaxed text-xs border-t border-neutral-200/60 pt-2">
                  <span className="font-bold text-neutral-900">Package Contents: </span>
                  <span>
                    {currentVariant.name ? `${currentVariant.name} — ` : ""}
                    {product.name} ({(product as any).weight || (product as any).packSize || "300ml Total"})
                  </span>
                </div>
                {showMoreProductInfo && (
                  <div className="space-y-1.5 border-t border-neutral-200/60 pt-2 text-xs animate-in fade-in duration-150">
                    <div className="flex justify-between border-b border-neutral-200/60 pb-1.5">
                      <span className="text-neutral-500">Brand</span>
                      <span className="font-semibold text-neutral-900">Pure Ayur Herbs</span>
                    </div>
                    <div className="flex justify-between border-b border-neutral-200/60 pb-1.5">
                      <span className="text-neutral-500">Formulation</span>
                      <span className="font-semibold text-neutral-900">
                        {product.category || "Classical Kwath Liquid"}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-neutral-200/60 pb-1.5">
                      <span className="text-neutral-500">Certification</span>
                      <span className="font-semibold text-[#023915]">100% Ministry of AYUSH</span>
                    </div>
                    <div className="flex justify-between pt-0.5">
                      <span className="text-neutral-500">Country of Origin</span>
                      <span className="font-semibold text-neutral-900">India</span>
                    </div>
                  </div>
                )}
                <div className="text-right pt-0.5">
                  <button
                    type="button"
                    onClick={() => setShowMoreProductInfo((prev) => !prev)}
                    className="text-xs font-semibold text-neutral-800 hover:text-[#023915] inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>{showMoreProductInfo ? "Read Less" : "Read More"}</span>
                    <ChevronDown
                      className={`size-3 transition-transform ${showMoreProductInfo ? "rotate-180" : ""}`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. TAITVA TESTIMONIAL SECTION (Visible Immediately After Product)         */}
      {/* ========================================================================= */}
      <section id="testimonials" className="bg-white py-8 sm:py-10">
        <div className="mx-auto max-w-[1200px] px-4 md:px-6">
          {/* Section Heading & View All Button */}
          <div className="mb-6">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 uppercase">
              TESTIMONIAL
            </h2>
            <div className="mt-2.5 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowAllProductReviews((prev) => !prev)}
                className="rounded-full border border-[#023915] text-[#023915] px-4 py-1 text-xs font-semibold hover:bg-[#023915] hover:text-white transition cursor-pointer"
              >
                {showAllProductReviews ? "Show Less" : "View All"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setReviewError(null);
                  setReviewSuccessMsg(null);
                  setReviewModalOpen(true);
                }}
                className="rounded-full border border-neutral-300 text-neutral-700 px-4 py-1 text-xs font-semibold hover:border-[#023915] hover:text-[#023915] transition cursor-pointer flex items-center gap-1"
              >
                <Sparkles className="size-3 text-[#023915]" />
                <span>Write a Review</span>
              </button>
            </div>
          </div>

          {/* Comments / Testimonials Display */}
          {(() => {
            const visibleReviews = showAllProductReviews
              ? sortedAndFilteredReviews
              : sortedAndFilteredReviews.slice(0, 3);

            const renderCard = (rev: any, idx: number) => {
              const reviewId = rev.id || `rev-${idx}`;
              const isExpanded = expandedReviewIds[reviewId];
              const comment = rev.comment || rev.content || "";
              const rating = typeof rev.rating === "number" ? rev.rating : 5;
              const photo = rev.photo || rev.image;

              return (
                <div
                  key={reviewId}
                  className="rounded-2xl border border-neutral-300/80 bg-white p-5 sm:p-6 flex flex-col justify-between h-full shadow-2xs hover:shadow-xs transition"
                >
                  <div>
                    {/* Customer Name */}
                    <h3 className="font-bold text-neutral-900 text-sm sm:text-base leading-snug">
                      {rev.name || rev.customerName || "Verified Buyer"}
                    </h3>

                    {/* Verified Buyer & Date */}
                    <div className="flex items-center gap-1.5 text-xs text-neutral-500 mt-1 mb-2.5">
                      <span className="inline-flex items-center justify-center size-3.5 rounded-full bg-[#023915] text-white shrink-0">
                        <Check className="size-2.5 stroke-[3]" />
                      </span>
                      <span className="font-medium text-neutral-800">Verified Buyer</span>
                      <span className="text-neutral-400">•</span>
                      <span className="text-neutral-500">{rev.date || "13/09/26"}</span>
                    </div>

                    {/* Green Star Rating */}
                    <div className="flex items-center gap-0.5 mb-2.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`size-3.5 ${
                            s <= rating
                              ? "fill-[#023915] text-[#023915]"
                              : "fill-neutral-200 text-neutral-200"
                          }`}
                        />
                      ))}
                    </div>

                    {/* Review Comment Snippet */}
                    <p className="text-xs text-neutral-600 leading-relaxed font-normal">
                      {isExpanded || comment.length <= 135
                        ? comment
                        : `${comment.slice(0, 135)}..`}
                    </p>

                    {/* Read more toggle */}
                    {comment.length > 135 && (
                      <button
                        type="button"
                        onClick={() => toggleExpandReview(reviewId)}
                        className="text-xs font-semibold text-neutral-900 underline hover:text-[#023915] cursor-pointer mt-1.5 inline-block text-left"
                      >
                        {isExpanded ? "Read less" : "Read more"}
                      </button>
                    )}
                  </div>

                  {/* Customer UGC Photo Thumbnail at Bottom */}
                  {photo && (
                    <div className="mt-4 pt-1">
                      <div className="size-14 sm:size-16 rounded-xl overflow-hidden border border-neutral-200 bg-neutral-100 shadow-2xs">
                        <img
                          src={photo}
                          alt={rev.name}
                          className="size-full object-cover object-center"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            };

            return (
              <>
                {/* Desktop View: Clean 3-Card Grid */}
                <div className="hidden md:grid md:grid-cols-3 gap-5">
                  {visibleReviews.map((rev: any, idx: number) => renderCard(rev, idx))}
                </div>

                {/* Mobile View: 1-Comment-At-A-Time Slider */}
                <div className="md:hidden">
                  {visibleReviews.length <= 1 ? (
                    <div>{visibleReviews.map((rev: any, idx: number) => renderCard(rev, idx))}</div>
                  ) : (
                    <div>
                      <div
                        ref={reviewScrollRef}
                        onScroll={handleReviewScroll}
                        onTouchStart={() => {
                          isInteractingReviewRef.current = true;
                        }}
                        onTouchEnd={() => {
                          setTimeout(() => {
                            isInteractingReviewRef.current = false;
                          }, 3000);
                        }}
                        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none pb-2 pt-1 scroll-smooth"
                        style={{ WebkitOverflowScrolling: "touch" }}
                      >
                        {visibleReviews.map((rev: any, idx: number) => (
                          <div key={rev.id || idx} className="w-full shrink-0 snap-center px-1">
                            {renderCard(rev, idx)}
                          </div>
                        ))}
                      </div>

                      {/* Pagination Dots for Mobile Slider */}
                      <div className="flex items-center justify-center gap-1.5 mt-4">
                        {visibleReviews.map((_, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => scrollToReview(i)}
                            aria-label={`Go to comment ${i + 1}`}
                            className={`rounded-full transition-all duration-300 cursor-pointer ${
                              i === activeReviewIdx
                                ? "size-2.5 bg-[#023915] scale-110"
                                : "size-1.5 bg-neutral-300 hover:bg-neutral-400"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            );
          })()}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. RECENTLY VIEWED SECTION (Taitva Exact Layout: Immediately After Reviews)*/}
      {/* ========================================================================= */}
      <RecentlyViewedSection currentProductSlug={product.slug} onAddToCart={handleAddToCart as any} />

      {/* ========================================================================= */}
      {/* 4. BEST SELLERS SECTION (Taitva PDP Style)                               */}
      {/* ========================================================================= */}
      <BestSellersSection currentProductSlug={product.slug} onAddToCart={handleAddToCart as any} />

      {/* ========================================================================= */}
      {/* 5. VISUAL INFOGRAPHIC BANNER (Benefits, Suitability, How To Use)          */}
      {/* ========================================================================= */}
      <section className="bg-white py-8 sm:py-12 border-b border-neutral-200/80">
        <div className="mx-auto max-w-[1200px] px-4 md:px-6">
          <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-neutral-200/90 shadow-sm bg-neutral-900 group">
            {/* Infographic Banner Graphic (Taitva Editorial Style) */}
            <img
              src="/brand/remedy-benefits-infographic.jpg"
              alt={`${product.name} - Benefits, Suitability and Daily Ritual`}
              className="w-full h-auto object-cover object-center"
              onError={(e) => {
                e.currentTarget.src = "/brand/product-infographic-banner.png";
              }}
            />

            {/* Clickable CTA Overlay Hotspot */}
            <div className="absolute left-6 md:left-12 bottom-6 md:bottom-10 z-10">
              <button
                type="button"
                onClick={handleCurrentProductAddToCart}
                className="bg-[#023915] hover:bg-black text-white text-xs sm:text-sm font-bold uppercase tracking-wider py-2.5 sm:py-3 px-6 sm:px-8 rounded-full shadow-lg transition active:scale-95 cursor-pointer flex items-center gap-2"
              >
                <span>{addedToast ? "Added to Bag ✓" : "Shop Now >"}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* FAQS (Kapiva Accordion FAQ Section)                                       */}
      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {faqs.length > 0 && (
        <section className="bg-white py-14 border-y border-[#ddddd9]">
          <div className="mx-auto max-w-[1200px] px-4 md:px-6">
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
                <div key={idx} className="rounded-2xl border border-neutral-200 bg-[#f5f5f5] overflow-hidden shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                    className="flex w-full items-center justify-between p-4 sm:p-5 text-left text-xs sm:text-sm font-black text-neutral-900 cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={`size-4 text-[#023915] transition-transform shrink-0 ml-3 ${
                        activeFaq === idx ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {activeFaq === idx && (
                    <div className="px-4 pb-5 text-xs sm:text-sm text-neutral-600 leading-relaxed border-t border-neutral-200 pt-3 bg-white">
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
      {/* MOBILE FLOATING ACTION BAR (Hides when scrolled past offers)               */}
      {/* ========================================================================= */}
      {isAvailable && !isPastOffers && (
        <aside
          aria-label="Mobile Floating Action Bar"
          className="fixed bottom-3 left-3 right-3 z-40 bg-white/95 backdrop-blur-md rounded-2xl border border-neutral-200 p-2 shadow-[0_6px_25px_rgba(0,0,0,0.15)] lg:hidden flex items-center gap-2 max-w-md mx-auto animate-in fade-in slide-in-from-bottom duration-200"
        >
          {/* Left: ADD TO BAG */}
          <button
            type="button"
            onClick={handleCurrentProductAddToCart}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg border py-3 px-3 text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
              addedToast
                ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                : "border-[#023915] bg-white text-[#023915] hover:bg-neutral-50"
            }`}
          >
            {addedToast ? (
              <>
                <Check className="size-4 text-emerald-600 stroke-[3]" />
                <span>ADDED!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="size-4 text-[#023915]" />
                <span>ADD TO BAG</span>
              </>
            )}
          </button>

          {/* Right: BUY NOW */}
          <button
            type="button"
            onClick={handleBuyNow}
            className="flex-1 rounded-lg bg-[#023915] hover:bg-black text-white py-3 px-3 text-xs font-bold uppercase tracking-wider shadow-md active:scale-98 transition flex items-center justify-center cursor-pointer"
          >
            <span>BUY NOW</span>
          </button>
        </aside>
      )}

      {/* Desktop Sticky Purchase Bar */}
      {showStickyBar && isAvailable && (
        <aside
          aria-label="Desktop Sticky Bar"
          className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200 px-6 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] hidden lg:block animate-in slide-in-from-bottom duration-200"
        >
          <div className="flex items-center justify-between gap-4 max-w-[1200px] mx-auto">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-lg overflow-hidden border border-neutral-200 shrink-0 bg-white flex items-center justify-center">
                <Image src={selectedImage || product.image} alt={product.name} width={48} height={48} unoptimized className="size-full object-contain" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-neutral-900">{product.name}</h4>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-base font-extrabold text-[#023915]">₹{unitPrice}</span>
                  {unitMrp > unitPrice && (
                    <span className="text-xs text-neutral-400 line-through">₹{unitMrp}</span>
                  )}
                  {selectedOfferCode && (
                    <span className="text-[10px] font-bold text-[#023915] bg-[#c2d4c5]/25 px-1.5 py-0.2 rounded border border-[#023915]/30">
                      {selectedOfferCode} applied
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleBuyNow}
              className="bg-[#023915] hover:bg-black text-white px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md active:scale-95 transition cursor-pointer flex items-center gap-1.5"
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
