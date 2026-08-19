import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || "";
const dbName = process.env.MONGODB_DB || "pure_ayur_herbs";

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
}

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

async function getMongoClient(): Promise<MongoClient> {
  if (client) return client;
  if (clientPromise) return clientPromise;

  if (!uri) {
    throw new Error("MONGODB_URI environment variable is missing from environment/env files.");
  }

  client = new MongoClient(uri);
  clientPromise = client.connect();
  return clientPromise;
}

export async function readDB(): Promise<DBData> {
  try {
    const activeClient = await getMongoClient();
    const db = activeClient.db(dbName);
    const document = await db.collection("store_data").findOne({ _id: "main" as any });
    
    if (!document) {
      return {
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
    }
    
    // Remove MongoDB specific internal fields if they exist
    const { _id, ...cleanData } = document as any;
    return cleanData as DBData;
  } catch (error) {
    console.error("Error reading from MongoDB:", error);
    return {
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
  }
}

export async function writeDB(data: DBData): Promise<boolean> {
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
    return false;
  }
}

