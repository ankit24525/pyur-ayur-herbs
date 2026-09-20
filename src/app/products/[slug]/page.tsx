import { readDB } from "@/lib/db";
import { products as defaultStoreProducts } from "@/lib/store";
import { productDetails } from "@/lib/product-detail-data";
import { ProductDetailView } from "@/components/ProductDetailView";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import Link from "next/link";
import { ArrowLeft, PackageX } from "lucide-react";
import type { Metadata } from "next";
import {
  generateProductSchema,
  generateBreadcrumbSchema,
  generateFaqSchema,
  formatSeoTitle,
  formatSeoDescription,
  SITE_URL,
} from "@/lib/seo-schema";

// Enable Incremental Static Regeneration (ISR): Cache at Edge CDN for 60 seconds
export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const db = await readDB();
  const rawSlug = (slug || "").trim();
  let decodedSlug = rawSlug;
  try {
    decodedSlug = decodeURIComponent(rawSlug).toLowerCase().trim();
  } catch {}
  const normalizedSlug = rawSlug.toLowerCase();
  
  const allProducts = [...(db.products || []), ...defaultStoreProducts];
  const dbProduct = allProducts.find((p: any) => {
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
  
  if (dbProduct) {
    const price = Number(dbProduct.price) || 0;
    const title = dbProduct.metaTitle || formatSeoTitle(dbProduct.name, dbProduct.concern);
    const description = dbProduct.metaDesc || formatSeoDescription(dbProduct.name, price, dbProduct.concern);
    const canonicalUrl = `${SITE_URL}/products/${encodeURIComponent(dbProduct.slug || normalizedSlug)}`;
    const ogImages = (dbProduct.images && dbProduct.images.length > 0 ? [dbProduct.image, ...dbProduct.images] : [dbProduct.image])
      .filter((img: string) => typeof img === "string" && img.startsWith("http"));

    return {
      title,
      description,
      alternates: {
        canonical: canonicalUrl,
      },
      keywords: dbProduct.keywords && Array.isArray(dbProduct.keywords) && dbProduct.keywords.length > 0
        ? dbProduct.keywords
        : [
            dbProduct.name,
            dbProduct.concern || "Ayurvedic Health",
            "Pure Ayur Herbs",
            "100% Ayurvedic Formula",
            "AYUSH Certified",
            "Buy Ayurvedic Remedy Online",
          ],
      openGraph: {
        title,
        description,
        url: canonicalUrl,
        siteName: "Pure Ayur Herbs",
        images: ogImages.map((img: string) => ({
          url: img,
          width: 800,
          height: 800,
          alt: dbProduct.name,
        })),
        type: "website",
        locale: "en_IN",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: ogImages.slice(0, 1),
      },
    };
  }
  
  return {
    title: "Product Details | Pure Ayur Herbs",
    description: "Authentic Himalayan Ayurvedic formulations.",
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

  // Find in live database products first, then fallback products
  const allProducts = [...(db.products || []), ...defaultStoreProducts];
  const dbProduct = allProducts.find((p: any) => {
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

    // Merge reviews from db.reviews for this product
    const productReviewsFromDb = (db.reviews || [])
      .filter((r: any) => {
        const matchesProduct =
          (r.productId && String(r.productId) === String(matchedProduct.id)) ||
          (r.productSlug && (r.productSlug === normalizedSlug || r.productSlug === decodedSlug)) ||
          (r.productName && r.productName.toLowerCase() === (matchedProduct.name || "").toLowerCase()) ||
          (r.product && r.product.toLowerCase() === (matchedProduct.name || "").toLowerCase());
        const isApproved = r.status ? r.status.toLowerCase() === "approved" : true;
        return matchesProduct && isApproved;
      })
      .map((r: any) => ({
        id: r.id,
        name: r.author || r.customerName || r.customer || r.name || "Verified Customer",
        location: r.location || (r.verifiedBuyer ? "Verified Buyer" : "India"),
        rating: Number(r.rating) || 5,
        title: r.title || "Ayurvedic Remedy Experience",
        comment: r.content || r.comment || "",
        date: r.date || "Recently",
        verifiedBuyer: r.verifiedBuyer === true || r.isVerified === true,
        source: "customer"
      }));

    const allCustomerReviews = [
      ...productReviewsFromDb,
      ...(matchedProduct.customerReviews || [])
    ];

    const dynamicReviewsCount = allCustomerReviews.length > 0 ? allCustomerReviews.length : (Number(matchedProduct.reviews) || 0);
    const dynamicRating = allCustomerReviews.length > 0
      ? Number((allCustomerReviews.reduce((sum: number, rev: any) => sum + (Number(rev.rating) || 5), 0) / allCustomerReviews.length).toFixed(1))
      : (Number(matchedProduct.rating) || 5.0);

    const detailProduct = {
      id: String(matchedProduct.id || "1"),
      slug: matchedProduct.slug || normalizedSlug,
      name: matchedProduct.name || "Ayurvedic Product",
      category: matchedProduct.concern || matchedProduct.category || "Ayurvedic Remedies",
      concernSlug: (matchedProduct.concern || matchedProduct.category || "ayurvedic-remedies").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      image,
      gallery: matchedProduct.images && matchedProduct.images.length > 0 ? [image, ...matchedProduct.images] : (matchedProduct.gallery || [image]),
      rating: dynamicRating,
      reviews: dynamicReviewsCount,
      price,
      mrp,
      discount: badge,
      coins: matchedProduct.showCoins === false
        ? 0
        : (matchedProduct.coinsEarned !== undefined ? Number(matchedProduct.coinsEarned) : (Number(matchedProduct.coins) || Math.round(price * 0.05))),
      showCoins: matchedProduct.showCoins !== false && (
        matchedProduct.coinsEarned !== undefined ? Number(matchedProduct.coinsEarned) > 0 : true
      ),
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
      customerReviews: allCustomerReviews,
      faqs: matchedProduct.faqs || []
    };

    const productSchema = generateProductSchema({
      id: detailProduct.id,
      slug: detailProduct.slug,
      name: detailProduct.name,
      category: detailProduct.category,
      concernSlug: detailProduct.concernSlug,
      description: detailProduct.description,
      price: detailProduct.price,
      mrp: detailProduct.mrp,
      image: detailProduct.image,
      gallery: detailProduct.gallery,
      sku: matchedProduct.sku,
      inStock: matchedProduct.inStock !== false,
      rating: dynamicRating,
      reviewsCount: dynamicReviewsCount,
      customerReviews: allCustomerReviews,
      faqs: detailProduct.faqs,
    });

    const breadcrumbSchema = generateBreadcrumbSchema([
      { name: "Home", path: "/" },
      { name: detailProduct.category, path: `/solution/${detailProduct.concernSlug || "general"}` },
      { name: detailProduct.name, path: `/products/${detailProduct.slug}` },
    ]);

    const faqSchema = generateFaqSchema(detailProduct.faqs || []);

    return (
      <>
        {/* Google Rich Snippet: Product, Price, Stock & 5-Star Ratings */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
        {/* Google Rich Snippet: Breadcrumbs Navigation */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
        {/* Google Rich Snippet: Expandable Product FAQs */}
        {faqSchema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
          />
        )}
        <ProductDetailView key={detailProduct.slug} product={detailProduct} />
      </>
    );
  }

  // Graceful Product Not Found Page
  return (
    <main className="min-h-screen bg-[#f8faf1] text-[#17231b] flex flex-col justify-between">
      <SiteHeader />

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
