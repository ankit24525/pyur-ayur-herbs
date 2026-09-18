import {
  findOrdersForCustomer,
  formatOrderStatusMessage,
  formatMultipleOrdersMessage,
  cancelCustomerOrder,
  formatCancellationPrompt,
  formatDoorstepRefusalMessage,
  formatAlreadyCancelledMessage,
  formatDeliveredCannotCancelMessage,
} from "./chatbot-orders";
import { readDB } from "./db";

export interface ChatbotContext {
  from: string; // e.g. "919258352773"
  profileName: string;
  messageText: string;
}

export interface ChatbotReply {
  replyText: string;
  intent: string;
  escalatedToHuman: boolean;
}

export interface CatalogItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAt: number;
  rating: string;
  concern: string;
  ingredients: string;
  dosage: string;
  benefits: string;
  link: string;
}

// Live Pure Ayur Herbs Product Catalog (Synchronized with live storefront)
export const AYURVEDIC_CATALOG: CatalogItem[] = [
  {
    id: "prod_1788947560528",
    name: "VIRJA POWDER",
    slug: "virja-powder",
    price: 1199,
    compareAt: 1499,
    rating: "5.0 ⭐",
    concern: "Energy & Vitality / Men's Stamina, Power & Strength (पुरुषों की प्राकृतिक शक्ति और ऊर्जा)",
    ingredients: "Pure Ayurvedic Rasayana Blend, Shuddha Shilajit, Ashwagandha, Safed Musli, Gokshura, Kaunch Beej, Vidarikand",
    dosage: "Take 1 teaspoon (approx. 3g - 5g) twice daily with lukewarm milk or water, preferably in the morning after breakfast and 30 minutes before bedtime.",
    benefits: "खास तौर पर पुरुषों की प्राकृतिक शक्ति, स्टैमिना, ऊर्जा और आंतरिक बल को बढ़ाने के लिए तैयार किया गया प्रीमियम आयुर्वेदिक फॉर्मूला। थकान और कमजोरी दूर कर शरीर को भीतर से मजबूत और सक्रिय बनाता है। (100% Ayurvedic, Safe & GMP Certified)",
    link: "https://www.purreayurherbs.com/products/virja-powder",
  },
  {
    id: "prod_1789129223995",
    name: "VIRJA GOLD MAJUN",
    slug: "virja-gold-majun",
    price: 449,
    compareAt: 499,
    rating: "5.0 ⭐",
    concern: "Energy & Vitality / Men's Power, Vigour & Daily Stamina (पुरुषों की वाइटैलिटी और पावर)",
    ingredients: "Traditional Gold Bhasma blend, Kesar, Ashwagandha, Safed Musli, Akarkara, Jaiphal, Herbal Extracts",
    dosage: "Take 5g to 10g (approx. 1 small spoon) with warm milk at night before bedtime, or as directed by an Ayurvedic physician.",
    benefits: "पारंपरिक आयुर्वेदिक माजून फॉर्मूला जो पुरुषों की वाइटैलिटी और पावर को प्राकृतिक रूप से बढ़ाता है। अंदरूनी कमजोरी और रोजमर्रा की थकान को दूर करके आत्मविश्वास और परफॉरमेंस में सुधार करता है।",
    link: "https://www.purreayurherbs.com/products/virja-gold-majun",
  },
  {
    id: "prod_1788511819071",
    name: "MADHUNASHI POWDER",
    slug: "madhunashi-powder",
    price: 1487,
    compareAt: 2199,
    rating: "5.0 ⭐",
    concern: "Sugar Management / Blood Sugar Control & Glucose Balance (शुगर और डायबिटीज नियंत्रण)",
    ingredients: "Gudmar (Gymnema Sylvestre - 'Sugar Destroyer'), Karela (Bitter Gourd), Jamun Seed, Vijaysar, Methi, Neem, Giloy",
    dosage: "Take 1 teaspoon (approx. 3g - 5g) twice daily with lukewarm water, 30 minutes before breakfast and 30 minutes before dinner.",
    benefits: "100% प्राकृतिक बॉटनिकल फॉर्मूला जो ब्लड शुगर को नियंत्रित करता है, इंसुलिन संवेदनशीलता व पैंक्रियाज के बीटा-सेल्स को सपोर्ट करता है, और मीठे की क्रेविंग्स कम करता है। (Net Wt: 200g, GMP Certified, Gluten-Free)",
    link: "https://www.purreayurherbs.com/products/madhunashi-powder",
  },
  {
    id: "prod_1788511912600",
    name: "MADHUNASHI SYP",
    slug: "madhunashi-syp",
    price: 410,
    compareAt: 499,
    rating: "5.0 ⭐",
    concern: "Sugar Management / Blood Sugar Support Tonic (शुगर सिरप)",
    ingredients: "Karela, Jamun, Gudmar, Nimba, Giloy, Belpatra Herbal Extracts",
    dosage: "Take 10ml - 15ml twice daily diluted in equal quantity of water, 30 minutes before meals.",
    benefits: "प्राकृतिक ब्लड शुगर संतुलन के लिए विश्वसनीय आयुर्वेदिक सिरप। 100% शाकाहारी, जीएमपी प्रमाणित, और दैनिक शुगर व मेटाबॉलिज्म देखभाल के लिए पूर्णतः सुरक्षित।",
    link: "https://www.purreayurherbs.com/products/madhunashi-syp",
  },
  {
    id: "prod_1788511960374",
    name: "FAT BURNER",
    slug: "fat-burner",
    price: 499,
    compareAt: 599,
    rating: "5.0 ⭐",
    concern: "Gym & Fitness / Weight Management, Metabolism & Detox (मोटापा व फैट बर्नर स्लिम टॉनिक)",
    ingredients: "Wild Amla, Curry Leaves, Ginger, Garcinia Cambogia, Harad, Baheda",
    dosage: "Mix 20ml - 30ml in a glass of lukewarm water. Consume twice daily — early morning on an empty stomach and in the evening.",
    benefits: "मेटाबॉलिज्म को तेज कर प्राकृतिक वजन नियंत्रण (Fat Burn) में मदद करता है। शरीर से टॉक्सिन्स को बाहर निकालता है (Detox) और दिन भर एक्टिव व एनर्जेटिक बनाए रखता है। (500ml Tonic, 100% Ayurvedic, GMP Certified)",
    link: "https://www.purreayurherbs.com/products/fat-burner",
  },
  {
    id: "prod_1788512010828",
    name: "PERFECT 36 CREAM",
    slug: "perfect-36-cream",
    price: 5,
    compareAt: 799,
    rating: "5.0 ⭐",
    concern: "Women's Health / Body Toning, Firmness & Elasticity (महिलाओं के लिए हर्बल टोनिंग क्रीम)",
    ingredients: "Shatavari, Ashwagandha, Gambhari, Jamun, Natural Herbal Botanicals",
    dosage: "Take a small quantity on fingertips and massage gently in circular, upward motions for 5–10 minutes until fully absorbed. Apply twice daily (morning & night).",
    benefits: "महिलाओं के लिए समय-परीक्षित आयुर्वेदिक जड़ी-बूटियों से निर्मित शुद्ध हर्बल टोनिंग क्रीम। त्वचा की कसावट (firmness) और इलास्टिसिटी को सपोर्ट करती है। (100ml, सुरक्षित, नो साइड इफेक्ट, For External Use Only)",
    link: "https://www.purreayurherbs.com/products/perfect-36-cream",
  },
];

