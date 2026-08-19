import ProductClickRouter from "@/components/ProductClickRouter";
import MetaPixel from "@/components/MetaPixel";
import WhatsAppWidget from "@/components/WhatsAppWidget";
import ToastContainer from "@/components/ToastContainer";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pyur Ayur Herbs | Premium Botanicals & Wellness",
  description: "Ayurvedic wellness storefront for Pyur Ayur Herbs. Sourced from high-altitude Himalayas.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <ProductClickRouter />
        <MetaPixel />
        <WhatsAppWidget />
        <ToastContainer />
        {children}
      </body>
    </html>
  );
}

