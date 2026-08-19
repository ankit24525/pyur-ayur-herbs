"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, MapPin, CheckCircle } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { products, Product } from "@/lib/store";

export default function ContactUsPage() {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [settings, setSettings] = useState<any>({
    supportEmail: "support@pyurayurherbs.com",
    whatsappNumber: "919876543210",
  });

  useEffect(() => {
    fetch("/api/admin/all")
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          setSettings(data.settings);
        }
      })
      .catch((e) => console.error("Error loading settings:", e));
  }, []);

  const handleUpdateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === id) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as { product: Product; quantity: number }[]
    );
  };

  const handleRemoveItem = (id: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== id));
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
    <main className="min-h-screen bg-[#f8faf1] text-[#17231b]">
      <SiteHeader
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onOpenAppModal={() => {}}
        onOpenLoginModal={() => {}}
        onOpenConsultationModal={() => {}}
      />

      <div className="mx-auto max-w-[1000px] px-4 py-8 md:py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-[#80a03c] hover:text-[#244f31] mb-6">
          <ArrowLeft className="size-4" />
          <span>Back to Home</span>
        </Link>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Support Info */}
          <div className="rounded-2xl border border-[#ddddd9] bg-white p-6 shadow-sm md:p-8">
            <h1 className="text-2xl font-black uppercase text-[#17231b] sm:text-3xl">
              Contact Us
            </h1>
            <p className="mt-3 text-xs text-[#666666] leading-relaxed md:text-sm">
              We're here to help you on your wellness journey. Have questions about products, ingredients, or order delivery? Reach out directly!
            </p>

            <div className="mt-8 space-y-5">
              <div className="flex items-center gap-4">
                <div className="flex size-10 items-center justify-center rounded-xl bg-[#eef5df] text-[#244f31]">
                  <Mail className="size-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#17231b]">Email Support</h4>
                  <a href={`mailto:${settings.supportEmail}`} className="text-xs text-[#666666] hover:underline">
                    {settings.supportEmail}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex size-10 items-center justify-center rounded-xl bg-[#eef5df] text-[#244f31]">
                  <Phone className="size-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#17231b]">Call & WhatsApp</h4>
                  <a href={`https://wa.me/${settings.whatsappNumber}`} className="text-xs text-[#666666] hover:underline">
                    +{settings.whatsappNumber} (Business Desk)
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex size-10 items-center justify-center rounded-xl bg-[#eef5df] text-[#244f31]">
                  <MapPin className="size-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#17231b]">Corporate Address</h4>
                  <p className="text-xs text-[#666666]">
                    Pyur Ayur Herbs, 12, Botanical Enclave, Sector 62, Noida, UP, India
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="rounded-2xl border border-[#ddddd9] bg-white p-6 shadow-sm md:p-8">
            <h2 className="text-lg font-bold text-[#17231b]">Send a Message</h2>
            <p className="text-xs text-[#666666]">We typically reply within 2-4 hours.</p>

            {submitted ? (
              <div className="mt-8 flex flex-col items-center justify-center text-center">
                <CheckCircle className="size-12 text-[#80a03c]" />
                <h3 className="mt-3 text-base font-bold text-[#17231b]">Message Sent!</h3>
                <p className="mt-1 text-xs text-[#666666]">
                  Thank you. Our customer specialist will contact you shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#17231b]">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your name"
                    className="mt-1 w-full rounded-lg border border-[#ddddd9] px-3 py-2 text-xs outline-none focus:border-[#244f31]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#17231b]">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@email.com"
                    className="mt-1 w-full rounded-lg border border-[#ddddd9] px-3 py-2 text-xs outline-none focus:border-[#244f31]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#17231b]">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="10-digit mobile number"
                    className="mt-1 w-full rounded-lg border border-[#ddddd9] px-3 py-2 text-xs outline-none focus:border-[#244f31]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#17231b]">Message / Query</label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="How can we assist you?"
                    className="mt-1 w-full rounded-lg border border-[#ddddd9] px-3 py-2 text-xs outline-none focus:border-[#244f31]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-[#244f31] py-3 text-xs font-black tracking-widest text-white shadow hover:bg-[#1d3b24]"
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
