"use client";

import { useState } from "react";
import { Sparkles, X, Smartphone } from "lucide-react";

export default function AnnouncementBar({
  onOpenAppModal,
  data
}: {
  onOpenAppModal?: () => void;
  data?: { visible: boolean; text: string; code: string; btnText: string; link: string };
}) {
  const [visible, setVisible] = useState(true);

  const isVisible = data ? data.visible : true;
  const text = data ? data.text : "ADDITIONAL 10% OFF WITH PYUR COINS";
  const code = data ? data.code : "PYUR10";
  const btnText = data ? data.btnText : "GET APP";
  const link = data ? data.link : "#";

  if (!visible || !isVisible) return null;

  return (
    <div className="relative z-40 bg-[#1e3c27] text-white transition-all">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-3 py-2 text-xs md:px-6 md:py-2.5 lg:text-sm">
        {/* Close Button */}
        <button
          onClick={() => setVisible(false)}
          className="rounded p-1 text-white/80 transition hover:bg-white/10 hover:text-white"
          aria-label="Close announcement"
        >
          <X className="size-4" />
        </button>

        {/* Center Content */}
        <div className="flex flex-wrap items-center justify-center gap-2 font-medium tracking-wide text-center">
          <span className="inline-flex items-center gap-1 rounded bg-[#80a03c] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white md:text-xs">
            <Sparkles className="size-3" /> Special Offer
          </span>
          <span className="font-semibold text-white/95">
            {text}
          </span>
          {code && (
            <span className="hidden font-mono font-bold text-[#f2c94c] md:inline">
              | CODE: {code}
            </span>
          )}
        </div>

        {/* Get App Button */}
        <button
          onClick={link === "#" ? onOpenAppModal : () => { window.location.href = link; }}
          className="inline-flex items-center gap-1.5 rounded border border-[#80a03c] bg-[#80a03c] px-2.5 py-1 text-[11px] font-bold tracking-wider text-white shadow-sm transition hover:bg-[#6c8930] md:px-3.5 md:text-xs cursor-pointer animate-pulse-subtle"
        >
          <Smartphone className="size-3.5" />
          <span>{btnText}</span>
        </button>
      </div>
    </div>
  );
}
