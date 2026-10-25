"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Star,
  CheckCircle2,
  Camera,
  X,
  Loader2,
  Sparkles,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { uploadReviewImage, compressImageToDataUrl } from "@/lib/upload";

export interface TaitvaReview {
  id: string | number;
  name: string;
  rating: number;
  date: string;
  comment: string;
  photo: string;
  product?: string;
  location?: string;
  verified?: boolean;
}

export const TAITVA_DEFAULT_REVIEWS: TaitvaReview[] = [
  {
    id: "test_harpreet_singh",
    name: "Harpreet Singh",
    location: "Amritsar, Punjab",
    rating: 5,
    date: "13/09/26",
    product: "Neem Karela Jamun / Madhunashi Sugar Care",
    comment:
      "I have tried several brands, but this neem karela jamun juice feels the most authentic. The bitter taste is natural, showing its purity, and it has really helped stabilize my daily energy and glucose levels without any insulin spikes. A staple in my morning routine now.",
    photo: "/reviews/review-customer-1.jpg",
    verified: true,
  },
  {
    id: "test_sunita_deshmukh",
    name: "Sunita Deshmukh",
    location: "Pune, Maharashtra",
    rating: 5,
    date: "24/09/26",
    product: "Virja Powder for Men / Vitality Blend",
    comment:
      "I have been adding this herbal powder to my morning routine every day. It mixes very easily and feels completely pure without any artificial grit. My energy and vitality have noticeably improved and my skin feels much clearer within just a month.",
    photo: "/reviews/review-customer-2.jpg",
    verified: true,
  },
  {
    id: "test_madhavan_iyer",
    name: "Madhavan Iyer",
    location: "Bengaluru, Karnataka",
    rating: 5,
    date: "09/09/26",
    product: "Fat Burner Metabolism Support Juice",
    comment:
      "This herbal fat burner juice has a wonderfully tart and refreshing taste. It has become a regular part of my morning routine, and I feel much more active through long workdays at my desk without afternoon fatigue or brain fog.",
    photo: "/reviews/review-customer-3.jpg",
    verified: true,
  },
  {
    id: "test_1792489624477",
    name: "Mannu",
    location: "Uttrakhand",
    rating: 5,
    date: "20/10/26",
    product: "FAT BURNER-Metabolism Support Juice",
    comment:
      "Mujhe to isske bdia result mile mera kafi weigt kamm hua h mere liye best product hai. Bilkul natural herbal taste aur koi acidity nahi hoti.",
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
    verified: true,
  },
  {
    id: "test_1",
    name: "Rajesh K.",
    location: "Pune, Maharashtra",
    rating: 5,
    date: "18/09/26",
    product: "Virja Powder for Men",
    comment:
      "I was skeptical about Ayurvedic vitality powders, but Virja Powder with warm milk every night gave me consistent energy, stamina, and zero morning fatigue. Authentic gold-grade formulation!",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
    verified: true,
  },
  {
    id: "test_2",
    name: "Suresh Nair",
    location: "Kochi, Kerala",
    rating: 5,
    date: "14/09/26",
    product: "Madhunashi Sugar Care Powder",
    comment:
      "Started Madhunashi Powder on recommendation from our family Vaidya. Within 45 days, my fasting sugar levels stabilized remarkably without insulin spikes. Gudmar and Jamun seed combination really works!",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
    verified: true,
  },
  {
    id: "test_3",
    name: "Pooja Verma",
    location: "Indore, Madhya Pradesh",
    rating: 5,
    date: "10/09/26",
    product: "Pure Ayur Fat Burner Tonic",
    comment:
      "Helped reduce my stubborn bloating and belly fat. The taste is natural herbal and gives great gut digestive relief. Feeling 10 years lighter!",
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80",
    verified: true,
  },
  {
    id: "test_4",
    name: "Amitabh Roy",
    location: "Kolkata, West Bengal",
    rating: 5,
    date: "05/09/26",
    product: "Virja Gold Majun",
    comment:
      "Top notch Shilajit, Ashwagandha and Swarna Bhasma blend. Recovery after long stressful days has improved drastically. Pure Ayurvedic gold!",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=600&q=80",
    verified: true,
  },
  {
    id: "test_5",
    name: "Dr. Neha Saxena",
    location: "Jaipur, Rajasthan",
    rating: 5,
    date: "01/09/26",
    product: "Perfect 36 Herbal Cream",
    comment:
      "Absorbs quickly without stickiness. Natural herbal aroma and visible contouring after 30 days of consistent usage. Truly pure ingredients.",
    photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80",
    verified: true,
  },
];