/**
 * Dynamically retrieves live catalog from Database with fallback to hardcoded catalog
 */
export async function getLiveCatalog(): Promise<CatalogItem[]> {
  try {
    const db = await readDB();
    if (db && Array.isArray(db.products) && db.products.length > 0) {
      return db.products.map((p: any) => {
        const fallback = AYURVEDIC_CATALOG.find(
          (c) => c.slug === p.slug || c.id === p.id || c.name.toLowerCase() === p.name.toLowerCase()
        );
        return {
          id: p.id || fallback?.id || "prod_" + Date.now(),
          name: p.name || fallback?.name || "Ayurvedic Formulation",
          slug: p.slug || fallback?.slug || "store",
          price: Number(p.price) || fallback?.price || 499,
          compareAt: Number(p.compareAt) || fallback?.compareAt || Math.round(Number(p.price) * 1.3),
          rating: p.rating ? `${p.rating} ⭐` : (fallback?.rating || "5.0 ⭐"),
          concern: p.concern || fallback?.concern || "Ayurvedic Health & Wellness",
          ingredients: Array.isArray(p.ingredients) ? p.ingredients.join(", ") : (p.ingredients || fallback?.ingredients || "100% Pure Herbal Extracts"),
          dosage: fallback?.dosage || "Take as directed on packaging or by an Ayurvedic physician.",
          benefits: p.description?.slice(0, 250) || fallback?.benefits || "100% Ministry of AYUSH Certified Ayurvedic remedy.",
          link: `https://www.purreayurherbs.com/products/${p.slug || fallback?.slug || ""}`,
        };
      });
    }
  } catch (err) {
    console.warn("[getLiveCatalog DB Error]:", err);
  }
  return AYURVEDIC_CATALOG;
}

