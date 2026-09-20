"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  ChevronRight,
  HelpCircle,
  MessageCircle,
  PhoneCall,
  Sparkles,
  ArrowRight,
  X,
  CheckCircle2,
} from "lucide-react";
import AnnouncementBar from "@/components/AnnouncementBar";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Product } from "@/lib/store";
import { getStorefrontData } from "@/lib/storefront-client";
import { generateFaqSchema } from "@/lib/seo-schema";

const DEFAULT_FAQS = [
  {
    question: "How to login into my account?",
    answer:
      "Click on the Account icon on the top right navigation bar. Enter your registered mobile number or email to receive an instant OTP, verify it, and you will be logged into your account dashboard.",
    category: "Account & Orders",
  },
  {
    question: "What products does Pure Ayur Herbs offer?",
    answer:
      "Pure Ayur Herbs provides 100% AYUSH-certified classical and proprietary Ayurvedic formulations, including Virja Powder & Gold Majun for men's wellness and vitality, Madhunashi Powder & Syrup for blood sugar balance, Ayurvedic Fat Burner for natural weight support, and herbal skincare solutions.",
    category: "Products & Ayurveda",
  },
  {
    question: "Are Pure Ayur Herbs products suitable for vegetarians/vegans?",
    answer:
      "Yes! All our powders, tonics, and natural herbal formulations are 100% vegetarian, plant-based, and crafted from ethically sourced herbs without harmful chemical additives, synthetic fillers, or animal by-products.",
    category: "Products & Ayurveda",
  },
  {
    question: "How much time does Ayurveda take to show benefits?",
    answer:
      "Ayurveda works at the root cause of ailments. While subtle improvements in digestion and energy are often felt within 1 to 2 weeks, consistent use for 60 to 90 days alongside a balanced diet (Ahara) and lifestyle (Vihara) is recommended for long-lasting, transformative results.",
    category: "Products & Ayurveda",
  },
  {
    question: "How can I find more information about ingredients?",
    answer:
      "Every product page features a detailed 'Key Ayurvedic Ingredients' section outlining the herbs used, their botanical names, and their classical Ayurvedic actions (Karma). You can also reach out to our certified Ayurvedic Vaidyas on WhatsApp for personalized consultations.",
    category: "Products & Ayurveda",
  },
  {
    question: "How to collaborate with Pure Ayur Herbs?",
    answer:
      "We welcome partnerships with certified Ayurvedic practitioners, wellness clinics, distribution partners, and health advocates. Please email us at info@pureayurherbs.com or reach out via WhatsApp with your proposal.",
    category: "General",
  },
  {
    question: "How do I use a coupon code?",
    answer:
      "You can apply your discount coupon code at checkout in the 'Have a coupon code?' field. The discount will be immediately calculated and deducted from your total payable amount before payment.",
    category: "Payments & Offers",
  },
  {
    question: "I am unable to make the payment",
    answer:
      "If your payment fails or gets stuck, check your internet connectivity or try an alternative payment method such as UPI, Cards, Net Banking, or Cash on Delivery (COD). If the amount was deducted from your bank, it is usually refunded automatically within 3–5 business days. You can also contact our support on WhatsApp for instant assistance.",
    category: "Payments & Offers",
  },
  {
    question: "Can diabetic patients take Madhunashi Powder & Syrup?",
    answer:
      "Yes, Madhunashi is specially formulated with Gudmar, Karela, and Jamun to help support healthy blood sugar balance naturally and is safe for daily use.",
    category: "Products & Ayurveda",
  },
  {
    question: "How to consume Virja Powder & Majun?",
    answer:
      "Take 1 teaspoon of Virja Powder with warm milk or water in the morning, and 5-10g of Virja Gold Majun with warm milk before bedtime, or as directed by your Ayurvedic physician.",
    category: "Products & Ayurveda",
  },
  {
    question: "How long does delivery take?",
    answer:
      "All orders are dispatched within 24 hours. Metro deliveries typically arrive within 2–3 business days, while other locations take 3–5 business days. Tracking details are sent via SMS and WhatsApp as soon as your package ships.",
    category: "Account & Orders",
  },
  {
    question: "What is your return and refund policy?",
    answer:
      "We take great pride in our authentic Ayurvedic remedies. If your order arrives damaged, defective, or incorrect, notify us within 48 hours of delivery for a hassle-free replacement or full refund.",
    category: "Account & Orders",
  },
];

