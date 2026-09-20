import type { Metadata } from "next";
import { concernDetailsMap } from "@/lib/solution-data";
import {
  SITE_URL,
  BRAND_NAME,
  generateBreadcrumbSchema,
  generateCollectionSchema,
} from "@/lib/seo-schema";

export const revalidate = 120;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cleanSlug = decodeURIComponent(slug || "").toLowerCase().trim();

  const details = concernDetailsMap[cleanSlug] || {
    title: `${cleanSlug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ")} Ayurvedic Formulations`,
    subtitle: "AUTHENTIC AYURVEDIC WELLNESS REMEDIES",
    bg: "",
    description: `Shop certified Ayurvedic remedies, herbal extracts, and traditional formulations for ${cleanSlug.replace(
      /-/g,
      " "
    )} by Pure Ayur Herbs. 100% plant-based, AYUSH certified.`,
    keywords: [
      cleanSlug.replace(/-/g, " "),
      "Ayurvedic Remedies",
      "Pure Ayur Herbs",
      "Ayurveda",
      "Herbal Formulations",
    ],
  };

  const title = `${details.title} | ${BRAND_NAME}`;
  const canonicalUrl = `${SITE_URL}/solution/${cleanSlug}`;

  return {
    title,
    description: details.description,
    keywords: details.keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description: details.description,
      url: canonicalUrl,
      siteName: BRAND_NAME,
      locale: "en_IN",
      type: "website",
      images: [
        {
          url: `${SITE_URL}/brand/pure-ayur-og-banner.jpg`,
          width: 1200,
          height: 630,
          alt: details.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: details.description,
      images: [`${SITE_URL}/brand/pure-ayur-og-banner.jpg`],
    },
  };
}

export default async function SolutionLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cleanSlug = decodeURIComponent(slug || "").toLowerCase().trim();

  const details = concernDetailsMap[cleanSlug] || {
    title: cleanSlug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" "),
    description: `Ayurvedic remedies for ${cleanSlug.replace(/-/g, " ")}`,
  };

  const breadcrumbsSchema = generateBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: details.title, path: `/solution/${cleanSlug}` },
  ]);

  const collectionSchema = generateCollectionSchema({
    name: details.title,
    description: details.description,
    url: `/solution/${cleanSlug}`,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      {children}
    </>
  );
}
