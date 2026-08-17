"use client";

import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";
import SiteFooter from "@/components/SiteFooter";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[#f8faf1] text-[#17231b]">
      <div className="mx-auto max-w-[800px] px-4 py-8 md:py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-[#80a03c] hover:text-[#244f31] mb-6">
          <ArrowLeft className="size-4" />
          <span>Back to Shop</span>
        </Link>

        <div className="rounded-2xl border border-[#ddddd9] bg-white p-6 shadow-sm md:p-10">
          <div className="flex items-center gap-3 border-b border-[#ddddd9] pb-4">
            <Shield className="size-7 text-[#80a03c]" />
            <h1 className="text-2xl font-black uppercase text-[#17231b] sm:text-3xl">
              Privacy Policy
            </h1>
          </div>

          <p className="mt-4 text-xs text-[#666666] leading-relaxed md:text-sm">
            At <b>Pyur Ayur Herbs</b>, we value your trust. This Privacy Policy describes how we collect, use, process, and protect your personal information when you visit or shop on our store.
          </p>

          <div className="mt-8 space-y-6 text-xs text-[#666666] leading-relaxed md:text-sm">
            <div>
              <h3 className="text-sm font-bold text-[#17231b]">1. Information We Collect</h3>
              <p className="mt-2">
                When you make a purchase, register, or sign up for newsletters, we collect names, billing/shipping addresses, phone numbers, email addresses, and payment choice information.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-[#17231b]">2. How We Use Your Data</h3>
              <p className="mt-2">
                To process and dispatch your orders, verify COD orders via OTP, deliver personalized health consultation advice, and optimize our Facebook/Meta Ads conversions.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-[#17231b]">3. Tracking & Cookies</h3>
              <p className="mt-2">
                We use the Meta Pixel and Conversions API (CAPI) to analyze store interactions, build target advertisement audiences, and optimize promotional campaign delivery.
              </p>
            </div>
          </div>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
