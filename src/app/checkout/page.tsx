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
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("pyur_user");
      if (!stored) {
        const currentUrl = window.location.pathname + window.location.search;
        router.push(`/login?redirect=${encodeURIComponent(currentUrl)}`);
      }
    }
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
  const [orderComplete, setOrderComplete] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Settings & Coupons state
  const [settings, setSettings] = useState({
    prepaidDiscount: 5,
    codOtpEnabled: true,
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

  // Auto fill city/state based on pincode mock
  useEffect(() => {
    if (formData.pincode.length === 6) {
      if (formData.pincode.startsWith("11")) {
        setFormData((prev) => ({ ...prev, city: "New Delhi", state: "Delhi" }));
      } else if (formData.pincode.startsWith("40")) {
        setFormData((prev) => ({ ...prev, city: "Mumbai", state: "Maharashtra" }));
      } else if (formData.pincode.startsWith("56")) {
        setFormData((prev) => ({ ...prev, city: "Bangalore", state: "Karnataka" }));
      } else if (formData.pincode.startsWith("60")) {
        setFormData((prev) => ({ ...prev, city: "Chennai", state: "Tamil Nadu" }));
      } else {
        setFormData((prev) => ({ ...prev, city: "Noida", state: "Uttar Pradesh" }));
      }
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

  const shipping = subtotal >= 999 ? 0 : 49;
  const total = subtotal - prepaidDiscount - couponDiscount + shipping;

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.pincode.length !== 6) {
      alert("Please enter a valid 6-digit Pincode.");
      return;
    }

    if (formData.paymentMethod === "cod" && settings.codOtpEnabled) {
      setOtpModalOpen(true);
    } else {
      void processOrder();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpInput.length !== 4) {
      alert("Please enter a valid 4-digit verification code.");
      return;
    }

    setOtpVerifying(true);
    try {
      const response = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: formData.phone, otp: otpInput }),
      });
      const resData = await response.json();
      if (resData.success && resData.verified) {
        setOtpModalOpen(false);
        setOtpInput("");
        void processOrder();
      } else {
        alert(resData.error || "OTP Verification failed.");
      }
    } catch {
      alert("Error verifying OTP.");
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
              <label className="block text-xs font-bold text-[#17231b]">Complete House Address & Street</label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="House No, Building, Street, Area name"
                className="mt-1 w-full rounded-lg border border-[#ddddd9] px-3 py-2 text-xs outline-none focus:border-[#244f31]"
              />
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
              We have sent a 4-digit verification code to <b>{formData.phone}</b>. Enter it below to complete your order.
            </p>
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
