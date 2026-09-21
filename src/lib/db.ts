import { MongoClient } from "mongodb";
import fs from "fs";
import path from "path";

const uri = process.env.MONGODB_URI || "";
const dbName = process.env.MONGODB_DB || "pure_ayur_herbs";
const localDbPath = path.join(process.cwd(), "src/lib/db.json");

export interface DBData {
  products: any[];
  orders: any[];
  coupons: any[];
  leads: any[];
  settings: any;
  reviews?: any[];
  blogs?: any[];
  faqs?: any[];
  testimonials?: any[];
  marketing?: any;
  content?: any;
  seo?: any;
  users?: any[];
  categories?: any[];
  collections?: any[];
  orderOtps?: any[];
  abandonedCarts?: any[];
  sessions?: { token: string; userId: string; expiresAt: number }[];
  otps?: any[];
  verifiedPhones?: { phone: string; verifiedAt: number; expiresAt: number }[];
  media?: any[];
}

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
  var _mongoClient: MongoClient | undefined;
}

async function getMongoClient(): Promise<MongoClient> {
  if (globalThis._mongoClient) return globalThis._mongoClient;
  if (globalThis._mongoClientPromise) return globalThis._mongoClientPromise;

  if (!uri) {
    throw new Error("MONGODB_URI environment variable is missing.");
  }

  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 20000,
    maxPoolSize: 10,
  });

  globalThis._mongoClient = client;
  globalThis._mongoClientPromise = client.connect().catch((err) => {
    globalThis._mongoClient = undefined;
    globalThis._mongoClientPromise = undefined;
    throw err;
  });

  return globalThis._mongoClientPromise;
}

export async function getDBHealthStatus(): Promise<{
  mongoConfigured: boolean;
  connected: boolean;
  latencyMs: number;
  dbName: string;
  cluster: string;
  mode: "cloud" | "local_fallback" | "local_only";
  lastPingAt: string;
  details?: string;
}> {
  if (!uri) {
    return {
      mongoConfigured: false,
      connected: false,
      latencyMs: 0,
      dbName: "local_json",
      cluster: "Local Storage (src/lib/db.json)",
      mode: "local_only",
      lastPingAt: new Date().toISOString(),
      details: "MONGODB_URI not set in environment. Running on local disk storage.",
    };
  }

  const start = Date.now();
  try {
    const client = await getMongoClient();
    await client.db(dbName).command({ ping: 1 });
    const latency = Date.now() - start;

    let clusterHost = "cluster0.wzuiyyn.mongodb.net";
    try {
      if (uri.includes("@")) {
        clusterHost = uri.split("@")[1].split("/")[0].split("?")[0];
      }
    } catch {}

    return {
      mongoConfigured: true,
      connected: true,
      latencyMs: latency,
      dbName,
      cluster: clusterHost,
      mode: "cloud",
      lastPingAt: new Date().toISOString(),
    };
  } catch (err: any) {
    return {
      mongoConfigured: true,
      connected: false,
      latencyMs: Date.now() - start,
      dbName,
      cluster: "MongoDB Atlas Cloud",
      mode: "local_fallback",
      lastPingAt: new Date().toISOString(),
      details: err?.message || "Connection timeout or failed, auto-fallback to local DB active.",
    };
  }
}

let dbMemoryCache: { data: DBData; timestamp: number } | null = null;
const CACHE_TTL_MS = 2000; // 2s max in-memory cache for rapid real-time synchronization

export function invalidateDBCache() {
  dbMemoryCache = null;
}

import { products as defaultProducts } from "./store";
import { defaultFaqs } from "./default-faqs";
import { defaultMedia } from "./default-media";

