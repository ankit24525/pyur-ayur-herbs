import { NextResponse } from "next/server";
import { readDB } from "@/lib/db";
import { products, concerns } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = await readDB();

    const responseData = {
      products: db.products && db.products.length > 0 ? db.products : products,
      categories: db.categories && db.categories.length > 0 ? db.categories : concerns,
      content: db.content || { announcement: {}, heroSlides: [], consultationBanner: {} },
      reviews: db.reviews || [],
      testimonials: db.testimonials || [],
      settings: {
        storeName: db.settings?.storeName || "Pyur Ayur Herbs Store",
        supportEmail: db.settings?.supportEmail || "support@pyurayurherbs.com",
        whatsappNumber: db.settings?.whatsappNumber || "919876543210",
        whatsappMessage: db.settings?.whatsappMessage || "Namaste!",
        freeThreshold: db.settings?.shipping?.freeThreshold || 999,
        prepaidDiscount: db.settings?.prepaidDiscount ?? 5,
        flashSaleTimer: db.settings?.flashSaleTimer,
      },
    };

    return NextResponse.json(responseData, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("Storefront API Error:", error);
    return NextResponse.json(
      {
        products,
        categories: concerns,
        content: { announcement: {}, heroSlides: [], consultationBanner: {} },
        reviews: [],
        testimonials: [],
        settings: {
          storeName: "Pyur Ayur Herbs Store",
          freeThreshold: 999,
          prepaidDiscount: 5,
        },
      },
      { status: 200 }
    );
  }
}
