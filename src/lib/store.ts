export type Product = {
  id: string;
  name: string;
  slug: string;
  concern: string;
  price: number;
  compareAt: number;
  rating: number;
  reviews: number;
  badge: string;
  image: string;
  images?: string[];
  ingredients: string[];
  description: string;
  coinsEarned: number;
  deliveryDays: string;
  inStock: boolean;
};

export type Concern = {
  id: string;
  name: string;
  icon: string;
  image: string;
};

export const concerns: Concern[] = [
  {
    id: "sugar",
    name: "Sugar Management",
    icon: "🩸",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=120&q=80",
  },
  {
    id: "fitness",
    name: "Gym & Fitness",
    icon: "💪",
    image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=120&q=80",
  },
  {
    id: "energy",
    name: "Energy & Vitality",
    icon: "⚡",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=120&q=80",
  },
  {
    id: "heart",
    name: "Heart Health",
    icon: "🫀",
    image: "https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?auto=format&fit=crop&w=120&q=80",
  },
  {
    id: "liver",
    name: "Liver Care",
    icon: "🌿",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=120&q=80",
  },
  {
    id: "daily",
    name: "Daily Ayurveda",
    icon: "🍵",
    image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=120&q=80",
  },
  {
    id: "skin",
    name: "Skin & Hair",
    icon: "✨",
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=120&q=80",
  },
  {
    id: "women",
    name: "Women's Health",
    icon: "🌸",
    image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=120&q=80",
  },
];

export const products: Product[] = [];

export const headerSearchSuggestions = [
  "Shilajit",
  "Sugar Care",
  "Hair Growth Oil",
  "Amla Juice",
  "Liver Detox",
  "Heart Health",
  "Ashwagandha",
  "Skin Radiance",
];

export const menuLinks = [
  { label: "Shop All Products", href: "/#shop" },
  { label: "Select Concern", href: "/#concerns" },
  { label: "Blog", href: "/blog" },
  { label: "Customer Reviews", href: "/#reviews" },
  { label: "Why Pyur Ayur Herbs", href: "/#trust" },
];

export const heroSlides = [
  {
    id: 1,
    title: "100% Pure Himalayan Shilajit Gold Resin",
    subtitle: "AUTHENTIC AYURVEDA FOR PEAK STAMINA & ENERGY",
    offer: "GET EXTRA 10% OFF WITH CODE: PYUR10",
    ctaText: "SHOP SHILAJIT RESIN",
    href: "#shop",
    badge: "100% Pure Sourced",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=80",
    bgColor: "from-[#1d3b24] via-[#244f31] to-[#0f2416]",
  },
  {
    id: 2,
    title: "Sugar Balance Ayurvedic Juice",
    subtitle: "TRADITIONALLY FORMULATED WITH 11 HERBS",
    offer: "BUY 2 GET FREE KESAR RADIANCE OIL",
    ctaText: "EXPLORE SUGAR CARE",
    href: "#shop",
    badge: "Clinically Tested",
    image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=1200&q=80",
    bgColor: "from-[#2d6b3f] via-[#1d4629] to-[#122c1b]",
  },
  {
    id: 3,
    title: "Kumkumadi Saffron Skin Radiance Elixir",
    subtitle: "26 POTENT BOTANICALS FOR INTENSE NATURAL GLOW",
    offer: "EARN 2X PYUR COINS ON EVERY BOTTLE",
    ctaText: "UNLOCK GLOW RITUAL",
    href: "#shop",
    badge: "Kashmiri Saffron",
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1200&q=80",
    bgColor: "from-[#3e2c1e] via-[#63432b] to-[#2b1d13]",
  },
];
