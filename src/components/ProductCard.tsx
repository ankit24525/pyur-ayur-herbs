"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, ShoppingBag, Truck } from "lucide-react";
import { Product } from "@/lib/store";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart, onBuyNow }: ProductCardProps) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-[#ddddd9] bg-white shadow-xs transition hover:shadow-lg">
      {/* Top Image Container */}
      <div className="relative overflow-hidden bg-[#f8faf1] p-3 text-center">
        {/* Offer Badge Top Right */}
        <span className="absolute right-2 top-2 z-10 rounded bg-[#eef5df] px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#244f31] border border-[#80a03c]">
          {product.badge}
        </span>

        {/* Rating Stars Top Left */}
        <div className="absolute left-2 top-2 z-10 flex items-center gap-1 rounded bg-white/90 px-1.5 py-0.5 text-[11px] font-bold text-[#17231b] shadow-xs backdrop-blur-xs">
          <Star className="size-3 fill-[#f2c94c] text-[#f2c94c]" />
          <span>{product.rating}</span>
          <span className="text-[9px] text-[#666666]">({product.reviews})</span>
        </div>

        {/* Product Image */}
        <a href={`/products/${product.slug}`} className="block overflow-hidden rounded-lg">
          <Image
            src={product.image}
            alt={product.name}
            width={320}
            height={320}
            unoptimized
            className="mx-auto h-44 w-full object-cover transition-transform duration-500 group-hover:scale-105 sm:h-52"
          />
        </a>
      </div>

      {/* Card Content Body */}
      <div className="flex flex-1 flex-col p-3 md:p-4">
        {/* Title */}
        <a href={`/products/${product.slug}`} className="hover:text-[#244f31]">
          <h3 className="line-clamp-2 min-h-[2.5rem] text-xs font-bold leading-tight text-[#17231b] md:text-sm">
            {product.name}
          </h3>
        </a>

        {/* Pricing Row */}
        <div className="mt-2.5 flex items-baseline gap-2">
          <span className="text-base font-black text-[#17231b] md:text-xl">
            ₹{product.price}
          </span>
          <span className="text-xs font-semibold text-[#666666] line-through">
            ₹{product.compareAt}
          </span>
        </div>

        {/* Pyur Coins Pill */}
        <div className="mt-2.5 inline-flex w-fit items-center gap-1 rounded-full bg-[#eef5df] px-2.5 py-1 text-[11px] font-bold text-[#244f31]">
          <span>Earn</span>
          <span className="flex size-4 items-center justify-center rounded-full bg-[#f2c94c] text-[10px] text-black">
            🪙
          </span>
          <span>{product.coinsEarned} Coins</span>
        </div>

        {/* Delivery ETA Tag */}
        <div className="mt-2 flex items-center gap-1.5 rounded bg-[#f8faf1] px-2 py-1 text-[10px] font-medium text-[#666666]">
          <Truck className="size-3 text-[#80a03c]" />
          <span>Delivered by {product.deliveryDays}</span>
        </div>

        {/* Bottom Dual Action Bar */}
        <div className="mt-4 flex h-10 w-full overflow-hidden rounded-lg border border-[#244f31]">
          {/* Quick Add Cart Icon Button */}
          <button
            onClick={() => onAddToCart(product)}
            className="flex w-1/4 items-center justify-center bg-[#17231b] text-white transition hover:bg-[#244f31]"
            title="Add to Cart"
          >
            <ShoppingBag className="size-4" />
          </button>

          {/* BUY NOW Primary Button */}
          <button
            onClick={() => onBuyNow(product)}
            className="flex flex-1 items-center justify-center bg-[#244f31] text-xs font-black tracking-widest text-white transition hover:bg-[#1d3b24]"
          >
            BUY NOW
          </button>
        </div>
      </div>
    </article>
  );
}
