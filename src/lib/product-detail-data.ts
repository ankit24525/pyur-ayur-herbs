export type ProductVariant = {
  id: string;
  name: string;
  type?: string;
  value?: string;
  price: number;
  mrp: number;
  compareAt?: number;
  discount?: string;
  badge?: string;
  image?: string;
  inStock?: boolean;
};

export type IngredientInfo = {
  name: string;
  sanskritName?: string;
  description: string;
  action?: string;
  image?: string;
};

export type DosageStep = {
  step: number;
  title: string;
  description: string;
  icon: string;
  timing?: string;
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
  image?: string;
  images?: string[];
  verifiedBuyer?: boolean;
};

export type ProductSpecification = {
  label: string;
  value: string;
};

export type ProductDetail = {
  id: string;
  slug: string;
  name: string;
  subtitle?: string;
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
  showCoins?: boolean;
  tag: string;
  description: string;
  perUnitCostText?: string;
  variants: ProductVariant[];
  benefits: { title: string; desc: string; icon: string }[];
  ingredients: IngredientInfo[];
  dosageSteps: DosageStep[];
  suitableFor?: {
    recommended: string[];
    caution: string[];
  };
  whyAyurveda?: { title: string; desc: string; icon: string }[];
  specifications?: ProductSpecification[];
  customerReviews: CustomerReviewItem[];
  faqs: { question: string; answer: string }[];
  inStock?: boolean;
};

