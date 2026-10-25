"use client";

import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import SiteFooter from "@/components/SiteFooter";

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-white text-neutral-900">
      <div className="mx-auto max-w-[800px] px-4 py-8 md:py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-[#023915] hover:text-black mb-6">
          <ArrowLeft className="size-4" />
          <span>Back to Shop</span>
        </Link>

        <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-xs md:p-10">
          <div className="flex items-center gap-3 border-b border-neutral-200 pb-4">
            <FileText className="size-6 text-[#023915]" />
            <h1 className="text-xl font-bold uppercase text-neutral-900 sm:text-2xl">
              Terms of Service
            </h1>
          </div>

          <p className="mt-4 text-xs text-[#666666] leading-relaxed md:text-sm">
            Welcome to <b>Pure Ayur Herbs</b>. By accessing or shopping on our website, you agree to comply with and be bound by the following terms and conditions.
          </p>

          <div className="mt-8 space-y-6 text-xs text-[#666666] leading-relaxed md:text-sm">
            <div>
              <h3 className="text-sm font-bold text-[#17231b]">1. Order Acceptance & Pricing</h3>
              <p className="mt-2">
                We reserve the right to cancel or refuse any orders. Price changes and availability are subject to change without notice. All prices are in INR.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-[#17231b]">2. Cash on Delivery (COD)</h3>
              <p className="mt-2">
                We reserve the right to request mobile number verification via OTP prior to shipping Cash on Delivery shipments to prevent fraudulent returns (RTO).
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-[#17231b]">3. Intellectual Property</h3>
              <p className="mt-2">
                All branding, graphics, product copy, formulas, and layouts belong to Pure Ayur Herbs and cannot be duplicated without permission.
              </p>
            </div>
          </div>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
