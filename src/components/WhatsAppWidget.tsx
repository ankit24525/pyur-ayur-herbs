"use client";

import { useState, useEffect } from "react";
import { X, CheckCheck, Sparkles, MessageCircle } from "lucide-react";
import { getStorefrontData } from "@/lib/storefront-client";

export default function WhatsAppWidget() {
  const [whatsappNumber, setWhatsappNumber] = useState("917247824101");
  const [whatsappMessage, setWhatsappMessage] = useState("नमस्ते! मुझे आपकी वेबसाइट से ऑर्डर करने में मदद चाहिए।");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  useEffect(() => {
    getStorefrontData()
      .then((data) => {
        if (data && data.settings) {
          if (data.settings.whatsappNumber) setWhatsappNumber(data.settings.whatsappNumber);
          if (data.settings.whatsappMessage) setWhatsappMessage(data.settings.whatsappMessage);
        }
      })
      .catch((e) => console.error("Error loading WhatsApp widget config:", e));
  }, []);

  let cleanNumber = whatsappNumber.replace(/\D/g, "");
  if (cleanNumber.length === 10) {
    cleanNumber = "91" + cleanNumber;
  }

  // Pre-defined chatbot quick replies
  const options = [
    { label: "🌿 Free Doctor Consultation", keyword: "Namaste! I would like a personalized Ayurvedic consultation." },
    { label: "📦 Track My Order", keyword: "Namaste! I want to track the status of my order." },
    { label: "💊 Dosage & Guidance", keyword: "Namaste! I need dosage guidance and product recommendations." },
    { label: "💬 Speak to Support Agent", keyword: "Namaste! I would like to speak with a customer care agent." },
  ];

  // Determine final pre-filled text to route to WhatsApp Business chatbot
  const getPrefilledText = () => {
    if (!selectedOption) return whatsappMessage;
    const match = options.find((opt) => opt.label === selectedOption);
    return match ? match.keyword : whatsappMessage;
  };

  const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanNumber}&text=${encodeURIComponent(getPrefilledText())}`;

  // Pixel-perfect official WhatsApp Logo component
  const WhatsAppIcon = ({ className = "size-7" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className={className}>
      <path
        fill="#ffffff"
        fillRule="evenodd"
        d="M16 2.667C8.636 2.667 2.667 8.636 2.667 16c0 2.507.694 4.854 1.897 6.852L2.667 29.333l6.666-1.854A13.28 13.28 0 0 0 16 29.333c7.364 0 13.333-5.97 13.333-13.333C29.333 8.636 23.364 2.667 16 2.667z"
      />
      <path
        fill="#25D366"
        fillRule="evenodd"
        d="M22.95 18.77c-.38-.19-2.25-1.11-2.6-1.24-.35-.13-.6-.19-.85.19-.25.38-.98 1.24-1.2 1.49-.22.25-.45.28-.83.09a10.4 10.4 0 0 1-3.08-1.9 11.5 11.5 0 0 1-2.13-2.65c-.22-.38-.02-.59.17-.78.17-.17.38-.45.57-.67.19-.22.25-.38.38-.63.13-.25.06-.48-.03-.67-.09-.19-.85-2.07-1.17-2.84-.31-.75-.63-.65-.86-.66-.22-.01-.48-.01-.73-.01-.25 0-.67.09-1.02.48-.35.38-1.34 1.31-1.34 3.19 0 1.88 1.37 3.7 1.56 3.96.19.25 2.7 4.13 6.54 5.79.91.39 1.63.63 2.18.81.92.29 1.76.25 2.42.15.74-.11 2.25-.92 2.57-1.81.32-.89.32-1.65.22-1.81-.09-.16-.35-.25-.73-.45z"
      />
    </svg>
  );

  return (
    <div className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end">
      {/* Interactive WhatsApp Business Drawer */}
      {isOpen && (
        <div className="mb-4 w-[calc(100vw-2rem)] max-w-[360px] bg-white rounded-3xl border border-neutral-200/80 shadow-[0_16px_48px_rgba(0,0,0,0.22)] overflow-hidden animate-in slide-in-from-bottom-5 zoom-in-95 duration-200 origin-bottom-right">
          {/* Official WhatsApp Business Header */}
          <div className="bg-gradient-to-r from-[#075E54] to-[#128C7E] text-white p-4 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              {/* Doctor Avatar with Verified Badge */}
              <div className="relative size-11 rounded-full bg-white/15 border-2 border-white/30 flex items-center justify-center text-2xl shadow-inner">
                <span>🌿</span>
                <span className="absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full bg-[#25D366] border-2 border-white flex items-center justify-center shadow-xs">
                  <span className="size-1.5 rounded-full bg-white animate-pulse" />
                </span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-bold tracking-tight text-white leading-tight">Pure Ayur Vaidya</h4>
                  <svg className="size-3.5 text-[#25D366] fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                </div>
                <p className="text-[11px] text-emerald-100/90 font-medium flex items-center gap-1.5 mt-0.5">
                  <span className="size-1.5 rounded-full bg-[#25D366] inline-block"></span>
                  Verified Business • Typically replies in 2m
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition p-1.5 hover:bg-white/15 rounded-full"
              aria-label="Close Chat"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Conversation Bubble Panel */}
          <div
            className="h-[270px] overflow-y-auto p-4 space-y-3 relative"
            style={{
              backgroundColor: "#efeae2",
              backgroundImage:
                "radial-gradient(#dfdcd6 1px, transparent 1px), radial-gradient(#dfdcd6 1px, #efeae2 1px)",
              backgroundSize: "20px 20px",
              backgroundPosition: "0 0, 10px 10px",
            }}
          >
            {/* Encryption Security Badge */}
            <div className="flex justify-center my-1">
              <span className="bg-[#ffeecd] text-[#54656f] text-[10px] font-semibold px-3 py-1 rounded-lg shadow-xs text-center inline-flex items-center gap-1">
                🔒 Messages are end-to-end encrypted
              </span>
            </div>

            {/* Doctor Bot Greeting Message Bubble */}
            <div className="flex items-start max-w-[88%] animate-in fade-in-50 duration-200">
              <div className="bg-white text-neutral-800 text-xs p-3 rounded-2xl rounded-tl-none shadow-sm font-medium leading-relaxed border border-neutral-100">
                <p className="font-semibold text-[#128C7E] mb-1 flex items-center gap-1">
                  <span>Namaste!</span> 🌿
                </p>
                Welcome to <strong>Pure Ayur Herbs</strong>. How may our certified Ayurvedic doctors assist you today?
                <div className="flex justify-end items-center gap-1 mt-1 text-[9px] text-neutral-400">
                  <span>Just now</span>
                  <CheckCheck className="size-3 text-[#53bdeb]" />
                </div>
              </div>
            </div>

            {/* Quick Consultation Chips */}
            {!selectedOption ? (
              <div className="space-y-2 pt-1 max-w-[95%] animate-in fade-in duration-300">
                <p className="text-[10px] uppercase tracking-wider font-bold text-neutral-500 px-1">
                  Tap to Start Inquiry:
                </p>
                <div className="grid grid-cols-1 gap-1.5">
                  {options.map((opt) => (
                    <button
                      key={opt.label}
                      onClick={() => setSelectedOption(opt.label)}
                      className="w-full text-left text-xs bg-white hover:bg-emerald-50/80 border border-neutral-200/90 hover:border-emerald-300 text-neutral-800 hover:text-[#128C7E] font-semibold py-2.5 px-3.5 rounded-xl transition shadow-xs hover:shadow-sm active:scale-98 duration-150 flex items-center justify-between group"
                    >
                      <span>{opt.label}</span>
                      <span className="text-neutral-300 group-hover:text-[#128C7E] text-sm transition">→</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {/* User Selection Message Bubble */}
                <div className="flex items-start justify-end w-full animate-in slide-in-from-right-3 duration-200">
                  <div className="bg-[#d9fdd3] text-neutral-900 text-xs p-3 rounded-2xl rounded-tr-none shadow-sm font-medium max-w-[85%] leading-relaxed border border-[#c4f3bd]">
                    {selectedOption}
                    <div className="flex justify-end items-center gap-1 mt-1 text-[9px] text-neutral-500">
                      <span>Sent</span>
                      <CheckCheck className="size-3 text-[#53bdeb]" />
                    </div>
                  </div>
                </div>

                {/* Doctor Bot Routing Message Bubble */}
                <div className="flex items-start max-w-[88%] animate-in fade-in duration-300 delay-100">
                  <div className="bg-white text-neutral-800 text-xs p-3 rounded-2xl rounded-tl-none shadow-sm font-medium leading-relaxed border border-neutral-100">
                    Excellent choice! Click the button below to connect with our Ayurvedic consultant directly on WhatsApp.
                    <div className="flex justify-end items-center gap-1 mt-1 text-[9px] text-neutral-400">
                      <span>Just now</span>
                      <CheckCheck className="size-3 text-[#53bdeb]" />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Action Footer CTA */}
          <div className="p-3.5 bg-white border-t border-neutral-100 flex flex-col gap-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs flex items-center justify-center gap-2.5 shadow-[0_4px_14px_rgba(37,211,102,0.4)] hover:shadow-[0_6px_20px_rgba(37,211,102,0.5)] active:scale-98 transition-all duration-200"
            >
              <WhatsAppIcon className="size-5 shrink-0" />
              <span>Continue to WhatsApp</span>
              <span className="text-white/80 font-normal">→</span>
            </a>
            {selectedOption && (
              <button
                onClick={() => setSelectedOption(null)}
                className="text-[11px] text-neutral-400 hover:text-neutral-700 font-semibold transition text-center hover:underline py-0.5"
              >
                ← Choose another topic
              </button>
            )}
          </div>
        </div>
      )}

      {/* Floating Trigger Row */}
      <div className="flex items-center gap-2.5">
        {/* Luxury Floating Teaser Pill (visible when drawer is closed) */}
        {!isOpen && (
          <button
            onClick={() => {
              setIsOpen(true);
              setSelectedOption(null);
            }}
            className="hidden sm:inline-flex items-center gap-2 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-full shadow-[0_6px_20px_rgba(0,0,0,0.12)] border border-neutral-200/70 text-xs font-bold text-neutral-800 hover:border-emerald-300 hover:shadow-lg transition-all duration-300 hover:scale-105 group active:scale-95 text-left"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#25D366]"></span>
            </span>
            <span className="text-neutral-800 font-bold group-hover:text-[#128C7E] transition-colors">
              Chat with Doctor
            </span>
            <span className="bg-emerald-50 text-[#128C7E] text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200/60">
              Online
            </span>
          </button>
        )}

        {/* Circular Floating Trigger Button */}
        <div className="relative">
          {/* Subtle Ambient Radar Pulse Halo */}
          {!isOpen && (
            <span className="absolute -inset-1 rounded-full bg-[#25D366] opacity-35 animate-ping pointer-events-none" />
          )}

          <button
            onClick={() => {
              setIsOpen(!isOpen);
              if (!isOpen) setSelectedOption(null);
            }}
            className="relative flex size-14 items-center justify-center rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-[0_8px_24px_rgba(37,211,102,0.45)] hover:shadow-[0_12px_32px_rgba(37,211,102,0.6)] hover:scale-105 active:scale-95 transition-all duration-300 group"
            aria-label="Toggle WhatsApp Chatbot Panel"
          >
            {/* Dynamic Icon */}
            {isOpen ? (
              <X className="size-6 text-white transition-transform rotate-0 group-hover:rotate-90 duration-200" />
            ) : (
              <WhatsAppIcon className="size-8 transition-transform group-hover:scale-110 duration-200" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

