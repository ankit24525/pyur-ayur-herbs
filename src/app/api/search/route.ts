import { NextRequest, NextResponse } from "next/server";
import { products } from "@/lib/store";

const suggestionTerms: Record<string, string[]> = {
  energy: ["amla", "ashwagandha", "immunity"],
  heart: ["amla", "skin", "immunity"],
  gym: ["ashwagandha", "triphala", "digestion"],
};

export function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim().toLowerCase() ?? "";
  const terms = [query, ...(suggestionTerms[query] ?? [])].filter(Boolean);
  const matches = products.filter((product) => {
    const haystack = [
      product.name,
      product.concern,
      product.badge,
      ...product.ingredients,
    ].join(" ").toLowerCase();

    return !terms.length || terms.some((term) => haystack.includes(term));
  });

  const results = (matches.length ? matches : products).slice(0, 5);

  return NextResponse.json({
    query,
    results: results.map(({ name, slug, concern, price, image }) => ({
      name,
      slug,
      concern,
      price,
      image,
    })),
  });
}
