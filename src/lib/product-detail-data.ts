export type ProductVariant = {
  id: string;
  name: string;
  price: number;
  mrp: number;
  discount: string;
  badge?: string;
};

export type IngredientInfo = {
  name: string;
  description: string;
  image?: string;
};

export type DosageStep = {
  step: number;
  title: string;
  description: string;
  icon: string;
};

export type CustomerReviewItem = {
  id: string;
  name: string;
  location: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  verified: boolean;
};

export type ProductDetail = {
  id: string;
  slug: string;
  name: string;
  category: string;
  concernSlug: string;
  image: string;
  gallery: string[];
  rating: number;
  reviews: number;
  price: number;
  mrp: number;
  discount: string;
  coins: number;
  tag: string;
  description: string;
  variants: ProductVariant[];
  benefits: { title: string; desc: string; icon: string }[];
  ingredients: IngredientInfo[];
  dosageSteps: DosageStep[];
  customerReviews: CustomerReviewItem[];
  faqs: { question: string; answer: string }[];
};

export const productDetails: ProductDetail[] = [];

export function slugifyProductName(name: string) {
  return name
    .toLowerCase()
    .replace(/rs\.?|₹|[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "dia-free-juice";
}

export function getProductBySlug(slug: string): ProductDetail {
  return productDetails.find((p) => p.slug === slug) ?? productDetails[0];
}

