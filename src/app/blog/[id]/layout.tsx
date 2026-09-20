import type { Metadata } from "next";
import { readDB } from "@/lib/db";
import {
  SITE_URL,
  BRAND_NAME,
  generateArticleSchema,
  generateBreadcrumbSchema,
} from "@/lib/seo-schema";

interface Props {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}

export const revalidate = 120;

function findBlog(blogs: any[], id: string) {
  const cleanId = decodeURIComponent(id || "").toLowerCase().trim();
  return (blogs || []).find((b: any) => {
    const bId = String(b.id || "").toLowerCase().trim();
    const bSlug = (b.title || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
    const explicitSlug = String(b.slug || "").toLowerCase().trim();
    return bId === cleanId || bSlug === cleanId || explicitSlug === cleanId;
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const cleanId = decodeURIComponent(id || "").toLowerCase().trim();
  const db = await readDB();
  const blog = findBlog(db.blogs || [], cleanId);

  if (blog) {
    const title = `${blog.title} | ${BRAND_NAME} Journal`;
    const cleanContent = (blog.content || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const description =
      blog.excerpt ||
      blog.metaDesc ||
      (cleanContent ? cleanContent.substring(0, 155) + "..." : `Discover Ayurvedic guidance on ${blog.title} from certified Vaidyas at ${BRAND_NAME}.`);

    const canonicalUrl = `${SITE_URL}/blog/${encodeURIComponent(cleanId)}`;
    const imageUrl =
      blog.image && typeof blog.image === "string" && blog.image.startsWith("http")
        ? blog.image
        : `${SITE_URL}/brand/pure-ayur-og-banner.jpg`;

    return {
      title,
      description,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title,
        description,
        url: canonicalUrl,
        siteName: BRAND_NAME,
        locale: "en_IN",
        type: "article",
        publishedTime: blog.date || "2026-08-01",
        authors: [blog.author || "Pure Ayur Herbs Vaidya Team"],
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: blog.title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [imageUrl],
      },
    };
  }

  return {
    title: `Ayurvedic Journal | ${BRAND_NAME}`,
    description: "Holistic wellness guides and healthy recipes certified by Ayurvedic practitioners.",
    alternates: {
      canonical: `${SITE_URL}/blog`,
    },
  };
}

export default async function BlogLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cleanId = decodeURIComponent(id || "").toLowerCase().trim();
  const db = await readDB();
  const blog = findBlog(db.blogs || [], cleanId);

  if (!blog) {
    return <>{children}</>;
  }

  const cleanContent = (blog.content || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const description =
    blog.excerpt ||
    blog.metaDesc ||
    (cleanContent ? cleanContent.substring(0, 155) + "..." : blog.title);

  const articleSchema = generateArticleSchema({
    title: blog.title,
    description,
    image: blog.image,
    datePublished: blog.date,
    authorName: blog.author,
    url: `/blog/${encodeURIComponent(cleanId)}`,
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Wellness Journal", path: "/blog" },
    { name: blog.title, path: `/blog/${encodeURIComponent(cleanId)}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {children}
    </>
  );
}
