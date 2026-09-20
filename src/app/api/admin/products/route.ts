import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0, s-maxage=0",
  "Pragma": "no-cache",
  "Expires": "0",
};

export async function GET() {
  const db = await readDB(true);
  return NextResponse.json(
    { products: db.products },
    {
      headers: NO_CACHE_HEADERS,
    }
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const db = await readDB(true);

    const newProd = {
      id: `${db.products.length + 1}`,
      name: body.name,
      slug: body.slug || body.name.toLowerCase().replace(/ /g, "-"),
      concern: body.concern,
      price: parseFloat(body.price),
      compareAt: parseFloat(body.compareAt) || parseFloat(body.price) * 1.2,
      rating: 5.0,
      reviews: 0,
      badge: body.badge || "NEW",
      image: body.image || "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=500&q=80",
      ingredients: body.ingredients ? (Array.isArray(body.ingredients) ? body.ingredients : body.ingredients.split(",")) : ["Natural herbs"],
      description: body.description || "",
      coinsEarned: body.coinsEarned !== undefined ? (parseInt(String(body.coinsEarned), 10) || 0) : Math.round(parseFloat(body.price) * 0.05),
      showCoins: body.showCoins !== undefined ? Boolean(body.showCoins) : true,
      deliveryDays: "3 - 5 Days",
      inStock: true,
    };

    db.products.push(newProd);
    await writeDB(db);
    try {
      revalidatePath("/", "layout");
    } catch {}

    return NextResponse.json({ success: true, product: newProd }, { headers: NO_CACHE_HEADERS });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}
