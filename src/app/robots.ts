import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://www.purreayurherbs.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/products/",
          "/products/*",
          "/solution/",
          "/solution/*",
          "/blog",
          "/blog/*",
          "/brand/*",
        ],
        disallow: [
          "/admin",
          "/admin/*",
          "/api/",
          "/api/*",
          "/*?*ref=*",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: [
          "/",
          "/products/",
          "/products/*",
          "/solution/",
          "/solution/*",
          "/blog",
          "/blog/*",
          "/brand/*",
        ],
        disallow: [
          "/admin",
          "/admin/*",
          "/api/",
          "/api/*",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}

