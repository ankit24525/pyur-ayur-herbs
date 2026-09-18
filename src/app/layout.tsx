import ProductClickRouter from "@/components/ProductClickRouter";
import MetaPixel from "@/components/MetaPixel";
import WhatsAppWidget from "@/components/WhatsAppWidget";
import ToastContainer from "@/components/ToastContainer";
import SessionTimeoutHandler from "@/components/SessionTimeoutHandler";
import type { Metadata } from "next";
import { readDB } from "@/lib/db";
import "./globals.css";

const siteUrl = "https://www.purreayurherbs.com";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const db = await readDB();
    const seo = db.seo || {};
    let title = (seo.title || "Pure Ayur Herbs | 100% Certified Himalayan Shilajit & Ayurvedic Formulations").replace(/Pyur/gi, "Pure");
    if (title.includes("Premium Ayurvedic Remedies")) {
      title = "Pure Ayur Herbs | 100% Certified Himalayan Shilajit & Ayurvedic Formulations";
    }
    let description = (seo.metaDesc || "").replace(/Pyur/gi, "Pure");
    if (!description || description.includes("Dia Free") || description.includes("organic skincare")) {
      description = "Shop 100% AYUSH Certified Himalayan Shilajit Gold Resin, Sugar Care Balance Juice, Kesar Saffron Hair Growth Elixir, Ashwagandha KSM-66 & Digestive Juices. Fast Free Delivery across India.";
    }

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
      icons: {
        icon: [
          { url: "/favicon.ico", sizes: "48x48" },
          { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
          { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
          { url: "/favicon-144x144.png", sizes: "144x144", type: "image/png" },
          { url: "/icon.png", sizes: "192x192", type: "image/png" },
          { url: "/brand/pure-ayur-logo.png", sizes: "530x530", type: "image/png" },
          { url: "/brand/pure-ayur-logo.svg", type: "image/svg+xml" },
        ],
        apple: [
          { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
        ],
        shortcut: "/favicon.ico",
      },
      verification: {
        google: "tPj_yir64TOdcN3TJ0GdrlpMrugdan2CxJ1fZw5CqEY",
      },
    };
  } catch (e) {
    const fallbackTitle = "Pure Ayur Herbs | 100% Certified Himalayan Shilajit & Ayurvedic Wellness";
    const fallbackDesc = "Shop 100% AYUSH Certified Himalayan Shilajit Gold Resin, Sugar Care Balance Juice, Kesar Saffron Hair Growth Elixir, Ashwagandha KSM-66 & Digestive Juices. Fast Free Delivery across India.";
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
      icons: {
        icon: [
          { url: "/favicon.ico", sizes: "48x48" },
          { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
          { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
          { url: "/favicon-144x144.png", sizes: "144x144", type: "image/png" },
          { url: "/icon.png", sizes: "192x192", type: "image/png" },
          { url: "/brand/pure-ayur-logo.png", sizes: "530x530", type: "image/png" },
          { url: "/brand/pure-ayur-logo.svg", type: "image/svg+xml" },
        ],
        apple: [
          { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
        ],
        shortcut: "/favicon.ico",
      },
      verification: {
        google: "tPj_yir64TOdcN3TJ0GdrlpMrugdan2CxJ1fZw5CqEY",
      },
    };
  }
}

const jsonLdSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://www.purreayurherbs.com/#organization",
      "name": "Pure Ayur Herbs",
      "alternateName": "Pure Ayur Herbs Private Limited",
      "url": "https://www.purreayurherbs.com",
      "logo": "https://www.purreayurherbs.com/brand/pure-ayur-logo.png",
      "description": "Pure Ayur Herbs bridges ancient Ayurvedic wisdom with modern clinical research for purity you can taste & feel.",
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer support",
        "email": "support@pureayurherbs.com",
      },
    },
    {
      "@type": "WebSite",
      "@id": "https://www.purreayurherbs.com/#website",
      "url": "https://www.purreayurherbs.com",
      "name": "Pure Ayur Herbs",
      "publisher": {
        "@id": "https://www.purreayurherbs.com/#organization",
      },
    },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="48x48" />
        <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
        <link rel="icon" type="image/png" sizes="144x144" href="/favicon-144x144.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon.png" />
        <link rel="icon" type="image/svg+xml" href="/brand/pure-ayur-logo.svg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-icon.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <meta name="google-site-verification" content="tPj_yir64TOdcN3TJ0GdrlpMrugdan2CxJ1fZw5CqEY" />
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

