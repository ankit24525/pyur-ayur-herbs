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

    // Safe image sanitizer to guarantee responses never transmit heavy Base64 strings over the public API
    const sanitizeImage = (url: any, fallback: string): string => {
      if (typeof url !== "string" || !url || url.startsWith("data:image/") || url.length > 500) {
        return fallback;
      }
      return url;
    };

    const defaultProductImageMap: Record<string, string> = {
      "virja-powder": "https://res.cloudinary.com/dwadcfj3b/image/upload/v1791381368/pure_ayur_herbs/products/hmlzvpwldh0zgunukmxk.jpg",
      "virja-gold-majun": "https://res.cloudinary.com/dwadcfj3b/image/upload/v1791381369/pure_ayur_herbs/products/x2yhpnwfcsesqdjjmzll.jpg",
      "madhunashi-powder": "https://res.cloudinary.com/dwadcfj3b/image/upload/v1791381364/pure_ayur_herbs/products/kleuwprcuiyj1duvlojh.jpg",
      "madhunashi-syp": "https://res.cloudinary.com/dwadcfj3b/image/upload/v1791381365/pure_ayur_herbs/products/ospkjprkxo1rzsb6ghmy.jpg",
      "fat-burner": "https://res.cloudinary.com/dwadcfj3b/image/upload/v1791381366/pure_ayur_herbs/products/xemjcovn6mbh6edriszp.jpg",
      "perfect-36-cream": "https://res.cloudinary.com/dwadcfj3b/image/upload/v1791381367/pure_ayur_herbs/products/aux22j4iqo4xus6bbja4.jpg",
    };

    const rawProducts = Array.isArray(db.products) && db.products.length > 0 ? db.products : products;
    const sanitizedProducts = rawProducts.map((p: any) => {
      const fallback = defaultProductImageMap[p.slug] || "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=600&q=80";
      const cleanImage = sanitizeImage(p.image, fallback);
      const cleanImages = Array.isArray(p.images)
        ? p.images
            .map((img: any) => sanitizeImage(img, ""))
            .filter((img: string) => img.length > 0)
        : [cleanImage];
      return {
        ...p,
        image: cleanImage,
        images: cleanImages.length > 0 ? cleanImages : [cleanImage],
      };
    });

    const rawContent = db.content || { announcement: {}, heroSlides: [], consultationBanner: {} };
    const sanitizedContent = {
      ...rawContent,
      heroSlides: Array.isArray(rawContent.heroSlides)
        ? rawContent.heroSlides.map((slide: any) => ({
            ...slide,
            image: sanitizeImage(
              slide.image,
              "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=1200&q=80"
            ),
          }))
        : [],
      consultationBanner: {
        ...(rawContent.consultationBanner || {}),
        doctorImage: sanitizeImage(
          rawContent.consultationBanner?.doctorImage,
          "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80"
        ),
      },
    };

    const responseData = {
      products: sanitizedProducts,
      categories: Array.isArray(db.categories) && db.categories.length > 0 ? db.categories : concerns,
      content: sanitizedContent,
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
              image: sanitizeImage(
                b.image,
                "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80"
              ),
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

    // Edge CDN Caching: Allow Vercel Edge CDN to cache responses for 60 seconds (with 300s background revalidation)
    // Only bypass CDN cache when an admin explicitly requests fresh data (?fresh=1)
    const cacheControlHeader = forceFresh
      ? "no-store, no-cache, must-revalidate, max-age=0, s-maxage=0"
      : "public, s-maxage=60, stale-while-revalidate=300";

    const responseHeaders: Record<string, string> = {
      "Cache-Control": cacheControlHeader,
      "CDN-Cache-Control": cacheControlHeader,
      "Vercel-CDN-Cache-Control": cacheControlHeader,
    };

    if (forceFresh) {
      responseHeaders["Pragma"] = "no-cache";
      responseHeaders["Surrogate-Control"] = "no-store";
    }

    return NextResponse.json(responseData, {
      status: 200,
      headers: responseHeaders,
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
