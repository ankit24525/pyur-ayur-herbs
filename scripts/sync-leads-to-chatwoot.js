const fs = require("fs");
const path = require("path");

const CHATWOOT_BASE_URL = (process.env.CHATWOOT_BASE_URL || "https://app.chatwoot.com").replace(/\/+$/, "");
const CHATWOOT_API_TOKEN = process.env.CHATWOOT_API_TOKEN || "JJU8VbdBZwfdqfr3GtwGj1ra";
const CHATWOOT_ACCOUNT_ID = process.env.CHATWOOT_ACCOUNT_ID || "191283";

const headers = {
  "Content-Type": "application/json",
  "api_access_token": CHATWOOT_API_TOKEN,
};

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function request(endpoint, options = {}) {
  const url = `${CHATWOOT_BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, data };
}

async function main() {
  console.log("==================================================");
  console.log("   SYNC PAST LEADS TO CHATWOOT INBOX              ");
  console.log("==================================================");

  // 1. Fetch Inboxes
  console.log("\n[1/4] Fetching Chatwoot Inboxes...");
  const inboxesRes = await request(`/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}/inboxes`);
  if (!inboxesRes.ok || !Array.isArray(inboxesRes.data?.payload)) {
    console.error("Failed to fetch inboxes from Chatwoot:", inboxesRes.status, inboxesRes.data);
    return;
  }

  const inboxes = inboxesRes.data.payload;
  console.log(`Found ${inboxes.length} inboxes:`);
  inboxes.forEach((inb) => console.log(` - ID: ${inb.id} | Name: "${inb.name}" | Channel: ${inb.channel_type}`));

  // Prefer WhatsApp inbox, or fall back to first inbox
  const waInbox = inboxes.find((i) => i.channel_type?.includes("WhatsApp") || i.name?.toLowerCase().includes("whatsapp") || i.name?.toLowerCase().includes("store")) || inboxes[0];
  const targetInboxId = waInbox ? waInbox.id : 146151;
  console.log(`\n-> Targeting Inbox ID: ${targetInboxId} ("${waInbox?.name || "Default"}")`);

  // 2. Read leads from db.json
  const dbPath = path.join(__dirname, "../src/lib/db.json");
  const rawDb = fs.readFileSync(dbPath, "utf-8");
  const db = JSON.parse(rawDb);
  const leads = db.leads || [];

  console.log(`\n[2/4] Found ${leads.length} total customer leads in local database.`);

  // 3. Process each lead
  console.log("\n[3/4] Importing leads into Chatwoot...");
  let syncedCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < leads.length; i++) {
    const lead = leads[i];
    const rawPhone = lead.phone || "";
    let cleanPhone = rawPhone.replace(/\D/g, "");
    if (cleanPhone.length === 10) cleanPhone = "+91" + cleanPhone;
    else if (cleanPhone.length > 10 && !cleanPhone.startsWith("+")) cleanPhone = "+" + cleanPhone;

    const name = lead.name || (cleanPhone ? `Customer ${cleanPhone}` : "Customer");
    const messageText = lead.message || "Customer initiated contact";
    const botReply = lead.botReply;

    if (!cleanPhone && !name) {
      skippedCount++;
      continue;
    }

    try {
      // Find or Create Contact
      let contactId = null;

      // Try searching contact by phone
      if (cleanPhone) {
        const searchRes = await request(`/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}/contacts/search?q=${encodeURIComponent(cleanPhone)}`);
        if (searchRes.ok && Array.isArray(searchRes.data?.payload) && searchRes.data.payload.length > 0) {
          contactId = searchRes.data.payload[0].id;
        }
      }

      // If not found, create contact
      if (!contactId) {
        const createContactRes = await request(`/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}/contacts`, {
          method: "POST",
          body: JSON.stringify({
            inbox_id: targetInboxId,
            name: name,
            phone_number: cleanPhone || undefined,
          }),
        });

        if (createContactRes.ok && createContactRes.data?.payload?.contact?.id) {
          contactId = createContactRes.data.payload.contact.id;
        } else if (createContactRes.data?.payload?.contact?.id) {
          contactId = createContactRes.data.payload.contact.id;
        }
      }

      if (!contactId) {
        console.warn(`[Skip] Could not create contact for: ${name} (${cleanPhone})`);
        skippedCount++;
        continue;
      }

      // Create conversation
      const convRes = await request(`/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}/conversations`, {
        method: "POST",
        body: JSON.stringify({
          inbox_id: targetInboxId,
          contact_id: contactId,
          status: "open",
        }),
      });

      const conversationId = convRes.data?.id || convRes.data?.payload?.id;
      if (!conversationId) {
        // If already has an open conversation or failed
        console.warn(`[Skip] Could not open conversation for contact ${contactId}`);
        skippedCount++;
        continue;
      }

      // Add customer incoming message
      await request(`/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}/conversations/${conversationId}/messages`, {
        method: "POST",
        body: JSON.stringify({
          content: messageText,
          message_type: "incoming",
          private: false,
        }),
      });

      // Add bot response if present
      if (botReply) {
        await request(`/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}/conversations/${conversationId}/messages`, {
          method: "POST",
          body: JSON.stringify({
            content: botReply,
            message_type: "outgoing",
            private: false,
          }),
        });
      }

      syncedCount++;
      console.log(`[✓ ${syncedCount}/${leads.length}] Synced conversation for ${name} (${cleanPhone || "No Phone"}) -> Conv #${conversationId}`);
      await sleep(300); // polite rate limit
    } catch (err) {
      console.error(`[Error] Failed to sync lead #${i + 1}:`, err.message);
      skippedCount++;
    }
  }

  console.log("\n==================================================");
  console.log(`[4/4] COMPLETE! Successfully synced ${syncedCount} conversations into Chatwoot.`);
  console.log(`      Skipped: ${skippedCount}`);
  console.log("==================================================");
}

main();
