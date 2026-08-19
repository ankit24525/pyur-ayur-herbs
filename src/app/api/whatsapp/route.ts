import { NextResponse } from "next/server";

// Webhook Verification (GET)
// Meta triggers this to verify that your webhook server is active and using the correct verify token.
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    // Retrieve verify token from environment or use fallback
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

// Webhook Message Reception (POST)
// Meta triggers this when a user sends a message to your WhatsApp Business number.
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Verify it is a WhatsApp Business Account message notification
    if (body.object === "whatsapp_business_account") {
      const entry = body.entry?.[0];
      const change = entry?.changes?.[0];
      const value = change?.value;
      const message = value?.messages?.[0];
      const contact = value?.contacts?.[0];

      if (message) {
        const from = message.from; // User's WhatsApp number (country code + number)
        const messageId = message.id;
        const type = message.type;
        const profileName = contact?.profile?.name || "Customer";

        let textBody = "";
        if (type === "text") {
          textBody = message.text?.body || "";
        } else if (type === "interactive") {
          textBody = message.interactive?.button_reply?.title || message.interactive?.list_reply?.title || "";
        }

        console.log(`[WhatsApp Webhook Incoming] From: ${profileName} (${from}) | Type: ${type} | Message: "${textBody}" | ID: ${messageId}`);

        // Custom Chatbot Logic / CRM trigger hooks can be executed here:
        // const replyMessage = await handleBotResponse(textBody, from);
        // if (replyMessage) {
        //   await sendWhatsAppMessage(from, replyMessage);
        // }
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: "Invalid webhook payload structure." }, { status: 400 });
  } catch (error) {
    console.error("[WhatsApp Webhook POST Error]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
