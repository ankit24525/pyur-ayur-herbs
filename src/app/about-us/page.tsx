import { readDB } from "@/lib/db";
import AboutUsClient from "@/components/AboutUsClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const db = await readDB();
  const about = db.content?.aboutUs;
  return {
    title: about?.title ? `${about.title} | Pure Ayur Herbs` : "About Us | Pure Ayur Herbs",
    description:
      about?.subtitle ||
      "Pure Ayur Herbs bridges ancient Vedic herbal wisdom with clinical purity for 100% natural Ayurvedic remedies.",
  };
}

export default async function AboutUsPage() {
  const db = await readDB(true);
  const initialAboutData = db.content?.aboutUs || null;

  return <AboutUsClient initialAboutData={initialAboutData} />;
}
