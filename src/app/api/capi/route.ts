import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const eventData = await request.json();
    const { eventName, url, clientData } = eventData;

    console.log(`[Meta CAPI event logged]: ${eventName}`, {
      url,
      timestamp: new Date().toISOString(),
      clientData,
    });

    // In a live environment: send to Facebook Conversions API endpoint
    // https://graph.facebook.com/v19.0/PIXEL_ID/events?access_token=CAPI_TOKEN
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
