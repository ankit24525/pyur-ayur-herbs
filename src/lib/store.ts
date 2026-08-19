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

export const products: Product[] = [
  {
    id: "1",
    name: "Dia Free Juice - Ayurvedic Sugar Management (1L)",
    slug: "dia-free-juice",
    concern: "Sugar Management",
    price: 999,
    compareAt: 1199,
    rating: 4.8,
    reviews: 2450,
    badge: "16% OFF",
    image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=500&q=80",
    ingredients: ["Karela", "Jamun Seed", "Gudmar", "Triphala", "Methi"],
    description: "Breakthrough Ayurvedic formulation made from 11 potent herbs clinically researched to help regulate blood glucose naturally.",
    coinsEarned: 50,
    deliveryDays: "3 - 4 Aug",
    inStock: true,
  },
  {
    id: "2",
    name: "Pure Himalayan Shilajit Gold Resin (20g)",
    slug: "himalayan-shilajit-resin",
    concern: "Energy & Vitality",
    price: 1399,
    compareAt: 1699,
    rating: 4.9,
    reviews: 3820,
    badge: "BESTSELLER",
    image: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=500&q=80",
    ingredients: ["100% Himalayan Shilajit", "Gold Vasma", "Ashwagandha Extract"],
    description: "Sourced directly from 18,000 ft Himalayan peaks. Enriched with 80+ trace minerals and fulvic acid for peak stamina & strength.",
    coinsEarned: 70,
    deliveryDays: "2 - 3 Aug",
    inStock: true,
  },
  {
    id: "3",
    name: "Artho Sure Juice - Joint & Muscle Relief (1L)",
    slug: "artho-sure-juice",
    concern: "Gym & Fitness",
    price: 849,
    compareAt: 999,
    rating: 4.7,
    reviews: 1180,
    badge: "15% OFF",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=500&q=80",
    ingredients: ["Nirgundi", "Shallaki", "Guggulu", "Rasna", "Aloevera"],
    description: "Potent anti-inflammatory herb blend designed to ease knee joint stiffness, muscle soreness, and support flexible mobility.",
    coinsEarned: 42,
    deliveryDays: "3 - 4 Aug",
    inStock: true,
  },
  {
    id: "4",
    name: "Kumkumadi Skin Radiance Glow Elixir (30ml)",
    slug: "kumkumadi-glow-elixir",
    concern: "Skin & Hair",
    price: 799,
    compareAt: 999,
    rating: 4.8,
    reviews: 1940,
    badge: "20% OFF",
    image: "https://images.unsplash.com/photo-1608248597260-8b61c5f87b8b?auto=format&fit=crop&w=500&q=80",
    ingredients: ["Kashmiri Saffron", "Sandalwood", "Lotus Extract", "Sesame Oil"],
    description: "Authentic 26-herb Ayurvedic formulation infused with pure Kashmiri Saffron to reduce pigmentation, dark spots, and restore natural glow.",
    coinsEarned: 40,
    deliveryDays: "2 - 3 Aug",
    inStock: true,
  },
  {
    id: "5",
    name: "Arjuna Heart Care Juice - BP & Cholesterol (1L)",
    slug: "arjuna-heart-care-juice",
    concern: "Heart Health",
    price: 699,
    compareAt: 849,
    rating: 4.6,
    reviews: 890,
    badge: "CLINICALLY TESTED",
    image: "https://images.unsplash.com/photo-1514733670139-4d87a1941d55?auto=format&fit=crop&w=500&q=80",
    ingredients: ["Arjuna Bark", "Garlic Extract", "Guggul", "Pushkarmool"],
    description: "Traditional cardiac tonic containing pure Arjuna bark extract to maintain arterial health, healthy lipid levels, and calm blood pressure.",
    coinsEarned: 35,
    deliveryDays: "3 - 4 Aug",
    inStock: true,
  },
  {
    id: "6",
    name: "Liver Cleanse Care Juice - Detox & Digestion (1L)",
    slug: "liver-cleanse-care-juice",
    concern: "Liver Care",
    price: 749,
    compareAt: 899,
    rating: 4.7,
    reviews: 1420,
    badge: "16% OFF",
    image: "https://images.unsplash.com/photo-1577401239170-897942555fb3?auto=format&fit=crop&w=500&q=80",
    ingredients: ["Bhumi Amla", "Punarnava", "Kalmegh", "Kutki", "Aloe Vera"],
    description: "Deep liver detox tonic formulated to flush toxins, support fatty liver recovery, and improve gut digestive enzymes.",
    coinsEarned: 37,
    deliveryDays: "2 - 4 Aug",
    inStock: true,
  },
  {
    id: "7",
    name: "Organic Amla Glow Juice - 100% Wild Sourced (1L)",
    slug: "organic-amla-glow-juice",
    concern: "Daily Ayurveda",
    price: 449,
    compareAt: 599,
    rating: 4.9,
    reviews: 3120,
    badge: "POPULAR",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=500&q=80",
    ingredients: ["Cold-pressed Pratapgarh Amla"],
    description: "Made from cold-pressed, wild Pratapgarh Amlas containing 20x more Vitamin C than regular oranges for glowing skin & immunity.",
    coinsEarned: 22,
    deliveryDays: "2 - 3 Aug",
    inStock: true,
  },
  {
    id: "8",
    name: "PCOS & Period Harmony Juice for Women (1L)",
    slug: "pcos-period-harmony-juice",
    concern: "Women's Health",
    price: 899,
    compareAt: 1099,
    rating: 4.8,
    reviews: 1670,
    badge: "DOCTOR RECOMMENDED",
    image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=500&q=80",
    ingredients: ["Shatavari", "Ashoka Bark", "Lodhra", "Manjistha", "Anantamul"],
    description: "Nourishing uterine tonic engineered with Shatavari & Ashoka to balance hormones, regulate period cycles, and ease cramps.",
    coinsEarned: 45,
    deliveryDays: "3 - 4 Aug",
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
  { label: "Shop All Products", href: "#shop" },
  { label: "Select Concern", href: "#concerns" },
  { label: "Ayurvedic Doctor Consultation", href: "#consult" },
  { label: "Take Health Quiz", href: "#quiz" },
  { label: "Customer Reviews", href: "#reviews" },
  { label: "Why Pyur Ayur Herbs", href: "#trust" },
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
    title: "Dia-Free Ayurvedic Sugar Management Juice",
    subtitle: "CLINICALLY BACKED 11-HERB METABOLIC FORMULA",
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
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1200&q=80",
    bgColor: "from-[#3e2c1e] via-[#63432b] to-[#2b1d13]",
  },
];
