"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { getStorefrontData } from "@/lib/storefront-client";

export function formatFooterHref(rawUrl?: string, label?: string): string {
  const cleanLabel = (label || "").trim().toLowerCase();
  const raw = (rawUrl || "").trim();

  if (
    cleanLabel === "about us" ||
    cleanLabel === "about-us" ||
    cleanLabel === "about" ||
    cleanLabel === "our story"
  ) {
    if (
      !raw ||
      raw === "#" ||
      raw === "/" ||
      raw === "/contact-us" ||
      raw === "contact-us" ||
      raw.toLowerCase().includes("about")
    ) {
      return "/about-us";
    }
  }

  if (
    cleanLabel === "faqs" ||
    cleanLabel === "faq" ||
    cleanLabel === "frequently asked questions" ||
    cleanLabel.includes("faq")
  ) {
    if (
      !raw ||
      raw === "#" ||
      raw === "/" ||
      raw === "/contact-us" ||
      raw === "contact-us" ||
      raw.toLowerCase().includes("faq")
    ) {
      return "/faqs";
    }
  }

  if (!raw || raw === "#") {
    if (cleanLabel.includes("about")) return "/about-us";
    if (cleanLabel.includes("faq")) return "/faqs";
    if (cleanLabel.includes("blog")) return "/blog";
    if (cleanLabel.includes("privacy")) return "/privacy-policy";
    if (cleanLabel.includes("return")) return "/return-policy";
    if (cleanLabel.includes("shipping")) return "/shipping-policy";
    if (cleanLabel.includes("terms")) return "/terms-of-service";
    if (cleanLabel.includes("contact")) return "/contact-us";
    return "#";
  }

  if (/^(https?:|\/\/|mailto:|tel:)/i.test(raw)) {
    return raw;
  }

  if (raw.startsWith("#")) {
    return raw;
  }

  const cleanedSlug = raw.replace(/^\/+/, "").replace(/\s+/g, "-");
  return `/${cleanedSlug}`;
}

const DEFAULT_USEFUL_LINKS = [
  { label: "About Us", url: "/about-us" },
  { label: "Privacy Policy", url: "/privacy-policy" },
  { label: "Return Policy", url: "/return-policy" },
  { label: "Shipping Policy", url: "/shipping-policy" },
  { label: "Terms & Conditions", url: "/terms-of-service" },
];

const MOST_SEARCHED_TAGS = [
  { label: "Herbal Drinks", href: "/products?search=Herbal+Drinks" },
  { label: "Healthy Botanicals", href: "/products?search=Botanicals" },
  { label: "Best Sellers", href: "/products?sort=bestseller" },
  { label: "Under 499", href: "/products?maxPrice=499" },
  { label: "Wholesome Superfoods", href: "/products?search=Superfoods" },
  { label: "Daily Nutrition", href: "/products?search=Nutrition" },
  { label: "Under 999", href: "/products?maxPrice=999" },
  { label: "Natural Supplements", href: "/products?search=Supplements" },
  { label: "Under 299", href: "/products?maxPrice=299" },
];