export const RAW_CATALOG_DETAILS: Record<string, Partial<ProductDetail>> = {
  "madhunashi-powder": {
    subtitle: "Low GI Himalayan Herbal Churna for Sugar Control, Insulin Sensitivity & HbA1c Balance",
    perUnitCostText: "Effective cost: Just ₹8 per daily dose • 100% Sugar Free",
    tag: "100% AYUSH CERTIFIED • CLINICALLY EVALUATED",
    benefits: [
      {
        title: "Prevents Sudden Post-Meal Sugar Spikes",
        desc: "Potent soluble fiber & 4-hydroxyisoleucine slow down glucose absorption in the gut, ensuring steady post-prandial levels.",
        icon: "🩸",
      },
      {
        title: "Protects & Recharges Beta Cells",
        desc: "Vijaysar and Jamun seed phytosterols protect pancreatic islets, stimulating natural endogenous insulin response.",
        icon: "🩺",
      },
      {
        title: "Reduces Sugar & Carb Cravings",
        desc: "Gymnemic acids in Gurmar temporarily numb sweet receptors on taste buds, naturally curbing compulsive sugar snacking.",
        icon: "🌿",
      },
      {
        title: "Relieves Diabetic Fatigue & Polyuria",
        desc: "Alleviates persistent weakness, dry mouth, and frequent nighttime urination by improving cellular ATP energy uptake.",
        icon: "⚡",
      },
    ],
    ingredients: [
      {
        name: "Methi (Fenugreek)",
        sanskritName: "Trigonella foenum-graecum",
        action: "Glucose Absorption Regulator",
        description: "Rich in galactomannan fiber that slows carbohydrate digestion and flattens glucose curves.",
      },
      {
        name: "Gurmar (Gymnema)",
        sanskritName: "Gymnema sylvestre",
        action: "The Sugar Destroyer",
        description: "Known in ancient Ayurveda as 'Madhunashini', it blocks intestinal sugar receptors and supports pancreas.",
      },
      {
        name: "Jamun Seed (Black Plum)",
        sanskritName: "Syzygium cumini",
        action: "Pancreatic Beta Cell Care",
        description: "Contains jamboline and ellagic acid which prevent pathological conversion of starch into glucose.",
      },
      {
        name: "Karela (Bitter Gourd)",
        sanskritName: "Momordica charantia",
        action: "Plant-Based Polypeptide-P",
        description: "Bioactive charantin acts like natural insulin, facilitating rapid cellular glucose utilization.",
      },
      {
        name: "Vijaysar Bark",
        sanskritName: "Pterocarpus marsupium",
        action: "Classical Rasayana Tonic",
        description: "Documented in Charaka Samhita for regenerating beta cells and maintaining balanced lipid profile.",
      },
      {
        name: "Giloy (Guduchi)",
        sanskritName: "Tinospora cordifolia",
        action: "Detox & Cellular Immunity",
        description: "Immunomodulator that reduces oxidative stress, kidney strain, and secondary diabetes complications.",
      },
    ],
    dosageSteps: [
      {
        step: 1,
        title: "Take 1 Scoop (5g)",
        description: "Measure one level spoon of micro-milled Madhunashi powder.",
        icon: "🥄",
        timing: "Morning & Evening",
      },
      {
        step: 2,
        title: "Mix with Warm Water",
        description: "Stir thoroughly in a glass (150ml) of lukewarm water or herbal green tea.",
        icon: "🥛",
        timing: "Warm Liquid",
      },
      {
        step: 3,
        title: "Consume 30 Mins Before Meals",
        description: "Drink 30 minutes before breakfast and dinner for optimal post-meal glucose buffering.",
        icon: "⏰",
        timing: "Twice Daily",
      },
    ],
    suitableFor: {
      recommended: [
        "Individuals with elevated fasting, post-prandial, or borderline sugar levels",
        "Adults looking to manage HbA1c levels alongside a balanced diet",
        "Those experiencing sluggishness, frequent thirst, and post-lunch sugar crashes",
        "Safe for daily long-term use across adult age groups (18-70+ years)",
      ],
      caution: [
        "Pregnant or breastfeeding mothers should consult their physician before use",
        "If you are on allopathic sugar medicines, keep a 45-minute gap between doses and monitor levels",
      ],
    },
    whyAyurveda: [
      {
        title: "100% Himalayan Herbs",
        desc: "Harvested at peak potency from high-altitude chemical-free farms.",
        icon: "🏔️",
      },
      {
        title: "Heavy Metal Tested",
        desc: "Strictly tested for Lead, Mercury, and Arsenic (<0.1 ppm) in NABL-accredited labs.",
        icon: "🧪",
      },
      {
        title: "AYUSH & GMP Certified",
        desc: "Manufactured in a certified Ayurvedic facility adhering to classical Shastra methods.",
        icon: "📜",
      },
      {
        title: "Doctor Formulated",
        desc: "Curated by senior Ayurvedic Vaidyas with 30+ years of clinical diabetes care.",
        icon: "👨‍⚕️",
      },
    ],
    specifications: [
      { label: "Product Form", value: "Micro-milled 100% Pure Herbal Churna" },
      { label: "Net Quantity", value: "200g (Approx. 40 Days Supply)" },
      { label: "Serving Size", value: "5g Twice Daily" },
      { label: "Shelf Life", value: "24 Months from Date of Manufacture" },
      { label: "Country of Origin", value: "India (Proudly Himalayan)" },
      { label: "FSSAI / AYUSH License", value: "AYUSH GMP Certified Formula" },
      { label: "Storage Instructions", value: "Store in a cool, dry place. Keep container tightly sealed." },
      { label: "Dietary Suitability", value: "100% Vegetarian, Vegan, Gluten Free, 0 Added Sugar" },
    ],
    faqs: [
      {
        question: "How many days does one pack of Madhunashi Powder last?",
        answer: "One 200g pack provides approximately 40 servings (20 to 30 days) when taken as recommended (1 scoop twice daily). For comprehensive HbA1c balancing, a 3-month course (3 packs) is recommended.",
      },
      {
        question: "Can I take Madhunashi Powder along with my allopathic medications?",
        answer: "Yes, absolutely! Madhunashi Powder is a 100% herbal formula. Simply maintain a 45-minute gap between your allopathic medicines and Madhunashi. Regularly monitor your blood sugar readings.",
      },
      {
        question: "Does it have any side effects?",
        answer: "No. Madhunashi is made with 100% pure Ayurvedic herbs (Methi, Jamun, Gurmar, Karela, Vijaysar) with zero chemical additives, preservatives, or artificial colors. It is gentle on the stomach and non-habit forming.",
      },
      {
        question: "How does Madhunashi compare to regular multigrain flour / bitter gourd juice?",
        answer: "Unlike raw juices which lose active compounds quickly or generic flours with minimal herb concentrations, Madhunashi uses concentrated, standardized extracts of 6 classical anti-hyperglycemic herbs for maximum bioavailability at just ₹8/day.",
      },
      {
        question: "How long should I consume this to see visible improvements?",
        answer: "Most users notice an improvement in daily energy levels and reduced post-meal sluggishness within 10 to 14 days. Measurable improvements in fasting sugar and HbA1c typically manifest after 6 to 12 weeks of continuous consumption.",
      },
    ],
  },

  "madhunashi-syp": {
    subtitle: "Classical Ayurvedic Liquid Decoction (Kwath) for Rapid Absorption & Sugar Balance",
    perUnitCostText: "Fast Acting Classical Kwath • Zero Artificial Sweeteners",
    tag: "CLASSICAL KWATH • 100% AYURVEDIC",
    benefits: [
      {
        title: "Rapid Absorption Liquid Formula",
        desc: "Brewed via classical decoction (Kwath) for faster bioavailability and immediate digestive absorption.",
        icon: "💧",
      },
      {
        title: "Supports Healthy Fasting Glucose",
        desc: "Synergistic herbal blend works overnight to prevent morning dawn phenomenon sugar spikes.",
        icon: "🩺",
      },
      {
        title: "Detoxifies Pancreas & Kidneys",
        desc: "Flushes metabolic toxins (Aam Dosha) and protects vital organs from high glucose toxicity.",
        icon: "🌿",
      },
      {
        title: "Relieves Constant Thirst & Fatigue",
        desc: "Restores electrolyte balance, relieves dry throat, and energizes body tissues.",
        icon: "⚡",
      },
    ],
    ingredients: [
      {
        name: "Vijaysar Heartwood",
        sanskritName: "Pterocarpus marsupium",
        action: "Insulin Mimetic",
        description: "Rich in marsupsin and pterosupin, compounds clinically shown to support beta cell health.",
      },
      {
        name: "Jamun Kwath",
        sanskritName: "Syzygium cumini",
        action: "Glycemic Stabilizer",
        description: "Reduces starch conversion to sugar and prevents excessive urination.",
      },
      {
        name: "Karela Extract",
        sanskritName: "Momordica charantia",
        action: "Charantin & Polypeptide-P",
        description: "Enhances glucose entry into cells without causing sudden hypoglycemic crashes.",
      },
      {
        name: "Gudmar Leaves",
        sanskritName: "Gymnema sylvestre",
        action: "Sugar Eliminator",
        description: "Neutralizes sugar receptors and supports healthy HbA1c management.",
      },
    ],
    dosageSteps: [
      {
        step: 1,
        title: "Measure 15-20ml",
        description: "Use the measuring cap provided to pour 15 to 20ml of Madhunashi Syrup.",
        icon: "🥛",
        timing: "Twice Daily",
      },
      {
        step: 2,
        title: "Dilute with Water",
        description: "Mix with half a cup of lukewarm water.",
        icon: "💧",
        timing: "Equal Water",
      },
      {
        step: 3,
        title: "Take Before Meals",
        description: "Drink 20-30 minutes before your morning breakfast and evening dinner.",
        icon: "⏰",
        timing: "Before Meals",
      },
    ],
    suitableFor: {
      recommended: [
        "People who prefer easy liquid syrup over powders",
        "Adults with chronic sugar fluctuations needing fast-absorbing care",
        "Individuals with prediabetes or family history of high blood sugar",
      ],
      caution: [
        "Store in a cool dry place away from direct sunlight",
        "Shake bottle well before every use",
      ],
    },
    specifications: [
      { label: "Product Form", value: "Classical Ayurvedic Liquid Decoction (Kwath)" },
      { label: "Net Volume", value: "450ml" },
      { label: "Shelf Life", value: "24 Months" },
      { label: "AYUSH License", value: "100% Certified Ayurvedic Proprietary Medicine" },
    ],
    faqs: [
      {
        question: "Is this syrup sweetened with sugar?",
        answer: "No, absolutely not! Madhunashi Syrup contains zero refined sugar, zero sucrose, and zero artificial sweeteners. The mild pleasant herbal taste comes naturally from the brewed botanicals.",
      },
    ],
  },

  "virja-gold-majun": {
    subtitle: "Himalayan Gold Grade Shilajit, Swarna Bhasma, Ashwagandha & Safed Musli for Men's Stamina",
    perUnitCostText: "Gold Grade Shilajit • 84+ Minerals • Swarna Bhasma",
    tag: "GOLD GRADE SHILAJIT • 100% AYURVEDIC FORMULA",
    benefits: [
      {
        title: "Surges Peak Stamina & Power",
        desc: "Supercharges mitochondrial ATP generation, delivering relentless physical strength, stamina, and workout endurance.",
        icon: "⚡",
      },
      {
        title: "Boosts Free Testosterone Naturally",
        desc: "Clinically validated botanicals stimulate the pituitary-gonadal axis, elevating free testosterone levels naturally.",
        icon: "💪",
      },
      {
        title: "Eliminates Stress & Performance Anxiety",
        desc: "KSM-66 grade Ashwagandha reduces serum cortisol by up to 30%, keeping you calm, confident, and laser-focused.",
        icon: "🧘",
      },
      {
        title: "Deep Sapta Dhatu Rejuvenation",
        desc: "Gold Bhasma (nano-gold) acts as a Yogavahi vehicle, driving nutrients deep into Shukra Dhatu for sustained youthfulness.",
        icon: "🛡️",
      },
    ],
    ingredients: [
      {
        name: "Shuddha Shilajit (Gold Grade)",
        sanskritName: "Asphaltum punjabianum",
        action: "75%+ Fulvic Acid & 84+ Minerals",
        description: "Harvested from 18,000+ ft Himalayan peaks; boosts ATP cellular fuel and oxygen absorption.",
      },
      {
        name: "Swarna Bhasma (Nano-Gold)",
        sanskritName: "Aurum metallicum",
        action: "Classical Rasayana Bio-Catalyst",
        description: "Ancient nano-gold preparation for supreme tissue longevity, mental clarity, and strength.",
      },
      {
        name: "Ashwagandha Extract",
        sanskritName: "Withania somnifera",
        action: "Vitality & Cortisol Reducer",
        description: "Adaptogenic herb that boosts muscular strength, lowers fatigue, and stabilizes mood.",
      },
      {
        name: "Safed Musli & Gokshura",
        sanskritName: "Chlorophytum borivilianum & Tribulus",
        action: "Vigour & Nitric Oxide Boosters",
        description: "Promotes healthy microcirculation, blood flow, and male reproductive vitality.",
      },
      {
        name: "Kaunch Beej & Akarkara",
        sanskritName: "Mucuna pruriens & Anacyclus pyrethrum",
        action: "Neurotransmitter Recharger",
        description: "Rich in natural L-Dopa, optimizing dopamine neurotransmission for drive and confidence.",
      },
    ],
    dosageSteps: [
      {
        step: 1,
        title: "Take 1 Spoon (5-10g)",
        description: "Scoop out 1 teaspoon of Virja Gold Majun paste using a dry spoon.",
        icon: "🥄",
        timing: "Once Daily",
      },
      {
        step: 2,
        title: "Consume with Warm Milk",
        description: "Best taken with 1 glass of warm milk (or lukewarm water for lactose-intolerant).",
        icon: "🥛",
        timing: "Warm Milk",
      },
      {
        step: 3,
        title: "30 Mins Before Bedtime",
        description: "Take consistently for 60 to 90 days for peak sustained stamina and vitality.",
        icon: "🌙",
        timing: "Night Ritual",
      },
    ],
    suitableFor: {
      recommended: [
        "Men facing chronic fatigue, low stamina, and low physical power",
        "Men seeking natural testosterone support, strength, and endurance",
        "Fitness enthusiasts & professionals dealing with work stress and exhaustion",
        "Men aged 21 to 65+ seeking safe, non-hormonal Ayurvedic vitality",
      ],
      caution: [
        "Strictly formulated for adult men",
        "Individuals with severe heart conditions should consult their doctor",
      ],
    },
    whyAyurveda: [
      {
        title: "Authentic Gold Grade Shilajit",
        desc: "Purified using 7-stage traditional Triphala Shodhana.",
        icon: "🏔️",
      },
      {
        title: "0 Chemicals or Steroids",
        desc: "100% herbal & non-hormonal. Zero side effects or dependence.",
        icon: "🌱",
      },
      {
        title: "Doctor Formulated",
        desc: "Classical Rasayana formulations backed by modern safety checks.",
        icon: "👨‍⚕️",
      },
      {
        title: "Discreet Delivery",
        desc: "Shipped in 100% plain, unmarked packaging with zero labels on box.",
        icon: "📦",
      },
    ],
    specifications: [
      { label: "Product Form", value: "Nutrient-Dense Classical Herbal Majun (Paste)" },
      { label: "Net Weight", value: "250g" },
      { label: "Serving Size", value: "5-10g Once Daily" },
      { label: "Shelf Life", value: "24 Months" },
      { label: "Certification", value: "AYUSH Certified 100% Ayurvedic Formula" },
    ],
    faqs: [
      {
        question: "How soon can I expect results from Virja Gold Majun?",
        answer: "Most men report a clear surge in daily energy and reduced lethargy within 7 to 10 days. Deep physical stamina and endurance build progressively over 3 to 6 weeks of consistent use.",
      },
      {
        question: "Is Virja Gold Majun safe for long-term daily consumption?",
        answer: "Yes, 100%! Unlike synthetic stimulants that cause heart palpitations or dependency, Virja Gold Majun is a restorative Rasayana that naturally strengthens tissues and can be safely taken for 3 to 6 months.",
      },
      {
        question: "Will the delivery packaging be private?",
        answer: "Yes, absolutely! Every order is shipped in a completely plain, discreet brown courier box with no product details mentioned on the outside, ensuring 100% privacy.",
      },
    ],
  },

  "virja-powder": {
    subtitle: "Pure Himalayan Shilajit, Ashwagandha, Musli & Gokshura Churna for Men's Strength",
    perUnitCostText: "High Potency Ayurvedic Churna • 100% Pure Herbs",
    tag: "STAMINA & VIGOUR • 100% AYURVEDIC",
    benefits: [
      {
        title: "Elevates Muscle Strength & Power",
        desc: "Increases muscle mass recovery, athletic output, and physical endurance.",
        icon: "💪",
      },
      {
        title: "Boosts Nitric Oxide & Circulation",
        desc: "Gokshura and Akarkara enhance peripheral circulation and nutrient delivery to tissues.",
        icon: "🩸",
      },
      {
        title: "Combats Chronic Tiredness",
        desc: "Supplies bioavailable iron and minerals, revitalizing the body after hard work.",
        icon: "⚡",
      },
      {
        title: "Holistic Rejuvenator",
        desc: "Nourishes nervous system and supports peaceful deep sleep for recovery.",
        icon: "🧘",
      },
    ],
    ingredients: [
      { name: "Shilajit Powder", description: "Himalayan mineral resin rich in fulvic acid and trace elements." },
      { name: "Ashwagandha", description: "Adaptogen that lowers stress cortisol and enhances vigor." },
      { name: "Safed Musli", description: "Known as 'White Gold' in Ayurveda for reproductive tissue strength." },
      { name: "Kaunch Beej", description: "Enhances mental drive, reflexes, and natural vitality." },
    ],
    dosageSteps: [
      { step: 1, title: "1 Teaspoon Daily", description: "Take 5g powder with warm milk or honey.", icon: "🥄" },
      { step: 2, title: "Bedtime Routine", description: "Consume 30 minutes before sleep for optimal rejuvenation.", icon: "🌙" },
    ],
    suitableFor: {
      recommended: [
        "Men wanting all-day strength and athletic endurance",
        "Men recovering from exhaustion or high stress",
      ],
      caution: ["Adult men only"],
    },
    specifications: [
      { label: "Product Form", value: "Finely Milled Ayurvedic Powder" },
      { label: "Net Quantity", value: "200g" },
      { label: "Shelf Life", value: "24 Months" },
    ],
    faqs: [
      {
        question: "Can I take this with water if I don't drink milk?",
        answer: "Yes, you can easily take Virja Powder with lukewarm water or warm almond milk.",
      },
    ],
  },

  "fat-burner": {
    subtitle: "Ayurvedic Medohar Formulation with Garcinia, Guggulu, Green Coffee & Triphala for Healthy Weight",
    perUnitCostText: "Zero Starvation • Zero Chemicals • Natural Lipid Metabolism",
    tag: "MEDOHAR RASAYANA • AYUSH CERTIFIED",
    benefits: [
      {
        title: "Accelerates Natural Fat Metabolism",
        desc: "Vrikshamla (Garcinia HCA) inhibits ATP-citrate lyase, preventing dietary carbs from turning into stored body fat.",
        icon: "🔥",
      },
      {
        title: "Targets Stubborn Belly & Hip Fat",
        desc: "Shuddha Guggulu stimulates natural thyroid function and breaks down deep visceral lipid pockets.",
        icon: "⚖️",
      },
      {
        title: "Curbs Emotional & Unhealthy Cravings",
        desc: "Naturally enhances satiety so you feel full with smaller healthy portions without fatigue.",
        icon: "🥗",
      },
      {
        title: "Flushes Toxins (Aam Dosha) & Bloating",
        desc: "Triphala cleanses digestive tract, relieves chronic water retention, and improves digestion.",
        icon: "💧",
      },
    ],
    ingredients: [
      {
        name: "Vrikshamla (Garcinia Cambogia 60% HCA)",
        sanskritName: "Garcinia indica",
        action: "Natural Lipogenesis Blocker",
        description: "Contains Hydroxycitric Acid that blocks fat production enzymes and curbs cravings.",
      },
      {
        name: "Shuddha Guggulu",
        sanskritName: "Commiphora mukul",
        action: "Classical Medohar Guggulu",
        description: "Revered in Ayurveda for reducing excess Meda Dhatu (adipose tissue) and bad cholesterol.",
      },
      {
        name: "Green Coffee Bean Extract",
        sanskritName: "Coffea arabica",
        action: "Chlorogenic Acid Thermogenesis",
        description: "Boosts baseline metabolic rate without jitters or blood pressure spikes.",
      },
      {
        name: "Triphala (Amla, Haritaki, Bibhitaki)",
        sanskritName: "Terminalia & Emblica",
        action: "Gut Detox & Bowel Regularity",
        description: "Detoxifies digestive canal, eliminates gut gas, and prevents toxin accumulation.",
      },
      {
        name: "Pippali & Kali Mirch (Bio-Enhancers)",
        sanskritName: "Piper longum & nigrum",
        action: "Digestive Agni Enhancer",
        description: "Kindles internal digestive fire (Jatharagni) to burn calories efficiently.",
      },
    ],
    dosageSteps: [
      {
        step: 1,
        title: "Take Recommended Dose",
        description: "Take 1-2 tablets or 1 teaspoon powder as indicated on label.",
        icon: "💊",
        timing: "Twice Daily",
      },
      {
        step: 2,
        title: "Drink with Warm Water",
        description: "Always consume with a full glass of warm water.",
        icon: "🥛",
        timing: "Warm Water",
      },
      {
        step: 3,
        title: "30 Mins Before Meals",
        description: "Consume 30 minutes before lunch and dinner for optimal appetite control.",
        icon: "⏰",
        timing: "Before Meals",
      },
    ],
    suitableFor: {
      recommended: [
        "Adults struggling with slow metabolism and stubborn belly fat",
        "People wanting healthy weight management without harsh crash diets",
        "Those experiencing bloating, water retention, and heavy sluggish digestion",
      ],
      caution: [
        "Not recommended during pregnancy, lactation, or for children under 16",
        "Combine with daily 20-30 min brisk walk and adequate water intake for best results",
      ],
    },
    whyAyurveda: [
      {
        title: "0 Synthetic Stimulants",
        desc: "Contains zero artificial ephedrine or harsh thermogenics.",
        icon: "🌱",
      },
      {
        title: "Kindles Natural Digestion",
        desc: "Works with your body's Agni to burn calories naturally.",
        icon: "🔥",
      },
      {
        title: "AYUSH Certified",
        desc: "100% safe, standardized Ayurvedic herbs.",
        icon: "📜",
      },
    ],
    specifications: [
      { label: "Product Form", value: "Herbal Extract Tablets / Powder" },
      { label: "Shelf Life", value: "24 Months" },
      { label: "Key Active", value: "Garcinia 60% HCA + Shuddha Guggulu" },
      { label: "Suitable For", value: "Men & Women (18-65+)" },
    ],
    faqs: [
      {
        question: "Do I have to do strict dieting while taking Fat Burner?",
        answer: "No extreme starvation diets are required! Simply eat clean home-cooked meals, drink 2-3 liters of water, and avoid deep-fried foods. The formula naturally helps manage portion sizes and burns excess calories.",
      },
      {
        question: "Will I regain weight once I stop taking it?",
        answer: "No. Unlike chemical weight loss pills that cause water-loss rebound, Pure Ayur Fat Burner strengthens your natural digestive fire (Agni) and resets metabolism, allowing you to sustain your healthy weight naturally.",
      },
    ],
  },

  "perfect-36-cream": {
    subtitle: "Ayurvedic Botanical Firming & Contouring Cream with Shatavari, Fenugreek & Wheatgerm Oil",
    perUnitCostText: "100% Botanical Actives • Zero Mineral Oils • Zero Parabens",
    tag: "WOMEN'S AYURVEDIC CARE • 100% BOTANICAL",
    benefits: [
      {
        title: "Tones & Firms Delicate Skin Tissues",
        desc: "Shatavari and Lodhra extracts stimulate tissue firmness, restoring youthful elasticity and contour.",
        icon: "🌸",
      },
      {
        title: "Promotes Natural Collagen & Elasticity",
        desc: "Cold-pressed Wheatgerm Oil supplies natural Vitamin E to regenerate elastin fibers and smooth stretch lines.",
        icon: "✨",
      },
      {
        title: "Deeply Hydrating Non-Greasy Texture",
        desc: "Absorbs within seconds without staining clothes or leaving oily residue.",
        icon: "💧",
      },
      {
        title: "100% Safe Chemical-Free Formula",
        desc: "Free from parabens, mineral oils, synthetic fragrances, and harsh artificial silicones.",
        icon: "🌿",
      },
    ],
    ingredients: [
      {
        name: "Shatavari Extract",
        sanskritName: "Asparagus racemosus",
        action: "Women's Master Herb",
        description: "Rich in natural saponins and bio-phytoestrogens that support healthy tissue tone.",
      },
      {
        name: "Wheat Germ Oil",
        sanskritName: "Triticum vulgare",
        action: "Natural Vitamin E Powerhouse",
        description: "Rejuvenates cellular elasticity and protects delicate dermal structure.",
      },
      {
        name: "Fenugreek Seed Oil",
        sanskritName: "Trigonella foenum-graecum",
        action: "Tissue Firming Bio-Lipids",
        description: "Traditional botanical oil recognized for enhancing firmness and smooth skin texture.",
      },
      {
        name: "Lodhra & Ashoka Bark",
        sanskritName: "Symplocos racemosa & Saraca asoca",
        action: "Dermal Astringent & Toners",
        description: "Classical Ayurvedic herbs that tighten skin tissues and prevent sagging.",
      },
    ],
    dosageSteps: [
      {
        step: 1,
        title: "Cleanse & Dry",
        description: "Cleanse the target area with warm water and pat dry with a soft towel.",
        icon: "💧",
        timing: "Twice Daily",
      },
      {
        step: 2,
        title: "Apply Coin-Sized Amount",
        description: "Take a coin-sized quantity of Perfect 36 Cream on clean fingertips.",
        icon: "🧴",
        timing: "Morning & Night",
      },
      {
        step: 3,
        title: "Gentle Upward Massage",
        description: "Massage gently in circular, upward motions for 3-5 minutes until fully absorbed.",
        icon: "✨",
        timing: "Circular Motion",
      },
    ],
    suitableFor: {
      recommended: [
        "Women looking to restore skin tone, firmness, and natural contour",
        "Post-pregnancy or post-weight-loss skin toning care",
        "Women seeking 100% natural, non-hormonal, mineral-oil-free botanical care",
      ],
      caution: [
        "For external cosmetic use only",
        "Do not apply on broken skin or during active breastfeeding without medical advice",
      ],
    },
    whyAyurveda: [
      { title: "Zero Mineral Oils", desc: "Crafted exclusively with pure botanical oils.", icon: "🌱" },
      { title: "Dermatologically Tested", desc: "Gentle, non-irritating formula safe for daily skin application.", icon: "✨" },
      { title: "AYUSH Certified", desc: "Prepared according to traditional Ayurvedic herbal extraction standards.", icon: "📜" },
    ],
    specifications: [
      { label: "Product Form", value: "Smooth Fast-Absorbing Botanical Cream" },
      { label: "Net Quantity", value: "100g" },
      { label: "Shelf Life", value: "24 Months" },
      { label: "Skin Type", value: "Suitable for All Skin Types" },
    ],
    faqs: [
      {
        question: "How long does one jar of Perfect 36 Cream last?",
        answer: "One 100g jar typically lasts 30 to 45 days when used twice daily as recommended.",
      },
      {
        question: "Is it non-sticky?",
        answer: "Yes! Perfect 36 Cream has a lightweight, fast-absorbing botanical base that penetrates deep into skin tissues within 60 seconds without leaving oily residue on clothes.",
      },
    ],
  },
};

