import { NextRequest, NextResponse } from "next/server";
import { readDB } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get("q")?.trim().toLowerCase() ?? "";
    const db = await readDB();
    const products = Array.isArray(db.products) ? db.products : [];

    if (!query) {
      return NextResponse.json({
        query: "",
        results: products.slice(0, 10).map(({ id, name, slug, concern, price, compareAt, image, inStock }: any) => ({
          id,
          name,
          slug: slug || id,
          concern,
          price,
          compareAt,
          image,
          inStock: inStock !== false,
        })),
      });
    }

    const terms = query.split(/\s+/).filter(Boolean);

    const matches = products.filter((product: any) => {
      const name = (product.name || "").toLowerCase();
      const concern = (product.concern || "").toLowerCase();
      const desc = (product.description || "").toLowerCase();
      const badge = (product.badge || "").toLowerCase();
      const ingr = Array.isArray(product.ingredients)
        ? product.ingredients.join(" ").toLowerCase()
        : String(product.ingredients || "").toLowerCase();

      const haystack = `${name} ${concern} ${desc} ${badge} ${ingr}`;
      return terms.every((term) => haystack.includes(term));
    });

    return NextResponse.json({
      query,
      results: matches.map(({ id, name, slug, concern, price, compareAt, image, inStock }: any) => ({
        id,
        name,
        slug: slug || id,
        concern,
        price,
        compareAt,
        image,
        inStock: inStock !== false,
      })),
    });
  } catch (error: any) {
    console.error("Search API Error:", error);
    return NextResponse.json({ query: "", results: [] }, { status: 500 });
  }
}
