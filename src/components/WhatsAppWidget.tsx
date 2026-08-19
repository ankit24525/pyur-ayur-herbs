"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

export default function WhatsAppWidget() {
  const [whatsappNumber, setWhatsappNumber] = useState("919876543210");
  const [whatsappMessage, setWhatsappMessage] = useState("नमस्ते! मुझे आपकी वेबसाइट से ऑर्डर करने में मदद चाहिए।");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/all", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
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
    { label: "Track my Order 📦", keyword: "I want to track my order." },
    { label: "Product Recommendation 🩺", keyword: "I need a product recommendation." },
    { label: "Talk to Support Agent 👤", keyword: "I want to speak with a support agent." },
  ];

  // Determine final pre-filled text to route to WhatsApp Business chatbot
  const getPrefilledText = () => {
    if (!selectedOption) return whatsappMessage;
    const match = options.find((opt) => opt.label === selectedOption);
    return match ? match.keyword : whatsappMessage;
  };

  const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanNumber}&text=${encodeURIComponent(getPrefilledText())}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Interactive Chatbot Drawer */}
      {isOpen && (
        <div className="mb-4 w-[310px] sm:w-[350px] bg-white rounded-2xl border border-neutral-100 shadow-[0_8px_30px_rgba(0,0,0,0.15)] overflow-hidden animate-in slide-in-from-bottom-5 duration-300 origin-bottom-right">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#128c7e] to-[#25d366] text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Profile Avatar / Bot Icon */}
              <div className="relative size-9 bg-white/20 rounded-full flex items-center justify-center font-bold text-lg text-white border border-white/20">
                🌿
                <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-400 border border-white animate-pulse" />
              </div>
              <div>
                <h4 className="text-sm font-bold leading-tight">Pyur Ayur Bot</h4>
                <p className="text-[10px] text-white/80">Typically replies instantly</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition p-1 hover:bg-white/10 rounded-lg"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Conversation Bubble Panel */}
          <div className="h-[250px] overflow-y-auto p-4 space-y-3 bg-[#e5ddd5]/95 relative" style={{ backgroundImage: "radial-gradient(#dfdcd6 1px, transparent 1px)", backgroundColor: "#efeae2", backgroundSize: "12px 12px" }}>
            
            {/* Bot message bubble */}
            <div className="flex items-start max-w-[85%] animate-in fade-in-50 duration-200">
              <div className="bg-white text-neutral-800 text-xs p-3 rounded-2xl rounded-tl-none shadow-sm font-medium leading-relaxed">
                Namaste! Welcome to Pyur Ayur Herbs. 🌿 How can I help you today?
              </div>
            </div>

            {/* Quick replies selections */}
            {!selectedOption ? (
              <div className="space-y-2 pt-2 max-w-[90%] animate-in fade-in duration-300">
                <p className="text-[10px] uppercase tracking-wider font-bold text-neutral-500 px-1 mb-1">Select an Option:</p>
                {options.map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => setSelectedOption(opt.label)}
                    className="w-full text-left text-xs bg-white hover:bg-neutral-50 border border-neutral-200 text-[#244f31] font-bold py-2.5 px-3.5 rounded-xl transition shadow-xs hover:scale-[1.01] active:scale-95 duration-200 block"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            ) : (
              <>
                {/* User selection message bubble */}
                <div className="flex items-start justify-end w-full animate-in slide-in-from-right-3 duration-200">
                  <div className="bg-[#d9fdd3] text-neutral-800 text-xs p-3 rounded-2xl rounded-tr-none shadow-sm font-semibold max-w-[85%] leading-relaxed">
                    {selectedOption}
                  </div>
                </div>

                {/* Bot routing message bubble */}
                <div className="flex items-start max-w-[85%] animate-in fade-in duration-300 delay-100">
                  <div className="bg-white text-neutral-800 text-xs p-3 rounded-2xl rounded-tl-none shadow-sm font-medium leading-relaxed">
                    Sure! Let's get that sorted. Click the button below to send this query directly to our automated WhatsApp Business chat.
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Action Footer Button */}
          <div className="p-3.5 bg-white border-t border-neutral-100 flex flex-col gap-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#128c7e] to-[#25d366] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-95 transition-all duration-200"
            >
              {/* WhatsApp Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.451 5.437.002 9.861-4.416 9.864-9.852.002-2.634-1.02-5.11-2.877-6.97C16.398 1.954 13.929.932 11.3.93 5.86.93 1.436 5.352 1.433 10.79c-.001 1.562.415 3.09 1.202 4.457l-1.022 3.73 3.823-.997c1.332.727 2.768 1.173 4.21 1.174zM17.91 14.6c-.328-.164-1.937-.957-2.228-1.063-.292-.107-.504-.16-.714.164-.212.324-.816 1.034-1.002 1.246-.184.212-.37.238-.698.074a9.92 9.92 0 0 1-2.588-1.6c-.733-.653-1.228-1.46-1.372-1.706-.145-.246-.015-.38.118-.513.12-.12.29-.324.437-.487.143-.163.19-.278.286-.464.095-.185.048-.348-.024-.487-.07-.14-.714-1.72-.98-2.355-.26-.623-.523-.538-.715-.538-.184 0-.397-.013-.61-.013-.213 0-.56.08-.853.4-.294.32-1.12 1.1-1.12 2.68 0 1.58 1.15 3.11 1.31 3.32.16.21 2.26 3.45 5.48 4.84.766.331 1.364.53 1.83.678.77.24 1.472.21 2.023.12.617-.09 1.938-.79 2.21-1.56.275-.77.275-1.43.192-1.56-.082-.13-.3-.21-.627-.375z" />
              </svg>
              <span>Start Chat on WhatsApp</span>
            </a>
            {selectedOption && (
              <button
                onClick={() => setSelectedOption(null)}
                className="text-[10px] text-neutral-400 hover:text-neutral-600 font-bold transition text-center hover:underline"
              >
                Back to Options
              </button>
            )}
          </div>
        </div>
      )}

      {/* Floating Button Trigger */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) setSelectedOption(null); // Reset when opening
        }}
        className="flex size-14 items-center justify-center rounded-full bg-gradient-to-b from-[#5dd95b] to-[#3aa339] text-white shadow-[0_4px_10px_rgba(0,0,0,0.35)] hover:scale-110 active:scale-95 transition-all duration-300 group"
        aria-label="Toggle WhatsApp Chatbot Panel"
      >
        {/* Support Online Tooltip (Desktop only, hidden when panel is open) */}
        {!isOpen && (
          <span className="absolute right-16 hidden md:inline-flex items-center gap-1.5 whitespace-nowrap bg-white text-[#17231b] border border-[#ddddd9] shadow-md rounded-lg px-3 py-1.5 text-xs font-bold transition-all duration-300 scale-90 group-hover:scale-100 opacity-0 group-hover:opacity-100 pointer-events-none origin-right">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Support Online</span>
          </span>
        )}

        {/* Dynamic icon depending on open state */}
        {isOpen ? (
          <X className="size-6 transition-transform rotate-0" />
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="size-8 transition-transform group-hover:scale-105"
          >
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.451 5.437.002 9.861-4.416 9.864-9.852.002-2.634-1.02-5.11-2.877-6.97C16.398 1.954 13.929.932 11.3.93 5.86.93 1.436 5.352 1.433 10.79c-.001 1.562.415 3.09 1.202 4.457l-1.022 3.73 3.823-.997c1.332.727 2.768 1.173 4.21 1.174zM17.91 14.6c-.328-.164-1.937-.957-2.228-1.063-.292-.107-.504-.16-.714.164-.212.324-.816 1.034-1.002 1.246-.184.212-.37.238-.698.074a9.92 9.92 0 0 1-2.588-1.6c-.733-.653-1.228-1.46-1.372-1.706-.145-.246-.015-.38.118-.513.12-.12.29-.324.437-.487.143-.163.19-.278.286-.464.095-.185.048-.348-.024-.487-.07-.14-.714-1.72-.98-2.355-.26-.623-.523-.538-.715-.538-.184 0-.397-.013-.61-.013-.213 0-.56.08-.853.4-.294.32-1.12 1.1-1.12 2.68 0 1.58 1.15 3.11 1.31 3.32.16.21 2.26 3.45 5.48 4.84.766.331 1.364.53 1.83.678.77.24 1.472.21 2.023.12.617-.09 1.938-.79 2.21-1.56.275-.77.275-1.43.192-1.56-.082-.13-.3-.21-.627-.375z" />
          </svg>
        )}
      </button>
    </div>
  );
}
