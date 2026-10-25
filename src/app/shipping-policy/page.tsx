"use client";

import Link from "next/link";
import { ArrowLeft, Truck } from "lucide-react";
import SiteFooter from "@/components/SiteFooter";

export default function ShippingPolicyPage() {
  return (
    <main className="min-h-screen bg-white text-neutral-900">
      <div className="mx-auto max-w-[800px] px-4 py-8 md:py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-[#023915] hover:text-black mb-6">
          <ArrowLeft className="size-4" />
          <span>Back to Shop</span>
        </Link>

        <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-xs md:p-10">
          <div className="flex items-center gap-3 border-b border-neutral-200 pb-4">
            <Truck className="size-6 text-[#023915]" />
            <h1 className="text-xl font-bold uppercase text-neutral-900 sm:text-2xl">
              Shipping & Delivery Policy
            </h1>
          </div>

          <p className="mt-4 text-xs text-[#666666] leading-relaxed md:text-sm">
            At <b>Pure Ayur Herbs</b>, we ensure safe, hygienic packaging and fast delivery across India.
          </p>

          <div className="mt-8 space-y-6 text-xs text-[#666666] leading-relaxed md:text-sm">
            <div>
              <h3 className="text-sm font-bold text-[#17231b]">1. Shipping Charges</h3>
              <p className="mt-2">
                We offer <b>FREE Shipping</b> on all orders of ₹999 or more. For orders below ₹999, a flat shipping charge of ₹49 is applied.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-[#17231b]">2. Delivery Timelines</h3>
              <p className="mt-2">
                Orders are dispatched within 24 hours of placement. Metro cities deliver in 2-3 business days. Other regions deliver in 3-5 business days.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-[#17231b]">3. Tracking Shipments</h3>
              <p className="mt-2">
                A tracking link will be sent to your WhatsApp number and email address as soon as your shipment leaves our warehouse facility.
              </p>
            </div>
          </div>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