export default function SiteFooter() {
  const [footerData, setFooterData] = useState<any>(null);
  const [settings, setSettings] = useState<any>({
    storeName: "Pure Ayur Herbs",
    supportEmail: "anshv799@gmail.com",
    whatsappNumber: "91 - 8588011038",
    companyLegalName: "Pure Ayur Herbs Private Limited",
    registeredAddress:
      "H. NO-A-10/1, F/F, Sonia Vihar, Opp NEAR BR PUBLIC SCHOOL, BLOCK -A , PART-2, Shahdara, Delhi, New Delhi, 110094",
    socialLinks: {
      facebook: "https://facebook.com",
      instagram: "https://instagram.com",
      youtube: "https://youtube.com",
      twitter: "https://twitter.com",
    },
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = JSON.parse(
          localStorage.getItem("pyur_storefront_cache") || "{}"
        );
        if (cached.settings)
          setSettings((prev: any) => ({ ...prev, ...cached.settings }));
        if (cached.content?.footer) setFooterData(cached.content.footer);
      } catch {}
    }

    getStorefrontData()
      .then((data) => {
        if (data && data.settings) {
          setSettings((prev: any) => ({ ...prev, ...data.settings }));
        }
        if (data && data.content?.footer) {
          setFooterData(data.content.footer);
        }
      })
      .catch((e) => console.error("Error loading settings in footer:", e));

    const handleUpdate = (e: any) => {
      if (e.detail?.key === "settings") {
        setSettings((prev: any) => ({ ...prev, ...e.detail.value }));
      }
      if (e.detail?.key === "content" && e.detail.value?.footer) {
        setFooterData(e.detail.value.footer);
      }
    };
    window.addEventListener("pyur_storefront_updated", handleUpdate);
    return () =>
      window.removeEventListener("pyur_storefront_updated", handleUpdate);
  }, []);

  const displayPhone =
    footerData?.supportWhatsapp ||
    settings?.whatsappNumber ||
    "+91 - 8588011038";

  let cleanPhone = displayPhone.replace(/[^\d+]/g, "");
  if (!cleanPhone.startsWith("+") && cleanPhone.length === 10) {
    cleanPhone = "+91" + cleanPhone;
  }

  const displayEmail =
    footerData?.supportEmail ||
    settings?.supportEmail ||
    "anshv799@gmail.com";

  const displayAddress =
    footerData?.registeredAddress ||
    settings?.registeredAddress ||
    "H. NO-A-10/1, F/F, Sonia Vihar, Opp NEAR BR PUBLIC SCHOOL, BLOCK -A , PART-2, Shahdara, Delhi, New Delhi, 110094";

  const social = footerData?.socialLinks ||
    settings?.socialLinks || {
      facebook: "https://facebook.com",
      instagram: "https://instagram.com",
    };

  const usefulLinks =
    Array.isArray(footerData?.usefulLinks) && footerData.usefulLinks.length > 0
      ? footerData.usefulLinks
      : DEFAULT_USEFUL_LINKS;

  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full text-white flex flex-col select-none">
      {/* 1. Main Content Section (Deep Forest Slate Theme with Reference Structure) */}
      <div className="bg-[#14271c] w-full py-12 md:py-16">
        <div className="mx-auto max-w-[1200px] px-5 sm:px-6 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
            {/* Top / Left Block: Brand Details & Social Links */}
            <div className="md:col-span-5 flex flex-col">
              {/* Brand Logo & Name */}
              <div className="flex items-center gap-3 mb-3">
                <div className="size-9 rounded-full bg-white/10 p-1 flex items-center justify-center shrink-0 border border-white/20">
                  <Image
                    src="/brand/pure-ayur-logo.png"
                    alt="Pure Ayur Herbs"
                    width={40}
                    height={40}
                    className="size-full object-contain"
                  />
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-normal tracking-widest uppercase text-white">
                  PURE AYUR HERBS
                </h2>
              </div>

              {/* Brand Mission Description */}
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-normal max-w-md mb-5">
                Pure Ayur Herbs offers premium quality Ayurvedic wellness
                formulations crafted for holistic health and vitality. Every
                remedy delivers pure Himalayan botanicals and natural goodness
                you can trust.
              </p>

              {/* Social Follow Us Strip */}
              <div className="flex items-center gap-3 text-xs sm:text-sm text-neutral-300 font-normal">
                <span>Follow us on</span>
                <div className="flex items-center gap-2">
                  {/* Facebook */}
                  <a
                    href={
                      social.facebook?.startsWith("http")
                        ? social.facebook
                        : `https://${social.facebook || "facebook.com"}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Follow us on Facebook"
                    className="size-7 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:scale-110 transition shadow-xs cursor-pointer"
                  >
                    <svg className="size-4 fill-white" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>

                  {/* Instagram */}
                  <a
                    href={
                      social.instagram?.startsWith("http")
                        ? social.instagram
                        : `https://${social.instagram || "instagram.com"}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Follow us on Instagram"
                    className="size-7 rounded-lg bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white flex items-center justify-center hover:scale-110 transition shadow-xs cursor-pointer"
                  >
                    <svg
                      className="size-4 fill-none stroke-white stroke-2"
                      viewBox="0 0 24 24"
                    >
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            {/* Middle Block: Useful Links */}
            <div className="md:col-span-3 flex flex-col">
              <h3 className="font-bold text-white text-base sm:text-lg tracking-tight mb-3 sm:mb-4">
                Useful Links
              </h3>
              <ul className="flex flex-col gap-2.5 text-xs sm:text-sm text-neutral-300 font-normal">
                {usefulLinks.map((link: any, idx: number) => {
                  const href = formatFooterHref(link.url, link.label);
                  return (
                    <li key={idx}>
                      <Link
                        href={href}
                        className="hover:text-white transition inline-block cursor-pointer"
                      >
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Right Block: Contact Us */}
            <div className="md:col-span-4 flex flex-col">
              <h3 className="font-bold text-white text-base sm:text-lg tracking-tight mb-3 sm:mb-4">
                Contact Us
              </h3>
              <div className="flex flex-col gap-2.5 text-xs sm:text-sm text-neutral-300 font-normal leading-relaxed">
                <p>
                  Call:{" "}
                  <a
                    href={`tel:${cleanPhone}`}
                    className="hover:text-white transition font-medium"
                  >
                    {displayPhone}
                  </a>
                </p>
                <p>
                  Email:{" "}
                  <a
                    href={`mailto:${displayEmail}`}
                    className="hover:text-white transition font-medium"
                  >
                    {displayEmail}
                  </a>
                </p>
                <p className="text-neutral-300 leading-relaxed">
                  Address: {displayAddress}
                </p>
              </div>
            </div>
          </div>

          {/* Bottom of Content Block: Most searched on store */}
          <div className="mt-10 sm:mt-12 pt-8 border-t border-white/10">
            <h4 className="font-bold text-white text-xs sm:text-sm tracking-wide mb-3">
              Most searched on store
            </h4>
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2 text-xs sm:text-sm text-neutral-300 font-normal leading-relaxed">
              {MOST_SEARCHED_TAGS.map((tag, idx) => (
                <span key={idx} className="inline-flex items-center">
                  <Link
                    href={tag.href}
                    className="hover:text-white transition hover:underline cursor-pointer"
                  >
                    {tag.label}
                  </Link>
                  {idx < MOST_SEARCHED_TAGS.length - 1 && (
                    <span className="ml-2.5 text-neutral-500 select-none">
                      |
                    </span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Payment Gateway Badges Strip (Clean White Container matching Image 2) */}
      <div className="bg-white py-5 sm:py-6 border-t border-neutral-200">
        <div className="mx-auto max-w-[1200px] px-5 sm:px-6 md:px-8">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-4 sm:gap-x-8">
            {/* PhonePe */}
            <div className="flex items-center gap-1.5 font-bold text-xs shrink-0 select-none">
              <div className="size-6 rounded-full bg-[#5f259f] flex items-center justify-center text-white text-[11px] font-black">
                पे
              </div>
              <span className="text-[#5f259f] font-extrabold text-sm tracking-tight">
                PhonePe
              </span>
            </div>

            {/* Google Pay */}
            <div className="flex items-center gap-1 font-bold text-xs shrink-0 select-none">
              <svg className="size-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.94 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span className="text-neutral-700 font-bold text-sm tracking-tight">
                Pay
              </span>
            </div>

            {/* Paytm */}
            <div className="flex items-center font-black text-sm tracking-tight shrink-0 select-none">
              <span className="text-[#002e6e]">pay</span>
              <span className="text-[#00b9f5]">tm</span>
            </div>

            {/* BHIM UPI */}
            <div className="flex items-center gap-1 font-black text-xs tracking-wider shrink-0 select-none">
              <span className="text-[#097939] italic font-black text-sm">
                UPI
              </span>
              <span className="text-[#ea6c00] text-xs font-black">▶</span>
            </div>

            {/* RuPay */}
            <div className="flex items-center gap-1 font-black text-sm text-[#002d62] shrink-0 select-none">
              <span>RuPay</span>
              <span className="text-[#f37021] text-xs font-bold">❯</span>
            </div>

            {/* Mastercard */}
            <div className="flex items-center shrink-0 select-none">
              <svg className="h-6 w-auto" viewBox="0 0 36 24" fill="none">
                <circle cx="12" cy="12" r="10" fill="#EB001B" />
                <circle
                  cx="24"
                  cy="12"
                  r="10"
                  fill="#F79E1B"
                  fillOpacity="0.9"
                />
              </svg>
            </div>

            {/* Visa */}
            <div className="flex items-center font-black text-sm italic tracking-widest text-[#1a1f71] shrink-0 select-none">
              VISA
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Copyright Bar */}
      <div className="bg-[#0c1a11] py-3.5 pb-18 md:pb-3.5 w-full text-center text-[11px] text-neutral-400 font-normal">
        © {currentYear} Pure Ayur Herbs. All rights reserved.
      </div>
    </footer>
  );
}
