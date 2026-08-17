"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import ProductCard from "./ProductCard";
import { Product } from "@/lib/store";

interface ProductRailProps {
  title: string;
  subtitle?: string;
  categorySlug?: string;
  items: Product[];
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
}

export default function ProductRail({
  title,
  subtitle,
  categorySlug,
  items,
  onAddToCart,
  onBuyNow,
}: ProductRailProps) {
  if (items.length === 0) return null;

  // Determine target solution URL
  const targetSlug =
    categorySlug ||
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const solutionUrl = `/solution/${targetSlug}`;

  return (
    <section className="mx-auto max-w-[1440px] px-4 py-6 md:px-6 md:py-10">
      {/* Rail Header */}
      <div className="mb-6 flex items-end justify-between border-b border-[#ddddd9] pb-3">
        <div>
          <h2 className="text-xl font-black tracking-tight text-[#17231b] sm:text-2xl md:text-3xl">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1 text-xs font-medium text-[#666666] md:text-sm">
              {subtitle}
            </p>
          )}
        </div>
        <Link
          href={solutionUrl}
          className="inline-flex items-center gap-1 text-xs font-bold text-[#c9704c] hover:text-[#244f31] md:text-sm"
        >
          <span>View all</span>
          <ChevronRight className="size-4" />
        </Link>
      </div>

      {/* Grid of Kapiva Product Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
        {items.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
            onBuyNow={onBuyNow}
          />
        ))}
      </div>
    </section>
  );
}
