"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Calendar, User, Clock, ChevronRight } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Product } from "@/lib/store";

export default function BlogListingPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);

  useEffect(() => {
    // Load storefront layout and blogs
    fetch("/api/admin/all", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data.blogs) {
          // Filter only published blogs
          const published = data.blogs.filter((b: any) => b.status === "Published");
          setBlogs(published);
        }
        setLoading(false);
      })
      .catch((e) => {
        console.error("Error loading blogs:", e);
        setLoading(false);
      });

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

  return (
    <main className="min-h-screen bg-[#f8faf1] text-[#17231b] flex flex-col justify-between">
      <div>
        <SiteHeader
          cart={cart}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onOpenAppModal={() => {}}
          onOpenLoginModal={() => {}}
          onOpenConsultationModal={() => {}}
        />

        {/* Hero Section */}
        <section className="bg-white border-b border-[#ddddd9] py-12 md:py-16 text-center px-4 relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#f8faf1] rounded-full opacity-60 pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-[#244f31]/5 rounded-full opacity-60 pointer-events-none" />

          <div className="max-w-2xl mx-auto relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#eef5df] text-xs font-black uppercase tracking-widest text-[#244f31] mb-4">
              <BookOpen className="size-3.5" />
              <span>Ayurvedic Journal</span>
            </span>
            <h1 className="text-3xl md:text-4xl font-black uppercase text-[#17231b]">
              Pyur Ayur Journal
            </h1>
            <p className="mt-3 text-xs md:text-sm text-[#666666] leading-relaxed max-w-xl mx-auto">
              Discover time-tested holistic advice, herbal remedy insights, healthy recipes, and health guides certified by our team of Ayurvedic doctors.
            </p>
          </div>
        </section>

        {/* Blog Post List Container */}
        <section className="max-w-[1100px] mx-auto px-4 py-12">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500 font-bold text-xs gap-3">
              <div className="size-8 rounded-full border-4 border-t-transparent border-[#244f31] animate-spin" />
              <span>Loading Ayurvedic Articles...</span>
            </div>
          ) : blogs.length === 0 ? (
            <div className="bg-white border border-[#ddddd9] rounded-2xl p-12 text-center max-w-md mx-auto shadow-xs">
              <BookOpen className="size-12 text-[#244f31] mx-auto opacity-40 mb-3" />
              <h3 className="text-base font-bold text-[#17231b]">No articles published yet</h3>
              <p className="text-xs text-gray-500 mt-1.5">
                Our specialists are writing herbal remedies. Please check back shortly for healthy recipes and updates!
              </p>
              <Link
                href="/"
                className="inline-block mt-5 px-5 py-2.5 bg-[#244f31] text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-[#1c3e26] transition shadow"
              >
                Return to Storefront
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {blogs.map((b: any) => {
                const cleanId = b.id || b.title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
                const summary = b.content ? b.content.slice(0, 140) + "..." : "Read this article to discover holistic wellness guidance...";

                return (
                  <article
                    key={cleanId}
                    className="group bg-white rounded-3xl border border-[#ddddd9] overflow-hidden flex flex-col justify-between hover:shadow-lg transition duration-300"
                  >
                    <div>
                      {/* Banner Image */}
                      <Link href={`/blog/${cleanId}`} className="block relative aspect-video overflow-hidden border-b border-[#ddddd9]">
                        <img
                          src={b.image || "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80"}
                          alt={b.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                      </Link>

                      {/* Header metadata */}
                      <div className="p-5 pb-0">
                        <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400 mb-2.5">
                          <span className="flex items-center gap-1">
                            <Calendar className="size-3 text-[#80a03c]" />
                            <span>{b.date || "August 2026"}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="size-3 text-[#80a03c]" />
                            <span>{b.author || "By Specialist"}</span>
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-sm font-black text-[#17231b] leading-snug group-hover:text-[#244f31] transition">
                          <Link href={`/blog/${cleanId}`}>{b.title}</Link>
                        </h3>

                        {/* Summary preview */}
                        <p className="text-xs text-[#666666] leading-relaxed mt-2.5">
                          {summary}
                        </p>
                      </div>
                    </div>

                    {/* Bottom CTA bar */}
                    <div className="p-5 pt-3">
                      <Link
                        href={`/blog/${cleanId}`}
                        className="inline-flex items-center gap-1 text-[11px] font-black uppercase text-[#244f31] hover:text-[#80a03c] transition border-t border-[#f8faf1] pt-3 w-full"
                      >
                        <span>Read Full Story</span>
                        <ChevronRight className="size-3.5" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <SiteFooter />
    </main>
  );
}
