"use client";

import { useState, useEffect } from "react";
import { CheckCircle, X, ShoppingBag } from "lucide-react";

interface NotificationItem {
  id?: string;
  title: string;
  type?: string;
  delay?: string;
  message?: string;
  status?: string;
}

interface SocialProofToastProps {
  notifications?: NotificationItem[];
}

const SAMPLE_ORDERS = [
  { name: "Rajesh K.", city: "Pune, MH", product: "Virja Vitality Powder", time: "3 mins ago" },
  { name: "Priya S.", city: "Bengaluru, KA", product: "Madhunashi Sugar Care", time: "6 mins ago" },
  { name: "Vikram M.", city: "New Delhi", product: "Gold Shilajit Majun", time: "11 mins ago" },
  { name: "Ananya D.", city: "Jaipur, RJ", product: "Ayurvedic Fat Burn Tonic", time: "15 mins ago" },
  { name: "Suresh P.", city: "Indore, MP", product: "Virja Vitality Powder", time: "8 mins ago" },
  { name: "Sunita G.", city: "Lucknow, UP", product: "Body Toning Herbal Cream", time: "19 mins ago" },
];

export default function SocialProofToast({ notifications = [] }: SocialProofToastProps) {
  const [currentOrder, setCurrentOrder] = useState<typeof SAMPLE_ORDERS[0] | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Check if live social proof is active in admin notifications
  const isSocialProofActive = notifications.some(
    (n) =>
      n.status === "Active" &&
      ((n.type && n.type.toLowerCase().includes("social proof")) ||
        (n.title && n.title.toLowerCase().includes("social proof")) ||
        (n.title && n.title.toLowerCase().includes("toast")))
  );

  useEffect(() => {
    if (!isSocialProofActive || dismissed || typeof window === "undefined") return;

    let index = 0;
    let hideTimeout: NodeJS.Timeout;

    // Initial display delay after 5 seconds of browsing
    const initialDelay = setTimeout(() => {
      setCurrentOrder(SAMPLE_ORDERS[0]);
      setIsVisible(true);
      hideTimeout = setTimeout(() => setIsVisible(false), 5000);
    }, 5000);

    // Loop every 14 seconds
    const interval = setInterval(() => {
      index = (index + 1) % SAMPLE_ORDERS.length;
      setCurrentOrder(SAMPLE_ORDERS[index]);
      setIsVisible(true);
      hideTimeout = setTimeout(() => setIsVisible(false), 5000);
    }, 14000);

    return () => {
      clearTimeout(initialDelay);
      clearTimeout(hideTimeout);
      clearInterval(interval);
    };
  }, [isSocialProofActive, dismissed]);

  if (!isSocialProofActive || dismissed || !currentOrder || !isVisible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-20 left-4 z-40 max-w-xs sm:max-w-sm rounded-2xl border border-[#ddddd9] bg-white/95 p-3.5 shadow-2xl backdrop-blur-md transition-all duration-500 animate-in slide-in-from-bottom-5 fade-in"
    >
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#eef5df] text-[#244f31]">
          <ShoppingBag className="size-5" />
        </div>

        <div className="flex-1 pr-4">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#244f31]">
            <CheckCircle className="size-3.5 text-[#244f31]" />
            <span>Verified Purchase</span>
            <span className="text-gray-400">•</span>
            <span className="font-normal text-gray-500">{currentOrder.time}</span>
          </div>

          <p className="mt-0.5 text-xs text-[#17231b] leading-tight">
            <strong>{currentOrder.name}</strong> ({currentOrder.city}) purchased{" "}
            <span className="font-semibold text-[#244f31]">{currentOrder.product}</span>
          </p>
        </div>

        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 text-gray-400 hover:text-gray-600 cursor-pointer p-0.5"
          aria-label="Dismiss notification"
        >
          <X className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
