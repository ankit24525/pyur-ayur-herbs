"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { Product } from "@/lib/store";

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onBuyNow?: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart, onBuyNow }: ProductCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [addedToast, setAddedToast] = useState(false);

  // Collect all available images for this product (main, array, variants)
  const imageList = useMemo(() => {
    const list: string[] = [];
    if (product.image && typeof product.image === "string") {
      list.push(product.image);
    }
    if (Array.isArray(product.images) && product.images.length > 0) {
      product.images.forEach((img) => {
        if (img && typeof img === "string" && !list.includes(img)) {
          list.push(img);
        }
      });
    }
    if (Array.isArray(product.variants)) {
      product.variants.forEach((v) => {
        if (v.image && typeof v.image === "string" && !list.includes(v.image)) {
          list.push(v.image);
        }
      });
    }
    return list.length > 0 ? list : [product.image || "/brand/pure-ayur-logo.png"];
  }, [product.images, product.image, product.variants]);

  const discountPercent =
    product.compareAt && Number(product.compareAt) > Number(product.price)
      ? Math.round(
          ((Number(product.compareAt) - Number(product.price)) /
            Number(product.compareAt)) *
            100
        )
      : null;

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + imageList.length) % imageList.length);
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % imageList.length);
  };

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
    } else {
      try {
        const stored = localStorage.getItem("pyur_cart");
        let cart = stored ? JSON.parse(stored) : [];
        const existing = cart.find((i: any) => i && i.product && i.product.id === product.id);
        if (existing) {
          cart = cart.map((i: any) =>
            i.product.id === product.id ? { ...i, quantity: (i.quantity || 1) + 1 } : i
          );
        } else {
          cart.push({ product, quantity: 1 });
        }
        localStorage.setItem("pyur_cart", JSON.stringify(cart));
        setTimeout(() => {
          window.dispatchEvent(new Event("pyur_cart_updated"));
        }, 0);
      } catch {}
    }
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2000);
  };

  const currentDisplayImage = imageList[currentImageIndex] || product.image;

  return (
    <article className="group relative flex flex-col rounded-2xl border border-transparent p-2.5 sm:p-3 transition-all duration-300 bg-white hover:border-neutral-200 hover:shadow-md">
      {/* Product Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-white flex items-center justify-center">
        {/* Promotional Badge */}
        {product.badge && (
          <div className="absolute top-2 left-2 z-10 pointer-events-none">
            <span className="inline-block bg-[#023915] text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-xs">
              {product.badge}
            </span>
          </div>
        )}

        <Link
          href={`/products/${product.slug}`}
          className="size-full flex items-center justify-center"
        >
          <Image
            src={currentDisplayImage}
            alt={`${product.name} - 100% Certified Ayurvedic Remedy | Pure Ayur Herbs`}
            title={product.name}
            width={400}
            height={400}
            unoptimized
            className="size-full object-contain transition-transform duration-300 group-hover:scale-105"
          />
        </Link>

        {/* Image Slider Navigation Arrows (Shown on Hover on Desktop, Hidden on Mobile) */}
        {imageList.length > 1 && (
          <div className="absolute bottom-2.5 right-2.5 z-10 hidden md:flex items-center gap-1.5 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200">
            <button
              type="button"
              onClick={handlePrevImage}
              aria-label="Previous image"
              className="size-7 sm:size-7.5 rounded-full bg-white/95 border border-neutral-300 shadow-xs flex items-center justify-center text-neutral-700 hover:border-neutral-900 hover:text-black hover:bg-white transition cursor-pointer"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={handleNextImage}
              aria-label="Next image"
              className="size-7 sm:size-7.5 rounded-full bg-white/95 border border-neutral-300 shadow-xs flex items-center justify-center text-neutral-700 hover:border-neutral-900 hover:text-black hover:bg-white transition cursor-pointer"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="mt-2.5 flex flex-col flex-1 justify-between">
        <div>
          <Link href={`/products/${product.slug}`}>
            <h3 className="line-clamp-1 text-xs md:text-sm font-normal uppercase tracking-wide text-neutral-800 group-hover:text-[#023915] transition">
              {product.name}
            </h3>
          </Link>

          {/* Pricing Row: ₹599 ₹1,999 70% OFF */}
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xs md:text-sm font-bold text-neutral-900">
              ₹{product.price}
            </span>
            {product.compareAt && Number(product.compareAt) > Number(product.price) && (
              <span className="text-[11px] md:text-xs text-neutral-400 line-through">
                ₹{product.compareAt}
              </span>
            )}
            {discountPercent && discountPercent > 0 && (
              <span className="text-[11px] md:text-xs font-bold text-emerald-700">
                {discountPercent}% OFF
              </span>
            )}
          </div>
        </div>

        {/* Taitva "Add to Bag" Button (Revealed on hover on desktop, accessible on mobile) */}
        <div className="mt-3 pt-0.5">
          <button
            type="button"
            onClick={handleAddToCartClick}
            className={`w-full rounded-xl border border-[#023915] text-[#023915] hover:bg-[#023915] hover:text-white py-2.5 text-xs font-bold tracking-wide transition cursor-pointer flex items-center justify-center gap-1.5 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto max-md:opacity-100 max-md:pointer-events-auto ${
              addedToast ? "bg-[#023915] text-white" : "bg-white"
            }`}
          >
            {addedToast ? (
              <>
                <Check className="size-3.5" />
                <span>Added to Bag</span>
              </>
            ) : (
              <span>Add to Bag</span>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
