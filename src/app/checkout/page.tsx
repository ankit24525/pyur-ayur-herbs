"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Truck,
  HelpCircle,
  X,
  CreditCard,
  Building,
} from "lucide-react";
import { products, Product } from "@/lib/store";
import { trackMetaEvent } from "@/components/MetaPixel";

function CheckoutForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const prodId = searchParams.get("productId") || "1";
  const qty = parseInt(searchParams.get("quantity") || "1", 10);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          const currentUrl = window.location.pathname + window.location.search;
          router.push(`/login?redirect=${encodeURIComponent(currentUrl)}`);
        }
      })
      .catch(() => {
        const currentUrl = window.location.pathname + window.location.search;
        router.push(`/login?redirect=${encodeURIComponent(currentUrl)}`);
      });
  }, [router]);

  const [catalog, setCatalog] = useState<Product[]>(products);
  const [product, setProduct] = useState<Product>(products[0]);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const subtotal = product.price * qty;

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    pincode: "",
    city: "",
    state: "",
    paymentMethod: "prepaid", // prepaid or cod
  });

  useEffect(() => {
    fetch("/api/admin/products")
      .then((res) => res.json())
      .then((data) => {
        if (data.products && data.products.length > 0) {
          setCatalog(data.products);
          const found = data.products.find((p: any) => p.id === prodId);
          if (found) setProduct(found);
        }
      })
      .catch((e) => console.error("Error loading products:", e))
      .finally(() => setLoadingProduct(false));
  }, [prodId]);

  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [orderComplete, setOrderComplete] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");

  // Load logged-in user info for auto-fill
  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          if (data.user.email) setUserEmail(data.user.email);
          if (data.user.name || data.user.phone) {
            setFormData((prev) => ({
              ...prev,
              name: data.user.name || prev.name,
              phone: data.user.phone || prev.phone,
            }));
          }
        }
      })
      .catch(() => {});
  }, []);

  // Settings & Coupons state
  const [settings, setSettings] = useState<any>({
    prepaidDiscount: 5,
    codOtpEnabled: true,
    shipping: { freeThreshold: 999, baseRate: 49 }
  });
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) setSettings(data.settings);
      })
      .catch((e) => console.error("Error loading settings:", e));
  }, []);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError("");
    try {
      const res = await fetch("/api/admin/coupons");
      const data = await res.json();
      const match = data.coupons?.find(
        (c: any) => c.code === couponCode.toUpperCase() && c.status === "Active"
      );
      if (!match) {
        setCouponError("Invalid or expired coupon code.");
        return;
      }

      // 1. Minimum Cart Value check
      if (match.minCartValue && subtotal < parseFloat(match.minCartValue)) {
        setCouponError(`This coupon requires a minimum purchase of ₹${match.minCartValue}.`);
        return;
      }

      // 2. Applicability checks (Category or Product)
      if (match.applicableType === "Category") {
        if (match.applicableValue && product.concern !== match.applicableValue) {
          setCouponError(`This coupon is only applicable to products under the "${match.applicableValue}" category.`);
          return;
        }
      } else if (match.applicableType === "Product") {
        if (match.applicableValue && String(product.id) !== String(match.applicableValue)) {
          setCouponError(`This coupon is only applicable to a specific product.`);
          return;
        }
      }

      setAppliedCoupon(match);
    } catch {
      setCouponError("Error checking coupon code.");
    }
  };

  useEffect(() => {
    if (appliedCoupon) {
      if (appliedCoupon.minCartValue && subtotal < parseFloat(appliedCoupon.minCartValue)) {
        setAppliedCoupon(null);
        setCouponError(`Coupon removed: Requires a minimum purchase of ₹${appliedCoupon.minCartValue}.`);
      } else if (appliedCoupon.applicableType === "Category" && appliedCoupon.applicableValue && product.concern !== appliedCoupon.applicableValue) {
        setAppliedCoupon(null);
        setCouponError(`Coupon removed: Only applicable to "${appliedCoupon.applicableValue}" category.`);
      } else if (appliedCoupon.applicableType === "Product" && appliedCoupon.applicableValue && String(product.id) !== String(appliedCoupon.applicableValue)) {
        setAppliedCoupon(null);
        setCouponError("Coupon removed: Only applicable to a specific product.");
      }
    }
  }, [subtotal, product, appliedCoupon]);

  useEffect(() => {
    if (loadingProduct) return;
    // Fire Meta ads tracking InitiateCheckout event
    trackMetaEvent("InitiateCheckout", {
      content_ids: [product.id],
      content_type: "product",
      value: product.price * qty,
      currency: "INR",
    });
  }, [product, qty, loadingProduct]);

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

            setFormData((prev) => ({
              ...prev,
              address: [street, addr.subdistrict].filter(Boolean).join(", ") || prev.address,
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
    if (formData.pincode.length === 6) {
      fetch(`https://api.postalpincode.in/pincode/${formData.pincode}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data[0] && data[0].Status === "Success" && data[0].PostOffice?.length > 0) {
            const postOffice = data[0].PostOffice[0];
            setFormData((prev) => ({
              ...prev,
              city: postOffice.District || postOffice.Block || prev.city,
              state: postOffice.State || prev.state,
            }));
          }
        })
        .catch((e) => console.error("Error fetching pincode details:", e));
    }
  }, [formData.pincode]);


  const prepaidDiscount =
    formData.paymentMethod === "prepaid" ? Math.round(subtotal * (settings.prepaidDiscount / 100)) : 0;

  let couponDiscount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === "Percentage") {
      couponDiscount = Math.round(subtotal * (parseFloat(appliedCoupon.value) / 100));
    } else {
      couponDiscount = parseFloat(appliedCoupon.value);
    }
  }

  const freeThreshold = settings.shipping?.freeThreshold ?? 999;
  const baseRate = settings.shipping?.baseRate ?? 49;
  const shipping = subtotal >= freeThreshold ? 0 : baseRate;
  const total = subtotal - prepaidDiscount - couponDiscount + shipping;

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.pincode.length !== 6) {
      alert("Please enter a valid 6-digit Pincode.");
      return;
    }

    if (formData.paymentMethod === "cod" && settings.codOtpEnabled) {
      if (!userEmail) {
        alert("No email address found. Please log in again to place your order.");
        return;
      }
      // Send OTP to user's registered email
      setOtpSending(true);
      try {
        const res = await fetch("/api/checkout/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: userEmail }),
        });
        const data = await res.json();
        if (data.success) {
          setOtpError("");
          setOtpInput("");
          setOtpModalOpen(true);
        } else {
          alert(data.error || "Failed to send verification code. Please try again.");
        }
      } catch {
        alert("Failed to send verification code. Check your connection and try again.");
      } finally {
        setOtpSending(false);
      }
    } else {
      void processOrder();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError("");

    if (otpInput.length !== 4) {
      setOtpError("Please enter the 4-digit code sent to your email.");
      return;
    }

    setOtpVerifying(true);
    try {
      const response = await fetch("/api/checkout/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, otp: otpInput }),
      });
      const resData = await response.json();
      if (resData.success && resData.verified) {
        setOtpModalOpen(false);
        setOtpInput("");
        setOtpError("");
        void processOrder();
      } else {
        setOtpError(resData.error || "Incorrect verification code. Please try again.");
      }
    } catch {
      setOtpError("Connection error. Please try again.");
    } finally {
      setOtpVerifying(false);
    }
  };

  const processOrder = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          email: userEmail,
          subtotal,
          items: [{ productId: product.id, quantity: qty }],
        }),
      });
      const resData = await response.json();
      if (resData.success) {
        setOrderComplete(resData);
        // Fire client-side Meta ads Purchase event
        trackMetaEvent("Purchase", {
          content_ids: [product.id],
          content_type: "product",
          value: total,
          currency: "INR",
          order_id: resData.orderId,
        });
      } else {
        alert(resData.error || "Order processing failed.");
      }
    } catch {
      alert("Error processing order.");
    } finally {
      setLoading(false);
    }
  };

  if (loadingProduct) {
    return (
      <div className="text-center py-10 font-bold text-[#244f31]">
        🔄 Retrieving product details for checkout...
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center p-6 bg-white rounded-2xl border border-[#ddddd9]">
        <CheckCircle2 className="size-16 text-[#80a03c]" />
        <h2 className="mt-4 text-2xl font-black text-[#17231b]">Order Confirmed Successfully!</h2>
        <p className="mt-2 text-sm text-[#244f31] font-bold">
          Order ID: {orderComplete.orderId}
        </p>
        <p className="mt-1 text-xs text-[#666666] max-w-md">
          Thank you for choosing Pyur Ayur Herbs. We have received your order details and started preparing your package. A tracking link will be sent to <b>{formData.phone}</b> shortly.
        </p>
        <div className="mt-6 flex flex-col gap-3 min-w-[200px]">
          <Link
            href="/"
            className="rounded-xl bg-[#244f31] py-3 text-xs font-bold text-white transition hover:bg-[#1d3b24]"
          >
            CONTINUE SHOPPING
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      {/* Left Form Panel */}
      <form onSubmit={handleCheckoutSubmit} className="space-y-6 lg:col-span-7">
        {/* Address Card */}
        <div className="rounded-2xl border border-[#ddddd9] bg-white p-6 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#17231b] flex items-center gap-2">
            <Building className="size-4 text-[#80a03c]" />
            <span>Delivery Shipping Address</span>
          </h3>

          <div className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#17231b]">Recipient Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="First & Last Name"
                className="mt-1 w-full rounded-lg border border-[#ddddd9] px-3 py-2 text-xs outline-none focus:border-[#244f31]"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-[#17231b]">Mobile Number</label>
                <input
                  type="tel"
                  required
                  pattern="[0-9]{10}"
                  maxLength={10}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, "") })}
                  placeholder="10-digit phone number"
                  className="mt-1 w-full rounded-lg border border-[#ddddd9] px-3 py-2 text-xs outline-none focus:border-[#244f31]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17231b]">Pincode (6-digit)</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, "") })}
                  placeholder="6-digit Area PIN"
                  className="mt-1 w-full rounded-lg border border-[#ddddd9] px-3 py-2 text-xs outline-none focus:border-[#244f31]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-[#17231b]">Complete House Address & Street</label>
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
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="House No, Building, Street, Area name"
                className="mt-1 w-full rounded-lg border border-[#ddddd9] px-3 py-2 text-xs outline-none focus:border-[#244f31]"
              />
              {locationError && (
                <p className="mt-1 text-[10px] text-red-500 font-bold flex items-center gap-1 animate-pulse">
                  <span>⚠️</span>
                  <span>{locationError}</span>
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-[#17231b]">City</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="City"
                  className="mt-1 w-full rounded-lg border border-[#ddddd9] px-3 py-2 text-xs outline-none focus:border-[#244f31]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17231b]">State</label>
                <input
                  type="text"
                  required
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="State"
                  className="mt-1 w-full rounded-lg border border-[#ddddd9] px-3 py-2 text-xs outline-none focus:border-[#244f31]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods Card */}
        <div className="rounded-2xl border border-[#ddddd9] bg-white p-6 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#17231b] flex items-center gap-2">
            <CreditCard className="size-4 text-[#80a03c]" />
            <span>Select Payment Option</span>
          </h3>

          {/* Prepaid Promotion Banner */}
          <div className="mt-4 rounded-xl bg-[#eef5df] border border-[#80a03c] p-3 text-xs font-bold text-[#244f31] flex items-center gap-2">
            <CheckCircle2 className="size-4 text-[#80a03c]" />
            <span>🎉 Pay Online & get 5% EXTRA Discount (Save ₹{Math.round(subtotal * 0.05)})</span>
          </div>

          <div className="mt-5 space-y-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, paymentMethod: "prepaid" })}
              className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition ${
                formData.paymentMethod === "prepaid"
                  ? "border-[#244f31] bg-[#eef5df] ring-1 ring-[#244f31]"
                  : "border-[#ddddd9] bg-white hover:border-[#80a03c]"
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  readOnly
                  checked={formData.paymentMethod === "prepaid"}
                  className="accent-[#244f31]"
                />
                <div>
                  <span className="block text-xs font-bold text-[#17231b]">UPI, Cards, Net Banking</span>
                  <span className="text-[10px] font-semibold text-[#80a03c]">Get {settings.prepaidDiscount}% Instant Discount</span>
                </div>
              </div>
              <span className="text-xs font-extrabold text-[#244f31]">Prepaid</span>
            </button>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, paymentMethod: "cod" })}
              className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition ${
                formData.paymentMethod === "cod"
                  ? "border-[#244f31] bg-[#eef5df] ring-1 ring-[#244f31]"
                  : "border-[#ddddd9] bg-white hover:border-[#80a03c]"
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  readOnly
                  checked={formData.paymentMethod === "cod"}
                  className="accent-[#244f31]"
                />
                <div>
                  <span className="block text-xs font-bold text-[#17231b]">Cash on Delivery (COD)</span>
                  <span className="text-[10px] text-[#666666]">Verify mobile number via SMS OTP</span>
                </div>
              </div>
              <span className="text-xs font-semibold text-[#666666]">COD</span>
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-[#244f31] py-4 text-xs font-black tracking-widest text-white shadow-lg transition hover:bg-[#1d3b24]"
        >
          {loading ? "PROCESSING..." : "CONFIRM & PLACE ORDER"}
        </button>
      </form>

      {/* Right Product Summary Panel */}
      <div className="space-y-6 lg:col-span-5">
        <div className="rounded-2xl border border-[#ddddd9] bg-white p-6 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#17231b]">Order Summary</h3>

          <div className="mt-4 flex gap-3 border-b border-[#ddddd9] pb-4">
            <Image
              src={product.image}
              alt={product.name}
              width={64}
              height={64}
              unoptimized
              className="size-16 rounded object-cover"
            />
            <div className="flex-1">
              <h4 className="line-clamp-2 text-xs font-bold text-[#17231b]">{product.name}</h4>
              <p className="mt-1 text-xs text-[#666666]">Qty: {qty}</p>
            </div>
            <span className="text-xs font-black text-[#244f31]">₹{product.price * qty}</span>
          </div>

          {/* Coupon Code Input */}
          <form onSubmit={handleApplyCoupon} className="mt-4 flex gap-2 border-b border-[#ddddd9] pb-4">
            <input
              type="text"
              placeholder="Enter Coupon Code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="flex-1 rounded-lg border border-[#ddddd9] px-3 py-1.5 text-xs outline-none uppercase font-bold"
            />
            <button
              type="submit"
              className="rounded-lg bg-[#244f31] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#1d3b24]"
            >
              APPLY
            </button>
          </form>
          {couponError && <p className="mt-1 text-[10px] text-red-500 font-bold">{couponError}</p>}
          {appliedCoupon && (
            <p className="mt-1 text-[10px] text-emerald-600 font-bold">
              🎉 Coupon {appliedCoupon.code} applied!
            </p>
          )}

          <div className="mt-4 space-y-2.5 border-b border-[#ddddd9] pb-4 text-xs text-[#666666]">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-bold text-[#17231b]">₹{subtotal}</span>
            </div>
            {prepaidDiscount > 0 && (
              <div className="flex justify-between text-[#80a03c]">
                <span>{settings.prepaidDiscount}% Prepaid Discount</span>
                <span>-₹{prepaidDiscount}</span>
              </div>
            )}
            {couponDiscount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Coupon ({appliedCoupon.code}) Discount</span>
                <span>-₹{couponDiscount}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Shipping Fee</span>
              <span className="font-bold text-[#17231b]">
                {shipping === 0 ? "FREE" : `₹${shipping}`}
              </span>
            </div>
          </div>

          <div className="mt-4 flex justify-between text-sm font-bold text-[#17231b]">
            <span>Total Payable</span>
            <span className="text-lg font-black text-[#244f31]">₹{total}</span>
          </div>
        </div>

        {/* Security & Guarantees info card */}
        <div className="rounded-2xl border border-[#ddddd9] bg-[#f8faf1] p-5 space-y-4">
          <div className="flex gap-3">
            <Lock className="size-5 text-[#80a03c] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-[#17231b]">100% Encrypted Transactions</h4>
              <p className="mt-0.5 text-[10px] text-[#666666] leading-relaxed">
                All order processing and card detail transactions use state-of-the-art secure payment architecture.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Truck className="size-5 text-[#80a03c] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-[#17231b]">Fast Insured Shipment</h4>
              <p className="mt-0.5 text-[10px] text-[#666666] leading-relaxed">
                Orders are packed with medical safety measures and dispatched through priority delivery partners.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Gokwik/Otpless-style SMS OTP Dialog Modal */}
      {otpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setOtpModalOpen(false)} />
          <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <button
              onClick={() => setOtpModalOpen(false)}
              className="absolute right-4 top-4 rounded-full p-1 text-[#666666] hover:bg-[#f8faf1]"
            >
              <X className="size-5" />
            </button>
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-[#80a03c]" />
              <h3 className="text-base font-bold text-[#17231b]">COD Verification Code</h3>
            </div>
            <p className="mt-1 text-xs text-[#666666]">
              We have sent a 4-digit verification code to your email <b>{userEmail}</b>. Enter it below to complete your order.
            </p>
            {otpError && <p className="mt-2 text-xs text-red-500 font-bold text-center">{otpError}</p>}
            <form onSubmit={handleVerifyOtp} className="mt-4 space-y-4">
              <input
                type="text"
                maxLength={4}
                required
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ""))}
                placeholder="Enter 4-digit OTP"
                className="w-full text-center tracking-widest text-lg font-bold rounded-lg border border-[#ddddd9] px-3 py-2 outline-none focus:border-[#244f31]"
              />
              <button
                type="submit"
                disabled={otpVerifying}
                className="w-full rounded-xl bg-[#244f31] py-3 text-xs font-black tracking-widest text-white shadow hover:bg-[#1d3b24]"
              >
                {otpVerifying ? "VERIFYING..." : "VERIFY & CONFIRM COD"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <main className="min-h-screen bg-[#f8faf1] text-[#17231b]">
      <div className="bg-[#1d3b24] text-white py-4 border-b border-[#ddddd9]">
        <div className="mx-auto max-w-[1440px] px-4 md:px-6 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-white hover:text-[#80a03c]">
            <ArrowLeft className="size-4" />
            <span>Back to Store</span>
          </Link>
          <span className="text-sm font-black tracking-widest uppercase">PYUR AYUR HERBS</span>
          <span className="text-xs font-medium text-white/75 hidden sm:inline">🛡️ Safe Checkout Portal</span>
        </div>
      </div>

      <div className="mx-auto max-w-[1200px] px-4 py-8 md:py-12">
        <Suspense fallback={<div className="text-center py-10 font-bold">Loading Checkout details...</div>}>
          <CheckoutForm />
        </Suspense>
      </div>
    </main>
  );
}
