"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Package,
  Truck,
  Calendar,
  MapPin,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  RefreshCw,
  User,
  ExternalLink,
} from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { products, Product } from "@/lib/store";

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const urlOrderId = searchParams.get("orderId") || "";
  const urlContact = searchParams.get("contact") || "";

  const [orderIdInput, setOrderIdInput] = useState(urlOrderId);
  const [contactInput, setContactInput] = useState(urlContact);
  
  const [order, setOrder] = useState<any>(null);
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [authFormContact, setAuthFormContact] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [whatsappNumber, setWhatsappNumber] = useState("919876543210");

  useEffect(() => {
    fetch("/api/admin/all", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data.settings && data.settings.whatsappNumber) {
          setWhatsappNumber(data.settings.whatsappNumber);
        }
      })
      .catch((e) => console.error("Error loading settings:", e));
  }, []);

  let cleanNumber = whatsappNumber.replace(/\D/g, "");
  if (cleanNumber.length === 10) {
    cleanNumber = "91" + cleanNumber;
  }

  const fetchOrder = async (id: string, contactVal?: string) => {
    if (!id.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/track?orderId=${encodeURIComponent(id.trim())}&contact=${encodeURIComponent(contactVal || "")}`, { cache: "no-store" });
      const data = await res.json();
      if (res.ok && data.success) {
        setOrder(data.order);
        setAuthorized(data.authorized);
      } else {
        setOrder(null);
        setError(data.error || "Failed to load tracking details.");
      }
    } catch (e) {
      console.error(e);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (urlOrderId) {
      void fetchOrder(urlOrderId, urlContact);
    }
  }, [urlOrderId, urlContact]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderIdInput.trim()) return;
    
    // Update search query parameters
    const params = new URLSearchParams();
    params.set("orderId", orderIdInput.trim());
    if (contactInput.trim()) {
      params.set("contact", contactInput.trim());
    }
    router.push(`/track?${params.toString()}`);
  };

  const handleUnmaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authFormContact.trim() || !order) return;
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await fetch(`/api/track?orderId=${encodeURIComponent(order.id)}&contact=${encodeURIComponent(authFormContact.trim())}`, { cache: "no-store" });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.authorized) {
          setOrder(data.order);
          setAuthorized(true);
          // Update URL params silently
          const params = new URLSearchParams(window.location.search);
          params.set("contact", authFormContact.trim());
          router.replace(`/track?${params.toString()}`);
        } else {
          setAuthError("Email or mobile number does not match this Order ID.");
        }
      } else {
        setAuthError(data.error || "Verification failed.");
      }
    } catch {
      setAuthError("Connection error. Try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  // Determine timeline progress steps based on status, pre-filled with mockup data matching layout details
  const getTrackingSteps = (status: string, orderDateStr: string, trackingId?: string) => {
    // Generate dates based on order date or fallback to current/yesterday
    const baseDate = orderDateStr ? new Date(orderDateStr) : new Date();
    
    const formatDate = (date: Date, offsetDays = 0) => {
      if (!date || isNaN(date.getTime())) return "";
      const d = new Date(date);
      d.setDate(d.getDate() + offsetDays);
      if (isNaN(d.getTime())) return "";
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      
      const dayName = days[d.getDay()] || "Day";
      const dayVal = d.getDate();
      const monthName = months[d.getMonth()] || "Month";
      const yearName = isNaN(d.getFullYear()) ? "YY" : d.getFullYear().toString().slice(-2);
      
      // Determine suffix e.g. 19th, 20th, 21st
      let suffix = "th";
      if (dayVal === 1 || dayVal === 21 || dayVal === 31) suffix = "st";
      else if (dayVal === 2 || dayVal === 22) suffix = "nd";
      else if (dayVal === 3 || dayVal === 23) suffix = "rd";
      
      return `${dayName}, ${dayVal}${suffix} ${monthName} '${yearName}`;
    };

    const steps = [
      {
        label: "Order Confirmed",
        date: formatDate(baseDate, 0),
        events: [
          { title: "Your Order has been placed.", time: `${formatDate(baseDate, 0)} - 3:16am` },
          { title: "Seller has processed your order.", time: `${formatDate(baseDate, 0)} - 10:00am` },
          { title: "Your item has been picked up by delivery partner.", time: `${formatDate(baseDate, 1)} - 2:36am` }
        ],
        done: false,
        active: false
      },
      {
        label: "Shipped",
        date: formatDate(baseDate, 1),
        events: [
          { title: `Ekart Logistics - ${trackingId || "FMPC5112339950"}`, time: "" },
          { title: "Your item has been shipped.", time: `${formatDate(baseDate, 1)} - 2:43am` },
          { title: "Your item has been received in the hub nearest to you", time: "" }
        ],
        done: false,
        active: false
      },
      {
        label: "Out For Delivery",
        date: formatDate(baseDate, 4),
        events: [
          { title: "Your item is out for delivery", time: `${formatDate(baseDate, 4)} - 10:29am` }
        ],
        done: false,
        active: false
      },
      {
        label: "Delivered",
        date: formatDate(baseDate, 4),
        events: [
          { title: "Your item has been delivered", time: `${formatDate(baseDate, 4)} - 1:26pm` }
        ],
        done: false,
        active: false
      }
    ];

    const currentStatus = status || "Pending OTP";

    if (currentStatus === "Pending OTP") {
      steps[0].active = true;
    } else if (currentStatus === "Processing" || currentStatus === "Verified") {
      steps[0].done = true;
      steps[1].active = true;
    } else if (currentStatus === "Shipped") {
      steps[0].done = true;
      steps[1].done = true;
      steps[2].active = true;
    } else if (currentStatus === "Delivered") {
      steps[0].done = true;
      steps[1].done = true;
      steps[2].done = true;
      steps[3].done = true;
    }

    return steps;
  };

  const steps = order ? getTrackingSteps(order.status, order.date, order.trackingId) : [];
  const activeIndex = steps.findIndex((s) => s.active);
  const lastDoneIndex = steps.reduce((acc, s, idx) => (s.done ? idx : acc), -1);
  const currentProgressIdx = activeIndex !== -1 ? activeIndex : lastDoneIndex;

  // Calculate percentage for progress bar
  const getProgressPercentage = () => {
    if (order?.status === "Delivered") return 100;
    if (order?.status === "Cancelled") return 0;
    if (currentProgressIdx === -1) return 0;
    return (currentProgressIdx / (steps.length - 1)) * 100;
  };

  return (
    <main className="min-h-screen bg-[#f3f4f6] text-[#17231b] flex flex-col">
      <SiteHeader
        cart={[]}
        onUpdateQuantity={() => {}}
        onRemoveItem={() => {}}
        onOpenAppModal={() => {}}
        onOpenLoginModal={() => {}}
        onOpenConsultationModal={() => {}}
      />

      <div className="flex-1 w-full max-w-[1000px] mx-auto px-4 py-8">
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-[#80a03c] hover:text-[#244f31] mb-6">
          <ArrowLeft className="size-4" />
          <span>Back to Home</span>
        </Link>

        {/* Search Header Bar */}
        <div className="bg-white border border-[#ddddd9] p-5 rounded-2xl shadow-sm mb-6">
          <h1 className="text-xl font-black text-[#17231b] mb-2 uppercase tracking-wide">Track Your Package</h1>
          <p className="text-xs text-[#666666] mb-4">Enter your order identifier to view the real-time package delivery timeline.</p>
          
          <form onSubmit={handleSearchSubmit} className="grid gap-3 sm:grid-cols-3">
            <input
              type="text"
              value={orderIdInput}
              onChange={(e) => setOrderIdInput(e.target.value)}
              placeholder="Order ID (e.g. PYR-1001)"
              className="rounded-xl border border-[#ddddd9] px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-[#244f31] w-full"
              required
            />
            <input
              type="text"
              value={contactInput}
              onChange={(e) => setContactInput(e.target.value)}
              placeholder="Email or Mobile No. (Optional)"
              className="rounded-xl border border-[#ddddd9] px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-[#244f31] w-full"
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-[#244f31] text-white font-bold text-xs py-2.5 px-4 shadow-sm hover:bg-[#1d3b24] transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading && <RefreshCw className="size-3.5 animate-spin" />}
              <span>Track Package</span>
            </button>
          </form>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="bg-white border border-[#ddddd9] p-12 rounded-2xl shadow-sm text-center flex flex-col items-center justify-center gap-3">
            <div className="size-8 animate-spin rounded-full border-3 border-[#244f31] border-t-transparent"></div>
            <p className="text-xs font-bold text-[#666666]">Querying database records...</p>
          </div>
        )}

        {/* Error Alert */}
        {error && !loading && (
          <div className="bg-rose-50 border border-rose-200 text-rose-900 p-5 rounded-2xl shadow-sm flex items-start gap-3">
            <AlertCircle className="size-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold">Could Not Locate Shipment</h4>
              <p className="text-[11px] font-semibold text-rose-700 mt-1">{error}</p>
              <p className="text-[10px] text-rose-600/80 mt-1">Please verify the Order ID spelling. E.g. "PYR-1001" or match it with your registered phone number.</p>
            </div>
          </div>
        )}

        {/* Main Tracking Content Card (When order is resolved) */}
        {order && !loading && (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            {/* Amazon-Style Top Summary Panel */}
            <div className="bg-white border border-[#ddddd9] rounded-2xl shadow-sm overflow-hidden">
              <div className="bg-[#f6f6f6] border-b border-[#ddddd9] px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold text-[#666666]">
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-neutral-400 font-bold mb-0.5">Order Placed</span>
                  <span className="text-[#17231b] font-bold">{order.date || "Pending"}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-neutral-400 font-bold mb-0.5">Total Value</span>
                  <span className="text-[#17231b] font-bold">₹{order.total}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-neutral-400 font-bold mb-0.5">Ship To</span>
                  <span className="text-[#244f31] font-bold">
                    {authorized ? order.customerName || order.name : `${order.customerName || "Customer"} (Masked)`}
                  </span>
                </div>
                <div className="text-right md:text-left">
                  <span className="block text-[10px] uppercase tracking-wider text-neutral-400 font-bold mb-0.5">Order ID</span>
                  <span className="text-[#17231b] font-bold">{order.id}</span>
                </div>
              </div>

              {/* Status Banner */}
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#f0f0eb] mb-6">
                  <div>
                    <h2 className="text-lg font-black text-[#17231b]">
                      {order.status === "Delivered" ? (
                        <span className="text-emerald-600 flex items-center gap-1.5">
                          <CheckCircle2 className="size-5 shrink-0" />
                          <span>Delivered Package</span>
                        </span>
                      ) : order.status === "Cancelled" ? (
                        <span className="text-rose-600 flex items-center gap-1.5">
                          <AlertCircle className="size-5 shrink-0" />
                          <span>Cancelled Order</span>
                        </span>
                      ) : (
                        <span>Arriving soon: In Transit</span>
                      )}
                    </h2>
                    {order.status !== "Cancelled" && (
                      <p className="text-xs text-[#666666] mt-1">
                        Estimated Delivery: <span className="font-bold text-[#244f31]">Within 2-3 Business Days</span>
                      </p>
                    )}
                  </div>
                  
                  {order.status === "Shipped" && (
                    <div className="inline-flex items-center gap-2 self-start rounded-lg bg-[#eef5df] px-3.5 py-2 text-xs font-bold text-[#244f31]">
                      <Truck className="size-4 text-[#80a03c]" />
                      <span>Tracking ID: {order.trackingId || "PRY-TRACK-1048"}</span>
                    </div>
                  )}
                </div>

                {/* Cancelled Banner */}
                {order.status === "Cancelled" ? (
                  <div className="bg-rose-50 border border-rose-200 text-rose-900 rounded-xl p-4 text-xs font-semibold">
                    This order was cancelled. No shipment is scheduled. If you believe this is an error or need a refund, please contact support.
                  </div>
                ) : (
                  /* Vertical Timeline matching the uploaded reference image */
                  <div className="py-4 pl-4 sm:pl-8 max-w-xl">
                    <div className="relative border-l-2 border-emerald-500 pl-6 sm:pl-8 space-y-8">
                      {steps.map((step) => {
                        const isDone = step.done;
                        const isActive = step.active;
                        const isFuture = !isDone && !isActive;

                        return (
                          <div key={step.label} className="relative select-none">
                            {/* Circle Dot on the timeline */}
                            <span 
                              className={`absolute -left-[31px] sm:-left-[39px] top-1 size-3.5 sm:size-4 rounded-full border-2 transition-all duration-300 ${
                                isFuture
                                  ? "bg-white border-neutral-300"
                                  : "bg-emerald-500 border-emerald-500"
                              }`} 
                            />

                            {/* Header Label and Date */}
                            <div className="flex items-baseline gap-2">
                              <h3 className={`text-sm font-extrabold sm:text-base ${isFuture ? "text-neutral-400" : "text-[#17231b]"}`}>
                                {step.label}
                              </h3>
                              {step.date && (
                                <span className={`text-[10px] sm:text-xs font-semibold ${isFuture ? "text-neutral-300" : "text-neutral-500"}`}>
                                  {step.date}
                                </span>
                              )}
                            </div>

                            {/* Detailed Events Bubble */}
                            {!isFuture && step.events && step.events.length > 0 && (
                              <div className="mt-3.5 space-y-4">
                                {step.events.map((evt, idx) => (
                                  <div key={idx} className="text-xs sm:text-sm">
                                    <p className="font-semibold text-neutral-800 leading-snug">
                                      {evt.title}
                                    </p>
                                    {evt.time && (
                                      <p className="text-[10px] sm:text-xs font-medium text-neutral-400 mt-1">
                                        {evt.time}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Address & Payment Grid */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Delivery Details */}
              <div className="bg-white border border-[#ddddd9] p-6 rounded-2xl shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#244f31] mb-3 flex items-center gap-1.5">
                    <MapPin className="size-4 shrink-0" />
                    <span>Shipping Address</span>
                  </h3>
                  
                  {authorized ? (
                    <div className="text-xs font-semibold leading-relaxed text-[#17231b]">
                      <p className="font-extrabold text-sm">{order.customerName || order.name}</p>
                      {order.shippingAddress ? (
                        <>
                          <p>{order.shippingAddress.street}</p>
                          <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                        </>
                      ) : (
                        <p>{order.address}</p>
                      )}
                      <p className="mt-2 text-neutral-500">Contact: {order.phone}</p>
                    </div>
                  ) : (
                    <div className="text-xs font-semibold leading-relaxed text-[#666666] space-y-3">
                      <div className="bg-neutral-50 border p-3.5 rounded-xl text-[10px] text-neutral-500 font-medium">
                        <p className="font-bold text-[#17231b] mb-1">🔐 Privacy Shield Active</p>
                        Some delivery address fields are masked for security. To see full shipping credentials, verify the contact details:
                      </div>
                      
                      <div className="border border-neutral-100 p-3 rounded-xl bg-white shadow-xs">
                        <p className="font-bold text-[#17231b] text-[11px]">{order.customerName}</p>
                        {order.shippingAddress ? (
                          <p>{order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.pincode}</p>
                        ) : (
                          <p>{order.address}</p>
                        )}
                        <p className="mt-1 font-semibold">Phone: {order.phone}</p>
                      </div>

                      <form onSubmit={handleUnmaskSubmit} className="space-y-2 border-t border-neutral-100 pt-3">
                        <label className="block text-[10px] font-bold text-[#17231b]">Confirm Email or Mobile Number:</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={authFormContact}
                            onChange={(e) => setAuthFormContact(e.target.value)}
                            placeholder="e.g. email@domain.com or 9876543210"
                            className="flex-1 rounded-lg border border-[#ddddd9] px-2.5 py-1.5 text-xs outline-none focus:border-[#244f31]"
                            required
                          />
                          <button
                            type="submit"
                            disabled={authLoading}
                            className="rounded-lg bg-[#244f31] text-white font-bold text-[10px] py-1.5 px-3 hover:bg-[#1d3b24] disabled:opacity-50 transition"
                          >
                            Verify
                          </button>
                        </div>
                        {authError && <p className="text-[10px] text-rose-600 font-bold">{authError}</p>}
                      </form>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Summary */}
              <div className="bg-white border border-[#ddddd9] p-6 rounded-2xl shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#244f31] mb-3 flex items-center gap-1.5">
                    <CreditCard className="size-4 shrink-0" />
                    <span>Payment Method</span>
                  </h3>
                  <div className="text-xs font-semibold leading-relaxed text-[#17231b]">
                    <p className="font-extrabold capitalize text-sm">{order.paymentMethod || "prepaid"} payment</p>
                    <p className="text-[#666666] mt-1">Transaction ref: <span className="font-bold text-neutral-800">TXN-{order.id}</span></p>
                  </div>
                </div>

                <div className="mt-6 border-t border-[#f0f0eb] pt-4 space-y-1.5 text-xs font-semibold text-[#666666]">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-[#17231b]">₹{order.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping Charges</span>
                    <span className="text-[#244f31] font-bold">FREE</span>
                  </div>
                  <div className="flex justify-between border-t border-[#f0f0eb] pt-2 font-bold text-sm text-[#17231b]">
                    <span>Total Paid</span>
                    <span className="text-[#244f31]">₹{order.total}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Package Items */}
            <div className="bg-white border border-[#ddddd9] p-6 rounded-2xl shadow-sm">
              {(() => {
                const parsedItemsList = (() => {
                  const itemsStr = order.items;
                  if (!itemsStr) return [];
                  if (Array.isArray(itemsStr)) return itemsStr;
                  if (typeof itemsStr !== "string") return [];
                  
                  const parts = itemsStr.split(", ");
                  return parts.map((part) => {
                    const lastXIndex = part.lastIndexOf(" x");
                    if (lastXIndex === -1) {
                      return { name: part.trim(), quantity: 1 };
                    }
                    const name = part.slice(0, lastXIndex).trim();
                    const qtyStr = part.slice(lastXIndex + 2).trim();
                    const quantity = parseInt(qtyStr, 10) || 1;
                    return { name, quantity };
                  });
                })();

                return (
                  <>
                    <h3 className="text-xs font-black uppercase tracking-wider text-[#244f31] mb-4 flex items-center gap-1.5">
                      <Package className="size-4 shrink-0" />
                      <span>Package Items ({parsedItemsList.length || 1})</span>
                    </h3>

                    <div className="divide-y divide-[#f0f0eb]">
                      {parsedItemsList.length > 0 ? (
                        parsedItemsList.map((item: any, idx: number) => {
                          const matchedProduct = products.find(
                            (p) => p.name.toLowerCase().trim() === item.name.toLowerCase().trim()
                          );

                          return (
                            <div key={idx} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                              <div className="relative size-16 shrink-0 bg-neutral-100 rounded-lg overflow-hidden border">
                                <Image
                                  src={matchedProduct?.image || "/product-placeholder.png"}
                                  alt={item.name || "Herbal Product"}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="flex-1 text-xs">
                                <h4 className="font-extrabold text-[#17231b] text-sm leading-snug hover:text-[#80a03c] transition">
                                  {matchedProduct ? (
                                    <Link href={`/products/${matchedProduct.slug}`}>
                                      {item.name}
                                    </Link>
                                  ) : (
                                    <span>{item.name}</span>
                                  )}
                                </h4>
                                <p className="text-neutral-500 font-semibold mt-1">Quantity: {item.quantity}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="font-extrabold text-[#244f31]">
                                    ₹{matchedProduct ? matchedProduct.price * item.quantity : order.total}
                                  </span>
                                  {matchedProduct?.compareAt && (
                                    <span className="text-[10px] text-neutral-400 line-through">
                                      ₹{matchedProduct.compareAt * item.quantity}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="flex gap-4 py-4 first:pt-0 last:pb-0">
                          <div className="size-16 bg-neutral-100 rounded-lg flex items-center justify-center border text-neutral-400 shrink-0">
                            🌿
                          </div>
                          <div className="flex-1 text-xs">
                            <h4 className="font-extrabold text-[#17231b] text-sm leading-snug">Herbal Custom Remedy Formulations</h4>
                            <p className="text-neutral-500 font-semibold mt-1">Quantity: 1</p>
                            <p className="font-extrabold text-[#244f31] mt-1">₹{order.total}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Help / support drawer triggers */}
            <div className="bg-[#eef5df] border border-[#80a03c]/20 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="text-xs font-semibold text-[#244f31]">
                <h4 className="font-extrabold text-sm mb-0.5 flex items-center gap-1.5">
                  <HelpCircle className="size-4 shrink-0" />
                  <span>Need assistance with this order?</span>
                </h4>
                <p className="text-neutral-600 mt-1">Our automated support dashboard and medical assistants are online 24/7 to resolve delivery questions.</p>
              </div>
              <div className="flex flex-wrap gap-2.5">
                <a
                  href={`https://api.whatsapp.com/send?phone=${cleanNumber || "919876543210"}&text=${encodeURIComponent(`I need help tracking my order: ${order.id}.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl bg-[#244f31] hover:bg-[#1d3b24] text-white font-bold text-xs py-2 px-4 shadow-xs transition flex items-center gap-1.5"
                >
                  <span>Chat on WhatsApp</span>
                  <ExternalLink className="size-3.5" />
                </a>
                <Link
                  href="/contact-us"
                  className="rounded-xl border border-[#244f31]/30 hover:bg-[#244f31]/5 text-[#244f31] font-bold text-xs py-2 px-4 transition"
                >
                  Contact Desk
                </Link>
              </div>
            </div>

          </div>
        )}
      </div>

      <SiteFooter />
    </main>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#f8faf1]">
        <div className="size-10 animate-spin rounded-full border-4 border-[#244f31] border-t-transparent"></div>
      </div>
    }>
      <TrackOrderContent />
    </Suspense>
  );
}
