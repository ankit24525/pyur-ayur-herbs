import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({ count: 0, subtotal: 0, items: [] });
}
