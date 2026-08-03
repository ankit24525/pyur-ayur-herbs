import { Mail, Phone } from "lucide-react";

const navGroups = [
  ["SHOP ALL", "MY ACCOUNT", "FAQS", "WELLNESS GUIDE"],
  ["ABOUT US", "BLOG", "MEDIA", "CONTACT US"],
];

const marketplaces = [
  { name: "amazon.in", color: "text-[#3f4741]" },
  { name: "Flipkart", color: "text-[#2874f0]" },
  { name: "zepto", color: "text-[#9c1dff]" },
  { name: "instamart", color: "text-[#f36f31]" },
];

const payments = ["amazon pay", "BHIM UPI", "UPI", "GPay", "Mastercard", "RuPay", "VISA"];
const policies = ["Privacy Policy", "Terms and Conditions", "Shipping Policy", "Cancellation Policy"];

function PyurLogo() {
  return (
    <a href="/" className="inline-flex items-center bg-[#101510] px-4 py-3 text-white">
      <span className="text-[28px] font-light uppercase leading-none tracking-[0.18em]">PYUR</span>
      <span className="mx-2 h-7 w-px bg-white/70" />
      <span className="text-[16px] font-light uppercase leading-none tracking-[0.22em]">AYUR</span>
    </a>
  );
}

function InstagramMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-10" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <path d="M17.5 6.5h.01" />
    </svg>
  );
}

function FacebookMark() {
  return (
    <span className="flex size-10 items-center justify-center text-[42px] font-black leading-none" aria-hidden="true">
      f
    </span>
  );
}

function YoutubeMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-10" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 8.5a4 4 0 0 0-2.8-2.8C17.5 5.3 12 5.3 12 5.3s-5.5 0-7.2.4A4 4 0 0 0 2 8.5 24 24 0 0 0 1.6 12 24 24 0 0 0 2 15.5a4 4 0 0 0 2.8 2.8c1.7.4 7.2.4 7.2.4s5.5 0 7.2-.4a4 4 0 0 0 2.8-2.8 24 24 0 0 0 .4-3.5 24 24 0 0 0-.4-3.5Z" />
      <path d="m10 9 5 3-5 3Z" />
    </svg>
  );
}

function XMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-10" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m4 4 16 16M20 4 4 20" />
    </svg>
  );
}

export default function SiteFooter() {
  return (
    <footer className="flex flex-col bg-white text-black">
      <div className="flex w-full max-w-full flex-col gap-8 px-5 py-7 lg:flex-row lg:justify-between lg:gap-12">
        <article className="flex flex-col gap-7 lg:w-[24%]">
          <PyurLogo />

          <address className="not-italic text-[15px] font-bold italic leading-[1.35] tracking-[0.8px]">
            Pyur Ayur Herbs Wellness House,<br />
            Civil Lines,<br />
            Kanpur, Uttar Pradesh,<br />
            India 208008
          </address>

          <div className="flex flex-col gap-5">
            <a href="tel:18001234567" className="flex items-center gap-3 text-[22px] font-black tracking-[1px]">
              <Phone className="size-8 stroke-[1.3]" />
              1800-123-4567
            </a>
            <a href="mailto:care@pyurayurherbs.com" className="flex items-center gap-3 text-[22px] font-black tracking-[1px]">
              <Mail className="size-8 stroke-[1.3]" />
              care@pyurayurherbs.com
            </a>
          </div>
        </article>

        <article className="grid flex-1 gap-8 lg:grid-cols-[1.1fr_1.1fr_1.6fr]">
          <div className="grid grid-cols-2 gap-12 lg:col-span-2">
            {navGroups.map((group) => (
              <ul key={group.join("-")} className="space-y-6 text-[22px] font-black uppercase tracking-[0.8px]">
                {group.map((item) => (
                  <li key={item}>
                    <a href="/products" className={item === "MY ACCOUNT" ? "text-[#66852f]" : ""}>
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            ))}
          </div>

          <div>
            <p className="mb-4 text-[22px] font-black uppercase tracking-[0.8px]">FOLLOW US</p>
            <div className="flex items-center gap-5">
              <a href="#" aria-label="Instagram"><InstagramMark /></a>
              <a href="#" aria-label="Facebook"><FacebookMark /></a>
              <a href="#" aria-label="YouTube"><YoutubeMark /></a>
              <a href="#" aria-label="X"><XMark /></a>
            </div>
          </div>

          <div className="lg:col-span-2">
            <p className="mb-5 text-[15px] font-medium tracking-[1.4px]">Also available on:</p>
            <div className="flex flex-wrap items-center gap-9">
              {marketplaces.map((item) => (
                <span key={item.name} className={`text-[28px] font-black leading-none ${item.color}`}>
                  {item.name}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-5 text-[15px] font-medium tracking-[1.4px]">We Accept:</p>
            <div className="flex flex-wrap items-center gap-7">
              {payments.map((item) => (
                <span key={item} className="text-[13px] font-black text-[#4d5550]">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </article>
      </div>

      <ul className="flex w-full flex-wrap justify-between gap-4 px-5 pb-4 pt-2 text-center text-[15px] font-medium tracking-[1.3px]">
        {policies.map((item) => (
          <li key={item}>
            <a href="/policies">{item}</a>
          </li>
        ))}
      </ul>
    </footer>
  );
}
