import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Account | Pure Ayur Herbs",
  description: "Manage orders, Pure Coins wallet, and delivery addresses.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
