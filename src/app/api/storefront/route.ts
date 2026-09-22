import { NextResponse } from "next/server";
import { readDB } from "@/lib/db";
import { products, concerns } from "@/lib/store";
import { defaultFaqs } from "@/lib/default-faqs";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const forceFresh = searchParams.get("fresh") === "1";

    const db = await readDB(forceFresh);

    const cleanFaqs = Array.isArray(db.faqs)
      ? db.faqs.filter((f: any) => {
          const q = (f?.question || f?.q || "").toLowerCase();
          const a = (f?.answer || f?.a || "").toLowerCase();
          return !q.includes("dia free") && !q.includes("take shilajit") && !q.includes("kapiva") && !a.includes("dia free") && !a.includes("kapiva");
        })
      : [];

    const responseData = {
      products: Array.isArray(db.products) && db.products.length > 0 ? db.products : products,
      categories: Array.isArray(db.categories) && db.categories.length > 0 ? db.categories : concerns,
      content: db.content || { announcement: {}, heroSlides: [], consultationBanner: {} },
      reviews: db.reviews || [],
      testimonials: db.testimonials || [],
      faqs: cleanFaqs.length > 0 ? cleanFaqs : defaultFaqs,
      blogs: Array.isArray(db.blogs)
        ? db.blogs
            .filter((b: any) => b.status === "Published")
            .map((b: any) => ({
              id: b.id || b.title?.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-"),
              title: b.title,
              author: b.author,
              date: b.date,
              status: b.status,
              image:
                b.image && typeof b.image === "string" && b.image.trim().length > 0
                  ? b.image
                  : "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80",
              readTime: b.readTime || "4 min",
              excerpt: b.excerpt || (typeof b.content === "string" ? b.content.slice(0, 150) : ""),
            }))
        : [],
      media: Array.isArray(db.media)
        ? db.media.filter((m: any) => m.status === "Published")
        : [],
      marketing: {
        banners: Array.isArray(db.marketing?.banners)
          ? db.marketing.banners
              .filter((b: any) => b.status === "Active")
              .map((b: any) => {
                const bannerTitle = (b.title || b.name || "").trim();
                return {
                  ...b,
                  name: bannerTitle,
                  title: bannerTitle,
                };
              })
          : [],
        popups: Array.isArray(db.marketing?.popups)
          ? db.marketing.popups.filter((p: any) => p.status === "Active")
          : [],
        notifications: Array.isArray(db.marketing?.notifications)
          ? db.marketing.notifications.filter((n: any) => n.status === "Active")
          : [],
      },
      settings: {
        storeName: db.settings?.storeName || "Pure Ayur Herbs Store",
        companyLegalName: db.settings?.companyLegalName || "Pure Ayur Herbs Private Limited",
        registeredAddress: db.settings?.registeredAddress || "12, Botanical Enclave, Sector 62, Noida, UP - 201301",
        gstin: db.settings?.gstin || "09AAPCP8765A1Z5",
        socialLinks: db.settings?.socialLinks || {
          instagram: "https://instagram.com",
          facebook: "https://facebook.com",
          youtube: "https://youtube.com",
          twitter: "https://twitter.com",
          linkedin: ""
        },
        supportEmail: db.settings?.supportEmail || "support@pureayurherbs.com",
        whatsappNumber: db.settings?.whatsappNumber || "917247824101",
        whatsappMessage: db.settings?.whatsappMessage || "Namaste!",
        freeThreshold: db.settings?.shipping?.freeThreshold || 999,
        prepaidDiscount: db.settings?.prepaidDiscount ?? 5,
        flashSaleTimer: db.settings?.flashSaleTimer,
        coinsSettings: {
          enabled: db.settings?.coinsSettings?.enabled !== false,
          coinsPerRupee: Number(db.settings?.coinsSettings?.coinsPerRupee) || 10,
          maxRedemptionPercent: Number(db.settings?.coinsSettings?.maxRedemptionPercent) || 20,
          minCoinsToRedeem: Number(db.settings?.coinsSettings?.minCoinsToRedeem) || 10,
          welcomeBonus: Number(db.settings?.coinsSettings?.welcomeBonus) || 100,
          orderRewardPercent: Number(db.settings?.coinsSettings?.orderRewardPercent) || 5,
        },
      },
    };

    // Always return fully fresh data - never allow CDN to cache API responses
    // since storefront-client.ts already adds ?fresh=1&_t=timestamp to bust any possible cache
    const cacheControlHeader = "no-store, no-cache, must-revalidate, max-age=0, s-maxage=0";

    return NextResponse.json(responseData, {
      status: 200,
      headers: {
        "Cache-Control": cacheControlHeader,
        "Pragma": "no-cache",
        "Surrogate-Control": "no-store",
        "CDN-Cache-Control": "no-store",
        "Vercel-CDN-Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Storefront API Error:", error);
    return NextResponse.json(
      {
        products: [],
        categories: concerns,
        content: { announcement: {}, heroSlides: [], consultationBanner: {}, footer: {} },
        reviews: [],
        testimonials: [],
        settings: {
          storeName: "Pure Ayur Herbs Store",
          companyLegalName: "Pure Ayur Herbs Private Limited",
          registeredAddress: "12, Botanical Enclave, Sector 62, Noida, UP - 201301",
          gstin: "09AAPCP8765A1Z5",
          socialLinks: {
            instagram: "https://instagram.com",
            facebook: "https://facebook.com",
            youtube: "https://youtube.com",
            twitter: "https://twitter.com",
            linkedin: ""
          },
          freeThreshold: 999,
          prepaidDiscount: 5,
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  }
}
