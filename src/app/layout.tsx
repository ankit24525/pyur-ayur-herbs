import ProductClickRouter from "@/components/ProductClickRouter";
import MetaPixel from "@/components/MetaPixel";
import WhatsAppWidget from "@/components/WhatsAppWidget";
import ToastContainer from "@/components/ToastContainer";
import SessionTimeoutHandler from "@/components/SessionTimeoutHandler";
import type { Metadata } from "next";
import { readDB } from "@/lib/db";
import "./globals.css";

const siteUrl = "https://pureayurherbs.com";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const db = await readDB();
    const seo = db.seo || {
      title: "Pure Ayur Herbs | Premium Botanicals & Wellness",
      metaDesc: "Ayurvedic wellness storefront for Pure Ayur Herbs. Sourced from high-altitude Himalayas."
    };
    const title = (seo.title || "Pure Ayur Herbs | Premium Botanicals & Wellness").replace(/Pyur/gi, "Pure");
    const description = (seo.metaDesc || "Ayurvedic wellness storefront for Pure Ayur Herbs. Sourced from high-altitude Himalayas.").replace(/Pyur/gi, "Pure");

    return {
      metadataBase: new URL(siteUrl),
      title,
      description,
      keywords: ["Pure Ayur Herbs", "Ayurveda", "Ayurvedic herbs", "Shilajit", "Himalayan Herbs", "Holistic Wellness", "Organic Supplements"],
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      },
      alternates: {
        canonical: siteUrl,
      },
      openGraph: {
        title,
        description,
        url: siteUrl,
        siteName: "Pure Ayur Herbs",
        locale: "en_IN",
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
      },
    };
  } catch (e) {
    const fallbackTitle = "Pure Ayur Herbs | Premium Botanicals & Wellness";
    const fallbackDesc = "Ayurvedic wellness storefront for Pure Ayur Herbs. Sourced from high-altitude Himalayas.";
    return {
      metadataBase: new URL(siteUrl),
      title: fallbackTitle,
      description: fallbackDesc,
      alternates: {
        canonical: siteUrl,
      },
      openGraph: {
        title: fallbackTitle,
        description: fallbackDesc,
        url: siteUrl,
        siteName: "Pure Ayur Herbs",
        locale: "en_IN",
        type: "website",
      },
    };
  }
}

const jsonLdSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://pureayurherbs.com/#organization",
      "name": "Pure Ayur Herbs",
      "alternateName": "Pure Ayur Herbs Private Limited",
      "url": "https://pureayurherbs.com",
      "logo": "https://pureayurherbs.com/brand/pure-ayur-logo.svg",
      "description": "Pure Ayur Herbs bridges ancient Ayurvedic wisdom with modern clinical research for purity you can taste & feel.",
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer support",
        "email": "support@pureayurherbs.com",
      },
    },
    {
      "@type": "WebSite",
      "@id": "https://pureayurherbs.com/#website",
      "url": "https://pureayurherbs.com",
      "name": "Pure Ayur Herbs",
      "publisher": {
        "@id": "https://pureayurherbs.com/#organization",
      },
    },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <ProductClickRouter />
        <MetaPixel />
        <WhatsAppWidget />
        <ToastContainer />
        <SessionTimeoutHandler />
        {children}
      </body>
    </html>
  );
}

