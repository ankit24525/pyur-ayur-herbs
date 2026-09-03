"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, CreditCard, ShieldCheck, Wallet, Truck, Smartphone } from "lucide-react";

export default function SiteFooter() {
  const [settings, setSettings] = useState({
    supportEmail: "info@pyurayurherbs.com",
    whatsappNumber: "919876543210",
  });

  useEffect(() => {
    fetch("/api/storefront", { cache: "default" })
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          setSettings({
            supportEmail: data.settings.supportEmail || "info@pyurayurherbs.com",
            whatsappNumber: data.settings.whatsappNumber || "919876543210",
          });
        }
      })
      .catch((e) => console.error("Error loading settings in footer:", e));
  }, []);

  let cleanNumber = settings.whatsappNumber.replace(/\D/g, "");
  if (cleanNumber.length === 10) {
    cleanNumber = "91" + cleanNumber;
  }

  // Overlapping botanical leaf designs for the top border strip
  const leavesPattern = (
    <div className="h-9 w-full bg-gradient-to-r from-emerald-50 via-emerald-100 to-emerald-50 border-y border-emerald-200/40 relative overflow-hidden flex items-center justify-around select-none">
      {[...Array(12)].map((_, i) => (
        <svg
          key={i}
          className={`size-5 text-emerald-800/20 opacity-30 transform transition-transform duration-500 hover:scale-110`}
          style={{
            transform: `rotate(${i % 2 === 0 ? 15 + i * 5 : -15 - i * 3}deg) translateY(${i % 3 === 0 ? "2px" : "-2px"})`,
          }}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M17 8C8 10 5.9 16.1 5 21C4 16 6 10 15 7C16 6.5 17 6.8 17 8ZM12.1 12.2C8.1 13.1 7.1 16.1 6.5 19C6 16.5 7.1 13.1 11.1 11.2C11.5 11 12 11.2 12.1 12.2Z" />
        </svg>
      ))}
    </div>
  );

  return (
    <footer className="bg-white text-[#17231b] border-t border-neutral-100 flex flex-col">
      {/* Decorative Botanical Leaf Strip */}
      {leavesPattern}

      {/* Main Footer Content */}
      <div className="mx-auto max-w-[1440px] w-full px-5 py-12 md:px-8 md:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4 lg:grid-cols-5">
          {/* Column 1: Brand details */}
          <div className="md:col-span-2">
            {/* Pyur Ayur framed logo */}
            <div className="border-2 border-[#244f31] p-3 rounded-xl inline-flex items-center gap-3 mb-6 bg-white select-none shadow-sm">
              <div className="relative flex size-12 items-center justify-center rounded-full overflow-hidden border border-[#244f31]/10 bg-white shrink-0">
                <Image
                  src="/brand/pure-ayur-logo.png"
                  alt="Pure Ayur Herbs Logo"
                  width={60}
                  height={60}
                  className="size-full object-cover"
                />
              </div>
              <div className="flex flex-col leading-none text-left">
                <span className="text-base font-black uppercase tracking-wider text-[#244f31]">
                  PURE AYUR
                </span>
                <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#80a03c]">
                  HERBS
                </span>
              </div>
            </div>

            {/* Address & GSTIN */}
            <p className="text-xs text-[#555555] leading-relaxed italic mb-5 max-w-sm font-medium">
              Pyur Ayur Herbs Private Limited,<br />
              Registered Office Address: 12, Botanical Enclave, Sector 62, Noida, UP - 201301<br />
              GSTIN: 09AAPCP8765A1Z5
            </p>

            {/* Support Phone */}
            <a
              href={`https://api.whatsapp.com/send?phone=${cleanNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 text-sm font-black text-[#17231b] hover:text-[#80a03c] transition mb-3 w-fit"
            >
              <Phone className="size-4.5 text-[#244f31]" />
              <span>+{settings.whatsappNumber} (Support)</span>
            </a>

            {/* Support Email */}
            <a
              href={`mailto:${settings.supportEmail}`}
              className="flex items-center gap-2.5 text-sm font-black text-[#17231b] hover:text-[#80a03c] transition w-fit"
            >
              <Mail className="size-4.5 text-[#244f31]" />
              <span>{settings.supportEmail}</span>
            </a>
          </div>

          {/* Column 2: Link Block 1 */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-[#244f31]">
              Shop All
            </h4>
            <div className="flex flex-col gap-3.5 text-xs font-extrabold text-[#666666] tracking-wide uppercase">
              <Link href="/products/kapiva-glowing-skin-juice" className="hover:text-[#80a03c] transition">Glowing Skin Juices</Link>
              <Link href="/products/pure-himalayan-shilajit" className="hover:text-[#80a03c] transition">Shilajit Resins</Link>
              <Link href="/profile?tab=orders" className="hover:text-[#80a03c] transition">My Account</Link>
              <Link href="/contact-us" className="hover:text-[#80a03c] transition">Faqs</Link>
              <Link href="/solution/daily-ayurveda" className="hover:text-[#80a03c] transition">Innovation Fund</Link>
            </div>
          </div>

          {/* Column 3: Link Block 2 */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-[#244f31]">
              About Us
            </h4>
            <div className="flex flex-col gap-3.5 text-xs font-extrabold text-[#666666] tracking-wide uppercase">
              <Link href="/contact-us" className="hover:text-[#80a03c] transition">About Us</Link>
              <Link href="/blog" className="hover:text-[#80a03c] transition">Blog</Link>
              <Link href="/solution/gym-and-fitness" className="hover:text-[#80a03c] transition">Media</Link>
              <Link href="/contact-us" className="hover:text-[#80a03c] transition">Contact Us</Link>
            </div>
          </div>

          {/* Column 4: Follow Us & Socials */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-[#244f31]">
              Follow Us
            </h4>
            <div className="flex gap-4.5 text-[#17231b]">
              <a href="#" className="hover:text-[#80a03c] transition">
                <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
              </a>
              <a href="#" className="hover:text-[#80a03c] transition">
                <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </a>
              <a href="#" className="hover:text-[#80a03c] transition">
                <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/>
                  <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/>
                </svg>
              </a>
              <a href="#" className="hover:text-[#80a03c] transition">
                <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        <hr className="my-10 border-[#ddddd9]" />

        {/* Marketplace & Payment Gateways Strip */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 pb-10">
          {/* Marketplace Badges */}
          <div className="flex flex-col gap-2.5">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#999999]">Also available on:</span>
            <div className="flex flex-wrap items-center gap-5 select-none">
              {/* Amazon Brand SVG */}
              <div className="h-6 w-16 text-neutral-800 relative flex items-center justify-center font-bold text-xs border border-neutral-100 rounded px-1.5 bg-neutral-50/50">
                amazon.in
              </div>
              {/* Flipkart Brand SVG */}
              <div className="h-6 w-16 text-neutral-800 relative flex items-center justify-center font-bold text-xs border border-neutral-100 rounded px-1.5 bg-neutral-50/50">
                Flipkart
              </div>
              {/* Zepto Brand SVG */}
              <div className="h-6 w-16 text-purple-700 relative flex items-center justify-center font-extrabold text-xs border border-neutral-100 rounded px-1.5 bg-neutral-50/50">
                zepto
              </div>
              {/* Instamart Brand SVG */}
              <div className="h-6 w-20 text-orange-600 relative flex items-center justify-center font-extrabold text-[10px] border border-neutral-100 rounded px-1.5 bg-neutral-50/50">
                instamart
              </div>
            </div>
          </div>

          {/* Payment Gateway Badges */}
          <div className="flex flex-col gap-2.5 w-full lg:w-auto">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#999999]">We Accept:</span>
            <div className="flex flex-wrap items-center gap-6 select-none bg-white/50 p-2.5 px-4 rounded-2xl border border-[#ddddd9]">
              {/* Swiggy Instamart */}
              <div className="flex items-center">
                <svg className="h-6 w-auto" viewBox="0 0 110 24" fill="none">
                  <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22S19 14.25 19 9C19 5.13 15.87 2 12 2Z" fill="#FC8019" />
                  <circle cx="12" cy="9" r="3" fill="white" />
                  <text x="25" y="16" fill="#1C3F94" fontSize="12" fontWeight="900" fontFamily="sans-serif">instamart</text>
                </svg>
              </div>

              {/* Amazon Pay */}
              <div className="flex items-center">
                <svg className="h-5 w-auto" viewBox="0 0 90 28" fill="none">
                  <text x="0" y="16" fill="#111" fontSize="13" fontWeight="900" fontFamily="sans-serif">amazon</text>
                  <text x="50" y="16" fill="#666" fontSize="12" fontWeight="500" fontFamily="sans-serif">pay</text>
                  <path d="M6 18C15 23 35 23 44 18" stroke="#FF9900" strokeWidth="2" strokeLinecap="round" fill="none" />
                  <path d="M44 18L41.5 15.5M44 18L42.5 20.5" stroke="#FF9900" strokeWidth="2" strokeLinecap="round" fill="none" />
                </svg>
              </div>

              {/* BHIM UPI */}
              <div className="flex items-center">
                <svg className="h-5 w-auto" viewBox="0 0 80 22" fill="none">
                  <text x="0" y="15" fill="#E07C24" fontSize="12" fontWeight="900" fontStyle="italic" fontFamily="sans-serif">BHIM</text>
                  <text x="34" y="15" fill="#0A79DF" fontSize="12" fontWeight="900" fontStyle="italic" fontFamily="sans-serif">UPI</text>
                  <path d="M30 6L32 15M34 6L32 15" stroke="#50DBB4" strokeWidth="1.5" />
                </svg>
              </div>

              {/* Pay Online or COD stamp */}
              <div className="flex items-center opacity-80">
                <svg className="h-7 w-auto" viewBox="0 0 32 32" fill="none">
                  <circle cx="16" cy="16" r="14" stroke="#999" strokeWidth="1" strokeDasharray="3 2" />
                  <circle cx="16" cy="16" r="11" stroke="#999" strokeWidth="0.5" />
                  <path d="M9 16C9 12.13 12.13 9 16 9C19.87 9 23 12.13 23 16C23 19.87 19.87 23 16 23C12.13 23 9 19.87 9 16Z" fill="#eee" />
                  <text x="16" y="14" fill="#555" fontSize="4.5" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">COD</text>
                  <text x="16" y="20" fill="#555" fontSize="3.5" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">ONLINE</text>
                </svg>
              </div>

              {/* GPay */}
              <div className="flex items-center">
                <svg className="h-6 w-auto" viewBox="0 0 48 24" fill="none">
                  <path d="M4 12C4 8.69 6.69 6 10 6H14" stroke="#4285F4" strokeWidth="3" strokeLinecap="round" />
                  <path d="M14 6C17.31 6 20 8.69 20 12" stroke="#34A853" strokeWidth="3" strokeLinecap="round" />
                  <path d="M20 12C20 15.31 17.31 18 14 18" stroke="#FBBC05" strokeWidth="3" strokeLinecap="round" />
                  <path d="M14 18H10C6.69 18 4 15.31 4 12" stroke="#EA4335" strokeWidth="3" strokeLinecap="round" />
                  <text x="24" y="16" fill="#5F6368" fontSize="12" fontWeight="bold" fontFamily="sans-serif">Pay</text>
                </svg>
              </div>

              {/* Mastercard */}
              <div className="flex items-center">
                <svg className="h-6 w-auto" viewBox="0 0 36 24" fill="none">
                  <circle cx="12" cy="12" r="10" fill="#EB001B" fillOpacity="0.9" />
                  <circle cx="24" cy="12" r="10" fill="#FF5F00" fillOpacity="0.9" />
                  <path d="M18 5.58C16.38 7.26 15.38 9.51 15.38 12C15.38 14.49 16.38 16.74 18 18.42C19.62 16.74 20.62 14.49 20.62 12C20.62 9.51 19.62 7.26 18 5.58Z" fill="#FF5F00" />
                </svg>
              </div>

              {/* RuPay */}
              <div className="flex items-center">
                <svg className="h-5 w-auto" viewBox="0 0 65 20" fill="none">
                  <text x="0" y="15" fill="#1C3F94" fontSize="13" fontWeight="900" fontStyle="italic" fontFamily="sans-serif">RuPay</text>
                  <path d="M52 5L58 10L52 15" stroke="#FC8019" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M46 5L52 10L46 15" stroke="#80A03C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              {/* Visa */}
              <div className="flex items-center">
                <svg className="h-5 w-auto" viewBox="0 0 50 18" fill="none">
                  <text x="5" y="15" fill="#1A1F71" fontSize="15" fontWeight="900" fontStyle="italic" fontFamily="sans-serif">VISA</text>
                  <path d="M0 3L6 3.5L4 12L0 3Z" fill="#F7B600" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Policy Links Row */}
        <div className="flex flex-wrap justify-between items-center gap-4 text-xs font-bold text-[#666666] tracking-wide pt-4 border-t border-[#f0f0eb] select-none">
          <Link href="/privacy-policy" className="hover:text-[#80a03c] transition">Privacy Policy</Link>
          <Link href="/terms-of-service" className="hover:text-[#80a03c] transition">Terms and Conditions</Link>
          <Link href="/shipping-policy" className="hover:text-[#80a03c] transition">Shipping Policy</Link>
          <Link href="/return-policy" className="hover:text-[#80a03c] transition">Cancellation Policy</Link>
        </div>
      </div>

      {/* Copyright Bottom Bar */}
      <div className="bg-[#17231b] py-3.5 w-full text-center text-[10px] text-white/80 font-bold uppercase tracking-wider select-none flex items-center justify-center gap-2">
        <span>Pyur Ayur Herbs Private Limited | © Copyright {new Date().getFullYear()} Pyur Ayur</span>
      </div>
    </footer>
  );
}
