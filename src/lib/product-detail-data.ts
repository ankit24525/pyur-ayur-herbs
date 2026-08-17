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

export const productDetails: ProductDetail[] = [
  {
    id: "1",
    slug: "dia-free-juice",
    name: "Dia Free Juice - Ayurvedic Sugar Management (1L)",
    category: "Sugar Management",
    concernSlug: "sugar-management",
    image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1512290900673-03058869df6d?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 4.8,
    reviews: 2450,
    price: 999,
    mrp: 1199,
    discount: "16% OFF",
    coins: 50,
    tag: "Clinically Formulated",
    description:
      "Breakthrough 11-herb Ayurvedic juice formulation made from cold-pressed Karela, Jamun Seed, Gudmar, and Methi to help regulate fasting and post-meal blood glucose naturally.",
    variants: [
      { id: "1l-single", name: "1L Pack of 1", price: 999, mrp: 1199, discount: "16% OFF" },
      { id: "1l-twin", name: "1L Pack of 2 (Save Extra 10%)", price: 1799, mrp: 2398, discount: "25% OFF", badge: "BEST VALUE" },
    ],
    benefits: [
      { title: "Regulates Glucose", desc: "Stimulates insulin production and slows glucose absorption.", icon: "🩸" },
      { title: "Reduces Sugar Cravings", desc: "Gudmar herb suppresses sweet taste receptors naturally.", icon: "🌿" },
      { title: "Improves Metabolic Rate", desc: "Cold-pressed Karela improves cell sensitivity to insulin.", icon: "⚡" },
      { title: "Supports Pancreas Health", desc: "Jamun seeds contain jamboline that prevents starch conversion.", icon: "🌱" },
    ],
    ingredients: [
      { name: "Karela (Bitter Gourd)", description: "Contains charantin & polypeptide-p which lower blood sugar levels naturally." },
      { name: "Jamun Seed", description: "Contains jamboline that regulates starch conversion to glucose." },
      { name: "Gudmar (Gymnema)", description: "Known as the 'Sugar Destroyer', blocks sugar absorption in the intestine." },
      { name: "Triphala", description: "Rich in antioxidants for pancreatic detox and smooth digestion." },
    ],
    dosageSteps: [
      { step: 1, title: "Measure 30ml", description: "Dilute 30ml of Dia Free Juice in a glass of room temperature water.", icon: "🥛" },
      { step: 2, title: "Drink Twice Daily", description: "Consume 30 mins before breakfast and 30 mins before dinner.", icon: "⏰" },
      { step: 3, title: "Consistency for 60 Days", description: "Maintain a daily routine for at least 2-3 months for optimal results.", icon: "📅" },
    ],
    customerReviews: [
      {
        id: "r1",
        name: "Sanjay Verma",
        location: "Delhi",
        rating: 5,
        date: "24 July 2026",
        title: "Remarkable drop in fasting sugar!",
        comment: "My fasting sugar dropped from 175 to 118 mg/dL in 6 weeks. Tastes natural and works without stomach discomfort.",
        verified: true,
      },
      {
        id: "r2",
        name: "Meenakshi Sundaram",
        location: "Chennai",
        rating: 5,
        date: "18 July 2026",
        title: "Best Ayurvedic juice for diabetes care",
        comment: "Consistently buying the pack of 2. Very effective cold-pressed juice. My doctor approved it along with my diet plan.",
        verified: true,
      },
    ],
    faqs: [
      { question: "How long should I consume Dia Free Juice?", answer: "We recommend consuming 30ml twice daily before meals for at least 2 to 3 months for sustained metabolic benefits." },
      { question: "Can I take this along with my regular diabetes medication?", answer: "Yes, it is 100% natural and Ayurvedic. However, monitor your blood sugar levels regularly and consult your doctor." },
    ],
  },
  {
    id: "2",
    slug: "himalayan-shilajit-resin",
    name: "Pure Himalayan Shilajit Gold Resin (20g)",
    category: "Energy & Vitality",
    concernSlug: "gym-and-fitness",
    image: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 4.9,
    reviews: 3820,
    price: 1399,
    mrp: 1699,
    discount: "18% OFF",
    coins: 70,
    tag: "100% Pure Himalayan Sourced",
    description:
      "Purified Himalayan Shilajit resin purified using traditional Shodhna methods. Rich in 80+ trace minerals and >80% Fulvic acid for peak stamina, strength, and cognitive vitality.",
    variants: [
      { id: "20g-single", name: "20g Glass Jar", price: 1399, mrp: 1699, discount: "18% OFF" },
      { id: "20g-double", name: "20g Pack of 2 (Save Extra 15%)", price: 2499, mrp: 3398, discount: "26% OFF", badge: "POPULAR" },
    ],
    benefits: [
      { title: "Boosts Stamina & Energy", desc: "Fulvic acid enhances cellular ATP energy production.", icon: "⚡" },
      { title: "Supports Muscle Recovery", desc: "Speeds up muscle tissue repair after workout sessions.", icon: "💪" },
      { title: "Elevates Testo-Vitality", desc: "Promotes natural hormonal balance and vigor.", icon: "🔥" },
      { title: "80+ Trace Minerals", desc: "Supplies essential ionic minerals missing from modern diets.", icon: "💎" },
    ],
    ingredients: [
      { name: "Purified Himalayan Shilajit", description: "Harvested at 18,000 ft in the Himalayas, purified with Triphala." },
      { name: "Swarna Bhasma (Gold Vasma)", description: "Classic Ayurvedic Rasayana that enhances nutrient absorption and vitality." },
    ],
    dosageSteps: [
      { step: 1, title: "Pea-sized Portion", description: "Take a small pea-sized amount (~250mg) using the spoon provided.", icon: "🥄" },
      { step: 2, title: "Dissolve in Warm Milk/Water", description: "Mix thoroughly in a glass of warm milk, green tea, or warm water.", icon: "☕" },
      { step: 3, title: "Drink Daily Morning", description: "Consume daily on an empty stomach or before workouts.", icon: "🌅" },
    ],
    customerReviews: [
      {
        id: "r3",
        name: "Arjun Kapoor",
        location: "Mumbai",
        rating: 5,
        date: "02 August 2026",
        title: "Genuine high quality resin",
        comment: "Dissolves cleanly without residue. Massive jump in workout endurance within 10 days.",
        verified: true,
      },
    ],
    faqs: [
      { question: "How do I test the purity of Shilajit Resin?", answer: "Pure Shilajit dissolves completely in warm water without leaving sediment and becomes soft when warm." },
    ],
  },
  {
    id: "3",
    slug: "artho-sure-juice",
    name: "Artho Sure Juice - Joint & Muscle Relief (1L)",
    category: "Gym & Fitness",
    concernSlug: "gym-and-fitness",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 4.7,
    reviews: 1180,
    price: 849,
    mrp: 999,
    discount: "15% OFF",
    coins: 42,
    tag: "Joint Stiffness Relief",
    description: "Potent anti-inflammatory herb blend designed to ease knee joint stiffness, muscle soreness, and support flexible mobility.",
    variants: [
      { id: "1l-single", name: "1L Bottle", price: 849, mrp: 999, discount: "15% OFF" },
    ],
    benefits: [
      { title: "Eases Knee Pain", desc: "Reduces inflammatory markers in synovial joint fluid.", icon: "🦴" },
      { title: "Improves Flexibility", desc: "Promotes cartilage repair and easy joint movement.", icon: "🏃" },
    ],
    ingredients: [
      { name: "Nirgundi", description: "Potent natural analgesic herb for joint pain relief." },
      { name: "Shallaki (Boswellia)", description: "Inhibits joint cartilage degradation enzymes." },
    ],
    dosageSteps: [
      { step: 1, title: "30ml Juice", description: "Mix 30ml juice in warm water once daily before meals.", icon: "🥛" },
    ],
    customerReviews: [
      { id: "r4", name: "Suresh P.", location: "Pune", rating: 5, date: "10 July 2026", title: "Helped my knee pain", comment: "Mobility has improved greatly.", verified: true },
    ],
    faqs: [
      { question: "Is this suitable for elderly people?", answer: "Yes, it is specially formulated with gentle Ayurvedic joint nourishing herbs suitable for senior citizens." },
    ],
  },
  {
    id: "4",
    slug: "kumkumadi-glow-elixir",
    name: "Kumkumadi Skin Radiance Glow Elixir (30ml)",
    category: "Skin & Hair",
    concernSlug: "skin-and-hair",
    image: "https://images.unsplash.com/photo-1608248597260-8b61c5f87b8b?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1608248597260-8b61c5f87b8b?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 4.8,
    reviews: 1940,
    price: 799,
    mrp: 999,
    discount: "20% OFF",
    coins: 40,
    tag: "Kashmiri Saffron Infused",
    description: "Authentic 26-herb Ayurvedic formulation infused with pure Kashmiri Saffron to reduce pigmentation, dark spots, and restore natural glow.",
    variants: [
      { id: "30ml-single", name: "30ml Dropper Bottle", price: 799, mrp: 999, discount: "20% OFF" },
    ],
    benefits: [
      { title: "Fades Dark Spots", desc: "Reduces melanin production and acne scars.", icon: "✨" },
      { title: "Deep Hydration", desc: "Nourishes skin layers with pure cold-pressed sesame base.", icon: "💧" },
    ],
    ingredients: [
      { name: "Kashmiri Saffron (Kumkuma)", description: "Brightens skin complexion and fights pigmentation." },
      { name: "Red Sandalwood", description: "Cools skin inflammation and refines skin texture." },
    ],
    dosageSteps: [
      { step: 1, title: "Apply 3-4 Drops", description: "Massage gently onto cleansed face before bedtime.", icon: "✨" },
    ],
    customerReviews: [
      { id: "r5", name: "Ananya M.", location: "Bengaluru", rating: 5, date: "15 July 2026", title: "Natural glow within 2 weeks", comment: "Dark spots faded dramatically.", verified: true },
    ],
    faqs: [
      { question: "Is this suitable for oily skin?", answer: "Yes, use 2 drops on damp face for non-greasy fast absorption." },
    ],
  },
];

export function slugifyProductName(name: string) {
  return name
    .toLowerCase()
    .replace(/rs\.?|₹|[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "dia-free-juice";
}

export function getProductBySlug(slug: string): ProductDetail {
  return productDetails.find((p) => p.slug === slug) ?? productDetails[0];
}