export default function FaqsPage() {
  const [faqs, setFaqs] = useState<any[]>(DEFAULT_FAQS);
  const [openIndices, setOpenIndices] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [appModalOpen, setAppModalOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState("917247824101");

  useEffect(() => {
    getStorefrontData()
      .then((data) => {
        if (Array.isArray(data?.faqs) && data.faqs.length > 0) {
          setFaqs(data.faqs);
        }
        if (data?.settings?.whatsappNumber) {
          setWhatsappNumber(data.settings.whatsappNumber);
        }
      })
      .catch((e) => console.error("Error loading FAQs:", e));

    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("pyur_cart");
        if (stored) {
          setCart(JSON.parse(stored));
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const saveCartState = (newCart: { product: Product; quantity: number }[]) => {
    setCart(newCart);
    try {
      localStorage.setItem("pyur_cart", JSON.stringify(newCart));
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    const nextCart = cart
      .map((item) => {
        if (item.product.id === id) {
          const nextQty = item.quantity + delta;
          return nextQty > 0 ? { ...item, quantity: nextQty } : null;
        }
        return item;
      })
      .filter(Boolean) as { product: Product; quantity: number }[];
    saveCartState(nextCart);
  };

  const handleRemoveItem = (id: string) => {
    const nextCart = cart.filter((item) => item.product.id !== id);
    saveCartState(nextCart);
  };

  const toggleAccordion = (index: number) => {
    setOpenIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  // Filter categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    faqs.forEach((f) => {
      if (f.category) cats.add(f.category);
    });
    return ["All", ...Array.from(cats)];
  }, [faqs]);

  // Filtered FAQs based on category & search term
  const filteredFaqs = useMemo(() => {
    return faqs.filter((faq) => {
      const matchesCategory =
        selectedCategory === "All" || faq.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (faq.question && faq.question.toLowerCase().includes(q)) ||
        (faq.answer && faq.answer.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [faqs, selectedCategory, searchQuery]);

  // Schema.org FAQPage structured data
  const faqSchema = useMemo(() => {
    return generateFaqSchema(filteredFaqs);
  }, [filteredFaqs]);

  const cleanWhatsapp = whatsappNumber.replace(/\D/g, "");
  const formattedWhatsapp =
    cleanWhatsapp.length === 10 ? `91${cleanWhatsapp}` : cleanWhatsapp;

  return (
    <main className="min-h-screen bg-[#f9faf7] text-[#17231b] flex flex-col justify-between">
      {/* Schema.org FAQPage JSON-LD */}
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      <div>
        {/* Top Announcement Bar */}
        <AnnouncementBar onOpenAppModal={() => setAppModalOpen(true)} />

        {/* Header with Cart & Navigation */}
        <SiteHeader
          cart={cart}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onOpenAppModal={() => setAppModalOpen(true)}
          onOpenLoginModal={() => setLoginModalOpen(true)}
        />

        {/* Breadcrumbs */}
        <div className="bg-white border-b border-[#ddddd9]">
          <div className="mx-auto max-w-[1440px] px-4 py-3 sm:px-6 md:px-8">
            <nav className="flex items-center gap-2 text-xs font-semibold text-[#666666]">
              <Link href="/" className="hover:text-[#244f31] transition">
                Home
              </Link>
              <ChevronRight className="size-3 text-neutral-400" />
              <span className="text-[#244f31] font-bold">Frequently Asked Questions</span>
            </nav>
          </div>
        </div>

        {/* Main FAQ Section */}
        <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6">
          <div className="mx-auto max-w-4xl">
            {/* Header matching reference mockup */}
            <div className="text-center mb-10 md:mb-12">
              <h1 className="text-3xl sm:text-4xl md:text-[42px] font-black text-[#17231b] tracking-tight mb-3">
                Frequently Asked Questions
              </h1>
              <p className="text-sm sm:text-base text-[#666666] font-medium max-w-xl mx-auto">
                Everything you need to know about shopping with Pure Ayur Herbs
              </p>
            </div>

            {/* Search and Category Filter */}
            <div className="mb-8 space-y-4">
              {/* Search Bar */}
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4.5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search questions (e.g., login, payment, Virja, ingredients...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white rounded-full pl-11 pr-10 py-3 text-sm text-[#17231b] placeholder-neutral-400 border border-neutral-200 shadow-xs focus:outline-hidden focus:ring-2 focus:ring-[#244f31] focus:border-transparent transition"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-600 rounded-full"
                    title="Clear search"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>

              {/* Category Pills (if categories exist) */}
              {categories.length > 2 && (
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  {categories.map((cat) => {
                    const isSelected = selectedCategory === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`text-xs font-bold px-3.5 py-1.5 rounded-full transition-colors ${
                          isSelected
                            ? "bg-[#244f31] text-white shadow-xs"
                            : "bg-white text-[#555555] border border-neutral-200 hover:bg-neutral-50"
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Accordion Cards Container */}
            {filteredFaqs.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center border border-neutral-200 shadow-xs">
                <HelpCircle className="size-12 text-neutral-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-[#17231b] mb-1">
                  No matching questions found
                </h3>
                <p className="text-xs sm:text-sm text-[#666666] mb-4">
                  We could not find any questions matching &ldquo;{searchQuery}&rdquo;.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("All");
                  }}
                  className="inline-flex items-center gap-2 text-xs font-bold text-[#244f31] bg-[#244f31]/10 px-4 py-2 rounded-full hover:bg-[#244f31]/20 transition"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredFaqs.map((faq, idx) => {
                  const isOpen = openIndices.has(idx);
                  return (
                    <div
                      key={idx}
                      className="bg-white rounded-xl md:rounded-2xl border border-neutral-200/90 shadow-[0_2px_6px_rgba(0,0,0,0.02)] transition duration-150 hover:border-neutral-300 overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => toggleAccordion(idx)}
                        aria-expanded={isOpen}
                        className="w-full px-6 py-4.5 sm:py-5 flex items-center justify-between text-left gap-4 group cursor-pointer focus:outline-hidden"
                      >
                        <span className="font-bold text-[15px] sm:text-[16px] md:text-[17px] text-[#17231b] leading-snug group-hover:text-[#244f31] transition-colors">
                          {faq.question}
                        </span>
                        <span
                          className="shrink-0 size-7 flex items-center justify-center font-bold text-xl md:text-2xl text-[#17231b] group-hover:text-[#244f31] transition-transform select-none"
                          aria-hidden="true"
                        >
                          {isOpen ? "−" : "+"}
                        </span>
                      </button>

                      {isOpen && (
                        <div className="px-6 pb-5 pt-1 text-sm md:text-[15px] text-[#555555] leading-relaxed border-t border-neutral-100/90 animate-fadeIn">
                          <p className="whitespace-pre-line">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Need More Help / WhatsApp Consultation Card */}
            <div className="mt-12 bg-gradient-to-r from-[#244f31] to-[#1c3f27] rounded-2xl md:rounded-3xl p-6 sm:p-8 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-1.5 text-center sm:text-left">
                <div className="inline-flex items-center gap-1.5 bg-white/15 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase text-emerald-100 mb-1">
                  <Sparkles className="size-3" />
                  Still have questions?
                </div>
                <h3 className="text-xl sm:text-2xl font-black tracking-tight">
                  Speak Directly with our Ayurvedic Vaidyas
                </h3>
                <p className="text-xs sm:text-sm text-emerald-100/90 max-w-lg">
                  Get personalized health guidance, dosha assessment, and dosage advice from our certified Ayurvedic specialists.
                </p>
              </div>

              <div className="shrink-0 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <a
                  href={`https://api.whatsapp.com/send?phone=${formattedWhatsapp}&text=${encodeURIComponent(
                    "Namaste! I have a question regarding Pure Ayur Herbs products and would like advice from an Ayurvedic Vaidya."
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white font-black text-sm px-6 py-3.5 rounded-full shadow-md transition transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <MessageCircle className="size-5 fill-current" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <SiteFooter />
    </main>
  );
}
