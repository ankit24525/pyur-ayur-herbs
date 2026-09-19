export type ProductVariant = {
  id: string;
  name: string;
  type?: string;
  value?: string;
  price: number;
  mrp?: number;
  compareAt?: number;
  discount?: string;
  badge?: string;
  image?: string;
  inStock?: boolean;
};

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
  variants?: ProductVariant[];
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
    id: "prod_1788947560528",
    name: "VIRJA POWDER",
    slug: "virja-powder",
    concern: "Energy & Vitality",
    price: 1199,
    compareAt: 1499,
    rating: 5.0,
    reviews: 142,
    badge: "BESTSELLER",
    image: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=600&q=80",
    ingredients: ["Pure Ayurvedic Rasayana", "Shuddha Shilajit", "Ashwagandha", "Safed Musli", "Gokshura", "Kaunch Beej"],
    description: "Pure Ayur Herbs बिरजा पाउडर (Virja Powder), विशेष रूप से पुरुषों की प्राकृतिक शक्ति, स्टैमिना और ऊर्जा को बढ़ाने के लिए तैयार किया गया एक प्रीमियम आयुर्वेदिक फॉर्मूला है। 100% पारंपरिक, सुरक्षित व जीएमपी प्रमाणित।",
    coinsEarned: 60,
    showCoins: true,
    deliveryDays: "3 - 5 Days",
    inStock: true,
  },
  {
    id: "prod_1789129223995",
    name: "VIRJA GOLD MAJUN",
    slug: "virja-gold-majun",
    concern: "Energy & Vitality",
    price: 449,
    compareAt: 499,
    rating: 5.0,
    reviews: 98,
    badge: "POPULAR",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80",
    ingredients: ["Gold Bhasma Blend", "Kesar", "Ashwagandha", "Safed Musli", "Akarkara", "Herbal Extracts"],
    description: "पारंपरिक आयुर्वेदिक माजून फॉर्मूला जो पुरुषों की वाइटैलिटी, पावर और स्टैमिना को प्राकृतिक रूप से सपोर्ट करता है। रोजमर्रा की थकान और अंदरूनी कमजोरी को दूर कर नई स्फूर्ति देता है।",
    coinsEarned: 22,
    showCoins: true,
    deliveryDays: "3 - 5 Days",
    inStock: true,
  },
  {
    id: "prod_1788511819071",
    name: "MADHUNASHI POWDER",
    slug: "madhunashi-powder",
    concern: "Sugar Management",
    price: 1487,
    compareAt: 2199,
    rating: 5.0,
    reviews: 215,
    badge: "AYUSH CERTIFIED",
    image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80",
    ingredients: ["Gudmar (Gymnema Sylvestre)", "Karela (Bitter Gourd)", "Jamun Seed", "Vijaysar", "Methi"],
    description: "Madhunashi 100% natural Ayurvedic blend of Gudmar, Karela, and Jamun crafted to support healthy blood sugar levels and provide antioxidant support. 200g, GMP certified, gluten-free.",
    coinsEarned: 74,
    showCoins: true,
    deliveryDays: "3 - 5 Days",
    inStock: true,
  },
  {
    id: "prod_1788511912600",
    name: "MADHUNASHI SYP",
    slug: "madhunashi-syp",
    concern: "Sugar Management",
    price: 410,
    compareAt: 499,
    rating: 5.0,
    reviews: 86,
    badge: "POPULAR",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
    ingredients: ["Karela", "Jamun", "Gudmar", "Nimba", "Giloy Extracts"],
    description: "Madhunashi Syrup is a traditional Ayurvedic tonic formulated to support natural blood sugar balance. 100% vegetarian, GMP certified, and free from harmful additives.",
    coinsEarned: 21,
    showCoins: true,
    deliveryDays: "3 - 5 Days",
    inStock: true,
  },
  {
    id: "prod_1788511960374",
    name: "FAT BURNER",
    slug: "fat-burner",
    concern: "Gym & Fitness",
    price: 499,
    compareAt: 599,
    rating: 5.0,
    reviews: 134,
    badge: "TOP RATED",
    image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80",
    ingredients: ["Wild Amla", "Curry Leaves", "Ginger", "Garcinia Cambogia", "Harad", "Baheda"],
    description: "Fat Burn Juice – an Ayurvedic slim tonic with Amla, Curry Leaves, and Ginger to naturally support metabolism, detox, energy and weight management. 500ml, GMP certified.",
    coinsEarned: 25,
    showCoins: true,
    deliveryDays: "3 - 5 Days",
    inStock: true,
  },
  {
    id: "prod_1788512010828",
    name: "PERFECT 36 CREAM",
    slug: "perfect-36-cream",
    concern: "Women's Health",
    price: 5,
    compareAt: 799,
    rating: 5.0,
    reviews: 79,
    badge: "SAFE & GENTLE",
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80",
    ingredients: ["Shatavari", "Ashwagandha", "Gambhari", "Jamun Botanicals"],
    description: "Natural herbal toning cream formulated with time-tested Ayurvedic botanicals like Shatavari, Ashwagandha, and Gambhari. Supports skin elasticity and firmness. 100ml.",
    coinsEarned: 35,
    showCoins: true,
    deliveryDays: "3 - 5 Days",
    inStock: true,
  },
];

export const headerSearchSuggestions = [
  "Virja Powder",
  "Madhunashi",
  "Fat Burner",
  "Virja Gold Majun",
  "Perfect 36 Cream",
  "Sugar Management",
  "Men's Stamina",
  "Weight Management",
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
    title: "100% Ayurvedic Virja Powder & Gold Majun",
    subtitle: "AUTHENTIC AYURVEDA FOR PEAK MEN'S STAMINA & ENERGY",
    offer: "GET EXTRA 10% OFF WITH CODE: PURE10",
    ctaText: "SHOP VIRJA REMEDIES",
    href: "/products/virja-powder",
    badge: "100% Pure Sourced",
    image: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=1200&q=80",
    bgColor: "from-[#1d3b24] via-[#244f31] to-[#0f2416]",
  },
  {
    id: 2,
    title: "Madhunashi Sugar Management Care",
    subtitle: "CLINICALLY BACKED BOTANICALS WITH GUDMAR, KARELA & JAMUN",
    offer: "BUY POWDER & SYRUP COMBO",
    ctaText: "EXPLORE MADHUNASHI",
    href: "/products/madhunashi-powder",
    badge: "GMP Certified",
    image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=1200&q=80",
    bgColor: "from-[#2d6b3f] via-[#1d4629] to-[#122c1b]",
  },
  {
    id: 3,
    title: "Ayurvedic Fat Burner Slim Tonic",
    subtitle: "NATURAL METABOLISM, DETOX & WEIGHT MANAGEMENT SUPPORT",
    offer: "EARN 2X PURE COINS ON EVERY BOTTLE",
    ctaText: "UNLOCK FAT BURNER",
    href: "/products/fat-burner",
    badge: "100% Ayurvedic",
    image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80",
    bgColor: "from-[#3e2c1e] via-[#63432b] to-[#2b1d13]",
  },
];
