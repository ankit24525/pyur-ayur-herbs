import { NextResponse } from "next/server";
import { products } from "@/lib/store";
export function GET() { return NextResponse.json({ count: 1, subtotal: products[0].price, items: [{ name: products[0].name, slug: products[0].slug, quantity: 1, price: products[0].price }] }); }
