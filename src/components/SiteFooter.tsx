"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, CheckCircle2, ShieldCheck, Truck, Award, Leaf } from "lucide-react";

export default function SiteFooter() {
  const [emailInput, setEmailInput] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setSubscribed(true);
      setTimeout(() => {
        setSubscribed(false);
        setEmailInput("");
      }, 4000);
    }
  };

  return (
    <footer className="bg-[#17231b] text-white">
      {/* Newsletter Incentive Banner */}
      <div className="border-b border-white/10 bg-[#1d3b24] py-8">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-6 px-4 md:flex-row md:px-6">
          <div className="text-center md:text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-[#80a03c]">
              JOIN THE PYUR AYUR HERB FAMILY
            </span>
            <h3 className="text-lg font-black text-white sm:text-xl">
              Get 10% Instant Off On Your First Order
            </h3>
            <p className="text-xs text-white/70">
              Subscribe for exclusive herbal offers, health tips, and free Vaidya diet plans.
            </p>
          </div>

          {subscribed ? (
            <div className="flex items-center gap-2 rounded-xl bg-[#80a03c] px-6 py-3 text-xs font-bold text-white shadow">
              <CheckCircle2 className="size-5" />
              <span>Subscribed! Check your inbox for promo code PYUR10</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex w-full max-w-md gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/50" />
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full rounded-xl border border-white/20 bg-white/10 py-2.5 pl-9 pr-3 text-xs text-white outline-none placeholder:text-white/50 focus:border-[#80a03c]"
                />
              </div>
              <button
                type="submit"
                className="rounded-xl bg-[#80a03c] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#6c8930]"
              >
                SUBSCRIBE
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Main Multi-Column Links */}
      <div className="mx-auto max-w-[1440px] px-4 py-12 md:px-6 md:py-16">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand Story & Trust Badges */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2">
              <div className="flex size-10 items-center justify-center rounded-full bg-[#80a03c] font-black text-white">
                P
              </div>
              <span className="text-xl font-black uppercase tracking-wider text-white">
                PYUR AYUR HERBS
              </span>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-white/70 max-w-sm">
              Pyur Ayur Herbs brings authentic Ayurvedic wellness directly to your home. Formulated with 100% wild-harvested Himalayan botanicals and certified by the Ministry of AYUSH.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3 max-w-xs text-xs font-semibold text-white/80">
              <div className="flex items-center gap-1.5 rounded bg-white/5 p-2">
                <ShieldCheck className="size-4 text-[#80a03c]" />
                <span>AYUSH Certified</span>
              </div>
              <div className="flex items-center gap-1.5 rounded bg-white/5 p-2">
                <Leaf className="size-4 text-[#80a03c]" />
                <span>0% Added Sugar</span>
              </div>
              <div className="flex items-center gap-1.5 rounded bg-white/5 p-2">
                <Award className="size-4 text-[#80a03c]" />
                <span>100% Himalayan</span>
              </div>
              <div className="flex items-center gap-1.5 rounded bg-white/5 p-2">
                <Truck className="size-4 text-[#80a03c]" />
                <span>Fast All-India Ship</span>
              </div>
            </div>
          </div>

          {/* Shop By Health Goal */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-[#80a03c]">
              Shop By Health Goal
            </h4>
            <ul className="mt-4 space-y-2 text-xs text-white/80">
              <li><Link href="/solution/sugar-management" className="hover:text-white">Sugar Management</Link></li>
              <li><Link href="/solution/gym-and-fitness" className="hover:text-white">Gym & Stamina</Link></li>
              <li><Link href="/solution/energy" className="hover:text-white">Energy & Vitality</Link></li>
              <li><Link href="/solution/heart-health" className="hover:text-white">Heart & BP Care</Link></li>
              <li><Link href="/solution/liver-care" className="hover:text-white">Liver Cleanse & Detox</Link></li>
              <li><Link href="/solution/skin-and-hair" className="hover:text-white">Skin Radiance & Hair Care</Link></li>
              <li><Link href="/solution/womens-health" className="hover:text-white">Women's Period Harmony</Link></li>
            </ul>
          </div>

          {/* Shop By Category */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-[#80a03c]">
              Shop By Product Type
            </h4>
            <ul className="mt-4 space-y-2 text-xs text-white/80">
              <li><Link href="/solution/sugar-management" className="hover:text-white">Ayurvedic Juices (1L)</Link></li>
              <li><Link href="/solution/gym-and-fitness" className="hover:text-white">Pure Shilajit & Resins</Link></li>
              <li><Link href="/solution/skin-and-hair" className="hover:text-white">Saffron Elixirs & Oils</Link></li>
              <li><Link href="/solution/daily-ayurveda" className="hover:text-white">Organic Amla & Honey</Link></li>
              <li><Link href="/solution/daily-ayurveda" className="hover:text-white">Triphala & Gut Care</Link></li>
              <li><Link href="/solution/womens-health" className="hover:text-white">Hormonal Herbal Drinks</Link></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-[#80a03c]">
              Customer Support
            </h4>
            <ul className="mt-4 space-y-2 text-xs text-white/80">
              <li><a href="#consult" className="hover:text-white">Free Doctor Consultation</a></li>
              <li><a href="#quiz" className="hover:text-white">Take 2-Min Health Quiz</a></li>
              <li><a href="#" className="hover:text-white">Track Order Status</a></li>
              <li><a href="#" className="hover:text-white">Shipping & Refund Policy</a></li>
              <li><a href="#" className="hover:text-white">Contact Us (Toll-Free 1800-123-456)</a></li>
              <li><Link href="/admin" className="hover:text-white">Admin Dashboard</Link></li>
            </ul>
          </div>
        </div>

        <hr className="my-8 border-white/10" />

        {/* Bottom Bar & Disclaimer */}
        <div className="flex flex-col items-center justify-between gap-4 text-center text-[11px] text-white/60 md:flex-row md:text-left">
          <p>© {new Date().getFullYear()} Pyur Ayur Herbs Pvt Ltd. All rights reserved.</p>
          <p className="max-w-xl">
            Disclaimer: These statements have not been evaluated by the FDA or FSSAI for medical diagnosis. Products are not intended to diagnose, treat, cure, or prevent any disease. Always consult a certified Vaidya or doctor before starting a new herbal routine.
          </p>
        </div>
      </div>
    </footer>
  );
}
