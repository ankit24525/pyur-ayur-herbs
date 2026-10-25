"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, User, Menu, X, ChevronRight, Sparkles } from "lucide-react";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const [browseOpen, setBrowseOpen] = useState(false);
  const [pdpPastOffers, setPdpPastOffers] = useState(false);

  // Check routes
  const isAdmin = Boolean(pathname?.startsWith("/admin"));
  const isCheckout = pathname === "/checkout";
  const isPDP = Boolean(
    pathname &&
      ((pathname.startsWith("/products/") && pathname !== "/products") ||
        pathname.startsWith("/solution/"))
  );

  // On Product Detail Pages: listen for scroll to/past the offers section
  useEffect(() => {
    if (!isPDP) {
      setPdpPastOffers(false);
      return;
    }

    const handleToggle = (e: any) => {
      setPdpPastOffers(Boolean(e.detail?.isPastOffers));
    };

    const handleScroll = () => {
      const marker = document.getElementById("pdp-offers-marker");
      if (marker) {
        const rect = marker.getBoundingClientRect();
        setPdpPastOffers(rect.top <= window.innerHeight - 80);
      }
    };

    window.addEventListener("pyur_pdp_nav_toggle", handleToggle as EventListener);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("pyur_pdp_nav_toggle", handleToggle as EventListener);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isPDP]);

  if (isAdmin || isCheckout) {
    return null;
  }

  // On PDP: only visible once user scrolls down to or past the offers section
  if (isPDP && !pdpPastOffers) {
    return null;
  }

  const isHome = pathname === "/";
  const isOrders = pathname?.startsWith("/profile");
  const isCatalog = pathname === "/products";

  return (
    <>
      {/* ========================================================================= */}
      {/* STICKY MOBILE BOTTOM NAVIGATION BAR (Exact match to screenshot)           */}
      {/* ========================================================================= */}
      <nav
        aria-label="Mobile Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-neutral-200/90 py-2 px-6 flex items-center justify-around md:hidden shadow-[0_-2px_12px_rgba(0,0,0,0.06)] animate-in fade-in slide-in-from-bottom duration-200"
      >
        {/* 1. Home */}
        <Link
          href="/"
          className={`flex flex-col items-center gap-1 transition-colors cursor-pointer ${
            isHome
              ? "text-[#023915] font-bold"
              : "text-neutral-800 hover:text-[#023915] font-medium"
          }`}
        >
          <Home
            className={`size-5.5 stroke-[1.75] ${
              isHome ? "text-[#023915]" : "text-neutral-800"
            }`}
          />
          <span className="text-[11px] tracking-tight leading-tight">Home</span>
        </Link>

        {/* 2. Orders */}
        <Link
          href="/profile?tab=orders"
          className={`flex flex-col items-center gap-1 transition-colors cursor-pointer ${
            isOrders
              ? "text-[#023915] font-bold"
              : "text-neutral-800 hover:text-[#023915] font-medium"
          }`}
        >
          <User
            className={`size-5.5 stroke-[1.75] ${
              isOrders ? "text-[#023915]" : "text-neutral-800"
            }`}
          />
          <span className="text-[11px] tracking-tight leading-tight">Orders</span>
        </Link>

        {/* 3. Browse */}
        <button
          type="button"
          onClick={() => setBrowseOpen(true)}
          className={`flex flex-col items-center gap-1 transition-colors cursor-pointer ${
            browseOpen || isCatalog
              ? "text-[#023915] font-bold"
              : "text-neutral-800 hover:text-[#023915] font-medium"
          }`}
        >
          <Menu
            className={`size-5.5 stroke-[1.75] ${
              browseOpen || isCatalog ? "text-[#023915]" : "text-neutral-800"
            }`}
          />
          <span className="text-[11px] tracking-tight leading-tight">Browse</span>
        </button>
      </nav>

      {/* ========================================================================= */}
      {/* BROWSE CATEGORIES & REMEDIES DRAWER                                       */}
      {/* ========================================================================= */}
      {browseOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setBrowseOpen(false)}
          />

          {/* Drawer Body */}
          <div className="relative ml-auto flex h-full w-[85%] max-w-sm flex-col bg-white p-5 shadow-2xl animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-[#023915]" />
                <h3 className="text-base font-bold text-neutral-900 uppercase tracking-tight">
                  Browse Remedies
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setBrowseOpen(false)}
                className="rounded-full p-1.5 text-neutral-500 hover:bg-neutral-100 cursor-pointer"
                aria-label="Close browse drawer"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Scrollable Links List */}
            <div className="flex-1 overflow-y-auto py-4 space-y-2">
              <Link
                href="/products?title=Best+Sellers"
                onClick={() => setBrowseOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl bg-[#c2d4c5]/25 font-bold text-sm text-[#023915] transition hover:bg-[#c2d4c5]/40"
              >
                <span>⭐ Best Sellers</span>
                <ChevronRight className="size-4" />
              </Link>

              <Link
                href="/products?title=Fresh+Arrivals"
                onClick={() => setBrowseOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl bg-neutral-100/70 font-bold text-sm text-neutral-800 hover:bg-neutral-100 transition"
              >
                <span>✨ Fresh Arrivals</span>
                <ChevronRight className="size-4" />
              </Link>

              <div className="pt-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 px-1">
                  Shop by Health Concern
                </span>
                <div className="mt-2 space-y-1">
                  {[
                    { label: "Sugar Management", href: "/products?title=Sugar+Management", icon: "🩸" },
                    { label: "Gym & Fitness", href: "/products?title=Gym+%26+Fitness", icon: "💪" },
                    { label: "Energy & Vitality", href: "/products?title=Energy+%26+Vitality", icon: "⚡" },
                    { label: "Heart Health", href: "/products?title=Heart+Health", icon: "🫀" },
                    { label: "Liver Care", href: "/products?title=Liver+Care", icon: "🌿" },
                    { label: "Daily Ayurveda", href: "/products?title=Daily+Ayurveda", icon: "🍵" },
                    { label: "Skin & Hair", href: "/products?title=Skin+%26+Hair", icon: "✨" },
                    { label: "Women's Health", href: "/products?title=Women%27s+Health", icon: "🌸" },
                  ].map((cat) => (
                    <Link
                      key={cat.label}
                      href={cat.href}
                      onClick={() => setBrowseOpen(false)}
                      className="flex items-center justify-between p-2.5 rounded-lg text-xs font-semibold text-neutral-700 hover:bg-neutral-50 hover:text-[#023915] transition"
                    >
                      <span className="flex items-center gap-2">
                        <span>{cat.icon}</span>
                        <span>{cat.label}</span>
                      </span>
                      <ChevronRight className="size-3.5 text-neutral-400" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* View All Products Button */}
              <div className="pt-4">
                <Link
                  href="/products"
                  onClick={() => setBrowseOpen(false)}
                  className="block w-full py-2.5 rounded-xl border border-neutral-800 text-center text-xs font-bold uppercase tracking-wider text-neutral-900 hover:bg-neutral-900 hover:text-white transition"
                >
                  View All Products
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