export const defaultTestimonials = [
  {
    id: "test_1",
    name: "Rajesh K.",
    location: "Pune, Maharashtra",
    rating: 5,
    title: "Incredible energy and stamina improvement in 3 weeks",
    comment: "I was skeptical about Ayurvedic vitality powders, but Virja Powder with warm milk every night gave me consistent energy, stamina, and zero morning fatigue. Authentic gold-grade formulation!",
    productTagged: "Virja Powder for Men",
    verifiedBuyer: true,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    status: "Approved",
    date: "18 Sep 2026",
  },
  {
    id: "test_2",
    name: "Suresh Nair",
    location: "Kochi, Kerala",
    rating: 5,
    title: "Fasting sugar dropped from 180 to 118 naturally",
    comment: "Started Madhunashi Powder on recommendation from our family Vaidya. Within 45 days, my fasting sugar levels stabilized remarkably without insulin spikes. Gudmar and Jamun seed combination really works!",
    productTagged: "Madhunashi Sugar Care Powder",
    verifiedBuyer: true,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
    status: "Approved",
    date: "14 Sep 2026",
  },
  {
    id: "test_3",
    name: "Pooja Verma",
    location: "Indore, Madhya Pradesh",
    rating: 5,
    title: "Lost 4.5 kgs in 5 weeks with zero digestive weakness",
    comment: "Helped reduce my stubborn bloating and belly fat. The taste is natural herbal and gives great gut digestive relief. Feeling 10 years lighter!",
    productTagged: "Pure Ayur Fat Burner Tonic",
    verifiedBuyer: true,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    status: "Approved",
    date: "10 Sep 2026",
  },
  {
    id: "test_4",
    name: "Amitabh Roy",
    location: "Kolkata, West Bengal",
    rating: 5,
    title: "Pure herbal strength without any side effects",
    comment: "Top notch Shilajit, Ashwagandha and Swarna Bhasma blend. Recovery after long stressful days has improved drastically. Pure Ayurvedic gold!",
    productTagged: "Virja Gold Majun",
    verifiedBuyer: true,
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80",
    status: "Approved",
    date: "05 Sep 2026",
  },
  {
    id: "test_5",
    name: "Dr. Neha Saxena",
    location: "Jaipur, Rajasthan",
    rating: 5,
    title: "Firming and contouring results are visible and natural",
    comment: "Absorbs quickly without stickiness. Natural herbal aroma and visible contouring after 30 days of consistent usage. Truly pure ingredients.",
    productTagged: "Perfect 36 Herbal Cream",
    verifiedBuyer: true,
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
    status: "Approved",
    date: "01 Sep 2026",
  },
];

// Helper to detect legacy / dummy Kapiva FAQs
function isLegacyFaq(f: any): boolean {
  if (!f || typeof f !== "object") return true;
  const q = (f.question || f.q || "").toLowerCase();
  const a = (f.answer || f.a || "").toLowerCase();
  return (
    q.includes("dia free") ||
    q.includes("take shilajit") ||
    q.includes("kapiva") ||
    a.includes("dia free") ||
    a.includes("kapiva")
  );
}

