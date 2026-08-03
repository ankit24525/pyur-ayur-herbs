export type ProductDetail = {
  slug: string;
  name: string;
  category: string;
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
  benefits: string[];
  ingredients: string[];
};

const baseGallery = [
  "/brand/amla-glow.svg",
  "/brand/karela-drops.svg",
  "/brand/ashwagandha-calm.svg",
  "/brand/triphala-gut.svg",
];

export const productDetails: ProductDetail[] = [
  {
    slug: "amla-glow-juice",
    name: "Amla Glow Juice",
    category: "Skin & Hair",
    image: "/brand/amla-glow.svg",
    gallery: baseGallery,
    rating: 4.8,
    reviews: 1324,
    price: 449,
    mrp: 599,
    discount: "20% OFF",
    coins: 22,
    tag: "Daily wellness juice",
    description: "A pure ayurvedic wellness juice crafted for everyday immunity, glow and digestive balance.",
    benefits: ["Supports natural immunity", "Helps skin glow from within", "Rich botanical wellness profile", "Easy daily routine"],
    ingredients: ["Amla", "Tulsi", "Giloy", "Natural herbs"],
  },
  {
    slug: "karela-jamun-drops",
    name: "Karela Jamun Drops",
    category: "Sugar Management",
    image: "/brand/karela-drops.svg",
    gallery: baseGallery,
    rating: 4.7,
    reviews: 918,
    price: 399,
    mrp: 520,
    discount: "23% OFF",
    coins: 20,
    tag: "Sugar support",
    description: "A concentrated herbal drop blend inspired by Ayurveda to support a balanced wellness routine.",
    benefits: ["Supports sugar wellness", "Easy-to-use drops", "Made with bitter herbs", "Daily ayurvedic care"],
    ingredients: ["Karela", "Jamun", "Methi", "Ayurvedic extracts"],
  },
  {
    slug: "ashwagandha-calm-capsules",
    name: "Ashwagandha Calm Capsules",
    category: "Energy",
    image: "/brand/ashwagandha-calm.svg",
    gallery: baseGallery,
    rating: 4.9,
    reviews: 1770,
    price: 549,
    mrp: 699,
    discount: "21% OFF",
    coins: 27,
    tag: "Stress & calm",
    description: "A calming ashwagandha-based capsule for stress support, recovery and everyday balance.",
    benefits: ["Helps manage daily stress", "Supports calm energy", "Good for recovery", "Travel-friendly capsules"],
    ingredients: ["Ashwagandha", "Brahmi", "Jatamansi", "Herbal capsule base"],
  },
  {
    slug: "triphala-gut-cleanse",
    name: "Triphala Gut Cleanse",
    category: "Daily Ayurveda",
    image: "/brand/triphala-gut.svg",
    gallery: baseGallery,
    rating: 4.6,
    reviews: 742,
    price: 349,
    mrp: 449,
    discount: "Daily care",
    coins: 17,
    tag: "Gut wellness",
    description: "A gentle Triphala-led ayurvedic formula for digestive wellness and daily gut care.",
    benefits: ["Supports digestion", "Gentle daily cleanse", "Classic ayurvedic blend", "Helps routine regularity"],
    ingredients: ["Haritaki", "Bibhitaki", "Amla", "Triphala extract"],
  },
];

export function slugifyProductName(name: string) {
  return name
    .toLowerCase()
    .replace(/rs\.?|₹|[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "amla-glow-juice";
}

export function getProductBySlug(slug: string) {
  return productDetails.find((product) => product.slug === slug) ?? productDetails[0];
}
