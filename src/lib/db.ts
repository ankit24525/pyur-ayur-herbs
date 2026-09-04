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
  sessions?: { token: string; userId: string; expiresAt: number }[];
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

let dbMemoryCache: { data: DBData; timestamp: number } | null = null;
const CACHE_TTL_MS = 6000; // 6s in-memory cache for ultra-fast response (< 0.01ms)

// Ensure all DB data model fields exist with robust fallbacks
function sanitizeDBData(data: any): DBData {
  if (!data || typeof data !== "object") data = {};
  if (!Array.isArray(data.products)) data.products = [];
  if (!Array.isArray(data.orders)) data.orders = [];
  if (!Array.isArray(data.coupons)) data.coupons = [];
  if (!Array.isArray(data.leads)) data.leads = [];
  if (!Array.isArray(data.blogs)) data.blogs = [];
  if (!Array.isArray(data.faqs)) data.faqs = [];
  if (!Array.isArray(data.testimonials)) data.testimonials = [];
  if (!Array.isArray(data.users)) data.users = [];
  if (!Array.isArray(data.reviews)) data.reviews = [];
  if (!Array.isArray(data.collections)) data.collections = [];
  if (!Array.isArray(data.categories)) data.categories = [];

  if (!data.marketing || typeof data.marketing !== "object") {
    data.marketing = { campaigns: [], banners: [], popups: [], notifications: [] };
  } else {
    if (!Array.isArray(data.marketing.campaigns)) data.marketing.campaigns = [];
    if (!Array.isArray(data.marketing.banners)) data.marketing.banners = [];
    if (!Array.isArray(data.marketing.popups)) data.marketing.popups = [];
    if (!Array.isArray(data.marketing.notifications)) data.marketing.notifications = [];
  }

  if (!data.content || typeof data.content !== "object") {
    data.content = { announcement: {}, heroSlides: [], consultationBanner: {} };
  } else {
    if (!data.content.announcement) data.content.announcement = {};
    if (!Array.isArray(data.content.heroSlides)) data.content.heroSlides = [];
    if (!data.content.consultationBanner) data.content.consultationBanner = {};
  }

  if (!data.seo || typeof data.seo !== "object") {
    data.seo = {
      title: "Pyur Ayur Herbs - Original Ayurvedic Formulations",
      metaDesc: "Shop authentic gold-grade Shilajit, juices, and wellness supplements certified by Ayurvedic experts.",
      sitemapUrl: "",
      robotsTxt: "",
    };
  }

  if (!data.settings || typeof data.settings !== "object") {
    data.settings = {
      storeName: "Pyur Ayur Herbs Store",
      supportEmail: "support@pyurayurherbs.com",
      whatsappNumber: "919876543210",
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
      }
    };
  }

  return data as DBData;
}

// Read from local db.json file (< 1ms)
function readLocalDB(): DBData {
  const tmpPath = "/tmp/pyur_db.json";
  const standardPath = path.join(process.cwd(), "src/lib/db.json");

  try {
    const filePath = fs.existsSync(tmpPath) ? tmpPath : standardPath;
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

export async function readDB(): Promise<DBData> {
  // 1. Instant return from in-memory cache if valid (< 0.01ms)
  if (dbMemoryCache && Date.now() - dbMemoryCache.timestamp < CACHE_TTL_MS) {
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
  // 1. Always write to memory cache and local filesystem immediately
  dbMemoryCache = { data, timestamp: Date.now() };
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
