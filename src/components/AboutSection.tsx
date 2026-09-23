"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Sparkles, ShieldCheck, ArrowRight } from "lucide-react";
import { getStorefrontData } from "@/lib/storefront-client";

interface AboutSectionProps {
  cmsAboutUs?: any;
}

export default function AboutSection({ cmsAboutUs }: AboutSectionProps) {
  const [clientAboutUs, setClientAboutUs] = useState<any>(cmsAboutUs || null);

  // Sync prop changes from SSR / parent page
  useEffect(() => {
    if (cmsAboutUs) {
      setClientAboutUs(cmsAboutUs);
    }
  }, [cmsAboutUs]);

  // Real-time synchronization: local cache, background API fetch, and cross-tab broadcasts
  useEffect(() => {
    // Fetch fresh storefront data in background to sync latest from MongoDB
    if (typeof window !== "undefined") {
      getStorefrontData(true)
        .then((fresh) => {
          if (fresh?.content?.aboutUs) {
            setClientAboutUs(fresh.content.aboutUs);
          }
        })
        .catch(() => {});
    }

    const handleLiveUpdate = (e: any) => {
      if (e?.detail?.key === "content" && e.detail.value?.aboutUs) {
        setClientAboutUs(e.detail.value.aboutUs);
      }
    };
    window.addEventListener("pyur_storefront_updated", handleLiveUpdate);

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel("pyur_storefront_sync");
      channel.onmessage = (event) => {
        if (event?.data?.type === "SYNC" && event.data.key === "content" && event.data.value?.aboutUs) {
          setClientAboutUs(event.data.value.aboutUs);
        }
      };
    } catch {}

    return () => {
      window.removeEventListener("pyur_storefront_updated", handleLiveUpdate);
      if (channel) {
        try {
          channel.close();
        } catch {}
      }
    };
  }, []);

  const activeAbout = clientAboutUs || cmsAboutUs;
  const data = activeAbout || {
    badge: "OUR HERITAGE & PHILOSOPHY",
    title: "Rooted in Ancient Ayurveda, Perfected for Modern Living",
    subtitle: "At Pure Ayur Herbs, we bridge time-tested Vedic herbal wisdom with rigorous clinical purity to bring you 100% natural, potent, and safe Ayurvedic remedies.",
    stats: [
      { value: "50,000+", label: "50,000+ Customers Served Across India" },
      { value: "100%", label: "Pure Natural Botanicals" },
      { value: "15+", label: "Certified Ayurvedic Vaidyas" },
      { value: "GMP & AYUSH", label: "Certified Manufacturing" }
    ],
    pillars: [
      {
        icon: "🌿",
        title: "100% Himalayan Herbs",
        description: "Wildcrafted and ethically sourced directly from organic regional farms and Himalayan valleys at peak botanical potency."
      },
      {
        icon: "🛡️",
        title: "AYUSH & GMP Certified",
        description: "Formulated in state-of-the-art GMP certified facilities meeting stringent national and global Ayurvedic safety standards."
      },
      {
        icon: "👨‍⚕️",
        title: "Formulated by Vaidyas",
        description: "Every batch is supervised, verified, and dosha-balanced by senior Ayurvedic doctors with decades of clinical experience."
      },
      {
        icon: "🔬",
        title: "Clinically Pure & Safe",
        description: "Zero heavy metals, zero steroids, zero parabens, and 100% vegetarian plant extracts for lifelong, side-effect-free wellness."
      }
    ],
    storyImage: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80",
    founderName: "Dr. Ananya Sharma (BAMS)",
    founderTitle: "Senior Ayurvedic Vaidya & Chief Research Director",
    founderMessage: "In a modern world flooded with synthetic quick-fixes, our ancient sages gifted us the science of longevity. Pure Ayur Herbs is our sacred promise to deliver that timeless Vedic wisdom with total honesty, supreme herb purity, and genuine compassion for your well-being.",
    founderImage: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=300&q=80"
  };

  const pillars = Array.isArray(data.pillars) && data.pillars.length > 0 ? data.pillars : [
    { icon: "🌿", title: "100% Himalayan Herbs", description: "Wildcrafted at peak potency from sacred Himalayan valleys." },
    { icon: "🛡️", title: "AYUSH & GMP Certified", description: "Manufactured in certified cleanroom laboratories." },
    { icon: "👨‍⚕️", title: "Formulated by Vaidyas", description: "Clinically balanced by Ayurvedic scholars with decades of care." },
    { icon: "🔬", title: "Zero Heavy Metals", description: "100% vegetarian, thoroughly tested for complete safety." }
  ];

  const stats = Array.isArray(data.stats) && data.stats.length > 0 ? data.stats : [
    { value: "50,000+", label: "Seekers Healed" },
    { value: "100%", label: "Pure Botanicals" },
    { value: "15+", label: "Ayurvedic Doctors" },
    { value: "AYUSH", label: "Certified Grade" }
  ];

  const DEFAULT_STORY_IMAGE = "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80";
  const [imgSrc, setImgSrc] = useState(
    data.storyImage && data.storyImage.trim() !== "" ? data.storyImage : DEFAULT_STORY_IMAGE
  );

  useEffect(() => {
    if (data.storyImage && data.storyImage.trim() !== "") {
      setImgSrc(data.storyImage);
    } else {
      setImgSrc(DEFAULT_STORY_IMAGE);
    }
  }, [data.storyImage]);

  return (
    <section id="about" className="relative bg-[#f8faf1] py-14 sm:py-20 border-t border-[#ddddd9] overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-emerald-100/40 rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 md:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#eef5df] text-[#244f31] border border-[#80a03c]/30 text-[11px] font-black uppercase tracking-widest mb-3">
            <Sparkles className="size-3 text-[#80a03c]" />
            <span>{data.badge || "OUR HERITAGE & PHILOSOPHY"}</span>
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-[#17231b] leading-tight">
            {data.title || "Rooted in Ancient Ayurveda, Perfected for Modern Living"}
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-[#555555] leading-relaxed max-w-2xl mx-auto">
            {data.subtitle || "At Pure Ayur Herbs, we bridge time-tested Vedic herbal wisdom with rigorous clinical purity to bring you 100% natural, potent, and safe Ayurvedic remedies."}
          </p>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5 mb-12 sm:mb-16">
          {stats.slice(0, 4).map((st: any, idx: number) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-[#ddddd9] p-4 sm:p-6 text-center shadow-xs hover:shadow-md transition hover:-translate-y-0.5"
            >
              <div className="text-xl sm:text-2xl md:text-3xl font-black text-[#244f31] tracking-tight">
                {st.value}
              </div>
              <div className="text-[11px] sm:text-xs text-[#666666] font-semibold mt-1">
                {st.label}
              </div>
            </div>
          ))}
        </div>

        {/* Two-Column Story & Purity Pillars Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center mb-12 sm:mb-16">
          {/* Left Column: Image with Floating Vaidya Badge */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden border border-[#ddddd9] shadow-lg aspect-4/3 sm:aspect-5/4">
              <Image
                src={imgSrc}
                alt="Pure Ayur Herbs Ayurvedic Botanical Extraction"
                width={700}
                height={550}
                unoptimized
                onError={() => {
                  if (imgSrc !== DEFAULT_STORY_IMAGE) {
                    setImgSrc(DEFAULT_STORY_IMAGE);
                  }
                }}
                className="size-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="inline-block bg-[#80a03c] text-white text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full mb-1">
                  {data.extractionBadge || "100% AYUSH CERTIFIED"}
                </span>
                <h4 className="text-sm sm:text-base font-bold text-white drop-shadow-sm">
                  {data.extractionTitle || "Traditional Classical Extraction Process"}
                </h4>
                <p className="text-[11px] text-neutral-200 line-clamp-2">
                  {data.extractionDescription || "Preserving vital prana and active herbal bio-compounds without synthetic additives."}
                </p>
              </div>
            </div>

            {/* Floating Quality Guarantee Seal */}
            <div className="absolute -bottom-5 -right-3 sm:-right-5 bg-white border border-[#244f31]/20 rounded-2xl p-3 sm:p-4 shadow-xl flex items-center gap-3 max-w-[220px]">
              <div className="size-10 rounded-full bg-[#eef5df] flex items-center justify-center text-[#244f31] shrink-0 font-bold">
                <ShieldCheck className="size-5 text-[#244f31]" />
              </div>
              <div>
                <div className="text-xs font-black text-[#17231b]">
                  {data.guaranteeTitle || "Zero Heavy Metals"}
                </div>
                <div className="text-[10px] text-[#666666]">
                  {data.guaranteeSubtitle || "NABL Lab Tested & Certified Safe"}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: 4 Core Pillars Grid */}
          <div className="lg:col-span-7 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {pillars.map((pillar: any, idx: number) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-[#ddddd9] p-5 shadow-xs hover:border-[#80a03c] transition group"
                >
                  <div className="size-10 rounded-xl bg-[#f8faf1] border border-[#ddddd9] flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition">
                    {pillar.icon || "🌿"}
                  </div>
                  <h4 className="text-sm font-black text-[#17231b]">
                    {pillar.title}
                  </h4>
                  <p className="mt-1.5 text-xs text-[#666666] leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Founder / Vaidya Quote Highlight */}
            {data.founderMessage && (
              <div className="mt-6 bg-[#eef5df]/70 rounded-2xl border border-[#80a03c]/30 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {data.founderImage && (
                  <div className="relative size-14 rounded-full overflow-hidden border-2 border-[#80a03c] shrink-0 shadow-xs">
                    <Image
                      src={data.founderImage}
                      alt={data.founderName || "Chief Vaidya"}
                      width={64}
                      height={64}
                      unoptimized
                      className="size-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-xs italic text-[#244f31] font-medium leading-relaxed">
                    &ldquo;{data.founderMessage}&rdquo;
                  </p>
                  <div className="mt-2 text-xs font-black text-[#17231b]">
                    {data.founderName || "Dr. Ananya Sharma (BAMS)"}
                    <span className="text-[10px] font-normal text-[#666666] block sm:inline sm:ml-2">
                      {data.founderTitle || "Chief Research Vaidya"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom CTA Row: Direct Navigation to Full About Page */}
        <div className="text-center pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/about-us"
            className="inline-flex items-center gap-2 bg-[#244f31] hover:bg-[#1a3a23] text-white px-7 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition shadow-sm hover:shadow-md cursor-pointer"
          >
            <span>Explore Our Full Heritage & Story</span>
            <ArrowRight className="size-4" />
          </Link>

          <Link
            href="/#products"
            className="inline-flex items-center gap-2 bg-white hover:bg-[#f8faf1] text-[#244f31] border border-[#244f31] px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer"
          >
            <span>Browse All Remedies</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
