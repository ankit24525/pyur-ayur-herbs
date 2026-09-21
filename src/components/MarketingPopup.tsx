"use client";

import { useState, useEffect, useRef } from "react";
import { X, Copy, Check, Sparkles, Tag, ArrowRight } from "lucide-react";
import Link from "next/link";

interface MarketingPopupProps {
  popups?: Array<{
    id?: string;
    title?: string;
    subtitle?: string;
    discount?: string;
    couponCode?: string;
    image?: string;
    trigger?: string;
    ctaText?: string;
    status?: string;
  }>;
}

const FALLBACK_POPUP = {
  id: "pop_1",
  title: "Wait! Claim Extra 10% Off Your Order",
  subtitle: "Join 50,000+ satisfied customers who restored vitality & wellness with certified Ayurvedic formulations.",
  discount: "FLAT 10% OFF",
  couponCode: "PURE10",
  image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80",
  trigger: "Exit Intent",
  ctaText: "Claim Coupon & Shop Now",
  status: "Active",
};

export default function MarketingPopup({ popups = [] }: MarketingPopupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const hasTriggeredRef = useRef(false);

  // If popups list is empty or hasn't loaded, use default fallback.
  // If popups list exists and all are explicitly "Inactive", don't show.
  const activePopup =
    popups.length === 0
      ? FALLBACK_POPUP
      : popups.find((p) => p.status === "Active") || null;

  useEffect(() => {
    if (!activePopup || (typeof window !== "undefined" && activePopup.status === "Inactive")) return;

    // Purge any stale permanent dismissal locks stored in localStorage from earlier builds
    try {
      if (typeof window !== "undefined") {
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith("pyur_popup_dismissed_")) {
            localStorage.removeItem(key);
          }
        });
      }
    } catch {}

    const popupKey = `pyur_popup_dismissed_${activePopup.id || "pop_1"}`;

    // Check query params for instant preview / force show (e.g. ?popup=1 or #popup)
    const isForced =
      typeof window !== "undefined" &&
      (window.location.search.includes("popup") ||
        window.location.search.includes("preview") ||
        window.location.hash.includes("popup"));

    if (!isForced && typeof window !== "undefined") {
      const dismissedTimestamp = sessionStorage.getItem(popupKey);
      if (dismissedTimestamp) {
        const elapsed = Date.now() - parseInt(dismissedTimestamp, 10);
        // Only suppress for 2 minutes in the same session
        if (!isNaN(elapsed) && elapsed < 2 * 60 * 1000) {
          return;
        }
      }
    }

    const triggerOpen = () => {
      if (!hasTriggeredRef.current) {
        hasTriggeredRef.current = true;
        setIsOpen(true);
      }
    };

    // If forced via URL query, open immediately
    if (isForced) {
      const timer = setTimeout(triggerOpen, 600);
      return () => clearTimeout(timer);
    }

    const triggerType = (activePopup.trigger || "Exit Intent").toLowerCase();

    // 1. Exit Intent Listeners (Desktop mouse leaving toward top/address bar)
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 35) {
        triggerOpen();
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      if ((!e.relatedTarget || (e.relatedTarget as HTMLElement)?.nodeName === "HTML") && e.clientY <= 35) {
        triggerOpen();
      }
    };

    // 2. Scroll Depth trigger
    const handleScroll = () => {
      if (hasTriggeredRef.current) return;
      const scrollTotal = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollTotal > 0 && window.scrollY / scrollTotal > 0.35) {
        triggerOpen();
      }
    };

    // 3. Fallback auto-timer: Guarantees user actually sees the popup after 4.5s
    // even if they don't move the mouse to the top edge of the screen!
    const autoTimer = setTimeout(triggerOpen, 4500);

    if (triggerType.includes("scroll")) {
      window.addEventListener("scroll", handleScroll, { passive: true });
    } else {
      document.documentElement.addEventListener("mouseleave", handleMouseLeave);
      document.addEventListener("mouseout", handleMouseOut);
    }

    // Allow manual programmatic trigger from console or Admin: window.dispatchEvent(new Event("pyur_show_popup"))
    const handleCustomTrigger = () => triggerOpen();
    window.addEventListener("pyur_show_popup", handleCustomTrigger);

    return () => {
      clearTimeout(autoTimer);
      document.documentElement.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseout", handleMouseOut);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("pyur_show_popup", handleCustomTrigger);
    };
  }, [activePopup]);

  if (!isOpen || !activePopup) return null;

  const handleDismiss = () => {
    setIsOpen(false);
    if (typeof window !== "undefined") {
      const popupKey = `pyur_popup_dismissed_${activePopup.id || "pop_1"}`;
      sessionStorage.setItem(popupKey, String(Date.now()));
    }
  };

  const handleCopyCode = () => {
    const code = activePopup.couponCode || "PURE10";
    try {
      navigator.clipboard.writeText(code);
      setCopied(true);
      if (typeof window !== "undefined") {
        localStorage.setItem("pyur_applied_coupon", code);
      }
      setTimeout(() => setCopied(false), 2500);
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dimmed backdrop with blur */}
      <div
        className="fixed inset-0 bg-black/65 backdrop-blur-xs transition-opacity duration-300"
        onClick={handleDismiss}
        aria-hidden="true"
      />

      {/* Popup Dialog Content */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-full max-w-md sm:max-w-lg overflow-hidden rounded-3xl border border-[#ddddd9] bg-white shadow-2xl transition-all duration-300 animate-in fade-in zoom-in-95"
      >
        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute right-3.5 top-3.5 z-20 flex size-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition hover:bg-black cursor-pointer shadow-md"
          aria-label="Close promotion popup"
        >
          <X className="size-4" />
        </button>

        {/* Header Graphic */}
        {activePopup.image && (
          <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-[#eef5df]">
            <img
              src={activePopup.image}
              alt={activePopup.title || "Ayurvedic Offer"}
              className="h-full w-full object-cover"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f2c94c] px-3 py-0.5 text-[11px] font-black uppercase tracking-wider text-[#17231b] shadow-sm">
                <Sparkles className="size-3.5" />
                {activePopup.discount || "FLAT 10% OFF"}
              </span>
              <span className="text-[11px] font-bold text-white/90">Limited Time Only</span>
            </div>
          </div>
        )}

        {/* Body Content */}
        <div className="p-6 sm:p-7 text-center">
          {!activePopup.image && (
            <div className="mx-auto mb-3 inline-flex items-center gap-1.5 rounded-full bg-[#80a03c]/15 px-3 py-1 text-xs font-black uppercase tracking-wider text-[#244f31]">
              <Tag className="size-3.5" />
              {activePopup.discount || "FLAT 10% OFF"}
            </div>
          )}

          <h3 className="text-xl sm:text-2xl font-black text-[#17231b] leading-tight">
            {activePopup.title || "Wait! Claim Extra 10% Off Your Order"}
          </h3>

          <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[#666666]">
            {activePopup.subtitle ||
              "Join 50,000+ happy customers restoring vitality and wellness with certified Ayurvedic remedies. Use our exclusive coupon code at checkout."}
          </p>

          {/* Coupon Code Section */}
          <div className="mt-5 rounded-2xl border-2 border-dashed border-[#80a03c] bg-[#f8faf1] p-3.5 sm:p-4">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#244f31]">
              Apply Coupon At Checkout
            </div>
            <div className="mt-2 flex items-center justify-center gap-2">
              <span className="font-mono text-xl sm:text-2xl font-black tracking-widest text-[#17231b]">
                {activePopup.couponCode || "PURE10"}
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-black uppercase tracking-wider transition shadow-xs cursor-pointer ${
                  copied
                    ? "bg-[#244f31] text-white"
                    : "bg-[#244f31] text-white hover:bg-[#1b3b24]"
                }`}
              >
                {copied ? (
                  <>
                    <Check className="size-3.5 text-[#f2c94c]" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="size-3.5" />
                    Copy Code
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col gap-2.5">
            <Link
              href="#shop"
              onClick={() => {
                handleCopyCode();
                handleDismiss();
              }}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#244f31] py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-md transition hover:bg-[#1b3b24] cursor-pointer"
            >
              <span>{activePopup.ctaText || "Claim Discount & Shop Now"}</span>
              <ArrowRight className="size-4" />
            </Link>

            <button
              type="button"
              onClick={handleDismiss}
              className="text-[11px] font-semibold text-[#888888] hover:text-[#17231b] hover:underline cursor-pointer"
            >
              No thanks, I will shop without discount
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
