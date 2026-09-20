/**
 * Concern & Category Solution Data
 * Defines metadata, hero copy, themes, and SEO keywords for the 8 core Ayurvedic health hubs.
 */

export interface ConcernDetail {
  title: string;
  subtitle: string;
  bg: string;
  description: string;
  keywords: string[];
}

export const concernDetailsMap: Record<string, ConcernDetail> = {
  "sugar-management": {
    title: "Sugar Management Ayurvedic Remedies",
    subtitle: "CLINICALLY BACKED 11-HERB FORMULATIONS FOR GLUCOSE BALANCE",
    bg: "from-[#1d3b24] via-[#244f31] to-[#122c1b]",
    description:
      "Explore 100% natural cold-pressed juices and Ayurvedic remedies made from Karela, Jamun, Gudmar, and Methi to help regulate fasting and post-meal blood sugar levels.",
    keywords: [
      "Ayurvedic Sugar Management",
      "Madhunashi Powder",
      "Karela Jamun Juice",
      "Blood Sugar Control Ayurveda",
      "Gudmar for Diabetes",
      "Natural Glucose Balance",
      "Pure Ayur Herbs",
    ],
  },
  "gym-and-fitness": {
    title: "Gym & Fitness Ayurvedic Formulations",
    subtitle: "NATURAL STAMINA, STRENGTH & MUSCLE RECOVERY RITUALS",
    bg: "from-[#2d6b3f] via-[#1d4629] to-[#0f2416]",
    description:
      "Formulated with Ayurvedic Fat Burner tonic, metabolism stimulants, and revitalizing botanicals to boost workout endurance and natural weight management.",
    keywords: [
      "Ayurvedic Gym Supplements",
      "Ayurvedic Fat Burner Tonic",
      "Natural Muscle Recovery Herbs",
      "Herbal Stamina Booster",
      "Pure Ayur Herbs Fitness",
      "Weight Loss Ayurveda",
    ],
  },
  energy: {
    title: "Energy & Vitality Botanicals",
    subtitle: "RECHARGE DAILY STAMINA WITHOUT SYNTHETIC CAFFEINE",
    bg: "from-[#3e2c1e] via-[#244f31] to-[#17231b]",
    description:
      "Traditional Rasayanas enriched with 80+ trace minerals and fulvic acid to fight daily fatigue and keep you active all day.",
    keywords: [
      "Ayurvedic Energy Booster",
      "Virja Gold Majun",
      "Virja Powder",
      "Pure Himalayan Shilajit",
      "Natural Stamina Tonic",
      "Men's Stamina Ayurveda",
      "Rasayana for Vitality",
    ],
  },
  "skin-and-hair": {
    title: "Skin Radiance & Hair Growth Elixirs",
    subtitle: "26-HERB KUMKUMADI KASHMIRI SAFFRON RITUALS",
    bg: "from-[#3e2c1e] via-[#63432b] to-[#2b1d13]",
    description:
      "Authentic Saffron skin serums and wild Amla Vitamin C juices to fade dark spots, restore natural glow, and nourish hair roots.",
    keywords: [
      "Kumkumadi Tailam Serum",
      "Ayurvedic Hair Growth Oil",
      "Wild Amla Vitamin C Juice",
      "Kashmiri Saffron Glow",
      "Ayurvedic Skin Care",
      "Perfect 36 Cream",
    ],
  },
  "heart-health": {
    title: "Arjuna Cardiac & Heart Care Solutions",
    subtitle: "TRADITIONAL BOTANICAL TONICS FOR BP & LIPID BALANCE",
    bg: "from-[#1d3b24] via-[#244f31] to-[#0f2416]",
    description:
      "Pure Arjuna bark extractions blended with Garlic and Guggul to maintain arterial wellness and healthy blood pressure levels.",
    keywords: [
      "Arjuna Bark Juice",
      "Heart Health Ayurveda",
      "Cardiovascular Herbal Tonic",
      "Natural BP Balance Herbs",
      "Arjuna Chaal Tonic",
      "Pure Ayur Herbs Heart",
    ],
  },
  "liver-care": {
    title: "Liver Cleanse & Detox Solutions",
    subtitle: "DEEP ORGAN DETOX FOR FATTY LIVER & GUT HEALTH",
    bg: "from-[#2d6b3f] via-[#1d4629] to-[#122c1b]",
    description:
      "Potent detox juices infused with Bhumi Amla, Punarnava, and Kalmegh to flush toxins and boost digestive enzymes.",
    keywords: [
      "Liver Detox Ayurvedic Juice",
      "Fatty Liver Herbal Care",
      "Bhumi Amla Juice",
      "Kalmegh Cleanse",
      "Ayurvedic Digestive Tonic",
      "Organ Detox Ayurveda",
    ],
  },
  "daily-ayurveda": {
    title: "Daily Ayurvedic Groceries & Tonics",
    subtitle: "PURE WILD-SOURCED IMMUNITY & DIGESTIVE CARE",
    bg: "from-[#1d3b24] via-[#244f31] to-[#122c1b]",
    description:
      "Cold-pressed organic Amla juices and daily Triphala gut routines for overall family health and vital longevity.",
    keywords: [
      "Daily Ayurveda",
      "Wild Organic Amla Juice",
      "Triphala Daily Digestion",
      "Ayurvedic Groceries",
      "Family Immunity Tonics",
      "Pure Ayur Daily Wellness",
    ],
  },
  "womens-health": {
    title: "Women's Period Harmony & Hormonal Care",
    subtitle: "SHATAVARI & ASHOKA FORMULATION FOR HORMONAL BALANCE",
    bg: "from-[#3e2c1e] via-[#244f31] to-[#122c1b]",
    description:
      "Nourishing uterine tonics designed to balance hormones, ease menstrual cramps, and regulate monthly period cycles.",
    keywords: [
      "Women's Hormonal Balance Ayurveda",
      "Shatavari Tonic",
      "Ashoka Period Care",
      "PCOS Ayurvedic Support",
      "Period Cramp Relief Tonic",
      "Uterine Health Herbs",
    ],
  },
};
