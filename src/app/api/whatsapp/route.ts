import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";
import { sendWhatsAppTextMessage } from "@/lib/whatsapp";

// Webhook Verification (GET)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    const localVerifyToken = process.env.WHATSAPP_VERIFY_TOKEN || "pyur_ayur_verify_token_2026";

    if (mode === "subscribe" && token === localVerifyToken) {
      console.log("[WhatsApp Webhook Handshake Success]: Webhook verified.");
      return new Response(challenge, {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      });
    }

    console.warn("[WhatsApp Webhook Handshake Failed]: Invalid verification token matching.");
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  } catch (error) {
    console.error("[WhatsApp Webhook GET Error]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

import { generateChatbotReply } from "@/lib/chatbot-ai";

// Webhook Message Reception (POST)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("[WhatsApp Webhook POST Received]:", JSON.stringify(body));

    // Support both Meta production wrapped payload and Meta test tool payload
    const entry = body.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value || body.value;
    const message = value?.messages?.[0];
    const contact = value?.contacts?.[0];

    // Log status delivery events if present
    const statusUpdate = value?.statuses?.[0];
    if (statusUpdate) {
      console.log(
        `[WhatsApp Delivery Status]: ID: ${statusUpdate.id} | Status: ${statusUpdate.status} | Recipient: ${statusUpdate.recipient_id}`
      );
    }

    if (message) {
      const from = message.from || "919999999999";
      const messageId = message.id || `msg-${Date.now()}`;
      const type = message.type || "text";
      const profileName = contact?.profile?.name || "WhatsApp Customer";

      let textBody = "";
      if (type === "text") {
        textBody = message.text?.body || "";
      } else if (type === "interactive") {
        textBody = message.interactive?.button_reply?.title || message.interactive?.list_reply?.title || "";
      } else {
        textBody = "Customer sent an attachment or interactive response";
      }

      console.log(`[WhatsApp Webhook Incoming] From: ${profileName} (${from}) | Message: "${textBody}"`);

      // 1. Generate Intelligent AI Ayurvedic & Order Chatbot Reply
      const botResponse = await generateChatbotReply({
        from,
        profileName,
        messageText: textBody,
      });

      // 2. Save incoming message & bot response to db.leads so admin can monitor in /admin
      try {
        const db = await readDB();
        db.leads = db.leads || [];

        // Avoid duplicate entry for same messageId
        const exists = db.leads.some((l: any) => l.waMessageId === messageId);
        if (!exists) {
          db.leads.unshift({
            id: `WA-${Date.now()}`,
            waMessageId: messageId,
            name: profileName,
            phone: from,
            source: "WhatsApp Business Chat",
            message: textBody || "Sent media/interactive query",
            botReply: botResponse.replyText,
            intent: botResponse.intent,
            status: botResponse.escalatedToHuman ? "Needs Attention" : "AI Resolved",
            date: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
          });
          await writeDB(db);
        }
      } catch (dbErr) {
        console.error("[WhatsApp Webhook DB Save Error]:", dbErr);
      }

      // 3. Send automated AI Ayurvedic response back to customer on WhatsApp
      try {
        await sendWhatsAppTextMessage(from, botResponse.replyText);
        console.log(`[WhatsApp Bot Replied] To: ${from} | Intent: ${botResponse.intent}`);
      } catch (replyErr) {
        console.error("[WhatsApp Webhook Reply Send Error]:", replyErr);
      }

      return NextResponse.json({ success: true, intent: botResponse.intent });
    }

    // Acknowledge receipt of other WhatsApp events (statuses, delivery receipts, etc.)
    return NextResponse.json({ success: true, message: "Webhook event acknowledged." });
  } catch (error) {
    console.error("[WhatsApp Webhook POST Error]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
