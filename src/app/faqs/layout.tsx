import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo-schema";

export const metadata: Metadata = {
  title: "Frequently Asked Questions | Pure Ayur Herbs - Authentic Ayurvedic Care",
  description:
    "Find answers to frequently asked questions about Pure Ayur Herbs orders, products, botanical ingredients, shipping, dosage, and holistic Ayurvedic care.",
  alternates: {
    canonical: `${SITE_URL}/faqs`,
  },
  openGraph: {
    title: "Frequently Asked Questions | Pure Ayur Herbs",
    description:
      "Everything you need to know about shopping with Pure Ayur Herbs. Orders, formulations, botanical quality, delivery & returns.",
    url: `${SITE_URL}/faqs`,
    siteName: "Pure Ayur Herbs",
    images: [
      {
        url: "/brand/pure-ayur-logo.png",
        width: 800,
        height: 800,
        alt: "Pure Ayur Herbs FAQs",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
};

export default function FaqsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