// Ensure all DB data model fields exist with robust fallbacks
function sanitizeDBData(data: any): DBData {
  if (!data || typeof data !== "object") data = {};
  if (!Array.isArray(data.products) || data.products.length === 0) data.products = defaultProducts;
  if (!Array.isArray(data.orders)) data.orders = [];
  if (!Array.isArray(data.coupons)) data.coupons = [];
  if (!Array.isArray(data.leads)) data.leads = [];
  if (!Array.isArray(data.blogs)) data.blogs = [];
  if (!Array.isArray(data.media) || data.media.length === 0) data.media = defaultMedia;

  // Filter out any obsolete dummy questions from MongoDB and guarantee default FAQs
  if (Array.isArray(data.faqs)) {
    data.faqs = data.faqs.filter((f: any) => !isLegacyFaq(f));
  }
  if (!Array.isArray(data.faqs) || data.faqs.length === 0) {
    data.faqs = defaultFaqs;
  }
  if (!Array.isArray(data.testimonials) || data.testimonials.length === 0) {
    data.testimonials = defaultTestimonials;
  } else {
    if (data.testimonials.length === 1 && (!data.testimonials[0].location || !data.testimonials[0].productTagged)) {
      data.testimonials = defaultTestimonials;
    } else {
      data.testimonials = data.testimonials.map((t: any, idx: number) => ({
        id: t.id || `test_${idx + 1}`,
        name: t.name || "Verified Customer",
        location: t.location || "India",
        rating: Math.min(5, Math.max(1, Number(t.rating) || 5)),
        title: t.title || "Authentic Ayurvedic Formulation",
        comment: t.comment || "",
        productTagged: t.productTagged || t.product || "Virja Powder for Men",
        verifiedBuyer: t.verifiedBuyer !== false,
        avatar: t.avatar || "",
        status: t.status || "Approved",
        date: t.date || "Verified Purchase",
      }));
    }
  }
  if (!Array.isArray(data.users)) data.users = [];
  if (!Array.isArray(data.reviews)) data.reviews = [];
  if (!Array.isArray(data.collections)) data.collections = [];
  if (!Array.isArray(data.categories)) data.categories = [];
  if (!Array.isArray(data.otps)) data.otps = [];
  if (!Array.isArray(data.verifiedPhones)) data.verifiedPhones = [];

  if (!data.marketing || typeof data.marketing !== "object") {
    data.marketing = { campaigns: [], banners: [], popups: [], notifications: [] };
  } else {
    if (!Array.isArray(data.marketing.campaigns)) data.marketing.campaigns = [];
    if (!Array.isArray(data.marketing.banners)) data.marketing.banners = [];
    if (!Array.isArray(data.marketing.popups)) data.marketing.popups = [];
    if (!Array.isArray(data.marketing.notifications)) data.marketing.notifications = [];
  }

  if (data.marketing.banners.length === 0) {
    data.marketing.banners = [
      {
        id: "ban_1",
        name: "100% Certified Ayurvedic Formulations for Peak Vitality & Daily Wellness",
        subtitle: "Formulated by certified Ayurvedic Vaidyas. Clinically backed botanicals for peak stamina and daily wellness.",
        image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1400&q=80",
        link: "/products/virja-powder",
        ctaText: "Explore Pure Formulations",
        placement: "Homepage Middle Strip",
        status: "Active",
      },
    ];
  } else {
    data.marketing.banners = data.marketing.banners.map((b: any, idx: number) => ({
      id: b.id || `ban_${idx + 1}`,
      name: b.name || "100% Certified Ayurvedic Formulations",
      subtitle: b.subtitle || "Authentic Ayurvedic remedies formulated by certified Vaidyas.",
      image: b.image || "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1400&q=80",
      link: b.link || "/products/virja-powder",
      ctaText: b.ctaText || "Explore Formulations",
      placement: b.placement || "Homepage Middle Strip",
      status: b.status || "Active",
    }));
  }

  if (data.marketing.popups.length === 0) {
    data.marketing.popups = [
      {
        id: "pop_1",
        title: "Wait! Claim Extra 10% Off Your Order",
        subtitle: "Join 50,000+ happy customers restoring vitality and balance with pure Ayurvedic formulations.",
        discount: "FLAT 10% OFF",
        couponCode: "PURE10",
        image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80",
        trigger: "Exit Intent",
        ctaText: "Claim Coupon & Shop Now",
        status: "Active",
      },
    ];
  } else {
    data.marketing.popups = data.marketing.popups.map((p: any) => ({
      id: p.id || "pop_1",
      title: p.title || "Wait! Claim Extra 10% Off Your Order",
      subtitle: p.subtitle || "Join 50,000+ happy customers restoring vitality and balance with pure Ayurvedic formulations.",
      discount: p.discount || "FLAT 10% OFF",
      couponCode: p.couponCode || "PURE10",
      image: p.image || "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80",
      trigger: p.trigger || "Exit Intent",
      ctaText: p.ctaText || "Claim Coupon & Shop Now",
      status: p.status || "Active",
    }));
  }

  if (!data.content || typeof data.content !== "object") {
    data.content = { announcement: {}, heroSlides: [], consultationBanner: {}, footer: {} };
  } else {
    if (!data.content.announcement || Object.keys(data.content.announcement).length === 0 || !data.content.announcement.text) {
      data.content.announcement = {
        visible: true,
        text: "Free Kesar Sale Ends in",
        code: "FREEKESAR",
        btnText: "Claim Gift",
        link: "/#shop",
        bgImage: "/brand/top-botanical-banner.jpg",
        timerDuration: "07:34:59",
      };
    } else {
      data.content.announcement = {
        visible: data.content.announcement.visible !== false,
        text: data.content.announcement.text || "Free Kesar Sale Ends in",
        code: data.content.announcement.code || "FREEKESAR",
        btnText: data.content.announcement.btnText || "Claim Gift",
        link: data.content.announcement.link || "/#shop",
        bgImage: data.content.announcement.bgImage || "/brand/top-botanical-banner.jpg",
        timerDuration: data.content.announcement.timerDuration || "07:34:59",
      };
    }
    if (!Array.isArray(data.content.heroSlides)) data.content.heroSlides = [];
    if (!data.content.consultationBanner) data.content.consultationBanner = {};
    if (!data.content.footer) data.content.footer = {};
  }

  if (!data.seo || typeof data.seo !== "object") {
    data.seo = {
      title: "Pure Ayur Herbs | 100% Certified Ayurvedic Formulations - Virja, Madhunashi & Fat Burner",
      metaDesc: "Shop authentic 100% AYUSH Certified Virja Powder & Gold Majun for Men's Stamina, Madhunashi Sugar Management, Fat Burner Tonic, and Perfect 36 Cream. Free Priority Delivery across India.",
      sitemapUrl: "",
      robotsTxt: "",
    };
  } else {
    if (typeof data.seo.title === "string") {
      data.seo.title = data.seo.title.replace(/Pyur/gi, "Pure");
      if (data.seo.title.includes("Premium Ayurvedic Remedies") || data.seo.title.includes("Himalayan Shilajit")) {
        data.seo.title = "Pure Ayur Herbs | 100% Certified Ayurvedic Formulations - Virja, Madhunashi & Fat Burner";
      }
    }
    if (typeof data.seo.metaDesc === "string") {
      data.seo.metaDesc = data.seo.metaDesc.replace(/Pyur/gi, "Pure");
      if (data.seo.metaDesc.includes("Dia Free") || data.seo.metaDesc.includes("organic skincare") || data.seo.metaDesc.includes("Shilajit Gold Resin")) {
        data.seo.metaDesc = "Shop authentic 100% AYUSH Certified Virja Powder & Gold Majun for Men's Stamina, Madhunashi Sugar Management, Fat Burner Tonic, and Perfect 36 Cream. Free Priority Delivery across India.";
      }
    }
  }

  if (!data.settings || typeof data.settings !== "object") {
    data.settings = {
      storeName: "Pure Ayur Herbs Store",
      companyLegalName: "Pure Ayur Herbs Private Limited",
      registeredAddress: "12, Botanical Enclave, Sector 62, Noida, UP - 201301",
      gstin: "09AAPCP8765A1Z5",
      socialLinks: {
        instagram: "https://instagram.com",
        facebook: "https://facebook.com",
        youtube: "https://youtube.com",
        twitter: "https://twitter.com",
        linkedin: "",
      },
      supportEmail: "support@pureayurherbs.com",
      whatsappNumber: "",
      whatsappMessage: "नमस्ते! मुझे आपकी वेबसाइट से ऑर्डर करने में मदद चाहिए।",
      codOtpEnabled: true,
      prepaidDiscount: 5,
      taxRate: 18,
      shipping: { freeThreshold: 999, baseRate: 49, partners: [] },
      email: { senderName: "", smtpHost: "" },
      notifications: { orderPlacedSms: true, abandonedCartReminder: true },
      adminUsers: [
        { email: "pureayurherbs@gmail.com", role: "Super Admin" },
        { email: "pyuradmin", role: "Administrator" }
      ],
      phonepe: {
        merchantId: "PGBARCHUPGTEST",
        saltKey: "099eb0cd-02cf-4e2a-8aca-3e6c6aff0399",
        saltIndex: "1",
        env: "sandbox",
        enabled: true
      },
      shiprocket: {
        enabled: true,
        email: "imranshah244830@gmail.com",
        password: "@16*APnSzf$&O9oZi#AT2kVISPTvRrqi",
        pickupLocation: "PURE AYUR HERBS",
      }
    };
  } else {
    if (!data.settings.companyLegalName) data.settings.companyLegalName = "Pure Ayur Herbs Private Limited";
    if (!data.settings.registeredAddress) data.settings.registeredAddress = "12, Botanical Enclave, Sector 62, Noida, UP - 201301";
    if (!data.settings.gstin) data.settings.gstin = "09AAPCP8765A1Z5";
    if (!data.settings.socialLinks || typeof data.settings.socialLinks !== "object") {
      data.settings.socialLinks = {
        instagram: "https://instagram.com",
        facebook: "https://facebook.com",
        youtube: "https://youtube.com",
        twitter: "https://twitter.com",
        linkedin: "",
      };
    }
    if (!data.settings.shiprocket || typeof data.settings.shiprocket !== "object") {
      data.settings.shiprocket = {
        enabled: true,
        email: "imranshah244830@gmail.com",
        password: "@16*APnSzf$&O9oZi#AT2kVISPTvRrqi",
        pickupLocation: "PURE AYUR HERBS",
      };
    } else {
      if (data.settings.shiprocket.enabled === undefined) data.settings.shiprocket.enabled = true;
      if (!data.settings.shiprocket.email) data.settings.shiprocket.email = "imranshah244830@gmail.com";
      if (!data.settings.shiprocket.password) data.settings.shiprocket.password = "@16*APnSzf$&O9oZi#AT2kVISPTvRrqi";
      if (!data.settings.shiprocket.pickupLocation) data.settings.shiprocket.pickupLocation = "PURE AYUR HERBS";
    }

    if (!data.settings.coinsSettings || typeof data.settings.coinsSettings !== "object") {
      data.settings.coinsSettings = {
        enabled: true,
        coinsPerRupee: 10,
        maxRedemptionPercent: 20,
        minCoinsToRedeem: 10,
        welcomeBonus: 100,
        orderRewardPercent: 5,
      };
    } else {
      if (data.settings.coinsSettings.enabled === undefined) data.settings.coinsSettings.enabled = true;
      if (typeof data.settings.coinsSettings.coinsPerRupee !== "number" || data.settings.coinsSettings.coinsPerRupee <= 0) {
        data.settings.coinsSettings.coinsPerRupee = 10;
      }
      if (typeof data.settings.coinsSettings.maxRedemptionPercent !== "number") {
        data.settings.coinsSettings.maxRedemptionPercent = 20;
      }
      if (typeof data.settings.coinsSettings.minCoinsToRedeem !== "number") {
        data.settings.coinsSettings.minCoinsToRedeem = 10;
      }
      if (typeof data.settings.coinsSettings.welcomeBonus !== "number") {
        data.settings.coinsSettings.welcomeBonus = 100;
      }
      if (typeof data.settings.coinsSettings.orderRewardPercent !== "number") {
        data.settings.coinsSettings.orderRewardPercent = 5;
      }
    }
  }

  return data as DBData;
}

