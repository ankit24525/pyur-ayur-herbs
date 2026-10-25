"use client";

import Link from "next/link";
import { ArrowLeft, RotateCw, CheckCircle, HelpCircle } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export default function ReturnPolicyPage() {
  return (
    <main className="min-h-screen bg-white text-neutral-900">
      <div className="bg-[#023915] text-white py-2.5 text-center text-xs font-semibold">
        🛡️ 3-Day Returns &amp; Replacements Guarantee (Wrong/Damaged Items Only)
      </div>

      <div className="mx-auto max-w-[800px] px-4 py-8 md:py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-[#023915] hover:text-black mb-6">
          <ArrowLeft className="size-4" />
          <span>Back to Shop</span>
        </Link>

        <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-xs md:p-10">
          <div className="flex items-center gap-3 border-b border-neutral-200 pb-4">
            <RotateCw className="size-6 text-[#023915]" />
            <h1 className="text-xl font-bold uppercase text-neutral-900 sm:text-2xl">
              Return &amp; Replacement Policy
            </h1>
          </div>

          <p className="mt-4 text-xs text-[#666666] leading-relaxed md:text-sm">
            At <b>Pure Ayur Herbs</b>, we take utmost care in packaging and delivering genuine Ayurvedic formulations. We offer a <b>3-Day Return &amp; Replacement Policy</b> from the date of delivery for any wrong, damaged, or defective items received.
          </p>

          <div className="mt-8 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-[#17231b] flex items-center gap-2">
                <CheckCircle className="size-4 text-[#80a03c]" />
                <span>1. Conditions for Returns &amp; Replacement</span>
              </h3>
              <ul className="mt-2 list-disc list-inside text-xs text-[#666666] space-y-1.5 pl-2">
                <li>Return or replacement requests must be submitted within <b>3 days</b> from the delivery date.</li>
                <li>Applicable strictly for <b>wrong, broken, leaking, or damaged items</b> received.</li>
                <li>Please share clear unboxing photos/video and packaging labels with your request.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-bold text-[#17231b] flex items-center gap-2">
                <CheckCircle className="size-4 text-[#80a03c]" />
                <span>2. Step-by-Step Return Process</span>
              </h3>
              <ol className="mt-2 list-decimal list-inside text-xs text-[#666666] space-y-2 pl-2">
                <li>
                  <b>Submit Request:</b> Email us at <a href="mailto:support@pureayurherbs.com" className="text-[#244f31] font-bold underline">support@pureayurherbs.com</a> or WhatsApp us at <b>+91 98765 43210</b> with your Order ID and photo/video of the issue.
                </li>
                <li>
                  <b>Pickup Schedule:</b> Once approved, we will arrange a reverse pickup from your address within 24-48 hours.
                </li>
                <li>
                  <b>Refund/Replacement:</b> Once the package is received and inspected, we will initiate your replacement delivery or issue a full refund to your original payment method / Pure wallet within 5 business days.
                </li>
              </ol>
            </div>

            <div className="rounded-xl border border-dashed border-[#80a03c] bg-[#f8faf1] p-4 flex items-start gap-3">
              <HelpCircle className="size-5 text-[#80a03c] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-[#17231b]">Need Urgent Support?</h4>
                <p className="mt-1 text-xs text-[#666666] leading-relaxed">
                  Call our customer care desk at <b>1800-123-456 (Toll-Free)</b>, available Monday to Saturday, 9:00 AM to 6:00 PM.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
