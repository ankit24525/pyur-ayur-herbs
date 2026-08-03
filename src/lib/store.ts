export type Product = { name: string; slug: string; concern: string; price: number; compareAt: number; rating: number; reviews: number; badge: string; image: string; ingredients: string[]; };
export const products: Product[] = [
  { name: "Amla Glow Juice", slug: "amla-glow-juice", concern: "Skin + Immunity", price: 449, compareAt: 599, rating: 4.8, reviews: 1324, badge: "Bestseller", image: "/brand/amla-glow.svg", ingredients: ["Amla", "Aloe vera", "Tulsi"] },
  { name: "Karela Jamun Drops", slug: "karela-jamun-drops", concern: "Sugar Support", price: 399, compareAt: 520, rating: 4.7, reviews: 918, badge: "Doctor picked", image: "/brand/karela-jamun.svg", ingredients: ["Karela", "Jamun seed", "Methi"] },
  { name: "Ashwagandha Calm Capsules", slug: "ashwagandha-calm-capsules", concern: "Stress + Sleep", price: 549, compareAt: 699, rating: 4.9, reviews: 1770, badge: "New blend", image: "/brand/ashwagandha-calm.svg", ingredients: ["Ashwagandha", "Brahmi", "Jatamansi"] },
  { name: "Triphala Gut Cleanse", slug: "triphala-gut-cleanse", concern: "Digestion", price: 349, compareAt: 449, rating: 4.6, reviews: 742, badge: "Daily care", image: "/brand/triphala-gut.svg", ingredients: ["Haritaki", "Bibhitaki", "Amalaki"] },
];
export const concerns = ["Weight wellness", "Diabetes care", "Skin radiance", "Gut health", "Hair nutrition", "Stress relief"];
export const headerSearchSuggestions = ["energy", "heart", "gym", "skin glow", "diabetes care", "immunity", "digestion", "sleep"];
export const menuLinks = [{ label: "Shop all", href: "#shop" }, { label: "Wellness concerns", href: "#concerns" }, { label: "Daily routine", href: "#routine" }, { label: "Free consultation", href: "#consult" }, { label: "Journal", href: "#journal" }, { label: "Admin panel", href: "/admin" }];
export const heroSlides = [
  { title: "Pure Ayur Herbs", eyebrow: "Premium botanicals & wellness", copy: "Daily herbal routines for energy, immunity, digestion, skin glow, and calm sleep.", cta: "Shop daily wellness", href: "#shop", image: "/brand/amla-glow.svg", bg: "from-[#edf6d8] via-[#f8faf1] to-[#d6e7ac]" },
  { title: "Sugar care, naturally", eyebrow: "Karela + Jamun + Methi", copy: "Ayurvedic support blends for mindful meals and metabolic balance.", cta: "Explore sugar support", href: "#shop", image: "/brand/karela-jamun.svg", bg: "from-[#eef6df] via-white to-[#cfe49b]" },
  { title: "Stress less at night", eyebrow: "Ashwagandha calm ritual", copy: "Gentle plant-based relaxation support for modern busy routines.", cta: "Build your routine", href: "#routine", image: "/brand/ashwagandha-calm.svg", bg: "from-[#edf7f2] via-[#f8faf1] to-[#bdded4]" },
];
export const orders = [{ id: "PYR-1048", customer: "Riya Mehta", total: 1297, status: "Packed", channel: "Website" }, { id: "PYR-1047", customer: "Aarav Shah", total: 898, status: "Paid", channel: "WhatsApp" }, { id: "PYR-1046", customer: "Naina Iyer", total: 1646, status: "Shipped", channel: "Website" }];
export const inventory = [{ sku: "PAAJ-500", item: "Amla Glow Juice 500ml", stock: 184, reorder: 60 }, { sku: "PKJD-30", item: "Karela Jamun Drops 30ml", stock: 46, reorder: 80 }, { sku: "PACC-60", item: "Ashwagandha Calm Capsules", stock: 112, reorder: 75 }];
