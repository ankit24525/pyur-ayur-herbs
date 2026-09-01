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
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
  });
  clientPromise = client.connect();
  return clientPromise;
}

let dbMemoryCache: { data: DBData; timestamp: number } | null = null;
const CACHE_TTL_MS = 2500; // 2.5s in-memory cache for ultra-fast response

// Read from local db.json file
function readLocalDB(): DBData {
  try {
    if (fs.existsSync(localDbPath)) {
      const content = fs.readFileSync(localDbPath, "utf-8");
      const cleanData = JSON.parse(content);
      
      // Ensure all arrays exist
      if (!cleanData.products) cleanData.products = [];
      if (!cleanData.orders) cleanData.orders = [];
      if (!cleanData.coupons) cleanData.coupons = [];
      if (!cleanData.leads) cleanData.leads = [];
      if (!cleanData.blogs) cleanData.blogs = [];
      if (!cleanData.faqs) cleanData.faqs = [];
      if (!cleanData.testimonials) cleanData.testimonials = [];
      if (!cleanData.users) cleanData.users = [];
      if (!cleanData.settings) {
        cleanData.settings = {
          storeName: "Pyur Ayur Herbs Store",
          supportEmail: "support@pyurayurherbs.com",
          whatsappNumber: "919876543210",
          whatsappMessage: "नमस्ते! मुझे आपकी वेबसाइट से ऑर्डर करने में मदद चाहिए।",
          codOtpEnabled: true,
          prepaidDiscount: 5,
          taxRate: 18,
          phonepe: {
            merchantId: "PGBARCHUPGTEST",
            saltKey: "099eb0cd-02cf-4e2a-8aca-3e6c6aff0399",
            saltIndex: "1",
            env: "sandbox",
            enabled: true
          }
        };
      }
      return cleanData;
    }
  } catch (e) {
    console.error("Error reading local db.json:", e);
  }
  return {
    products: [],
    orders: [],
    coupons: [],
    leads: [],
    blogs: [],
    faqs: [],
    testimonials: [],
    users: [],
    settings: {
      storeName: "Pyur Ayur Herbs Store",
      supportEmail: "support@pyurayurherbs.com",
      whatsappNumber: "919876543210",
      whatsappMessage: "नमस्ते! मुझे आपकी वेबसाइट से ऑर्डर करने में मदद चाहिए।",
      codOtpEnabled: true,
      prepaidDiscount: 5,
      taxRate: 18,
      phonepe: {
        merchantId: "PGBARCHUPGTEST",
        saltKey: "099eb0cd-02cf-4e2a-8aca-3e6c6aff0399",
        saltIndex: "1",
        env: "sandbox",
        enabled: true
      }
    }
  };
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
  // Use in-memory cache if valid (< 2.5 seconds old)
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
      const defaultData: DBData = {
        products: [],
        orders: [],
        coupons: [],
        leads: [],
        settings: {
          storeName: "Pyur Ayur Herbs Store",
          supportEmail: "support@pyurayurherbs.com",
          whatsappNumber: "919876543210",
          whatsappMessage: "नमस्ते! मुझे आपकी वेबसाइट से ऑर्डर करने में मदद चाहिए।",
          codOtpEnabled: true,
          prepaidDiscount: 5,
          taxRate: 18,
        },
      };
      dbMemoryCache = { data: defaultData, timestamp: Date.now() };
      return defaultData;
    }
    
    // Remove MongoDB specific internal fields if they exist
    const { _id, ...cleanData } = document as any;

    // Ensure all model fields are initialized to prevent undefined state bugs
    if (!cleanData.products) cleanData.products = [];
    if (!cleanData.orders) cleanData.orders = [];
    if (!cleanData.coupons) cleanData.coupons = [];
    if (!cleanData.leads) cleanData.leads = [];
    if (!cleanData.blogs) cleanData.blogs = [];
    if (!cleanData.faqs) cleanData.faqs = [];
    if (!cleanData.testimonials) cleanData.testimonials = [];
    if (!cleanData.users) cleanData.users = [];
    if (!cleanData.settings) {
      cleanData.settings = {
        storeName: "Pyur Ayur Herbs Store",
        supportEmail: "support@pyurayurherbs.com",
        whatsappNumber: "919876543210",
        whatsappMessage: "नमस्ते! मुझे आपकी वेबसाइट से ऑर्डर करने में मदद चाहिए।",
        codOtpEnabled: true,
        prepaidDiscount: 5,
        taxRate: 18,
      };
    }

    dbMemoryCache = { data: cleanData as DBData, timestamp: Date.now() };
    return cleanData as DBData;
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
