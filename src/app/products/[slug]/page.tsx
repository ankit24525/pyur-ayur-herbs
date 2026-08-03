import { getProductBySlug, productDetails } from "@/lib/product-detail-data";
import { ProductDetailView } from "@/components/ProductDetailView";

export function generateStaticParams() {
  return productDetails.map((product) => ({ slug: product.slug }));
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ProductDetailView product={getProductBySlug(slug)} />;
}