/**
 * Returns complete, enriched Kapiva-grade product details for any product.
 */
export function getEnrichedProductData(matchedProduct: any, rawSlug: string): ProductDetail {
  const normalizedSlug = (rawSlug || "").toLowerCase().trim();
  const matchedSlug = (matchedProduct?.slug || normalizedSlug).toLowerCase().trim();

  // Look for predefined rich details
  const preset =
    RAW_CATALOG_DETAILS[matchedSlug] ||
    RAW_CATALOG_DETAILS[normalizedSlug] ||
    Object.entries(RAW_CATALOG_DETAILS).find(([key]) => matchedSlug.includes(key) || normalizedSlug.includes(key))?.[1] ||
    {};

  const price = Number(matchedProduct?.price) || 499;
  const mrp = Number(matchedProduct?.compareAt || matchedProduct?.mrp) || Math.round(price * 1.25);
  const discount = matchedProduct?.badge || matchedProduct?.discount || (mrp > price ? `${Math.round(((mrp - price) / mrp) * 100)}% OFF` : "SPECIAL OFFER");
  const image = matchedProduct?.image || "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=650&q=80";

  // Build high-converting Kapiva pack bundle variants if no custom variants exist
  const existingVariants = Array.isArray(matchedProduct?.variants) && matchedProduct.variants.length > 1
    ? matchedProduct.variants
    : [
        {
          id: `${matchedProduct?.id || "1"}-pack1`,
          name: "1 Pack (1 Month)",
          value: "1 Pack",
          price,
          mrp,
          discount,
          badge: "STANDARD PACK",
          inStock: matchedProduct?.inStock !== false,
        },
        {
          id: `${matchedProduct?.id || "1"}-pack2`,
          name: "Pack of 2 (2 Months - Save Extra 15%)",
          value: "Pack of 2",
          price: Math.round(price * 2 * 0.85),
          mrp: mrp * 2,
          discount: "SAVE EXTRA 15%",
          badge: "MOST POPULAR",
          inStock: matchedProduct?.inStock !== false,
        },
        {
          id: `${matchedProduct?.id || "1"}-pack3`,
          name: "Pack of 3 (3-Month Course - Save Extra 25%)",
          value: "Pack of 3",
          price: Math.round(price * 3 * 0.75),
          mrp: mrp * 3,
          discount: "SAVE EXTRA 25%",
          badge: "BEST VALUE • 3-MONTH COURSE",
          inStock: matchedProduct?.inStock !== false,
        },
      ];

  return {
    id: String(matchedProduct?.id || "1"),
    slug: matchedProduct?.slug || normalizedSlug,
    name: matchedProduct?.name || "Ayurvedic Remedy",
    subtitle: preset.subtitle || matchedProduct?.subtitle || "Authentic 100% Himalayan Ayurvedic Formulation for Daily Health & Vitality",
    category: matchedProduct?.concern || matchedProduct?.category || "Ayurvedic Care",
    concernSlug: (matchedProduct?.concern || matchedProduct?.category || "ayurvedic-care").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    image,
    gallery: matchedProduct?.images && matchedProduct.images.length > 0 ? [image, ...matchedProduct.images] : (matchedProduct?.gallery || [image]),
    rating: Number(matchedProduct?.rating) || 4.8,
    reviews: Number(matchedProduct?.reviews) || 248,
    price,
    mrp,
    discount,
    coins: matchedProduct?.showCoins === false
      ? 0
      : (matchedProduct?.coinsEarned !== undefined ? Number(matchedProduct.coinsEarned) : (Number(matchedProduct?.coins) || Math.round(price * 0.05))),
    showCoins: matchedProduct?.showCoins !== false,
    tag: preset.tag || matchedProduct?.tag || "100% CERTIFIED AYURVEDIC • AYUSH APPROVED",
    description: matchedProduct?.description || preset.description || "Authentic Himalayan Ayurvedic formulation crafted with standardized herbal extracts according to classical Shastra methods.",
    perUnitCostText: preset.perUnitCostText || "Value for money • Effective daily holistic care",
    variants: existingVariants,
    benefits: preset.benefits || matchedProduct?.benefits || [
      { title: "100% Pure Botanical Extracts", desc: "Crafted strictly with whole herbal actives without synthetic binders.", icon: "🌿" },
      { title: "Senior Vaidya Formulated", desc: "Balanced classical Ayurvedic preparation backed by research.", icon: "🩺" },
      { title: "Certified AYUSH Facility", desc: "Prepared in GMP-certified hygienic labs with high bioavailability.", icon: "🛡️" },
      { title: "Safe for Daily Use", desc: "Non-habit forming, zero harmful chemicals, and gentle on the gut.", icon: "✨" },
    ],
    ingredients: preset.ingredients || (Array.isArray(matchedProduct?.ingredients)
      ? matchedProduct.ingredients.map((item: any) =>
          typeof item === "string" ? { name: item, description: "Authentic wild-crafted Ayurvedic herb extract." } : item
        )
      : [
          { name: "Himalayan Herbal Actives", description: "Wild-harvested potent botanical extracts." },
          { name: "Classical Bio-Enhancers", description: "Improves gut absorption and cellular nutrition." },
        ]),
    dosageSteps: preset.dosageSteps || matchedProduct?.dosageSteps || [
      { step: 1, title: "Measure Dose", description: "Take the recommended quantity daily.", icon: "🥄", timing: "Daily" },
      { step: 2, title: "Mix with Warm Water", description: "Stir thoroughly in a glass of warm water or milk.", icon: "🥛", timing: "Warm Liquid" },
      { step: 3, title: "Regular Routine", description: "Consume consistently for 60 to 90 days for peak results.", icon: "⏰", timing: "Consistent Care" },
    ],
    suitableFor: preset.suitableFor || {
      recommended: [
        "Adults seeking natural, long-term Ayurvedic balance",
        "Those wanting 100% herbal, chemical-free daily wellness",
        "Safe for continuous use across adult age groups",
      ],
      caution: [
        "Pregnant or lactating mothers should consult their physician before use",
        "Maintain a 45-minute gap if taking allopathic medications",
      ],
    },
    whyAyurveda: preset.whyAyurveda || [
      { title: "100% Himalayan Herbs", desc: "Sourced from pristine altitudes with high active phytochemicals.", icon: "🏔️" },
      { title: "Heavy Metal Tested", desc: "Strictly tested for Lead, Mercury & Arsenic in NABL labs.", icon: "🧪" },
      { title: "AYUSH & GMP Certified", desc: "Prepared according to traditional Charaka Samhita guidelines.", icon: "📜" },
      { title: "Doctor Formulated", desc: "Developed and approved by senior Ayurvedic Vaidyas.", icon: "👨‍⚕️" },
    ],
    specifications: preset.specifications || [
      { label: "Product Form", value: "Standardized Ayurvedic Formulation" },
      { label: "Shelf Life", value: "24 Months from Mfd." },
      { label: "Country of Origin", value: "India" },
      { label: "AYUSH License", value: "100% Certified Ayurvedic Proprietary Medicine" },
      { label: "Storage", value: "Store in a cool, dry place away from direct sunlight." },
    ],
    customerReviews: matchedProduct?.customerReviews || [],
    faqs: preset.faqs && preset.faqs.length > 0 ? preset.faqs : (matchedProduct?.faqs && matchedProduct.faqs.length > 0 ? matchedProduct.faqs : [
      {
        question: "How long should I consume this remedy for best results?",
        answer: "Ayurvedic herbs work at the root cause level. For optimal tissue nourishment and lasting balance, we recommend using this remedy consistently for 60 to 90 days (2 to 3 packs).",
      },
      {
        question: "Are there any side effects or habit-forming chemicals?",
        answer: "No, absolutely none. All Pure Ayur Herbs formulations are 100% herbal, non-habit forming, and free from synthetic preservatives, steroids, or heavy metals.",
      },
      {
        question: "Can I pay Cash on Delivery (COD)?",
        answer: "Yes! Cash on Delivery is available across all serviceable pincodes in India. You can inspect your parcel upon arrival and pay cash or UPI at your doorstep.",
      },
    ]),
    inStock: matchedProduct?.inStock !== false,
  };
}

export const productDetails: ProductDetail[] = [];

export function slugifyProductName(name: string) {
  return (
    name
      .toLowerCase()
      .replace(/rs\.?|₹|[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "ayurvedic-remedy"
  );
}

export function getProductBySlug(slug: string): ProductDetail {
  return productDetails.find((p) => p.slug === slug) ?? productDetails[0];
}
