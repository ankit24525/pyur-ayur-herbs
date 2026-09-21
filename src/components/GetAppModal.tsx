"use client";

import { useEffect } from "react";
import { X, Smartphone, Bell, CheckCircle2 } from "lucide-react";

interface GetAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  whatsappNumber?: string;
}

export default function GetAppModal({
  isOpen,
  onClose,
  whatsappNumber = "917247824101",
}: GetAppModalProps) {
  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const cleanNumber = whatsappNumber.replace(/\D/g, "") || "917247824101";
  const notifyUrl = `https://api.whatsapp.com/send?phone=${cleanNumber}&text=${encodeURIComponent(
    "Namaste! Please notify me when the Pure Ayur mobile app is launched on Android & iOS. 🌿"
  )}`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="get-app-title"
        className="relative z-10 w-full max-w-sm rounded-3xl bg-white p-6 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.25)] border border-[#e4ecdc] text-center overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Decorative Top Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#244f31] via-[#80a03c] to-[#25D366]" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          aria-label="Close modal"
        >
          <X className="size-5" />
        </button>

        {/* Smartphone Icon with Animated Sparkle */}
        <div className="relative mx-auto mt-2 mb-4 size-16 rounded-2xl bg-gradient-to-br from-[#244f31] to-[#17231b] flex items-center justify-center shadow-lg shadow-emerald-950/20 border border-[#3b6d49]">
          <Smartphone className="size-8 text-[#f2c94c]" />
          <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-5 w-5 bg-amber-500 items-center justify-center text-[10px] text-white font-black shadow-xs">
              ✨
            </span>
          </span>
        </div>

        {/* Coming Soon Pill Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#128C7E] border border-emerald-200 text-xs font-black uppercase tracking-wider mb-2.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#25D366]"></span>
          </span>
          <span>Launching Soon</span>
        </div>

        {/* Title */}
        <h3 id="get-app-title" className="text-xl font-black text-[#17231b] tracking-tight">
          Pure Ayur Mobile App
        </h3>

        {/* Description */}
        <p className="mt-2 text-xs text-neutral-600 leading-relaxed font-medium">
          Our official iOS & Android app is currently under final testing. Experience ancient Ayurvedic wisdom perfected for your smartphone very soon!
        </p>

        {/* App Highlights */}
        <div className="my-5 rounded-2xl bg-[#f8faf1] border border-[#e8eed9] p-3 text-left space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#17231b]">
            <CheckCircle2 className="size-4 text-[#80a03c] shrink-0" />
            <span>1-Tap Free Consultations with Ayurvedic Vaidyas</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#17231b]">
            <CheckCircle2 className="size-4 text-[#80a03c] shrink-0" />
            <span>App-First 15% OFF & 2X Pure Coins Rewards</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#17231b]">
            <CheckCircle2 className="size-4 text-[#80a03c] shrink-0" />
            <span>Real-time Dosage Reminders & Order Tracking</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          {/* Notify on WhatsApp */}
          <a
            href={notifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white py-3 px-4 text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all active:scale-98"
          >
            <Bell className="size-4" />
            <span>Notify Me on Launch</span>
          </a>

          {/* Close / Continue Shopping */}
          <button
            onClick={onClose}
            className="w-full rounded-xl border border-neutral-200 hover:border-neutral-300 py-2.5 text-xs font-bold text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
          >
            Continue Shopping on Web
          </button>
        </div>
      </div>
    </div>
  );
}
