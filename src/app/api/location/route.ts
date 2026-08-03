import { NextRequest, NextResponse } from "next/server";
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null) as { latitude?: number; longitude?: number } | null;
  if (typeof body?.latitude !== "number" || typeof body.longitude !== "number") return NextResponse.json({ label: "Detect location", helper: "Allow location for accurate delivery", detected: false }, { status: 400 });
  return NextResponse.json({ label: "Visitor location detected", helper: `${body.latitude.toFixed(3)}, ${body.longitude.toFixed(3)} - delivery estimate ready`, detected: true });
}
