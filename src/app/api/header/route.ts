import { NextResponse } from "next/server";
import { headerSearchSuggestions, menuLinks } from "@/lib/store";
export function GET() { return NextResponse.json({ searchSuggestions: headerSearchSuggestions, menuLinks, visitorLocationFallback: { label: "Detect location", helper: "Allow location for accurate delivery" } }); }
