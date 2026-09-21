import type { Metadata } from "next";
import { SITE_URL, BRAND_NAME, generateBreadcrumbSchema, generateCollectionSchema } from "@/lib/seo-schema";

export const revalidate = 120;

export const metadata: Metadata = {
  title: `Media Hub — Doctor Talks, Reels & Herbal Heritage | ${BRAND_NAME}`,
  description:
    "Explore authentic Ayurvedic doctor talks, Instagram Reels, GMP lab certifications, customer unboxing, and wellness guides from certified Vaidyas at Pure Ayur Herbs.",
  alternates: {
    canonical: `${SITE_URL}/media`,
  },
  keywords: [
    "Pure Ayur Herbs Media",
    "Ayurvedic Doctor Talks",
    "Ayurveda Reels",
    "Virja Powder Video",
    "Madhunashi Doctor Review",
    "GMP Lab Certification",
    "Ayurvedic Wellness Videos",
  ],
  openGraph: {
    title: `Media Hub — Doctor Talks, Reels & Herbal Heritage | ${BRAND_NAME}`,
    description:
      "Explore authentic Ayurvedic doctor talks, Reels, GMP lab certifications, and wellness guides from certified Vaidyas.",
    url: `${SITE_URL}/media`,
    siteName: BRAND_NAME,
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: `${SITE_URL}/brand/pure-ayur-og-banner.jpg`,
        width: 1200,
        height: 630,
        alt: `${BRAND_NAME} Media Hub`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Media Hub — Doctor Talks, Reels & Herbal Heritage | ${BRAND_NAME}`,
    description:
      "Explore authentic Ayurvedic doctor talks, Reels, GMP lab certifications, and wellness guides.",
    images: [`${SITE_URL}/brand/pure-ayur-og-banner.jpg`],
  },
};

export default function MediaLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Media Hub", path: "/media" },
  ]);

  const collectionSchema = generateCollectionSchema({
    name: "Pure Ayur Herbs Media Hub",
    description: "Doctor Talks, Instagram Reels, and Behind-the-Scenes Heritage Gallery.",
    url: "/media",
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      {children}
    </>
  );
}
