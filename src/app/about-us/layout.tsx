import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo-schema";

export const metadata: Metadata = {
  title: "About Us | Pure Ayur Herbs - Authentic Ayurvedic Heritage & Mission",
  description:
    "Learn about Pure Ayur Herbs' heritage, 100% Himalayan botanical sourcing, classical Vaidya formulations, and AYUSH & GMP certified holistic wellness remedies.",
  alternates: {
    canonical: `${SITE_URL}/about-us`,
  },
  openGraph: {
    title: "About Us | Pure Ayur Herbs",
    description:
      "Rooted in ancient Ayurveda, refined by science. 100% pure Himalayan formulations crafted by senior Vaidyas.",
    url: `${SITE_URL}/about-us`,
    siteName: "Pure Ayur Herbs",
    images: [
      {
        url: "/brand/pure-ayur-logo.png",
        width: 800,
        height: 800,
        alt: "Pure Ayur Herbs Heritage",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AboutPage",
        "@id": `${SITE_URL}/about-us`,
        "name": "About Pure Ayur Herbs",
        "url": `${SITE_URL}/about-us`,
        "description":
          "Authentic Ayurvedic remedies crafted with 100% pure Himalayan herbs and validated by modern clinical purity standards.",
        "publisher": {
          "@type": "Organization",
          "name": "Pure Ayur Herbs Private Limited",
          "url": SITE_URL,
          "logo": {
            "@type": "ImageObject",
            "url": `${SITE_URL}/brand/pure-ayur-logo.png`
          }
        }
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": SITE_URL
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "About Us",
            "item": `${SITE_URL}/about-us`
          }
        ]
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      {children}
    </>
  );
}
