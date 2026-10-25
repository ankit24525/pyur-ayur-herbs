import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = await readDB();
    const allTestimonials = Array.isArray(db.testimonials) ? db.testimonials : [];
    const approved = allTestimonials.filter((t: any) => (t.status || "Approved") === "Approved");

    return NextResponse.json({
      success: true,
      testimonials: approved,
      total: approved.length,
    });
  } catch (error: any) {
    console.error("[GET /api/testimonials Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to load testimonials" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      customerName,
      rating,
      comment,
      title,
      location,
      productTagged,
      product,
      image,
      avatar,
      photo,
    } = body;

    const reviewerName = (name || customerName || "Verified Customer").trim();
    const reviewComment = (comment || "").trim();

    if (!reviewComment || reviewComment.length < 5) {
      return NextResponse.json(
        { success: false, error: "Please write a short review (at least 5 characters)." },
        { status: 400 }
      );
    }

    const numRating = Math.min(5, Math.max(1, Number(rating) || 5));
    const photoUrl =
      photo ||
      avatar ||
      image ||
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&q=80";

    const newTestimonial = {
      id: `test_${Date.now()}`,
      name: reviewerName,
      location: (location || "India").trim(),
      rating: numRating,
      title: (title || "Authentic Ayurvedic Formulation").trim(),
      comment: reviewComment,
      productTagged: (productTagged || product || "Pure Ayur Herbs Remedy").trim(),
      verifiedBuyer: true,
      avatar: photoUrl,
      photo: photoUrl,
      status: "Approved",
      date: new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      createdAt: new Date().toISOString(),
    };

    const db = await readDB();
    const current = Array.isArray(db.testimonials) ? db.testimonials : [];
    db.testimonials = [newTestimonial, ...current];

    await writeDB(db);

    return NextResponse.json({
      success: true,
      testimonial: newTestimonial,
      message: "Thank you! Your verified testimonial has been published.",
    });
  } catch (error: any) {
    console.error("[POST /api/testimonials Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to submit testimonial" },
      { status: 500 }
    );
  }
}
