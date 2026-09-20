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
  Camera,
} from "lucide-react";
import AnnouncementBar from "./AnnouncementBar";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import ProductRail from "./ProductRail";
import { ProductDetail, productDetails } from "@/lib/product-detail-data";
import { products, Product } from "@/lib/store";
import { uploadReviewImage } from "@/lib/upload";

const DEFAULT_PRODUCT_REVIEWS: Record<string, any[]> = {
  sugar: [
    {
      id: "rev-s-1",
      name: "Ayush Kushwaha",
      date: "25/08/2026",
      rating: 5,
      title: "Good",
      comment: "Good",
      verifiedBuyer: true,
      location: "India",
    },
    {
      id: "rev-s-2",
      name: "Buddha deb Chowdhury",
      date: "25/08/2026",
      rating: 5,
      title: "Sugar control",
      comment: "Very helpful every sugar patient must try",
      verifiedBuyer: true,
      location: "Kolkata",
    },
    {
      id: "rev-s-3",
      name: "Mr. SHIVA",
      date: "24/08/2026",
      rating: 5,
      title: "It's worked",
      comment: "Good",
      verifiedBuyer: true,
      location: "Hyderabad",
    },
    {
      id: "rev-s-4",
      name: "VEERRAGHAVA REDDY",
      date: "24/08/2026",
      rating: 4,
      title: "Good",
      comment: "Good",
      verifiedBuyer: true,
      location: "Bangalore",
    },
    {
      id: "rev-s-5",
      name: "Sukanta",
      date: "23/08/2026",
      rating: 5,
      title: "Ok",
      comment: "Good",
      verifiedBuyer: true,
      location: "West Bengal",
    },
    {
      id: "rev-s-6",
      name: "DHIRENDRA SINGH",
      date: "23/08/2026",
      rating: 5,
      title: "Nice product",
      comment: "Very nice",
      verifiedBuyer: true,
      location: "Varanasi",
    },
  ],
  stamina: [
    {
      id: "rev-v-1",
      name: "Vikram Rathore",
      date: "25/08/2026",
      rating: 5,
      title: "Tremendous Energy",
      comment: "Remarkable increase in daily stamina and endurance. 100% natural and authentic Ayurvedic remedy.",
      verifiedBuyer: true,
      location: "Jaipur",
    },
    {
      id: "rev-v-2",
      name: "Ayush Kushwaha",
      date: "25/08/2026",
      rating: 5,
      title: "Good",
      comment: "Good results within first 2 weeks. Highly recommended.",
      verifiedBuyer: true,
      location: "Delhi",
    },
    {
      id: "rev-v-3",
      name: "Mr. SHIVA",
      date: "24/08/2026",
      rating: 5,
      title: "It's worked",
      comment: "Good strength and recovery.",
      verifiedBuyer: true,
      location: "Hyderabad",
    },
    {
      id: "rev-v-4",
      name: "VEERRAGHAVA REDDY",
      date: "24/08/2026",
      rating: 4,
      title: "Good",
      comment: "Good quality herbs and quick delivery.",
      verifiedBuyer: true,
      location: "Bangalore",
    },
    {
      id: "rev-v-5",
      name: "Sukanta",
      date: "23/08/2026",
      rating: 5,
      title: "Ok",
      comment: "Good",
      verifiedBuyer: true,
      location: "West Bengal",
    },
    {
      id: "rev-v-6",
      name: "DHIRENDRA SINGH",
      date: "23/08/2026",
      rating: 5,
      title: "Nice product",
      comment: "Very nice",
      verifiedBuyer: true,
      location: "Varanasi",
    },
  ],
  weight: [
    {
      id: "rev-w-1",
      name: "Priya Nair",
      date: "25/08/2026",
      rating: 5,
      title: "Lost 4 kgs safely",
      comment: "Helped reduce belly bloating and curb unwanted cravings naturally without any weakness.",
      verifiedBuyer: true,
      location: "Kochi",
    },
    {
      id: "rev-w-2",
      name: "Buddha deb Chowdhury",
      date: "25/08/2026",
      rating: 5,
      title: "Metabolism booster",
      comment: "Very helpful for weight control. Feeling light and energetic.",
      verifiedBuyer: true,
      location: "Kolkata",
    },
    {
      id: "rev-w-3",
      name: "Ayush Kushwaha",
      date: "24/08/2026",
      rating: 5,
      title: "Good",
      comment: "Good",
      verifiedBuyer: true,
      location: "Patna",
    },
    {
      id: "rev-w-4",
      name: "VEERRAGHAVA REDDY",
      date: "24/08/2026",
      rating: 4,
      title: "Good",
      comment: "Good results along with morning walks.",
      verifiedBuyer: true,
      location: "Bangalore",
    },
    {
      id: "rev-w-5",
      name: "Sukanta",
      date: "23/08/2026",
      rating: 5,
      title: "Ok",
      comment: "Good",
      verifiedBuyer: true,
      location: "West Bengal",
    },
    {
      id: "rev-w-6",
      name: "DHIRENDRA SINGH",
      date: "23/08/2026",
      rating: 5,
      title: "Nice product",
      comment: "Very nice",
      verifiedBuyer: true,
      location: "Kanpur",
    },
  ],
  default: [
    {
      id: "rev-d-1",
      name: "Ayush Kushwaha",
      date: "25/08/2026",
      rating: 5,
      title: "Good",
      comment: "Good",
      verifiedBuyer: true,
      location: "India",
    },
    {
      id: "rev-d-2",
      name: "Buddha deb Chowdhury",
      date: "25/08/2026",
      rating: 5,
      title: "Ayurvedic wellness",
      comment: "Very helpful every patient must try",
      verifiedBuyer: true,
      location: "Kolkata",
    },
    {
      id: "rev-d-3",
      name: "Mr. SHIVA",
      date: "24/08/2026",
      rating: 5,
      title: "It's worked",
      comment: "Good",
      verifiedBuyer: true,
      location: "Hyderabad",
    },
    {
      id: "rev-d-4",
      name: "VEERRAGHAVA REDDY",
      date: "24/08/2026",
      rating: 4,
      title: "Good",
      comment: "Good",
      verifiedBuyer: true,
      location: "Bangalore",
    },
    {
      id: "rev-d-5",
      name: "Sukanta",
      date: "23/08/2026",
      rating: 5,
      title: "Ok",
      comment: "Good",
      verifiedBuyer: true,
      location: "West Bengal",
    },
    {
      id: "rev-d-6",
      name: "DHIRENDRA SINGH",
      date: "23/08/2026",
      rating: 5,
      title: "Nice product",
      comment: "Very nice",
      verifiedBuyer: true,
      location: "Varanasi",
    },
  ],
};

