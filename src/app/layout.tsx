import ProductClickRouter from "@/components/ProductClickRouter";
import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Pyur Ayur Herbs | Premium Botanicals & Wellness", description: "Ayurvedic wellness storefront and admin dashboard for Pyur Ayur Herbs." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className="h-full antialiased"><body className="min-h-full flex flex-col"><ProductClickRouter />
          {children}</body></html>;
}
