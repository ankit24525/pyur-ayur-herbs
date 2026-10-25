import ProductsCatalogClient from "@/components/ProductsCatalogClient";
import { Suspense } from "react";
import { readDB } from "@/lib/db";
import { products as fallbackProducts } from "@/lib/store";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export const metadata = {
  title: "New Arrivals & All Products | Pure Ayur Herbs",
  description:
    "Explore 100% Ministry of AYUSH certified Ayurvedic herbal juices, churna powders, and vitality elixirs.",
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const title =
    typeof resolvedParams.title === "string"
      ? resolvedParams.title
      : typeof resolvedParams.category === "string"
      ? resolvedParams.category
      : "New Arrivals";
  const category =
    typeof resolvedParams.category === "string" ? resolvedParams.category : undefined;

  const db = await readDB(true);
  const liveProducts = Array.isArray(db.products) && db.products.length > 0 ? db.products : fallbackProducts;

  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <ProductsCatalogClient
        initialTitle={title}
        initialCategory={category}
        initialProducts={liveProducts}
      />
    </Suspense>
  );
}
