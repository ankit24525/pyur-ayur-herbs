import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Secure Checkout | Pure Ayur Herbs",
  description: "Complete your order with Cash on Delivery or Secure Online Payment.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
