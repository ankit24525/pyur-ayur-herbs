import { MetadataRoute } from "next";
import { readDB } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://pureayurherbs.com";
  const now = new Date();

  // Core static pages
  const routes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}`, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/contact-us`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/shipping-policy`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/return-policy`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/privacy-policy`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/terms-of-service`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
  ];

  try {
    const db = await readDB();

    // Dynamic products
    if (Array.isArray(db.products)) {
      db.products.forEach((product: any) => {
        if (product.slug) {
          routes.push({
            url: `${baseUrl}/products/${encodeURIComponent(product.slug)}`,
            lastModified: now,
            changeFrequency: "weekly",
            priority: 0.9,
          });
        }
      });
    }

    // Dynamic blogs
    if (Array.isArray(db.blogs)) {
      db.blogs.forEach((blog: any) => {
        const blogId = blog.id || blog.title?.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
        if (blogId && blog.status === "Published") {
          routes.push({
            url: `${baseUrl}/blog/${encodeURIComponent(blogId)}`,
            lastModified: now,
            changeFrequency: "weekly",
            priority: 0.7,
          });
        }
      });
    }
  } catch (error) {
    console.error("Sitemap generation error:", error);
  }

  return routes;
}
