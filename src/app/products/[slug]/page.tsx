import { readDB } from "@/lib/db";
import { productDetails } from "@/lib/product-detail-data";
import { ProductDetailView } from "@/components/ProductDetailView";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  const db = readDB();
  return db.products.map((product: any) => ({ slug: product.slug }));
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = readDB();
  
  const normalizedSlug = slug.trim().toLowerCase();

  // Find in db.json first
  const dbProduct = db.products.find((p: any) => p.slug.trim().toLowerCase() === normalizedSlug);
  
  // If not found in db.json, look in static details
  const staticProduct = productDetails.find((p) => p.slug.trim().toLowerCase() === normalizedSlug);

  if (dbProduct) {
    const p = staticProduct || {
      id: dbProduct.id,
      slug: dbProduct.slug,
      name: dbProduct.name,
      category: dbProduct.concern || dbProduct.category,
      concernSlug: (dbProduct.concern || dbProduct.category || "").toLowerCase().replace(/ /g, "-"),
      image: dbProduct.image,
      gallery: [dbProduct.image, ...(dbProduct.images || [])],
      rating: dbProduct.rating || 5.0,
      reviews: dbProduct.reviews || 0,
      price: dbProduct.price,
      mrp: dbProduct.compareAt || dbProduct.price * 1.2,
      discount: dbProduct.badge || "NEW",
      coins: dbProduct.coinsEarned || 50,
      tag: "Certified Organic",
      description: dbProduct.description || "Premium certified herbal remedy formulated by Ayurvedic Vaidyas.",
      variants: [
        {
          id: `${dbProduct.id}-single`,
          name: "Standard Pack",
          price: dbProduct.price,
          mrp: dbProduct.compareAt || dbProduct.price * 1.2,
          discount: dbProduct.badge || "NEW",
        }
      ],
      benefits: [
        { title: "Nourishes Body", desc: "Formulated with 100% natural cold-pressed herbs.", icon: "🌿" },
        { title: "Safe & Certified", desc: "No chemical additives or artificial colors.", icon: "🛡️" }
      ],
      ingredients: (dbProduct.ingredients || []).map((name: string) => ({
        name,
        description: "Organic handpicked herb sourcing."
      })),
      dosageSteps: [
        { step: 1, title: "Dosage", description: "Take daily as recommended by the Ayurvedic practitioner.", icon: "🥛" }
      ],
      customerReviews: [],
      faqs: []
    };

    const detailProduct = {
      ...p,
      name: dbProduct.name,
      price: dbProduct.price,
      mrp: dbProduct.compareAt || dbProduct.price * 1.2,
      discount: dbProduct.badge || "NEW",
      image: dbProduct.image,
      gallery: [dbProduct.image, ...(dbProduct.images || [])],
      description: dbProduct.description || p.description,
    };
    return <ProductDetailView key={detailProduct.slug} product={detailProduct} />;
  }

  // Fallback to static details
  const p = staticProduct || productDetails[0];
  return <ProductDetailView key={p.slug} product={p} />;
}
