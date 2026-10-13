import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";
import { generateChatbotReply } from "@/lib/chatbot-ai";
import { sendWhatsAppTextMessage } from "@/lib/whatsapp";

// Keep a lightweight in-memory cache to prevent duplicate processing of the same message ID
const processedMessageIds = new Set<string | number>();

// GET Handshake / Healthcheck
export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "Pure Ayur Herbs Chatwoot AI Chatbot Webhook",
    timestamp: new Date().toISOString(),
  });
}

// POST: Handles incoming webhook events from Chatwoot
export async function POST(request: Request) {
  try {
    const payload = await request.json();

    // Only process "message_created" events
    if (payload.event !== "message_created") {
      return NextResponse.json({ acknowledged: true, message: "Ignored non-message event" });
    }

    const messageType = payload.message_type;
    const isPrivate = Boolean(payload.private);

    // Filter: Only process INCOMING customer messages
    // (Ignore outgoing bot/agent replies, private notes, and system activity to avoid infinite loops)
    const isIncoming = messageType === "incoming" || messageType === 0;
    if (!isIncoming || isPrivate) {
      return NextResponse.json({ acknowledged: true, message: "Ignored outgoing or private message" });
    }

    // Ignore messages sent by human agents / users
    if (payload.sender && payload.sender.type === "user") {
      return NextResponse.json({ acknowledged: true, message: "Ignored agent message" });
    }

    const messageId = payload.id;
    if (messageId && processedMessageIds.has(messageId)) {
      return NextResponse.json({ acknowledged: true, message: "Already processed" });
    }
    if (messageId) {
      processedMessageIds.add(messageId);
      // Evict old entries to prevent unbounded memory growth
      if (processedMessageIds.size > 2000) {
        const first = processedMessageIds.values().next().value;
        if (first !== undefined) processedMessageIds.delete(first);
      }
    }

    const rawContent = (payload.content || "").trim();
    if (!rawContent) {
      return NextResponse.json({ acknowledged: true, message: "Empty content" });
    }

    // Extract sender details
    const sender = payload.sender || {};
    const conversation = payload.conversation || {};
    const account = payload.account || {};

    const profileName = sender.name || conversation.meta?.sender?.name || "Customer";
    const rawPhone = sender.phone_number || conversation.meta?.sender?.phone_number || "";
    let cleanPhone = rawPhone.replace(/\D/g, "");
    if (cleanPhone.length === 10) {
      cleanPhone = "91" + cleanPhone;
    }

    const conversationId = conversation.id;
    const accountId =
      account.id ||
      conversation.account_id ||
      process.env.CHATWOOT_ACCOUNT_ID ||
      "191283";

    console.log(`[Chatwoot Webhook Incoming] From: ${profileName} (${cleanPhone || "No Phone"}) | Msg: "${rawContent}" | Conv: ${conversationId}`);

    // 1. Generate Intelligent AI Ayurvedic & Order Chatbot Reply
    const botResponse = await generateChatbotReply({
      from: cleanPhone || "919999999999",
      profileName,
      messageText: rawContent,
    });

    // 2. Save incoming lead into database
    try {
      const db = await readDB();
      db.leads = db.leads || [];

      db.leads.unshift({
        id: `CW-${Date.now()}`,
        waMessageId: `cw-${messageId || Date.now()}`,
        name: profileName,
        phone: cleanPhone || "Via Chatwoot",
        source: "Chatwoot Live Chat",
        message: rawContent,
        botReply: botResponse.replyText,
        intent: botResponse.intent,
        status: botResponse.escalatedToHuman ? "Needs Attention" : "AI Resolved",
        date: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      });
      await writeDB(db);
    } catch (dbErr) {
      console.error("[Chatwoot Webhook DB Save Error]:", dbErr);
    }

    // 3. Post reply back to Chatwoot Conversation
    const db = await readDB();
    const chatwootToken =
      process.env.CHATWOOT_API_TOKEN ||
      db.settings?.chatwootApiToken ||
      "JJU8VbdBZwfdqfr3GtwGj1ra";

    const chatwootBaseUrl = (
      process.env.CHATWOOT_BASE_URL ||
      db.settings?.chatwootBaseUrl ||
      "https://app.chatwoot.com"
    ).replace(/\/+$/, "");

    let repliedViaChatwoot = false;

    if (chatwootToken && accountId && conversationId) {
      try {
        const postUrl = `${chatwootBaseUrl}/api/v1/accounts/${accountId}/conversations/${conversationId}/messages`;
        const res = await fetch(postUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            api_access_token: chatwootToken,
          },
          body: JSON.stringify({
            content: botResponse.replyText,
            message_type: "outgoing",
            private: false,
          }),
        });

        if (res.ok) {
          repliedViaChatwoot = true;
          console.log(`[Chatwoot Bot Replied] Successfully posted to conversation ${conversationId}`);

          // If the AI escalated to a live agent, post an internal private note
          if (botResponse.escalatedToHuman) {
            await fetch(postUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                api_access_token: chatwootToken,
              },
              body: JSON.stringify({
                content: "⚠️ **[AI Bot Handover]**: Customer requested human support / consultation. Please attend to this conversation.",
                message_type: "outgoing",
                private: true,
              }),
            }).catch(() => {});
          }
        } else {
          const errData = await res.text();
          console.error("[Chatwoot Message API Error]:", res.status, errData);
        }
      } catch (cwErr) {
        console.error("[Chatwoot Message Post Exception]:", cwErr);
      }
    }

    // Fallback: If Chatwoot API token is not yet configured but we have customer's WhatsApp number and Meta credentials, reply via WhatsApp directly
    if (!repliedViaChatwoot && cleanPhone && cleanPhone.length >= 10 && cleanPhone !== "919999999999") {
      try {
        await sendWhatsAppTextMessage(cleanPhone, botResponse.replyText);
        console.log(`[Chatwoot Fallback WhatsApp Replied] To: ${cleanPhone}`);
      } catch (waErr) {
        console.error("[Chatwoot Fallback WhatsApp Send Error]:", waErr);
      }
    }

    return NextResponse.json({
      success: true,
      intent: botResponse.intent,
      repliedViaChatwoot,
    });
  } catch (error: any) {
    console.error("[Chatwoot Webhook Exception]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
