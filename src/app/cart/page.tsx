"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import AnnouncementBar from "@/components/AnnouncementBar";
import { Product } from "@/lib/store";

export default function CartPage() {
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("pyur_cart");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            const valid = parsed.filter(
              (item: any) => item && item.product && typeof item.product === "object" && item.product.id
            );
            setCart(valid);
            if (valid.length !== parsed.length) {
              localStorage.setItem("pyur_cart", JSON.stringify(valid));
            }
          }
        }
      } catch (e) {
        console.error("Failed to load cart:", e);
      } finally {
        setIsLoaded(true);
      }
    }
  }, []);

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) => {
      const updated = prev
        .map((item) => {
          if (item && item.product && item.product.id === productId) {
            const newQty = (Number(item.quantity) || 1) + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as { product: Product; quantity: number }[];

      try {
        localStorage.setItem("pyur_cart", JSON.stringify(updated));
        window.dispatchEvent(new Event("pyur_cart_updated"));
      } catch {}

      return updated;
    });
  };

  const removeItem = (productId: string) => {
    setCart((prev) => {
      const updated = prev.filter(
        (item) => item && item.product && item.product.id !== productId
      );

      try {
        localStorage.setItem("pyur_cart", JSON.stringify(updated));
        window.dispatchEvent(new Event("pyur_cart_updated"));
      } catch {}

      return updated;
    });
  };

  const validCart = cart.filter(
    (item) => item && item.product && typeof item.product === "object" && item.product.id
  );

  const totalCount = validCart.reduce(
    (acc, item) => acc + (Number(item.quantity) || 1),
    0
  );

  const subtotal = validCart.reduce(
    (acc, item) =>
      acc + (Number(item.product?.price) || 0) * (Number(item.quantity) || 1),
    0
  );

  const totalMrp = validCart.reduce(
    (acc, item) =>
      acc +
      (Number(item.product?.compareAt) ||
        Math.round((Number(item.product?.price) || 0) * 1.2)) *
        (Number(item.quantity) || 1),
    0
  );

  const totalSavings = Math.max(0, totalMrp - subtotal);
  const freeShippingThreshold = 999;
  const progressToFreeShipping = Math.min(
    100,
    (subtotal / freeShippingThreshold) * 100
  );
  const isFreeDelivery = subtotal >= freeShippingThreshold;
  const deliveryCharge = isFreeDelivery || subtotal === 0 ? 0 : 99;
  const totalPayable = subtotal + deliveryCharge;

  const totalCoins = validCart.reduce(
    (acc, item) =>
      acc +
      (Number(item.product?.coinsEarned) ||
        Math.round((Number(item.product?.price) || 0) * 0.05)) *
        (Number(item.quantity) || 1),
    0
  );

  return (
    <div className="min-h-screen bg-[#f8faf1] text-[#17231b] flex flex-col justify-between">
      <div>
        <AnnouncementBar onOpenAppModal={() => {}} />
        <SiteHeader
          cart={cart}
          onUpdateQuantity={updateQuantity}
          onRemoveItem={removeItem}
          onOpenAppModal={() => {}}
          onOpenLoginModal={() => {}}
          onOpenConsultationModal={() => {}}
        />

        <main className="max-w-5xl mx-auto px-4 py-6 md:py-10 w-full">
          {/* Top Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-[#666666] mb-6">
            <Link href="/" className="hover:text-[#244f31] flex items-center gap-1 font-semibold">
              <ArrowLeft className="size-3.5" />
              <span>Continue Shopping</span>
            </Link>
            <span>/</span>
            <span className="font-bold text-[#17231b]">Shopping Basket</span>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-[#244f31] text-white shadow-xs">
                <ShoppingBag className="size-5" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-black text-[#17231b]">Your Herbal Basket</h1>
                <p className="text-xs text-[#666666]">
                  {validCart.length > 0 ? `${totalCount} item${totalCount > 1 ? "s" : ""} selected for wellness` : "Your basket is empty"}
                </p>
              </div>
            </div>
          </div>

          {!isLoaded ? (
            <div className="py-20 text-center">
              <div className="inline-block size-8 animate-spin rounded-full border-4 border-[#244f31] border-t-transparent" />
            </div>
          ) : validCart.length === 0 ? (
            /* Empty Cart View */
            <div className="rounded-3xl border border-[#ddddd9] bg-white p-8 md:p-14 text-center shadow-xs">
              <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-[#f8faf1] text-[#80a03c]">
                <ShoppingBag className="size-10 text-[#244f31]" />
              </div>
              <h2 className="mt-5 text-xl md:text-2xl font-black text-[#17231b]">Your Basket is Empty</h2>
              <p className="mt-2 text-xs md:text-sm text-[#666666] max-w-sm mx-auto">
                Looks like you haven&apos;t added any Ayurvedic formulations yet. Explore our high-altitude herbs and holistic remedies!
              </p>
              <div className="mt-6">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#244f31] px-6 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-[#1b3b24]"
                >
                  <ArrowLeft className="size-4" />
                  <span>Explore Products</span>
                </Link>
              </div>
            </div>
          ) : (
            /* Populated Cart Layout */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              {/* Left 2 Columns: Items */}
              <div className="lg:col-span-2 space-y-4">
                {/* Free Shipping Progress Card */}
                <div className="rounded-2xl border border-[#80a03c]/20 bg-[#eef5df] p-4 shadow-xs">
                  <div className="flex justify-between text-xs font-bold text-[#244f31]">
                    <span className="flex items-center gap-1.5">
                      <Truck className="size-4 text-[#80a03c]" />
                      {isFreeDelivery
                        ? "🎉 Congratulations! FREE Delivery Unlocked!"
                        : `Add ₹${freeShippingThreshold - subtotal} more for FREE Delivery`}
                    </span>
                    <span>{Math.round(progressToFreeShipping)}%</span>
                  </div>
                  <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-white/70">
                    <div
                      className="h-full bg-[#80a03c] transition-all duration-500 rounded-full"
                      style={{ width: `${progressToFreeShipping}%` }}
                    />
                  </div>
                </div>

                {/* Cart Items List */}
                <div className="space-y-3">
                  {validCart.map((item) => {
                    const product = item.product;
                    const quantity = Number(item.quantity) || 1;
                    const price = Number(product.price) || 0;
                    const compareAt = Number(product.compareAt) || Math.round(price * 1.2);
                    const coinsEarned = Number(product.coinsEarned) || Math.round(price * 0.05);
                    const imageSrc = product.image || "/brand/pure-ayur-logo.png";

                    return (
                      <div
                        key={product.id}
                        className="flex gap-3 md:gap-4 rounded-2xl border border-[#ddddd9] bg-white p-3.5 md:p-4 shadow-xs transition hover:border-[#244f31]/30"
                      >
                        <div className="relative size-20 md:size-24 shrink-0 rounded-xl overflow-hidden bg-[#f8faf1] border border-[#ddddd9]/50">
                          <Image
                            src={imageSrc}
                            alt={product.name || "Ayurvedic product"}
                            fill
                            sizes="96px"
                            className="object-cover"
                          />
                        </div>

                        <div className="flex flex-1 flex-col justify-between min-w-0">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="line-clamp-2 text-xs md:text-sm font-black text-[#17231b]">
                                {product.name}
                              </h3>
                              <button
                                onClick={() => removeItem(product.id)}
                                className="p-1 text-gray-400 hover:text-red-600 transition"
                                title="Remove item"
                              >
                                <Trash2 className="size-4" />
                              </button>
                            </div>
                            <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-[#80a03c]">
                              <Sparkles className="size-3" />
                              Earn {coinsEarned * quantity} Pyur Coins 🪙
                            </p>
                          </div>

                          <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-sm md:text-base font-black text-[#17231b]">
                                ₹{price * quantity}
                              </span>
                              {compareAt > price && (
                                <span className="text-xs text-gray-400 line-through">
                                  ₹{compareAt * quantity}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center rounded-lg border border-[#ddddd9] bg-white">
                              <button
                                onClick={() => updateQuantity(product.id, -1)}
                                className="p-1.5 hover:bg-[#f8faf1] text-[#17231b] transition"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="size-3" />
                              </button>
                              <span className="px-3 text-xs font-bold">{quantity}</span>
                              <button
                                onClick={() => updateQuantity(product.id, 1)}
                                className="p-1.5 hover:bg-[#f8faf1] text-[#17231b] transition"
                                aria-label="Increase quantity"
                              >
                                <Plus className="size-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Order Summary */}
              <div className="space-y-4">
                <div className="rounded-2xl border border-[#ddddd9] bg-white p-5 shadow-xs">
                  <h3 className="text-sm font-black uppercase tracking-wider text-[#17231b] pb-3 border-b border-[#ddddd9]">
                    Order Summary
                  </h3>

                  <div className="mt-4 space-y-2.5 text-xs">
                    <div className="flex justify-between text-gray-600">
                      <span>Item Subtotal ({totalCount} items)</span>
                      <span className="font-bold text-[#17231b]">₹{subtotal}</span>
                    </div>

                    {totalSavings > 0 && (
                      <div className="flex justify-between text-[#80a03c]">
                        <span>MRP Discount</span>
                        <span className="font-bold">-₹{totalSavings}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-gray-600">
                      <span>Delivery Fee</span>
                      <span className="font-bold text-[#17231b]">
                        {isFreeDelivery ? (
                          <span className="text-[#80a03c]">FREE</span>
                        ) : (
                          "₹99"
                        )}
                      </span>
                    </div>

                    <div className="border-t border-[#ddddd9] pt-3 flex justify-between items-baseline">
                      <span className="text-sm font-black text-[#17231b]">Total Payable</span>
                      <div className="text-right">
                        <span className="text-xl font-black text-[#244f31]">₹{totalPayable}</span>
                        <span className="block text-[10px] text-gray-500">Taxes Included</span>
                      </div>
                    </div>
                  </div>

                  {totalCoins > 0 && (
                    <div className="mt-4 p-2.5 rounded-xl bg-[#f8faf1] border border-[#ddddd9]/60 flex items-center gap-2 text-xs font-bold text-[#244f31]">
                      <span>🪙</span>
                      <span>You will earn {totalCoins} Pyur Coins on this order!</span>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      if (validCart.length > 0 && validCart[0].product?.id) {
                        window.location.href = `/checkout?productId=${validCart[0].product.id}&quantity=${validCart[0].quantity || 1}`;
                      }
                    }}
                    className="mt-5 w-full rounded-xl bg-[#244f31] py-3.5 text-sm font-black uppercase tracking-wider text-white shadow-lg transition hover:bg-[#1b3b24]"
                  >
                    Proceed to Checkout
                  </button>

                  <div className="mt-4 flex items-center justify-center gap-2 text-[11px] font-semibold text-gray-500">
                    <ShieldCheck className="size-4 text-[#80a03c]" />
                    <span>Safe & Secure 256-Bit Encrypted Checkout</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#ddddd9] bg-white p-4 text-xs space-y-2 text-gray-600">
                  <div className="flex items-center gap-2 font-bold text-[#244f31]">
                    <CheckCircle2 className="size-4 text-[#80a03c]" />
                    <span>100% Authentic Himalayan Herbs</span>
                  </div>
                  <div className="flex items-center gap-2 font-bold text-[#244f31]">
                    <CheckCircle2 className="size-4 text-[#80a03c]" />
                    <span>Cash on Delivery (COD) Available</span>
                  </div>
                  <div className="flex items-center gap-2 font-bold text-[#244f31]">
                    <CheckCircle2 className="size-4 text-[#80a03c]" />
                    <span>Easy 7-Day Hassle-Free Returns</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <SiteFooter />
    </div>
  );
}
