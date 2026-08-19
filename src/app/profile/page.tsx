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
} from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import { products, Product } from "@/lib/store";

function ProfileDashboard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialTab = searchParams.get("tab") || "orders";

  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(true);

  // Orders & Coins State
  const [orders, setOrders] = useState<any[]>([]);
  const [coinsBalance, setCoinsBalance] = useState(100);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

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

  // Load user session
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("pyur_user");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setUser(parsed);
          setAddresses(parsed.savedAddresses || []);
          setSettingsForm({
            name: parsed.name,
            phone: parsed.phone,
            password: "",
            confirmPassword: "",
          });
        } catch (e) {
          router.push("/login");
        }
      } else {
        router.push("/login");
      }
      setLoading(false);
    }
  }, [router]);

  // Sync activeTab with search param
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Load orders & wallet coins
  useEffect(() => {
    if (!user || (!user.email && !user.phone)) return;
    setLoadingOrders(true);
    fetch(`/api/profile/orders?email=${user.email || ""}&phone=${user.phone || ""}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setOrders(data.orders);
          setCoinsBalance(data.coinsBalance);
          setTransactions(data.transactions);
        }
      })
      .catch((e) => console.error("Error loading orders:", e))
      .finally(() => setLoadingOrders(false));
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

  // Handle Sign Out
  const handleSignOut = () => {
    localStorage.removeItem("pyur_user");
    router.push("/");
    setTimeout(() => window.location.reload(), 100);
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
        localStorage.setItem("pyur_user", JSON.stringify(data.user));
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
        localStorage.setItem("pyur_user", JSON.stringify(data.user));
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
        localStorage.setItem("pyur_user", JSON.stringify(data.user));
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
                <h2 className="text-lg font-bold text-[#244f31] mb-4">My Orders</h2>
                {loadingOrders ? (
                  <div className="flex py-8 justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-3 border-[#244f31] border-t-transparent" />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12 flex flex-col items-center gap-3">
                    <ShoppingBag className="size-12 text-[#ddddd9]" />
                    <p className="text-sm font-medium text-[#666666]">You haven't placed any orders yet.</p>
                    <Link
                      href="/#shop"
                      className="rounded-lg bg-[#244f31] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#80a03c]"
                    >
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {orders.map((order) => (
                      <div key={order.id} className="border border-[#ddddd9] rounded-2xl p-4 flex flex-col gap-3">
                        <div className="flex justify-between items-center pb-2 border-b border-[#f0f0eb] text-xs font-semibold">
                          <span className="text-[#666666]">Order ID: <span className="text-[#17231b]">{order.id}</span></span>
                          <span className="text-[#666666]">{order.date}</span>
                        </div>
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex flex-col gap-1">
                            <span className="text-sm font-bold text-[#17231b]">{order.items}</span>
                            <span className="text-xs text-[#666666]">Ship to: {order.address}, {order.city}</span>
                            <span className="text-xs font-bold text-gray-700 bg-gray-100 rounded-md px-2 py-0.5 w-fit mt-1">{order.method}</span>
                          </div>
                          <div className="flex flex-col items-end gap-1.5 shrink-0">
                            <span className="text-sm font-black text-[#244f31]">₹{order.total}</span>
                            <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                              order.status === "Delivered" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                            }`}>{order.status}</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2.5 justify-end border-t border-[#f0f0eb] pt-3 mt-1">
                          <Link
                            href={`/track?orderId=${encodeURIComponent(order.id)}&contact=${encodeURIComponent(user?.email || user?.phone || "")}`}
                            className="rounded-xl border border-[#244f31] text-[#244f31] font-bold text-[10px] sm:text-xs py-1.5 px-3 hover:bg-[#f8faf1] transition"
                          >
                            Track Package
                          </Link>
                          {order.status === "Delivered" && (
                            <Link
                              href="/#shop"
                              className="rounded-xl bg-[#244f31] text-white font-bold text-[10px] sm:text-xs py-1.5 px-3 hover:bg-[#1d3b24] transition text-center"
                            >
                              Buy Again
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Wallet Tab */}
            {activeTab === "wallet" && (
              <div>
                <h2 className="text-lg font-bold text-[#244f31] mb-2">My Wallet</h2>
                <p className="text-xs text-[#666666] mb-6">Earn Pyur Coins on every purchase and redeem them at checkout for discount rates.</p>

                {/* Coin balance Card */}
                <div className="bg-gradient-to-br from-[#244f31] to-[#80a03c] p-6 rounded-2xl text-white flex justify-between items-center mb-6 shadow-md">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs uppercase tracking-wider font-bold opacity-80">Available Pyur Coins</span>
                    <span className="text-4xl font-black tracking-tight">🪙 {coinsBalance}</span>
                  </div>
                  <div className="flex flex-col items-end text-xs text-right font-medium opacity-90 max-w-[200px]">
                    <span className="font-bold bg-white/20 px-2 py-1 rounded-md mb-1">1 Coin = ₹1.00 Value</span>
                    <span>Coins are automatically credited upon successful order shipment.</span>
                  </div>
                </div>

                <h3 className="font-bold text-[#17231b] text-sm mb-3">Transaction History</h3>
                <div className="border border-[#ddddd9] rounded-2xl divide-y divide-[#f0f0eb] overflow-hidden">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="p-3 flex justify-between items-center text-xs font-semibold">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[#17231b]">{tx.description}</span>
                        <span className="text-[10px] text-[#999999]">{tx.date}</span>
                      </div>
                      <span className="text-sm font-bold text-[#80a03c]">+{tx.amount}</span>
                    </div>
                  ))}
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
