"use client";

import { Award, Shield, Leaf, Beaker } from "lucide-react";

export default function TrustSection({ bannerImage }: { bannerImage?: string }) {
  const pillars = [
    {
      icon: Award,
      title: "100% Authentic Sourcing",
      desc: "Wild herbs harvested from high-altitude Himalayas & organic Pratapgarh farms.",
    },
    {
      icon: Shield,
      title: "AYUSH & GMP Certified",
      desc: "Manufactured in a certified facility adhering to classical Shastra standards.",
    },
    {
      icon: Leaf,
      title: "0% Added Sugars",
      desc: "Clean botanical extractions free from artificial flavors, parabens & synthetic colors.",
    },
    {
      icon: Beaker,
      title: "Clinically Formulated",
      desc: "Backed by modern clinical safety trials and 5,000-year-old Charaka Samhita texts.",
    },
  ];

  return (
    <section id="trust" className="bg-white py-8 sm:py-12 border-b border-neutral-200/80">
      <div className="mx-auto max-w-[1440px] px-4 md:px-6">
        {/* Editorial Brand Trust Banner (Why Pure Ayur Herbs?) */}
        <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-neutral-200/90 shadow-xs bg-[#f8faf5]">
          <img
            src={bannerImage || "/brand/why-pure-ayur-banner.jpg"}
            alt="Why Pure Ayur Herbs? - Bridging Ancient Ayurvedic Wisdom with Modern Clinical Research"
            className="w-full h-auto object-cover object-center"
            loading="lazy"
          />
        </div>

        {/* 4-Pillar Companion Callout Badges (Hidden on mobile view, visible on desktop/tablet) */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6">
          {pillars.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <div
                key={idx}
                className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3 p-4 sm:p-5 rounded-2xl bg-[#f8f9fa] border border-neutral-200/70"
              >
                <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-100/70 text-[#023915] shrink-0">
                  <IconComponent className="size-5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-neutral-900 leading-snug">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-[11px] sm:text-xs text-neutral-600 leading-relaxed hidden sm:block">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