/**
 * Dispatches async webhook to external n8n workflow if URL configured.
 */
async function forwardToN8nIfConfigured(eventData: any) {
  const n8nUrl = process.env.N8N_WEBHOOK_URL?.trim();
  if (!n8nUrl || !n8nUrl.startsWith("http")) return;

  try {
    fetch(n8nUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: "PureAyurHerbs_WhatsApp_Bot",
        timestamp: new Date().toISOString(),
        ...eventData,
      }),
    }).catch(() => {});
  } catch {}
}

/**
 * Calls Google Gemini REST API if GEMINI_API_KEY is available in environment.
 */
/**
 * Calls Google Gemini REST API if GEMINI_API_KEY is available in environment.
 */
async function callGeminiAI(userQuery: string, customerName: string, catalog: CatalogItem[]): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return null;

  try {
    const systemPrompt = `You are "Dr. Ayur", the friendly, knowledgeable, certified Chief Ayurvedic Vaidya and Support Assistant for "Pure Ayur Herbs" (https://www.purreayurherbs.com).
Company background:
- 100% Ministry of AYUSH Certified Ayurvedic wellness brand based in India.
- Free shipping across India on prepaid & COD orders.
- Fast 2–4 business days priority delivery.
- Cash on Delivery (COD) and PhonePe prepaid available.
- 7-Day return policy for unsealed items.
Our Product Catalog:
${catalog.map(
  (p) => `- ${p.name} (₹${p.price}): For ${p.concern}. Ingredients: ${p.ingredients}. Dosage: ${p.dosage}. Link: ${p.link}`
).join("\n")}

Guidelines:
1. Greet the customer warmly (Namaste ${customerName}! 🙏).
2. Answer naturally in the same language the customer uses (English, Hindi, or Hinglish).
3. Recommend the specific Pure Ayur Herbs remedy matching their health issue, mention price and dosage. Include product link.
4. Keep the message concise (maximum 3 short paragraphs), polite, and formatted with WhatsApp markdown (*bold*, bullet points).
5. Always advise consulting a doctor if customer mentions severe acute conditions or pregnancy.`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: `${systemPrompt}\n\nCustomer Inquiry: "${userQuery}"` }],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 600,
          },
        }),
      }
    );

    if (!res.ok) return null;
    const data = await res.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return reply ? reply.trim() : null;
  } catch (err) {
    console.warn("[Gemini API Error, falling back to rule engine]:", err);
    return null;
  }
}

/**
 * Main Chatbot Response Engine
 */
