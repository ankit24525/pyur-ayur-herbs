export interface MediaItem {
  id: string;
  type: "reel" | "video" | "photo";
  title: string;
  caption?: string;
  url: string; // YouTube link, Instagram link, or Image URL
  thumbnail?: string;
  category: "Reels & Shorts" | "Doctor Talks" | "Lab & Farm BTS" | "Customer Stories" | "Press & News";
  taggedProductId?: string; // Links to product for 1-click cart
  duration?: string;
  author?: string;
  status: "Published" | "Draft";
  featured?: boolean;
  date: string;
}

export const defaultMedia: MediaItem[] = [
  {
    id: "media-1",
    type: "reel",
    title: "How to Take Virja Powder for Peak Energy & Vitality",
    caption: "Certified Vaidyas explain the classical method of consuming pure Ashwagandha, Safed Musli, and Gokshura with warm milk.",
    url: "https://www.youtube.com/shorts/dQw4w9WgXcQ",
    thumbnail: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&q=80",
    category: "Reels & Shorts",
    taggedProductId: "prod_1788511674720", // VIRJA POWDER
    duration: "45s",
    author: "Dr. Adil Khan (Vaidya)",
    status: "Published",
    featured: true,
    date: "15 Sep 2026",
  },
  {
    id: "media-2",
    type: "video",
    title: "The Science of Madhunashi: Natural Blood Sugar Balance",
    caption: "Deep dive into Gudmar (Gymnema Sylvestre), the legendary 'sugar destroyer' herb, and how it supports healthy pancreatic function and glucose metabolism.",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnail: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=1200&q=80",
    category: "Doctor Talks",
    taggedProductId: "prod_1788511819071", // MADHUNASHI POWDER
    duration: "8:45",
    author: "Dr. A. Sharma (Chief Ayurvedic Doctor)",
    status: "Published",
    featured: true,
    date: "10 Sep 2026",
  },
  {
    id: "media-3",
    type: "photo",
    title: "100% GMP Certified Formulation & Extraction Facility",
    caption: "Our state-of-the-art clean extraction facility where botanical ingredients undergo strict standardized extraction and purity testing.",
    url: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=1200&q=80",
    thumbnail: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=600&q=80",
    category: "Lab & Farm BTS",
    duration: "",
    author: "Pure Ayur QA Lab Team",
    status: "Published",
    featured: false,
    date: "05 Sep 2026",
  },
  {
    id: "media-4",
    type: "reel",
    title: "3 Ayurvedic Morning Habits for Natural Fat Metabolism",
    caption: "Kickstart sluggish digestion (Mandagni) with warm herbal water and botanical metabolism boosters.",
    url: "https://www.youtube.com/shorts/dQw4w9WgXcQ",
    thumbnail: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80",
    category: "Reels & Shorts",
    taggedProductId: "prod_1788511756530", // AYURVEDIC FAT BURNER
    duration: "55s",
    author: "Dr. V. Joshi",
    status: "Published",
    featured: true,
    date: "01 Sep 2026",
  },
  {
    id: "media-5",
    type: "photo",
    title: "Pure Himalayan Shilajit Resin Verification Testing",
    caption: "Heavy metal testing, fulvic acid content verification (>70%), and organic purity certification from accredited lab partners.",
    url: "https://images.unsplash.com/photo-1563178406-4cdc2923acbc?auto=format&fit=crop&w=1200&q=80",
    thumbnail: "https://images.unsplash.com/photo-1563178406-4cdc2923acbc?auto=format&fit=crop&w=600&q=80",
    category: "Lab & Farm BTS",
    duration: "",
    author: "Quality & Testing Division",
    status: "Published",
    featured: false,
    date: "28 Aug 2026",
  },
  {
    id: "media-6",
    type: "video",
    title: "Customer Journey: Ramesh Sharma's 90-Day Transformation",
    caption: "Real customer experience with Madhunashi powder and dietary adjustments over 3 months of consistent Ayurvedic regimen.",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnail: "https://images.unsplash.com/photo-1512290900672-1f486d3d98e1?auto=format&fit=crop&w=1200&q=80",
    category: "Customer Stories",
    taggedProductId: "prod_1788511819071",
    duration: "4:20",
    author: "Verified Customer Story",
    status: "Published",
    featured: false,
    date: "20 Aug 2026",
  },
];
