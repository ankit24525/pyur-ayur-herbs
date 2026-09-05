"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  MapPin,
  ShoppingBag,
  Menu,
  X,
  User,
  Truck,
  Sparkles,
  ChevronRight,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { headerSearchSuggestions, menuLinks, products, Product } from "@/lib/store";

interface SiteHeaderProps {
  cart: { product: Product; quantity: number }[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onOpenAppModal: () => void;
  onOpenLoginModal: () => void;
  onOpenConsultationModal: () => void;
  products?: Product[];
}

export default function SiteHeader({
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onOpenAppModal,
  onOpenLoginModal,
  onOpenConsultationModal,
  products: initialProducts,
}: SiteHeaderProps) {
  const [suggestionIdx, setSuggestionIdx] = useState(0);
  const [user, setUser] = useState<any>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("pyur_user");
        return cached ? JSON.parse(cached) : null;
      } catch {
        return null;
      }
    }
    return null;
  });
  const [mounted, setMounted] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    setMounted(true);
    // 1. Instant sync from local cache on mount
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("pyur_user");
        if (cached) {
          setUser(JSON.parse(cached));
        }
      } catch {}
    }

    // 2. Validate session in background
    fetch("/api/auth/me", { credentials: "include", cache: "no-store" })
      .then((res) => {
        if (!res.ok) {
          setUser(null);
          try { localStorage.removeItem("pyur_user"); } catch {}
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.success && data.user) {
          setUser(data.user);
          try { localStorage.setItem("pyur_user", JSON.stringify(data.user)); } catch {}
        } else {
          setUser(null);
          try { localStorage.removeItem("pyur_user"); } catch {}
        }
      })
      .catch(() => {})
      .finally(() => {
        setAuthChecked(true);
      });
  }, []);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [catalog, setCatalog] = useState<Product[]>(initialProducts || []);

  useEffect(() => {
    if (initialProducts && initialProducts.length > 0) {
      setCatalog(initialProducts);
      return;
    }
    fetch("/api/storefront", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data.products && Array.isArray(data.products)) {
          setCatalog(data.products);
        }
      })
      .catch(() => {});
  }, [initialProducts]);

  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [pincodeModalOpen, setPincodeModalOpen] = useState(false);
  const [pincodeInput, setPincodeInput] = useState("");
  const [verifiedPincode, setVerifiedPincode] = useState<string | null>(null);
  const [trackOrderOpen, setTrackOrderOpen] = useState(false);
  const [orderIdInput, setOrderIdInput] = useState("");
  const [trackedStatus, setTrackedStatus] = useState<string | null>(null);

  const [showToast, setShowToast] = useState(false);
  const [isBouncing, setIsBouncing] = useState(false);
  const prevCartCountRef = useRef(0);
  const isMountedRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    prevCartCountRef.current = (cart || []).reduce((acc, item) => acc + ((item && item.quantity) || 0), 0);
  }, []);

  const totalCartCount = (cart || []).reduce((acc, item) => acc + ((item && item.quantity) || 0), 0);

  useEffect(() => {
    if (!isMountedRef.current) return;

    if (totalCartCount > prevCartCountRef.current) {
      setShowToast(true);
      setIsBouncing(true);

      const bounceTimer = setTimeout(() => setIsBouncing(false), 800);
      const toastTimer = setTimeout(() => setShowToast(false), 3000);

      return () => {
        clearTimeout(bounceTimer);
        clearTimeout(toastTimer);
      };
    }
    prevCartCountRef.current = totalCartCount;
  }, [totalCartCount]);

  // Cycle search placeholders every 2.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setSuggestionIdx((prev) => (prev + 1) % (headerSearchSuggestions.length || 1));
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  // Live search filter
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    const q = searchQuery.toLowerCase().trim();
    const filtered = (catalog || []).filter(
      (p) =>
        (p?.name || "").toLowerCase().includes(q) ||
        (p?.concern || "").toLowerCase().includes(q) ||
        (Array.isArray(p?.ingredients) && p.ingredients.some((ing: any) => (typeof ing === "string" ? ing : (ing as any)?.name || "").toLowerCase().includes(q)))
    );
    setSearchResults(filtered);
    setIsSearching(true);
  }, [searchQuery, catalog]);

  const cartSubtotal = (cart || []).reduce(
    (acc, item) => acc + ((item && item.product && item.product.price) || 0) * ((item && item.quantity) || 1),
    0
  );
  const freeShippingThreshold = 999;
  const progressToFreeShipping = Math.min(100, (cartSubtotal / freeShippingThreshold) * 100);

  const handleVerifyPincode = (e: React.FormEvent) => {
    e.preventDefault();
    if (pincodeInput.length === 6) {
      setVerifiedPincode(pincodeInput);
      setPincodeModalOpen(false);
    }
  };

  const handleTrackOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderIdInput.trim()) {
      setTrackOrderOpen(false);
      window.location.href = `/track?orderId=${encodeURIComponent(orderIdInput.trim())}`;
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-[#ddddd9] bg-white shadow-sm">
        {/* Main Navigation Row */}
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-3 px-3 md:h-20 md:gap-6 md:px-6">
          {/* Left: Mobile Menu & Brand Logo */}
          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={() => setMenuOpen(true)}
              className="rounded-md p-1.5 text-[#17231b] transition hover:bg-[#f8faf1]"
              aria-label="Open Navigation Menu"
            >
              <Menu className="size-6 md:size-7" />
            </button>

            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative flex size-12 items-center justify-center rounded-full bg-white p-0.5 shadow-md border border-[#244f31]/20 md:size-14 shrink-0 overflow-hidden">
                <Image
                  src="/brand/pure-ayur-logo.png"
                  alt="Pure Ayur Herbs Logo"
                  width={70}
                  height={70}
                  className="size-full rounded-full object-cover group-hover:scale-105 transition-transform duration-300"
                  priority
                />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-base font-black uppercase tracking-wider text-[#244f31] md:text-xl">
                  PURE AYUR
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#80a03c] md:text-xs">
                  HERBS
                </span>
              </div>
            </Link>
          </div>

          {/* Location & Pincode Checker (Desktop) */}
          <button
            onClick={() => setPincodeModalOpen(true)}
            className="hidden items-center gap-2 rounded-lg border border-[#ddddd9] bg-[#f8faf1] px-3 py-1.5 text-left transition hover:border-[#80a03c] lg:flex"
          >
            <MapPin className="size-4 shrink-0 text-[#244f31]" />
            <div className="flex flex-col leading-tight">
              <span className="text-xs font-bold text-[#17231b]">
                {verifiedPincode ? `Delivering to ${verifiedPincode}` : "Verify Pincode"}
              </span>
              <span className="text-[11px] font-medium text-[#666666]">
                {verifiedPincode ? "Serviceable Area" : "For accurate delivery date"}
              </span>
            </div>
            <ChevronRight className="size-3.5 text-[#80a03c]" />
          </button>

          {/* Center: Search Bar with Rotating Suggestions */}
          <div className="relative flex-1 max-w-xl hidden md:block">
            <div className="relative flex items-center rounded-lg border border-[#666666] bg-white px-3 py-2 transition-all focus-within:border-[#244f31] focus-within:ring-1 focus-within:ring-[#244f31]">
              <Search className="size-4 shrink-0 text-[#666666] md:size-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search for "${headerSearchSuggestions[suggestionIdx]}"`}
                className="w-full pl-2 text-xs text-[#17231b] outline-none placeholder:text-[#666666] md:text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="p-1 text-[#666666] hover:text-[#17231b]"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>

            {/* Live Search Results Dropdown */}
            {isSearching && (
              <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-96 overflow-y-auto rounded-lg border border-[#ddddd9] bg-white shadow-xl">
                {searchResults.length > 0 ? (
                  <div className="divide-y divide-[#ddddd9]">
                    <div className="bg-[#f8faf1] px-4 py-2 text-xs font-bold text-[#244f31]">
                      Found {searchResults.length} matching herbal products
                    </div>
                    {searchResults.map((product) => (
                      <a
                        key={product.id}
                        href={`/products/${product.slug}`}
                        onClick={() => {
                          setSearchQuery("");
                          setIsSearching(false);
                        }}
                        className="flex cursor-pointer items-center gap-3 p-3 transition hover:bg-[#f8faf1]"
                      >
                        <Image
                          src={product.image}
                          alt={product.name}
                          width={48}
                          height={48}
                          className="size-12 rounded object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="line-clamp-1 text-xs font-bold text-[#17231b] md:text-sm">
                            {product.name}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-[#666666]">
                            <span className="font-semibold text-[#244f31]">₹{product.price}</span>
                            <span className="line-through">₹{product.compareAt}</span>
                            <span className="rounded bg-[#eef5df] px-1.5 py-0.5 text-[10px] font-bold text-[#244f31]">
                              {product.concern}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateQuantity(product.id, 1);
                          }}
                          className="rounded bg-[#80a03c] px-3 py-1 text-xs font-bold text-white transition hover:bg-[#244f31]"
                        >
                          ADD
                        </button>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-xs font-medium text-[#666666]">
                    No matching products found for "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Action Icons & Buttons */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Get App Button */}
            <button
              onClick={onOpenAppModal}
              className="hidden rounded-md border border-[#17231b] px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#17231b] transition hover:bg-[#244f31] hover:text-white lg:block"
            >
              GET APP
            </button>

            {/* Login Button / Profile */}
            {!mounted ? (
              <div className="h-7 w-20 hidden sm:block" />
            ) : user ? (
              <>
                <div className="relative group hidden sm:block">
                  <Link
                    href="/profile?tab=orders"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase text-[#17231b] bg-[#f8faf1] rounded-md border border-[#ddddd9] hover:bg-[#eef2db] transition"
                  >
                    <User className="size-3.5 text-[#244f31]" />
                    <span>Hi, {(user?.name || "Member").split(" ")[0]}!</span>
                  </Link>
                  
                  {/* Hover Dropdown Menu */}
                  <div className="absolute right-0 top-full mt-1 z-50 w-48 rounded-xl border border-[#ddddd9] bg-white p-2 shadow-xl opacity-0 translate-y-1 invisible group-hover:opacity-100 group-hover:translate-y-0 group-hover:visible transition-all duration-200">
                    <div className="px-3 py-2 border-b border-[#f0f0eb] text-xs font-semibold text-[#666666]">
                      Hi, {user?.name || "Member"}!
                    </div>
                    <div className="flex flex-col py-1">
                      <Link
                        href="/profile?tab=orders"
                        className="rounded-lg px-3 py-1.5 text-xs font-semibold text-[#17231b] transition hover:bg-[#f8faf1] hover:text-[#244f31]"
                      >
                        Orders
                      </Link>
                      <Link
                        href="/profile?tab=wallet"
                        className="rounded-lg px-3 py-1.5 text-xs font-semibold text-[#17231b] transition hover:bg-[#f8faf1] hover:text-[#244f31]"
                      >
                        Wallet
                      </Link>
                      <Link
                        href="/profile?tab=addresses"
                        className="rounded-lg px-3 py-1.5 text-xs font-semibold text-[#17231b] transition hover:bg-[#f8faf1] hover:text-[#244f31]"
                      >
                        Addresses
                      </Link>
                      <Link
                        href="/profile?tab=recently-viewed"
                        className="rounded-lg px-3 py-1.5 text-xs font-semibold text-[#17231b] transition hover:bg-[#f8faf1] hover:text-[#244f31]"
                      >
                        Recently Viewed
                      </Link>
                      <Link
                        href="/profile?tab=settings"
                        className="rounded-lg px-3 py-1.5 text-xs font-semibold text-[#17231b] transition hover:bg-[#f8faf1] hover:text-[#244f31]"
                      >
                        Account Settings
                      </Link>
                      <Link
                        href="/contact-us"
                        className="rounded-lg px-3 py-1.5 text-xs font-semibold text-[#17231b] transition hover:bg-[#f8faf1] hover:text-[#244f31]"
                      >
                        Contact Us
                      </Link>
                    </div>
                    <div className="border-t border-[#f0f0eb] pt-1 mt-1">
                      <button
                        onClick={async () => {
                          setUser(null);
                          if (typeof window !== "undefined") {
                            localStorage.removeItem("pyur_session");
                            localStorage.removeItem("pyur_user");
                            sessionStorage.clear();
                            document.cookie = "pyur_session=; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT";
                          }
                          try {
                            await fetch("/api/auth/logout", {
                              method: "POST",
                              credentials: "include",
                              cache: "no-store",
                              keepalive: true,
                            });
                          } catch {}
                          window.location.href = "/";
                        }}
                        className="w-full text-left rounded-lg px-3 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-50 cursor-pointer"
                      >
                        SIGN OUT
                      </button>
                    </div>
                  </div>
                </div>

                {/* Mobile Profile Icon Button */}
                <Link
                  href="/profile?tab=orders"
                  className="sm:hidden rounded-md p-1.5 text-[#17231b] hover:bg-[#f8faf1] transition"
                  title="My Profile"
                >
                  <User className="size-6 text-[#244f31]" />
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden items-center gap-1 rounded-md border border-[#17231b] px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#17231b] transition hover:bg-[#244f31] hover:text-white sm:flex"
                >
                  <User className="size-3.5" />
                  <span>LOGIN</span>
                </Link>

                {/* Mobile Login Icon Button */}
                <Link
                  href="/login"
                  className="sm:hidden rounded-md p-1.5 text-[#17231b] hover:bg-[#f8faf1] transition"
                  title="Login / Sign Up"
                >
                  <User className="size-6 text-[#17231b]" />
                </Link>
              </>
            )}

            {/* Track Order Icon */}
            <button
              onClick={() => setTrackOrderOpen(true)}
              className="rounded-md p-2 text-[#17231b] transition hover:bg-[#f8faf1]"
              title="Track Order"
            >
              <Truck className="size-5 md:size-6" />
            </button>

            {/* Shopping Cart Drawer Trigger */}
            <div className="relative">
              <button
                onClick={() => setCartOpen(true)}
                className={`relative rounded-md p-2 text-[#17231b] transition duration-300 ${
                  isBouncing ? "scale-110 text-[#80a03c]" : "hover:bg-[#f8faf1]"
                }`}
                aria-label="Shopping Cart"
              >
                <ShoppingBag className={`size-5 md:size-6 transition-transform duration-300 ${isBouncing ? "scale-110" : ""}`} />
                {totalCartCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-[#c9704c] text-[10px] font-bold text-white shadow-sm">
                    {totalCartCount}
                  </span>
                )}
              </button>

              {/* Floating Basket Toast Notification */}
              {showToast && (
                <div className="absolute right-0 top-full mt-2.5 z-50 w-52 rounded-xl border border-[#ddddd9] bg-white p-3 shadow-xl animate-toast-in">
                  {/* Small Arrow pointing up to the basket */}
                  <div className="absolute -top-1.5 right-4 size-3 rotate-45 border-t border-l border-[#ddddd9] bg-white" />
                  
                  <div className="flex items-center gap-2 text-xs font-bold text-[#244f31]">
                    <CheckCircle2 className="size-4 shrink-0 text-[#80a03c]" />
                    <span>Product added to basket</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Bar Row (Mobile only: md:hidden) */}
        <div className="px-3 pb-3 md:hidden">
          <div className="relative">
            <div className="relative flex items-center rounded-lg border border-[#666666] bg-white px-3 py-2 transition-all focus-within:border-[#244f31] focus-within:ring-1 focus-within:ring-[#244f31]">
              <Search className="size-4 shrink-0 text-[#666666]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search for "${headerSearchSuggestions[suggestionIdx]}"`}
                className="w-full pl-2 text-xs text-[#17231b] outline-none placeholder:text-[#666666]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="p-1 text-[#666666] hover:text-[#17231b]"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>

            {/* Live Search Results Dropdown */}
            {isSearching && (
              <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-96 overflow-y-auto rounded-lg border border-[#ddddd9] bg-white shadow-xl">
                {searchResults.length > 0 ? (
                  <div className="divide-y divide-[#ddddd9]">
                    <div className="bg-[#f8faf1] px-4 py-2 text-xs font-bold text-[#244f31]">
                      Found {searchResults.length} matching herbal products
                    </div>
                    {searchResults.map((product) => (
                      <a
                        key={product.id}
                        href={`/products/${product.slug}`}
                        onClick={() => {
                          setSearchQuery("");
                          setIsSearching(false);
                        }}
                        className="flex cursor-pointer items-center gap-3 p-3 transition hover:bg-[#f8faf1]"
                      >
                        <Image
                          src={product.image}
                          alt={product.name}
                          width={48}
                          height={48}
                          className="size-12 rounded object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="line-clamp-1 text-xs font-bold text-[#17231b]">
                            {product.name}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-[#666666]">
                            <span className="font-semibold text-[#244f31]">₹{product.price}</span>
                            <span className="line-through">₹{product.compareAt}</span>
                            <span className="rounded bg-[#eef5df] px-1.5 py-0.5 text-[10px] font-bold text-[#244f31]">
                              {product.concern}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateQuantity(product.id, 1);
                          }}
                          className="rounded bg-[#80a03c] px-3 py-1 text-xs font-bold text-white transition hover:bg-[#244f31]"
                        >
                          ADD
                        </button>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-xs font-medium text-[#666666]">
                    No matching products found for "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Pincode Delivery Strip */}
        <div className="flex items-center justify-between border-t border-[#ddddd9] bg-[#f8faf1] px-4 py-2 lg:hidden">
          <div className="flex items-center gap-1.5 text-xs font-medium text-[#17231b]">
            <MapPin className="size-3.5 text-[#244f31]" />
            <span>{verifiedPincode ? `Delivery to ${verifiedPincode}` : "Verify pincode for accurate delivery"}</span>
          </div>
          <button
            onClick={() => setPincodeModalOpen(true)}
            className="text-xs font-bold text-[#80a03c] underline"
          >
            {verifiedPincode ? "Change" : "Verify"}
          </button>
        </div>
      </header>

      {/* Drawer Navigation Menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMenuOpen(false)}
          />
          <div className="relative z-10 flex w-full max-w-xs flex-col bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#ddddd9] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="relative flex size-9 items-center justify-center rounded-full bg-white p-0.5 border border-[#244f31]/20 overflow-hidden shrink-0">
                  <Image
                    src="/brand/pure-ayur-logo.png"
                    alt="Pure Ayur Herbs Logo"
                    width={36}
                    height={36}
                    className="size-full rounded-full object-cover"
                  />
                </div>
                <span className="font-black text-[#244f31] text-sm tracking-wider uppercase">PURE AYUR HERBS</span>
              </div>
              <button
                onClick={() => setMenuOpen(false)}
                className="rounded-full p-1 text-[#666666] hover:bg-[#f8faf1]"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="mt-6 flex flex-col gap-4">
              {!mounted ? (
                <div className="h-11 rounded-xl bg-gray-100 animate-pulse" />
              ) : user ? (
                <div className="bg-[#f8faf1] p-3.5 rounded-xl border border-[#ddddd9] flex flex-col gap-2.5">
                  <div className="flex items-center justify-between pb-2 border-b border-[#ddddd9]/60">
                    <div className="flex items-center gap-2">
                      <User className="size-4 text-[#244f31]" />
                      <span className="font-bold text-[#17231b] text-sm">Hello, {(user?.name || "Member").split(" ")[0]}</span>
                    </div>
                    <button
                      onClick={async () => {
                        setUser(null);
                        if (typeof window !== "undefined") {
                          localStorage.removeItem("pyur_session");
                          localStorage.removeItem("pyur_user");
                          sessionStorage.clear();
                          document.cookie = "pyur_session=; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT";
                        }
                        try {
                          await fetch("/api/auth/logout", {
                            method: "POST",
                            credentials: "include",
                            cache: "no-store",
                            keepalive: true,
                          });
                        } catch {}
                        window.location.href = "/";
                      }}
                      className="text-xs font-bold text-red-600 hover:underline cursor-pointer"
                    >
                      Logout
                    </button>
                  </div>
                  <div className="flex flex-col gap-2 text-xs font-bold text-[#17231b]">
                    <Link
                      href="/profile?tab=orders"
                      onClick={() => setMenuOpen(false)}
                      className="hover:text-[#244f31] flex items-center gap-1.5"
                    >
                      📦 My Orders
                    </Link>
                    <Link
                      href="/profile?tab=wallet"
                      onClick={() => setMenuOpen(false)}
                      className="hover:text-[#244f31] flex items-center gap-1.5"
                    >
                      🪙 My Wallet (Coins)
                    </Link>
                    <Link
                      href="/profile?tab=addresses"
                      onClick={() => setMenuOpen(false)}
                      className="hover:text-[#244f31] flex items-center gap-1.5"
                    >
                      📍 Saved Addresses
                    </Link>
                    <Link
                      href="/profile?tab=settings"
                      onClick={() => setMenuOpen(false)}
                      className="hover:text-[#244f31] flex items-center gap-1.5"
                    >
                      ⚙️ Account Settings
                    </Link>
                  </div>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 rounded-xl border border-[#17231b] p-3 text-sm font-bold text-[#17231b] justify-center hover:bg-[#244f31] hover:text-white transition"
                >
                  <User className="size-4" />
                  <span>LOGIN / SIGN UP</span>
                </Link>
              )}

              {menuLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="text-base font-semibold text-[#17231b] transition hover:text-[#80a03c]"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Cart Slide-out Drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setCartOpen(false)}
          />
          <div className="relative z-10 flex w-full max-w-md flex-col bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#ddddd9] p-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="size-5 text-[#244f31]" />
                <h3 className="text-lg font-bold text-[#17231b]">Your Herbal Basket ({totalCartCount})</h3>
              </div>
              <button
                onClick={() => setCartOpen(false)}
                className="rounded-full p-1 text-[#666666] hover:bg-[#f8faf1]"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Free Shipping Bar */}
            <div className="bg-[#eef5df] px-4 py-3">
              <div className="flex justify-between text-xs font-bold text-[#244f31]">
                <span>
                  {cartSubtotal >= freeShippingThreshold
                    ? "🎉 FREE Delivery Unlocked!"
                    : `Add ₹${freeShippingThreshold - cartSubtotal} more for FREE Delivery`}
                </span>
                <span>{Math.round(progressToFreeShipping)}%</span>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[#ddddd9]">
                <div
                  className="h-full bg-[#80a03c] transition-all duration-500"
                  style={{ width: `${progressToFreeShipping}%` }}
                />
              </div>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {cart.length > 0 ? (
                <div className="space-y-4">
                  {cart.map(({ product, quantity }) => (
                    <div
                      key={product.id}
                      className="flex gap-3 rounded-lg border border-[#ddddd9] p-3"
                    >
                      <Image
                        src={product.image}
                        alt={product.name}
                        width={64}
                        height={64}
                        className="size-16 rounded object-cover"
                      />
                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <h4 className="line-clamp-1 text-xs font-bold text-[#17231b]">
                            {product.name}
                          </h4>
                          <span className="text-[10px] font-semibold text-[#80a03c]">
                            Earn {product.coinsEarned * quantity} Pyur Coins 🪙
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1 text-xs font-bold text-[#17231b]">
                            <span>₹{product.price * quantity}</span>
                            <span className="text-[10px] text-[#666666] line-through">
                              ₹{product.compareAt * quantity}
                            </span>
                          </div>
                          <div className="flex items-center rounded border border-[#ddddd9]">
                            <button
                              onClick={() => onUpdateQuantity(product.id, -1)}
                              className="p-1 hover:bg-[#f8faf1]"
                            >
                              <Minus className="size-3" />
                            </button>
                            <span className="px-2 text-xs font-bold">{quantity}</span>
                            <button
                              onClick={() => onUpdateQuantity(product.id, 1)}
                              className="p-1 hover:bg-[#f8faf1]"
                            >
                              <Plus className="size-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => onRemoveItem(product.id)}
                        className="self-start text-[#666666] hover:text-[#c9704c]"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <ShoppingBag className="size-12 text-[#ddddd9]" />
                  <p className="mt-3 text-sm font-bold text-[#17231b]">Your herbal basket is empty</p>
                  <p className="mt-1 text-xs text-[#666666]">Explore our Kapiva-inspired remedies!</p>
                </div>
              )}
            </div>

            {/* Footer Checkout */}
            {cart.length > 0 && (
              <div className="border-t border-[#ddddd9] bg-white p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-[#17231b]">Total Payable</span>
                  <div className="text-right">
                    <span className="text-lg font-black text-[#244f31]">₹{cartSubtotal}</span>
                    <span className="block text-[10px] text-[#666666]">Taxes included</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (cart.length > 0) {
                      window.location.href = `/checkout?productId=${cart[0].product.id}&quantity=${cart[0].quantity}`;
                    }
                  }}
                  className="w-full rounded-lg bg-[#244f31] py-3 text-sm font-bold tracking-wider text-white shadow-lg transition hover:bg-[#1d3b24]"
                >
                  PROCEED TO CHECKOUT
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pincode Modal */}
      {pincodeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setPincodeModalOpen(false)}
          />
          <div className="relative z-10 w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-[#17231b]">Check Delivery Pincode</h3>
            <p className="mt-1 text-xs text-[#666666]">
              Enter your 6-digit PIN code to check estimated delivery date and cash-on-delivery availability.
            </p>
            <form onSubmit={handleVerifyPincode} className="mt-4 flex gap-2">
              <input
                type="text"
                maxLength={6}
                value={pincodeInput}
                onChange={(e) => setPincodeInput(e.target.value.replace(/\D/g, ""))}
                placeholder="Enter 6-digit Pincode"
                className="flex-1 rounded-lg border border-[#ddddd9] px-3 py-2 text-sm outline-none focus:border-[#244f31]"
              />
              <button
                type="submit"
                className="rounded-lg bg-[#244f31] px-4 py-2 text-xs font-bold text-white hover:bg-[#1d3b24]"
              >
                VERIFY
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Track Order Modal */}
      {trackOrderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setTrackOrderOpen(false)}
          />
          <div className="relative z-10 w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-[#17231b]">Track Your Order</h3>
            <p className="mt-1 text-xs text-[#666666]">
              Enter your Order ID (e.g. PYR-1048) or registered Mobile Number.
            </p>
            <form onSubmit={handleTrackOrder} className="mt-4 flex gap-2">
              <input
                type="text"
                value={orderIdInput}
                onChange={(e) => setOrderIdInput(e.target.value)}
                placeholder="Order ID / Mobile No."
                className="flex-1 rounded-lg border border-[#ddddd9] px-3 py-2 text-sm outline-none focus:border-[#244f31]"
              />
              <button
                type="submit"
                className="rounded-lg bg-[#244f31] px-4 py-2 text-xs font-bold text-white hover:bg-[#1d3b24]"
              >
                TRACK
              </button>
            </form>
            {trackedStatus && (
              <div className="mt-4 rounded-lg bg-[#eef5df] p-3 text-xs font-semibold text-[#244f31] flex items-center gap-2">
                <CheckCircle2 className="size-4 shrink-0 text-[#80a03c]" />
                <span>{trackedStatus}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
