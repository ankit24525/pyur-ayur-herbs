"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Play,
  Film,
  Video,
  Image as ImageIcon,
  Sparkles,
  ShieldCheck,
  Award,
  Users,
  CheckCircle2,
  X,
  ExternalLink,
  ShoppingBag,
  Clock,
  User,
  Heart,
  Share2,
  ChevronRight,
  ArrowRight,
  Maximize2
} from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import AnnouncementBar from "@/components/AnnouncementBar";
import WhatsAppWidget from "@/components/WhatsAppWidget";
import { Product } from "@/lib/store";
import { getStorefrontData } from "@/lib/storefront-client";
import { MediaItem, defaultMedia } from "@/lib/default-media";

export default function MediaHubPage() {
  const [mediaList, setMediaList] = useState<MediaItem[]>(defaultMedia);
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activeMediaModal, setActiveMediaModal] = useState<MediaItem | null>(null);
  const [activePhotoModal, setActivePhotoModal] = useState<MediaItem | null>(null);
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    // 1. Fetch storefront data
    getStorefrontData()
      .then((data) => {
        if (Array.isArray(data?.media) && data.media.length > 0) {
          setMediaList(data.media.filter((m: MediaItem) => m.status === "Published"));
        }
        if (Array.isArray(data?.products)) {
          setCatalog(data.products);
        }
      })
      .catch((err) => console.error("Error loading media hub data:", err));

    // 2. Real-time admin synchronization
    const handleUpdate = (e: any) => {
      if (e.detail?.key === "media" && Array.isArray(e.detail.value)) {
        setMediaList(e.detail.value.filter((m: MediaItem) => m.status === "Published"));
      }
    };
    window.addEventListener("pyur_storefront_updated", handleUpdate);

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "pyur_storefront_cache" && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed.media)) {
            setMediaList(parsed.media.filter((m: MediaItem) => m.status === "Published"));
          }
        } catch {}
      }
    };
    window.addEventListener("storage", handleStorage);

    // 3. Load cart state
    try {
      const stored = localStorage.getItem("pyur_cart");
      if (stored) setCart(JSON.parse(stored));
    } catch {}

    return () => {
      window.removeEventListener("pyur_storefront_updated", handleUpdate);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const saveCartState = (newCart: { product: Product; quantity: number }[]) => {
    setCart(newCart);
    localStorage.setItem("pyur_cart", JSON.stringify(newCart));
    window.dispatchEvent(new CustomEvent("pyur_cart_updated", { detail: newCart }));
  };

  const handleAddToCart = (product: Product) => {
    const existing = cart.find((i) => i.product.id === product.id);
    let nextCart;
    if (existing) {
      nextCart = cart.map((i) =>
        i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
      );
    } else {
      nextCart = [...cart, { product, quantity: 1 }];
    }
    saveCartState(nextCart);
  };

  const handleShare = (item: MediaItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: item.title,
        text: item.caption || item.title,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // Helper to extract clean embeddable YouTube link
  const getEmbedUrl = (url: string) => {
    if (!url) return "";
    try {
      if (url.includes("youtube.com/shorts/")) {
        const id = url.split("youtube.com/shorts/")[1].split("?")[0];
        return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
      }
      if (url.includes("youtube.com/watch?v=")) {
        const id = url.split("youtube.com/watch?v=")[1].split("&")[0];
        return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
      }
      if (url.includes("youtu.be/")) {
        const id = url.split("youtu.be/")[1].split("?")[0];
        return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
      }
      if (url.includes("instagram.com/reel/") || url.includes("instagram.com/p/")) {
        // Strip query params and append /embed
        const clean = url.split("?")[0].replace(/\/+$/, "");
        return `${clean}/embed`;
      }
    } catch {}
    return url;
  };

  // Categories list
  const categories = [
    { label: "All Media", value: "All" },
    { label: "📱 Reels & Shorts", value: "Reels & Shorts" },
    { label: "🎬 Doctor Talks", value: "Doctor Talks" },
    { label: "📸 Lab & Farm BTS", value: "Lab & Farm BTS" },
    { label: "⭐ Customer Stories", value: "Customer Stories" },
    { label: "📰 Press & News", value: "Press & News" },
  ];

  // Filter items
  const filteredMedia = selectedCategory === "All"
    ? mediaList
    : mediaList.filter((m) => m.category === selectedCategory);

  const reels = filteredMedia.filter((m) => m.type === "reel");
  const videos = filteredMedia.filter((m) => m.type === "video");
  const photos = filteredMedia.filter((m) => m.type === "photo");

  return (
    <main className="min-h-screen bg-[#fbfcf9] text-[#17231b] flex flex-col justify-between">
      <div>
        <AnnouncementBar />
        <SiteHeader />

        {/* Hero Header */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#244f31] via-[#1d3f27] to-[#17231b] text-white pt-12 pb-14 px-4 sm:px-6">
          <div className="absolute inset-0 bg-[radial-gradient(#80a03c_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

          <div className="max-w-6xl mx-auto relative z-10 text-center">
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-2 bg-[#80a03c]/20 border border-[#80a03c]/40 text-[#c7df8e] text-xs font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full mb-4 shadow-sm backdrop-blur-md">
              <Sparkles className="size-3.5 text-[#80a03c]" />
              <span>Authentic Ayurvedic Heritage Hub</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight max-w-3xl mx-auto mb-4 font-serif">
              Pure Ayur Media & Doctor Guides
            </h1>

            <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto leading-relaxed mb-8">
              Watch certified Ayurvedic Vaidyas explain clinical formulations, discover trending wellness Reels, and explore our GMP laboratory purity testing.
            </p>

            {/* Credibility Stats Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto pt-4 border-t border-white/10 text-left">
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-sm">
                <div className="p-2 rounded-xl bg-[#80a03c]/20 text-[#c7df8e]">
                  <Film className="size-4" />
                </div>
                <div>
                  <div className="text-base font-black text-white leading-tight">100+</div>
                  <div className="text-[10px] text-gray-300 font-medium">Doctor Video Guides</div>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-sm">
                <div className="p-2 rounded-xl bg-[#80a03c]/20 text-[#c7df8e]">
                  <ShieldCheck className="size-4" />
                </div>
                <div>
                  <div className="text-base font-black text-white leading-tight">100%</div>
                  <div className="text-[10px] text-gray-300 font-medium">AYUSH Certified Lab</div>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-sm">
                <div className="p-2 rounded-xl bg-[#80a03c]/20 text-[#c7df8e]">
                  <Users className="size-4" />
                </div>
                <div>
                  <div className="text-base font-black text-white leading-tight">50,000+</div>
                  <div className="text-[10px] text-gray-300 font-medium">Community Members</div>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-sm">
                <div className="p-2 rounded-xl bg-[#80a03c]/20 text-[#c7df8e]">
                  <CheckCircle2 className="size-4" />
                </div>
                <div>
                  <div className="text-base font-black text-white leading-tight">GMP Tested</div>
                  <div className="text-[10px] text-gray-300 font-medium">Heavy-Metal Free</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sticky Filter Bar */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#ddddd9] shadow-xs">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {categories.map((cat) => {
                const isActive = selectedCategory === cat.value;
                return (
                  <button
                    key={cat.value}
                    onClick={() => setSelectedCategory(cat.value)}
                    className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                      isActive
                        ? "bg-[#244f31] text-white shadow-sm"
                        : "bg-[#f4f7f2] hover:bg-[#eaf0e6] text-[#17231b] border border-[#ddddd9]"
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content Container */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-12">
          {/* Section 1: Shoppable Reels & Shorts (9:16) */}
          {reels.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-[#17231b] flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-pink-100 text-pink-700">
                      <Film className="size-4" />
                    </span>
                    <span>Trending Ayurvedic Reels & Shorts</span>
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Quick 30-60 second insights, doctor routines, and product guides. Click any reel to play.
                  </p>
                </div>
                {selectedCategory === "All" && (
                  <button
                    onClick={() => setSelectedCategory("Reels & Shorts")}
                    className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-[#244f31] hover:underline"
                  >
                    <span>View All Reels</span>
                    <ChevronRight className="size-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5">
                {reels.map((reel) => {
                  const taggedProduct = catalog.find((p) => p.id === reel.taggedProductId);

                  return (
                    <div
                      key={reel.id}
                      onClick={() => setActiveMediaModal(reel)}
                      className="group relative flex flex-col bg-white rounded-3xl border border-[#ddddd9] overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer"
                    >
                      {/* 9:16 Poster Box */}
                      <div className="relative aspect-[9/16] overflow-hidden bg-neutral-900">
                        <img
                          src={reel.thumbnail || "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&q=80"}
                          alt={reel.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10 group-hover:from-black/90 transition-colors" />

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                          <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-white/10">
                            <Clock className="size-3 text-[#80a03c]" />
                            <span>{reel.duration || "Short"}</span>
                          </span>

                          <button
                            type="button"
                            onClick={(e) => handleShare(reel, e)}
                            className="p-1.5 rounded-full bg-black/50 text-white hover:bg-black/80 transition"
                            title="Share Reel"
                          >
                            <Share2 className="size-3.5" />
                          </button>
                        </div>

                        {/* Centered Play Button */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="size-12 rounded-full bg-[#80a03c]/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-[#244f31] transition-transform duration-300">
                            <Play className="size-6 fill-white ml-1" />
                          </div>
                        </div>

                        {/* Bottom Text Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-3.5 text-white">
                          {reel.author && (
                            <div className="text-[10px] font-bold text-[#c7df8e] flex items-center gap-1 mb-1">
                              <User className="size-3" />
                              <span className="truncate">{reel.author}</span>
                            </div>
                          )}
                          <h3 className="text-xs font-black line-clamp-2 leading-snug">
                            {reel.title}
                          </h3>
                        </div>
                      </div>

                      {/* Tagged Shoppable Product Card Footer */}
                      {taggedProduct && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="p-3 bg-[#f8faf1] border-t border-[#ddddd9] flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <img
                              src={taggedProduct.image}
                              alt={taggedProduct.name}
                              className="size-8 rounded-lg object-cover border border-[#ddddd9] shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="text-[10px] font-bold text-[#17231b] truncate">
                                {taggedProduct.name}
                              </div>
                              <div className="text-[10px] font-black text-[#244f31]">
                                ₹{taggedProduct.price}
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleAddToCart(taggedProduct)}
                            className="bg-[#244f31] hover:bg-[#1c3e26] text-white p-2 rounded-xl text-[10px] font-bold shrink-0 transition shadow-xs flex items-center gap-1"
                            title="Add to Cart"
                          >
                            <ShoppingBag className="size-3" />
                            <span className="hidden sm:inline">Buy</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section 2: 16:9 Landscape Video Guides (Doctor Talks) */}
          {videos.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-[#17231b] flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-emerald-100 text-[#244f31]">
                      <Video className="size-4" />
                    </span>
                    <span>Doctor Consultations & Ayurvedic Science</span>
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Certified Vaidyas dive deep into herbal pharmacology, dietary regimens, and dosha balance.
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
                {videos.map((vid) => {
                  const taggedProduct = catalog.find((p) => p.id === vid.taggedProductId);

                  return (
                    <div
                      key={vid.id}
                      onClick={() => setActiveMediaModal(vid)}
                      className="group bg-white rounded-3xl border border-[#ddddd9] overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer"
                    >
                      <div>
                        {/* 16:9 Thumbnail Box */}
                        <div className="relative aspect-video overflow-hidden bg-neutral-900 border-b border-[#ddddd9]">
                          <img
                            src={vid.thumbnail || "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80"}
                            alt={vid.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />

                          {/* Centered Play Pill */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="size-12 rounded-full bg-white/90 text-[#244f31] flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-[#244f31] group-hover:text-white transition-all duration-300">
                              <Play className="size-5 fill-current ml-0.5" />
                            </div>
                          </div>

                          {/* Duration */}
                          {vid.duration && (
                            <span className="absolute bottom-2.5 right-2.5 bg-black/75 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                              {vid.duration}
                            </span>
                          )}
                        </div>

                        {/* Info Body */}
                        <div className="p-4">
                          <div className="flex items-center gap-2 text-[10px] font-bold text-[#80a03c] mb-1.5">
                            <span>{vid.category}</span>
                            <span>•</span>
                            <span>{vid.date}</span>
                          </div>

                          <h3 className="text-sm font-black text-[#17231b] leading-snug group-hover:text-[#244f31] transition line-clamp-2">
                            {vid.title}
                          </h3>

                          {vid.caption && (
                            <p className="text-xs text-gray-500 line-clamp-2 mt-2 leading-relaxed">
                              {vid.caption}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Tagged Product Link */}
                      {taggedProduct && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="p-3 bg-[#f8faf1] border-t border-[#ddddd9] flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <img
                              src={taggedProduct.image}
                              alt={taggedProduct.name}
                              className="size-8 rounded-lg object-cover border border-[#ddddd9] shrink-0"
                            />
                            <div className="min-w-0">
                              <span className="text-[10px] font-bold text-[#17231b] truncate block">
                                {taggedProduct.name}
                              </span>
                              <span className="text-[10px] font-black text-[#244f31]">
                                ₹{taggedProduct.price}
                              </span>
                            </div>
                          </div>

                          <Link
                            href={`/products/${taggedProduct.slug || taggedProduct.id}`}
                            className="bg-[#244f31] hover:bg-[#1c3e26] text-white px-3 py-1.5 rounded-xl text-[10px] font-bold shrink-0 transition"
                          >
                            View
                          </Link>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section 3: Photo Lightbox & Certificates */}
          {photos.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-[#17231b] flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
                      <ImageIcon className="size-4" />
                    </span>
                    <span>Lab Quality, Farm Sourcing & Certifications</span>
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Transparency is our pride. Click any photo to view full-resolution lab test reports and harvesting processes.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    onClick={() => setActivePhotoModal(photo)}
                    className="group relative aspect-square bg-white rounded-3xl border border-[#ddddd9] overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 cursor-pointer"
                  >
                    <img
                      src={photo.thumbnail || photo.url}
                      alt={photo.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end text-white">
                      <div className="text-[10px] font-bold text-[#c7df8e] mb-0.5">
                        {photo.category}
                      </div>
                      <h4 className="text-xs font-black line-clamp-2 leading-tight">
                        {photo.title}
                      </h4>
                      <div className="mt-2 flex items-center gap-1 text-[10px] text-white/80 font-bold">
                        <Maximize2 className="size-3" />
                        <span>Click to expand</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {filteredMedia.length === 0 && (
            <div className="p-12 text-center bg-white rounded-3xl border border-[#ddddd9]">
              <Film className="size-10 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-black text-[#17231b] mb-1">No media in this category yet</h3>
              <p className="text-xs text-gray-500 mb-5">Try selecting "All Media" to browse all videos, reels, and photos.</p>
              <button
                onClick={() => setSelectedCategory("All")}
                className="px-5 py-2.5 bg-[#244f31] text-white text-xs font-bold rounded-xl hover:bg-[#1c3e26] transition shadow-xs"
              >
                Reset to All Media
              </button>
            </div>
          )}

          {/* Consultation CTA Card */}
          <div className="bg-gradient-to-r from-[#244f31] to-[#1c3e26] rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
            <div className="space-y-2 text-center sm:text-left">
              <span className="inline-block bg-white/10 text-[#c7df8e] text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full">
                🌿 Need Personalized Advice?
              </span>
              <h3 className="text-xl sm:text-2xl font-black font-serif">
                Consult With Our Certified Ayurvedic Vaidyas
              </h3>
              <p className="text-xs text-gray-200 max-w-xl">
                Get a 1-on-1 personalized health evaluation based on your unique Prakriti (body constitution) and current health concerns.
              </p>
            </div>

            <a
              href="https://wa.me/917247824101?text=Namaste!%20I%20would%20like%20to%20consult%20with%20an%20Ayurvedic%20Doctor."
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white hover:bg-[#f4f7f2] text-[#244f31] px-6 py-3.5 rounded-xl font-black text-xs uppercase tracking-wider transition shrink-0 shadow-md flex items-center gap-2"
            >
              <span>Chat on WhatsApp</span>
              <ArrowRight className="size-4" />
            </a>
          </div>
        </div>

        {/* Video / Reel Playback Modal */}
        {activeMediaModal && (
          <div
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setActiveMediaModal(null)}
          >
            <div
              className={`relative bg-neutral-950 rounded-3xl overflow-hidden shadow-2xl border border-white/10 w-full max-h-[90vh] flex flex-col ${
                activeMediaModal.type === "reel" ? "max-w-sm" : "max-w-3xl"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-3.5 bg-neutral-900 border-b border-white/10 flex items-center justify-between text-white">
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  <span className="size-2 rounded-full bg-emerald-400 shrink-0" />
                  <h4 className="text-xs font-black truncate">{activeMediaModal.title}</h4>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveMediaModal(null)}
                  className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white transition shrink-0"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Video Player Box */}
              <div className={`relative bg-black ${activeMediaModal.type === "reel" ? "aspect-[9/16]" : "aspect-video"}`}>
                <iframe
                  src={getEmbedUrl(activeMediaModal.url)}
                  title={activeMediaModal.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              {/* Modal Details & Tagged Product */}
              <div className="p-4 bg-neutral-900 text-white space-y-3">
                {activeMediaModal.caption && (
                  <p className="text-xs text-gray-300 leading-relaxed">
                    {activeMediaModal.caption}
                  </p>
                )}

                {activeMediaModal.taggedProductId && (() => {
                  const prod = catalog.find((p) => p.id === activeMediaModal.taggedProductId);
                  if (!prod) return null;
                  return (
                    <div className="p-3 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <img src={prod.image} alt={prod.name} className="size-10 rounded-xl object-cover border border-white/10 shrink-0" />
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white truncate">{prod.name}</div>
                          <div className="text-xs font-black text-[#c7df8e]">₹{prod.price}</div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          handleAddToCart(prod);
                          setActiveMediaModal(null);
                        }}
                        className="bg-[#80a03c] hover:bg-[#6c8832] text-white px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-1.5 shadow"
                      >
                        <ShoppingBag className="size-3.5" />
                        <span>Add to Cart</span>
                      </button>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* Full-Screen Photo Lightbox Modal */}
        {activePhotoModal && (
          <div
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setActivePhotoModal(null)}
          >
            <div
              className="relative max-w-4xl max-h-[90vh] flex flex-col bg-neutral-950 rounded-3xl border border-white/10 overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-4 bg-neutral-900 border-b border-white/10 flex items-center justify-between text-white">
                <div>
                  <h4 className="text-sm font-black">{activePhotoModal.title}</h4>
                  {activePhotoModal.author && (
                    <span className="text-[10px] text-gray-400 font-medium">{activePhotoModal.author}</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setActivePhotoModal(null)}
                  className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Photo View */}
              <div className="p-2 flex items-center justify-center bg-black max-h-[70vh] overflow-hidden">
                <img
                  src={activePhotoModal.url}
                  alt={activePhotoModal.title}
                  className="max-h-[68vh] w-auto object-contain rounded-xl"
                />
              </div>

              {/* Caption */}
              {activePhotoModal.caption && (
                <div className="p-4 bg-neutral-900 border-t border-white/10 text-xs text-gray-300">
                  {activePhotoModal.caption}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <WhatsAppWidget />
      <SiteFooter />
    </main>
  );
}
