import { NextResponse } from "next/server";
export function GET() { return NextResponse.json({ status: "ready", message: "Express delivery available after location detection.", eta: "2-4 days" }); }