export async function generateChatbotReply(context: ChatbotContext): Promise<ChatbotReply> {
  const { from, profileName, messageText } = context;
  const rawQuery = (messageText || "").trim();
  const query = rawQuery.toLowerCase();

  // Forward conversation event to n8n if user configured it
  void forwardToN8nIfConfigured({
    from,
    profileName,
    message: rawQuery,
  });

  // Dynamically load live catalog
  const catalog = await getLiveCatalog();

  // Helper product accessors
  const virjaPowder = catalog.find((c) => c.slug === "virja-powder") || AYURVEDIC_CATALOG[0];
  const virjaMajun = catalog.find((c) => c.slug === "virja-gold-majun") || AYURVEDIC_CATALOG[1];
  const madhunashiPowder = catalog.find((c) => c.slug === "madhunashi-powder") || AYURVEDIC_CATALOG[2];
  const madhunashiSyp = catalog.find((c) => c.slug === "madhunashi-syp") || AYURVEDIC_CATALOG[3];
  const fatBurner = catalog.find((c) => c.slug === "fat-burner") || AYURVEDIC_CATALOG[4];
  const perfect36 = catalog.find((c) => c.slug === "perfect-36-cream") || AYURVEDIC_CATALOG[5];

  // ==========================================
  // 1. GREETINGS & MAIN MENU
  // ==========================================
  const isGreeting =
    /^(hi|hello|hey|namaste|pranam|start|menu|help|options|kya hal|halo|hlo|shuru)\b/i.test(query) ||
    query.length === 0;

  if (isGreeting && !query.includes("order") && !query.includes("track") && !query.includes("product") && !query.includes("catalog")) {
    const greetingMsg = `*Namaste ${profileName || "Ji"}! 🙏 Welcome to Pure Ayur Herbs.*

I am your 24/7 Ayurvedic Wellness Assistant. How may I assist your health journey today?

1️⃣ *Track or Cancel Order* — Real-time shipment status, tracking & instant cancellation
2️⃣ *Ayurvedic Remedy Finder* — Find the right herb for your health concern
3️⃣ *Product Usage & Dosage* — How & when to consume Virja, Madhunashi, Fat Burner & Creams
4️⃣ *Product Catalog & Prices* — View all available products & offers
5️⃣ *Talk to Vaidya / Support* — Connect with our senior Ayurvedic specialist

_💡 Simply reply with *1*, *2*, *3*, *4*, *5* or type any health concern in Hindi, English, or Hinglish!_`;

    return { replyText: greetingMsg, intent: "GREETING", escalatedToHuman: false };
  }

  // ==========================================
  // 1.5. ORDER CANCELLATION INTENT (Amazon & Flipkart Policy)
  // ==========================================
  const isConfirmCancel = /confirm\s*(cancel|radd)|yes\s*cancel/i.test(query);
  const isCancelRequest =
    query.includes("cancel") ||
    query.includes("radd") ||
    query.includes("radh") ||
    query.includes("stop order") ||
    query.includes("dont want") ||
    query.includes("nahi chahiye") ||
    query.includes("order wapas") ||
    query.includes("order band");

  if (isConfirmCancel) {
    const orderResult = await findOrdersForCustomer(rawQuery, from);
    let targetOrder = orderResult.order;
    if (!targetOrder && orderResult.multiple && orderResult.multiple.length > 0) {
      targetOrder = orderResult.multiple[0];
    }

    if (!targetOrder) {
      return {
        replyText: `⚠️ *Order Cancellation Desk*

I couldn't detect which order you want to cancel. Please reply with:
👉 *CONFIRM CANCEL <Your Order ID>* (e.g. *CONFIRM CANCEL PYR-ORD-146050*)

Or reply *Order* to see your active orders.`,
        intent: "ORDER_CANCELLATION",
        escalatedToHuman: false,
      };
    }

    // Extract optional reason after the word cancel or order id
    const reasonMatch = rawQuery
      .replace(/confirm\s*(cancel|radd)/i, "")
      .replace(new RegExp(targetOrder.id, "gi"), "")
      .replace(/pyr-ord-\d+/i, "")
      .trim();
    const cancelReason = reasonMatch || "Customer confirmed cancellation on WhatsApp";

    const cancelRes = await cancelCustomerOrder(targetOrder.id, from, cancelReason);
    return {
      replyText: cancelRes.message,
      intent: "ORDER_CANCELLATION",
      escalatedToHuman: false,
    };
  }

  if (isCancelRequest) {
    const orderResult = await findOrdersForCustomer(rawQuery, from);

    if (!orderResult.found || (!orderResult.order && (!orderResult.multiple || orderResult.multiple.length === 0))) {
      return {
        replyText: `🚫 *Order Cancellation Desk*

I couldn't locate an active order automatically for your phone (+91 ${from.slice(-10)}).

To cancel an order, please reply with:
👉 *CANCEL <Your Order ID>* (e.g. *CANCEL PYR-ORD-146050*)

You can also cancel anytime directly on our website:
🔗 https://www.purreayurherbs.com/track

Need to speak with our support team? Reply *Support*!`,
        intent: "ORDER_CANCELLATION",
        escalatedToHuman: false,
      };
    }

    if (orderResult.multiple && orderResult.multiple.length > 1) {
      const list = orderResult.multiple
        .slice(0, 4)
        .map((o: any, idx: number) => {
          return `${idx + 1}️⃣ *Order ${o.id}* (Status: ${o.status || "Processing"})
• Items: ${o.items || "Ayurvedic Remedy"}
• Total: ₹${Number(o.total || 0).toLocaleString("en-IN")}
👉 Reply: *CONFIRM CANCEL ${o.id}*`;
        })
        .join("\n\n");

      return {
        replyText: `⚠️ *Multiple Orders Found*

You have multiple orders registered. Which order would you like to cancel?

${list}

_To cancel any specific order above, copy and reply with the command shown below it!_`,
        intent: "ORDER_CANCELLATION",
        escalatedToHuman: false,
      };
    }

    const order = orderResult.order || orderResult.multiple?.[0];
    const status = String(order.status || "Processing").toLowerCase();

    if (status === "cancelled" || status.includes("cancel")) {
      return {
        replyText: formatAlreadyCancelledMessage(order, profileName),
        intent: "ORDER_CANCELLATION",
        escalatedToHuman: false,
      };
    }

    if (status.includes("delivered")) {
      return {
        replyText: formatDeliveredCannotCancelMessage(order, profileName),
        intent: "ORDER_CANCELLATION",
        escalatedToHuman: false,
      };
    }

    if (status.includes("shipped") || status.includes("transit") || status.includes("out for delivery")) {
      return {
        replyText: formatDoorstepRefusalMessage(order, profileName),
        intent: "ORDER_CANCELLATION",
        escalatedToHuman: false,
      };
    }

    // Pre-dispatch unshipped order -> Prompt confirmation
    return {
      replyText: formatCancellationPrompt(order, profileName),
      intent: "ORDER_CANCELLATION",
      escalatedToHuman: false,
    };
  }

  // ==========================================
  // 2. ORDER TRACKING INTENT
  // ==========================================
  const isTracking =
    query === "1" ||
    query.includes("track") ||
    query.includes("order") ||
    query.includes("where is my") ||
    query.includes("parcel") ||
    query.includes("delivery") ||
    query.includes("kab aayega") ||
    query.includes("kaha hai") ||
    /PYR-ORD|ORD-\d+|\b\d{6}\b/i.test(query);

  if (isTracking) {
    const orderResult = await findOrdersForCustomer(rawQuery, from);

    if (orderResult.found) {
      if (orderResult.multiple && orderResult.multiple.length > 1) {
        const reply = await formatMultipleOrdersMessage(orderResult.multiple, profileName);
        return { replyText: reply, intent: "ORDER_TRACKING", escalatedToHuman: false };
      }
      if (orderResult.order) {
        const reply = await formatOrderStatusMessage(orderResult.order, profileName);
        return { replyText: reply, intent: "ORDER_TRACKING", escalatedToHuman: false };
      }
    }

    // Order not immediately found
    const notFoundMsg = `📦 *Pure Ayur Herbs - Order Tracking*

I couldn't locate an active order automatically for your number (+91 ${from.slice(-10)}).

To help me find your package, please reply with your **Order ID** (e.g. *PYR-ORD-123456*) or the phone number used during checkout.

You can also track anytime directly on our website:
🔗 https://www.purreayurherbs.com/track

Need help from our shipping desk? Reply *Support*.`;

    return { replyText: notFoundMsg, intent: "ORDER_TRACKING", escalatedToHuman: false };
  }

  // ==========================================
  // 3. HUMAN HANDOFF & DOCTOR CONSULTATION
  // ==========================================
  const isHumanHandoff =
    query === "5" ||
    query.includes("doctor") ||
    query.includes("vaidya") ||
    query.includes("human") ||
    query.includes("agent") ||
    query.includes("support") ||
    query.includes("baat karni") ||
    query.includes("call me") ||
    query.includes("complaint");

  if (isHumanHandoff) {
    const supportMsg = `🩺 *Ayurvedic Vaidya & Customer Support Desk*

Namaste ${profileName || "Ji"}! Your request has been marked for priority attention.

👨‍⚕️ Our certified Ayurvedic Vaidya and support team have received your details. A representative will connect with you right here on WhatsApp or via call shortly.

⏰ *Consultation Hours:* Mon – Sat, 10:00 AM – 7:00 PM IST
📞 *Direct Support Helpline:* +91 72478 24101
✉️ *Email Desk:* info@pureayurherbs.com

In the meantime, feel free to describe any specific symptoms or questions you have. We are here to help! 🙏`;

    return { replyText: supportMsg, intent: "HUMAN_HANDOFF", escalatedToHuman: true };
  }

  // ==========================================
  // 4. LIVE PRODUCT CATALOG INTENT
  // ==========================================
  const isCatalog =
    query === "4" ||
    query === "catalog" ||
    query === "products" ||
    query === "product" ||
    query === "rate" ||
    query === "price" ||
    query === "prices" ||
    query.includes("price list") ||
    query.includes("rate list") ||
    query.includes("kya kya") ||
    query.includes("all products") ||
    query.includes("store") ||
    query.includes("dawa") ||
    query.includes("dawai") ||
    query.includes("list") ||
    query.includes("items") ||
    query.includes("product list");

  if (isCatalog) {
    const catalogMsg = `🌿 *Pure Ayur Herbs - Available Products & Price List* 🌿

All formulations are 100% Ministry of AYUSH Certified:

1️⃣ *${virjaPowder.name}* (₹${virjaPowder.price})
👉 ${virjaPowder.concern.split("/")[0].trim()}
🔗 ${virjaPowder.link}

2️⃣ *${virjaMajun.name}* (₹${virjaMajun.price})
👉 ${virjaMajun.concern.split("/")[0].trim()}
🔗 ${virjaMajun.link}

3️⃣ *${madhunashiPowder.name}* (₹${madhunashiPowder.price})
👉 ${madhunashiPowder.concern.split("/")[0].trim()}
🔗 ${madhunashiPowder.link}

4️⃣ *${madhunashiSyp.name}* (₹${madhunashiSyp.price})
👉 ${madhunashiSyp.concern.split("/")[0].trim()}
🔗 ${madhunashiSyp.link}

5️⃣ *${fatBurner.name}* (₹${fatBurner.price})
👉 ${fatBurner.concern.split("/")[0].trim()}
🔗 ${fatBurner.link}

6️⃣ *${perfect36.name}* (₹${perfect36.price})
👉 ${perfect36.concern.split("/")[0].trim()}
🔗 ${perfect36.link}

🚚 *Free Priority Shipping Across India | Cash on Delivery (COD) Available*
🌐 Browse full store: https://www.purreayurherbs.com

_💡 Reply with any product name (e.g. *Virja* or *Madhunashi*) for benefits and dosage!_`;

    return { replyText: catalogMsg, intent: "CATALOG", escalatedToHuman: false };
  }

  // ==========================================
  // 5. DOSAGE & USAGE GUIDE INTENT
  // ==========================================
  const isDosage =
    query === "3" ||
    query.includes("dosage") ||
    query.includes("how to use") ||
    query.includes("kaise khana") ||
    query.includes("kaise lena") ||
    query.includes("kab pina") ||
    query.includes("kaise use") ||
    query.includes("dudh ke sath") ||
    query.includes("paani ke sath");

  if (isDosage) {
    // Check specific product mentioned in dosage query
    if (query.includes("virja") || query.includes("stamina") || query.includes("powder") || query.includes("majun")) {
      return {
        replyText: `🌿 *How to Take Virja Formulations for Men's Stamina*

⚡ *1. ${virjaPowder.name}:*
🥄 *Dosage:* 1 teaspoon (approx. 3g – 5g).
🥛 *How to take:* Mix in a cup of lukewarm milk or water.
⏰ *Time:* Twice daily — morning after breakfast and 30 minutes before bedtime.

🍯 *2. ${virjaMajun.name}:*
🥄 *Dosage:* 5g to 10g (approx. 1 small spoon).
🥛 *How to take:* Consume directly followed by a glass of warm milk.
⏰ *Time:* At night before sleep.

🔗 Order Virja Powder:
${virjaPowder.link}

🔗 Order Virja Gold Majun:
${virjaMajun.link}`,
        intent: "DOSAGE_GUIDE",
        escalatedToHuman: false,
      };
    }

    if (query.includes("madhunashi") || query.includes("sugar") || query.includes("diabetes") || query.includes("karela")) {
      return {
        replyText: `🩸 *How to Take Madhunashi for Blood Sugar Balance*

🌿 *1. ${madhunashiPowder.name}:*
🥄 *Dosage:* 1 teaspoon (approx. 3g – 5g).
💧 *How to take:* Mix in half a glass of lukewarm water.
⏰ *Time:* Twice daily — 30 minutes before breakfast & 30 minutes before dinner.

🍶 *2. ${madhunashiSyp.name}:*
🥄 *Dosage:* 10ml to 15ml.
💧 *How to take:* Dilute with equal quantity of water.
⏰ *Time:* Twice daily — 30 minutes before meals.

🌱 *Ayurvedic Tip:* Use regularly for 90 days alongside a balanced low-glycemic diet.

🔗 Order Madhunashi Powder:
${madhunashiPowder.link}

🔗 Order Madhunashi Syrup:
${madhunashiSyp.link}`,
        intent: "DOSAGE_GUIDE",
        escalatedToHuman: false,
      };
    }

    if (query.includes("fat") || query.includes("burner") || query.includes("slim") || query.includes("motapa") || query.includes("weight")) {
      return {
        replyText: `🔥 *How to Take ${fatBurner.name} (Slim Tonic)*

🥄 *Dosage:* 20ml – 30ml tonic.
💧 *How to take:* Mix thoroughly in a glass of warm water.
⏰ *Best time:*
1. Early morning on an empty stomach (30 mins before breakfast).
2. In the evening (30 mins before dinner or post-workout).
🌱 *Tip:* Stay hydrated and combine with light daily exercise for fastest fat loss results.

🔗 Order Fat Burner Tonic:
${fatBurner.link}`,
        intent: "DOSAGE_GUIDE",
        escalatedToHuman: false,
      };
    }

    if (query.includes("cream") || query.includes("perfect 36") || query.includes("perfect") || query.includes("toning")) {
      return {
        replyText: `🌸 *How to Apply ${perfect36.name}*

💆 *Application:* Take sufficient cream on fingertips.
🔄 *Method:* Massage gently in upward, circular motions for 5–10 minutes until completely absorbed into the skin.
⏰ *Frequency:* Apply twice daily — morning after bath and at night before sleeping.
⚠️ *Note:* 100% Ayurvedic, safe, no side effects. For external use only.

🔗 Order Perfect 36 Cream:
${perfect36.link}`,
        intent: "DOSAGE_GUIDE",
        escalatedToHuman: false,
      };
    }

    // General Dosage Menu
    return {
      replyText: `📋 *Pure Ayur Herbs - Quick Dosage & Usage Guide*

1. *Virja Powder:* 1 tsp (3-5g) twice daily in warm milk after meals.
2. *Virja Gold Majun:* 5-10g with warm milk at night before bedtime.
3. *Madhunashi Powder:* 1 tsp (3-5g) in warm water 30 mins before meals.
4. *Madhunashi Syrup:* 10-15ml with water 30 mins before meals.
5. *Fat Burner Tonic:* 20-30ml in warm water morning empty stomach & evening.
6. *Perfect 36 Cream:* Massage gently upwards twice daily (morning & night).

_Which remedy would you like more details on? Just reply with its name!_`,
      intent: "DOSAGE_GUIDE",
      escalatedToHuman: false,
    };
  }

  // ==========================================
  // 6. HEALTH CONCERN & PRODUCT RECOMMENDATIONS
  // ==========================================
  if (query === "2" || query === "consult" || query === "recommend" || query === "remedy") {
    return {
      replyText: `🌿 *Pure Ayur Herbs - Ayurvedic Remedy Finder*

Namaste ${profileName || "Ji"}! Which health goal or concern would you like help with?

1️⃣ *Men's Vitality, Power & Stamina* — Virja Powder & Virja Gold Majun
2️⃣ *Blood Sugar & Diabetes* — Madhunashi Powder & Madhunashi Syrup
3️⃣ *Weight Loss & Metabolism* — Fat Burner Slim Tonic
4️⃣ *Women's Health & Toning* — Perfect 36 Cream

_💡 Reply with your concern (e.g. *Virja*, *Stamina*, *Sugar*, *Weight Loss*, *Toning*) or describe your symptoms!_`,
      intent: "CONSULTATION_MENU",
      escalatedToHuman: false,
    };
  }

  // Check Stamina / Virja / Power / Weakness / Shilajit / Ashwagandha
  if (
    query.includes("virja") ||
    query.includes("stamina") ||
    query.includes("energy") ||
    query.includes("power") ||
    query.includes("weakness") ||
    query.includes("vitality") ||
    query.includes("testosterone") ||
    query.includes("thakan") ||
    query.includes("shakti") ||
    query.includes("kamjori") ||
    query.includes("kamzori") ||
    query.includes("majun") ||
    query.includes("shilajit") ||
    query.includes("ashwagandha") ||
    query.includes("resin")
  ) {
    return {
      replyText: `⚡ *Ayurvedic Recommendation for Men's Power, Stamina & Vitality*

Pure Ayur Herbs offers two clinical-grade Ayurvedic formulations for men:

🌿 *1. ${virjaPowder.name}*
*Price:* ₹${virjaPowder.price} ~₹${virjaPowder.compareAt}~ (${virjaPowder.rating})
*Key Herbs:* ${virjaPowder.ingredients}
✨ *Why it helps:* ${virjaPowder.benefits}
🥄 *Dosage:* ${virjaPowder.dosage}
🛒 *Order Virja Powder:*
${virjaPowder.link}

🍯 *2. ${virjaMajun.name}*
*Price:* ₹${virjaMajun.price} ~₹${virjaMajun.compareAt}~ (${virjaMajun.rating})
*Key Herbs:* ${virjaMajun.ingredients}
✨ *Why it helps:* ${virjaMajun.benefits}
🥄 *Dosage:* ${virjaMajun.dosage}
🛒 *Order Virja Gold Majun:*
${virjaMajun.link}

🚚 *Free Shipping Across India + Cash on Delivery (COD) Available!*`,
      intent: "RECOMMENDATION",
      escalatedToHuman: false,
    };
  }

  // Check Sugar / Diabetes / Madhunashi
  if (
    query.includes("madhunashi") ||
    query.includes("sugar") ||
    query.includes("diabetes") ||
    query.includes("madhumeha") ||
    query.includes("glucose") ||
    query.includes("karela") ||
    query.includes("jamun") ||
    query.includes("gudmar")
  ) {
    return {
      replyText: `🩸 *Ayurvedic Recommendation for Healthy Blood Sugar Balance*

Pure Ayur Herbs offers time-tested formulations for natural diabetes & glucose control:

🌿 *1. ${madhunashiPowder.name}*
*Price:* ₹${madhunashiPowder.price} ~₹${madhunashiPowder.compareAt}~ (${madhunashiPowder.rating})
*Key Herbs:* ${madhunashiPowder.ingredients}
✨ *Why it helps:* ${madhunashiPowder.benefits}
🥄 *Dosage:* ${madhunashiPowder.dosage}
🛒 *Order Madhunashi Powder:*
${madhunashiPowder.link}

🍶 *2. ${madhunashiSyp.name}*
*Price:* ₹${madhunashiSyp.price} ~₹${madhunashiSyp.compareAt}~ (${madhunashiSyp.rating})
*Key Herbs:* ${madhunashiSyp.ingredients}
✨ *Why it helps:* ${madhunashiSyp.benefits}
🥄 *Dosage:* ${madhunashiSyp.dosage}
🛒 *Order Madhunashi Syrup:*
${madhunashiSyp.link}

🚚 *Free Priority Shipping Across India + Cash on Delivery (COD) Available!*`,
      intent: "RECOMMENDATION",
      escalatedToHuman: false,
    };
  }

  // Check Weight Loss / Fat Burner / Slim / Gym
  if (
    query.includes("fat") ||
    query.includes("burner") ||
    query.includes("weight") ||
    query.includes("slim") ||
    query.includes("motapa") ||
    query.includes("pet") ||
    query.includes("gym") ||
    query.includes("fitness") ||
    query.includes("detox") ||
    query.includes("metabolism")
  ) {
    const p = fatBurner;
    return {
      replyText: `🔥 *Ayurvedic Recommendation for Weight Management & Metabolism*

*Product:* ${p.name}
*Price:* ₹${p.price} ~₹${p.compareAt}~ (${p.rating})
*Key Herbs:* ${p.ingredients}

✨ *Why it helps:*
${p.benefits}

🥄 *Dosage:*
${p.dosage}

🛒 *Order Online (Free Delivery + COD Available):*
${p.link}`,
      intent: "RECOMMENDATION",
      escalatedToHuman: false,
    };
  }

  // Check Women's Health / Toning / Perfect 36
  if (
    query.includes("perfect") ||
    query.includes("36") ||
    query.includes("cream") ||
    query.includes("toning") ||
    query.includes("women") ||
    query.includes("firmness") ||
    query.includes("tightening") ||
    query.includes("breast")
  ) {
    const p = perfect36;
    return {
      replyText: `🌸 *Ayurvedic Recommendation for Women's Body Toning*

*Product:* ${p.name}
*Price:* ₹${p.price} ~₹${p.compareAt}~ (${p.rating})
*Key Herbs:* ${p.ingredients}

✨ *Why it helps:*
${p.benefits}

💆 *How to apply:*
${p.dosage}

🛒 *Order Online (Free Delivery + COD Available):*
${p.link}`,
      intent: "RECOMMENDATION",
      escalatedToHuman: false,
    };
  }

  // ==========================================
  // 7. COMPLEX / FREE-FORM QUERY: GEMINI AI
  // ==========================================
  const geminiResponse = await callGeminiAI(rawQuery, profileName, catalog);
  if (geminiResponse) {
    return {
      replyText: geminiResponse,
      intent: "AI_GENERATED",
      escalatedToHuman: false,
    };
  }

  // ==========================================
  // 8. DEFAULT HELPFUL FALLBACK
  // ==========================================
  const fallbackMsg = `Namaste ${profileName || "Ji"}! 🙏

Thank you for contacting Pure Ayur Herbs.

To help you quickly, please choose from below:
1️⃣ Reply *1* to **Track an existing Order**
2️⃣ Reply *2* for **Remedy Recommendations** (Virja, Madhunashi, Fat Burner, Perfect 36)
3️⃣ Reply *3* for **Dosage & Usage Instructions**
4️⃣ Reply *4* for **Full Product Catalog & Prices**
5️⃣ Reply *5* or *Support* to **Talk with our Ayurvedic Doctor**

You can also browse our 100% AYUSH Certified store:
🌐 https://www.purreayurherbs.com`;

  return {
    replyText: fallbackMsg,
    intent: "FALLBACK",
    escalatedToHuman: false,
  };
}
