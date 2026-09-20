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
  Smartphone,
  User,
  FlaskConical,
} from "lucide-react";
import AnnouncementBar from "@/components/AnnouncementBar";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Product } from "@/lib/store";
import { getStorefrontData } from "@/lib/storefront-client";

export default function AboutUsPage() {
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [appModalOpen, setAppModalOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [aboutData, setAboutData] = useState<any>(null);

  // Load live data from storefront client
  useEffect(() => {
    getStorefrontData()
      .then((data) => {
        if (data?.content?.aboutUs) {
          setAboutData(data.content.aboutUs);
        }
      })
      .catch((e) => console.error("Error loading About Us content:", e));

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
  const content = aboutData || {
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
      { value: "50,000+", label: "Seekers Healed Across India" },
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
            </div>

            {/* Hero Panoramic Image with Quality Badges */}
            <div className="mt-10 sm:mt-14 relative rounded-3xl overflow-hidden border border-[#ddddd9] shadow-xl aspect-16/9 sm:aspect-21/9 max-h-[480px]">
              <Image
                src={
                  content.heroImage ||
                  "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80"
                }
                alt="Pure Ayur Herbs Botanical Sanctuaries"
                width={1400}
                height={600}
                unoptimized
                priority
                className="size-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 sm:bottom-8 sm:left-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-white">
                <div>
                  <span className="inline-block bg-[#80a03c] text-white text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-2">
                    Ayurvedic Classical Standards
                  </span>
                  <h3 className="text-lg sm:text-2xl font-bold drop-shadow-sm">
                    Sustainably Wildcrafted in the Pristine Himalayas
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold border border-white/30">
                    <ShieldCheck className="size-4 text-emerald-300" />
                    <span>AYUSH Licensed</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold border border-white/30">
                    <Award className="size-4 text-amber-300" />
                    <span>GMP Certified</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {stats.map((st: any, idx: number) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-[#ddddd9] p-5 sm:p-6 text-center shadow-xs hover:shadow-md transition hover:-translate-y-0.5"
                >
                  <div className="text-2xl sm:text-3xl md:text-4xl font-black text-[#244f31] tracking-tight">
                    {st.value}
                  </div>
                  <div className="text-xs text-[#666666] font-semibold mt-1.5">
                    {st.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Our Sacred Journey & Heritage Story */}
        <section className="py-16 sm:py-24 bg-white border-b border-[#ddddd9]">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-6 md:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
              {/* Left Column: Visual Story */}
              <div className="lg:col-span-5 relative">
                <div className="relative rounded-3xl overflow-hidden border border-[#ddddd9] shadow-lg aspect-4/3 sm:aspect-5/4">
                  <Image
                    src={
                      content.storyImage ||
                      "https://images.unsplash.com/photo-1512290900672-1f02e0ad0ba8?auto=format&fit=crop&w=800&q=80"
                    }
                    alt="Ayurvedic Heritage Botanical Formulation"
                    width={700}
                    height={550}
                    unoptimized
                    className="size-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-300 block mb-1">
                      Tradition Meets Science
                    </span>
                    <p className="text-xs text-neutral-200">
                      Cold-processed extraction preserving maximum therapeutic bio-potency.
                    </p>
                  </div>
                </div>

                {/* Floating Trust Seal */}
                <div className="absolute -bottom-6 -right-3 sm:-right-6 bg-white border border-[#244f31]/20 rounded-2xl p-4 shadow-xl flex items-center gap-3.5 max-w-[240px]">
                  <div className="size-11 rounded-full bg-[#eef5df] flex items-center justify-center text-[#244f31] shrink-0 font-bold">
                    <ShieldCheck className="size-6 text-[#244f31]" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-[#17231b]">100% Ayurvedic</div>
                    <div className="text-[10px] text-[#666666]">Tested for Purity & Safety</div>
                  </div>
                </div>
              </div>

              {/* Right Column: Story Narrative */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <span className="text-xs font-black uppercase tracking-widest text-[#80a03c] block mb-2">
                    {content.storyBadge || "OUR SACRED JOURNEY"}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-[#17231b] tracking-tight leading-snug">
                    {content.storyTitle || "Born from Pure Himalayan Forests & Traditional Vaidya Lineage"}
                  </h2>
                </div>

                <div className="space-y-4 text-xs sm:text-sm text-[#555555] leading-relaxed">
                  <p>
                    {content.storyParagraph1 ||
                      "Pure Ayur Herbs was founded with a single sacred conviction: true healing begins with nature's purest herbs, uncorrupted by chemicals, synthetic fillers, or artificial stimulants. Our journey started deep in the pristine valleys of the Himalayas and the dense botanical sanctuaries of India, where revered Ayurvedic vaidyas have harvested therapeutic herbs for millennia."}
                  </p>
                  <p>
                    {content.storyParagraph2 ||
                      "Every formula we craft—from our signature Virja Energy Rasayana to Madhunashi Sugar Care—is developed following authentic classical Ayurvedic texts (Charaka Samhita and Sushruta Samhita), enriched with modern testing for zero heavy metals, microbiological purity, and optimal bio-availability."}
                  </p>
                </div>

                {/* Mission & Vision Dual Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="bg-[#f8faf1] rounded-2xl border border-[#ddddd9] p-5">
                    <div className="size-8 rounded-lg bg-[#244f31] text-white flex items-center justify-center text-sm font-black mb-2.5">
                      🎯
                    </div>
                    <h4 className="font-black text-sm text-[#17231b]">
                      {content.missionTitle || "Our Sacred Mission"}
                    </h4>
                    <p className="text-xs text-[#666666] mt-1.5 leading-relaxed">
                      {content.missionDesc ||
                        "To restore authentic holistic health and vitality across every Indian household through honest, certified, and potent Ayurvedic formulations."}
                    </p>
                  </div>

                  <div className="bg-[#f8faf1] rounded-2xl border border-[#ddddd9] p-5">
                    <div className="size-8 rounded-lg bg-[#80a03c] text-white flex items-center justify-center text-sm font-black mb-2.5">
                      👁️
                    </div>
                    <h4 className="font-black text-sm text-[#17231b]">
                      {content.visionTitle || "Our Vision"}
                    </h4>
                    <p className="text-xs text-[#666666] mt-1.5 leading-relaxed">
                      {content.visionDesc ||
                        "To become India's most trusted natural wellness sanctuary, empowering seekers to achieve peak harmony through Vedic wisdom."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4 Core Pillars of Purity */}
        <section className="py-16 sm:py-24 bg-[#f8faf1] border-b border-[#ddddd9]">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-6 md:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
              <span className="text-xs font-black uppercase tracking-widest text-[#80a03c] block mb-2">
                UNCOMPROMISING STANDARDS
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#17231b] tracking-tight">
                The 4 Pillars of Pure Ayur Herbs
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-[#666666]">
                Every tablet, majun, powder, and tonic follows our strict four-fold purity benchmark.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
              {pillars.map((pillar: any, idx: number) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-[#ddddd9] p-6 sm:p-7 shadow-xs hover:shadow-lg hover:border-[#80a03c] transition group"
                >
                  <div className="size-14 rounded-2xl bg-[#f8faf1] border border-[#ddddd9] flex items-center justify-center text-2xl mb-4 group-hover:scale-110 group-hover:bg-[#eef5df] transition">
                    {pillar.icon || "🌿"}
                  </div>
                  <h3 className="text-base font-black text-[#17231b] mb-2">
                    {pillar.title}
                  </h3>
                  <p className="text-xs text-[#666666] leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Chief Vaidya / Founder Note */}
        {content.founderMessage && (
          <section className="py-16 sm:py-20 bg-white border-b border-[#ddddd9]">
            <div className="mx-auto max-w-4xl px-4 sm:px-6">
              <div className="bg-[#f8faf1] border border-[#d8e4bd] rounded-3xl p-6 sm:p-10 shadow-sm flex flex-col md:flex-row items-center gap-6 sm:gap-8">
                {content.founderImage && (
                  <div className="relative size-24 sm:size-28 rounded-full overflow-hidden border-3 border-[#80a03c] shrink-0 shadow-md">
                    <Image
                      src={content.founderImage}
                      alt={content.founderName || "Chief Research Vaidya"}
                      width={120}
                      height={120}
                      unoptimized
                      className="size-full object-cover"
                    />
                  </div>
                )}
                <div className="text-center md:text-left flex-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#80a03c] bg-[#eef5df] px-2.5 py-0.5 rounded-full border border-emerald-200 inline-block mb-3">
                    MESSAGE FROM OUR CHIEF VAIDYA
                  </span>
                  <blockquote className="text-sm sm:text-base italic text-[#17231b] font-medium leading-relaxed">
                    &ldquo;{content.founderMessage}&rdquo;
                  </blockquote>
                  <div className="mt-4 pt-3 border-t border-[#ddddd9]">
                    <h4 className="text-sm font-black text-[#244f31]">
                      {content.founderName || "Dr. Ananya Sharma (BAMS)"}
                    </h4>
                    <p className="text-xs text-[#666666]">
                      {content.founderTitle || "Senior Ayurvedic Vaidya & Chief Research Director"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Trust Badges Strip */}
        <section className="py-12 bg-[#f8faf1] border-b border-[#ddddd9]">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-6 md:px-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
              {[
                { icon: "🌿", label: "100% Herbal Extracts", sub: "Wildcrafted" },
                { icon: "📜", label: "AYUSH Certified", sub: "Govt. of India" },
                { icon: "🏭", label: "GMP Facility", sub: "Cleanroom Grade" },
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
            <h3 className="text-xl font-black text-[#17231b]">Download Pure Ayur App</h3>
            <p className="mt-2 text-xs text-[#666666]">
              Get 15% OFF on app-first orders & earn 2X Pure Coins on every purchase!
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
