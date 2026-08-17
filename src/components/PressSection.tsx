"use client";

export default function PressSection() {
  const pressLogos = [
    "NDTV",
    "THE ECONOMIC TIMES",
    "FORBES INDIA",
    "VOGUE",
    "TIMES OF INDIA",
    "FINANCIAL EXPRESS",
  ];

  return (
    <section className="bg-[#17231b] py-8 text-white">
      <div className="mx-auto max-w-[1440px] px-4 md:px-6">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <span className="shrink-0 text-xs font-black uppercase tracking-widest text-[#80a03c]">
            AS FEATURED IN
          </span>

          <div className="no-scrollbar flex flex-wrap items-center justify-center gap-8 opacity-80 md:justify-end">
            {pressLogos.map((logo, idx) => (
              <span
                key={idx}
                className="text-xs font-black tracking-widest text-white/90 hover:opacity-100 md:text-sm"
              >
                {logo}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
