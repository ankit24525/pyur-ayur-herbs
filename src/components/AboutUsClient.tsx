"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  ShieldCheck,
  Award,
  HeartHandshake,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  Leaf,
  Users,
  Check,
  PhoneCall,
  X,
  User,
  FlaskConical,
} from "lucide-react";
import AnnouncementBar from "@/components/AnnouncementBar";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import GetAppModal from "@/components/GetAppModal";
import { Product } from "@/lib/store";
import { getStorefrontData } from "@/lib/storefront-client";

interface AboutUsClientProps {
  initialAboutData?: any;
}

export default function AboutUsClient({ initialAboutData }: AboutUsClientProps) {
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [appModalOpen, setAppModalOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [aboutData, setAboutData] = useState<any>(initialAboutData || null);

  // Sync prop changes from SSR
  useEffect(() => {
    if (initialAboutData) {
      setAboutData(initialAboutData);
    }
  }, [initialAboutData]);

  // Cross-tab real-time sync & background refresh
  useEffect(() => {
    // 1. Check local cache immediately on client mount
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("pyur_storefront_cache");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed?.content?.aboutUs) {
            setAboutData(parsed.content.aboutUs);
          }
        }
      } catch {}

      // 2. Fetch fresh storefront data from MongoDB in background
      getStorefrontData(true)
        .then((fresh) => {
          if (fresh?.content?.aboutUs) {
            setAboutData(fresh.content.aboutUs);
          }
        })
        .catch(() => {});
    }

    // Live update listener from Admin CMS
    const handleLiveUpdate = (e: any) => {
      if (e?.detail?.key === "content" && e.detail.value?.aboutUs) {
        setAboutData(e.detail.value.aboutUs);
      }
    };
    window.addEventListener("pyur_storefront_updated", handleLiveUpdate);

    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === "pyur_storefront_cache" && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed?.content?.aboutUs) {
            setAboutData(parsed.content.aboutUs);
          }
        } catch {}
      }
    };
    window.addEventListener("storage", handleStorageEvent);

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel("pyur_storefront_sync");
      channel.onmessage = (event) => {
        if (event?.data?.type === "SYNC" && event.data.key === "content" && event.data.value?.aboutUs) {
          setAboutData(event.data.value.aboutUs);
        }
      };
    } catch {}

    // Cart loading from localStorage
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("pyur_cart");
        if (stored) {
          setCart(JSON.parse(stored));
        }
      } catch (e) {
        console.error(e);
      }
    }

    return () => {
      window.removeEventListener("pyur_storefront_updated", handleLiveUpdate);
      window.removeEventListener("storage", handleStorageEvent);
      if (channel) {
        try {
          channel.close();
        } catch {}
      }
    };
  }, []);

  const saveCartState = (newCart: { product: Product; quantity: number }[]) => {
    setCart(newCart);
    try {
      localStorage.setItem("pyur_cart", JSON.stringify(newCart));
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    const nextCart = cart
      .map((item) => {
        if (item.product.id === id) {
          const nextQty = item.quantity + delta;
          return nextQty > 0 ? { ...item, quantity: nextQty } : null;
        }
        return item;
      })
      .filter(Boolean) as { product: Product; quantity: number }[];
    saveCartState(nextCart);
  };

  const handleRemoveItem = (id: string) => {
    const nextCart = cart.filter((item) => item.product.id !== id);
    saveCartState(nextCart);
  };

  // Content fallbacks matching db.json seeds
  const content = aboutData || initialAboutData || {
    badge: "OUR HERITAGE & PHILOSOPHY",
    title: "Rooted in Ancient Ayurveda, Perfected for Modern Living",
    subtitle:
      "At Pure Ayur Herbs, we bridge time-tested Vedic herbal wisdom with rigorous clinical purity to bring you 100% natural, potent, and safe Ayurvedic remedies.",
    storyBadge: "OUR SACRED JOURNEY",
    storyTitle: "Born from Pure Himalayan Forests & Traditional Vaidya Lineage",
    storyParagraph1:
      "Pure Ayur Herbs was founded with a single sacred conviction: true healing begins with nature's purest herbs, uncorrupted by chemicals, synthetic fillers, or artificial stimulants. Our journey started deep in the pristine valleys of the Himalayas and the dense botanical sanctuaries of India, where revered Ayurvedic vaidyas have harvested therapeutic herbs for millennia.",
    storyParagraph2:
      "Every formula we craft—from our signature Virja Energy Rasayana to Madhunashi Sugar Care—is developed following authentic classical Ayurvedic texts (Charaka Samhita and Sushruta Samhita), enriched with modern testing for zero heavy metals, microbiological purity, and optimal bio-availability.",
    heroImage:
      "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80",
    storyImage:
      "https://images.unsplash.com/photo-1512290900672-1f02e0ad0ba8?auto=format&fit=crop&w=800&q=80",
    missionTitle: "Our Sacred Mission",
    missionDesc:
      "To restore authentic holistic health and vitality across every Indian household through honest, certified, and uncompromisingly potent Ayurvedic formulations.",
    visionTitle: "Our Vision",
    visionDesc:
      "To become India's most trusted natural wellness sanctuary, empowering seekers to achieve peak physical, mental, and spiritual harmony through Vedic wisdom.",
    stats: [
      { value: "50,000+", label: "50,000+ Customers Served Across India" },
      { value: "100%", label: "Pure Natural Botanicals" },
      { value: "15+", label: "Certified Ayurvedic Vaidyas" },
      { value: "GMP & AYUSH", label: "Certified Manufacturing" },
    ],
    pillars: [
      {
        icon: "🌿",
        title: "100% Himalayan Herbs",
        description:
          "Wildcrafted and ethically sourced directly from organic regional farms and Himalayan valleys at peak botanical potency.",
      },
      {
        icon: "🛡️",
        title: "AYUSH & GMP Certified",
        description:
          "Formulated in state-of-the-art GMP certified facilities meeting stringent national and global Ayurvedic safety standards.",
      },
      {
        icon: "👨‍⚕️",
        title: "Formulated by Vaidyas",
        description:
          "Every batch is supervised, verified, and dosha-balanced by senior Ayurvedic doctors with decades of clinical experience.",
      },
      {
        icon: "🔬",
        title: "Clinically Pure & Safe",
        description:
          "Zero heavy metals, zero steroids, zero parabens, and 100% vegetarian plant extracts for lifelong, side-effect-free wellness.",
      },
    ],
    founderName: "Dr. Ananya Sharma (BAMS)",
    founderTitle: "Senior Ayurvedic Vaidya & Chief Research Director",
    founderMessage:
      "In a modern world flooded with synthetic quick-fixes, our ancient sages gifted us the science of longevity. Pure Ayur Herbs is our sacred promise to deliver that timeless Vedic wisdom with total honesty, supreme herb purity, and genuine compassion for your well-being.",
    founderImage:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80",
    ctaTitle: "Begin Your Natural Healing Journey Today",
    ctaSubtitle:
      "Explore our classical Ayurvedic formulations or speak with our certified Vaidyas for free guidance.",
    ctaButtonText: "Shop All Remedies",
    ctaButtonLink: "/#products",
  };

  const pillars = Array.isArray(content.pillars) && content.pillars.length > 0 ? content.pillars : [];
  const stats = Array.isArray(content.stats) && content.stats.length > 0 ? content.stats : [];

  return (
    <main className="min-h-screen bg-[#f8faf1] text-[#17231b] flex flex-col justify-between">
      <div>
        {/* Top Announcement Bar */}
        <AnnouncementBar onOpenAppModal={() => setAppModalOpen(true)} />

        {/* Header with Cart & Navigation */}
        <SiteHeader
          cart={cart}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onOpenAppModal={() => setAppModalOpen(true)}
          onOpenLoginModal={() => setLoginModalOpen(true)}
        />

        {/* Breadcrumb Navigation */}
        <div className="bg-white border-b border-[#ddddd9]">
          <div className="mx-auto max-w-[1440px] px-4 py-3 sm:px-6 md:px-8">
            <nav className="flex items-center gap-2 text-xs font-semibold text-[#666666]">
              <Link href="/" className="hover:text-[#244f31] transition">
                Home
              </Link>
              <ChevronRight className="size-3 text-neutral-400" />
              <span className="text-[#244f31] font-bold">About Us</span>
            </nav>
          </div>
        </div>

        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-white via-[#f8faf1] to-[#f8faf1] py-14 sm:py-20 border-b border-[#ddddd9]">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-6 md:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#eef5df] text-[#244f31] border border-[#80a03c]/30 text-xs font-black uppercase tracking-widest mb-4 shadow-2xs">
                <Sparkles className="size-3.5 text-[#80a03c]" />
                <span>{content.badge || "OUR HERITAGE & PHILOSOPHY"}</span>
              </span>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-[#17231b] leading-tight sm:leading-tight">
                {content.title || "Rooted in Ancient Ayurveda, Perfected for Modern Living"}
              </h1>

              <p className="mt-4 sm:mt-5 text-sm sm:text-base text-[#555555] leading-relaxed max-w-2xl mx-auto font-medium">
                {content.subtitle ||
                  "At Pure Ayur Herbs, we bridge time-tested Vedic herbal wisdom with rigorous clinical purity to bring you 100% natural, potent, and safe Ayurvedic remedies."}
              </p>

              {/* Quick Trust Highlights Pill Bar */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs font-bold text-[#244f31]">
                <span className="inline-flex items-center gap-1.5 bg-white border border-[#ddddd9] px-3.5 py-1.5 rounded-full shadow-2xs">
                  <ShieldCheck className="size-4 text-[#80a03c]" />
                  <span>Ministry of AYUSH Licensed</span>
                </span>
                <span className="inline-flex items-center gap-1.5 bg-white border border-[#ddddd9] px-3.5 py-1.5 rounded-full shadow-2xs">
                  <Award className="size-4 text-[#80a03c]" />
                  <span>GMP Certified Facility</span>
                </span>
                <span className="inline-flex items-center gap-1.5 bg-white border border-[#ddddd9] px-3.5 py-1.5 rounded-full shadow-2xs">
                  <HeartHandshake className="size-4 text-[#80a03c]" />
                  <span>100% Pure Plant Actives</span>
                </span>
              </div>
            </div>

            {/* Hero Visual Showcase */}
            {content.heroImage && (
              <div className="mt-12 max-w-4xl mx-auto rounded-3xl overflow-hidden border border-[#ddddd9] shadow-xl relative aspect-16/9 sm:aspect-21/9">
                <Image
                  src={content.heroImage}
                  alt={content.title || "Pure Ayur Herbs Botanical Sanctuary"}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 1200px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6 sm:p-8">
                  <div className="text-white max-w-lg">
                    <span className="text-[11px] font-black uppercase tracking-widest text-[#f2c94c] block mb-1">
                      BOTANICAL PURITY GUARANTEE
                    </span>
                    <p className="text-xs sm:text-sm font-medium text-neutral-200">
                      Sourced directly from Himalayan foothills, organic herbal farms, and sacred forests across India.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Brand Story & Vedic Lineage */}
        <section className="py-14 sm:py-20 bg-white border-b border-[#ddddd9]">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-6 md:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              {/* Left Column: Story Imagery */}
              <div className="lg:col-span-5">
                <div className="relative rounded-3xl overflow-hidden border border-[#ddddd9] shadow-lg aspect-4/5">
                  <Image
                    src={
                      content.storyImage ||
                      "https://images.unsplash.com/photo-1512290900672-1f02e0ad0ba8?auto=format&fit=crop&w=800&q=80"
                    }
                    alt="Authentic Ayurvedic Heritage"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 500px"
                  />
                  <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-xs p-4 rounded-2xl border border-white/40 shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-xl bg-[#244f31] flex items-center justify-center text-white shrink-0">
                        <Leaf className="size-5 text-[#f2c94c]" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-[#17231b]">Original Classical Shastras</div>
                        <div className="text-[11px] text-[#666666]">Charaka & Sushruta Samhita Formulations</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Narrative */}
              <div className="lg:col-span-7 space-y-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#eef5df] text-[#244f31] text-xs font-black uppercase tracking-widest">
                  {content.storyBadge || "OUR SACRED JOURNEY"}
                </span>

                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-[#17231b] leading-snug">
                  {content.storyTitle || "Born from Pure Himalayan Forests & Traditional Vaidya Lineage"}
                </h2>

                <div className="space-y-4 text-xs sm:text-sm text-[#555555] leading-relaxed font-normal">
                  <p>
                    {content.storyParagraph1 ||
                      "Pure Ayur Herbs was founded with a single sacred conviction: true healing begins with nature's purest herbs, uncorrupted by chemicals, synthetic fillers, or artificial stimulants. Our journey started deep in the pristine valleys of the Himalayas and the dense botanical sanctuaries of India, where revered Ayurvedic vaidyas have harvested therapeutic herbs for millennia."}
                  </p>
                  <p>
                    {content.storyParagraph2 ||
                      "Every formula we craft—from our signature Virja Energy Rasayana to Madhunashi Sugar Care—is developed following authentic classical Ayurvedic texts (Charaka Samhita and Sushruta Samhita), enriched with modern testing for zero heavy metals, microbiological purity, and optimal bio-availability."}
                  </p>
                </div>

                {/* Mission & Vision Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="bg-[#f8faf1] border border-[#ddddd9] p-5 rounded-2xl shadow-2xs">
                    <div className="size-8 rounded-lg bg-[#244f31] text-white flex items-center justify-center mb-3">
                      <Award className="size-4 text-[#f2c94c]" />
                    </div>
                    <h3 className="text-xs sm:text-sm font-black text-[#17231b]">
                      {content.missionTitle || "Our Sacred Mission"}
                    </h3>
                    <p className="mt-1.5 text-[11px] sm:text-xs text-[#666666] leading-relaxed">
                      {content.missionDesc ||
                        "To restore authentic holistic health and vitality across every Indian household through honest, certified, and uncompromisingly potent Ayurvedic formulations."}
                    </p>
                  </div>

                  <div className="bg-[#f8faf1] border border-[#ddddd9] p-5 rounded-2xl shadow-2xs">
                    <div className="size-8 rounded-lg bg-[#244f31] text-white flex items-center justify-center mb-3">
                      <Sparkles className="size-4 text-[#80a03c]" />
                    </div>
                    <h3 className="text-xs sm:text-sm font-black text-[#17231b]">
                      {content.visionTitle || "Our Vision"}
                    </h3>
                    <p className="mt-1.5 text-[11px] sm:text-xs text-[#666666] leading-relaxed">
                      {content.visionDesc ||
                        "To become India's most trusted natural wellness sanctuary, empowering seekers to achieve peak physical, mental, and spiritual harmony through Vedic wisdom."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quantitative Proof Stats */}
        {stats.length > 0 && (
          <section className="py-12 bg-[#244f31] text-white">
            <div className="mx-auto max-w-[1440px] px-4 sm:px-6 md:px-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center divide-x-0 md:divide-x divide-white/10">
                {stats.map((st: any, i: number) => (
                  <div key={i} className="px-2">
                    <div className="text-2xl sm:text-3xl md:text-4xl font-black text-[#f2c94c] tracking-tight">
                      {st.value}
                    </div>
                    <div className="text-xs text-neutral-300 font-semibold mt-1.5">
                      {st.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* The 4 Sacred Purity Pillars */}
        {pillars.length > 0 && (
          <section className="py-14 sm:py-20 bg-[#f8faf1] border-b border-[#ddddd9]">
            <div className="mx-auto max-w-[1440px] px-4 sm:px-6 md:px-8">
              <div className="text-center max-w-2xl mx-auto mb-12">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#ddddd9] text-[#244f31] text-xs font-black uppercase tracking-widest mb-3">
                  UNCOMPROMISING STANDARDS
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-[#17231b]">
                  The 4 Pillars of Pure Ayur Integrity
                </h2>
                <p className="mt-3 text-xs sm:text-sm text-[#666666]">
                  Every jar, powder, tonic, and capsule is held to the highest standard of holistic Ayurvedic medicine.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {pillars.map((pillar: any, i: number) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl border border-[#ddddd9] p-6 shadow-xs hover:shadow-md hover:border-[#80a03c]/40 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="size-12 rounded-2xl bg-[#eef5df] flex items-center justify-center text-2xl mb-4 border border-[#80a03c]/20">
                        {pillar.icon || "🌿"}
                      </div>
                      <h3 className="text-sm sm:text-base font-black text-[#17231b]">
                        {pillar.title}
                      </h3>
                      <p className="mt-2 text-xs text-[#666666] leading-relaxed font-normal">
                        {pillar.description}
                      </p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-[#ddddd9]/60 flex items-center gap-1.5 text-[11px] font-bold text-[#244f31]">
                      <CheckCircle2 className="size-3.5 text-[#80a03c]" />
                      <span>Verified Standard</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Founder / Medical Director Quote */}
        {content.founderMessage && (
          <section className="py-14 sm:py-20 bg-white border-b border-[#ddddd9]">
            <div className="mx-auto max-w-[1440px] px-4 sm:px-6 md:px-8">
              <div className="max-w-4xl mx-auto bg-gradient-to-br from-[#f8faf1] to-white rounded-3xl border border-[#ddddd9] p-8 sm:p-12 shadow-sm relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                  {content.founderImage && (
                    <div className="size-28 sm:size-36 rounded-full overflow-hidden border-4 border-[#244f31] shadow-md shrink-0 relative">
                      <Image
                        src={content.founderImage}
                        alt={content.founderName || "Ayurvedic Doctor"}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 150px, 200px"
                      />
                    </div>
                  )}
                  <div className="space-y-4 text-center md:text-left">
                    <span className="text-[10px] font-black tracking-widest uppercase text-[#80a03c] block">
                      CHIEF VAIDYA&apos;S PLEDGE
                    </span>
                    <blockquote className="text-sm sm:text-base md:text-lg font-bold text-[#17231b] leading-relaxed italic">
                      &ldquo;{content.founderMessage}&rdquo;
                    </blockquote>
                    <div>
                      <div className="text-sm font-black text-[#244f31]">
                        {content.founderName || "Dr. Ananya Sharma (BAMS)"}
                      </div>
                      <div className="text-xs text-[#666666]">
                        {content.founderTitle || "Senior Ayurvedic Vaidya & Chief Research Director"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Clinical & Quality Badges Grid */}
        <section className="py-12 bg-[#f8faf1] border-b border-[#ddddd9]">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-6 md:px-8 text-center">
            <div className="text-xs font-bold uppercase tracking-widest text-[#666666] mb-6">
              Certified by India&apos;s Leading Herbal Laboratories & Regulatory Councils
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4 max-w-4xl mx-auto">
              {[
                { icon: "📜", label: "Ministry of AYUSH", sub: "Licensed Formulations" },
                { icon: "🏭", label: "GMP Certified", sub: "Good Manufacturing" },
                { icon: "🌿", label: "100% Vegetarian", sub: "Clean Plant Actives" },
                { icon: "🐰", label: "Cruelty-Free", sub: "Never Tested on Animals" },
                { icon: "🧪", label: "Zero Heavy Metals", sub: "NABL Certified Safe" },
                { icon: "🇮🇳", label: "Made in India", sub: "Vedic Heritage" },
              ].map((badge, i) => (
                <div key={i} className="bg-white rounded-xl border border-[#ddddd9] p-3.5 shadow-2xs">
                  <div className="text-2xl mb-1">{badge.icon}</div>
                  <div className="text-xs font-black text-[#17231b]">{badge.label}</div>
                  <div className="text-[10px] text-[#666666]">{badge.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom CTA Banner */}
        <section className="py-16 sm:py-20 bg-gradient-to-r from-[#1d3b24] via-[#244f31] to-[#122c1b] text-white text-center">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <span className="inline-block bg-[#80a03c] text-white text-[11px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full mb-4">
              EMBRACE TOTAL WELLNESS
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight">
              {content.ctaTitle || "Begin Your Natural Healing Journey Today"}
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-neutral-200 max-w-xl mx-auto leading-relaxed">
              {content.ctaSubtitle ||
                "Explore our classical Ayurvedic formulations or speak with our certified Vaidyas for free personalized guidance."}
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href={content.ctaButtonLink || "/#products"}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#f2c94c] hover:bg-[#e0b83b] text-[#17231b] px-8 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition shadow-lg cursor-pointer"
              >
                <span>{content.ctaButtonText || "Shop All Remedies"}</span>
                <ArrowRight className="size-4" />
              </Link>

              <Link
                href="/contact-us"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-transparent hover:bg-white/10 text-white border border-white/50 px-7 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer"
              >
                <PhoneCall className="size-4 text-emerald-300" />
                <span>Contact Our Vaidyas</span>
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* Main Footer */}
      <SiteFooter />

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
    </main>
  );
}
