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
  seo?: any;
  users?: any[];
  categories?: any[];
  collections?: any[];
  orderOtps?: any[];
  sessions?: { token: string; userId: string; expiresAt: number }[];
}

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

async function getMongoClient(): Promise<MongoClient> {
  if (client) return client;
  if (clientPromise) return clientPromise;

  if (!uri) {
    throw new Error("MONGODB_URI environment variable is missing from environment/env files.");
  }

  client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 1500,
    connectTimeoutMS: 1500,
  });
  clientPromise = client.connect();
  return clientPromise;
}

let dbMemoryCache: { data: DBData; timestamp: number } | null = null;
const CACHE_TTL_MS = 5000; // 5s in-memory cache for ultra-fast response

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

// Read from local db.json file
function readLocalDB(): DBData {
  try {
    if (fs.existsSync(localDbPath)) {
      const content = fs.readFileSync(localDbPath, "utf-8");
      const cleanData = JSON.parse(content);
      return sanitizeDBData(cleanData);
    }
  } catch (e) {
    console.error("Error reading local db.json:", e);
  }
  return sanitizeDBData({});
}

// Write to local db.json file
function writeLocalDB(data: DBData): boolean {
  try {
    fs.writeFileSync(localDbPath, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (e) {
    console.error("Error writing local db.json:", e);
    return false;
  }
}

export async function readDB(): Promise<DBData> {
  // Use in-memory cache if valid (< 5 seconds old)
  if (dbMemoryCache && Date.now() - dbMemoryCache.timestamp < CACHE_TTL_MS) {
    return dbMemoryCache.data;
  }

  // If MongoDB is not configured, fall back to local db.json file automatically!
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
      const defaultData = sanitizeDBData({});
      dbMemoryCache = { data: defaultData, timestamp: Date.now() };
      return defaultData;
    }
    
    // Remove MongoDB specific internal fields if they exist
    const { _id, ...cleanData } = document as any;
    const sanitized = sanitizeDBData(cleanData);

    dbMemoryCache = { data: sanitized, timestamp: Date.now() };
    return sanitized;
  } catch (error) {
    console.error("Error reading from MongoDB:", error);
    // Fall back to local db.json if reading from MongoDB fails
    const localData = readLocalDB();
    dbMemoryCache = { data: localData, timestamp: Date.now() };
    return localData;
  }
}

export async function writeDB(data: DBData): Promise<boolean> {
  // Update in-memory cache immediately
  dbMemoryCache = { data, timestamp: Date.now() };

  // If MongoDB is not configured, fall back to local db.json file automatically!
  if (!uri) {
    return writeLocalDB(data);
  }

  try {
    const activeClient = await getMongoClient();
    const db = activeClient.db(dbName);
    
    const dataToSave = { ...data };
    delete (dataToSave as any)._id; // prevent _id modification issues

    await db.collection("store_data").replaceOne(
      { _id: "main" as any },
      dataToSave,
      { upsert: true }
    );
    return true;
  } catch (error) {
    console.error("Error writing to MongoDB:", error);
    // Fall back to local db.json if writing to MongoDB fails
    return writeLocalDB(data);
  }
}
