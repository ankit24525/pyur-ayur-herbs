import { NextResponse } from "next/server";
import { readDB } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const sitemapUrl = "https://www.purreayurherbs.com/sitemap.xml";

    // 1. Google Sitemap Ping
    const googlePingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
    const googlePromise = fetch(googlePingUrl, {
      headers: { "User-Agent": "PureAyurHerbs-Bot/1.0" },
    })
      .then((res) => ({ engine: "Google", status: res.status, ok: res.ok }))
      .catch((err) => ({ engine: "Google", status: 500, ok: false, error: err.message }));

    // 2. IndexNow Ping (Bing, Yandex, Seznam, Naver)
    const indexNowUrl = `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
    const bingPromise = fetch(indexNowUrl, {
      headers: { "User-Agent": "PureAyurHerbs-Bot/1.0" },
    })
      .then((res) => ({ engine: "Bing", status: res.status, ok: res.ok }))
      .catch((err) => ({ engine: "Bing", status: 500, ok: false, error: err.message }));

    const results = await Promise.all([googlePromise, bingPromise]);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      sitemapUrl,
      results,
      message: "Search engine crawler pings dispatched successfully!",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to trigger crawler ping" },
      { status: 500 }
    );
  }
}
