import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const paramProductId = (searchParams.get("productId") || "").trim().toLowerCase();
    const paramSlug = (searchParams.get("slug") || "").trim().toLowerCase();

    const db = await readDB();
    const allReviews = Array.isArray(db.reviews) ? db.reviews : [];
    const allTestimonials = Array.isArray(db.testimonials) ? db.testimonials : [];
    const allProducts = Array.isArray(db.products) ? db.products : [];

    const matchedProduct = allProducts.find(
      (p: any) =>
        (paramProductId && String(p.id).toLowerCase() === paramProductId) ||
        (paramSlug && String(p.slug).toLowerCase() === paramSlug)
    );

    const targetSlug = paramSlug || (matchedProduct?.slug || "").toLowerCase();
    const targetId = paramProductId || (matchedProduct?.id || "").toLowerCase();
    const targetName = (matchedProduct?.name || "").toLowerCase();

    // Transform approved testimonials into review records
    const mappedTestimonials = allTestimonials
      .filter((t: any) => (t.status || "Approved") === "Approved")
      .map((t: any) => ({
        id: t.id,
        productId: t.productTagged || t.product || "",
        product: t.productTagged || t.product || "Ayurvedic Formulation",
        productName: t.productTagged || t.product || "Ayurvedic Formulation",
        customer: t.name,
        name: t.name,
        rating: Number(t.rating) || 5,
        title: t.title || "Authentic Ayurvedic Formulation",
        comment: t.comment || "",
        location: t.location || "India",
        verifiedBuyer: t.verifiedBuyer !== false,
        image: t.photo || t.avatar || null,
        photo: t.photo || t.avatar || null,
        images: [t.photo || t.avatar].filter(Boolean),
        date: t.date || "Recent",
        status: "Approved",
      }));

    // Deduplicate between reviews and testimonials
    const combinedMap = new Map<string, any>();
    allReviews
      .filter((r: any) => (r.status || "Approved") === "Approved")
      .forEach((r: any) => {
        const key = `${r.name || r.customer}-${r.comment?.slice(0, 30)}`.toLowerCase();
        combinedMap.set(key, r);
      });

    mappedTestimonials.forEach((t: any) => {
      const key = `${t.name}-${t.comment?.slice(0, 30)}`.toLowerCase();
      if (!combinedMap.has(key)) {
        combinedMap.set(key, t);
      }
    });

    let reviews = Array.from(combinedMap.values());

    const isProductMatch = (r: any) => {
      const rProdId = String(r.productId || "").toLowerCase();
      const rProdName = String(r.product || r.productName || "").toLowerCase();

      if (targetId && (rProdId === targetId || rProdName === targetId)) return true;
      if (targetSlug) {
        const cleanSlug = targetSlug.replace(/-/g, " ");
        if (rProdId.includes(targetSlug) || rProdName.includes(targetSlug)) return true;
        if (rProdId.includes(cleanSlug) || rProdName.includes(cleanSlug)) return true;
      }
      if (targetName && (rProdId.includes(targetName) || rProdName.includes(targetName))) return true;

      if (targetSlug.includes("fat-burner") || targetName.includes("fat burner")) {
        if (rProdId.includes("fat burn") || rProdName.includes("fat burn")) return true;
      }
      if (targetSlug.includes("madhunashi") || targetName.includes("madhunashi")) {
        if (rProdId.includes("madhunashi") || rProdName.includes("madhunashi") || rProdName.includes("sugar care")) return true;
      }
      if (targetSlug.includes("virja") || targetName.includes("virja")) {
        if (rProdId.includes("virja") || rProdName.includes("virja")) return true;
      }
      if (targetSlug.includes("perfect-36") || targetName.includes("perfect 36")) {
        if (rProdId.includes("perfect 36") || rProdName.includes("perfect 36")) return true;
      }

      return false;
    };

    if (targetSlug || targetId) {
      const matchingReviews = reviews.filter(isProductMatch);
      const otherReviews = reviews.filter((r: any) => !isProductMatch(r));
      reviews = [...matchingReviews, ...otherReviews];
    }

    // Calculate rating distribution
    const totalReviews = reviews.length;
    const starCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let ratingSum = 0;

    reviews.forEach((r: any) => {
      const star = Math.min(5, Math.max(1, Math.round(Number(r.rating) || 5))) as 1 | 2 | 3 | 4 | 5;
      starCounts[star] = (starCounts[star] || 0) + 1;
      ratingSum += Number(r.rating) || 5;
    });

    const averageRating = totalReviews > 0 ? Number((ratingSum / totalReviews).toFixed(1)) : 5.0;

    return NextResponse.json({
      success: true,
      reviews,
      stats: {
        totalReviews,
        averageRating,
        starCounts,
      },
    });
  } catch (error: any) {
    console.error("[GET /api/reviews Error]:", error);
    return NextResponse.json({ success: false, error: error?.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      productId,
      productName,
      rating,
      title,
      comment,
      customerName,
      customerPhone,
      orderId,
      location,
      image,
      images,
    } = body;

    // Validation
    const numRating = Number(rating);
    if (!rating || isNaN(numRating) || numRating < 1 || numRating > 5) {
      return NextResponse.json({ success: false, error: "Please select a star rating between 1 and 5." }, { status: 400 });
    }

    if (!comment || String(comment).trim().length < 5) {
      return NextResponse.json({ success: false, error: "Please write a short review (at least 5 characters)." }, { status: 400 });
    }

    const name = (customerName || "Valued Customer").trim();
    const reviewTitle = (title || "Authentic Ayurvedic Formulation").trim();

    const db = await readDB();
    const orders = db.orders || [];

    // Verify buyer if orderId or customerPhone is supplied
    let verifiedBuyer = false;
    let matchedOrder: any = null;

    const cleanOrderQuery = (orderId || "").trim().toLowerCase();
    const cleanPhone = (customerPhone || "").replace(/\D/g, "").slice(-10);

    if (cleanOrderQuery) {
      matchedOrder = orders.find((o: any) => {
        if (!o || !o.id) return false;
        const oId = String(o.id).toLowerCase();
        return oId === cleanOrderQuery || oId.includes(cleanOrderQuery);
      });
      if (matchedOrder) verifiedBuyer = true;
    }

    if (!verifiedBuyer && cleanPhone.length === 10) {
      matchedOrder = orders.find((o: any) => {
        if (!o) return false;
        const oPhone = String(o.phone || "").replace(/\D/g, "").slice(-10);
        return oPhone === cleanPhone;
      });
      if (matchedOrder) verifiedBuyer = true;
    }

    // Process review photos
    const reviewImages = Array.isArray(images)
      ? images.filter((img: any) => typeof img === "string" && img.trim().length > 0)
      : (typeof image === "string" && image.trim().length > 0 ? [image.trim()] : []);

    // Create review object
    const newReview = {
      id: `REV-${Date.now()}`,
      productId: String(productId || "1"),
      product: productName || "Ayurvedic Remedy",
      productName: productName || "Ayurvedic Remedy",
      customer: name,
      name,
      rating: Math.round(numRating),
      title: reviewTitle,
      comment: String(comment).trim(),
      location: location || "India",
      verifiedBuyer,
      orderId: matchedOrder ? matchedOrder.id : (orderId || null),
      image: reviewImages[0] || (typeof image === "string" ? image : null),
      images: reviewImages,
      date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      status: "Approved", // Automatically approved and published
      createdAt: new Date().toISOString(),
    };

    db.reviews = [newReview, ...(db.reviews || [])];

    // Optionally update product's reviews count & rating in db.products
    if (Array.isArray(db.products)) {
      const prodIdx = db.products.findIndex(
        (p: any) =>
          String(p.id) === String(productId) ||
          (productId && String(p.slug).toLowerCase() === String(productId).toLowerCase()) ||
          (productName && String(p.name).toLowerCase() === String(productName).toLowerCase())
      );
      if (prodIdx !== -1) {
        const prod = db.products[prodIdx];
        const currentCount = Number(prod.reviews) || 0;
        prod.reviews = currentCount + 1;
        // Adjust average rating
        const currentRating = Number(prod.rating) || 4.9;
        const newAvg = Number(((currentRating * currentCount + numRating) / (currentCount + 1)).toFixed(1));
        prod.rating = newAvg;
      }
    }

    const success = await writeDB(db);
    if (!success) {
      return NextResponse.json({ success: false, error: "Database write failed." }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      review: newReview,
      verifiedBuyer,
      message: verifiedBuyer
        ? "🌟 Thank you! Your verified buyer review has been published."
        : "🌟 Thank you! Your review has been published.",
    });
  } catch (error: any) {
    console.error("[POST /api/reviews Error]:", error);
    return NextResponse.json({ success: false, error: error?.message || "Internal Server Error" }, { status: 500 });
  }
}
