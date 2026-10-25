"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, MapPin, CheckCircle } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import AnnouncementBar from "@/components/AnnouncementBar";
import { products, Product } from "@/lib/store";
import { getStorefrontData } from "@/lib/storefront-client";

export default function ContactUsPage() {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [settings, setSettings] = useState<any>({
    supportEmail: "support@pureayurherbs.com",
    whatsappNumber: "917247824101",
  });

  useEffect(() => {
    getStorefrontData()
      .then((data) => {
        if (data && data.settings) {
          setSettings(data.settings);
        }
      })
      .catch((e) => console.error("Error loading settings:", e));

    // Load cart from localStorage
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("pyur_cart");
      if (stored) {
        try {
          setCart(JSON.parse(stored));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  const saveCartState = (newCart: { product: Product; quantity: number }[]) => {
    setCart(newCart);
    localStorage.setItem("pyur_cart", JSON.stringify(newCart));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.success) {
        setSubmitted(true);
        setFormData({ name: "", email: "", phone: "", message: "" });
        setTimeout(() => setSubmitted(false), 5000);
      } else {
        alert(data.error || "Something went wrong.");
      }
    } catch {
      alert("Error sending message.");
    }
  };

  return (
    <main className="min-h-screen bg-white text-neutral-900">
      <AnnouncementBar />
      <SiteHeader
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onOpenAppModal={() => {}}
        onOpenLoginModal={() => {}}
        onOpenConsultationModal={() => {}}
      />

      <div className="mx-auto max-w-[1000px] px-4 py-8 md:py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-[#023915] hover:text-black mb-6">
          <ArrowLeft className="size-4" />
          <span>Back to Home</span>
        </Link>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Support Info */}
          <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-xs md:p-8">
            <h1 className="text-xl font-bold uppercase text-neutral-900 sm:text-2xl">
              Contact Us
            </h1>
            <p className="mt-3 text-xs text-neutral-500 leading-relaxed md:text-sm">
              We're here to help you on your wellness journey. Have questions about products, ingredients, or order delivery? Reach out directly!
            </p>

            <div className="mt-8 space-y-5">
              <div className="flex items-center gap-4">
                <div className="flex size-10 items-center justify-center rounded-xl bg-[#c2d4c5]/40 text-[#023915]">
                  <Mail className="size-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-900">Email Support</h4>
                  <a href={`mailto:${settings.supportEmail}`} className="text-xs text-neutral-600 hover:underline">
                    {settings.supportEmail}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex size-10 items-center justify-center rounded-xl bg-[#c2d4c5]/40 text-[#023915]">
                  <Phone className="size-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-900">Call & WhatsApp</h4>
                  <a
                    href={`https://api.whatsapp.com/send?phone=${(() => {
                      let num = (settings.whatsappNumber || "917247824101").replace(/\D/g, "");
                      return num.length === 10 ? "91" + num : num;
                    })()}`}
                    className="text-xs text-neutral-600 hover:underline"
                  >
                    +{settings.whatsappNumber || "917247824101"} (Business Desk)
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex size-10 items-center justify-center rounded-xl bg-[#c2d4c5]/40 text-[#023915]">
                  <MapPin className="size-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-900">Corporate Address</h4>
                  <p className="text-xs text-neutral-600">
                    {settings.companyLegalName ? `${settings.companyLegalName}, ` : ""}{settings.registeredAddress || "12, Botanical Enclave, Sector 62, Noida, UP - 201301"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-xs md:p-8">
            <h2 className="text-base font-bold text-neutral-900">Send a Message</h2>
            <p className="text-xs text-neutral-500">We typically reply within 2-4 hours.</p>

            {submitted ? (
              <div className="mt-8 flex flex-col items-center justify-center text-center">
                <CheckCircle className="size-12 text-[#023915]" />
                <h3 className="mt-3 text-base font-bold text-neutral-900">Message Sent!</h3>
                <p className="mt-1 text-xs text-neutral-500">
                  Thank you. Our customer specialist will contact you shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-900">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your name"
                    className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs outline-none focus:border-[#023915]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-900">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@email.com"
                    className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs outline-none focus:border-[#023915]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-900">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="10-digit mobile number"
                    className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs outline-none focus:border-[#023915]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-900">Message / Query</label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="How can we assist you?"
                    className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs outline-none focus:border-[#023915]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-[#023915] py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md transition hover:bg-black cursor-pointer"
                >
                  SUBMIT QUERY
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
