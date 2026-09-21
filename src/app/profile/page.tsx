"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  ShoppingBag,
  Wallet,
  MapPin,
  Eye,
  Settings,
  PhoneCall,
  LogOut,
  Plus,
  Trash2,
  Check,
  Star,
  MapPinCheck,
  ChevronRight,
  ShieldCheck,
  ArrowLeft,
  X,
  RotateCcw,
  Package,
  Clock,
  MessageCircle,
  AlertTriangle,
  RefreshCw,
  HelpCircle,
  CheckCircle2,
  Truck,
  ExternalLink,
} from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import AnnouncementBar from "@/components/AnnouncementBar";
import { products, Product } from "@/lib/store";

function ProfileDashboard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialTab = searchParams.get("tab") || "orders";

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
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        if (localStorage.getItem("pyur_user")) return false;
      } catch {}
    }
    return true;
  });

  // Orders & Coins State
  const [orders, setOrders] = useState<any[]>([]);
  const [coinsBalance, setCoinsBalance] = useState(100);
  const [coinsSettings, setCoinsSettings] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const [orderSearchQuery, setOrderSearchQuery] = useState("");
  const [orderSearchLoading, setOrderSearchLoading] = useState(false);
  const [orderSearchError, setOrderSearchError] = useState<string | null>(null);

  // Orders Sub-Filtering & In-Place Actions
  const [orderFilter, setOrderFilter] = useState<"all" | "active" | "delivered" | "cancelled">("all");

  // Cancel Order Modal State
  const [cancellingOrder, setCancellingOrder] = useState<any | null>(null);
  const [cancelReason, setCancelReason] = useState("Ordered by mistake");
  const [cancelComments, setCancelComments] = useState("");
  const [cancelSubmitting, setCancelSubmitting] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [cancelSuccessMsg, setCancelSuccessMsg] = useState<string | null>(null);

  // Return / Replacement Modal State
  const [returningOrder, setReturningOrder] = useState<any | null>(null);
  const [returnResolution, setReturnResolution] = useState<"Replacement" | "Refund">("Replacement");
  const [returnReason, setReturnReason] = useState("Damaged / Leaked during transit");
  const [returnComments, setReturnComments] = useState("");
  const [returnSubmitting, setReturnSubmitting] = useState(false);
  const [returnError, setReturnError] = useState<string | null>(null);
  const [returnSuccessMsg, setReturnSuccessMsg] = useState<string | null>(null);

  const fetchOrdersList = async () => {
    if (!user || (!user.email && !user.phone)) return;
    setLoadingOrders(true);
    try {
      const res = await fetch(`/api/profile/orders?email=${encodeURIComponent(user.email || "")}&phone=${encodeURIComponent(user.phone || "")}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
        setCoinsBalance(data.coinsBalance || 0);
        if (data.coinsSettings) setCoinsSettings(data.coinsSettings);
        setTransactions(data.transactions || []);
      }
    } catch (e) {
      console.error("Error loading orders:", e);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancellingOrder) return;
    setCancelSubmitting(true);
    setCancelError(null);
    try {
      const contact = cancellingOrder.phone || user?.phone || cancellingOrder.email || user?.email || "";
      const res = await fetch("/api/orders/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: cancellingOrder.id,
          contact,
          reason: cancelReason,
          comments: cancelComments,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCancelSuccessMsg(data.message || "Order cancelled successfully.");
        await fetchOrdersList();
        setTimeout(() => {
          setCancellingOrder(null);
          setCancelSuccessMsg(null);
          setCancelComments("");
        }, 1600);
      } else {
        setCancelError(data.error || "Failed to cancel order. Please contact customer support.");
      }
    } catch {
      setCancelError("Network error while submitting cancellation. Please try again.");
    } finally {
      setCancelSubmitting(false);
    }
  };

  const handleConfirmReturn = async () => {
    if (!returningOrder) return;
    setReturnSubmitting(true);
    setReturnError(null);
    try {
      const contact = returningOrder.phone || user?.phone || returningOrder.email || user?.email || "";
      const res = await fetch("/api/orders/return", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: returningOrder.id,
          contact,
          reason: returnReason,
          resolution: returnResolution,
          comments: returnComments,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setReturnSuccessMsg(data.message || "Return request submitted successfully.");
        await fetchOrdersList();
        setTimeout(() => {
          setReturningOrder(null);
          setReturnSuccessMsg(null);
          setReturnComments("");
        }, 1600);
      } else {
        setReturnError(data.error || "Failed to submit return request. Please contact customer support.");
      }
    } catch {
      setReturnError("Network error while submitting return request. Please try again.");
    } finally {
      setReturnSubmitting(false);
    }
  };

  const handleBuyAgain = (order: any) => {
    let matchedProduct: Product | undefined;
    if (order.productId) {
      matchedProduct = products.find((p) => p.id === order.productId);
    }
    if (!matchedProduct && order.items) {
      const itemsStr = String(order.items).toLowerCase();
      matchedProduct = products.find(
        (p) =>
          itemsStr.includes(p.name.toLowerCase()) ||
          p.name.toLowerCase().includes(itemsStr) ||
          itemsStr.includes(p.id.toLowerCase())
      );
    }
    if (matchedProduct) {
      router.push(`/checkout?productId=${encodeURIComponent(matchedProduct.id)}&quantity=1`);
    } else {
      router.push("/#shop");
    }
  };

  const getWhatsAppHelpUrl = (order: any, type: "general" | "refund" | "return" = "general") => {
    let msg = `Hello Pure Ayur Herbs Support, I need help with my Order #${order.id} (${order.items || "Remedy"}).`;
    if (type === "refund") {
      msg = `Hello Pure Ayur Herbs Support, I have a question regarding the refund for my cancelled Order #${order.id} (Total: ₹${order.total}).`;
    } else if (type === "return") {
      msg = `Hello Pure Ayur Herbs Support, I need assistance with return/replacement for Order #${order.id} (${order.items || "Remedy"}).`;
    }
    return `https://api.whatsapp.com/send?phone=917247824101&text=${encodeURIComponent(msg)}`;
  };

  const isOrderCancelled = (order: any) => {
    const s = String(order?.status || "").toLowerCase();
    return s.includes("cancel") || Boolean(order?.cancellationReason);
  };

  const isOrderReturn = (order: any) => {
    const s = String(order?.status || "").toLowerCase();
    return s.includes("return") || s.includes("refund") || Boolean(order?.returnReason);
  };

  const isOrderDelivered = (order: any) => {
    const s = String(order?.status || "").toLowerCase();
    return s === "delivered" && !isOrderReturn(order);
  };

  const isOrderActive = (order: any) => {
    return !isOrderCancelled(order) && !isOrderReturn(order) && !isOrderDelivered(order);
  };

  const activeOrdersCount = orders.filter(isOrderActive).length;
  const deliveredOrdersCount = orders.filter(isOrderDelivered).length;
  const cancelledOrdersCount = orders.filter((o) => isOrderCancelled(o) || isOrderReturn(o)).length;

  const displayedOrders = orders.filter((order) => {
    if (orderFilter === "active") return isOrderActive(order);
    if (orderFilter === "delivered") return isOrderDelivered(order);
    if (orderFilter === "cancelled") return isOrderCancelled(order) || isOrderReturn(order);
    return true;
  });

  const getOrderActiveStep = (status: string) => {
    const s = String(status || "").toLowerCase();
    if (s.includes("dispatch") || s.includes("transit") || s.includes("shipped") || s.includes("out for delivery")) return 3;
    if (s.includes("pack") || s.includes("ready")) return 2;
    return 1;
  };

  const handleOrderSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderSearchQuery.trim()) return;
    setOrderSearchLoading(true);
    setOrderSearchError(null);
    try {
      const res = await fetch(`/api/profile/orders?orderId=${encodeURIComponent(orderSearchQuery.trim())}&phone=${encodeURIComponent(orderSearchQuery.trim())}`);
      const data = await res.json();
      if (data.success && data.orders && data.orders.length > 0) {
        setOrders((prev) => {
          const existingIds = new Set(prev.map((o) => o.id));
          const newOrders = data.orders.filter((o: any) => !existingIds.has(o.id));
          return [...newOrders, ...prev];
        });
        setOrderSearchQuery("");
      } else {
        setOrderSearchError("No order found matching this Order ID or Phone number.");
      }
    } catch {
      setOrderSearchError("Error searching orders. Please try again.");
    } finally {
      setOrderSearchLoading(false);
    }
  };

  // Address State
  const [addresses, setAddresses] = useState<any[]>([]);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [addressForm, setAddressForm] = useState({
    name: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    isDefault: false,
  });

  // Settings State
  const [settingsForm, setSettingsForm] = useState({
    name: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [settingsMessage, setSettingsMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);

  // Recently Viewed State
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);

  // Load user session from server (httpOnly cookie)
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("pyur_user");
        if (cached) {
          const parsed = JSON.parse(cached);
          setUser(parsed);
          setAddresses(parsed.savedAddresses || []);
          setSettingsForm({
            name: parsed.name || "",
            phone: parsed.phone || "",
            password: "",
            confirmPassword: "",
          });
          setLoading(false);
        }
      } catch {}
    }

    fetch("/api/auth/me", { credentials: "include", cache: "no-store" })
      .then((res) => {
        if (!res.ok) {
          setUser(null);
          try { localStorage.removeItem("pyur_user"); } catch {}
          router.push("/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.success && data.user) {
          const parsed = data.user;
          setUser(parsed);
          try { localStorage.setItem("pyur_user", JSON.stringify(parsed)); } catch {}
          setAddresses(parsed.savedAddresses || []);
          setSettingsForm({
            name: parsed.name,
            phone: parsed.phone,
            password: "",
            confirmPassword: "",
          });
        } else {
          try { localStorage.removeItem("pyur_user"); } catch {}
          router.push("/login");
        }
      })
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));

    const handleAuthSync = () => {
      try {
        const cached = localStorage.getItem("pyur_user");
        if (!cached) {
          router.push("/login?expired=1");
        }
      } catch {
        router.push("/login?expired=1");
      }
    };

    window.addEventListener("pyur_auth_change", handleAuthSync);
    window.addEventListener("storage", handleAuthSync);

    return () => {
      window.removeEventListener("pyur_auth_change", handleAuthSync);
      window.removeEventListener("storage", handleAuthSync);
    };
  }, [router]);

  // Sync activeTab with search param
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Load orders & wallet coins
  useEffect(() => {
    fetchOrdersList();
  }, [user]);

  // Load recently viewed products
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("pyur_recently_viewed");
      if (stored) {
        try {
          const slugs: string[] = JSON.parse(stored);
          const matched = slugs
            .map((slug) => products.find((p) => p.slug === slug))
            .filter(Boolean) as Product[];
          setRecentlyViewed(matched);
        } catch (e) {
          // ignore
        }
      }
    }
  }, [activeTab]);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }

    setDetectingLocation(true);
    setLocationError("");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );
          const data = await res.json();
          if (data && data.address) {
            const addr = data.address;
            const street = [addr.suburb, addr.road, addr.neighbourhood].filter(Boolean).join(", ") || addr.amenity || "";
            const city = addr.city || addr.town || addr.village || addr.county || "";
            const state = addr.state || "";
            const pincode = addr.postcode || "";

            setAddressForm((prev) => ({
              ...prev,
              street: [street, addr.subdistrict].filter(Boolean).join(", ") || prev.street,
              city: city || prev.city,
              state: state || prev.state,
              pincode: pincode.replace(/\D/g, "") || prev.pincode,
            }));
            setLocationError("");
          } else {
            setLocationError("Could not retrieve address details for your location.");
          }
        } catch (e) {
          console.error(e);
          setLocationError("Error fetching address details from coordinates.");
        } finally {
          setDetectingLocation(false);
        }
      },
      (error) => {
        console.error(error);
        setLocationError("Failed to access your location. Please check your browser permissions.");
        setDetectingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Auto fill city/state based on live pincode lookup
  useEffect(() => {
    if (addressForm.pincode.length === 6) {
      fetch(`https://api.postalpincode.in/pincode/${addressForm.pincode}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data[0] && data[0].Status === "Success" && data[0].PostOffice?.length > 0) {
            const postOffice = data[0].PostOffice[0];
            setAddressForm((prev) => ({
              ...prev,
              city: postOffice.District || postOffice.Block || prev.city,
              state: postOffice.State || prev.state,
            }));
          }
        })
        .catch((e) => console.error("Error fetching pincode details:", e));
    }
  }, [addressForm.pincode]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8faf1]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#244f31] border-t-transparent" />
      </div>
    );
  }

  // Handle Sign Out (Clean & Permanent)
  const handleSignOut = async () => {
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
  };

  // Address Submit (Add/Edit)
  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressForm.name || !addressForm.phone || !addressForm.street || !addressForm.pincode) {
      alert("Please fill out all required fields.");
      return;
    }

    const payload = {
      userId: user.id,
      action: editingAddress ? "edit" : "add",
      addressId: editingAddress ? editingAddress.id : undefined,
      address: addressForm,
    };

    try {
      const res = await fetch("/api/profile/address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setAddresses(data.user.savedAddresses || []);
        setAddressModalOpen(false);
        setEditingAddress(null);
        setAddressForm({
          name: "",
          phone: "",
          street: "",
          city: "",
          state: "",
          pincode: "",
          isDefault: false,
        });
      } else {
        alert(data.error || "Failed to update address.");
      }
    } catch (e) {
      console.error(e);
      alert("Something went wrong. Please try again.");
    }
  };

  // Address Delete
  const handleAddressDelete = async (addressId: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;

    try {
      const res = await fetch("/api/profile/address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, action: "delete", addressId }),
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setAddresses(data.user.savedAddresses || []);
      } else {
        alert(data.error || "Failed to delete address.");
      }
    } catch (e) {
      console.error(e);
      alert("Something went wrong.");
    }
  };

  // Settings Submit (Update Account)
  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsMessage(null);

    if (settingsForm.password && settingsForm.password !== settingsForm.confirmPassword) {
      setSettingsMessage({ type: "error", text: "Passwords do not match." });
      return;
    }

    setSavingSettings(true);
    try {
      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          name: settingsForm.name,
          phone: settingsForm.phone,
          password: settingsForm.password || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setSettingsMessage({ type: "success", text: "Profile details updated successfully!" });
        setSettingsForm((prev) => ({ ...prev, password: "", confirmPassword: "" }));
      } else {
        setSettingsMessage({ type: "error", text: data.error || "Failed to update profile." });
      }
    } catch (e) {
      setSettingsMessage({ type: "error", text: "Connection error. Please try again." });
    } finally {
      setSavingSettings(false);
    }
  };

  const tabs = [
    { id: "orders", label: "Orders", icon: ShoppingBag },
    { id: "wallet", label: "Wallet (Coins)", icon: Wallet },
    { id: "addresses", label: "Addresses", icon: MapPin },
    { id: "recently-viewed", label: "Recently Viewed", icon: Eye },
    { id: "settings", label: "Account Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#f8faf1] text-[#17231b] pb-12">
      <AnnouncementBar />
      <SiteHeader
        cart={[]}
        onUpdateQuantity={() => {}}
        onRemoveItem={() => {}}
        onOpenAppModal={() => {}}
        onOpenLoginModal={() => {}}
        onOpenConsultationModal={() => {}}
      />

      <div className="max-w-6xl mx-auto px-4 mt-6">
        {/* Back to Home Link */}
        <div className="mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#244f31] hover:text-[#80a03c] transition group"
          >
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
            <span>Back to Main Shop Page</span>
          </Link>
        </div>

        <h1 className="text-2xl font-bold text-[#244f31] mb-6">My Profile</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Left Sidebar */}
          <div className="md:col-span-1 bg-white p-4 rounded-2xl border border-[#ddddd9] h-fit">
            <div className="flex items-center justify-between pb-4 border-b border-[#f0f0eb] md:pb-4 md:mb-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-[#244f31] font-bold text-white text-lg">
                  {user.name[0].toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-[#666666]">Welcome back,</span>
                  <span className="font-bold text-[#17231b] leading-tight">{user.name}</span>
                </div>
              </div>
              
              {/* Mobile Sign Out Button */}
              <button
                onClick={handleSignOut}
                className="md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-red-600 border border-red-100 hover:bg-red-50 transition"
              >
                <LogOut className="size-3.5" />
                <span>Sign Out</span>
              </button>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex flex-col gap-1 mt-4">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      router.push(`/profile?tab=${tab.id}`);
                    }}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold transition text-left ${
                      isActive
                        ? "bg-[#244f31] text-white"
                        : "text-[#17231b] hover:bg-[#f8faf1] hover:text-[#244f31]"
                    }`}
                  >
                    <Icon className="size-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}

              <Link
                href="/contact-us"
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-[#17231b] hover:bg-[#f8faf1] hover:text-[#244f31] transition"
              >
                <PhoneCall className="size-4" />
                <span>Contact Us</span>
              </Link>

              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition text-left mt-2 border-t border-[#f0f0eb] pt-4"
              >
                <LogOut className="size-4" />
                <span>Sign Out</span>
              </button>
            </nav>
          </div>

          {/* Mobile Horizontal Scrolling Tabs Selector */}
          <div className="md:hidden flex gap-2 overflow-x-auto pb-3 mb-2 no-scrollbar scroll-smooth min-w-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    router.push(`/profile?tab=${tab.id}`);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold shrink-0 transition ${
                    isActive
                      ? "bg-[#244f31] text-white shadow-xs"
                      : "bg-white text-[#17231b] border border-[#ddddd9] hover:bg-[#f8faf1]"
                  }`}
                >
                  <Icon className="size-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
            <Link
              href="/contact-us"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold shrink-0 bg-white text-[#17231b] border border-[#ddddd9] hover:bg-[#f8faf1] transition"
            >
              <PhoneCall className="size-3.5" />
              <span>Contact Us</span>
            </Link>
          </div>

          {/* Right Content Area */}
          <div className="md:col-span-3 bg-white p-6 rounded-2xl border border-[#ddddd9] min-h-[400px]">
            {/* Orders Tab */}
            {activeTab === "orders" && (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-[#f0f0eb]">
                  <div>
                    <h2 className="text-lg font-bold text-[#244f31]">My Orders</h2>
                    <p className="text-xs text-[#666666]">View your recent order history and track deliveries.</p>
                  </div>

                  {/* Order Search / Claim Form */}
                  <form onSubmit={handleOrderSearch} className="flex gap-2">
                    <input
                      type="text"
                      value={orderSearchQuery}
                      onChange={(e) => setOrderSearchQuery(e.target.value)}
                      placeholder="Find Order ID or Phone"
                      className="rounded-xl border border-[#ddddd9] px-3 py-1.5 text-xs outline-none focus:border-[#244f31] w-48"
                    />
                    <button
                      type="submit"
                      disabled={orderSearchLoading}
                      className="rounded-xl bg-[#244f31] text-white font-bold text-xs px-3 py-1.5 hover:bg-[#1d3b24] disabled:opacity-50 transition"
                    >
                      {orderSearchLoading ? "Searching..." : "Find Order"}
                    </button>
                  </form>
                </div>

                {orderSearchError && (
                  <p className="text-xs text-rose-600 font-bold mb-4 bg-rose-50 border border-rose-200 p-3 rounded-xl">
                    {orderSearchError}
                  </p>
                )}

                {/* Order Filter Tabs */}
                {!loadingOrders && orders.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pb-2 mb-4 no-scrollbar">
                    {[
                      { id: "all", label: "All Orders", count: orders.length },
                      { id: "active", label: "Active & In-Transit", count: activeOrdersCount },
                      { id: "delivered", label: "Delivered", count: deliveredOrdersCount },
                      { id: "cancelled", label: "Cancelled & Returns", count: cancelledOrdersCount },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setOrderFilter(tab.id as any)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-1.5 ${
                          orderFilter === tab.id
                            ? "bg-[#244f31] text-white shadow-xs"
                            : "bg-neutral-100 text-[#666666] hover:bg-neutral-200 hover:text-[#17231b]"
                        }`}
                      >
                        <span>{tab.label}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                            orderFilter === tab.id ? "bg-white/20 text-white" : "bg-neutral-200 text-[#444444]"
                          }`}
                        >
                          {tab.count}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {loadingOrders ? (
                  <div className="flex py-8 justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-3 border-[#244f31] border-t-transparent" />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-10 flex flex-col items-center gap-3 bg-neutral-50 rounded-2xl border border-dashed border-[#ddddd9] p-6">
                    <ShoppingBag className="size-10 text-[#244f31]/40" />
                    <h3 className="text-sm font-bold text-[#17231b]">No orders found for this profile</h3>
                    <p className="text-xs text-[#666666] max-w-md">
                      If you placed an order as a guest or with a different phone number, enter your <strong>Order ID (e.g. PYR-ORD-909337)</strong> or mobile number above to link it to your profile.
                    </p>
                    <Link
                      href="/#shop"
                      className="mt-2 rounded-xl bg-[#244f31] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#80a03c] shadow-xs"
                    >
                      Explore Ayurvedic Remedies
                    </Link>
                  </div>
                ) : displayedOrders.length === 0 ? (
                  <div className="text-center py-8 flex flex-col items-center gap-2 bg-neutral-50 rounded-2xl border border-dashed border-[#ddddd9] p-6">
                    <p className="text-xs text-[#666666]">No orders found in the selected category.</p>
                    <button
                      type="button"
                      onClick={() => setOrderFilter("all")}
                      className="text-xs font-bold text-[#244f31] hover:underline"
                    >
                      View all {orders.length} orders
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {displayedOrders.map((order) => {
                      const methodStr = String(order.method || "").toLowerCase();
                      const isPrepaid =
                        methodStr.includes("online") ||
                        methodStr.includes("upi") ||
                        methodStr.includes("phonepe") ||
                        methodStr.includes("prepaid") ||
                        methodStr.includes("card") ||
                        methodStr.includes("netbanking");

                      const cancelled = isOrderCancelled(order);
                      const returnReq = isOrderReturn(order);
                      const delivered = isOrderDelivered(order);
                      const active = isOrderActive(order);

                      return (
                        <div
                          key={order.id}
                          className="border border-[#ddddd9] rounded-2xl p-4 flex flex-col gap-3 bg-white shadow-xs transition hover:border-[#244f31]/40"
                        >
                          {/* Order Header */}
                          <div className="flex justify-between items-center pb-2 border-b border-[#f0f0eb] text-xs">
                            <div className="flex items-center gap-2">
                              <span className="text-[#666666]">
                                Order ID: <strong className="text-[#17231b]">{order.id}</strong>
                              </span>
                              <span className="text-gray-300">•</span>
                              <span className="text-xs font-semibold text-gray-700 bg-gray-100 rounded-md px-2 py-0.5">
                                {order.method || (isPrepaid ? "Online Payment" : "Cash on Delivery")}
                              </span>
                            </div>
                            <span className="text-[#666666] font-medium">{order.date}</span>
                          </div>

                          {/* Order Body */}
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex flex-col gap-1">
                              <span className="text-sm font-bold text-[#17231b]">{order.items}</span>
                              <span className="text-xs text-[#666666] leading-relaxed">
                                Ship to: {order.address}, {order.city}
                              </span>
                            </div>
                            <div className="flex flex-col items-end gap-1.5 shrink-0">
                              <span className="text-sm font-black text-[#244f31]">₹{order.total}</span>
                              <span
                                className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                                  delivered
                                    ? "bg-green-100 text-green-700"
                                    : cancelled
                                    ? "bg-rose-100 text-rose-700"
                                    : returnReq
                                    ? "bg-indigo-100 text-indigo-700"
                                    : "bg-amber-100 text-amber-700"
                                }`}
                              >
                                {order.status}
                              </span>
                            </div>
                          </div>

                          {/* Mini Shipment Stepper for Active Orders */}
                          {active && (
                            <div className="bg-[#fcfdfa] border border-[#e8ebe0] rounded-xl p-3 my-0.5">
                              <div className="flex items-center justify-between text-[11px] font-semibold text-[#666666] mb-2.5">
                                <span className="flex items-center gap-1.5 text-[#244f31] font-bold">
                                  <Package className="size-3.5" /> Shipment Timeline
                                </span>
                                <span className="text-[10px] text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-bold">
                                  {order.status || "In Progress"}
                                </span>
                              </div>
                              <div className="relative flex items-center justify-between px-2 pt-1 pb-1">
                                <div className="absolute left-6 right-6 top-4 -translate-y-1/2 h-1 bg-[#e4e8db] -z-0" />
                                <div
                                  className="absolute left-6 top-4 -translate-y-1/2 h-1 bg-[#244f31] transition-all -z-0"
                                  style={{
                                    width:
                                      getOrderActiveStep(order.status) === 1
                                        ? "0%"
                                        : getOrderActiveStep(order.status) === 2
                                        ? "45%"
                                        : "88%",
                                  }}
                                />
                                {[
                                  { step: 1, label: "Confirmed" },
                                  { step: 2, label: "Packed" },
                                  { step: 3, label: "Dispatched" },
                                  { step: 4, label: "Delivered" },
                                ].map((item) => {
                                  const currentStep = getOrderActiveStep(order.status);
                                  const isDone = currentStep > item.step;
                                  const isCurrent = currentStep === item.step;
                                  return (
                                    <div key={item.step} className="flex flex-col items-center gap-1 z-10">
                                      <div
                                        className={`size-6 rounded-full flex items-center justify-center text-[10px] font-black transition-colors ${
                                          isDone
                                            ? "bg-[#244f31] text-white"
                                            : isCurrent
                                            ? "bg-[#244f31] text-white ring-4 ring-[#80a03c]/25 animate-pulse"
                                            : "bg-white text-[#888888] border-2 border-[#ddddd9]"
                                        }`}
                                      >
                                        {isDone ? <Check className="size-3 stroke-[3]" /> : item.step}
                                      </div>
                                      <span
                                        className={`text-[10px] font-bold ${
                                          isCurrent
                                            ? "text-[#244f31]"
                                            : isDone
                                            ? "text-[#17231b]"
                                            : "text-[#999999]"
                                        }`}
                                      >
                                        {item.label}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Upgraded Cancellation & Transparent Refund Card */}
                          {cancelled && (
                            <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-3.5 flex flex-col gap-2.5 my-0.5">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-rose-800 font-bold text-xs">
                                  <AlertTriangle className="size-4 text-rose-600 shrink-0" />
                                  <span>Order Cancelled</span>
                                  {order.cancelledAt && (
                                    <span className="text-[10px] font-normal text-rose-600 ml-1">
                                      • {new Date(order.cancelledAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                                  Cancelled
                                </span>
                              </div>

                              {order.cancellationReason && (
                                <p className="text-[11px] text-rose-950 font-medium">
                                  <strong className="text-rose-900">Reason:</strong> {order.cancellationReason}
                                  {order.cancellationComments ? ` — "${order.cancellationComments}"` : ""}
                                </p>
                              )}

                              {isPrepaid ? (
                                <div className="bg-white rounded-xl p-2.5 border border-rose-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                  <div className="flex flex-col">
                                    <div className="flex items-center gap-1.5">
                                      <span className="size-2 rounded-full bg-emerald-500 shrink-0" />
                                      <span className="text-xs font-bold text-[#17231b]">
                                        Refund of ₹{order.total} Initiated via PhonePe
                                      </span>
                                    </div>
                                    <p className="text-[10px] text-[#666666] mt-0.5 ml-3.5">
                                      100% full refund credited to your original UPI / Bank Account within <strong>3-5 business days</strong>.
                                    </p>
                                  </div>
                                  <a
                                    href={getWhatsAppHelpUrl(order, "refund")}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg self-start sm:self-center shrink-0 transition"
                                  >
                                    <MessageCircle className="size-3 text-emerald-600" />
                                    <span>Track Refund on WhatsApp</span>
                                  </a>
                                </div>
                              ) : (
                                <div className="bg-white rounded-xl p-2.5 border border-rose-200/80 flex items-center gap-2">
                                  <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                                  <span className="text-[11px] text-gray-700 font-medium">
                                    Cash on Delivery: <strong>₹0 charged</strong> (Order halted safely before dispatch).
                                  </span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Upgraded Return / Replacement Card */}
                          {returnReq && (
                            <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-3.5 flex flex-col gap-2.5 my-0.5">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-indigo-900 font-bold text-xs">
                                  <RotateCcw className="size-4 text-indigo-600 shrink-0" />
                                  <span>
                                    {order.returnResolution === "Refund"
                                      ? "Return & Refund Request"
                                      : "Free Replacement Request"}
                                  </span>
                                  {order.returnRequestedAt && (
                                    <span className="text-[10px] font-normal text-indigo-600 ml-1">
                                      • {new Date(order.returnRequestedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                                  {order.returnStatus || "Return Request"}
                                </span>
                              </div>

                              {order.returnReason && (
                                <p className="text-[11px] text-indigo-950 font-medium">
                                  <strong className="text-indigo-900">Reason:</strong> {order.returnReason}
                                  {order.returnComments ? ` — "${order.returnComments}"` : ""}
                                </p>
                              )}

                              <div className="bg-white rounded-xl p-2.5 border border-indigo-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div className="flex flex-col">
                                  <span className="text-xs font-bold text-[#17231b]">Reverse Courier Pickup Scheduled</span>
                                  <p className="text-[10px] text-[#666666] mt-0.5">
                                    Shiprocket partner will arrange doorstep pickup within <strong>24-48 hours</strong>.
                                  </p>
                                </div>
                                <a
                                  href={getWhatsAppHelpUrl(order, "return")}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 hover:text-indigo-800 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-lg self-start sm:self-center shrink-0 transition"
                                >
                                  <MessageCircle className="size-3 text-indigo-600" />
                                  <span>Send Remedy Photos</span>
                                </a>
                              </div>
                            </div>
                          )}

                          {/* Action Buttons Row */}
                          <div className="flex flex-wrap gap-2 justify-end border-t border-[#f0f0eb] pt-3 mt-1 items-center">
                            {/* 1-Click WhatsApp Assistance */}
                            <a
                              href={getWhatsAppHelpUrl(
                                order,
                                cancelled ? "refund" : returnReq ? "return" : "general"
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 rounded-xl border border-[#ddddd9] text-[#666666] font-semibold text-[10px] sm:text-xs py-1.5 px-3 hover:border-emerald-500 hover:text-emerald-700 hover:bg-emerald-50/40 transition mr-auto"
                            >
                              <MessageCircle className="size-3.5 text-emerald-600" />
                              <span>Need Help?</span>
                            </a>

                            {/* Track Package */}
                            <Link
                              href={`/track?orderId=${encodeURIComponent(order.id)}&contact=${encodeURIComponent(
                                user?.email || user?.phone || order.phone || ""
                              )}`}
                              className="rounded-xl border border-[#244f31] text-[#244f31] font-bold text-[10px] sm:text-xs py-1.5 px-3 hover:bg-[#f8faf1] transition"
                            >
                              Track Package
                            </Link>

                            {/* In-Place Cancel Order for Active Orders */}
                            {active && (
                              <button
                                type="button"
                                onClick={() => {
                                  setCancellingOrder(order);
                                  setCancelReason("Ordered by mistake");
                                  setCancelComments("");
                                  setCancelError(null);
                                  setCancelSuccessMsg(null);
                                }}
                                className="rounded-xl border border-rose-200 bg-rose-50 text-rose-700 font-bold text-[10px] sm:text-xs py-1.5 px-3 hover:bg-rose-100 transition"
                              >
                                Cancel Order
                              </button>
                            )}

                            {/* In-Place Return / Replace for Delivered Orders */}
                            {delivered && (
                              <button
                                type="button"
                                onClick={() => {
                                  setReturningOrder(order);
                                  setReturnResolution("Replacement");
                                  setReturnReason("Damaged / Leaked during transit");
                                  setReturnComments("");
                                  setReturnError(null);
                                  setReturnSuccessMsg(null);
                                }}
                                className="rounded-xl border border-amber-300 bg-amber-50 text-amber-800 font-bold text-[10px] sm:text-xs py-1.5 px-3 hover:bg-amber-100 transition flex items-center gap-1"
                              >
                                <RotateCcw className="size-3" />
                                <span>Return / Replace</span>
                              </button>
                            )}

                            {/* 1-Click Buy Again for Delivered or Cancelled */}
                            {(delivered || cancelled) && (
                              <button
                                type="button"
                                onClick={() => handleBuyAgain(order)}
                                className="rounded-xl bg-[#244f31] text-white font-bold text-[10px] sm:text-xs py-1.5 px-3 hover:bg-[#1d3b24] transition flex items-center gap-1 shadow-xs"
                              >
                                <ShoppingBag className="size-3" />
                                <span>Buy Again</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Wallet Tab */}
            {activeTab === "wallet" && (
              <div>
                <h2 className="text-lg font-bold text-[#244f31] mb-2">My Wallet</h2>
                <p className="text-xs text-[#666666] mb-6">Earn Pure Coins on every purchase and redeem them at checkout for discount rates.</p>

                {/* Coin balance Card */}
                {(() => {
                  const rate = Number(coinsSettings?.coinsPerRupee) || 10;
                  const rupeeWorth = (coinsBalance / rate).toFixed(2);
                  return (
                    <div className="bg-gradient-to-br from-[#244f31] to-[#80a03c] p-6 rounded-2xl text-white flex justify-between items-center mb-6 shadow-md">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs uppercase tracking-wider font-bold opacity-80">Available Pure Coins</span>
                        <span className="text-4xl font-black tracking-tight">🪙 {coinsBalance}</span>
                        <span className="text-xs font-bold text-emerald-100 mt-0.5">
                          Worth ≈ ₹{rupeeWorth} in discounts
                        </span>
                      </div>
                      <div className="flex flex-col items-end text-xs text-right font-medium opacity-90 max-w-[220px]">
                        <span className="font-black bg-white/25 px-2.5 py-1 rounded-md mb-1.5 text-[11px] tracking-wide">
                          🪙 {rate} Coins = ₹1.00 Value
                        </span>
                        <span className="text-[11px] leading-relaxed">
                          Redeemable for up to {coinsSettings?.maxRedemptionPercent || 20}% off orders at checkout.
                        </span>
                      </div>
                    </div>
                  );
                })()}

                <h3 className="font-bold text-[#17231b] text-sm mb-3">Transaction History</h3>
                <div className="border border-[#ddddd9] rounded-2xl divide-y divide-[#f0f0eb] overflow-hidden">
                  {transactions.length === 0 ? (
                    <div className="p-4 text-center text-xs text-gray-400 font-medium">
                      No coin transactions yet. Earn coins with every purchase!
                    </div>
                  ) : (
                    transactions.map((tx) => (
                      <div key={tx.id} className="p-3 flex justify-between items-center text-xs font-semibold">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[#17231b]">{tx.description}</span>
                          <span className="text-[10px] text-[#999999]">{tx.date}</span>
                        </div>
                        <span className={`text-sm font-bold ${tx.amount < 0 ? "text-rose-600" : "text-[#80a03c]"}`}>
                          {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === "addresses" && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-[#244f31]">Saved Addresses</h2>
                  <button
                    onClick={() => {
                      setEditingAddress(null);
                      setAddressForm({
                        name: user.name,
                        phone: user.phone,
                        street: "",
                        city: "",
                        state: "",
                        pincode: "",
                        isDefault: false,
                      });
                      setAddressModalOpen(true);
                    }}
                    className="flex items-center gap-1 text-xs font-bold bg-[#244f31] text-white px-3 py-1.5 rounded-lg transition hover:bg-[#80a03c]"
                  >
                    <Plus className="size-3.5" />
                    <span>Add New</span>
                  </button>
                </div>

                {addresses.length === 0 ? (
                  <div className="text-center py-12 flex flex-col items-center gap-3">
                    <MapPin className="size-12 text-[#ddddd9]" />
                    <p className="text-sm font-medium text-[#666666]">You haven't saved any addresses yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                      <div key={addr.id} className={`border rounded-2xl p-4 flex flex-col gap-2 relative ${
                        addr.isDefault ? "border-[#244f31] bg-[#f8faf1]/30" : "border-[#ddddd9]"
                      }`}>
                        <div className="flex justify-between items-start pr-12">
                          <span className="font-bold text-[#17231b] text-sm">{addr.name}</span>
                          {addr.isDefault && (
                            <span className="text-[9px] font-black uppercase text-[#244f31] bg-[#eef2db] border border-[#244f31]/20 rounded-md px-1.5 py-0.5 flex items-center gap-0.5">
                              <MapPinCheck className="size-2.5" />
                              <span>Default</span>
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-700 leading-relaxed font-semibold">
                          {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                        <span className="text-xs text-[#666666] font-semibold">Phone: {addr.phone}</span>

                        <div className="flex gap-3 mt-2 border-t border-[#f0f0eb] pt-2">
                          <button
                            onClick={() => {
                              setEditingAddress(addr);
                              setAddressForm({
                                name: addr.name,
                                phone: addr.phone,
                                street: addr.street,
                                city: addr.city,
                                state: addr.state,
                                pincode: addr.pincode,
                                isDefault: addr.isDefault,
                              });
                              setAddressModalOpen(true);
                            }}
                            className="text-xs font-bold text-[#244f31] hover:underline"
                          >
                            Edit
                          </button>
                          {!addr.isDefault && (
                            <button
                              onClick={() => handleAddressDelete(addr.id)}
                              className="text-xs font-bold text-red-600 hover:underline flex items-center gap-0.5 ml-auto"
                            >
                              <Trash2 className="size-3.5" />
                              <span>Delete</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Address modal form */}
                {addressModalOpen && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-[#ddddd9] shadow-2xl relative">
                      <h3 className="font-bold text-lg text-[#244f31] mb-4">
                        {editingAddress ? "Edit Shipping Address" : "Add Shipping Address"}
                      </h3>
                      <form onSubmit={handleAddressSubmit} className="flex flex-col gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-bold text-[#17231b]">Recipient Name *</label>
                          <input
                            type="text"
                            required
                            value={addressForm.name}
                            onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                            className="border border-[#ddddd9] rounded-xl px-3 py-2 text-sm focus:outline-[#244f31]"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-bold text-[#17231b]">Mobile Number *</label>
                          <input
                            type="tel"
                            required
                            pattern="[0-9]{10}"
                            value={addressForm.phone}
                            onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                            className="border border-[#ddddd9] rounded-xl px-3 py-2 text-sm focus:outline-[#244f31]"
                            placeholder="10-digit phone number"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-[#17231b]">Street Address *</label>
                            <button
                              type="button"
                              onClick={handleDetectLocation}
                              disabled={detectingLocation}
                              className="flex items-center gap-1.5 text-[10px] font-bold text-[#244f31] hover:text-[#80a03c] transition disabled:opacity-50"
                            >
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                              </span>
                              <span>{detectingLocation ? "Detecting..." : "Use Current Location"}</span>
                            </button>
                          </div>
                          <input
                            type="text"
                            required
                            value={addressForm.street}
                            onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                            className="border border-[#ddddd9] rounded-xl px-3 py-2 text-sm focus:outline-[#244f31]"
                            placeholder="Flat/House No., Colony, Landmark"
                          />
                          {locationError && (
                            <p className="mt-1 text-[10px] text-red-500 font-bold flex items-center gap-1 animate-pulse">
                              <span>⚠️</span>
                              <span>{locationError}</span>
                            </p>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-[#17231b]">City *</label>
                            <input
                              type="text"
                              required
                              value={addressForm.city}
                              onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                              className="border border-[#ddddd9] rounded-xl px-3 py-2 text-sm focus:outline-[#244f31]"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-[#17231b]">State *</label>
                            <input
                              type="text"
                              required
                              value={addressForm.state}
                              onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                              className="border border-[#ddddd9] rounded-xl px-3 py-2 text-sm focus:outline-[#244f31]"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-[#17231b]">Pincode *</label>
                            <input
                              type="text"
                              required
                              maxLength={6}
                              value={addressForm.pincode}
                              onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                              className="border border-[#ddddd9] rounded-xl px-3 py-2 text-sm focus:outline-[#244f31]"
                            />
                          </div>
                          <div className="flex items-center gap-2 mt-5">
                            <input
                              type="checkbox"
                              id="isDefault"
                              checked={addressForm.isDefault}
                              disabled={editingAddress?.isDefault}
                              onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                              className="size-4 accent-[#244f31]"
                            />
                            <label htmlFor="isDefault" className="text-xs font-bold text-gray-700 cursor-pointer">
                              Set as Default
                            </label>
                          </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-4 border-t border-[#f0f0eb] pt-4">
                          <button
                            type="button"
                            onClick={() => setAddressModalOpen(false)}
                            className="border border-[#ddddd9] text-xs font-bold px-4 py-2 rounded-xl hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="bg-[#244f31] text-white text-xs font-bold px-4 py-2 rounded-xl transition hover:bg-[#80a03c]"
                          >
                            Save Address
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Recently Viewed Tab */}
            {activeTab === "recently-viewed" && (
              <div>
                <h2 className="text-lg font-bold text-[#244f31] mb-4">Recently Viewed</h2>
                {recentlyViewed.length === 0 ? (
                  <div className="text-center py-12 flex flex-col items-center gap-3">
                    <Eye className="size-12 text-[#ddddd9]" />
                    <p className="text-sm font-medium text-[#666666]">You haven't viewed any products recently.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {recentlyViewed.map((prod) => (
                      <Link
                        href={`/products/${prod.slug}`}
                        key={prod.id}
                        className="border border-[#ddddd9] rounded-2xl p-3 flex flex-col hover:shadow-md transition bg-white"
                      >
                        <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-2 bg-[#f8faf1]">
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <span className="text-[10px] font-black text-[#80a03c] uppercase">{prod.concern}</span>
                        <h3 className="font-bold text-xs text-[#17231b] truncate mt-0.5">{prod.name}</h3>
                        <div className="flex items-center gap-1.5 mt-2 justify-between">
                          <span className="text-xs font-black text-[#244f31]">₹{prod.price}</span>
                          <span className="text-[9px] font-bold text-[#666666] line-through">₹{prod.compareAt}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Account Settings Tab */}
            {activeTab === "settings" && (
              <div>
                <h2 className="text-lg font-bold text-[#244f31] mb-4">Account Settings</h2>

                {settingsMessage && (
                  <div className={`p-3 rounded-xl border text-xs font-bold mb-4 ${
                    settingsMessage.type === "success"
                      ? "bg-green-50 border-green-200 text-green-700"
                      : "bg-red-50 border-red-200 text-red-700"
                  }`}>
                    {settingsMessage.text}
                  </div>
                )}

                <form onSubmit={handleSettingsSubmit} className="flex flex-col gap-4 max-w-md">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-[#17231b]">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={settingsForm.name}
                      onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                      className="border border-[#ddddd9] rounded-xl px-3 py-2 text-sm focus:outline-[#244f31]"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-[#17231b]">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      pattern="[0-9]{10}"
                      value={settingsForm.phone}
                      onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                      className="border border-[#ddddd9] rounded-xl px-3 py-2 text-sm focus:outline-[#244f31]"
                    />
                  </div>

                  <div className="border-t border-[#f0f0eb] pt-4 mt-2">
                    <h3 className="text-xs font-black uppercase text-[#666666] tracking-wider mb-3">Change Password (optional)</h3>
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-[#17231b]">New Password</label>
                        <input
                          type="password"
                          value={settingsForm.password}
                          onChange={(e) => setSettingsForm({ ...settingsForm, password: e.target.value })}
                          className="border border-[#ddddd9] rounded-xl px-3 py-2 text-sm focus:outline-[#244f31]"
                          placeholder="Leave blank to keep current"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-[#17231b]">Confirm New Password</label>
                        <input
                          type="password"
                          value={settingsForm.confirmPassword}
                          onChange={(e) => setSettingsForm({ ...settingsForm, confirmPassword: e.target.value })}
                          className="border border-[#ddddd9] rounded-xl px-3 py-2 text-sm focus:outline-[#244f31]"
                          placeholder="Leave blank to keep current"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={savingSettings}
                    className="bg-[#244f31] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition hover:bg-[#80a03c] disabled:opacity-50 mt-4 max-w-[150px]"
                  >
                    {savingSettings ? "Saving..." : "Save Details"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* In-Place Cancel Order Modal */}
      {cancellingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-[#ddddd9] shadow-2xl relative my-8 animate-in fade-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => !cancelSubmitting && setCancellingOrder(null)}
              className="absolute right-4 top-4 text-[#666666] hover:text-[#17231b] p-1 rounded-lg hover:bg-gray-100 transition"
            >
              <X className="size-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-3 text-rose-600">
              <div className="size-9 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="size-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#17231b]">Cancel Order</h3>
                <p className="text-xs text-[#666666]">
                  Order ID: <strong>{cancellingOrder.id}</strong>
                </p>
              </div>
            </div>

            <div className="border-y border-[#f0f0eb] py-2.5 my-3 text-xs flex justify-between items-center">
              <span className="font-semibold text-[#17231b] truncate max-w-[280px]">
                {cancellingOrder.items}
              </span>
              <span className="font-black text-[#244f31] text-sm">₹{cancellingOrder.total}</span>
            </div>

            {/* Transparent Refund Notice */}
            {(() => {
              const methodStr = String(cancellingOrder.method || "").toLowerCase();
              const isPrepaid =
                methodStr.includes("online") ||
                methodStr.includes("upi") ||
                methodStr.includes("phonepe") ||
                methodStr.includes("prepaid") ||
                methodStr.includes("card") ||
                methodStr.includes("netbanking");

              return isPrepaid ? (
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 mb-4 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-800 mb-1">
                    <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                    <span>100% Full Refund via PhonePe Gateway</span>
                  </div>
                  <p className="text-[#444444] leading-relaxed text-[11px]">
                    Since you paid online (<strong>₹{cancellingOrder.total}</strong>), your payment
                    will be automatically refunded back to your original payment mode (UPI / Card /
                    Bank) within <strong>3-5 business days</strong>. You will receive an instant
                    WhatsApp confirmation.
                  </p>
                </div>
              ) : (
                <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3 mb-4 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-neutral-800 mb-1">
                    <ShieldCheck className="size-4 text-[#244f31] shrink-0" />
                    <span>Cash on Delivery: ₹0 Deducted</span>
                  </div>
                  <p className="text-[#666666] leading-relaxed text-[11px]">
                    This is a Cash on Delivery order. No amount was charged to you, and the delivery
                    shipment will be safely halted before dispatch.
                  </p>
                </div>
              );
            })()}

            {cancelSuccessMsg && (
              <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-green-800 text-xs font-bold mb-4 flex items-center gap-2">
                <CheckCircle2 className="size-4 text-green-600 shrink-0" />
                <span>{cancelSuccessMsg}</span>
              </div>
            )}

            {cancelError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold mb-4">
                {cancelError}
              </div>
            )}

            {!cancelSuccessMsg && (
              <div className="flex flex-col gap-3.5">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-[#17231b]">Reason for Cancellation *</label>
                  <select
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="border border-[#ddddd9] rounded-xl px-3 py-2 text-xs focus:outline-[#244f31] bg-white font-medium"
                  >
                    <option value="Ordered by mistake">Ordered by mistake</option>
                    <option value="Found better price / alternative">Found better price / alternative</option>
                    <option value="Delivery time is too long">Delivery time is too long</option>
                    <option value="Need to change shipping address or phone">Need to change shipping address or phone</option>
                    <option value="Need to change payment method or remedy variant">Need to change payment method or remedy variant</option>
                    <option value="Other reason">Other reason</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-[#17231b]">Additional Comments (optional)</label>
                  <textarea
                    rows={2}
                    value={cancelComments}
                    onChange={(e) => setCancelComments(e.target.value)}
                    placeholder="Tell us what went wrong so we can improve..."
                    className="border border-[#ddddd9] rounded-xl px-3 py-2 text-xs focus:outline-[#244f31] resize-none"
                  />
                </div>

                <p className="text-[10px] text-[#888888]">
                  Note: Once cancelled, this order cannot be reopened. You can place a new order anytime.
                </p>

                <div className="flex gap-2 justify-end mt-2 pt-2 border-t border-[#f0f0eb]">
                  <button
                    type="button"
                    disabled={cancelSubmitting}
                    onClick={() => setCancellingOrder(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-[#666666] hover:bg-neutral-100 transition"
                  >
                    Keep Order
                  </button>
                  <button
                    type="button"
                    disabled={cancelSubmitting}
                    onClick={handleConfirmCancel}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50 transition flex items-center gap-1.5 shadow-xs"
                  >
                    {cancelSubmitting ? (
                      <>
                        <RefreshCw className="size-3.5 animate-spin" />
                        <span>Cancelling...</span>
                      </>
                    ) : (
                      <span>Confirm Cancellation</span>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* In-Place Return / Replace Modal */}
      {returningOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-[#ddddd9] shadow-2xl relative my-8 animate-in fade-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => !returnSubmitting && setReturningOrder(null)}
              className="absolute right-4 top-4 text-[#666666] hover:text-[#17231b] p-1 rounded-lg hover:bg-gray-100 transition"
            >
              <X className="size-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-3 text-[#244f31]">
              <div className="size-9 rounded-xl bg-[#eef2db] flex items-center justify-center shrink-0">
                <RotateCcw className="size-5 text-[#244f31]" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#17231b]">Return or Replace Order</h3>
                <p className="text-xs text-[#666666]">
                  Order ID: <strong>{returningOrder.id}</strong>
                </p>
              </div>
            </div>

            <div className="border-y border-[#f0f0eb] py-2.5 my-3 text-xs flex justify-between items-center">
              <span className="font-semibold text-[#17231b] truncate max-w-[280px]">
                {returningOrder.items}
              </span>
              <span className="font-black text-[#244f31] text-sm">₹{returningOrder.total}</span>
            </div>

            {returnSuccessMsg && (
              <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-green-800 text-xs font-bold mb-4 flex items-center gap-2">
                <CheckCircle2 className="size-4 text-green-600 shrink-0" />
                <span>{returnSuccessMsg}</span>
              </div>
            )}

            {returnError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold mb-4">
                {returnError}
              </div>
            )}

            {!returnSuccessMsg && (
              <div className="flex flex-col gap-3.5">
                {/* Resolution Choice */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#17231b]">What would you prefer? *</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setReturnResolution("Replacement")}
                      className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition ${
                        returnResolution === "Replacement"
                          ? "border-[#244f31] bg-[#f8faf1] ring-1 ring-[#244f31]"
                          : "border-[#ddddd9] hover:bg-neutral-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#17231b]">Free Replacement</span>
                        <span className="text-[9px] font-black uppercase text-[#244f31] bg-[#eef2db] px-1.5 py-0.2 rounded">
                          Recommended
                        </span>
                      </div>
                      <p className="text-[10px] text-[#666666] leading-tight">
                        Fresh bottle dispatched immediately free of cost.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setReturnResolution("Refund")}
                      className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition ${
                        returnResolution === "Refund"
                          ? "border-[#244f31] bg-[#f8faf1] ring-1 ring-[#244f31]"
                          : "border-[#ddddd9] hover:bg-neutral-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#17231b]">Full Refund</span>
                      </div>
                      <p className="text-[10px] text-[#666666] leading-tight">
                        ₹{returningOrder.total} credited back to original source/UPI.
                      </p>
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-[#17231b]">Reason for Return *</label>
                  <select
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    className="border border-[#ddddd9] rounded-xl px-3 py-2 text-xs focus:outline-[#244f31] bg-white font-medium"
                  >
                    <option value="Damaged / Leaked during transit">Damaged / Leaked during transit</option>
                    <option value="Broken safety seal upon delivery">Broken safety seal upon delivery</option>
                    <option value="Wrong remedy or quantity delivered">Wrong remedy or quantity delivered</option>
                    <option value="Product quality not meeting expectations">Product quality not meeting expectations</option>
                    <option value="Doctor advised different remedy">Doctor advised different remedy</option>
                    <option value="Other reason">Other reason</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-[#17231b]">Additional Details *</label>
                  <textarea
                    rows={2}
                    value={returnComments}
                    onChange={(e) => setReturnComments(e.target.value)}
                    placeholder="Describe the issue with the package or remedy..."
                    className="border border-[#ddddd9] rounded-xl px-3 py-2 text-xs focus:outline-[#244f31] resize-none"
                  />
                </div>

                <div className="bg-[#fcfdfa] border border-[#e8ebe0] rounded-xl p-3 text-[11px] text-[#444444] flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 font-bold text-[#244f31]">
                    <ShieldCheck className="size-3.5 text-[#244f31]" />
                    <span>Doorstep Reverse Pickup & Inspection</span>
                  </div>
                  <p className="text-[10px] text-[#666666] leading-relaxed">
                    Our Shiprocket courier partner will arrange pickup at your delivery address. Please keep
                    the product bottle in its original packaging. You will receive real-time updates on
                    WhatsApp.
                  </p>
                </div>

                <div className="flex gap-2 justify-end mt-2 pt-2 border-t border-[#f0f0eb]">
                  <button
                    type="button"
                    disabled={returnSubmitting}
                    onClick={() => setReturningOrder(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-[#666666] hover:bg-neutral-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={returnSubmitting}
                    onClick={handleConfirmReturn}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[#244f31] text-white hover:bg-[#1d3b24] disabled:opacity-50 transition flex items-center gap-1.5 shadow-xs"
                  >
                    {returnSubmitting ? (
                      <>
                        <RefreshCw className="size-3.5 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <span>Submit Request</span>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Profile() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#f8faf1]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#244f31] border-t-transparent" />
      </div>
    }>
      <ProfileDashboard />
    </Suspense>
  );
}
