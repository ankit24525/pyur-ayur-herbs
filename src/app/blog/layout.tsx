import type { Metadata } from "next";
import { SITE_URL, BRAND_NAME, generateBreadcrumbSchema, generateCollectionSchema } from "@/lib/seo-schema";

export const revalidate = 300;

export const metadata: Metadata = {
  title: `Ayurvedic Health & Wellness Journal | ${BRAND_NAME}`,
  description:
    "Read evidence-based Ayurvedic articles, daily health routines, herbal remedies, and diet guidance written by certified Vaidyas and wellness practitioners.",
  alternates: {
    canonical: `${SITE_URL}/blog`,
  },
  keywords: [
    "Ayurvedic Blog",
    "Ayurveda Health Tips",
    "Herbal Remedies Guide",
    "Pure Ayur Journal",
    "Vaidya Advice",
    "Natural Wellness India",
  ],
  openGraph: {
    title: `Ayurvedic Health & Wellness Journal | ${BRAND_NAME}`,
    description:
      "Evidence-based Ayurvedic articles, home wellness routines, and botanical insights.",
    url: `${SITE_URL}/blog`,
    siteName: BRAND_NAME,
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: `${SITE_URL}/brand/pure-ayur-og-banner.jpg`,
        width: 1200,
        height: 630,
        alt: `${BRAND_NAME} Wellness Journal`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Ayurvedic Health & Wellness Journal | ${BRAND_NAME}`,
    description:
      "Evidence-based Ayurvedic articles and botanical health insights.",
    images: [`${SITE_URL}/brand/pure-ayur-og-banner.jpg`],
  },
};

export default function BlogRootLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Wellness Journal", path: "/blog" },
  ]);

  const collectionSchema = generateCollectionSchema({
    name: "Ayurvedic Health & Wellness Journal",
    description: "Holistic guides, Ayurvedic remedies, and healthy lifestyle routines.",
    url: "/blog",
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