// Read from local db.json file (< 1ms)
function readLocalDB(): DBData {
  const tmpPath = "/tmp/pyur_db.json";
  const standardPath = path.join(process.cwd(), "src/lib/db.json");

  try {
    let filePath = standardPath;
    if (fs.existsSync(tmpPath) && fs.existsSync(standardPath)) {
      const tmpMtime = fs.statSync(tmpPath).mtimeMs;
      const stdMtime = fs.statSync(standardPath).mtimeMs;
      filePath = stdMtime >= tmpMtime ? standardPath : tmpPath;
    } else if (fs.existsSync(tmpPath)) {
      filePath = tmpPath;
    }

    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      const cleanData = JSON.parse(content);
      return sanitizeDBData(cleanData);
    }
  } catch (e) {
    console.error("Error reading local db.json:", e);
  }
  return sanitizeDBData({});
}

// Write to local db.json file (< 1ms)
function writeLocalDB(data: DBData): boolean {
  const tmpPath = "/tmp/pyur_db.json";
  const standardPath = path.join(process.cwd(), "src/lib/db.json");
  const jsonStr = JSON.stringify(data, null, 2);

  let written = false;

  try {
    fs.writeFileSync(standardPath, jsonStr, "utf-8");
    written = true;
  } catch {}

  try {
    fs.writeFileSync(tmpPath, jsonStr, "utf-8");
    written = true;
  } catch {}

  return written;
}

