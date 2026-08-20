"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Phone, Mail, CreditCard, ShieldCheck, Wallet, Truck, Smartphone } from "lucide-react";

export default function SiteFooter() {
  const [settings, setSettings] = useState({
    supportEmail: "info@pyurayurherbs.com",
    whatsappNumber: "919876543210",
  });

  useEffect(() => {
    fetch("/api/admin/all", { cache: "no-store" })
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
            <div className="border-2 border-[#244f31] p-3.5 rounded-xl inline-flex items-center gap-2.5 mb-6 bg-white select-none">
              <div className="relative flex size-10 items-center justify-center rounded-full bg-[#244f31] text-white">
                <span className="text-base font-black tracking-tighter">P</span>
              </div>
              <div className="flex flex-col leading-none text-left">
                <span className="text-sm font-black uppercase tracking-wider text-[#244f31]">
                  PYUR AYUR
                </span>
                <span className="text-[8px] font-bold uppercase tracking-[0.25em] text-[#80a03c]">
                  HERBS
                </span>
              </div>
            </div>

            {/* Address */}
            <p className="text-xs text-[#555555] leading-relaxed italic mb-5 max-w-sm font-medium">
              Pyur Ayur Herbs Private Limited,<br />
              12, Botanical Enclave, Sector 62,<br />
              Noida, Uttar Pradesh - 201301
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
            <div className="flex flex-wrap items-center gap-3 select-none">
              <div className="h-7 px-3 text-[10px] font-black border border-[#ddddd9] rounded-xl bg-white text-gray-700 flex items-center gap-1.5 shadow-xs">
                <CreditCard className="size-3.5 text-[#244f31]" />
                <span>Cards</span>
              </div>
              <div className="h-7 px-3 text-[10px] font-black border border-[#ddddd9] rounded-xl bg-white text-gray-700 flex items-center gap-1.5 shadow-xs">
                <Smartphone className="size-3.5 text-[#244f31]" />
                <span>UPI / GPay</span>
              </div>
              <div className="h-7 px-3 text-[10px] font-black border border-[#ddddd9] rounded-xl bg-white text-gray-700 flex items-center gap-1.5 shadow-xs">
                <Wallet className="size-3.5 text-[#244f31]" />
                <span>Wallets & NetBanking</span>
              </div>
              <div className="h-7 px-3 text-[10px] font-black border border-[#ddddd9] rounded-xl bg-white text-gray-700 flex items-center gap-1.5 shadow-xs">
                <Truck className="size-3.5 text-[#244f31]" />
                <span>Cash on Delivery</span>
              </div>
              <div className="h-7 px-3 text-[10px] font-black border border-[#ddddd9] rounded-xl bg-white text-gray-700 flex items-center gap-1.5 shadow-xs">
                <ShieldCheck className="size-3.5 text-emerald-600" />
                <span>Secure Payments</span>
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
      <div className="bg-[#17231b] py-3.5 w-full text-center text-[10px] text-white/80 font-bold uppercase tracking-wider select-none">
        Pyur Ayur Herbs Private Limited | © Copyright {new Date().getFullYear()} Pyur Ayur
      </div>
    </footer>
  );
}
