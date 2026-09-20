"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Star, CheckCircle2, Camera, X, Loader2, Sparkles, MessageSquare } from "lucide-react";
import { uploadReviewImage } from "@/lib/upload";

interface Testimonial {
  id: string | number;
  name: string;
  verified: boolean;
  product: string;
  rating: number;
  comment: string;
  image?: string | null;
  customerPhoto?: string | null;
  location?: string;
  date?: string;
}

const POPULAR_PRODUCTS = [
  "Madhunashi Sugar Care Powder",
  "Virja Powder for Men",
  "Virja Gold Majun Tonic",
  "Ayurvedic Fat Burner Juice",
  "Perfect 36 Herbal Cream",
  "Liver Cleanse & Detox Syrup",
  "Kashmiri Kumkumadi Tailam",
  "Pure Himalayan Shilajit",
];

export default function TestimonialsSection() {
  const [reviews, setReviews] = useState<Testimonial[]>([]);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [loading, setLoading] = useState(true);

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
    orderIdOrPhone: "",
    title: "",
    comment: "",
    image: "",
  });

  // Fetch approved customer reviews from /api/reviews
  useEffect(() => {
    let isMounted = true;
    fetch("/api/reviews")
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data && data.success && Array.isArray(data.reviews)) {
          const realReviews: Testimonial[] = data.reviews.map((r: any, idx: number) => {
            const photo = r.image || (Array.isArray(r.images) && r.images[0]) || null;
            return {
              id: r.id || `real-${idx}`,
              name: r.customer || r.customerName || r.name || "Customer",
              verified: Boolean(r.verifiedBuyer || r.verified || true),
              product: r.product || r.productName || "Ayurvedic Remedy",
              rating: Math.min(5, Math.max(1, Number(r.rating) || 5)),
              comment: r.comment || r.content || "",
              image: photo || null,
              customerPhoto: photo,
              location: r.location || "India",
              date: r.date || "Verified Purchase",
            };
          });

          setReviews(realReviews);
        }
      })
      .catch((err) => console.warn("Could not load reviews feed:", err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
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

    try {
      const isPhone = /^\d{10}$/.test(form.orderIdOrPhone.replace(/\D/g, ""));
      const payload = {
        productId: form.productName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        productName: form.productName,
        rating: form.rating,
        title: form.title || `${form.productName} Experience`,
        comment: form.comment,
        customerName: form.customerName,
        location: form.location || "India",
        customerPhone: isPhone ? form.orderIdOrPhone.replace(/\D/g, "").slice(-10) : undefined,
        orderId: !isPhone && form.orderIdOrPhone ? form.orderIdOrPhone.trim() : undefined,
        image: form.image || undefined,
        images: form.image ? [form.image] : undefined,
      };

      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data && data.success) {
        setSuccessMsg(data.message || "Thank you! Your review is now live on our website.");

        // Prepend new review immediately to the visible list
        const newEntry: Testimonial = {
          id: data.review?.id || `new-${Date.now()}`,
          name: form.customerName + (form.location ? `, ${form.location}` : ""),
          verified: Boolean(data.verifiedBuyer),
          product: form.productName,
          rating: form.rating,
          comment: form.comment,
          image: form.image || null,
          customerPhoto: form.image || null,
          location: form.location,
          date: "Just now",
        };

        setReviews((prev) => [newEntry, ...prev]);

        setTimeout(() => {
          setIsModalOpen(false);
          setSuccessMsg(null);
          setForm({
            productName: POPULAR_PRODUCTS[0],
            rating: 5,
            customerName: "",
            location: "",
            orderIdOrPhone: "",
            title: "",
            comment: "",
            image: "",
          });
        }, 1600);
      } else {
        setErrorMsg(data.error || "Failed to submit review. Please check all fields.");
      }
    } catch {
      setErrorMsg("Something went wrong submitting your review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="reviews" className="mx-auto max-w-[1440px] px-4 py-12 md:px-6 md:py-16">
      {/* Header & Write Review Action */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 max-w-4xl mx-auto mb-10 text-center md:text-left">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#80a03c] block">
            REAL STORIES, REAL RESULTS
          </span>
          <h2 className="mt-1 text-2xl font-black uppercase tracking-tight text-[#17231b] sm:text-3xl">
            Trusted by Thousands Across India
          </h2>
          <p className="mt-2 text-xs font-medium text-[#666666] md:text-sm">
            See how our natural Ayurvedic formulations have transformed daily lives across India.
          </p>
        </div>

        <div className="shrink-0 flex flex-col sm:flex-row items-center justify-center md:justify-end gap-3">
          {reviews.length > 6 && !showAllReviews && (
            <button
              type="button"
              onClick={() => setShowAllReviews(true)}
              className="text-xs font-bold text-[#244f31] hover:underline cursor-pointer"
            >
              See all reviews ({reviews.length}) →
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#244f31] hover:bg-[#1c3e26] text-white text-xs font-black uppercase tracking-wider transition shadow-sm hover:shadow-md cursor-pointer"
          >
            <Star className="size-3.5 fill-amber-300 text-amber-300" />
            <span>Write a Review</span>
          </button>
        </div>
      </div>

      {/* Empty State when no real reviews exist */}
      {reviews.length === 0 && !loading && (
        <div className="rounded-2xl border border-dashed border-[#ddddd9] bg-white p-8 text-center max-w-md mx-auto">
          <Star className="size-8 text-[#80a03c] mx-auto mb-2 opacity-50" />
          <h3 className="font-bold text-sm text-[#17231b]">No customer reviews yet</h3>
          <p className="text-xs text-[#666666] mt-1">Be the first to share your experience with our authentic Ayurvedic remedies.</p>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#244f31] text-white text-xs font-bold transition hover:bg-[#1c3e26] cursor-pointer"
          >
            <Star className="size-3.5 fill-white" />
            <span>Write a Review</span>
          </button>
        </div>
      )}

      {/* Testimonials Grid (Maximum 6 top reviews by default) */}
      {reviews.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {(showAllReviews ? reviews : reviews.slice(0, 6)).map((rev) => (
              <div
                key={rev.id}
                className="flex flex-col justify-between rounded-2xl border border-[#ddddd9] bg-white p-6 shadow-xs transition hover:shadow-md"
              >
                <div>
                  {/* Rating Stars */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1 text-[#f2c94c]">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="size-4 fill-[#f2c94c]" />
                      ))}
                    </div>
                    {rev.date && (
                      <span className="text-[10px] text-gray-400 font-medium">{rev.date}</span>
                    )}
                  </div>

                  {/* Review Text */}
                  <p className="text-xs leading-relaxed text-[#17231b] italic md:text-sm">
                    &ldquo;{rev.comment}&rdquo;
                  </p>

                  {/* Customer Uploaded Photo Thumbnail */}
                  {rev.customerPhoto && (
                    <div className="mt-3.5 pt-3 border-t border-gray-100 flex items-center gap-2.5">
                      <a
                        href={rev.customerPhoto}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative size-14 rounded-xl overflow-hidden border border-[#ddddd9] bg-gray-50 group shrink-0 hover:border-[#244f31] transition shadow-2xs"
                        title="Click to view customer photo full size"
                      >
                        <Image
                          src={rev.customerPhoto}
                          alt={`${rev.name} Review Photo`}
                          width={56}
                          height={56}
                          unoptimized
                          className="size-full object-cover group-hover:scale-105 transition"
                        />
                        <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-[9px] font-bold">
                          🔍 View
                        </div>
                      </a>
                      <div className="text-[11px]">
                        <span className="inline-flex items-center gap-1 font-bold text-[#244f31] bg-[#eef5df] px-2 py-0.5 rounded-full text-[10px] border border-emerald-200">
                          📷 Customer Photo
                        </span>
                        <span className="text-gray-400 block text-[10px] mt-0.5">Verified remedy upload</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Author Footer */}
                <div className="mt-6 pt-4 border-t border-[#ddddd9] flex items-center gap-3">
                  <div className="relative size-10 overflow-hidden rounded-full border border-[#80a03c] bg-[#eef5df] flex items-center justify-center text-[#244f31] font-black text-xs shrink-0">
                    {rev.image ? (
                      <Image
                        src={rev.image}
                        alt={rev.name}
                        width={40}
                        height={40}
                        unoptimized
                        className="size-full object-cover"
                      />
                    ) : (
                      <span>{rev.name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-[#17231b] truncate">{rev.name}</h4>
                      {rev.verified && (
                        <span title="Verified Buyer" className="shrink-0">
                          <CheckCircle2 className="size-3.5 text-[#80a03c]" />
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-medium text-[#666666] truncate block">
                      Verified Purchase: {rev.product}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Small link to See All Reviews on main page */}
          {reviews.length > 6 && (
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={() => setShowAllReviews((prev) => !prev)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#244f31] hover:text-[#17231b] bg-[#eef5df] hover:bg-[#e2ecc9] px-5 py-2 rounded-full transition cursor-pointer shadow-2xs"
              >
                <span>{showAllReviews ? "Show less ↑" : `See all reviews (${reviews.length}) →`}</span>
              </button>
            </div>
          )}
        </>
      )}

      {/* Interactive Write a Review Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-[#ddddd9] max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#ddddd9] pb-4">
              <div>
                <h3 className="text-base font-black uppercase tracking-tight text-[#17231b] flex items-center gap-2">
                  <Sparkles className="size-4 text-emerald-700" />
                  <span>Share Your Experience</span>
                </h3>
                <p className="text-xs text-[#666666] mt-0.5">Your honest feedback helps fellow seekers across India.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-lg transition"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Success View */}
            {successMsg ? (
              <div className="py-10 text-center space-y-3">
                <div className="size-14 rounded-full bg-[#eef5df] border border-[#80a03c] flex items-center justify-center mx-auto text-[#244f31]">
                  <CheckCircle2 className="size-8 text-[#80a03c]" />
                </div>
                <h4 className="text-base font-bold text-[#17231b]">Review Published!</h4>
                <p className="text-xs text-gray-600 max-w-xs mx-auto leading-relaxed">{successMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="mt-5 space-y-4 text-xs">
                {/* Product Select */}
                <div>
                  <label className="block font-bold text-[#17231b] mb-1">Select Remedy Used *</label>
                  <select
                    value={form.productName}
                    onChange={(e) => setForm({ ...form, productName: e.target.value })}
                    className="w-full rounded-xl border border-[#ddddd9] p-2.5 outline-none focus:border-[#244f31] bg-white font-medium"
                  >
                    {POPULAR_PRODUCTS.map((prod, idx) => (
                      <option key={idx} value={prod}>{prod}</option>
                    ))}
                    <option value="General Ayurvedic Remedy">Other / General Remedy</option>
                  </select>
                </div>

                {/* Star Rating Picker */}
                <div>
                  <label className="block font-bold text-[#17231b] mb-1.5">Your Overall Rating *</label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const active = star <= (hoverRating || form.rating);
                      return (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setForm({ ...form, rating: star })}
                          className="p-1 text-2xl transition hover:scale-110 focus:outline-none"
                        >
                          <Star
                            className={`size-7 transition ${
                              active ? "fill-[#f2c94c] text-[#f2c94c]" : "text-gray-300"
                            }`}
                          />
                        </button>
                      );
                    })}
                    <span className="ml-2 font-bold text-xs text-[#244f31]">
                      {form.rating === 5 && "⭐ Excellent (5/5)"}
                      {form.rating === 4 && "⭐ Very Good (4/5)"}
                      {form.rating === 3 && "⭐ Good (3/5)"}
                      {form.rating === 2 && "⭐ Fair (2/5)"}
                      {form.rating === 1 && "⭐ Poor (1/5)"}
                    </span>
                  </div>
                </div>

                {/* Name & Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#17231b] mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Sharma"
                      value={form.customerName}
                      onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                      className="w-full rounded-xl border border-[#ddddd9] p-2.5 outline-none focus:border-[#244f31] bg-white font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#17231b] mb-1">City / Location</label>
                    <input
                      type="text"
                      placeholder="e.g. Jaipur, Rajasthan"
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                      className="w-full rounded-xl border border-[#ddddd9] p-2.5 outline-none focus:border-[#244f31] bg-white font-medium"
                    />
                  </div>
                </div>

                {/* Order ID or Phone */}
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
                    value={form.orderIdOrPhone}
                    onChange={(e) => setForm({ ...form, orderIdOrPhone: e.target.value })}
                    className="w-full rounded-xl border border-[#ddddd9] p-2.5 outline-none focus:border-[#244f31] bg-white font-mono text-xs"
                  />
                  <p className="mt-1 text-[10px] text-gray-400">
                    If this matches a past order, your review will proudly feature the green <b>Verified Buyer</b> checkmark.
                  </p>
                </div>

                {/* Review Headline */}
                <div>
                  <label className="block font-bold text-[#17231b] mb-1">Review Headline</label>
                  <input
                    type="text"
                    placeholder="e.g. Genuine Ayurvedic results! Feel energetic all day"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full rounded-xl border border-[#ddddd9] p-2.5 outline-none focus:border-[#244f31] bg-white font-medium"
                  />
                </div>

                {/* Detailed Comment */}
                <div>
                  <label className="block font-bold text-[#17231b] mb-1">Your Detailed Experience *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Share how this remedy helped you, its taste, dosage routine, or results..."
                    value={form.comment}
                    onChange={(e) => setForm({ ...form, comment: e.target.value })}
                    className="w-full rounded-xl border border-[#ddddd9] p-2.5 outline-none focus:border-[#244f31] bg-white font-medium resize-none"
                  />
                </div>

                {/* Photo / Image Attachment */}
                <div>
                  <label className="block font-bold text-[#17231b] mb-1">
                    Attach Photo <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  {form.image ? (
                    <div className="relative inline-block border border-gray-200 rounded-2xl overflow-hidden bg-gray-50 p-1">
                      <div className="relative size-20 sm:size-24 rounded-xl overflow-hidden">
                        <Image
                          src={form.image}
                          alt="Review Photo Preview"
                          width={96}
                          height={96}
                          unoptimized
                          className="size-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, image: "" })}
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
                        disabled={uploadingImg}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setUploadingImg(true);
                          setErrorMsg(null);
                          try {
                            const url = await uploadReviewImage(file);
                            if (url) {
                              setForm((prev) => ({ ...prev, image: url }));
                            } else {
                              setErrorMsg("Failed to upload image. Please try another photo.");
                            }
                          } catch {
                            setErrorMsg("Could not process this image.");
                          } finally {
                            setUploadingImg(false);
                          }
                        }}
                      />
                      {uploadingImg ? (
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

                {/* Error Banner */}
                {errorMsg && (
                  <div className="rounded-xl bg-red-50 border border-red-200 p-2.5 text-xs text-red-700 font-semibold">
                    {errorMsg}
                  </div>
                )}

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-xl bg-[#244f31] hover:bg-[#1d3b24] text-white py-3.5 text-xs font-black tracking-wider uppercase transition flex items-center justify-center gap-2 shadow-md disabled:opacity-60 cursor-pointer"
                  >
                    {submitting ? (
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
    </section>
  );
}
