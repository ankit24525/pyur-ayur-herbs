import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";

export async function GET() {
  const db = await readDB();
  return NextResponse.json({ products: db.products });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const db = await readDB();

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
      image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=500&q=80",
      ingredients: body.ingredients ? body.ingredients.split(",") : ["Natural herbs"],
      description: body.description || "",
      coinsEarned: Math.round(parseFloat(body.price) * 0.05),
      deliveryDays: "3 - 5 Days",
      inStock: true,
    };

    db.products.push(newProd);
    await writeDB(db);

    return NextResponse.json({ success: true, product: newProd });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
