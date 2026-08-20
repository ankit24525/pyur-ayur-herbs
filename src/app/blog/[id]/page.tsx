"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, User, ShoppingBag, Play, Sparkles, Volume2 } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Product } from "@/lib/store";

export default function BlogPostPage() {
  const params = useParams();
  const router = useRouter();
  const blogId = params.id as string;

  const [blog, setBlog] = useState<any>(null);
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    // Fetch all database records
    fetch("/api/admin/all", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data.products) {
          setCatalog(data.products);
        }
        if (data.blogs) {
          const match = data.blogs.find((b: any) => {
            const cleanId = b.id || b.title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
            return cleanId === blogId;
          });
          setBlog(match || null);
        }
        setLoading(false);
      })
      .catch((e) => {
        console.error("Error loading blog details:", e);
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
  }, [blogId]);

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

  const handleAddToCart = (product: Product) => {
    let nextCart = [...cart];
    const existing = nextCart.find((item) => item.product.id === product.id);
    if (existing) {
      nextCart = nextCart.map((item) =>
        item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      nextCart.push({ product, quantity: 1 });
    }
    saveCartState(nextCart);
  };

  // Helper to extract YouTube video ID and return embed link
  const getYouTubeEmbedUrl = (urlStr: string) => {
    try {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = urlStr.match(regExp);
      if (match && match[2].length === 11) {
        return `https://www.youtube.com/embed/${match[2]}`;
      }
    } catch (e) {
      console.warn("YouTube URL parsing skipped for:", urlStr);
    }
    return null;
  };

  // Parse inline markdown constructs: [link text](url) and **bold text**
  const parseMarkdownInline = (text: string) => {
    const parts: any[] = [];
    let currentIndex = 0;
    const regex = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      const matchIndex = match.index;
      if (matchIndex > currentIndex) {
        parts.push(text.substring(currentIndex, matchIndex));
      }

      if (match[1]) {
        // [text](url) link mapping
        const linkText = match[1];
        const url = match[2];
        parts.push(
          <a
            key={matchIndex}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#244f31] font-bold underline hover:text-[#80a03c] transition-colors"
          >
            {linkText}
          </a>
        );
      } else if (match[3]) {
        // **text** bold markup mapping
        const boldText = match[3];
        parts.push(
          <strong key={matchIndex} className="font-black text-[#17231b]">
            {boldText}
          </strong>
        );
      }

      currentIndex = regex.lastIndex;
    }

    if (currentIndex < text.length) {
      parts.push(text.substring(currentIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  // Parse block-level markdown structures: headings, bullet points, paragraphs
  const renderBlogContent = (content: string) => {
    if (!content) return <p>No content provided for this article.</p>;

    const lines = content.split("\n");
    let elements: any[] = [];

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      // H2 Headings
      if (trimmed.startsWith("## ")) {
        elements.push(
          <h2
            key={idx}
            className="text-base font-black text-[#17231b] mt-8 mb-3 pt-4 border-t border-gray-100 uppercase tracking-wide"
          >
            {parseMarkdownInline(trimmed.substring(3))}
          </h2>
        );
      }
      // H3 Headings
      else if (trimmed.startsWith("### ")) {
        elements.push(
          <h3 key={idx} className="text-sm font-black text-[#17231b] mt-6 mb-2 uppercase tracking-wide">
            {parseMarkdownInline(trimmed.substring(4))}
          </h3>
        );
      }
      // Bullet Points
      else if (trimmed.startsWith("- ")) {
        elements.push(
          <li key={idx} className="list-disc ml-5 pl-1 text-gray-700 my-1 leading-relaxed text-xs md:text-sm">
            {parseMarkdownInline(trimmed.substring(2))}
          </li>
        );
      }
      // Standard Paragraph
      else {
        elements.push(
          <p key={idx} className="text-xs md:text-sm text-gray-700 leading-relaxed my-3">
            {parseMarkdownInline(trimmed)}
          </p>
        );
      }
    });

    return elements;
  };

  if (loading) {
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
          <div className="flex flex-col items-center justify-center py-32 text-gray-500 font-bold text-xs gap-3">
            <div className="size-8 rounded-full border-4 border-t-transparent border-[#244f31] animate-spin" />
            <span>Loading Article...</span>
          </div>
        </div>
        <SiteFooter />
      </main>
    );
  }

  if (!blog) {
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
          <div className="max-w-md mx-auto py-24 text-center px-4">
            <h2 className="text-xl font-black text-[#17231b]">Article Not Found</h2>
            <p className="text-xs text-gray-500 mt-2">
              The blog article you are trying to view does not exist or has been removed.
            </p>
            <Link
              href="/blog"
              className="inline-block mt-6 px-5 py-2.5 bg-[#244f31] text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-[#1c3e26] transition shadow"
            >
              Back to Journal
            </Link>
          </div>
        </div>
        <SiteFooter />
      </main>
    );
  }

  // Find related products
  const relatedProductObjects = catalog.filter((p) =>
    blog.relatedProducts?.includes(p.id)
  );

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

        <article className="max-w-[800px] mx-auto px-4 py-8 md:py-12">
          {/* Back button */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-xs font-black text-[#80a03c] hover:text-[#244f31] mb-6 transition"
          >
            <ArrowLeft className="size-4" />
            <span>Back to Journal</span>
          </Link>

          {/* Heading */}
          <h1 className="text-2xl md:text-3xl font-black text-[#17231b] leading-tight mb-4">
            {blog.title}
          </h1>

          {/* Metadata */}
          <div className="flex items-center gap-4 text-xs font-bold text-gray-500 mb-6 pb-6 border-b border-[#ddddd9]">
            <span className="flex items-center gap-1.5">
              <Calendar className="size-4 text-[#80a03c]" />
              <span>{blog.date}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <User className="size-4 text-[#80a03c]" />
              <span>{blog.author}</span>
            </span>
          </div>

          {/* Featured Image */}
          <div className="relative aspect-video rounded-3xl overflow-hidden border border-[#ddddd9] mb-8 shadow-xs">
            <img
              src={blog.image || "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80"}
              alt={blog.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Audio Player Integration */}
          {blog.audio && (
            <div className="mb-8 p-4 bg-white rounded-3xl border border-[#ddddd9] shadow-xs space-y-3">
              <h4 className="text-[10px] font-black uppercase text-[#17231b] tracking-wider flex items-center gap-1.5">
                <Volume2 className="size-4 text-[#80a03c]" />
                <span>🎧 Listen to Podcast / Audio Version</span>
              </h4>
              {blog.audio.includes("spotify.com") ? (
                <iframe
                  src={blog.audio.replace("spotify.com/episode/", "spotify.com/embed/episode/")}
                  width="100%"
                  height="152"
                  frameBorder="0"
                  allowFullScreen
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  className="rounded-2xl"
                />
              ) : (
                <audio controls className="w-full outline-none">
                  <source src={blog.audio} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              )}
            </div>
          )}

          {/* Rich Content paragraphs parsed dynamically */}
          <div className="prose max-w-none space-y-2">
            {renderBlogContent(blog.content)}
          </div>

          {/* Embedded YouTube Videos */}
          {blog.videos && blog.videos.length > 0 && (
            <div className="mt-12 pt-8 border-t border-[#ddddd9] space-y-6">
              <h3 className="text-base font-black uppercase text-[#17231b] tracking-wider flex items-center gap-2">
                <Play className="size-5 text-[#80a03c] fill-[#80a03c]" />
                <span>Related Videos & Tutorials</span>
              </h3>
              <div className="grid gap-6 sm:grid-cols-2">
                {blog.videos.map((vidUrl: string, idx: number) => {
                  const embed = getYouTubeEmbedUrl(vidUrl);
                  if (!embed) return null;
                  return (
                    <div key={idx} className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-sm border border-[#ddddd9]">
                      <iframe
                        className="absolute inset-0 w-full h-full"
                        src={embed}
                        title={`Tutorial Video ${idx + 1}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Frequently Asked Questions (FAQ Accordion like Kapiva) */}
          {blog.faqs && blog.faqs.length > 0 && (
            <div className="mt-12 pt-8 border-t border-[#ddddd9] space-y-6">
              <h3 className="text-base font-black uppercase text-[#17231b] tracking-wider flex items-center gap-2">
                <Sparkles className="size-5 text-[#80a03c]" />
                <span>Frequently Asked Questions</span>
              </h3>
              <div className="space-y-3">
                {blog.faqs.map((faq: any, idx: number) => {
                  const isOpen = openFaq === idx;
                  return (
                    <div key={idx} className="border border-[#ddddd9] rounded-3xl overflow-hidden bg-white shadow-xs transition duration-300">
                      <button
                        onClick={() => setOpenFaq(isOpen ? null : idx)}
                        className="w-full flex items-center justify-between p-5 text-left font-extrabold text-[#17231b] text-xs md:text-sm hover:bg-[#f8faf1]/40 transition"
                      >
                        <span>{faq.question}</span>
                        <span className={`text-[#244f31] font-black text-lg transform transition duration-300 ${isOpen ? "rotate-45" : ""}`}>
                          +
                        </span>
                      </button>
                      <div
                        className={`transition-all duration-300 ease-in-out overflow-hidden ${
                          isOpen ? "max-h-[500px] border-t border-[#ddddd9] p-5 text-xs md:text-sm text-gray-600 leading-relaxed bg-[#f8faf1]/10" : "max-h-0"
                        }`}
                      >
                        <p>{faq.answer}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Shop Related Products Section */}
          {relatedProductObjects.length > 0 && (
            <div className="mt-12 pt-8 border-t border-[#ddddd9] space-y-6">
              <h3 className="text-base font-black uppercase text-[#17231b] tracking-wider flex items-center gap-2">
                <ShoppingBag className="size-5 text-[#80a03c]" />
                <span>Shop Related Products</span>
              </h3>
              <p className="text-xs text-[#666666] leading-relaxed">
                Unlock natural Ayurvedic healing with the authentic formulations recommended in this article:
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                {relatedProductObjects.map((prod) => (
                  <div
                    key={prod.id}
                    className="flex gap-4 p-4 bg-white rounded-3xl border border-[#ddddd9] shadow-xs hover:border-[#244f31] transition"
                  >
                    <div className="relative size-20 rounded-2xl overflow-hidden border border-[#ddddd9] flex-shrink-0 bg-[#f8faf1]">
                      <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col justify-between w-full">
                      <div>
                        <h4 className="text-xs font-black text-[#17231b] leading-snug">{prod.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-black text-[#244f31]">₹{prod.price}</span>
                          {prod.compareAt && (
                            <span className="text-[10px] text-gray-400 line-through">₹{prod.compareAt}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleAddToCart(prod)}
                          className="flex-1 bg-[#244f31] hover:bg-[#1c3e26] text-white font-black text-[10px] uppercase py-2 rounded-xl transition shadow-sm"
                        >
                          Add to Basket
                        </button>
                        <Link
                          href={`/checkout?productId=${prod.id}&quantity=1`}
                          className="flex-1 text-center bg-[#eef5df] hover:bg-[#e4ebc6] text-[#244f31] font-black text-[10px] uppercase py-2 rounded-xl border border-[#ddddd9] transition"
                        >
                          Buy Now
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </article>
      </div>

      <SiteFooter />
    </main>
  );
}
