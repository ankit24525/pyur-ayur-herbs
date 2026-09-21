import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shopping Basket | Pure Ayur Herbs",
  description: "View items in your herbal basket and proceed to secure checkout.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
