"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import AnnouncementBar from "./AnnouncementBar";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import ProductRail from "./ProductRail";
import { ProductDetail, productDetails } from "@/lib/product-detail-data";
import { products, Product } from "@/lib/store";

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

  const gallery = product.gallery && product.gallery.length > 0
    ? product.gallery.filter(Boolean)
    : [product.image || "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=500&q=80"];

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

  const customerReviews = Array.isArray(product.customerReviews) ? product.customerReviews : [];
  const faqs = Array.isArray(product.faqs) ? product.faqs : [];

  const [selectedImage, setSelectedImage] = useState(gallery[0]);
  const [selectedVariant, setSelectedVariant] = useState(variants[0]);
  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState("");
  const [pincodeVerified, setPincodeVerified] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    setSelectedImage(gallery[0]);
    setSelectedVariant(variants[0]);
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
    window.location.href = `/checkout?productId=${product.id}&quantity=${quantity}`;
  };

  const currentVariant = selectedVariant || variants[0];
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
                alt={product.name}
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
              <div className="flex items-center gap-1.5 rounded-full bg-[#eef5df] px-3 py-1 text-xs font-bold text-[#244f31]">
                <Star className="size-3.5 fill-[#f2c94c] text-[#f2c94c]" />
                <span>{product.rating || 5.0}</span>
                <span className="text-[#666666]">| {product.reviews || 0} Verified Ratings</span>
              </div>
              <div className="inline-flex items-center gap-1 rounded-full bg-[#fff6d9] px-3 py-1 text-xs font-bold text-[#6b5700]">
                <span>Earn 🪙 {(Number(product.coins) || 50) * quantity} Pyur Coins</span>
              </div>
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

            {/* Pack Size / Variant Selector */}
            {variants.length > 1 && (
              <div className="mt-5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#17231b]">
                  Select Pack Size:
                </label>
                <div className="mt-2 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      className={`flex items-center justify-between rounded-xl border p-3 text-left transition ${
                        currentVariant.id === variant.id
                          ? "border-[#244f31] bg-[#eef5df] ring-1 ring-[#244f31]"
                          : "border-[#ddddd9] bg-white hover:border-[#80a03c]"
                      }`}
                    >
                      <div>
                        <span className="block text-xs font-bold text-[#17231b]">{variant.name}</span>
                        {variant.badge && (
                          <span className="mt-0.5 inline-block rounded bg-[#80a03c] px-1.5 py-0.2 text-[9px] font-extrabold text-white">
                            {variant.badge}
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-black text-[#244f31]">₹{variant.price}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

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

            {/* Quantity Selector & Action Buttons */}
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
                  handleAddToCart({
                    id: product.id,
                    name: product.name,
                    slug: product.slug,
                    concern: product.category,
                    price: unitPrice,
                    compareAt: unitMrp,
                    rating: Number(product.rating) || 5.0,
                    reviews: Number(product.reviews) || 0,
                    badge: product.discount || "NEW",
                    image: product.image,
                    ingredients: ingredients.map((i) => i.name),
                    description: product.description || "",
                    coinsEarned: Number(product.coins) || 50,
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
      {customerReviews.length > 0 && (
        <section className="mx-auto max-w-[1440px] px-4 py-12 md:px-6">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight text-[#17231b] sm:text-2xl">
                Customer Reviews ({product.reviews || customerReviews.length})
              </h2>
              <div className="mt-1 flex items-center gap-2">
                <div className="flex text-[#f2c94c]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="size-4 fill-[#f2c94c]" />
                  ))}
                </div>
                <span className="text-xs font-bold text-[#17231b]">{product.rating || 5.0} out of 5 based on customer ratings</span>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {customerReviews.map((rev) => (
              <div key={rev.id} className="rounded-xl border border-[#ddddd9] bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[#f2c94c]">
                    {[...Array(Number(rev.rating) || 5)].map((_, i) => (
                      <Star key={i} className="size-3.5 fill-[#f2c94c]" />
                    ))}
                  </div>
                  <span className="text-[10px] text-[#666666]">{rev.date}</span>
                </div>
                <h4 className="mt-2 text-xs font-bold text-[#17231b]">{rev.title}</h4>
                <p className="mt-1 text-xs text-[#666666] leading-relaxed">{rev.comment}</p>
                <div className="mt-3 flex items-center gap-1.5 text-[10px] font-semibold text-[#80a03c]">
                  <CheckCircle2 className="size-3.5 text-[#80a03c]" />
                  <span>{rev.name} ({rev.location}) - Verified Buyer</span>
                </div>
              </div>
            ))}
          </div>
        </section>
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
