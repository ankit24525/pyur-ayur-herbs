import { readDB } from "@/lib/db";
import HomeClient from "@/components/HomeClient";
import { products, concerns } from "@/lib/store";

// Enable Incremental Static Regeneration (ISR): Cache at Edge CDN for 60 seconds
export const revalidate = 60;

export default async function HomePage() {
  const db = await readDB();

  const initialProducts = Array.isArray(db.products) && db.products.length > 0 ? db.products : products;
  const initialCategories = Array.isArray(db.categories) && db.categories.length > 0 ? db.categories : concerns;
  const initialCmsData = db.content || { announcement: {}, heroSlides: [], consultationBanner: {} };
  const initialMarketingData = db.marketing || { banners: [], popups: [], notifications: [] };
  const initialTestimonials = Array.isArray(db.testimonials) && db.testimonials.length > 0 ? db.testimonials : [];

  return (
    <HomeClient
      initialProducts={initialProducts}
      initialCategories={initialCategories}
      initialCmsData={initialCmsData}
      initialMarketingData={initialMarketingData}
      initialTestimonials={initialTestimonials}
    />
  );
}
