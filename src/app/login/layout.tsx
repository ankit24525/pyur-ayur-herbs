import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account Sign In | Pure Ayur Herbs",
  description: "Sign in to your Pure Ayur Herbs account to view orders, track shipments, check Pure Coins, and manage delivery addresses.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
