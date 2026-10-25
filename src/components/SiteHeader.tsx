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
  ChevronDown,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { headerSearchSuggestions, menuLinks, products, Product } from "@/lib/store";
import { getStorefrontData } from "@/lib/storefront-client";
import GetAppModal from "./GetAppModal";

interface SiteHeaderProps {
  cart?: { product: Product; quantity: number }[];
  onUpdateQuantity?: (id: string, delta: number) => void;
  onRemoveItem?: (id: string) => void;
  onOpenAppModal?: () => void;
  onOpenLoginModal?: () => void;
  onOpenConsultationModal?: () => void;
  products?: Product[];
}

export default function SiteHeader({
  cart = [],
  onUpdateQuantity = () => {},
  onRemoveItem = () => {},
  onOpenAppModal = () => {},
  onOpenLoginModal = () => {},
  onOpenConsultationModal = () => {},
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

    const handleAuthSync = () => {
      try {
        const cached = localStorage.getItem("pyur_user");
        setUser(cached ? JSON.parse(cached) : null);
      } catch {
        setUser(null);
      }
    };

    window.addEventListener("pyur_auth_change", handleAuthSync);
    window.addEventListener("storage", handleAuthSync);

    return () => {
      window.removeEventListener("pyur_auth_change", handleAuthSync);
      window.removeEventListener("storage", handleAuthSync);
    };
  }, []);
  const [desktopSearchOpen, setDesktopSearchOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [concernsDropdownOpen, setConcernsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [catalog, setCatalog] = useState<Product[]>(initialProducts || []);

  useEffect(() => {
    if (initialProducts && initialProducts.length > 0) {
      setCatalog(initialProducts);
      return;
    }
    getStorefrontData()
      .then((data) => {
        if (data && data.products && Array.isArray(data.products)) {
          setCatalog(data.products);
        }
      })
      .catch(() => {});
  }, [initialProducts]);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const mobileSearchContainerRef = useRef<HTMLDivElement>(null);

  // Rotating placeholder suggestions every 2.8s
  useEffect(() => {
    if (!headerSearchSuggestions || headerSearchSuggestions.length === 0) return;
    const interval = setInterval(() => {
      setSuggestionIdx((prev) => (prev + 1) % headerSearchSuggestions.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  // Instant client-side search across catalog
  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const terms = q.split(/\s+/).filter(Boolean);
    const matches = (catalog || []).filter((product) => {
      const name = (product.name || "").toLowerCase();
      const concern = (product.concern || "").toLowerCase();
      const desc = (product.description || "").toLowerCase();
      const badge = (product.badge || "").toLowerCase();
      const ingr = Array.isArray(product.ingredients)
        ? product.ingredients.join(" ").toLowerCase()
        : String(product.ingredients || "").toLowerCase();

      const haystack = `${name} ${concern} ${desc} ${badge} ${ingr}`;
      return terms.every((term) => haystack.includes(term));
    });

    setSearchResults(matches);
    setIsSearching(true);
  }, [searchQuery, catalog]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const insideDesktop = searchContainerRef.current?.contains(target);
      const insideMobile = mobileSearchContainerRef.current?.contains(target);
      if (!insideDesktop && !insideMobile) {
        setIsSearching(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    setIsSearching(false);
    window.location.href = `/search?q=${encodeURIComponent(q)}`;
  };

  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [appModalOpen, setAppModalOpen] = useState(false);
  const [pincodeModalOpen, setPincodeModalOpen] = useState(false);
  const [pincodeInput, setPincodeInput] = useState("");
  const [verifiedPincode, setVerifiedPincode] = useState<string | null>(null);
  const [trackOrderOpen, setTrackOrderOpen] = useState(false);
  const [orderIdInput, setOrderIdInput] = useState("");
  const [trackedStatus, setTrackedStatus] = useState<string | null>(null);

  // Global listener to open Get App modal from anywhere
  useEffect(() => {
    const handleOpenModal = () => setAppModalOpen(true);
    window.addEventListener("pyur_open_get_app_modal", handleOpenModal);
    return () => window.removeEventListener("pyur_open_get_app_modal", handleOpenModal);
  }, []);

  const [showToast, setShowToast] = useState(false);
  const [isBouncing, setIsBouncing] = useState(false);
  const prevCartCountRef = useRef(0);
  const isMountedRef = useRef(false);

  // Fallback sync from localStorage if cart prop is empty or corrupted
  const [localCart, setLocalCart] = useState<{ product: Product; quantity: number }[]>([]);

  useEffect(() => {
    isMountedRef.current = true;

    const syncCart = () => {
      if (typeof window === "undefined" || !isMountedRef.current) return;
      try {
        const stored = localStorage.getItem("pyur_cart");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            // Keep only strictly valid items
            const valid = parsed.filter(
              (item: any) => item && item.product && typeof item.product === "object" && item.product.id
            );
            setLocalCart(valid);
            // Purge corrupted/invalid items from localStorage
            if (valid.length !== parsed.length) {
              localStorage.setItem("pyur_cart", JSON.stringify(valid));
            }
            return;
          }
        }
        setLocalCart([]);
      } catch {
        setLocalCart([]);
      }
    };

    const handleCartEvent = () => {
      setTimeout(() => {
        if (isMountedRef.current) {
          syncCart();
        }
      }, 0);
    };

    syncCart();
    window.addEventListener("storage", handleCartEvent);
    window.addEventListener("pyur_cart_updated", handleCartEvent);
    return () => {
      window.removeEventListener("storage", handleCartEvent);
      window.removeEventListener("pyur_cart_updated", handleCartEvent);
    };
  }, []);

  // Use cart prop if populated, else use validated localCart
  const activeCart = cart && cart.length > 0 ? cart : localCart;
  const validCartItems = (activeCart || []).filter(
    (item: any) => item && item.product && typeof item.product === "object" && item.product.id
  );

  const totalCartCount = validCartItems.reduce((acc, item) => acc + (Number(item.quantity) || 1), 0);
  const cartSubtotal = validCartItems.reduce(
    (acc, item) => acc + (Number(item.product?.price) || 0) * (Number(item.quantity) || 1),
    0
  );
  const freeShippingThreshold = 999;
  const progressToFreeShipping = Math.min(100, (cartSubtotal / freeShippingThreshold) * 100);

  const handleItemQuantityChange = (productId: string, delta: number) => {
    if (typeof onUpdateQuantity === "function") {
      onUpdateQuantity(productId, delta);
    }
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("pyur_cart");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            const updated = parsed
              .map((item: any) => {
                if (item && item.product && item.product.id === productId) {
                  const newQty = (Number(item.quantity) || 1) + delta;
                  return newQty > 0 ? { ...item, quantity: newQty } : null;
                }
                return item;
              })
              .filter(Boolean);
            localStorage.setItem("pyur_cart", JSON.stringify(updated));
            setLocalCart(updated);
            setTimeout(() => {
              window.dispatchEvent(new Event("pyur_cart_updated"));
            }, 0);
          }
        }
      } catch {}
    }
  };

  const handleItemRemove = (productId: string) => {
    if (typeof onRemoveItem === "function") {
      onRemoveItem(productId);
    }
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("pyur_cart");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            const updated = parsed.filter(
              (item: any) => item && item.product && item.product.id !== productId
            );
            localStorage.setItem("pyur_cart", JSON.stringify(updated));
            setLocalCart(updated);
            setTimeout(() => {
              window.dispatchEvent(new Event("pyur_cart_updated"));
            }, 0);
          }
        }
      } catch {}
    }
  };

  useEffect(() => {
    prevCartCountRef.current = totalCartCount;
  }, []);

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
      <header className="sticky top-0 z-40 bg-white border-b border-neutral-200/80 px-4 md:px-8 py-2.5 sm:py-3">
        {/* Mobile Header Row (Matching Screenshot: [Shopping Bag + Badge] [Centered Logo] [Search Icon]) */}
        <div className="flex md:hidden items-center justify-between w-full">
          {/* Left: Shopping Bag with Badge */}
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="relative p-1.5 text-neutral-800 transition hover:bg-neutral-100 rounded-full cursor-pointer"
            aria-label="Shopping Cart"
          >
            <ShoppingBag className="size-6 text-neutral-900 stroke-[1.75]" />
            {totalCartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex size-4.5 min-w-4.5 items-center justify-center rounded-full bg-[#023915] text-[10px] font-bold text-white shadow-2xs">
                {totalCartCount}
              </span>
            )}
          </button>

          {/* Center: Brand Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative flex size-8 sm:size-9 items-center justify-center rounded-full bg-white p-0.5 border border-[#023915]/20 shrink-0 overflow-hidden">
              <Image
                src="/brand/pure-ayur-logo.png"
                alt="Pure Ayur Herbs Logo"
                width={36}
                height={36}
                className="size-full rounded-full object-cover group-hover:scale-105 transition-transform duration-300"
                priority
              />
            </div>
            <div className="flex flex-col leading-none text-left">
              <span className="text-sm sm:text-base font-black uppercase tracking-wider text-[#023915]">
                PURE AYUR
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.25em] text-[#80a03c]">
                HERBS
              </span>
            </div>
          </Link>

          {/* Right: Search Toggle Icon */}
          <button
            type="button"
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className="p-1.5 text-neutral-800 transition hover:bg-neutral-100 rounded-full cursor-pointer"
            aria-label="Search remedies"
          >
            <Search className="size-6 text-neutral-900 stroke-[1.75]" />
          </button>
        </div>

        {/* Desktop Header Row (Hidden on mobile) */}
        <div className="hidden md:flex mx-auto max-w-[1440px] items-center justify-between gap-3 md:gap-6">
          {/* Left: Mobile Menu & Brand Logo */}
          <div className="flex items-center gap-2.5 md:gap-4 shrink-0">
            <button
              onClick={() => setMenuOpen(true)}
              className="rounded-md p-1.5 text-neutral-800 transition hover:bg-neutral-100 cursor-pointer lg:hidden"
              aria-label="Open Navigation Menu"
            >
              <Menu className="size-6" />
            </button>

            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative flex size-10 md:size-11 items-center justify-center rounded-full bg-white p-0.5 border border-[#023915]/20 shrink-0 overflow-hidden">
                <Image
                  src="/brand/pure-ayur-logo.png"
                  alt="Pure Ayur Herbs Logo"
                  width={44}
                  height={44}
                  className="size-full rounded-full object-cover group-hover:scale-105 transition-transform duration-300"
                  priority
                />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-base md:text-lg font-black uppercase tracking-wider text-[#023915]">
                  PURE AYUR
                </span>
                <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.25em] text-[#80a03c]">
                  HERBS
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Desktop Navigation Links OR Active Search Field */}
          {desktopSearchOpen ? (
            <div ref={searchContainerRef} className="relative flex-1 max-w-xl mx-4">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <Search className="absolute left-3.5 size-4 text-[#023915] pointer-events-none" />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onFocus={() => {
                    if (searchQuery.trim().length > 0) setIsSearching(true);
                  }}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setIsSearching(false);
                      setDesktopSearchOpen(false);
                    }
                  }}
                  placeholder={`Search for "${headerSearchSuggestions[suggestionIdx] || "Ayurvedic remedies"}"...`}
                  className="w-full bg-[#f8faf5] border border-neutral-300 rounded-full py-2 pl-10 pr-10 text-xs md:text-sm text-neutral-800 placeholder:text-neutral-400 outline-none focus:border-[#023915] focus:bg-white shadow-xs transition"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setIsSearching(false);
                    setDesktopSearchOpen(false);
                  }}
                  className="absolute right-3 p-1 text-neutral-400 hover:text-neutral-700 cursor-pointer"
                  aria-label="Close search"
                >
                  <X className="size-4" />
                </button>
              </form>

              {/* Live Search Results Dropdown */}
              {isSearching && (
                <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-96 overflow-y-auto rounded-2xl border border-neutral-200 bg-white shadow-xl">
                  {searchResults.length > 0 ? (
                    <div className="divide-y divide-neutral-100">
                      <div className="flex items-center justify-between bg-neutral-50 px-4 py-2 text-xs font-bold text-[#023915]">
                        <span>Found {searchResults.length} matching remedies</span>
                        <Link
                          href={`/search?q=${encodeURIComponent(searchQuery)}`}
                          onClick={() => {
                            setIsSearching(false);
                            setDesktopSearchOpen(false);
                          }}
                          className="text-[11px] font-semibold text-[#80a03c] hover:underline"
                        >
                          View all →
                        </Link>
                      </div>
                      {searchResults.map((product) => (
                        <Link
                          key={product.id}
                          href={`/products/${product.slug || product.id}`}
                          onClick={() => {
                            setSearchQuery("");
                            setIsSearching(false);
                            setDesktopSearchOpen(false);
                          }}
                          className="flex cursor-pointer items-center gap-3 p-3 transition hover:bg-neutral-50"
                        >
                          <Image
                            src={product.image}
                            alt={product.name}
                            width={48}
                            height={48}
                            className="size-12 rounded object-contain shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="truncate text-xs font-bold text-neutral-900 md:text-sm">
                              {product.name}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-neutral-500 mt-0.5">
                              <span className="font-bold text-[#023915]">₹{product.price}</span>
                              {product.compareAt > product.price && (
                                <span className="line-through text-[11px]">₹{product.compareAt}</span>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleItemQuantityChange(product.id, 1);
                            }}
                            className="rounded-full bg-[#023915] px-3 py-1 text-xs font-bold text-white transition hover:bg-black shrink-0"
                          >
                            ADD
                          </button>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="p-5 text-center">
                      <p className="text-xs font-medium text-neutral-600">
                        No matching products found for "{searchQuery}"
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
              <Link
                href="/"
                className="text-xs font-bold uppercase tracking-wider text-neutral-800 hover:text-[#023915] transition"
              >
                Home
              </Link>

              {/* Ayurvedic Concerns Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setConcernsDropdownOpen(true)}
                onMouseLeave={() => setConcernsDropdownOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => setConcernsDropdownOpen(!concernsDropdownOpen)}
                  className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-neutral-800 hover:text-[#023915] transition cursor-pointer py-1"
                >
                  <span>Ayurvedic Concerns</span>
                  <ChevronDown
                    className={`size-3.5 transition-transform duration-200 ${
                      concernsDropdownOpen ? "rotate-180 text-[#023915]" : "text-neutral-500"
                    }`}
                  />
                </button>
                {concernsDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-64 rounded-2xl border border-neutral-200 bg-white p-2 shadow-xl z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest text-[#023915]/70 border-b border-neutral-100 mb-1">
                      Targeted Solutions
                    </div>
                    {[
                      { label: "Sugar Management", href: "/products?category=Sugar+Management" },
                      { label: "Energy & Vitality", href: "/products?category=Energy+%26+Vitality" },
                      { label: "Gym & Fitness", href: "/products?category=Gym+%26+Fitness" },
                      { label: "Women's Health", href: "/products?category=Women%27s+Health" },
                      { label: "Daily Wellness", href: "/products?category=Daily+Ayurveda" },
                      { label: "Skin & Hair", href: "/products?category=Skin+%26+Hair" },
                    ].map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={() => setConcernsDropdownOpen(false)}
                        className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-neutral-800 hover:bg-[#f5f5f5] hover:text-[#023915] transition"
                      >
                        <span>{item.label}</span>
                        <ChevronRight className="size-3 text-neutral-400" />
                      </Link>
                    ))}
                    <div className="pt-1 mt-1 border-t border-neutral-100">
                      <Link
                        href="/products"
                        onClick={() => setConcernsDropdownOpen(false)}
                        className="block rounded-xl px-3 py-1.5 text-center text-xs font-bold text-[#023915] hover:bg-neutral-50 transition"
                      >
                        View All Formulations →
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <Link
                href="/#products"
                className="text-xs font-bold uppercase tracking-wider text-neutral-800 hover:text-[#023915] transition"
              >
                New Arrivals
              </Link>

              <Link
                href="/products"
                className="text-xs font-bold uppercase tracking-wider text-neutral-800 hover:text-[#023915] transition"
              >
                All Products
              </Link>

              <Link
                href="/about-us"
                className="text-xs font-bold uppercase tracking-wider text-neutral-800 hover:text-[#023915] transition"
              >
                About Us
              </Link>
            </nav>
          )}

          {/* Right Action Icons & Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Desktop Search Toggle Icon */}
            <button
              onClick={() => setDesktopSearchOpen(!desktopSearchOpen)}
              className="rounded-full p-2 text-neutral-800 transition hover:bg-neutral-100 cursor-pointer hidden md:flex"
              title={desktopSearchOpen ? "Close Search" : "Search Products"}
              aria-label="Search"
            >
              <Search className="size-5" />
            </button>

            {/* Login / Profile (Taitva Style) */}
            {!mounted ? (
              <div className="size-8 hidden sm:block" />
            ) : user ? (
              <div className="relative group hidden sm:block">
                <Link
                  href="/profile?tab=orders"
                  className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-neutral-800 rounded-full border border-neutral-200 hover:border-[#023915] transition"
                >
                  <User className="size-3.5 text-[#023915]" />
                  <span>{(user?.name || "Member").split(" ")[0]}</span>
                </Link>

                {/* Hover Dropdown Menu */}
                <div className="absolute right-0 top-full mt-1 z-50 w-48 rounded-xl border border-neutral-200 bg-white p-2 shadow-xl opacity-0 translate-y-1 invisible group-hover:opacity-100 group-hover:translate-y-0 group-hover:visible transition-all duration-200">
                  <div className="px-3 py-2 border-b border-neutral-100 text-xs font-semibold text-neutral-500">
                    Hi, {user?.name || "Member"}!
                  </div>
                  <div className="flex flex-col py-1">
                    <Link
                      href="/profile?tab=orders"
                      className="rounded-lg px-3 py-1.5 text-xs font-semibold text-neutral-800 transition hover:bg-neutral-50 hover:text-[#023915]"
                    >
                      Orders
                    </Link>
                    <Link
                      href="/profile?tab=wallet"
                      className="rounded-lg px-3 py-1.5 text-xs font-semibold text-neutral-800 transition hover:bg-neutral-50 hover:text-[#023915]"
                    >
                      Wallet
                    </Link>
                    <Link
                      href="/profile?tab=addresses"
                      className="rounded-lg px-3 py-1.5 text-xs font-semibold text-neutral-800 transition hover:bg-neutral-50 hover:text-[#023915]"
                    >
                      Addresses
                    </Link>
                    <Link
                      href="/profile?tab=settings"
                      className="rounded-lg px-3 py-1.5 text-xs font-semibold text-neutral-800 transition hover:bg-neutral-50 hover:text-[#023915]"
                    >
                      Account Settings
                    </Link>
                  </div>
                  <div className="border-t border-neutral-100 pt-1 mt-1">
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
            ) : (
              <Link
                href="/login"
                className="rounded-full p-2 text-neutral-800 transition hover:bg-neutral-100 cursor-pointer hidden sm:flex"
                title="Account / Login"
                aria-label="Account Login"
              >
                <User className="size-5" />
              </Link>
            )}

            {/* Track Order Icon */}
            <button
              onClick={() => setTrackOrderOpen(true)}
              className="rounded-full p-2 text-neutral-800 transition hover:bg-neutral-100 cursor-pointer hidden sm:flex"
              title="Track Order"
              aria-label="Track Order"
            >
              <Truck className="size-5" />
            </button>

            {/* Shopping Cart Drawer Trigger with circular #023915 count badge */}
            <div className="relative">
              <button
                onClick={() => setCartOpen(true)}
                className={`relative rounded-full p-2 text-neutral-800 transition hover:bg-neutral-100 cursor-pointer ${
                  isBouncing ? "scale-110 text-[#023915]" : ""
                }`}
                aria-label="Shopping Cart"
              >
                <ShoppingBag className="size-5 md:size-6" />
                {totalCartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex size-4.5 min-w-4.5 items-center justify-center rounded-full bg-[#023915] text-[10px] font-bold text-white shadow-2xs">
                    {totalCartCount}
                  </span>
                )}
              </button>

              {/* Floating Basket Toast Notification */}
              {showToast && (
                <div className="absolute right-0 top-full mt-2.5 z-50 w-52 rounded-xl border border-neutral-200 bg-white p-3 shadow-xl animate-toast-in">
                  <div className="absolute -top-1.5 right-4 size-3 rotate-45 border-t border-l border-neutral-200 bg-white" />
                  
                  <div className="flex items-center gap-2 text-xs font-bold text-[#023915]">
                    <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                    <span>Product added to basket</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Bar Row (Shown when search icon clicked: md:hidden) */}
        {mobileSearchOpen && (
          <div className="mt-2.5 md:hidden animate-in fade-in slide-in-from-top-1 duration-150">
            <div ref={mobileSearchContainerRef} className="relative">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <Search className="absolute left-3 size-3.5 text-neutral-400 pointer-events-none" />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onFocus={() => {
                    if (searchQuery.trim().length > 0) setIsSearching(true);
                  }}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search for "${headerSearchSuggestions[suggestionIdx] || "Ayurvedic remedies"}"`}
                  className="w-full bg-[#f8faf5] border border-neutral-200 rounded-full py-1.5 pl-8 pr-8 text-xs text-neutral-800 placeholder:text-neutral-400 outline-none focus:border-[#023915] transition"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setIsSearching(false);
                      setMobileSearchOpen(false);
                    }}
                    className="absolute right-2.5 p-0.5 text-neutral-400 hover:text-neutral-700"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </form>

              {/* Live Search Results Dropdown */}
              {isSearching && (
                <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-96 overflow-y-auto rounded-xl border border-neutral-200 bg-white shadow-xl">
                  {searchResults.length > 0 ? (
                    <div className="divide-y divide-neutral-100">
                      <div className="flex items-center justify-between bg-neutral-50 px-4 py-2 text-xs font-bold text-[#023915]">
                        <span>Found {searchResults.length} matching remedies</span>
                        <Link
                          href={`/search?q=${encodeURIComponent(searchQuery)}`}
                          onClick={() => {
                            setIsSearching(false);
                            setMobileSearchOpen(false);
                          }}
                          className="text-[11px] font-semibold text-[#80a03c] hover:underline"
                        >
                          View all →
                        </Link>
                      </div>
                      {searchResults.map((product) => (
                        <Link
                          key={product.id}
                          href={`/products/${product.slug || product.id}`}
                          onClick={() => {
                            setSearchQuery("");
                            setIsSearching(false);
                            setMobileSearchOpen(false);
                          }}
                          className="flex cursor-pointer items-center gap-3 p-3 transition hover:bg-neutral-50"
                        >
                          <Image
                            src={product.image}
                            alt={product.name}
                            width={48}
                            height={48}
                            className="size-12 rounded object-contain shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="truncate text-xs font-bold text-neutral-900">
                              {product.name}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-neutral-500 mt-0.5">
                              <span className="font-bold text-[#023915]">₹{product.price}</span>
                              {product.compareAt > product.price && (
                                <span className="line-through text-[11px]">₹{product.compareAt}</span>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleItemQuantityChange(product.id, 1);
                            }}
                            className="rounded-full bg-[#023915] px-3 py-1 text-xs font-bold text-white transition hover:bg-black shrink-0"
                          >
                            ADD
                          </button>
                        </Link>
                      ))}
                      <div className="bg-neutral-50 p-2.5 text-center">
                        <Link
                          href={`/search?q=${encodeURIComponent(searchQuery)}`}
                          onClick={() => {
                            setIsSearching(false);
                            setMobileSearchOpen(false);
                          }}
                          className="text-xs font-bold text-[#023915] hover:underline"
                        >
                          View all {searchResults.length} results for "{searchQuery}" →
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="p-5 text-center">
                      <p className="text-xs font-medium text-neutral-600">
                        No matching products found for "{searchQuery}"
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Drawer Navigation Menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMenuOpen(false)}
          />
          <div className="relative z-10 flex w-full max-w-xs flex-col bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="relative flex size-9 items-center justify-center rounded-full bg-white p-0.5 border border-[#023915]/20 overflow-hidden shrink-0">
                  <Image
                    src="/brand/pure-ayur-logo.png"
                    alt="Pure Ayur Herbs Logo"
                    width={36}
                    height={36}
                    className="size-full rounded-full object-cover"
                  />
                </div>
                <span className="font-black text-[#023915] text-sm tracking-wider uppercase">PURE AYUR HERBS</span>
              </div>
              <button
                onClick={() => setMenuOpen(false)}
                className="rounded-full p-1 text-neutral-500 hover:bg-neutral-100"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="mt-6 flex flex-col gap-4">
              {!mounted ? (
                <div className="h-11 rounded-xl bg-gray-100 animate-pulse" />
              ) : user ? (
                <div className="bg-[#f5f5f5] p-3.5 rounded-xl border border-neutral-200 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
                    <div className="flex items-center gap-2">
                      <User className="size-4 text-[#023915]" />
                      <span className="font-bold text-neutral-900 text-sm">Hello, {(user?.name || "Member").split(" ")[0]}</span>
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
                  <div className="flex flex-col gap-2 text-xs font-bold text-neutral-800">
                    <Link
                      href="/profile?tab=orders"
                      onClick={() => setMenuOpen(false)}
                      className="hover:text-[#023915] flex items-center gap-1.5"
                    >
                      📦 My Orders
                    </Link>
                    <Link
                      href="/profile?tab=wallet"
                      onClick={() => setMenuOpen(false)}
                      className="hover:text-[#023915] flex items-center gap-1.5"
                    >
                      🪙 My Wallet (Coins)
                    </Link>
                    <Link
                      href="/profile?tab=addresses"
                      onClick={() => setMenuOpen(false)}
                      className="hover:text-[#023915] flex items-center gap-1.5"
                    >
                      📍 Saved Addresses
                    </Link>
                    <Link
                      href="/profile?tab=settings"
                      onClick={() => setMenuOpen(false)}
                      className="hover:text-[#023915] flex items-center gap-1.5"
                    >
                      ⚙️ Account Settings
                    </Link>
                  </div>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 rounded-xl border border-[#023915] p-3 text-sm font-bold text-[#023915] justify-center hover:bg-[#023915] hover:text-white transition"
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
                  className="text-base font-semibold text-neutral-800 transition hover:text-[#023915]"
                >
                  {link.label}
                </a>
              ))}

              {/* Mobile Drawer Get App Button */}
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setAppModalOpen(true);
                }}
                className="mt-2 flex items-center justify-between w-full p-3 rounded-xl bg-emerald-50/80 border border-emerald-200/80 text-xs font-bold text-[#128C7E] hover:bg-emerald-100 transition cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span>📱</span>
                  <span>Get Mobile App</span>
                </div>
                <span className="text-[10px] font-black uppercase bg-[#25D366] text-white px-2 py-0.5 rounded-full shadow-xs">
                  Coming Soon
                </span>
              </button>
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
            <div className="flex items-center justify-between border-b border-neutral-200 p-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="size-5 text-[#023915]" />
                <h3 className="text-lg font-bold text-neutral-900">Your Herbal Basket ({totalCartCount})</h3>
              </div>
              <button
                onClick={() => setCartOpen(false)}
                className="rounded-full p-1 text-neutral-500 hover:bg-neutral-100"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Free Shipping Bar */}
            <div className="bg-[#c2d4c5]/25 px-4 py-3">
              <div className="flex justify-between text-xs font-bold text-[#023915]">
                <span>
                  {cartSubtotal >= freeShippingThreshold
                    ? "🎉 FREE Delivery Unlocked!"
                    : `Add ₹${freeShippingThreshold - cartSubtotal} more for FREE Delivery`}
                </span>
                <span>{Math.round(progressToFreeShipping)}%</span>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-neutral-200">
                <div
                  className="h-full bg-[#023915] transition-all duration-500"
                  style={{ width: `${progressToFreeShipping}%` }}
                />
              </div>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {validCartItems.length > 0 ? (
                <div className="space-y-4">
                  {validCartItems.map((item) => {
                    const product = item.product;
                    const quantity = Number(item.quantity) || 1;
                    const price = Number(product.price) || 0;
                    const compareAt = Number(product.compareAt) || Math.round(price * 1.2);
                    const isCoinsActive = product.showCoins !== false && (product.coinsEarned !== undefined ? Number(product.coinsEarned) > 0 : true);
                    const coinsEarned = product.showCoins === false ? 0 : (product.coinsEarned !== undefined ? Number(product.coinsEarned) : Math.round(price * 0.05));
                    const imageSrc = product.image || "/brand/pure-ayur-logo.png";
                    return (
                      <div
                        key={product.id || String(Math.random())}
                        className="flex gap-3 rounded-xl border border-neutral-200 p-3 bg-white"
                      >
                        <div className="relative size-16 shrink-0 rounded-lg overflow-hidden bg-white border border-neutral-100 flex items-center justify-center">
                          <Image
                            src={imageSrc}
                            alt={product.name || "Ayurvedic product"}
                            fill
                            sizes="64px"
                            className="object-contain"
                          />
                        </div>
                        <div className="flex flex-1 flex-col justify-between min-w-0">
                          <div>
                            <h4 className="line-clamp-1 text-xs font-bold text-neutral-900">
                              {product.name || "Ayurvedic Formulation"}
                            </h4>
                            {isCoinsActive && coinsEarned > 0 && (
                              <span className="text-[10px] font-semibold text-emerald-800">
                                Earn {coinsEarned * quantity} Pure Coins 🪙
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-1 text-xs font-bold text-neutral-900">
                              <span>₹{price * quantity}</span>
                              {compareAt > price && (
                                <span className="text-[10px] text-neutral-400 line-through">
                                  ₹{compareAt * quantity}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center rounded-lg border border-neutral-300">
                              <button
                                onClick={() => handleItemQuantityChange(product.id, -1)}
                                className="p-1 hover:bg-neutral-100 transition"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="size-3" />
                              </button>
                              <span className="px-2 text-xs font-bold">{quantity}</span>
                              <button
                                onClick={() => handleItemQuantityChange(product.id, 1)}
                                className="p-1 hover:bg-neutral-100 transition"
                                aria-label="Increase quantity"
                              >
                                <Plus className="size-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleItemRemove(product.id)}
                          className="self-start p-1 text-neutral-400 hover:text-red-600 transition"
                          aria-label="Remove item"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-center py-12">
                  <ShoppingBag className="size-12 text-neutral-300" />
                  <p className="mt-3 text-sm font-bold text-neutral-900">Your herbal basket is empty</p>
                  <p className="mt-1 text-xs text-neutral-500">Explore our 100% pure Ayurvedic remedies!</p>
                  <button
                    onClick={() => setCartOpen(false)}
                    className="mt-4 rounded-xl bg-[#023915] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-black"
                  >
                    Start Shopping
                  </button>
                </div>
              )}
            </div>

            {/* Footer Checkout */}
            {validCartItems.length > 0 && (
              <div className="border-t border-neutral-200 bg-white p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-neutral-900">Total Payable</span>
                  <div className="text-right">
                    <span className="text-lg font-black text-[#023915]">₹{cartSubtotal}</span>
                    <span className="block text-[10px] text-neutral-500">Taxes included</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (validCartItems.length > 0 && validCartItems[0].product?.id) {
                      const p = validCartItems[0].product;
                      const q = validCartItems[0].quantity || 1;
                      const priceParam = p.price ? `&price=${p.price}` : "";
                      const nameParam = p.name ? `&variantName=${encodeURIComponent(p.name)}` : "";
                      const imgParam = p.image ? `&variantImage=${encodeURIComponent(p.image)}` : "";
                      window.location.href = `/checkout?productId=${encodeURIComponent(p.id)}&quantity=${q}${priceParam}${nameParam}${imgParam}`;
                    } else {
                      setCartOpen(false);
                    }
                  }}
                  className="w-full rounded-xl bg-[#023915] py-3 text-sm font-bold tracking-wider text-white shadow-lg transition hover:bg-black uppercase"
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
          <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-neutral-200">
            <h3 className="text-lg font-bold text-neutral-900">Check Delivery Pincode</h3>
            <p className="mt-1 text-xs text-neutral-500">
              Enter your 6-digit PIN code to check estimated delivery date and cash-on-delivery availability.
            </p>
            <form onSubmit={handleVerifyPincode} className="mt-4 flex gap-2">
              <input
                type="text"
                maxLength={6}
                value={pincodeInput}
                onChange={(e) => setPincodeInput(e.target.value.replace(/\D/g, ""))}
                placeholder="Enter 6-digit Pincode"
                className="flex-1 rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-[#023915]"
              />
              <button
                type="submit"
                className="rounded-xl bg-[#023915] px-4 py-2 text-xs font-bold text-white hover:bg-black transition cursor-pointer"
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
          <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-neutral-200">
            <h3 className="text-lg font-bold text-neutral-900">Track Your Order</h3>
            <p className="mt-1 text-xs text-neutral-500">
              Enter your Order ID (e.g. PYR-1048) or registered Mobile Number.
            </p>
            <form onSubmit={handleTrackOrder} className="mt-4 flex gap-2">
              <input
                type="text"
                value={orderIdInput}
                onChange={(e) => setOrderIdInput(e.target.value)}
                placeholder="Order ID / Mobile No."
                className="flex-1 rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-[#023915]"
              />
              <button
                type="submit"
                className="rounded-xl bg-[#023915] px-4 py-2 text-xs font-bold text-white hover:bg-black transition cursor-pointer"
              >
                TRACK
              </button>
            </form>
            {trackedStatus && (
              <div className="mt-4 rounded-xl bg-[#c2d4c5]/25 p-3 text-xs font-semibold text-[#023915] flex items-center gap-2">
                <CheckCircle2 className="size-4 shrink-0 text-emerald-700" />
                <span>{trackedStatus}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Get App (Coming Soon) Modal */}
      <GetAppModal
        isOpen={appModalOpen}
        onClose={() => setAppModalOpen(false)}
      />
    </>
  );
}
