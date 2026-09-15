import { NextResponse } from "next/server";
import { sendWhatsAppTextMessage } from "@/lib/whatsapp";
import { readDB, writeDB } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { to, message, leadId } = await request.json();

    if (!to || !message) {
      return NextResponse.json({ error: "Recipient phone number and message are required." }, { status: 400 });
    }

    // Clean phone number (strip spaces, +, -, etc.)
    const cleanPhone = to.replace(/\D/g, "");

    console.log(`[Admin WhatsApp Reply] Sending message to ${cleanPhone}: "${message}"`);
    const result = await sendWhatsAppTextMessage(cleanPhone, message);

    if (result.success) {
      // Update lead status to "Responded" if leadId provided
      if (leadId) {
        try {
          const db = await readDB();
          if (db.leads) {
            const leadIndex = db.leads.findIndex((l: any) => l.id === leadId);
            if (leadIndex !== -1) {
              db.leads[leadIndex].status = "Responded";
              await writeDB(db);
            }
          }
        } catch (dbErr) {
          console.error("Failed to update lead status after sending WhatsApp message:", dbErr);
        }
      }

      return NextResponse.json({ success: true, data: result.data });
    } else {
      return NextResponse.json({ success: false, error: result.error || "Failed to send WhatsApp message." }, { status: 500 });
    }
  } catch (error: any) {
    console.error("[Admin WhatsApp Send API Error]:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
