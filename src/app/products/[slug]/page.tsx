import { readDB } from "@/lib/db";
import { productDetails } from "@/lib/product-detail-data";
import { ProductDetailView } from "@/components/ProductDetailView";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import Link from "next/link";
import { ArrowLeft, PackageX } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const db = await readDB();
  const rawSlug = (slug || "").trim();
  let decodedSlug = rawSlug;
  try {
    decodedSlug = decodeURIComponent(rawSlug).toLowerCase().trim();
  } catch {}
  const normalizedSlug = rawSlug.toLowerCase();
  
  const dbProduct = (db.products || []).find((p: any) => {
    const pSlug = (p.slug || "").toLowerCase().trim();
    const pId = String(p.id || "").toLowerCase().trim();
    return (
      pSlug === normalizedSlug ||
      pSlug === decodedSlug ||
      pId === normalizedSlug ||
      pId === decodedSlug
    );
  });
  
  if (dbProduct) {
    const title = `${dbProduct.name} | Pyur Ayur Herbs`;
    const description = dbProduct.description || "Premium certified herbal remedy formulated by Ayurvedic Vaidyas.";
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: [dbProduct.image],
        type: "website",
      }
    };
  }
  
  return {
    title: "Product Details | Pyur Ayur Herbs",
    description: "Authentic Himalayan Ayurvedic formulations."
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await readDB();
  
  const rawSlug = (slug || "").trim();
  let decodedSlug = rawSlug;
  try {
    decodedSlug = decodeURIComponent(rawSlug).toLowerCase().trim();
  } catch {}
  const normalizedSlug = rawSlug.toLowerCase();

  // Find in live database products first
  const dbProduct = (db.products || []).find((p: any) => {
    const pSlug = (p.slug || "").toLowerCase().trim();
    const pId = String(p.id || "").toLowerCase().trim();
    const pName = (p.name || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
    return (
      pSlug === normalizedSlug ||
      pSlug === decodedSlug ||
      pId === normalizedSlug ||
      pId === decodedSlug ||
      pName === normalizedSlug ||
      pName === decodedSlug
    );
  });
  
  const matchedProduct = dbProduct;

  if (matchedProduct) {
    const price = Number(matchedProduct.price) || 0;
    const mrp = Number(matchedProduct.compareAt || matchedProduct.mrp) || Math.round(price * 1.2);
    const badge = matchedProduct.badge || matchedProduct.discount || "NEW";
    const image = matchedProduct.image || "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=500&q=80";

    const detailProduct = {
      id: String(matchedProduct.id || "1"),
      slug: matchedProduct.slug || normalizedSlug,
      name: matchedProduct.name || "Ayurvedic Product",
      category: matchedProduct.concern || matchedProduct.category || "Ayurvedic Remedies",
      concernSlug: (matchedProduct.concern || matchedProduct.category || "ayurvedic-remedies").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      image,
      gallery: matchedProduct.images && matchedProduct.images.length > 0 ? [image, ...matchedProduct.images] : (matchedProduct.gallery || [image]),
      rating: Number(matchedProduct.rating) || 5.0,
      reviews: Number(matchedProduct.reviews) || 0,
      price,
      mrp,
      discount: badge,
      coins: Number(matchedProduct.coinsEarned || matchedProduct.coins) || Math.round(price * 0.05),
      tag: matchedProduct.tag || "100% Certified Ayurvedic",
      description: matchedProduct.description || "Authentic Ayurvedic formula formulated with potent natural herbs.",
      variants: matchedProduct.variants && matchedProduct.variants.length > 0 ? matchedProduct.variants : [
        {
          id: `${matchedProduct.id || "1"}-single`,
          name: "Standard Pack",
          price,
          mrp,
          discount: badge,
        }
      ],
      benefits: matchedProduct.benefits || [
        { title: "Natural Formulation", desc: "Crafted with 100% pure herbal extracts.", icon: "🌿" },
        { title: "Vaidya Approved", desc: "Backed by traditional Ayurvedic research.", icon: "🛡️" }
      ],
      ingredients: Array.isArray(matchedProduct.ingredients)
        ? matchedProduct.ingredients.map((item: any) =>
            typeof item === "string" ? { name: item, description: "Authentic Ayurvedic herb extract." } : item
          )
        : [{ name: "Natural Herbal Blend", description: "Potent Ayurvedic ingredients." }],
      dosageSteps: matchedProduct.dosageSteps || [
        { step: 1, title: "Usage", description: "Consume daily as directed by your Ayurvedic physician.", icon: "🥛" }
      ],
      customerReviews: matchedProduct.customerReviews || [],
      faqs: matchedProduct.faqs || []
    };

    return <ProductDetailView key={detailProduct.slug} product={detailProduct} />;
  }

  // Graceful Product Not Found Page
  return (
    <main className="min-h-screen bg-[#f8faf1] text-[#17231b] flex flex-col justify-between">
      <SiteHeader
        cart={[]}
        onUpdateQuantity={() => {}}
        onRemoveItem={() => {}}
        onOpenAppModal={() => {}}
        onOpenLoginModal={() => {}}
        onOpenConsultationModal={() => {}}
      />

      <section className="mx-auto max-w-lg px-4 py-20 text-center">
        <div className="rounded-3xl border border-[#ddddd9] bg-white p-8 shadow-sm">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-[#f8faf1] text-[#244f31]">
            <PackageX className="size-8 text-[#80a03c]" />
          </div>
          <h2 className="mt-5 text-2xl font-black text-[#17231b]">Product Not Found</h2>
          <p className="mt-2 text-sm text-[#666666]">
            The product formulation you are looking for is currently unavailable or has been updated in our catalog.
          </p>
          <div className="mt-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-[#244f31] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#1b3b24]"
            >
              <ArrowLeft className="size-4" />
              <span>Explore All Products</span>
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
