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
  showCoins?: boolean;
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

export const products: Product[] = [
  {
    id: "1",
    name: "Pure Himalayan Shilajit Gold Resin (50g)",
    slug: "pure-himalayan-shilajit-gold-resin-50g",
    concern: "Energy & Vitality",
    price: 1499,
    compareAt: 2499,
    rating: 4.9,
    reviews: 1240,
    badge: "BESTSELLER",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&q=80",
    ingredients: ["Pure Himalayan Shilajit", "24K Gold Bhasma", "Ashwagandha Extract", "Gokshura"],
    description: "Ethically harvested at 18,000+ ft in Himalayas. Purified with traditional Shodhana process for peak stamina, strength, and cellular revitalisation.",
    coinsEarned: 75,
    showCoins: true,
    deliveryDays: "2 - 4 Days",
    inStock: true,
  },
  {
    id: "2",
    name: "Sugar Care Balance Ayurvedic Juice (1L)",
    slug: "sugar-care-balance-ayurvedic-juice-1l",
    concern: "Sugar Management",
    price: 599,
    compareAt: 899,
    rating: 4.8,
    reviews: 850,
    badge: "POPULAR",
    image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80",
    ingredients: ["Karela (Bitter Gourd)", "Jamun Seed", "Gurmar (Gymnema)", "Vijaysar", "Methi"],
    description: "Formulated with 11 potent herbs to maintain healthy blood glucose levels naturally and reduce sweet cravings.",
    coinsEarned: 30,
    showCoins: true,
    deliveryDays: "2 - 4 Days",
    inStock: true,
  },
  {
    id: "3",
    name: "Kesar Saffron Hair Growth Elixir Oil (200ml)",
    slug: "kesar-saffron-hair-growth-elixir-oil-200ml",
    concern: "Skin & Hair",
    price: 799,
    compareAt: 1199,
    rating: 4.9,
    reviews: 620,
    badge: "HIGHLY RATED",
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80",
    ingredients: ["Kashmiri Saffron", "Bhringraj", "Amla", "Cold-pressed Sesame Oil", "Rosemary Extract"],
    description: "Restorative hair oil enriched with authentic Kashmiri Saffron and Bhringraj to arrest hair fall and stimulate dense follicle regrowth.",
    coinsEarned: 40,
    showCoins: true,
    deliveryDays: "2 - 4 Days",
    inStock: true,
  },
  {
    id: "4",
    name: "Ayurvedic Liver Detox & Cleanse Tonic (500ml)",
    slug: "ayurvedic-liver-detox-cleanse-tonic-500ml",
    concern: "Liver Care",
    price: 499,
    compareAt: 699,
    rating: 4.7,
    reviews: 430,
    badge: "NEW",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
    ingredients: ["Bhumyamalaki", "Punarnava", "Kalmegh", "Kutki", "Kasani"],
    description: "Deep hepatoprotective formulation to flush out hepatic toxins, optimize digestion, and restore healthy liver function.",
    coinsEarned: 25,
    showCoins: true,
    deliveryDays: "2 - 4 Days",
    inStock: true,
  },
  {
    id: "5",
    name: "Ashwagandha KSM-66 Gold Capsules (60s)",
    slug: "ashwagandha-ksm-66-gold-capsules-60s",
    concern: "Gym & Fitness",
    price: 699,
    compareAt: 999,
    rating: 4.9,
    reviews: 910,
    badge: "POPULAR",
    image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80",
    ingredients: ["KSM-66 Ashwagandha Root Extract (500mg)", "Black Pepper Extract"],
    description: "High-potency adaptogenic capsules designed to reduce cortisol, improve muscle strength, and enhance sleep quality.",
    coinsEarned: 35,
    showCoins: true,
    deliveryDays: "2 - 4 Days",
    inStock: true,
  },
  {
    id: "6",
    name: "Organic Triphala Digestive Care Juice (1L)",
    slug: "organic-triphala-digestive-care-juice-1l",
    concern: "Daily Ayurveda",
    price: 399,
    compareAt: 599,
    rating: 4.8,
    reviews: 340,
    badge: "ESSENTIAL",
    image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80",
    ingredients: ["Amla", "Haritaki", "Bibhitaki"],
    description: "Cold-pressed triple berry tonic to regulate bowel movements, clear intestinal sluggishness, and boost gut immunity naturally.",
    coinsEarned: 20,
    showCoins: true,
    deliveryDays: "2 - 4 Days",
    inStock: true,
  },
];

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
  { label: "Why Pure Ayur Herbs", href: "/#trust" },
];

export const heroSlides = [
  {
    id: 1,
    title: "100% Pure Himalayan Shilajit Gold Resin",
    subtitle: "AUTHENTIC AYURVEDA FOR PEAK STAMINA & ENERGY",
    offer: "GET EXTRA 10% OFF WITH CODE: PURE10",
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
    offer: "EARN 2X PURE COINS ON EVERY BOTTLE",
    ctaText: "UNLOCK GLOW RITUAL",
    href: "#shop",
    badge: "Kashmiri Saffron",
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1200&q=80",
    bgColor: "from-[#3e2c1e] via-[#63432b] to-[#2b1d13]",
  },
];