function getInitialProductReviews(prod: ProductDetail): any[] {
  if (Array.isArray(prod.customerReviews) && prod.customerReviews.length > 0) {
    return prod.customerReviews;
  }
  const str = `${prod.name || ""} ${prod.slug || ""} ${prod.category || ""}`.toLowerCase();
  if (str.includes("madhu") || str.includes("sugar") || str.includes("diabet")) {
    return DEFAULT_PRODUCT_REVIEWS.sugar;
  }
  if (str.includes("virja") || str.includes("vital") || str.includes("stamina") || str.includes("energy")) {
    return DEFAULT_PRODUCT_REVIEWS.stamina;
  }
  if (str.includes("fat") || str.includes("burn") || str.includes("weight") || str.includes("slim")) {
    return DEFAULT_PRODUCT_REVIEWS.weight;
  }
  return DEFAULT_PRODUCT_REVIEWS.default;
}

interface ProductDetailViewProps {
  product: ProductDetail;
}

export function ProductDetailView({ product }: ProductDetailViewProps) {
  const variants = product.variants && product.variants.length > 0 ? product.variants : [
    {
      id: `${product.id || "1"}-single`,
      name: "Standard Pack",
      price: Number(product.price) || 0,
      mrp: Number(product.mrp) || Math.round((Number(product.price) || 0) * 1.2),
      discount: product.discount || "NEW",
    }
  ];

  const variantImages = (product.variants || []).map((v: any) => v.image).filter(Boolean);
  const baseGallery = product.gallery && product.gallery.length > 0
    ? product.gallery.filter(Boolean)
    : [product.image || "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=500&q=80"];
  const gallery = Array.from(new Set([...baseGallery, ...variantImages]));

  const ingredients = Array.isArray(product.ingredients)
    ? product.ingredients.map((item: any) =>
        typeof item === "string"
          ? { name: item, description: "Authentic organic Ayurvedic herb." }
          : { name: item.name || "Ayurvedic Extract", description: item.description || "Authentic organic Ayurvedic herb." }
      )
    : [{ name: "Herbal Extract", description: "Authentic organic Ayurvedic herb." }];

  const benefits = Array.isArray(product.benefits) && product.benefits.length > 0
    ? product.benefits
    : [
        { title: "100% Natural Formulation", desc: "Crafted with pure herbal extracts.", icon: "🌿" },
        { title: "Certified & Safe", desc: "Formulated according to Ayurvedic principles.", icon: "🛡️" }
      ];

  const dosageSteps = Array.isArray(product.dosageSteps) && product.dosageSteps.length > 0
    ? product.dosageSteps
    : [
        { step: 1, title: "Standard Usage", description: "Consume daily as directed on the label or by a physician.", icon: "🥛" }
      ];

  const [reviewsList, setReviewsList] = useState<any[]>(() =>
    Array.isArray(product.customerReviews) && product.customerReviews.length > 0
      ? product.customerReviews
      : getInitialProductReviews(product)
  );
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

  // Fetch real reviews from /api/reviews
  useEffect(() => {
    fetch(`/api/reviews?productId=${encodeURIComponent(product.id)}&slug=${encodeURIComponent(product.slug)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success && Array.isArray(data.reviews) && data.reviews.length > 0) {
          setReviewsList((prev) => {
            const map = new Map();
            data.reviews.forEach((r: any) =>
              map.set(String(r.id || r._id), { ...r, isUserSubmitted: true, verifiedBuyer: true })
            );
            prev.forEach((r: any) => {
              const id = String(r.id || r.title || r.name);
              if (!map.has(id)) map.set(id, r);
            });
            return Array.from(map.values());
          });
        }
      })
      .catch((e) => console.error("Error loading product reviews:", e));
  }, [product.id, product.slug]);

  const baseRatings = {
    total: 1310,
    5: 882,
    4: 349,
    3: 15,
    2: 24,
    1: 40,
  };

  const ratingBreakdown = useMemo(() => {
    const starCounts: Record<number, number> = {
      5: baseRatings[5],
      4: baseRatings[4],
      3: baseRatings[3],
      2: baseRatings[2],
      1: baseRatings[1],
    };

    let extraCount = 0;
    reviewsList.forEach((r) => {
      if (r.isUserSubmitted || r.source === "customer") {
        const star = Math.min(5, Math.max(1, Math.round(Number(r.rating) || 5)));
        starCounts[star] = (starCounts[star] || 0) + 1;
        extraCount++;
      }
    });

    const total = baseRatings.total + extraCount;

    return [5, 4, 3, 2, 1].map((star) => {
      const count = starCounts[star] || 0;
      const percentage = Math.round((count / total) * 100);
      return {
        star,
        count,
        percentage,
      };
    });
  }, [reviewsList]);

  const totalRatingsCount = useMemo(() => {
    return ratingBreakdown.reduce((sum, item) => sum + item.count, 0);
  }, [ratingBreakdown]);

  const displayRating = useMemo(() => {
    const totalScore = ratingBreakdown.reduce((sum, item) => sum + item.star * item.count, 0);
    return totalRatingsCount > 0 ? Number((totalScore / totalRatingsCount).toFixed(1)) : 4.6;
  }, [ratingBreakdown, totalRatingsCount]);

  const displayReviewsCount = totalRatingsCount;

  const sortedAndFilteredReviews = useMemo(() => {
    let list = [...reviewsList];

    if (selectedStarFilter !== null) {
      list = list.filter(
        (r) => Math.min(5, Math.max(1, Math.round(Number(r.rating) || 5))) === selectedStarFilter
      );
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

  // Auto-open review modal if coming from Track Order or email (?rate=true&orderId=...)
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

  const faqs = Array.isArray(product.faqs) ? product.faqs : [];

  const [selectedImage, setSelectedImage] = useState(gallery[0]);
  const [selectedVariant, setSelectedVariant] = useState(variants[0]);
  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState("");
  const [pincodeVerified, setPincodeVerified] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

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

  // Cart State for SiteHeader
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);

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

  // Track product view event for Meta Ads & Recently Viewed List
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

  // Modal Controls
  const [appModalOpen, setAppModalOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [consultationModalOpen, setConsultationModalOpen] = useState(false);

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
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart((prev) => {
      const updated = prev
        .map((item) => {
          if (item.product && item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as { product: Product; quantity: number }[];
      try {
        localStorage.setItem("pyur_cart", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleRemoveItem = (productId: string) => {
    setCart((prev) => {
      const updated = prev.filter((item) => item.product && item.product.id !== productId);
      try {
        localStorage.setItem("pyur_cart", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleVerifyPincode = (e: React.FormEvent) => {
    e.preventDefault();
    if (pincode.length === 6) {
      setPincodeVerified(true);
    }
  };

  const handleBuyNow = () => {
    const hasCustomVariant = variants.length > 1;
    const variantLabel = currentVariant.name || currentVariant.value || "";
    const variantImage = currentVariant.image ? `&variantImage=${encodeURIComponent(currentVariant.image)}` : "";
    const variantQuery = hasCustomVariant
      ? `&variantId=${encodeURIComponent(currentVariant.id)}&price=${unitPrice}&variantName=${encodeURIComponent(variantLabel)}${variantImage}`
      : "";
    window.location.href = `/checkout?productId=${product.id}&quantity=${quantity}${variantQuery}`;
  };

  const currentVariant = selectedVariant || variants[0];
  const isAvailable = product.inStock !== false && currentVariant.inStock !== false;
  const unitPrice = Number(currentVariant.price) || 0;
  const unitMrp = Number(currentVariant.mrp) || Math.round(unitPrice * 1.2);
  const savings = Math.max(0, unitMrp - unitPrice);

  return (
    <main className="min-h-screen bg-[#f8faf1] text-[#17231b]">
      {/* Top Announcement Bar */}
      <AnnouncementBar onOpenAppModal={() => setAppModalOpen(true)} />

      {/* Main Sticky Header */}
      <SiteHeader
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onOpenAppModal={() => setAppModalOpen(true)}
        onOpenLoginModal={() => setLoginModalOpen(true)}
        onOpenConsultationModal={() => setConsultationModalOpen(true)}
      />

      {/* Breadcrumbs Navigation */}
      <div className="mx-auto max-w-[1440px] px-4 py-3 text-xs text-[#666666] md:px-6">
        <Link href="/" className="hover:text-[#244f31]">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/solution/${product.concernSlug || "general"}`} className="hover:text-[#244f31]">
          {product.category || "Remedies"}
        </Link>
        <span className="mx-2">/</span>
        <span className="font-bold text-[#17231b]">{product.name}</span>
      </div>

      {/* Main Product Hero Section */}
      <section className="mx-auto max-w-[1440px] px-4 pb-12 md:px-6">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
          {/* Left Column: Image Gallery */}
          <div className="grid gap-4 lg:col-span-6 lg:grid-cols-12">
            {/* Gallery Thumbnails */}
            {gallery.length > 1 && (
              <div className="order-2 flex gap-3 overflow-x-auto lg:order-1 lg:col-span-2 lg:flex-col">
                {gallery.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(imgUrl)}
                    className={`size-16 shrink-0 overflow-hidden rounded-xl border-2 p-1 transition ${
                      selectedImage === imgUrl ? "border-[#244f31] bg-[#eef5df]" : "border-[#ddddd9] bg-white"
                    }`}
                  >
                    <Image src={imgUrl} alt="Thumbnail" width={64} height={64} unoptimized className="size-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Main Stage Image */}
            <div className={`order-1 relative overflow-hidden rounded-2xl border border-[#ddddd9] bg-white p-6 shadow-sm lg:order-2 ${gallery.length > 1 ? "lg:col-span-10" : "lg:col-span-12"}`}>
              {currentVariant.discount && (
                <span className="absolute right-3 top-3 z-10 rounded-full bg-[#80a03c] px-3 py-1 text-xs font-bold text-white shadow-xs">
                  {currentVariant.discount}
                </span>
              )}
              <Image
                src={selectedImage || product.image || "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=500&q=80"}
                alt={`${product.name} - 100% Certified Authentic Ayurvedic Formula | Pure Ayur Herbs`}
                title={`${product.name} - Buy 100% Ayurvedic Formula Online`}
                width={600}
                height={600}
                unoptimized
                className="mx-auto h-[350px] w-full object-cover sm:h-[450px]"
                priority
              />
            </div>
          </div>

          {/* Right Column: Product Specs & Ordering */}
          <div className="rounded-2xl border border-[#ddddd9] bg-white p-6 shadow-sm lg:col-span-6 md:p-8">
            <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#80a03c]">
              <Sparkles className="size-3.5" /> {product.tag || "100% Certified Ayurvedic"}
            </span>

            <h1 className="mt-2 text-xl font-black leading-tight text-[#17231b] sm:text-2xl md:text-3xl">
              {product.name}
            </h1>

            <p className="mt-3 text-xs leading-relaxed text-[#666666] md:text-sm">
              {product.description || "Authentic Ayurvedic formula formulated with potent natural herbs."}
            </p>

            {/* Rating Stars & Reviews Pill */}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <a
                href="#reviews"
                className="flex items-center gap-1.5 rounded-full bg-[#eef5df] px-3 py-1 text-xs font-bold text-[#244f31] hover:bg-[#e2ecc9] transition cursor-pointer"
              >
                <Star className="size-3.5 fill-[#788c3b] text-[#788c3b]" />
                <span>{displayRating}</span>
                <span className="text-[#666666]">| {displayReviewsCount} Verified Ratings</span>
              </a>
              {product.showCoins !== false && Number(product.coins || 0) > 0 && (
                <div className="inline-flex items-center gap-1 rounded-full bg-[#fff6d9] px-3 py-1 text-xs font-bold text-[#6b5700]">
                  <span>Earn 🪙 {Number(product.coins) * quantity} Pure Coins</span>
                </div>
              )}
            </div>

            {/* Price Box */}
            <div className="mt-6 border-y border-[#ddddd9] py-4">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-[#17231b]">₹{unitPrice}</span>
                <span className="text-lg font-semibold text-[#666666] line-through">
                  ₹{unitMrp}
                </span>
                {savings > 0 && (
                  <span className="rounded bg-[#eef5df] px-2 py-0.5 text-xs font-bold text-[#244f31]">
                    Save ₹{savings}
                  </span>
                )}
              </div>
              <p className="mt-1 text-[11px] font-medium text-[#666666]">
                Inclusive of all taxes. Free delivery on orders above ₹999.
              </p>

              {/* Statutory Compliance Section */}
              <div className="mt-3.5 pt-3 border-t border-dashed border-[#ddddd9] grid grid-cols-2 gap-y-1.5 text-[10.5px] text-[#555555]">
                <div>
                  <span className="font-semibold text-[#17231b]">Batch No:</span>{" "}
                  <code className="bg-neutral-100 px-1 py-0.5 rounded text-[9px] font-bold">PAH-B{product.id}26</code>
                </div>
                <div>
                  <span className="font-semibold text-[#17231b]">Expiry Date:</span>{" "}
                  <span className="font-bold text-amber-700">24 months from Mfg.</span>
                </div>
                <div className="col-span-2">
                  <span className="font-semibold text-[#17231b]">Ingredients:</span>{" "}
                  <span className="font-medium text-[#17231b]">
                    {ingredients.map((i) => i.name).join(", ") || "Ayurvedic herbs"}
                  </span>
                </div>
              </div>
            </div>

            {/* Multi-Option / Weight / Color / Variant Selector (Amazon & Flipkart Style) */}
            {variants.length > 1 && (() => {
              const optionType = variants.find((v: any) => v.type)?.type || "Option / Pack Size";
              return (
                <div className="mt-5 border-t border-[#ddddd9] pt-4">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#17231b]">
                      Select {optionType}: <span className="text-[#80a03c] font-black">{currentVariant.value || currentVariant.name}</span>
                    </label>
                    <span className="text-[11px] font-semibold text-gray-500">
                      {variants.length} options available
                    </span>
                  </div>
                  <div className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {variants.map((variant: any) => {
                      const isSelected = currentVariant.id === variant.id;
                      const varPrice = Number(variant.price) || 0;
                      const varMrp = Number(variant.mrp || variant.compareAt) || Math.round(varPrice * 1.25);
                      const varSavings = Math.max(0, varMrp - varPrice);

                      return (
                        <button
                          key={variant.id}
                          type="button"
                          onClick={() => {
                            setSelectedVariant(variant);
                            if (variant.image) setSelectedImage(variant.image);
                          }}
                          className={`relative flex items-center justify-between rounded-xl border p-3 text-left transition cursor-pointer ${
                            isSelected
                              ? "border-[#244f31] bg-[#eef5df] ring-2 ring-[#244f31]/30 shadow-xs"
                              : "border-[#ddddd9] bg-white hover:border-[#80a03c] hover:bg-neutral-50/50"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            {variant.image && (
                              <div className="size-9 rounded-lg overflow-hidden border border-[#ddddd9] shrink-0 bg-white">
                                <Image
                                  src={variant.image}
                                  alt={variant.value || variant.name}
                                  width={36}
                                  height={36}
                                  unoptimized
                                  className="size-full object-cover"
                                />
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="block text-xs font-black text-[#17231b] truncate">
                                  {variant.value || variant.name}
                                </span>
                                {isSelected && (
                                  <span className="size-2 rounded-full bg-[#244f31]" />
                                )}
                              </div>
                              {variant.value && variant.name && variant.name !== variant.value && (
                                <span className="block text-[10px] text-gray-500 truncate mt-0.5">
                                  {variant.name}
                                </span>
                              )}
                              {variant.inStock === false && (
                                <span className="mt-1 inline-block rounded bg-amber-600 px-1.5 py-0.5 text-[9px] font-black uppercase text-white shadow-2xs">
                                  Out of Stock
                                </span>
                              )}
                              {variant.inStock !== false && variant.badge && (
                                <span className="mt-1 inline-block rounded bg-[#80a03c] px-1.5 py-0.5 text-[9px] font-black uppercase text-white shadow-2xs">
                                  {variant.badge}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-xs font-black text-[#244f31]">₹{varPrice}</div>
                            {varMrp > varPrice && (
                              <div className="text-[10px] text-gray-400 line-through">₹{varMrp}</div>
                            )}
                            {varSavings > 0 && (
                              <div className="text-[9px] font-bold text-emerald-700">Save ₹{varSavings}</div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Pincode Delivery Estimator */}
            <div className="mt-5 rounded-xl border border-[#ddddd9] bg-[#f8faf1] p-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#17231b]">
                  <MapPin className="size-4 text-[#80a03c]" />
                  <span>Check Delivery ETA</span>
                </div>
                {pincodeVerified && (
                  <span className="flex items-center gap-1 text-xs font-bold text-[#80a03c]">
                    <CheckCircle2 className="size-3.5" /> Serviceable
                  </span>
                )}
              </div>
              <form onSubmit={handleVerifyPincode} className="mt-2 flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                  placeholder="Enter 6-digit Pincode"
                  className="flex-1 rounded-lg border border-[#ddddd9] bg-white px-3 py-1.5 text-xs outline-none focus:border-[#244f31]"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-[#244f31] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#1d3b24]"
                >
                  CHECK
                </button>
              </form>
              {pincodeVerified && (
                <p className="mt-2 text-[11px] font-semibold text-[#244f31]">
                  🚚 Estimated Delivery: <b>Tomorrow by 4 PM</b> (Cash on Delivery Available)
                </p>
              )}
            </div>

            {/* Quantity Selector & Action Buttons OR Out-of-Stock Notice */}
            {isAvailable ? (
              <>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <div className="flex h-12 items-center justify-between rounded-xl border border-[#ddddd9] px-4 sm:w-36">
                    <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="p-1">
                      <Minus className="size-4" />
                    </button>
                    <span className="text-sm font-bold">{quantity}</span>
                    <button onClick={() => setQuantity((q) => q + 1)} className="p-1">
                      <Plus className="size-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      const hasCustomVariant = variants.length > 1;
                      const variantLabel = currentVariant.name || currentVariant.value || "";
                      const displayName = hasCustomVariant && variantLabel && !product.name.includes(variantLabel)
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
                    className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#80a03c] text-xs font-black uppercase tracking-widest text-white shadow-md transition hover:bg-[#6c8930]"
                  >
                    <ShoppingBag className="size-4" />
                    <span>ADD TO BASKET</span>
                  </button>
                </div>

                <button
                  onClick={handleBuyNow}
                  className="mt-3 h-12 w-full rounded-xl bg-[#244f31] text-xs font-black uppercase tracking-widest text-white shadow-lg transition hover:bg-[#1d3b24]"
                >
                  BUY NOW (INSTANT CHECKOUT)
                </button>
              </>
            ) : (
              <div className="mt-6 space-y-3">
                <div className="rounded-xl border border-amber-300 bg-amber-50/90 p-4">
                  <div className="flex items-start gap-2.5 text-amber-900">
                    <AlertCircle className="size-5 shrink-0 text-amber-600 mt-0.5" />
                    <div>
                      <span className="text-xs font-black uppercase tracking-wider text-amber-800">
                        Temporarily Out of Stock
                      </span>
                      <p className="mt-1 text-xs text-amber-700 leading-relaxed">
                        Our Vaidyas brew formulations in small, high-potency herbal batches to ensure peak active phytochemicals. Restocking is currently in progress.
                      </p>
                    </div>
                  </div>
                </div>

                <a
                  href={`https://wa.me/919936856002?text=${encodeURIComponent(
                    `Hello Pure Ayur Herbs, please notify me when ${product.name}${
                      currentVariant.name ? ` (${currentVariant.name})` : ""
                    } is back in stock.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] text-xs font-black uppercase tracking-wider text-white shadow-md transition hover:bg-[#128C7E]"
                >
                  <Bell className="size-4" />
                  <span>Notify Me on WhatsApp When Restocked</span>
                </a>

                <Link
                  href={`/solution/${product.concernSlug || "sugar-management"}`}
                  className="flex h-11 w-full items-center justify-center gap-1.5 rounded-xl border border-[#244f31] bg-white text-xs font-bold uppercase tracking-wider text-[#244f31] transition hover:bg-[#eef5df]"
                >
                  <span>Explore In-Stock {product.category || "Ayurvedic"} Remedies</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            )}

            {/* Trust Badges Bar */}
            <div className="mt-6 grid grid-cols-3 gap-2 border-t border-[#ddddd9] pt-4 text-center">
              <div className="flex flex-col items-center gap-1">
                <span className="text-xl">🔒</span>
                <span className="text-[10px] font-bold text-[#17231b]">100% Safe Checkout</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-xl">🚚</span>
                <span className="text-[10px] font-bold text-[#17231b]">Fast Delivery</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-xl">🔄</span>
                <span className="text-[10px] font-bold text-[#17231b]">Easy Returns & Replacement</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Benefits Grid */}
      <section className="bg-white py-12 border-y border-[#ddddd9]">
        <div className="mx-auto max-w-[1440px] px-4 md:px-6">
          <h2 className="text-xl font-black uppercase tracking-tight text-[#17231b] sm:text-2xl">
            Why This Remedy Works
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((b, idx) => (
              <div key={idx} className="rounded-xl border border-[#ddddd9] bg-[#f8faf1] p-5">
                <span className="text-2xl">{b.icon || "🌿"}</span>
                <h3 className="mt-2 text-sm font-bold text-[#17231b]">{b.title}</h3>
                <p className="mt-1 text-xs text-[#666666]">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dosage / How to Use Routine */}
      <section className="mx-auto max-w-[1440px] px-4 py-12 md:px-6">
        <h2 className="text-xl font-black uppercase tracking-tight text-[#17231b] sm:text-2xl">
          How to Use - Daily Ritual
        </h2>
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          {dosageSteps.map((s, idx) => (
            <div key={idx} className="flex flex-col items-center text-center rounded-xl border border-[#ddddd9] bg-white p-6 shadow-xs">
              <span className="flex size-12 items-center justify-center rounded-full bg-[#eef5df] text-xl font-black text-[#244f31] mb-3">
                {s.step || idx + 1}
              </span>
              <h3 className="text-sm font-bold text-[#17231b]">{s.title}</h3>
              <p className="mt-1 text-xs text-[#666666]">{s.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Key Ingredients Breakdown */}
      <section className="bg-white py-12 border-y border-[#ddddd9]">
        <div className="mx-auto max-w-[1440px] px-4 md:px-6">
          <h2 className="text-xl font-black uppercase tracking-tight text-[#17231b] sm:text-2xl">
            Key Potent Ingredients
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ingredients.map((ing, idx) => (
              <div key={idx} className="rounded-xl border border-[#ddddd9] bg-[#f8faf1] p-5">
                <div className="flex size-10 items-center justify-center rounded-full bg-[#80a03c] font-black text-white mb-2">
                  🌿
                </div>
                <h3 className="text-sm font-bold text-[#17231b]">{ing.name}</h3>
                <p className="mt-1 text-xs text-[#666666]">{ing.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section id="reviews" className="mx-auto max-w-[1240px] px-4 py-16 md:px-6">
        {/* Centered Heading */}
        <h2 className="text-3xl sm:text-4xl font-black text-[#1e231b] text-center tracking-tight mb-8 sm:mb-10">
          Customer Reviews
        </h2>

        {/* Top Summary & Write a Review Button */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`size-5 sm:size-6 ${
                    s <= 4
                      ? "fill-[#788c3b] text-[#788c3b]"
                      : "text-[#788c3b] stroke-[1.5] fill-none"
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-neutral-600 font-medium mt-1">
              Based on {totalRatingsCount} Ratings
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setReviewError(null);
              setReviewSuccessMsg(null);
              setReviewModalOpen(true);
            }}
            className="border border-neutral-900 bg-white hover:bg-neutral-900 hover:text-white text-neutral-900 px-6 sm:px-7 py-2.5 text-xs font-black uppercase tracking-wider rounded-xs transition cursor-pointer shrink-0 shadow-2xs"
          >
            WRITE A REVIEW
          </button>
        </div>

        {/* Rating Breakdown Bars (5 Rows) */}
        <div className="space-y-1.5 mb-2">
          {ratingBreakdown.map((item) => (
            <button
              type="button"
              key={item.star}
              onClick={() =>
                setSelectedStarFilter(selectedStarFilter === item.star ? null : item.star)
              }
              className={`group w-full flex items-center gap-2 sm:gap-3 py-1 px-1.5 rounded-sm transition text-left cursor-pointer hover:bg-neutral-50 ${
                selectedStarFilter === item.star ? "bg-[#f4f7eb] ring-1 ring-[#788c3b]" : ""
              }`}
              title={`Filter by ${item.star} star ratings`}
            >
              <div className="flex items-center gap-0.5 shrink-0">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`size-3.5 sm:size-4 ${
                      s <= item.star
                        ? "fill-[#788c3b] text-[#788c3b]"
                        : "text-[#788c3b] stroke-[1.5] fill-none opacity-40"
                    }`}
                  />
                ))}
              </div>
              <div className="h-2.5 sm:h-3 rounded-xs border border-neutral-300 bg-white overflow-hidden relative flex-1">
                <div
                  className="h-full bg-[#f59e0b] transition-all duration-500 rounded-xs"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
              <div className="text-xs text-neutral-600 font-medium w-16 sm:w-20 text-right shrink-0">
                {item.percentage}% ({item.count})
              </div>
            </button>
          ))}
        </div>

        {/* Sort & Star Filter Bar */}
        <div className="relative flex items-center justify-between mt-6 mb-5" ref={sortDropdownRef}>
          {selectedStarFilter !== null ? (
            <div className="flex items-center gap-2 bg-[#f4f7eb] text-[#244f31] border border-[#d8e4bd] px-3 py-1 rounded-md text-xs font-semibold">
              <span>Showing {selectedStarFilter}★ reviews ({sortedAndFilteredReviews.length})</span>
              <button
                type="button"
                onClick={() => setSelectedStarFilter(null)}
                className="text-xs underline font-bold text-[#788c3b] hover:text-[#526027] cursor-pointer"
              >
                Clear
              </button>
            </div>
          ) : (
            <div />
          )}

          {/* Olive Green Sort Dropdown Button */}
          <div className="relative ml-auto">
            <button
              type="button"
              onClick={() => setIsSortDropdownOpen((prev) => !prev)}
              className="bg-[#788c3b] hover:bg-[#687a32] text-white px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              <span>{sortLabels[sortOption] || "MOST RECENT"}</span>
              <ChevronDown
                className={`size-3.5 stroke-[2.5] transition-transform ${
                  isSortDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isSortDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-neutral-200 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150">
                <button
                  type="button"
                  onClick={() => {
                    setSortOption("recent");
                    setIsSortDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-[#f7f9f0] transition ${
                    sortOption === "recent" ? "text-[#788c3b] font-bold bg-[#f4f7eb]" : "text-neutral-700"
                  }`}
                >
                  Most Recent
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSortOption("highest");
                    setIsSortDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-[#f7f9f0] transition ${
                    sortOption === "highest" ? "text-[#788c3b] font-bold bg-[#f4f7eb]" : "text-neutral-700"
                  }`}
                >
                  Highest Rating
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSortOption("lowest");
                    setIsSortDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-[#f7f9f0] transition ${
                    sortOption === "lowest" ? "text-[#788c3b] font-bold bg-[#f4f7eb]" : "text-neutral-700"
                  }`}
                >
                  Lowest Rating
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSortOption("photos");
                    setIsSortDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-[#f7f9f0] transition ${
                    sortOption === "photos" ? "text-[#788c3b] font-bold bg-[#f4f7eb]" : "text-neutral-700"
                  }`}
                >
                  With Photos Only
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 3-Column Review Cards Grid */}
        {sortedAndFilteredReviews.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-200 p-8 text-center bg-white">
            <p className="text-xs text-neutral-500">No reviews found matching your filter.</p>
            <button
              type="button"
              onClick={() => {
                setSelectedStarFilter(null);
                setSortOption("recent");
              }}
              className="mt-3 text-xs font-bold text-[#788c3b] underline cursor-pointer"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {sortedAndFilteredReviews.map((rev: any, idx: number) => {
              const ratingNum = Math.min(5, Math.max(1, Math.round(Number(rev.rating) || 5)));
              const isVerified = Boolean(rev.verifiedBuyer || rev.verified !== false);

              return (
                <div
                  key={rev.id || idx}
                  className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-between hover:shadow-md transition"
                >
                  <div>
                    {/* Reviewer Name */}
                    <div className="font-bold text-[#17231b] text-sm">
                      {rev.name || rev.customer || rev.customerName || "Valued Customer"}
                    </div>

                    {/* Date */}
                    <div className="text-xs text-neutral-400 mt-0.5">
                      {rev.date || "25/08/2026"}
                    </div>

                    {/* Rating Stars (Olive Green #788c3b) */}
                    <div className="flex items-center gap-0.5 my-2.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`size-3.5 ${
                            s <= ratingNum
                              ? "fill-[#788c3b] text-[#788c3b]"
                              : "text-[#788c3b] stroke-[1.5] fill-none opacity-40"
                          }`}
                        />
                      ))}
                    </div>

                    {/* Review Headline / Title */}
                    <h4 className="font-bold text-[#17231b] text-sm tracking-tight">
                      {rev.title || "Good"}
                    </h4>

                    {/* Review Body */}
                    <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                      {rev.comment || rev.content || "Good"}
                    </p>

                    {/* Customer Photo (if attached) */}
                    {Boolean(rev.image || (Array.isArray(rev.images) && rev.images.length > 0)) && (
                      <div className="mt-3 flex items-center gap-2">
                        <a
                          href={rev.image || rev.images[0]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="relative size-16 rounded-xl overflow-hidden border border-neutral-200 group shrink-0"
                          title="Click to view full photo"
                        >
                          <Image
                            src={rev.image || rev.images[0]}
                            alt="Customer Review Photo"
                            width={64}
                            height={64}
                            unoptimized
                            className="size-full object-cover group-hover:scale-105 transition"
                          />
                          <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-[9px] font-bold">
                            View
                          </div>
                        </a>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#244f31] bg-[#eef5df] px-2 py-0.5 rounded-full border border-emerald-200">
                          📷 Customer Photo
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Verified Buyer Footer */}
                  <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px]">
                    {isVerified ? (
                      <span className="inline-flex items-center gap-1 text-[#788c3b] font-semibold">
                        <CheckCircle2 className="size-3.5 text-[#788c3b]" /> Verified Buyer
                      </span>
                    ) : (
                      <span className="text-neutral-400">Customer Review</span>
                    )}
                    {rev.location && (
                      <span className="text-neutral-400 text-[10px]">{rev.location}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Interactive Write a Review Modal Dialog */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-[#ddddd9] max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#ddddd9] pb-4">
              <div>
                <h3 className="text-base font-black uppercase tracking-tight text-[#17231b]">
                  Rate & Review
                </h3>
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

            {/* Success Notification */}
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
                      setReviewSuccessMsg(data.message || "Thank you! Your review has been published.");
                      if (data.review) {
                        const newRev = {
                          ...data.review,
                          isUserSubmitted: true,
                          verifiedBuyer: true,
                          date: new Date().toLocaleDateString("en-GB"),
                        };
                        setReviewsList((prev) => [newRev, ...prev]);
                      }
                      setTimeout(() => {
                        setReviewModalOpen(false);
                        setReviewSuccessMsg(null);
                        setReviewForm({
                          rating: 5,
                          title: "",
                          comment: "",
                          customerName: "",
                          location: "",
                          orderIdOrPhone: "",
                          image: "",
                        });
                      }, 1600);
                    } else {
                      setReviewError(data.error || "Failed to submit review.");
                    }
                  } catch {
                    setReviewError("Something went wrong while submitting your review. Please try again.");
                  } finally {
                    setSubmittingReview(false);
                  }
                }}
                className="mt-5 space-y-4 text-xs"
              >
                {/* Star Rating Picker */}
                <div>
                  <label className="block font-bold text-[#17231b] mb-1.5">Your Overall Rating *</label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const active = star <= (hoverRating || reviewForm.rating);
                      return (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                          className="p-1 text-2xl transition hover:scale-110 focus:outline-none"
                        >
                          <Star
                            className={`size-7 transition ${
                              active ? "fill-[#788c3b] text-[#788c3b]" : "text-gray-300"
                            }`}
                          />
                        </button>
                      );
                    })}
                    <span className="ml-2 font-bold text-xs text-[#244f31]">
                      {reviewForm.rating === 5 && "⭐ Excellent (5/5)"}
                      {reviewForm.rating === 4 && "⭐ Very Good (4/5)"}
                      {reviewForm.rating === 3 && "⭐ Good (3/5)"}
                      {reviewForm.rating === 2 && "⭐ Fair (2/5)"}
                      {reviewForm.rating === 1 && "⭐ Poor (1/5)"}
                    </span>
                  </div>
                </div>

                {/* Name & Location */}
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
                    <label className="block font-bold text-[#17231b] mb-1">City / Location</label>
                    <input
                      type="text"
                      placeholder="e.g. Mumbai, MH"
                      value={reviewForm.location}
                      onChange={(e) => setReviewForm({ ...reviewForm, location: e.target.value })}
                      className="w-full rounded-xl border border-[#ddddd9] p-2.5 outline-none focus:border-[#244f31] bg-white font-medium"
                    />
                  </div>
                </div>

                {/* Order ID or Phone (Verified Buyer verification) */}
                <div>
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-[#17231b] mb-1">
                      Order ID or Mobile Number <span className="text-gray-400 font-normal">(Optional)</span>
                    </label>
                    <span className="text-[10px] font-bold text-[#80a03c] bg-[#eef5df] px-1.5 py-0.5 rounded">
                      🛡️ Verified Buyer Badge
                    </span>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. PYR-ORD-146050 or 9876543210"
                    value={reviewForm.orderIdOrPhone}
                    onChange={(e) => setReviewForm({ ...reviewForm, orderIdOrPhone: e.target.value })}
                    className="w-full rounded-xl border border-[#ddddd9] p-2.5 outline-none focus:border-[#244f31] bg-white font-mono text-xs"
                  />
                  <p className="mt-1 text-[10px] text-gray-400">
                    If this matches a past order, your review will proudly feature the green <b>Verified Buyer</b> checkmark.
                  </p>
                </div>

                {/* Headline / Title */}
                <div>
                  <label className="block font-bold text-[#17231b] mb-1">Review Headline</label>
                  <input
                    type="text"
                    placeholder="e.g. Excellent herbal formulation! Felt energetic in 2 weeks"
                    value={reviewForm.title}
                    onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                    className="w-full rounded-xl border border-[#ddddd9] p-2.5 outline-none focus:border-[#244f31] bg-white font-medium"
                  />
                </div>

                {/* Detailed Comment */}
                <div>
                  <label className="block font-bold text-[#17231b] mb-1">Detailed Review *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Share how this Ayurvedic remedy helped you, its taste, dosage routine, or results..."
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    className="w-full rounded-xl border border-[#ddddd9] p-2.5 outline-none focus:border-[#244f31] bg-white font-medium resize-none"
                  />
                </div>

                {/* Photo / Image Attachment */}
                <div>
                  <label className="block font-bold text-[#17231b] mb-1">
                    Attach Photo <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  {reviewForm.image ? (
                    <div className="relative inline-block border border-gray-200 rounded-2xl overflow-hidden bg-gray-50 p-1">
                      <div className="relative size-20 sm:size-24 rounded-xl overflow-hidden">
                        <Image
                          src={reviewForm.image}
                          alt="Review Photo Preview"
                          width={96}
                          height={96}
                          unoptimized
                          className="size-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setReviewForm({ ...reviewForm, image: "" })}
                        className="absolute -top-1 -right-1 size-6 bg-rose-600 text-white rounded-full flex items-center justify-center hover:bg-rose-700 transition shadow-xs cursor-pointer"
                        title="Remove Photo"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-[#ddddd9] hover:border-[#244f31] bg-[#f8faf1]/60 hover:bg-[#f8faf1] rounded-2xl p-4 transition cursor-pointer group">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploadingReviewImg}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setUploadingReviewImg(true);
                          setReviewError(null);
                          try {
                            const url = await uploadReviewImage(file);
                            if (url) {
                              setReviewForm((prev) => ({ ...prev, image: url }));
                            } else {
                              setReviewError("Failed to upload image. Please try another photo.");
                            }
                          } catch {
                            setReviewError("Could not process this image.");
                          } finally {
                            setUploadingReviewImg(false);
                          }
                        }}
                      />
                      {uploadingReviewImg ? (
                        <div className="flex items-center gap-2 text-xs font-bold text-[#244f31] py-1">
                          <Loader2 className="size-4 animate-spin text-emerald-700" />
                          <span>Compressing &amp; uploading photo...</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center text-center">
                          <div className="size-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mb-1.5 group-hover:scale-105 transition">
                            <Camera className="size-4 text-emerald-700" />
                          </div>
                          <span className="text-xs font-bold text-[#17231b]">Upload Remedy Photo</span>
                          <span className="text-[10px] text-gray-500 mt-0.5">Show remedy bottle, unboxing, or results (PNG, JPG, WebP)</span>
                        </div>
                      )}
                    </label>
                  )}
                </div>

                {/* Error Message */}
                {reviewError && (
                  <div className="rounded-xl bg-red-50 border border-red-200 p-2.5 text-xs text-red-700 font-semibold">
                    {reviewError}
                  </div>
                )}

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="w-full rounded-xl bg-[#244f31] hover:bg-[#1d3b24] text-white py-3.5 text-xs font-black tracking-wider uppercase transition flex items-center justify-center gap-2 shadow-md disabled:opacity-60"
                  >
                    {submittingReview ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        <span>SUBMITTING REVIEW...</span>
                      </>
                    ) : (
                      <>
                        <Star className="size-4 fill-white" />
                        <span>SUBMIT REVIEW</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Product FAQs */}
      {faqs.length > 0 && (
        <section className="bg-white py-12 border-y border-[#ddddd9]">
          <div className="mx-auto max-w-[1440px] px-4 md:px-6">
            <h2 className="text-xl font-black uppercase tracking-tight text-[#17231b] sm:text-2xl mb-6">
              Frequently Asked Questions
            </h2>
            <div className="space-y-3 max-w-3xl">
              {faqs.map((faq, idx) => (
                <div key={idx} className="rounded-xl border border-[#ddddd9] bg-[#f8faf1] overflow-hidden">
                  <button
                    onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                    className="flex w-full items-center justify-between p-4 text-left text-xs font-bold text-[#17231b] md:text-sm"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown className={`size-4 text-[#80a03c] transition-transform ${activeFaq === idx ? "rotate-180" : ""}`} />
                  </button>
                  {activeFaq === idx && (
                    <div className="px-4 pb-4 text-xs text-[#666666] leading-relaxed border-t border-[#ddddd9] pt-3">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main Footer */}
      <SiteFooter />
    </main>
  );
}
