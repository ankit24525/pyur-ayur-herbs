"use client";

import Link from "next/link";
import { ArrowLeft, RotateCw, CheckCircle, HelpCircle } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export default function ReturnPolicyPage() {
  return (
    <main className="min-h-screen bg-[#f8faf1] text-[#17231b]">
      <div className="bg-[#1e3c27] text-white py-2.5 text-center text-xs font-semibold">
        🛡️ 7-Day Easy Returns & Replacements Guarantee
      </div>

      <div className="mx-auto max-w-[800px] px-4 py-8 md:py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-[#80a03c] hover:text-[#244f31] mb-6">
          <ArrowLeft className="size-4" />
          <span>Back to Shop</span>
        </Link>

        <div className="rounded-2xl border border-[#ddddd9] bg-white p-6 shadow-sm md:p-10">
          <div className="flex items-center gap-3 border-b border-[#ddddd9] pb-4">
            <RotateCw className="size-7 text-[#80a03c]" />
            <h1 className="text-2xl font-black uppercase text-[#17231b] sm:text-3xl">
              Return & Replacement Policy
            </h1>
          </div>

          <p className="mt-4 text-xs text-[#666666] leading-relaxed md:text-sm">
            At <b>Pyur Ayur Herbs</b>, we stand behind the quality of our Ayurvedic products. If you are not satisfied with your purchase, we offer a hassle-free <b>7-Day Easy Return & Replacement Policy</b> from the date of delivery.
          </p>

          <div className="mt-8 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-[#17231b] flex items-center gap-2">
                <CheckCircle className="size-4 text-[#80a03c]" />
                <span>1. Conditions for Returns & Replacement</span>
              </h3>
              <ul className="mt-2 list-disc list-inside text-xs text-[#666666] space-y-1.5 pl-2">
                <li>Products must be returned within 7 days from the delivery date.</li>
                <li>The item must be in its original packaging, unopened, and unused (with seal intact).</li>
                <li>Damaged, leaked, or wrong items received will be replaced immediately at no extra cost.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-bold text-[#17231b] flex items-center gap-2">
                <CheckCircle className="size-4 text-[#80a03c]" />
                <span>2. Step-by-Step Return Process</span>
              </h3>
              <ol className="mt-2 list-decimal list-inside text-xs text-[#666666] space-y-2 pl-2">
                <li>
                  <b>Submit Request:</b> Email us at <a href="mailto:support@pyurayurherbs.com" className="text-[#244f31] font-bold underline">support@pyurayurherbs.com</a> or WhatsApp us at <b>+91 98765 43210</b> with your Order ID and photo/video of the issue.
                </li>
                <li>
                  <b>Pickup Schedule:</b> Once approved, we will arrange a reverse pickup from your address within 24-48 hours.
                </li>
                <li>
                  <b>Refund/Replacement:</b> Once the package is received and inspected, we will initiate your replacement delivery or issue a full refund to your original payment method / Pyur wallet within 5 business days.
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
