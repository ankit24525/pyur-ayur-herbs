import { findOrdersForCustomer, formatOrderStatusMessage } from "./chatbot-orders";

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

// Full Ayurvedic Product Knowledge Base
export const AYURVEDIC_CATALOG = [
  {
    name: "Pure Himalayan Shilajit Gold Resin (50g)",
    slug: "pure-himalayan-shilajit-gold-resin-50g",
    price: 1499,
    compareAt: 2499,
    rating: "4.9 ⭐",
    concern: "Stamina, Energy, Vitality, Strength & Libido",
    ingredients: "Pure Himalayan Shilajit (18,000+ ft Shodhana purified), 24K Gold Bhasma, Ashwagandha, Gokshura",
    dosage: "Take a pea-sized amount (250mg - 500mg) using the spoon provided. Dissolve in a cup of lukewarm milk or water. Consume once or twice daily, ideally on an empty stomach in the morning or 30 minutes before bedtime.",
    benefits: "Boosts physical strength, cellular ATP energy, testosterone, immunity, and mental focus naturally.",
    link: "https://pureayurherbs.com/products/pure-himalayan-shilajit-gold-resin-50g",
  },
  {
    name: "Sugar Care Balance Ayurvedic Juice (1L)",
    slug: "sugar-care-balance-ayurvedic-juice-1l",
    price: 599,
    compareAt: 899,
    rating: "4.8 ⭐",
    concern: "Diabetes, High Blood Sugar, Sweet Cravings",
    ingredients: "Karela (Bitter Gourd), Jamun Seed, Gurmar (Gymnema Sylvestre - 'Sugar Destroyer'), Vijaysar, Methi",
    dosage: "Mix 30ml of Sugar Care Juice in a glass of lukewarm water (100ml). Consume twice daily — 30 minutes before breakfast and 30 minutes before dinner.",
    benefits: "Supports natural insulin sensitivity, activates pancreas beta-cells, regulates fasting blood glucose levels, and curbs sweet cravings.",
    link: "https://pureayurherbs.com/products/sugar-care-balance-ayurvedic-juice-1l",
  },
  {
    name: "Kesar Saffron Hair Growth Elixir Oil (200ml)",
    slug: "kesar-saffron-hair-growth-elixir-oil-200ml",
    price: 799,
    compareAt: 1199,
    rating: "4.9 ⭐",
    concern: "Hair Fall, Thinning, Dandruff & Scalp Regrowth",
    ingredients: "Authentic Kashmiri Saffron (Kesar), Bhringraj, Amla, Cold-pressed Sesame Oil, Rosemary Extract",
    dosage: "Apply 5-10ml directly onto scalp using fingertips. Gently massage in circular motions for 5–10 minutes. Leave overnight or for at least 2 hours before washing with mild herbal shampoo. Use 3 times weekly.",
    benefits: "Stimulates dormant hair follicles, blocks DHT on scalp, stops excessive shedding, and promotes thick, voluminous hair growth.",
    link: "https://pureayurherbs.com/products/kesar-saffron-hair-growth-elixir-oil-200ml",
  },
  {
    name: "Ayurvedic Liver Detox & Cleanse Tonic (500ml)",
    slug: "ayurvedic-liver-detox-cleanse-tonic-500ml",
    price: 499,
    compareAt: 699,
    rating: "4.7 ⭐",
    concern: "Fatty Liver, Digestion, Sluggish Metabolism & Alcohol Detox",
    ingredients: "Bhumyamalaki, Punarnava, Kalmegh, Kutki, Kasani (Chicory)",
    dosage: "Take 15ml - 20ml diluted in half a glass of normal water twice daily, 30 minutes after meals.",
    benefits: "Flushes out accumulated hepatic toxins, reduces liver enzymes (SGOT/SGPT), improves bile secretion, and alleviates abdominal bloating.",
    link: "https://pureayurherbs.com/products/ayurvedic-liver-detox-cleanse-tonic-500ml",
  },
  {
    name: "Ashwagandha KSM-66 Gold Capsules (60s)",
    slug: "ashwagandha-ksm-66-gold-capsules-60s",
    price: 699,
    compareAt: 999,
    rating: "4.9 ⭐",
    concern: "Gym & Fitness, Muscle Strength, Stress, Cortisol & Deep Sleep",
    ingredients: "KSM-66 Standardized Ashwagandha Root Extract (500mg, highest concentration full-spectrum) + BioPerine Black Pepper",
    dosage: "Take 1 capsule twice daily with warm water or milk after breakfast and dinner.",
    benefits: "Clinically proven to reduce cortisol (stress hormone) by 27.9%, boost muscle recovery, improve endurance, and induce deep restful sleep.",
    link: "https://pureayurherbs.com/products/ashwagandha-ksm-66-gold-capsules-60s",
  },
  {
    name: "Organic Triphala Digestive Care Juice (1L)",
    slug: "organic-triphala-digestive-care-juice-1l",
    price: 399,
    compareAt: 599,
    rating: "4.8 ⭐",
    concern: "Constipation (Kabz), Acidity, Gas, Gut Cleansing & Bloating",
    ingredients: "Cold-pressed Amla (Indian Gooseberry), Haritaki (Chebulic Myrobalan), Bibhitaki (Belliric Myrobalan)",
    dosage: "Mix 30ml with a glass of lukewarm water and drink at bedtime or early morning on empty stomach.",
    benefits: "Gently cleanses the colon, regulates regular morning bowel movements without cramps, relieves chronic constipation, and balances gut flora.",
    link: "https://pureayurherbs.com/products/organic-triphala-digestive-care-juice-1l",
  },
];

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
async function callGeminiAI(userQuery: string, customerName: string): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return null;

  try {
    const systemPrompt = `You are "Dr. Ayur", the friendly, knowledgeable, certified Chief Ayurvedic Vaidya and Support Assistant for "Pure Ayur Herbs" (https://pureayurherbs.com).
Company background:
- 100% Ministry of AYUSH Certified Ayurvedic wellness brand based in India.
- Free shipping across India on prepaid & COD orders.
- Fast 2–4 business days priority delivery.
- Cash on Delivery (COD) and PhonePe prepaid available.
- 7-Day return policy for unsealed items.
Our Product Catalog:
${AYURVEDIC_CATALOG.map(
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

  // ==========================================
  // 1. GREETINGS & MAIN MENU
  // ==========================================
  const isGreeting =
    /^(hi|hello|hey|namaste|pranam|start|menu|help|options|kya hal|halo|hlo|shuru)\b/i.test(query) ||
    query.length === 0;

  if (isGreeting && !query.includes("order") && !query.includes("track")) {
    const greetingMsg = `*Namaste ${profileName || "Ji"}! 🙏 Welcome to Pure Ayur Herbs.*

I am your 24/7 Ayurvedic Wellness Assistant. How may I assist your health journey today?

1️⃣ *Track My Order* — Real-time shipment status & tracking link
2️⃣ *Ayurvedic Consultation* — Find the right herb for your health concern
3️⃣ *Product Usage & Dosage* — How & when to consume Shilajit, juices & oils
4️⃣ *Talk to Vaidya / Support* — Connect with our senior Ayurvedic specialist

_💡 Simply reply with *1*, *2*, *3*, *4* or type any question in Hindi, English, or Hinglish!_`;

    return { replyText: greetingMsg, intent: "GREETING", escalatedToHuman: false };
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

    if (orderResult.found && orderResult.order) {
      const reply = await formatOrderStatusMessage(orderResult.order, profileName);
      return { replyText: reply, intent: "ORDER_TRACKING", escalatedToHuman: false };
    }

    // Order not immediately found
    const notFoundMsg = `📦 *Pure Ayur Herbs - Order Tracking*

I couldn't locate an active order automatically for your number (+91 ${from.slice(-10)}).

To help me find your package, please reply with your **Order ID** (e.g. *PYR-ORD-123456*) or the phone number used during checkout.

You can also track anytime directly on our website:
🔗 https://pureayurherbs.com/track

Need help from our shipping desk? Reply *Support*.`;

    return { replyText: notFoundMsg, intent: "ORDER_TRACKING", escalatedToHuman: false };
  }

  // ==========================================
  // 3. HUMAN HANDOFF & DOCTOR CONSULTATION
  // ==========================================
  const isHumanHandoff =
    query === "4" ||
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
  // 4. DOSAGE & USAGE GUIDE INTENT
  // ==========================================
  const isDosage =
    query === "3" ||
    query.includes("dosage") ||
    query.includes("how to use") ||
    query.includes("kaise khana") ||
    query.includes("kaise lena") ||
    query.includes("kab pina") ||
    query.includes("kaise use") ||
    query.includes("time") ||
    query.includes("milk") ||
    query.includes("dudh");

  if (isDosage) {
    // Check specific product mentioned
    if (query.includes("shilajit")) {
      const p = AYURVEDIC_CATALOG[0];
      return {
        replyText: `🌿 *How to Take ${p.name}*

🥄 *Dosage:* Pea-sized amount (250mg – 500mg) once or twice daily.
🥛 *How to consume:* Dissolve completely in a cup of lukewarm milk or warm water.
⏰ *Best time:* In the morning on an empty stomach for all-day energy, or 30 minutes before bedtime.
⚠️ *Note:* Avoid mixing with cold water or carbonated drinks.

🔗 Order Pure Himalayan Shilajit:
${p.link}`,
        intent: "DOSAGE_GUIDE",
        escalatedToHuman: false,
      };
    }

    if (query.includes("sugar") || query.includes("karela") || query.includes("jamun")) {
      const p = AYURVEDIC_CATALOG[1];
      return {
        replyText: `🌿 *How to Take ${p.name}*

🥄 *Dosage:* Mix 30ml of juice in 100ml lukewarm water.
⏰ *Best time:* Twice daily — 30 minutes before breakfast & 30 minutes before dinner.
🌱 *Diet Tip:* For best blood glucose control, drink consistently for 90 days alongside balanced meals.

🔗 Order Sugar Care Balance Juice:
${p.link}`,
        intent: "DOSAGE_GUIDE",
        escalatedToHuman: false,
      };
    }

    if (query.includes("hair") || query.includes("oil") || query.includes("kesar")) {
      const p = AYURVEDIC_CATALOG[2];
      return {
        replyText: `🌿 *How to Apply ${p.name}*

💆 *Application:* Take 5-10ml oil on your palms and massage gently onto scalp using circular motions for 5–10 minutes.
⏰ *Best time:* Apply at night before sleeping, leave overnight, and wash in the morning with a mild herbal shampoo.
📅 *Frequency:* Use 2 to 3 times a week for visible regrowth and reduced hair fall within 4–6 weeks.

🔗 Order Kesar Saffron Hair Elixir:
${p.link}`,
        intent: "DOSAGE_GUIDE",
        escalatedToHuman: false,
      };
    }

    // General Dosage Menu
    return {
      replyText: `📋 *Pure Ayur Herbs - Quick Dosage Guide*

1. *Shilajit Gold Resin:* Pea-sized (300mg) in warm milk every morning.
2. *Sugar Care Juice:* 30ml in 100ml warm water 30 mins before meals.
3. *Hair Growth Oil:* Massage scalp 3x weekly, leave overnight.
4. *Liver Detox Tonic:* 20ml diluted in water twice daily after meals.
5. *Ashwagandha KSM-66:* 1 capsule twice daily with milk after meals.
6. *Triphala Juice:* 30ml with lukewarm water at bedtime.

_Which remedy would you like more details on? Just type its name!_`,
      intent: "DOSAGE_GUIDE",
      escalatedToHuman: false,
    };
  }

  // ==========================================
  // 5. HEALTH CONCERN & PRODUCT RECOMMENDATIONS
  // ==========================================
  // Check Stamina / Shilajit
  if (
    query.includes("stamina") ||
    query.includes("energy") ||
    query.includes("shilajit") ||
    query.includes("weakness") ||
    query.includes("vitality") ||
    query.includes("testosterone") ||
    query.includes("thakan") ||
    query.includes("shakti")
  ) {
    const p = AYURVEDIC_CATALOG[0];
    return {
      replyText: `⚡ *Ayurvedic Recommendation for Energy & Vitality*

*Product:* ${p.name}
*Price:* ₹${p.price} ~₹${p.compareAt}~ (${p.rating})
*Key Herbs:* ${p.ingredients}

✨ *Why it helps:*
${p.benefits}

🥄 *Dosage:* ${p.dosage}

🛒 *Order Online (Free Delivery + COD Available):*
${p.link}`,
      intent: "RECOMMENDATION",
      escalatedToHuman: false,
    };
  }

  // Check Sugar / Diabetes
  if (
    query.includes("sugar") ||
    query.includes("diabetes") ||
    query.includes("madhumeha") ||
    query.includes("glucose") ||
    query.includes("karela") ||
    query.includes("jamun")
  ) {
    const p = AYURVEDIC_CATALOG[1];
    return {
      replyText: `🩸 *Ayurvedic Recommendation for Healthy Blood Sugar*

*Product:* ${p.name}
*Price:* ₹${p.price} ~₹${p.compareAt}~ (${p.rating})
*Key Herbs:* ${p.ingredients}

✨ *Why it helps:*
${p.benefits}

🥄 *Dosage:* ${p.dosage}

🛒 *Order Online (Free Delivery + COD Available):*
${p.link}`,
      intent: "RECOMMENDATION",
      escalatedToHuman: false,
    };
  }

  // Check Hair Fall
  if (
    query.includes("hair") ||
    query.includes("baal") ||
    query.includes("dandruff") ||
    query.includes("bald") ||
    query.includes("jhadna") ||
    query.includes("oil")
  ) {
    const p = AYURVEDIC_CATALOG[2];
    return {
      replyText: `💇 *Ayurvedic Recommendation for Hair Fall & Regrowth*

*Product:* ${p.name}
*Price:* ₹${p.price} ~₹${p.compareAt}~ (${p.rating})
*Key Herbs:* ${p.ingredients}

✨ *Why it helps:*
${p.benefits}

💆 *How to apply:* ${p.dosage}

🛒 *Order Online (Free Delivery + COD Available):*
${p.link}`,
      intent: "RECOMMENDATION",
      escalatedToHuman: false,
    };
  }

  // Check Liver
  if (
    query.includes("liver") ||
    query.includes("fatty") ||
    query.includes("jaundice") ||
    query.includes("piliya") ||
    query.includes("detox") ||
    query.includes("alcohol")
  ) {
    const p = AYURVEDIC_CATALOG[3];
    return {
      replyText: `🌿 *Ayurvedic Recommendation for Liver Health*

*Product:* ${p.name}
*Price:* ₹${p.price} ~₹${p.compareAt}~ (${p.rating})
*Key Herbs:* ${p.ingredients}

✨ *Why it helps:*
${p.benefits}

🥄 *Dosage:* ${p.dosage}

🛒 *Order Online (Free Delivery + COD Available):*
${p.link}`,
      intent: "RECOMMENDATION",
      escalatedToHuman: false,
    };
  }

  // Check Fitness / Gym / Stress / Sleep
  if (
    query.includes("gym") ||
    query.includes("fitness") ||
    query.includes("ashwagandha") ||
    query.includes("stress") ||
    query.includes("sleep") ||
    query.includes("neend") ||
    query.includes("tension")
  ) {
    const p = AYURVEDIC_CATALOG[4];
    return {
      replyText: `💪 *Ayurvedic Recommendation for Fitness & Stress Relief*

*Product:* ${p.name}
*Price:* ₹${p.price} ~₹${p.compareAt}~ (${p.rating})
*Key Herbs:* ${p.ingredients}

✨ *Why it helps:*
${p.benefits}

💊 *Dosage:* ${p.dosage}

🛒 *Order Online (Free Delivery + COD Available):*
${p.link}`,
      intent: "RECOMMENDATION",
      escalatedToHuman: false,
    };
  }

  // Check Constipation / Digestion / Gas
  if (
    query.includes("digestion") ||
    query.includes("constipation") ||
    query.includes("kabz") ||
    query.includes("pet") ||
    query.includes("gas") ||
    query.includes("acidity") ||
    query.includes("triphala")
  ) {
    const p = AYURVEDIC_CATALOG[5];
    return {
      replyText: `🌱 *Ayurvedic Recommendation for Digestion & Gut Health*

*Product:* ${p.name}
*Price:* ₹${p.price} ~₹${p.compareAt}~ (${p.rating})
*Key Herbs:* ${p.ingredients}

✨ *Why it helps:*
${p.benefits}

🥄 *Dosage:* ${p.dosage}

🛒 *Order Online (Free Delivery + COD Available):*
${p.link}`,
      intent: "RECOMMENDATION",
      escalatedToHuman: false,
    };
  }

  // ==========================================
  // 6. COMPLEX / FREE-FORM QUERY: GEMINI AI
  // ==========================================
  const geminiResponse = await callGeminiAI(rawQuery, profileName);
  if (geminiResponse) {
    return {
      replyText: geminiResponse,
      intent: "AI_GENERATED",
      escalatedToHuman: false,
    };
  }

  // ==========================================
  // 7. DEFAULT HELPFUL FALLBACK
  // ==========================================
  const fallbackMsg = `Namaste ${profileName || "Ji"}! 🙏

Thank you for contacting Pure Ayur Herbs.

To help you quickly, please choose from below:
1️⃣ Reply *1* to **Track an existing Order**
2️⃣ Reply *2* for **Product Recommendations** (Stamina, Diabetes, Hair, Liver, Digestion)
3️⃣ Reply *3* for **Dosage & Usage Instructions**
4️⃣ Reply *Support* to **Talk with our Ayurvedic Doctor**

You can also browse our 100% AYUSH Certified store:
🌐 https://pureayurherbs.com`;

  return {
    replyText: fallbackMsg,
    intent: "FALLBACK",
    escalatedToHuman: false,
  };
}
