import fs from "fs";
import path from "path";

const dbPath = path.join(process.cwd(), "src/lib/db.json");

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
}

export function readDB(): DBData {
  try {
    if (!fs.existsSync(dbPath)) {
      // Re-create from template if it doesn't exist
      const defaultData = { products: [], orders: [], coupons: [], leads: [], settings: {} };
      fs.writeFileSync(dbPath, JSON.stringify(defaultData, null, 2), "utf8");
      return defaultData as any;
    }
    const content = fs.readFileSync(dbPath, "utf8");
    return JSON.parse(content);
  } catch (error) {
    console.error("Error reading db.json:", error);
    return {
      products: [],
      orders: [],
      coupons: [],
      leads: [],
      settings: {
        storeName: "Pyur Ayur Herbs Store",
        supportEmail: "support@pyurayurherbs.com",
        codOtpEnabled: true,
        prepaidDiscount: 5,
        taxRate: 18,
      },
    };
  }
}

export function writeDB(data: DBData): boolean {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), "utf8");
    return true;
  } catch (error) {
    console.error("Error writing to db.json:", error);
    return false;
  }
}
