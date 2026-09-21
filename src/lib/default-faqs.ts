export interface StoreFaq {
  question: string;
  answer: string;
  category?: string;
}

export const defaultFaqs: StoreFaq[] = [
  {
    question: "How to login into my account?",
    answer:
      "Click on the Account icon on the top right navigation bar. Enter your registered mobile number or email to receive an instant OTP, verify it, and you will be logged into your account dashboard.",
    category: "Account & Orders",
  },
  {
    question: "What products does Pure Ayur Herbs offer?",
    answer:
      "Pure Ayur Herbs provides 100% AYUSH-certified classical and proprietary Ayurvedic formulations, including Virja Powder & Gold Majun for men's wellness and vitality, Madhunashi Powder & Syrup for blood sugar management, Ayurvedic Fat Burner for healthy weight support, and herbal skincare solutions.",
    category: "Products & Ayurveda",
  },
  {
    question: "Are Pure Ayur Herbs products suitable for vegetarians/vegans?",
    answer:
      "Yes! All our powders, tonics, and natural herbal formulations are 100% vegetarian, plant-based, and crafted from ethically sourced herbs without harmful chemical additives or animal by-products.",
    category: "Products & Ayurveda",
  },
  {
    question: "How much time does Ayurveda take to show benefits?",
    answer:
      "Ayurveda works at the root cause of ailments. While subtle improvements in digestion and energy are often felt within 1 to 2 weeks, consistent use for 60 to 90 days alongside a balanced diet (Ahara) and lifestyle (Vihara) is recommended for long-lasting, transformative results.",
    category: "Products & Ayurveda",
  },
  {
    question: "How can I find more information about ingredients?",
    answer:
      "Every product page features a detailed 'Key Ayurvedic Ingredients' section outlining the herbs used, their botanical names, and their classical Ayurvedic actions (Karma). You can also reach out to our certified Ayurvedic Vaidyas on WhatsApp for personalized consultations.",
    category: "Products & Ayurveda",
  },
  {
    question: "How to collaborate with Pure Ayur Herbs?",
    answer:
      "We welcome partnerships with certified Ayurvedic practitioners, wellness clinics, distribution partners, and health advocates. Please email us at info@pureayurherbs.com or reach out via WhatsApp with your proposal.",
    category: "General",
  },
  {
    question: "How do I use a coupon code?",
    answer:
      "You can apply your discount coupon code at checkout in the 'Have a coupon code?' field. The discount will be immediately calculated and deducted from your total payable amount before payment.",
    category: "Payments & Offers",
  },
  {
    question: "I am unable to make the payment",
    answer:
      "If your payment fails or gets stuck, check your internet connectivity or try an alternative payment method such as UPI, Cards, Net Banking, or Cash on Delivery (COD). If the amount was deducted from your bank, it is usually refunded automatically within 3–5 business days. You can also contact our support on WhatsApp for instant assistance.",
    category: "Payments & Offers",
  },
  {
    question: "Can diabetic patients take Madhunashi Powder & Syrup?",
    answer:
      "Yes, Madhunashi is specially formulated with Gudmar, Karela, and Jamun to help support healthy blood sugar balance naturally and is safe for daily use.",
    category: "Products & Ayurveda",
  },
  {
    question: "How to consume Virja Powder & Majun?",
    answer:
      "Take 1 teaspoon of Virja Powder with warm milk or water in the morning, and 5-10g of Virja Gold Majun with warm milk before bedtime, or as directed by your Ayurvedic physician.",
    category: "Products & Ayurveda",
  },
  {
    question: "How long does delivery take?",
    answer:
      "All orders are dispatched within 24 hours. Metro deliveries typically arrive within 2–3 business days, while other locations take 3–5 business days. Tracking details are sent via SMS and WhatsApp as soon as your package ships.",
    category: "Account & Orders",
  },
  {
    question: "What is your return and refund policy?",
    answer:
      "We take great pride in our authentic Ayurvedic remedies. If your order arrives damaged, defective, or incorrect, notify us within 48 hours of delivery for a hassle-free replacement or full refund.",
    category: "Account & Orders",
  },
];