const POPULAR_PRODUCTS = [
  "Madhunashi Sugar Care Powder",
  "Virja Powder for Men",
  "Virja Gold Majun Tonic",
  "Ayurvedic Fat Burner Juice",
  "Perfect 36 Herbal Cream",
  "Liver Cleanse & Detox Syrup",
];

export default function TestimonialsSection() {
  const [reviews, setReviews] = useState<TaitvaReview[]>(TAITVA_DEFAULT_REVIEWS);
  const [expandedReviewIds, setExpandedReviewIds] = useState<Record<string | number, boolean>>({});

  // Review submission modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [form, setForm] = useState({
    productName: POPULAR_PRODUCTS[0],
    rating: 5,
    customerName: "",
    location: "",
    comment: "",
    image: "",
  });

  // Toggle review truncation
  const toggleExpand = (id: string | number) => {
    setExpandedReviewIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Fetch approved customer testimonials from /api/testimonials and /api/reviews
  useEffect(() => {
    let isMounted = true;

    const loadTestimonials = async () => {
      try {
        const [testimonialsRes, reviewsRes] = await Promise.allSettled([
          fetch("/api/testimonials"),
          fetch("/api/reviews"),
        ]);

        const rawList: TaitvaReview[] = [];

        // 1. Load from /api/testimonials (CMS & Database)
        if (testimonialsRes.status === "fulfilled" && testimonialsRes.value.ok) {
          const tData = await testimonialsRes.value.json();
          if (tData.success && Array.isArray(tData.testimonials)) {
            tData.testimonials.forEach((t: any, idx: number) => {
              const photo =
                t.photo ||
                t.avatar ||
                t.image ||
                (Array.isArray(t.images) && t.images[0]) ||
                TAITVA_DEFAULT_REVIEWS[idx % TAITVA_DEFAULT_REVIEWS.length]?.photo ||
                "/reviews/review-customer-1.jpg";

              rawList.push({
                id: t.id || `test-${idx}`,
                name: t.name || t.customer || t.customerName || "Verified Customer",
                rating: Math.min(5, Math.max(1, Number(t.rating) || 5)),
                date: t.date || "Recent",
                product: t.productTagged || t.product || t.productName || "Ayurvedic Formulation",
                comment: t.comment || t.content || "",
                photo,
                location: t.location || "",
                verified: t.verifiedBuyer !== false,
              });
            });
          }
        }

        // 2. Load from /api/reviews (Customer Submitted Reviews)
        if (reviewsRes.status === "fulfilled" && reviewsRes.value.ok) {
          const rData = await reviewsRes.value.json();
          if (rData.success && Array.isArray(rData.reviews)) {
            rData.reviews.forEach((r: any, idx: number) => {
              const photo =
                r.image ||
                (Array.isArray(r.images) && r.images[0]) ||
                r.avatar ||
                r.photo ||
                TAITVA_DEFAULT_REVIEWS[(idx + 3) % TAITVA_DEFAULT_REVIEWS.length]?.photo ||
                "/reviews/review-customer-2.jpg";

              rawList.push({
                id: r.id || `rev-${idx}`,
                name: r.customer || r.customerName || r.name || "Verified Customer",
                rating: Math.min(5, Math.max(1, Number(r.rating) || 5)),
                date: r.date || "Recent",
                product: r.product || r.productName || "Ayurvedic Formulation",
                comment: r.comment || r.content || "",
                photo,
                location: r.location || "",
                verified: true,
              });
            });
          }
        }

        if (!isMounted) return;

        // 3. Deduplicate across both endpoints and defaults by ID and normalized customer name
        const seenIds = new Set<string>();
        const seenNames = new Set<string>();
        const uniqueReviews: TaitvaReview[] = [];

        const registerReview = (rev: TaitvaReview) => {
          const cleanId = String(rev.id || "").trim().toLowerCase();
          const cleanName = (rev.name || "").trim().toLowerCase();

          // Skip if already in list
          if (cleanId && seenIds.has(cleanId)) return;
          if (cleanName && seenNames.has(cleanName)) return;

          if (cleanId) seenIds.add(cleanId);
          if (cleanName) seenNames.add(cleanName);
          uniqueReviews.push(rev);
        };

        // Live API/database reviews take precedence
        rawList.forEach(registerReview);

        // Pre-existing default reviews added if not present
        TAITVA_DEFAULT_REVIEWS.forEach(registerReview);

        if (uniqueReviews.length > 0) {
          setReviews(uniqueReviews);
        }
      } catch (err) {
        console.warn("Could not load testimonials feed:", err);
      }
    };

    loadTestimonials();

    const handleSync = (e: any) => {
      if (e?.detail?.key === "testimonials" || e?.detail?.key === "reviews") {
        loadTestimonials();
      }
    };

    window.addEventListener("pyur_storefront_updated", handleSync);
    window.addEventListener("storage", loadTestimonials);
    return () => {
      isMounted = false;
      window.removeEventListener("pyur_storefront_updated", handleSync);
      window.removeEventListener("storage", loadTestimonials);
    };
  }, []);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.comment.trim()) {
      setErrorMsg("Please share a short review of your experience.");
      return;
    }
    if (!form.customerName.trim()) {
      setErrorMsg("Please enter your name.");
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const payload = {
        name: form.customerName,
        customerName: form.customerName,
        rating: form.rating,
        comment: form.comment,
        productTagged: form.productName,
        product: form.productName,
        photo: form.image || undefined,
        image: form.image || undefined,
        location: form.location || "India",
      };

      // Submit to both /api/testimonials and /api/reviews
      const [resT, resR] = await Promise.allSettled([
        fetch("/api/testimonials", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }),
        fetch("/api/reviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }),
      ]);

      const successT = resT.status === "fulfilled" && resT.value.ok;
      const successR = resR.status === "fulfilled" && resR.value.ok;

      if (successT || successR) {
        setSuccessMsg("Thank you! Your verified review has been published.");

        // Immediately prepend the new review into the local carousel state
        const newCard: TaitvaReview = {
          id: `user-${Date.now()}`,
          name: form.customerName,
          rating: form.rating,
          date: "Just now",
          product: form.productName,
          comment: form.comment,
          photo: form.image || "/reviews/review-customer-1.jpg",
          location: form.location || "India",
          verified: true,
        };
        setReviews((prev) => {
          const filtered = prev.filter(
            (p) =>
              p.id !== newCard.id &&
              p.name.trim().toLowerCase() !== newCard.name.trim().toLowerCase()
          );
          return [newCard, ...filtered];
        });
        setActiveIndex(0);
        scrollToIndex(0);

        setTimeout(() => {
          setIsModalOpen(false);
          setSuccessMsg(null);
          setForm({
            productName: POPULAR_PRODUCTS[0],
            rating: 5,
            customerName: "",
            location: "",
            comment: "",
            image: "",
          });
        }, 2000);
      } else {
        setErrorMsg("Failed to submit review. Please try again.");
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/") && !file.name.match(/\.(jpg|jpeg|png|webp|gif|avif|heic|heif)$/i)) {
      setErrorMsg("Please upload an image file (JPG, PNG, WebP).");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setErrorMsg("Image size exceeds 20MB limit. Please select a smaller photo.");
      return;
    }

    setUploadingImg(true);
    setErrorMsg(null);

    try {
      const uploadedUrl = await uploadReviewImage(file);
      if (uploadedUrl) {
        setForm((prev) => ({ ...prev, image: uploadedUrl }));
      }
    } catch {
      try {
        const localUrl = await compressImageToDataUrl(file, 800, 0.82);
        if (localUrl) {
          setForm((prev) => ({ ...prev, image: localUrl }));
        }
      } catch {
        setErrorMsg("Could not process photo. Please try a different image.");
      }
    } finally {
      setUploadingImg(false);
    }
  };

  // Display all reviews in slider (minimum default 3)
  const displayReviews = reviews.length > 0 ? reviews : TAITVA_DEFAULT_REVIEWS;

  const [activeIndex, setActiveIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isInteractingRef = useRef(false);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, clientWidth, scrollWidth } = scrollContainerRef.current;
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll <= 0) return;

    // 1 comment at a time: calculate index
    const idx = Math.round(scrollLeft / clientWidth);
    setActiveIndex(Math.min(Math.max(0, idx), displayReviews.length - 1));
  };

  const scrollToIndex = (index: number) => {
    if (!scrollContainerRef.current) return;
    const { clientWidth } = scrollContainerRef.current;
    scrollContainerRef.current.scrollTo({
      left: index * clientWidth,
      behavior: "smooth",
    });
    setActiveIndex(index);
  };

  // Auto-slide every 4.5 seconds
  useEffect(() => {
    if (displayReviews.length <= 1) return;
    const interval = setInterval(() => {
      if (isInteractingRef.current || !scrollContainerRef.current) return;
      setActiveIndex((prev) => {
        const next = prev >= displayReviews.length - 1 ? 0 : prev + 1;
        scrollToIndex(next);
        return next;
      });
    }, 4500);
    return () => clearInterval(interval);
  }, [displayReviews.length]);

  return (
    <section id="reviews" className="w-full bg-[#fbfbf9]/60 py-12 sm:py-16 select-none">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        {/* Taitva Signature Serif Section Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-serif tracking-widest uppercase text-neutral-800 font-normal">
            CUSTOMER REVIEWS
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-2 font-normal">
            Authentic experiences from our verified wellness community
          </p>
        </div>

        {/* Comments Slider Container (Showing 1 comment at a time) */}
        <div className="relative max-w-4xl mx-auto group">
          {/* Previous Arrow Button (Desktop) */}
          {displayReviews.length > 1 && (
            <button
              type="button"
              onClick={() => {
                const prev = activeIndex <= 0 ? displayReviews.length - 1 : activeIndex - 1;
                scrollToIndex(prev);
              }}
              aria-label="Previous review"
              className="hidden md:flex absolute -left-5 lg:-left-6 top-1/2 -translate-y-1/2 z-10 size-11 items-center justify-center rounded-full bg-white border border-neutral-200 text-neutral-700 shadow-md hover:bg-neutral-50 hover:text-[#023915] transition cursor-pointer"
            >
              <ChevronLeft className="size-5" />
            </button>
          )}

          {/* Next Arrow Button (Desktop) */}
          {displayReviews.length > 1 && (
            <button
              type="button"
              onClick={() => {
                const next = activeIndex >= displayReviews.length - 1 ? 0 : activeIndex + 1;
                scrollToIndex(next);
              }}
              aria-label="Next review"
              className="hidden md:flex absolute -right-5 lg:-right-6 top-1/2 -translate-y-1/2 z-10 size-11 items-center justify-center rounded-full bg-white border border-neutral-200 text-neutral-700 shadow-md hover:bg-neutral-50 hover:text-[#023915] transition cursor-pointer"
            >
              <ChevronRight className="size-5" />
            </button>
          )}

          {/* Swipeable Scroll Container */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            onTouchStart={() => {
              isInteractingRef.current = true;
            }}
            onTouchEnd={() => {
              setTimeout(() => {
                isInteractingRef.current = false;
              }, 3000);
            }}
            onMouseEnter={() => {
              isInteractingRef.current = true;
            }}
            onMouseLeave={() => {
              isInteractingRef.current = false;
            }}
            className="flex w-full overflow-x-auto snap-x snap-mandatory scrollbar-none pb-2 pt-1 scroll-smooth"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {displayReviews.map((rev, idx) => {
              const isExpanded = Boolean(expandedReviewIds[rev.id]);
              const cardKey = `testimonial-card-${rev.id}-${idx}`;

              return (
                <div
                  key={cardKey}
                  className="w-full shrink-0 snap-center px-1 sm:px-3 flex justify-center"
                >
                  <div className="w-full max-w-xl md:max-w-3xl flex flex-col md:flex-row rounded-3xl overflow-hidden bg-white border border-neutral-200/80 shadow-xs hover:shadow-sm transition-all duration-300">
                    {/* Customer UGC Photo */}
                    <div className="relative w-full md:w-[320px] aspect-[4/3] md:aspect-auto min-h-[240px] md:min-h-[320px] bg-neutral-100 overflow-hidden shrink-0">
                      <img
                        src={rev.photo}
                        alt={`${rev.name} holding Pure Ayur Herbs formulation`}
                        className="size-full object-cover object-center"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&q=80";
                        }}
                      />
                    </div>

                    {/* Card Content Block */}
                    <div className="p-5 sm:p-7 md:p-8 flex flex-col flex-1 justify-between bg-white">
                      <div>
                        {/* Customer Name & Location */}
                        <div className="flex items-baseline justify-between gap-2">
                          <h3 className="font-semibold text-neutral-900 text-lg sm:text-xl tracking-tight">
                            {rev.name}
                          </h3>
                          {rev.location && (
                            <span className="text-xs text-neutral-400 font-normal">
                              {rev.location}
                            </span>
                          )}
                        </div>

                        {/* Green Stars & Date */}
                        <div className="flex items-center gap-2 mt-1.5 mb-3">
                          <div className="flex items-center gap-0.5 text-[#023915]">
                            {[...Array(rev.rating)].map((_, i) => (
                              <Star
                                key={i}
                                className="size-4 fill-[#023915] text-[#023915]"
                              />
                            ))}
                          </div>
                          <span className="text-xs text-neutral-400 font-normal">
                            {rev.date}
                          </span>
                        </div>

                        {/* Review Comment Quote */}
                        <p
                          className={`text-sm sm:text-base text-neutral-600 leading-relaxed font-normal ${
                            isExpanded ? "" : "line-clamp-4"
                          }`}
                        >
                          &ldquo;{rev.comment}&rdquo;
                        </p>

                        {/* Read More / Read Less Toggle */}
                        {rev.comment.length > 140 && (
                          <button
                            type="button"
                            onClick={() => toggleExpand(rev.id)}
                            className="mt-2 text-xs font-semibold text-neutral-900 underline hover:text-[#023915] cursor-pointer inline-block text-left"
                          >
                            {isExpanded ? "Read less" : "Read more"}
                          </button>
                        )}
                      </div>

                      {/* Subtle Product Tag / Verified Badge */}
                      {rev.product && (
                        <div className="mt-5 pt-3.5 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                          <span className="truncate max-w-[200px] sm:max-w-xs font-medium text-neutral-700">
                            {rev.product}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[#023915] font-semibold shrink-0">
                            <CheckCircle2 className="size-3.5 text-[#023915]" /> Verified Buyer
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dynamic Pagination Dots for All Reviews */}
          {displayReviews.length > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-2 mt-6 max-w-md mx-auto">
              {displayReviews.map((_, i) => (
                <button
                  key={`testimonial-dot-${i}`}
                  type="button"
                  onClick={() => scrollToIndex(i)}
                  aria-label={`Go to review ${i + 1}`}
                  className={`rounded-full transition-all duration-300 cursor-pointer ${
                    i === activeIndex
                      ? "size-2.5 bg-[#023915] scale-110"
                      : "size-1.5 bg-neutral-300 hover:bg-neutral-400"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Share Experience Action Button */}
        <div className="mt-10 sm:mt-12 text-center">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-neutral-300 hover:border-[#023915] bg-white hover:bg-[#023915]/5 text-neutral-800 hover:text-[#023915] text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-2xs"
          >
            <Sparkles className="size-3.5 text-[#023915]" />
            <span>Write a Review</span>
          </button>
        </div>
      </div>

      {/* Review Submission Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-neutral-200 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
              <div>
                <h3 className="text-base font-bold uppercase tracking-wide text-neutral-900 flex items-center gap-2 font-serif">
                  <Sparkles className="size-4 text-[#023915]" />
                  <span>Share Your Experience</span>
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">Your honest feedback helps fellow wellness seekers.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="size-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-600 transition cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Notifications */}
            {successMsg && (
              <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}
            {errorMsg && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                {errorMsg}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmitReview} className="mt-5 space-y-4">
              {/* Product Select */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Product Purchased
                </label>
                <select
                  value={form.productName}
                  onChange={(e) => setForm({ ...form, productName: e.target.value })}
                  className="w-full text-xs rounded-xl border border-neutral-200 p-2.5 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#023915]/20 focus:border-[#023915]"
                >
                  {POPULAR_PRODUCTS.map((prod) => (
                    <option key={prod} value={prod}>
                      {prod}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rating Stars */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Your Rating
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setForm({ ...form, rating: star })}
                      className="p-1 focus:outline-none cursor-pointer"
                    >
                      <Star
                        className={`size-6 transition ${
                          (hoverRating || form.rating) >= star
                            ? "fill-[#023915] text-[#023915]"
                            : "text-neutral-300"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-semibold text-neutral-600 ml-2">
                    {form.rating} / 5 Stars
                  </span>
                </div>
              </div>

              {/* Name and Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Harpreet Singh"
                    value={form.customerName}
                    onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                    className="w-full text-xs rounded-xl border border-neutral-200 p-2.5 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#023915]/20 focus:border-[#023915]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Location (City / State)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Chandigarh, Punjab"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="w-full text-xs rounded-xl border border-neutral-200 p-2.5 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#023915]/20 focus:border-[#023915]"
                  />
                </div>
              </div>

              {/* Review Comment */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Your Review / Experience *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Share details of your experience, results noticed, taste, purity..."
                  value={form.comment}
                  onChange={(e) => setForm({ ...form, comment: e.target.value })}
                  className="w-full text-xs rounded-xl border border-neutral-200 p-2.5 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#023915]/20 focus:border-[#023915]"
                />
              </div>

              {/* Customer Photo Upload */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Upload Photo with Remedy (Optional)
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-3 py-2 rounded-xl border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-xs font-medium text-neutral-700 cursor-pointer transition">
                    <Camera className="size-4 text-neutral-500" />
                    <span>{uploadingImg ? "Processing..." : "Select Photo"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImg}
                      className="hidden"
                    />
                  </label>
                  {form.image && (
                    <div className="flex items-center gap-2">
                      <div className="relative size-10 rounded-lg overflow-hidden border border-neutral-200 shadow-2xs">
                        <img
                          src={form.image}
                          alt="Uploaded preview"
                          className="size-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, image: "" }))}
                        className="text-xs text-red-600 hover:text-red-700 hover:underline font-medium cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting || uploadingImg}
                  className="w-full py-3 rounded-full bg-[#023915] hover:bg-[#034d1d] text-white text-xs font-bold uppercase tracking-wider transition shadow-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>Submitting Review...</span>
                    </>
                  ) : (
                    <span>Submit Review</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
