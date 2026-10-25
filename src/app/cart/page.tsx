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
    const syncCart = () => {
      if (typeof window === "undefined") return;
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
        } else {
          setCart([]);
        }
      } catch (e) {
        console.error("Failed to load cart:", e);
      } finally {
        setIsLoaded(true);
      }
    };

    syncCart();
    window.addEventListener("storage", syncCart);
    window.addEventListener("pyur_cart_updated", syncCart);
    return () => {
      window.removeEventListener("storage", syncCart);
      window.removeEventListener("pyur_cart_updated", syncCart);
    };
  }, []);

  const updateQuantity = (productId: string, delta: number) => {
    let currentCart = cart;
    try {
      const stored = localStorage.getItem("pyur_cart");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) currentCart = parsed;
      }
    } catch {}

    const updated = currentCart
      .map((item) => {
        if (item && item.product && item.product.id === productId) {
          const newQty = (Number(item.quantity) || 1) + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      })
      .filter(Boolean) as { product: Product; quantity: number }[];

    setCart(updated);
    try {
      localStorage.setItem("pyur_cart", JSON.stringify(updated));
      setTimeout(() => {
        window.dispatchEvent(new Event("pyur_cart_updated"));
      }, 0);
    } catch {}
  };

  const removeItem = (productId: string) => {
    let currentCart = cart;
    try {
      const stored = localStorage.getItem("pyur_cart");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) currentCart = parsed;
      }
    } catch {}

    const updated = currentCart.filter(
      (item) => item && item.product && item.product.id !== productId
    );

    setCart(updated);
    try {
      localStorage.setItem("pyur_cart", JSON.stringify(updated));
      setTimeout(() => {
        window.dispatchEvent(new Event("pyur_cart_updated"));
      }, 0);
    } catch {}
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

  const totalCoins = validCart.reduce((acc, item) => {
    const prod = item.product;
    const isCoinsActive = prod?.showCoins !== false && (prod?.coinsEarned !== undefined ? Number(prod.coinsEarned) > 0 : true);
    const coins = prod?.showCoins === false ? 0 : (prod?.coinsEarned !== undefined ? Number(prod.coinsEarned) : Math.round((Number(prod?.price) || 0) * 0.05));
    return acc + (isCoinsActive ? coins * (Number(item.quantity) || 1) : 0);
  }, 0);

  // For logged-in users, automatically sync active cart for WhatsApp recovery
  useEffect(() => {
    if (!isLoaded || validCart.length === 0) return;

    const timer = setTimeout(() => {
      fetch("/api/auth/me", { credentials: "include", cache: "no-store" })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.success && data.user && data.user.phone) {
            fetch("/api/cart/abandoned", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({
                name: data.user.name || "Valued Customer",
                phone: data.user.phone,
                email: data.user.email || "",
                items: validCart.map((i) => ({
                  id: i.product.id,
                  name: i.product.name,
                  quantity: i.quantity,
                  price: i.product.price,
                })),
                cartTotal: subtotal,
              }),
            }).catch(() => {});
          }
        })
        .catch(() => {});
    }, 2000);

    return () => clearTimeout(timer);
  }, [isLoaded, validCart.length, subtotal]);


  return (
    <div className="min-h-screen bg-white text-neutral-900 flex flex-col justify-between">
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
          <div className="flex items-center gap-2 text-xs text-neutral-500 mb-6">
            <Link href="/" className="hover:text-[#023915] flex items-center gap-1 font-semibold">
              <ArrowLeft className="size-3.5" />
              <span>Continue Shopping</span>
            </Link>
            <span>/</span>
            <span className="font-bold text-neutral-900">Shopping Basket</span>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-[#023915] text-white shadow-xs">
                <ShoppingBag className="size-5" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-neutral-900">Your Herbal Basket</h1>
                <p className="text-xs text-neutral-500">
                  {validCart.length > 0 ? `${totalCount} item${totalCount > 1 ? "s" : ""} selected for wellness` : "Your basket is empty"}
                </p>
              </div>
            </div>
          </div>

          {!isLoaded ? (
            <div className="py-20 text-center">
              <div className="inline-block size-8 animate-spin rounded-full border-4 border-[#023915] border-t-transparent" />
            </div>
          ) : validCart.length === 0 ? (
            /* Empty Cart View */
            <div className="rounded-3xl border border-neutral-200/80 bg-white p-8 md:p-14 text-center shadow-xs">
              <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-[#f8f9fa] text-[#023915]">
                <ShoppingBag className="size-10 text-[#023915]" />
              </div>
              <h2 className="mt-5 text-xl md:text-2xl font-bold text-neutral-900">Your Basket is Empty</h2>
              <p className="mt-2 text-xs md:text-sm text-neutral-500 max-w-sm mx-auto">
                Looks like you haven&apos;t added any Ayurvedic formulations yet. Explore our high-altitude herbs and holistic remedies!
              </p>
              <div className="mt-6">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#023915] px-6 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-black"
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
                <div className="rounded-2xl border border-neutral-200 bg-[#c2d4c5]/30 p-4 shadow-xs">
                  <div className="flex justify-between text-xs font-bold text-[#023915]">
                    <span className="flex items-center gap-1.5">
                      <Truck className="size-4 text-[#023915]" />
                      {isFreeDelivery
                        ? "🎉 Congratulations! FREE Delivery Unlocked!"
                        : `Add ₹${freeShippingThreshold - subtotal} more for FREE Delivery`}
                    </span>
                    <span>{Math.round(progressToFreeShipping)}%</span>
                  </div>
                  <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-white/70">
                    <div
                      className="h-full bg-[#023915] transition-all duration-500 rounded-full"
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
                    const isCoinsActive = product.showCoins !== false && (product.coinsEarned !== undefined ? Number(product.coinsEarned) > 0 : true);
                    const coinsEarned = product.showCoins === false ? 0 : (product.coinsEarned !== undefined ? Number(product.coinsEarned) : Math.round(price * 0.05));
                    const imageSrc = product.image || "/brand/pure-ayur-logo.png";

                    return (
                      <div
                        key={product.id}
                        className="flex gap-3 md:gap-4 rounded-2xl border border-neutral-200/80 bg-white p-3.5 md:p-4 shadow-2xs transition hover:border-neutral-300"
                      >
                        <div className="relative size-20 md:size-24 shrink-0 rounded-xl overflow-hidden bg-white border border-neutral-200">
                          <Image
                            src={imageSrc}
                            alt={product.name || "Ayurvedic product"}
                            fill
                            sizes="96px"
                            className="object-contain p-1"
                          />
                        </div>

                        <div className="flex flex-1 flex-col justify-between min-w-0">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="line-clamp-2 text-xs md:text-sm font-bold text-neutral-900">
                                {product.name}
                              </h3>
                              <button
                                onClick={() => removeItem(product.id)}
                                className="p-1 text-neutral-400 hover:text-red-600 transition cursor-pointer"
                                title="Remove item"
                              >
                                <Trash2 className="size-4" />
                              </button>
                            </div>
                            {isCoinsActive && coinsEarned > 0 && (
                              <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                                <Sparkles className="size-3" />
                                Earn {coinsEarned * quantity} Pure Coins 🪙
                              </p>
                            )}
                          </div>

                          <div className="flex items-center justify-between mt-3 pt-2 border-t border-neutral-100">
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-sm md:text-base font-bold text-neutral-900">
                                ₹{price * quantity}
                              </span>
                              {compareAt > price && (
                                <span className="text-xs text-neutral-400 line-through">
                                  ₹{compareAt * quantity}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center rounded-lg border border-neutral-200 bg-white">
                              <button
                                onClick={() => updateQuantity(product.id, -1)}
                                className="p-1.5 hover:bg-neutral-100 text-neutral-900 transition cursor-pointer"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="size-3" />
                              </button>
                              <span className="px-3 text-xs font-bold text-neutral-900">{quantity}</span>
                              <button
                                onClick={() => updateQuantity(product.id, 1)}
                                className="p-1.5 hover:bg-neutral-100 text-neutral-900 transition cursor-pointer"
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
                <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 pb-3 border-b border-neutral-200">
                    Order Summary
                  </h3>

                  <div className="mt-4 space-y-2.5 text-xs">
                    <div className="flex justify-between text-neutral-600">
                      <span>Item Subtotal ({totalCount} items)</span>
                      <span className="font-bold text-neutral-900">₹{subtotal}</span>
                    </div>

                    {totalSavings > 0 && (
                      <div className="flex justify-between text-emerald-700">
                        <span>MRP Discount</span>
                        <span className="font-bold">-₹{totalSavings}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-neutral-600">
                      <span>Delivery Fee</span>
                      <span className="font-bold text-neutral-900">
                        {isFreeDelivery ? (
                          <span className="text-emerald-700">FREE</span>
                        ) : (
                          "₹99"
                        )}
                      </span>
                    </div>

                    <div className="border-t border-neutral-200 pt-3 flex justify-between items-baseline">
                      <span className="text-sm font-bold text-neutral-900">Total Payable</span>
                      <div className="text-right">
                        <span className="text-xl font-bold text-[#023915]">₹{totalPayable}</span>
                        <span className="block text-[10px] text-neutral-500">Taxes Included</span>
                      </div>
                    </div>
                  </div>

                  {totalCoins > 0 && (
                    <div className="mt-4 p-2.5 rounded-xl bg-[#f5f5f5] border border-neutral-200 flex items-center gap-2 text-xs font-bold text-[#023915]">
                      <span>🪙</span>
                      <span>You will earn {totalCoins} Pure Coins on this order!</span>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      if (validCart.length > 0 && validCart[0].product?.id) {
                        const p = validCart[0].product;
                        const q = validCart[0].quantity || 1;
                        const priceParam = p.price ? `&price=${p.price}` : "";
                        const nameParam = p.name ? `&variantName=${encodeURIComponent(p.name)}` : "";
                        const imgParam = p.image ? `&variantImage=${encodeURIComponent(p.image)}` : "";
                        const storedCoupon = typeof window !== "undefined" ? localStorage.getItem("pyur_applied_coupon") : null;
                        const couponParam = storedCoupon ? `&coupon=${encodeURIComponent(storedCoupon)}` : "";
                        window.location.href = `/checkout?productId=${encodeURIComponent(p.id)}&quantity=${q}${priceParam}${nameParam}${imgParam}${couponParam}`;
                      }
                    }}
                    className="mt-5 w-full rounded-xl bg-[#023915] py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-md transition hover:bg-black cursor-pointer"
                  >
                    Proceed to Checkout
                  </button>

                  <div className="mt-4 flex items-center justify-center gap-2 text-[11px] font-semibold text-neutral-500">
                    <ShieldCheck className="size-4 text-[#023915]" />
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
                    <span>3-Day Returns (Wrong/Damaged Items)</span>
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