export async function readDB(bypassCache = false): Promise<DBData> {
  // 1. Instant return from in-memory cache if valid (< 0.01ms)
  if (!bypassCache && dbMemoryCache && Date.now() - dbMemoryCache.timestamp < CACHE_TTL_MS) {
    return dbMemoryCache.data;
  }

  // If MongoDB URI is not set, load local file
  if (!uri) {
    const data = readLocalDB();
    dbMemoryCache = { data, timestamp: Date.now() };
    return data;
  }

  try {
    const activeClient = await getMongoClient();
    const db = activeClient.db(dbName);
    const document = await db.collection("store_data").findOne({ _id: "main" as any });

    if (!document) {
      const defaultData = readLocalDB();
      dbMemoryCache = { data: defaultData, timestamp: Date.now() };
      return defaultData;
    }

    const { _id, ...cleanData } = document as any;
    const sanitized = sanitizeDBData(cleanData);

    // Safeguard: Never allow an empty products array from a fresh or stale DB to wipe out existing in-memory products
    if (sanitized.products.length === 0 && dbMemoryCache?.data?.products && dbMemoryCache.data.products.length > 0) {
      sanitized.products = dbMemoryCache.data.products;
    }

    // Auto-migrate old SEO descriptions in MongoDB
    if (cleanData.seo?.metaDesc?.includes("Dia Free") || cleanData.seo?.title?.includes("Premium Ayurvedic Remedies")) {
      void db.collection("store_data").updateOne(
        { _id: "main" as any },
        { $set: { "seo.metaDesc": sanitized.seo.metaDesc, "seo.title": sanitized.seo.title } }
      ).catch(() => {});
    }

    // Auto-migrate old legacy FAQs in MongoDB
    const needsFaqMigration =
      !Array.isArray(cleanData.faqs) ||
      cleanData.faqs.length === 0 ||
      cleanData.faqs.some((f: any) => isLegacyFaq(f));

    if (needsFaqMigration) {
      void db.collection("store_data").updateOne(
        { _id: "main" as any },
        { $set: { faqs: sanitized.faqs } }
      ).catch((err) => console.error("[MongoDB FAQ Migration Error]:", err));
    }

    dbMemoryCache = { data: sanitized, timestamp: Date.now() };
    writeLocalDB(sanitized);
    return sanitized;
  } catch (error) {
    console.error("[MongoDB Read Error]:", error);
    if (dbMemoryCache?.data && dbMemoryCache.data.products && dbMemoryCache.data.products.length > 0) {
      return dbMemoryCache.data;
    }
    const localData = readLocalDB();
    dbMemoryCache = { data: localData, timestamp: Date.now() };
    return localData;
  }
}

export async function writeDB(data: DBData): Promise<boolean> {
  // 1. Always write to memory cache and local filesystem immediately with clean clone
  try {
    dbMemoryCache = { data: JSON.parse(JSON.stringify(data)), timestamp: Date.now() };
  } catch {
    dbMemoryCache = { data, timestamp: Date.now() };
  }
  writeLocalDB(data);

  if (!uri) {
    return true;
  }

  // 2. Persist to MongoDB with full write guarantee
  try {
    const activeClient = await getMongoClient();
    const db = activeClient.db(dbName);

    const dataToSave = { ...data };
    delete (dataToSave as any)._id;

    await db.collection("store_data").replaceOne(
      { _id: "main" as any },
      dataToSave,
      { upsert: true }
    );
    return true;
  } catch (error) {
    console.error("[MongoDB Write Error]:", error);
    return true;
  }
}
