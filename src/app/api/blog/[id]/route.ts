import { NextResponse } from "next/server";
import { readDB } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cleanId = decodeURIComponent(id || "").toLowerCase().trim();

    const db = await readDB();
    const blogs = Array.isArray(db.blogs) ? db.blogs : [];

    const blog = blogs.find((b: any) => {
      const bId = String(b.id || "").toLowerCase().trim();
      const bSlug = (b.title || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
      return bId === cleanId || bSlug === cleanId;
    });

    if (!blog) {
      return NextResponse.json(
        { error: "Blog post not found" },
        {
          status: 404,
          headers: {
            "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
          },
        }
      );
    }

    return NextResponse.json(
      { blog },
      {
        status: 200,
        headers: {
          // Cache at Vercel Edge CDN for 5 minutes, stale-while-revalidate for 24 hours
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400",
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
