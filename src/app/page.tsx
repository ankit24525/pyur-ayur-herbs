import { readDB } from "@/lib/db";
import HomeClient from "@/components/HomeClient";
import { products, concerns } from "@/lib/store";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function HomePage() {
  const db = await readDB(true);

  const initialProducts = Array.isArray(db.products) && db.products.length > 0 ? db.products : products;
  const initialCategories = Array.isArray(db.categories) && db.categories.length > 0 ? db.categories : concerns;
  const initialCmsData = db.content || { announcement: {}, heroSlides: [], consultationBanner: {} };
  const initialMarketingData = db.marketing || { banners: [], popups: [], notifications: [] };

  return (
    <HomeClient
      initialProducts={initialProducts}
      initialCategories={initialCategories}
      initialCmsData={initialCmsData}
      initialMarketingData={initialMarketingData}
    />
  );
}
