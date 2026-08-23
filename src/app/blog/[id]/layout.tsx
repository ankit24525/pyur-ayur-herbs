import { Metadata } from "next";
import { readDB } from "@/lib/db";

interface Props {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const db = await readDB();
  
  const blog = db.blogs?.find((b: any) => {
    const cleanId = b.id || b.title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
    return cleanId === id;
  });

  if (blog) {
    const title = `${blog.title} | Pyur Ayur Journal`;
    const description = blog.content ? blog.content.substring(0, 155) + "..." : "Read this article to discover holistic wellness guidance.";
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: [blog.image],
        type: "article",
        authors: [blog.author || "Ayurvedic Expert"]
      }
    };
  }

  return {
    title: "Ayurvedic Journal | Pyur Ayur Herbs",
    description: "Holistic wellness guides and healthy recipes certified by Ayurvedic practitioners."
  };
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
