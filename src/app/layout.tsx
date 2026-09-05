import ProductClickRouter from "@/components/ProductClickRouter";
import MetaPixel from "@/components/MetaPixel";
import WhatsAppWidget from "@/components/WhatsAppWidget";
import ToastContainer from "@/components/ToastContainer";
import SessionTimeoutHandler from "@/components/SessionTimeoutHandler";
import type { Metadata } from "next";
import { readDB } from "@/lib/db";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const db = await readDB();
    const seo = db.seo || {
      title: "Pyur Ayur Herbs | Premium Botanicals & Wellness",
      metaDesc: "Ayurvedic wellness storefront for Pyur Ayur Herbs. Sourced from high-altitude Himalayas."
    };
    return {
      title: seo.title,
      description: seo.metaDesc,
      keywords: ["Ayurveda", "Ayurvedic herbs", "Shilajit", "Himalayan Herbs", "Holistic Wellness", "Organic Supplements"],
      robots: "index, follow",
      openGraph: {
        title: seo.title,
        description: seo.metaDesc,
        type: "website",
        locale: "en_IN",
        siteName: "Pyur Ayur Herbs",
      }
    };
  } catch (e) {
    return {
      title: "Pyur Ayur Herbs | Premium Botanicals & Wellness",
      description: "Ayurvedic wellness storefront for Pyur Ayur Herbs. Sourced from high-altitude Himalayas."
    };
  }
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
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

