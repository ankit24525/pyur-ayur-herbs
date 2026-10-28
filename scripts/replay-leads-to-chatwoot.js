const fs = require("fs");
const path = require("path");

const CHATWOOT_WHATSAPP_WEBHOOK_URL = process.env.CHATWOOT_WHATSAPP_WEBHOOK_URL || "https://app.chatwoot.com/webhooks/whatsapp/+917247824101";
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || "1363740400150399";
const DISPLAY_PHONE = "917247824101";

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log("==========================================================");
  console.log("   SYNC PAST CUSTOMER MESSAGES TO CHATWOOT (100% FREE)    ");
  console.log("   Target URL: " + CHATWOOT_WHATSAPP_WEBHOOK_URL);
  console.log("==========================================================");

  const dbPath = path.join(__dirname, "../src/lib/db.json");
  const rawDb = fs.readFileSync(dbPath, "utf-8");
  const db = JSON.parse(rawDb);
  const leads = db.leads || [];

  console.log(`\nFound ${leads.length} total customer leads in database.`);

  // Chronological order (oldest first so conversations build up naturally in Chatwoot)
  const chronologicalLeads = [...leads].reverse();

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < chronologicalLeads.length; i++) {
    const lead = chronologicalLeads[i];
    let phone = (lead.phone || "").replace(/\D/g, "");
    if (!phone) continue;
    if (phone.length === 10) phone = "91" + phone;

    const name = lead.name || `Customer ${phone}`;
    const text = lead.message || "Customer initiated chat";
    const msgId = lead.waMessageId || `sync_${lead.id || i}_${Date.now()}`;
    const timestamp = Math.floor(Date.now() / 1000) - (chronologicalLeads.length - i) * 60;

    const payload = {
      object: "whatsapp_business_account",
      entry: [
        {
          id: PHONE_NUMBER_ID,
          changes: [
            {
              field: "messages",
              value: {
                messaging_product: "whatsapp",
                metadata: {
                  display_phone_number: DISPLAY_PHONE,
                  phone_number_id: PHONE_NUMBER_ID,
                },
                contacts: [
                  {
                    profile: { name: name },
                    wa_id: phone,
                  },
                ],
                messages: [
                  {
                    from: phone,
                    id: msgId,
                    timestamp: timestamp.toString(),
                    text: { body: text },
                    type: "text",
                  },
                ],
              },
            },
          ],
        },
      ],
    };

    try {
      const res = await fetch(CHATWOOT_WHATSAPP_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        successCount++;
        console.log(`[✓ ${successCount}/${chronologicalLeads.length}] Synced message from ${name} (${phone}): "${text.slice(0, 30)}..."`);
      } else {
        failCount++;
        console.warn(`[✗ Error ${res.status}] Failed to sync from ${phone}`);
      }

      await sleep(350); // Politeness delay
    } catch (err) {
      failCount++;
      console.error(`[✗ Exception] Lead #${i + 1}:`, err.message);
    }
  }

  console.log("\n==========================================================");
  console.log(`SYNC COMPLETE!`);
  console.log(`Successfully synced: ${successCount} messages to Chatwoot`);
  console.log(`Failed: ${failCount}`);
  console.log("==========================================================");
}

main();
