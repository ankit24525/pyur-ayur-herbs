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
  MessageSquare,
  Eye,
  EyeOff,
  AlertCircle,
  User,
  Coins,
  MapPin,
  Check,
  Sparkles,
  Loader2,
  LogIn,
  LogOut,
  UserPlus,
} from "lucide-react";
import { products, Product } from "@/lib/store";
import { getStorefrontData } from "@/lib/storefront-client";
import { trackMetaEvent } from "@/components/MetaPixel";

function CheckoutForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const prodId = searchParams.get("productId") || "1";
  const qty = parseInt(searchParams.get("quantity") || "1", 10);
  const variantIdParam = searchParams.get("variantId");
  const priceParam = searchParams.get("price");
  const variantNameParam = searchParams.get("variantName");
  const variantImageParam = searchParams.get("variantImage");

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userCoins, setUserCoins] = useState<number>(0);
  const [redeemCoins, setRedeemCoins] = useState(false);

  // In-Checkout Sign-In / Sign-Up Modal State
  const [inCheckoutLoginOpen, setInCheckoutLoginOpen] = useState(false);
  const [inCheckoutLoginMode, setInCheckoutLoginMode] = useState<"whatsapp" | "email">("whatsapp");
  const [isCheckoutSignup, setIsCheckoutSignup] = useState(false);
  const [signupName, setSignupName] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupShowPassword, setSignupShowPassword] = useState(false);
  const [loginPhone, setLoginPhone] = useState("");
  const [loginPhoneName, setLoginPhoneName] = useState("");
  const [loginOtp, setLoginOtp] = useState("");
  const [loginOtpSent, setLoginOtpSent] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginSuccessMsg, setLoginSuccessMsg] = useState("");

  // Guest Phone Verification State
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [guestOtpDrawerOpen, setGuestOtpDrawerOpen] = useState(false);
  const [guestOtpInput, setGuestOtpInput] = useState("");
  const [guestOtpLoading, setGuestOtpLoading] = useState(false);
  const [guestOtpError, setGuestOtpError] = useState("");

  // Check authentication status without forced redirection
  const checkAuthStatus = async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include", cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          setCurrentUser(data.user);
          if (data.user.email) setUserEmail(data.user.email);
          setFormData((prev) => ({
            ...prev,
            name: data.user.name || prev.name,
            phone: data.user.phone || prev.phone,
          }));
          if (data.user.phone) {
            setIsPhoneVerified(true);
          }

          // Auto-fill default address if form address is empty
          if (Array.isArray(data.user.savedAddresses) && data.user.savedAddresses.length > 0) {
            const defAddr = data.user.savedAddresses.find((a: any) => a.isDefault) || data.user.savedAddresses[0];
            if (defAddr) {
              setFormData((prev) => ({
                ...prev,
                name: defAddr.name || prev.name,
                phone: defAddr.phone || prev.phone,
                address: prev.address || defAddr.street,
                landmark: prev.landmark || defAddr.landmark || "",
                city: prev.city || defAddr.city,
                state: prev.state || defAddr.state,
                pincode: prev.pincode || defAddr.pincode,
              }));
            }
          }

          // Fetch user coins
          const cleanPhone = (data.user.phone || "").replace(/\D/g, "").slice(-10);
          fetch(`/api/profile/orders?phone=${cleanPhone}&email=${encodeURIComponent(data.user.email || "")}`)
            .then((r) => r.json())
            .then((d) => {
              if (d.success && typeof d.coinsBalance === "number") {
                setUserCoins(d.coinsBalance);
              }
            })
            .catch(() => {});
        } else {
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
    } catch {
      setCurrentUser(null);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const successParam = searchParams.get("success");
  const orderIdParam = searchParams.get("orderId");
  const errorParam = searchParams.get("error");

  useEffect(() => {
    if (successParam === "true" && orderIdParam) {
      setOrderComplete({ success: true, orderId: orderIdParam });
    } else if (errorParam) {
      alert(decodeURIComponent(errorParam));
    }
  }, [successParam, orderIdParam, errorParam]);

  const fallbackProd: Product = {
    id: prodId || "1",
    name: "Ayurvedic Formulation",
    slug: "ayurvedic-formulation",
    concern: "Ayurveda",
    price: 999,
    compareAt: 1199,
    rating: 5.0,
    reviews: 1,
    badge: "100% PURE",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=500&q=80",
    ingredients: ["Natural Herbs"],
    description: "Ayurvedic wellness remedy.",
    coinsEarned: 50,
    deliveryDays: "3 - 5 Days",
    inStock: true,
  };

  const [catalog, setCatalog] = useState<Product[]>([]);
  const [product, setProduct] = useState<Product>(fallbackProd);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const subtotal = (product?.price || 0) * qty;

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    altPhone: "",
    companyName: "",
    address: "",
    landmark: "",
    pincode: "",
    city: "",
    state: "",
    country: "India",
    paymentMethod: "prepaid", // prepaid or cod
  });

  const [maskPhone, setMaskPhone] = useState(false);
  const [codBlocked, setCodBlocked] = useState(false);
  const [codBlockReason, setCodBlockReason] = useState("");

  // Check COD eligibility based on customer cancellation history & admin fraud policy
  useEffect(() => {
    const cleanPhone = (formData.phone || "").replace(/\D/g, "").slice(-10);
    if (cleanPhone.length === 10) {
      fetch(`/api/checkout/eligibility?phone=${cleanPhone}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.success && data.isCodBlocked) {
            setCodBlocked(true);
            setCodBlockReason(
              data.codBlockReason ||
                "Cash on Delivery is unavailable for this mobile number due to previous order cancellations."
            );
            setFormData((prev) => ({ ...prev, paymentMethod: "prepaid" }));
          } else {
            setCodBlocked(false);
            setCodBlockReason("");
          }
        })
        .catch((e) => console.error("Error checking COD eligibility:", e));
    } else {
      setCodBlocked(false);
      setCodBlockReason("");
    }
  }, [formData.phone]);

  useEffect(() => {
    getStorefrontData()
      .then((data) => {
        if (data && data.products && data.products.length > 0) {
          setCatalog(data.products);
          const found = data.products.find((p: any) => p.id === prodId || p.slug === prodId);
          if (found) {
            if (variantIdParam && Array.isArray(found.variants)) {
              const matchedVar = found.variants.find((v: any) => v.id === variantIdParam);
              if (matchedVar) {
                const varPrice = Number(matchedVar.price) || (priceParam ? parseFloat(priceParam) : found.price);
                const varMrp = Number(matchedVar.mrp || matchedVar.compareAt) || Math.round(varPrice * 1.25);
                const varName = matchedVar.name || matchedVar.value || variantNameParam || "";
                setProduct({
                  ...found,
                  price: varPrice,
                  compareAt: varMrp,
                  image: matchedVar.image || variantImageParam || found.image,
                  name: varName && !found.name.includes(varName) ? `${found.name} (${varName})` : found.name,
                });
                return;
              }
            } else if (priceParam) {
              const parsedP = parseFloat(priceParam);
              if (!isNaN(parsedP) && parsedP > 0) {
                setProduct({
                  ...found,
                  price: parsedP,
                  image: variantImageParam || found.image,
                  name: variantNameParam && !found.name.includes(variantNameParam) ? `${found.name} (${variantNameParam})` : found.name,
                });
                return;
              }
            }
            setProduct(found);
          }
        }
      })
      .catch((e) => console.error("Error loading products:", e))
      .finally(() => setLoadingProduct(false));
  }, [prodId, variantIdParam, priceParam, variantNameParam, variantImageParam]);

  const [userEmail, setUserEmail] = useState("");

  // Pillar 3: Debounced Abandoned Cart Auto-Capture when customer types valid phone
  useEffect(() => {
    const cleanPhone = (formData.phone || "").replace(/\D/g, "");
    if (cleanPhone.length >= 10 && product) {
      const timer = setTimeout(() => {
        fetch("/api/cart/abandoned", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name || "Valued Customer",
            phone: cleanPhone,
            email: userEmail || "",
            items: [
              {
                id: product.id,
                name: product.name,
                quantity: qty,
                price: product.price,
              },
            ],
            cartTotal: subtotal,
          }),
        }).catch(() => {});
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [formData.phone, formData.name, userEmail, product, qty, subtotal]);

  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [orderComplete, setOrderComplete] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");

  // In-Checkout WhatsApp OTP send
  const handleSendInCheckoutWhatsAppOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoginError("");
    setLoginSuccessMsg("");
    const clean = loginPhone.replace(/\D/g, "").slice(-10);
    if (clean.length !== 10) {
      setLoginError("Please enter a valid 10-digit mobile number.");
      return;
    }
    setLoginLoading(true);
    try {
      const res = await fetch("/api/auth/whatsapp/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: clean }),
      });
      const data = await res.json();
      if (data.success) {
        setLoginOtpSent(true);
        setLoginSuccessMsg(`Verification code sent to WhatsApp on +91 ${clean}`);
      } else {
        setLoginError(data.error || "Failed to send WhatsApp OTP.");
      }
    } catch {
      setLoginError("Connection failed. Please try again.");
    } finally {
      setLoginLoading(false);
    }
  };

  // In-Checkout WhatsApp OTP verify
  const handleVerifyInCheckoutWhatsAppOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    const clean = loginPhone.replace(/\D/g, "").slice(-10);
    if (clean.length !== 10) {
      setLoginError("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (loginOtp.trim().length !== 6) {
      setLoginError("Please enter the 6-digit verification code.");
      return;
    }
    setLoginLoading(true);
    try {
      const res = await fetch("/api/auth/whatsapp/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: clean,
          otp: loginOtp.trim(),
          name: loginPhoneName.trim() || signupName.trim() || formData.name,
        }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        try {
          localStorage.setItem("pyur_user", JSON.stringify(data.user));
          window.dispatchEvent(new Event("pyur_auth_change"));
        } catch {}
        await checkAuthStatus();
        setFormData((prev) => ({
          ...prev,
          name: prev.name || data.user.name || loginPhoneName.trim() || signupName.trim(),
          phone: prev.phone || clean,
        }));
        setIsPhoneVerified(true);
        setInCheckoutLoginOpen(false);
        setIsCheckoutSignup(false);
        setLoginOtp("");
        setLoginOtpSent(false);
      } else {
        setLoginError(data.error || "Incorrect verification code.");
      }
    } catch {
      setLoginError("Verification failed. Please try again.");
    } finally {
      setLoginLoading(false);
    }
  };

  // In-Checkout Email & Password login
  const handleInCheckoutEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    if (!loginEmail || !loginPassword) {
      setLoginError("Please enter both email and password.");
      return;
    }
    setLoginLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail.trim(), password: loginPassword }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        try {
          localStorage.setItem("pyur_user", JSON.stringify(data.user));
          window.dispatchEvent(new Event("pyur_auth_change"));
        } catch {}
        await checkAuthStatus();
        setFormData((prev) => ({
          ...prev,
          name: prev.name || data.user.name || "",
          phone: prev.phone || data.user.phone || "",
        }));
        setInCheckoutLoginOpen(false);
        setIsCheckoutSignup(false);
        setLoginEmail("");
        setLoginPassword("");
      } else {
        setLoginError(data.error || "Invalid email or password.");
      }
    } catch {
      setLoginError("Sign in failed. Please try again.");
    } finally {
      setLoginLoading(false);
    }
  };

  // In-Checkout Email & Password sign-up (Create New Account)
  const handleInCheckoutEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginSuccessMsg("");

    const name = signupName.trim() || formData.name.trim();
    if (!name) {
      setLoginError("Please enter your full name.");
      return;
    }
    if (!loginEmail.trim()) {
      setLoginError("Please enter your email address.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(loginEmail.trim())) {
      setLoginError("Please enter a valid email address.");
      return;
    }

    const cleanPhone = (signupPhone || formData.phone).replace(/\D/g, "").slice(-10);
    if (cleanPhone && cleanPhone.length !== 10) {
      setLoginError("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (
      loginPassword.length < 8 ||
      !/[A-Z]/.test(loginPassword) ||
      !/[a-z]/.test(loginPassword) ||
      !/[0-9]/.test(loginPassword) ||
      !/[!@#$%^&*(),.?":{}|<>]/.test(loginPassword)
    ) {
      setLoginError("Password must be at least 8 characters and include uppercase, lowercase, numbers, and special characters.");
      return;
    }

    setLoginLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email: loginEmail.trim(),
          phone: cleanPhone,
          password: loginPassword,
        }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        try {
          localStorage.setItem("pyur_user", JSON.stringify(data.user));
          window.dispatchEvent(new Event("pyur_auth_change"));
        } catch {}
        await checkAuthStatus();
        setFormData((prev) => ({
          ...prev,
          name: prev.name || name,
          phone: prev.phone || cleanPhone,
        }));
        setUserEmail(loginEmail.trim());
        setInCheckoutLoginOpen(false);
        setIsCheckoutSignup(false);
        setSignupName("");
        setSignupPhone("");
        setLoginEmail("");
        setLoginPassword("");
      } else {
        setLoginError(data.error || "Failed to create account.");
      }
    } catch {
      setLoginError("Failed to create account. Please try again.");
    } finally {
      setLoginLoading(false);
    }
  };

  // In-Checkout Sign Out
  const handleCheckoutSignOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
      try {
        localStorage.removeItem("pyur_user");
        window.dispatchEvent(new Event("pyur_auth_change"));
      } catch {}
      setCurrentUser(null);
      setUserCoins(0);
      setRedeemCoins(false);
      setIsPhoneVerified(false);
    } catch {}
  };

  // Guest inline phone verification
  const handleSendGuestPhoneOtp = async () => {
    const clean = formData.phone.replace(/\D/g, "").slice(-10);
    if (clean.length !== 10) {
      alert("Please enter a valid 10-digit mobile number first.");
      return;
    }
    setGuestOtpLoading(true);
    setGuestOtpError("");
    try {
      const res = await fetch("/api/checkout/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: clean, email: userEmail }),
      });
      const data = await res.json();
      if (data.success) {
        setGuestOtpDrawerOpen(true);
      } else {
        alert(data.error || "Failed to send WhatsApp verification code.");
      }
    } catch {
      alert("Failed to send OTP. Please check your internet connection.");
    } finally {
      setGuestOtpLoading(false);
    }
  };

  const handleVerifyGuestPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = formData.phone.replace(/\D/g, "").slice(-10);
    if (guestOtpInput.trim().length !== 6) {
      setGuestOtpError("Please enter the 6-digit code.");
      return;
    }
    setGuestOtpLoading(true);
    setGuestOtpError("");
    try {
      const res = await fetch("/api/checkout/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: clean,
          otp: guestOtpInput.trim(),
          email: userEmail,
        }),
      });
      const data = await res.json();
      if (data.success && data.verified) {
        setIsPhoneVerified(true);
        setGuestOtpDrawerOpen(false);
        setGuestOtpInput("");
        setGuestOtpError("");
      } else {
        setGuestOtpError(data.error || "Incorrect verification code.");
      }
    } catch {
      setGuestOtpError("Verification failed. Please try again.");
    } finally {
      setGuestOtpLoading(false);
    }
  };

  // Select Saved Address
  const selectSavedAddress = (addr: any) => {
    setFormData((prev) => ({
      ...prev,
      name: addr.name || prev.name,
      phone: addr.phone || prev.phone,
      address: addr.street || prev.address,
      landmark: addr.landmark || prev.landmark,
      city: addr.city || prev.city,
      state: addr.state || prev.state,
      pincode: addr.pincode || prev.pincode,
    }));
  };

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

  const maxCoinsRedeemable = Math.min(userCoins, Math.floor(subtotal * 0.2));
  const coinsDiscount = currentUser && redeemCoins ? maxCoinsRedeemable : 0;

  const freeThreshold = settings.shipping?.freeThreshold ?? 999;
  const baseRate = settings.shipping?.baseRate ?? 49;
  const shipping = subtotal >= freeThreshold ? 0 : baseRate;
  const total = Math.max(0, subtotal - prepaidDiscount - couponDiscount - coinsDiscount + shipping);

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.pincode.length !== 6) {
      alert("Please enter a valid 6-digit Pincode.");
      return;
    }

    const cleanPhone = formData.phone.replace(/\D/g, "").slice(-10);
    if (cleanPhone.length !== 10) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (!formData.name.trim()) {
      alert("Please enter your full name.");
      return;
    }

    if (!formData.address.trim() || !formData.city.trim() || !formData.state.trim()) {
      alert("Please complete your delivery address, city, and state.");
      return;
    }

    // MANDATORY OTP VERIFICATION FOR GUEST BUYERS (Without login & signup)
    // Also required if COD has settings.codOtpEnabled enabled
    const isGuest = !currentUser;
    const needsVerification = (isGuest && !isPhoneVerified) || (formData.paymentMethod === "cod" && settings.codOtpEnabled && !isPhoneVerified);

    if (needsVerification) {
      setOtpSending(true);
      setOtpError("");
      try {
        const res = await fetch("/api/checkout/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: cleanPhone, email: userEmail }),
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
        alert("Failed to send verification code. Check your internet connection and try again.");
      } finally {
        setOtpSending(false);
      }
      return;
    }

    if (formData.paymentMethod === "prepaid") {
      void processPrepaidPhonePeOrder();
    } else {
      void processOrder();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError("");
    const cleanPhone = formData.phone.replace(/\D/g, "").slice(-10);

    if (otpInput.trim().length !== 6) {
      setOtpError("Please enter the 6-digit verification code.");
      return;
    }

    setOtpVerifying(true);
    try {
      const response = await fetch("/api/checkout/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanPhone, email: userEmail, otp: otpInput.trim() }),
      });
      const resData = await response.json();
      if (resData.success && resData.verified) {
        setIsPhoneVerified(true);
        setOtpModalOpen(false);
        setOtpInput("");
        setOtpError("");

        // Auto-proceed with corresponding payment method flow
        if (formData.paymentMethod === "prepaid") {
          void processPrepaidPhonePeOrder();
        } else {
          void processOrder();
        }
      } else {
        setOtpError(resData.error || "Incorrect verification code. Please try again.");
      }
    } catch {
      setOtpError("Connection error. Please try again.");
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    const cleanPhone = formData.phone.replace(/\D/g, "").slice(-10);
    setOtpSending(true);
    setOtpError("");
    try {
      const res = await fetch("/api/checkout/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanPhone, email: userEmail }),
      });
      const data = await res.json();
      if (data.success) {
        alert("A fresh 6-digit OTP has been sent to your WhatsApp.");
      } else {
        setOtpError(data.error || "Failed to resend code.");
      }
    } catch {
      setOtpError("Network error. Could not resend code.");
    } finally {
      setOtpSending(false);
    }
  };

  const processPrepaidPhonePeOrder = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/payment/phonepe/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          email: userEmail,
          subtotal,
          items: [{ productId: product.id, quantity: qty }],
          appliedCoupon: appliedCoupon?.code,
          couponDiscount,
          coinsRedeemed: coinsDiscount,
        }),
      });
      const resData = await response.json();
      if (resData.success && resData.redirectUrl) {
        window.location.href = resData.redirectUrl;
      } else {
        alert(resData.error || "Failed to initialize payment with PhonePe. Please try again.");
        setLoading(false);
      }
    } catch {
      alert("Error initiating payment. Please check your internet connection.");
      setLoading(false);
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
          coinsRedeemed: coinsDiscount,
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
          Thank you for choosing Pure Ayur Herbs. We have received your order details and started preparing your package. A tracking link will be sent to <b>{formData.phone}</b> shortly.
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
        {/* User Account / Instant Guest Checkout Top Banner */}
        {currentUser ? (
          <div className="rounded-2xl border border-emerald-200 bg-[#eef5df] p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#244f31] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                <User className="size-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-[#17231b]">
                    Logged in as <span className="text-[#244f31]">{currentUser.name || "Customer"}</span>
                  </span>
                  <span className="text-[10px] bg-[#244f31]/10 text-[#244f31] font-bold px-2 py-0.5 rounded-full">
                    Account Active
                  </span>
                </div>
                <p className="text-[11px] text-[#666666]">
                  {currentUser.phone ? `+91 ${currentUser.phone}` : ""} {currentUser.email ? `• ${currentUser.email}` : ""}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleCheckoutSignOut}
              className="text-xs text-red-600 hover:text-red-700 font-bold flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-200 bg-white hover:bg-red-50 transition shrink-0"
            >
              <LogOut className="size-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border border-amber-200 bg-linear-to-r from-amber-50 to-orange-50 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-amber-500/15 text-amber-700 flex items-center justify-center font-bold text-base shrink-0">
                ⚡
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-[#17231b]">
                    Instant Guest Checkout
                  </span>
                  <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                    No Sign-in Needed
                  </span>
                </div>
                <p className="text-[11px] text-amber-900/80">
                  Fill details below to place order immediately, or log in to use saved addresses & coins.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIsCheckoutSignup(false);
                  setLoginError("");
                  setLoginSuccessMsg("");
                  setInCheckoutLoginOpen(true);
                }}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#244f31] text-white text-xs font-black hover:bg-[#1d3b24] shadow-xs transition"
              >
                <LogIn className="size-3.5" />
                <span>Log In</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCheckoutSignup(true);
                  setLoginError("");
                  setLoginSuccessMsg("");
                  setInCheckoutLoginOpen(true);
                }}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#244f31] text-[#244f31] text-xs font-black hover:bg-[#f8faf1] shadow-xs transition"
              >
                <UserPlus className="size-3.5" />
                <span>Create Account</span>
              </button>
            </div>
          </div>
        )}

        {/* Saved Addresses for Logged-in Customer */}
        {currentUser && Array.isArray(currentUser.savedAddresses) && currentUser.savedAddresses.length > 0 && (
          <div className="rounded-2xl border border-[#ddddd9] bg-white p-5 shadow-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#17231b] flex items-center gap-1.5 mb-3">
              <MapPin className="size-4 text-[#80a03c]" />
              <span>Select From Saved Addresses</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentUser.savedAddresses.map((addr: any, idx: number) => {
                const isSelected =
                  formData.address === addr.street && formData.pincode === addr.pincode;
                return (
                  <div
                    key={addr.id || idx}
                    onClick={() => selectSavedAddress(addr)}
                    className={`cursor-pointer rounded-xl border p-3 text-xs transition relative ${
                      isSelected
                        ? "border-[#244f31] bg-[#eef5df] ring-1 ring-[#244f31]"
                        : "border-[#ddddd9] bg-white hover:border-[#80a03c]"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span className="font-bold text-[#17231b]">{addr.name || currentUser.name}</span>
                      {isSelected && (
                        <span className="text-[10px] font-bold text-[#244f31] bg-white px-1.5 py-0.5 rounded border border-[#244f31]/30">
                          Selected
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-[11px] text-[#666666] line-clamp-2">
                      {addr.street}{addr.landmark ? `, ${addr.landmark}` : ""}, {addr.city}, {addr.state} - {addr.pincode}
                    </p>
                    <p className="mt-1 text-[10px] text-gray-500 font-medium">📞 +91 {addr.phone}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Pure Coins Redemption Toggle */}
        {currentUser && userCoins > 0 && (
          <div className="rounded-2xl border border-amber-300 bg-amber-50/70 p-4 shadow-sm flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-amber-500/20 text-amber-600 flex items-center justify-center font-bold shrink-0">
                <Coins className="size-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-[#17231b]">Pure Coins Available</span>
                  <span className="text-xs font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                    🪙 {userCoins} Coins
                  </span>
                </div>
                <p className="text-[11px] text-amber-900/80">
                  Redeem up to ₹{maxCoinsRedeemable} (20% max discount, 1 Coin = ₹1)
                </p>
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer select-none shrink-0 bg-white border border-amber-300 px-3 py-1.5 rounded-xl shadow-xs">
              <input
                type="checkbox"
                checked={redeemCoins}
                onChange={(e) => setRedeemCoins(e.target.checked)}
                className="size-4 rounded border-amber-400 accent-[#244f31]"
              />
              <span className="text-xs font-bold text-[#17231b]">Apply Coins</span>
            </label>
          </div>
        )}

        {/* Customer Details Card (Matching Shiprocket / Screenshot Design) */}
        <div className="rounded-2xl border border-[#ddddd9] bg-white p-6 shadow-sm">
          <h3 className="text-base sm:text-lg font-black text-[#17231b] mb-5">
            Customer Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
            {/* Row 1: Full Name */}
            <div>
              <label className="block text-xs font-bold text-[#17231b] mb-1.5">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Full Name"
                className="w-full rounded-xl border border-[#ddddd9] px-3.5 py-2.5 text-xs text-[#17231b] outline-none focus:border-[#244f31] focus:ring-1 focus:ring-[#244f31] bg-white transition"
              />
            </div>

            {/* Row 1: Mobile Number */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-[#17231b]">Mobile Number</label>
                {isPhoneVerified ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                    <Check className="size-3" /> Phone Verified
                  </span>
                ) : formData.phone.length === 10 ? (
                  <button
                    type="button"
                    onClick={handleSendGuestPhoneOtp}
                    disabled={guestOtpLoading}
                    className="text-[10px] font-bold text-[#244f31] bg-[#eaf4ec] hover:bg-[#d8edd9] px-2.5 py-0.5 rounded-full transition flex items-center gap-1 border border-[#86efac]/60"
                  >
                    {guestOtpLoading ? (
                      <Loader2 className="size-3 animate-spin" />
                    ) : (
                      <Sparkles className="size-3 text-[#244f31]" />
                    )}
                    <span>Verify via OTP</span>
                  </button>
                ) : (
                  <span className="text-[10px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                    OTP Required
                  </span>
                )}
              </div>
              <div className="flex rounded-xl border border-[#ddddd9] bg-white overflow-hidden focus-within:border-[#244f31] focus-within:ring-1 focus-within:ring-[#244f31] transition">
                <span className="bg-[#f1f5f9] text-[#64748b] text-xs font-bold px-3 py-2.5 flex items-center border-r border-[#e2e8f0] select-none shrink-0">
                  +91
                </span>
                <input
                  type={maskPhone ? "password" : "tel"}
                  required
                  pattern="[0-9]{10}"
                  maxLength={10}
                  value={formData.phone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    setFormData({ ...formData, phone: val });
                    if (val !== formData.phone) {
                      setIsPhoneVerified(false);
                      setGuestOtpDrawerOpen(false);
                    }
                  }}
                  placeholder="xxxxxxxxxx"
                  className="flex-1 px-3.5 py-2.5 text-xs outline-none bg-transparent text-[#17231b] min-w-0"
                />
                <button
                  type="button"
                  onClick={() => setMaskPhone(!maskPhone)}
                  className="px-3 text-gray-400 hover:text-gray-600 transition flex items-center shrink-0 cursor-pointer"
                  title={maskPhone ? "Show mobile number" : "Mask mobile number"}
                >
                  {maskPhone ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>

              {/* Inline Guest Phone OTP Drawer */}
              {guestOtpDrawerOpen && !isPhoneVerified && (
                <div className="mt-2.5 p-3 rounded-xl bg-[#f0fdf4] border border-[#86efac] animate-in fade-in duration-200">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-emerald-900 flex items-center gap-1">
                      <MessageSquare className="size-3 text-emerald-600" />
                      Enter 6-digit WhatsApp OTP
                    </span>
                    <button
                      type="button"
                      onClick={() => setGuestOtpDrawerOpen(false)}
                      className="text-gray-400 hover:text-gray-600 text-xs"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                  {guestOtpError && (
                    <p className="text-[10px] text-red-600 font-bold mb-1.5">{guestOtpError}</p>
                  )}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      value={guestOtpInput}
                      onChange={(e) => setGuestOtpInput(e.target.value.replace(/\D/g, ""))}
                      placeholder="6-digit OTP"
                      className="flex-1 tracking-widest text-center font-black text-sm px-3 py-1.5 bg-white border border-[#86efac] rounded-lg outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyGuestPhoneOtp}
                      disabled={guestOtpLoading || guestOtpInput.length !== 6}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition disabled:opacity-50 flex items-center gap-1"
                    >
                      {guestOtpLoading ? <Loader2 className="size-3 animate-spin" /> : "Verify"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Row 2: Email (Optional) */}
            <div>
              <label className="block text-xs font-bold text-[#17231b] mb-1.5">
                Email <span className="text-gray-400 font-normal text-[11px]">(Optional)</span>
              </label>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="Enter email address"
                className="w-full rounded-xl border border-[#ddddd9] px-3.5 py-2.5 text-xs text-[#17231b] outline-none focus:border-[#244f31] focus:ring-1 focus:ring-[#244f31] bg-white transition"
              />
            </div>

            {/* Row 2: Alternate Contact Number (Optional) */}
            <div>
              <label className="block text-xs font-bold text-[#17231b] mb-1.5">
                Alternate Contact Number <span className="text-gray-400 font-normal text-[11px]">(Optional)</span>
              </label>
              <div className="flex rounded-xl border border-[#ddddd9] bg-white overflow-hidden focus-within:border-[#244f31] focus-within:ring-1 focus-within:ring-[#244f31] transition">
                <span className="bg-[#f1f5f9] text-[#64748b] text-xs font-bold px-3 py-2.5 flex items-center border-r border-[#e2e8f0] select-none shrink-0">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  value={formData.altPhone}
                  onChange={(e) => setFormData({ ...formData, altPhone: e.target.value.replace(/\D/g, "") })}
                  placeholder="Enter alternate contact no."
                  className="flex-1 px-3.5 py-2.5 text-xs outline-none bg-transparent text-[#17231b] min-w-0"
                />
              </div>
            </div>

            {/* Row 3: Company Name (Optional) */}
            <div>
              <label className="block text-xs font-bold text-[#17231b] mb-1.5">
                Company Name <span className="text-gray-400 font-normal text-[11px]">(Optional)</span>
              </label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                placeholder="Enter company name"
                className="w-full rounded-xl border border-[#ddddd9] px-3.5 py-2.5 text-xs text-[#17231b] outline-none focus:border-[#244f31] focus:ring-1 focus:ring-[#244f31] bg-white transition"
              />
            </div>
            <div className="hidden sm:block"></div>

            {/* Row 4: Complete Address */}
            <div className="sm:col-span-2">
              <div className="flex items-center justify-between mb-1.5">
                <label className="flex items-center gap-1.5 text-xs font-bold text-[#17231b]">
                  <span>Complete Address</span>
                  <span className="relative group">
                    <HelpCircle className="size-3.5 text-gray-400 hover:text-gray-600 cursor-pointer" />
                    <span className="absolute bottom-full left-0 mb-1.5 hidden group-hover:block w-64 p-2 bg-[#17231b] text-white text-[10px] rounded-lg shadow-lg z-20 font-medium">
                      Please enter Flat/House No, Building Name, Street & Colony/Area for fast & accurate delivery.
                    </span>
                  </span>
                </label>
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
                placeholder="House / Flat No., Building, Street, Area"
                className="w-full rounded-xl border border-[#ddddd9] px-3.5 py-2.5 text-xs text-[#17231b] outline-none focus:border-[#244f31] focus:ring-1 focus:ring-[#244f31] bg-white transition"
              />
              {locationError && (
                <p className="mt-1 text-[10px] text-red-500 font-bold flex items-center gap-1 animate-pulse">
                  <span>⚠️</span>
                  <span>{locationError}</span>
                </p>
              )}
            </div>

            {/* Row 5: Landmark (Optional) */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#17231b] mb-1.5">
                Landmark <span className="text-gray-400 font-normal text-[11px]">(Optional)</span>
              </label>
              <input
                type="text"
                value={formData.landmark}
                onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                placeholder="Enter landmark (e.g. Near Temple, Behind Bank)"
                className="w-full rounded-xl border border-[#ddddd9] px-3.5 py-2.5 text-xs text-[#17231b] outline-none focus:border-[#244f31] focus:ring-1 focus:ring-[#244f31] bg-white transition"
              />
            </div>

            {/* Row 6: Pincode & City */}
            <div>
              <label className="block text-xs font-bold text-[#17231b] mb-1.5">Pincode</label>
              <input
                type="text"
                required
                maxLength={6}
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, "") })}
                placeholder="6-digit Pincode (e.g. 247662)"
                className="w-full rounded-xl border border-[#ddddd9] px-3.5 py-2.5 text-xs text-[#17231b] outline-none focus:border-[#244f31] focus:ring-1 focus:ring-[#244f31] bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17231b] mb-1.5">City</label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="City"
                className={`w-full rounded-xl border border-[#ddddd9] px-3.5 py-2.5 text-xs outline-none focus:border-[#244f31] focus:ring-1 focus:ring-[#244f31] transition ${
                  formData.city ? "bg-[#f8fafc] text-gray-800 font-medium" : "bg-white text-[#17231b]"
                }`}
              />
            </div>

            {/* Row 7: Country & State */}
            <div>
              <label className="block text-xs font-bold text-[#17231b] mb-1.5">Country</label>
              <input
                type="text"
                readOnly
                value="India"
                className="w-full rounded-xl border border-[#ddddd9] px-3.5 py-2.5 text-xs bg-[#f8fafc] text-gray-800 font-medium cursor-default outline-none select-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17231b] mb-1.5">State</label>
              <input
                type="text"
                required
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="State"
                className={`w-full rounded-xl border border-[#ddddd9] px-3.5 py-2.5 text-xs outline-none focus:border-[#244f31] focus:ring-1 focus:ring-[#244f31] transition ${
                  formData.state ? "bg-[#f8fafc] text-gray-800 font-medium" : "bg-white text-[#17231b]"
                }`}
              />
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

          {/* COD Blocked Banner (Amazon & Flipkart Policy) */}
          {codBlocked && (
            <div className="mt-3 rounded-xl bg-amber-50 border border-amber-300 p-3 text-xs text-amber-900 flex items-start gap-2.5">
              <AlertCircle className="size-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-[#17231b]">Cash on Delivery Unavailable</span>
                <span className="text-[11px] text-amber-800 leading-tight block mt-0.5">
                  {codBlockReason} Please complete your purchase using secure Online Payment (UPI / Cards / PhonePe).
                </span>
              </div>
            </div>
          )}

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
                  <span className="block text-xs font-bold text-[#17231b]">Google Pay, PhonePe, Cards, UPI (Online Payment)</span>
                  <span className="text-[10px] font-semibold text-[#80a03c]">Get {settings.prepaidDiscount}% Instant Discount</span>
                </div>
              </div>
              <span className="text-xs font-extrabold text-[#244f31]">Prepaid</span>
            </button>

            <button
              type="button"
              disabled={codBlocked}
              onClick={() => {
                if (!codBlocked) setFormData({ ...formData, paymentMethod: "cod" });
              }}
              className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition ${
                codBlocked
                  ? "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed"
                  : formData.paymentMethod === "cod"
                  ? "border-[#244f31] bg-[#eef5df] ring-1 ring-[#244f31]"
                  : "border-[#ddddd9] bg-white hover:border-[#80a03c]"
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  disabled={codBlocked}
                  readOnly
                  checked={formData.paymentMethod === "cod" && !codBlocked}
                  className="accent-[#244f31]"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="block text-xs font-bold text-[#17231b]">Cash on Delivery (COD)</span>
                    {codBlocked && (
                      <span className="rounded bg-red-100 px-1.5 py-0.5 text-[9px] font-extrabold text-red-700 uppercase">
                        Unavailable
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-[#666666]">
                    {codBlocked
                      ? "Disabled due to previous cancellations"
                      : "Verify mobile number via SMS OTP"}
                  </span>
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
            {coinsDiscount > 0 && (
              <div className="flex justify-between text-amber-600 font-bold">
                <span className="flex items-center gap-1">
                  <Coins className="size-3.5" /> Pure Coins Redeemed
                </span>
                <span>-₹{coinsDiscount}</span>
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

      {/* WhatsApp / SMS Order Verification Dialog Modal */}
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
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366]/15 text-[#25D366]">
                <MessageSquare className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#17231b]">
                  {formData.paymentMethod === "prepaid" ? "Verify Mobile to Pay" : "Verify Mobile to Confirm"}
                </h3>
                <span className="text-[10px] font-bold text-[#25D366] uppercase tracking-wider">Instant Verification</span>
              </div>
            </div>
            <p className="mt-2 text-xs text-[#666666] leading-relaxed">
              We have sent a 6-digit verification code to{" "}
              <b className="text-[#17231b]">
                {formData.phone ? `+91 ${formData.phone.replace(/\D/g, "").slice(-10)}` : userEmail}
              </b>{" "}
              via WhatsApp to verify your number and confirm your {formData.paymentMethod === "prepaid" ? "prepaid order" : "order"}.
            </p>
            {otpError && <p className="mt-2 text-xs text-red-500 font-bold text-center bg-red-50 p-2 rounded-lg">{otpError}</p>}
            <form onSubmit={handleVerifyOtp} className="mt-4 space-y-4">
              <input
                type="text"
                maxLength={6}
                required
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ""))}
                placeholder="Enter 6-digit OTP"
                className="w-full text-center tracking-[0.3em] text-xl font-black rounded-xl border-2 border-[#ddddd9] px-3 py-3 outline-none focus:border-[#25D366] transition"
                autoFocus
              />
              <button
                type="submit"
                disabled={otpVerifying || otpInput.trim().length !== 6}
                className="w-full rounded-xl bg-[#25D366] py-3 text-xs font-black tracking-widest text-white shadow-md hover:bg-[#20ba5a] transition disabled:opacity-50"
              >
                {otpVerifying
                  ? "VERIFYING..."
                  : formData.paymentMethod === "prepaid"
                  ? "VERIFY & PROCEED TO PAYMENT"
                  : "VERIFY & CONFIRM ORDER"}
              </button>
            </form>
            <div className="mt-3 text-center">
              <button
                type="button"
                disabled={otpSending}
                onClick={handleResendOtp}
                className="text-[11px] font-semibold text-[#666666] hover:text-[#244f31] underline"
              >
                {otpSending ? "Sending new code..." : "Didn't receive code? Resend on WhatsApp"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-Checkout Dual-Mode Login / Sign-In Modal */}
      {inCheckoutLoginOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setInCheckoutLoginOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <button
              onClick={() => setInCheckoutLoginOpen(false)}
              className="absolute right-4 top-4 rounded-full p-1 text-[#666666] hover:bg-[#f8faf1] transition"
            >
              <X className="size-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-1">
              <div className="h-9 w-9 rounded-full bg-[#244f31]/10 text-[#244f31] flex items-center justify-center">
                {isCheckoutSignup ? <UserPlus className="size-5" /> : <LogIn className="size-5" />}
              </div>
              <div>
                <h3 className="text-base font-black text-[#17231b]">
                  {isCheckoutSignup ? "Create Pure Ayur Account" : "Sign In to Pure Ayur Herbs"}
                </h3>
                <p className="text-[11px] text-[#666666]">
                  {isCheckoutSignup
                    ? "Get 50 bonus Pure Coins & save your delivery address"
                    : "Access saved addresses & redeem Pure Coins"}
                </p>
              </div>
            </div>

            {/* Login / Sign Up Mode Tabs */}
            <div className="mt-4 flex rounded-xl bg-gray-100 p-1">
              <button
                type="button"
                onClick={() => {
                  setInCheckoutLoginMode("whatsapp");
                  setLoginError("");
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
                  inCheckoutLoginMode === "whatsapp"
                    ? "bg-white text-[#244f31] shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <MessageSquare className="size-3.5 text-[#25D366]" />
                <span>WhatsApp OTP</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setInCheckoutLoginMode("email");
                  setLoginError("");
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
                  inCheckoutLoginMode === "email"
                    ? "bg-white text-[#244f31] shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <span>Email & Password</span>
              </button>
            </div>

            {loginError && (
              <div className="mt-3 p-2.5 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-xl flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}
            {loginSuccessMsg && (
              <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                <Check className="size-4 shrink-0" />
                <span>{loginSuccessMsg}</span>
              </div>
            )}

            {inCheckoutLoginMode === "whatsapp" ? (
              <form
                onSubmit={loginOtpSent ? handleVerifyInCheckoutWhatsAppOtp : handleSendInCheckoutWhatsAppOtp}
                className="mt-4 space-y-3"
              >
                <div>
                  <label className="block text-xs font-bold text-[#17231b] mb-1">Mobile Number</label>
                  <div className="flex rounded-xl border border-[#ddddd9] bg-white overflow-hidden focus-within:border-[#244f31] transition">
                    <span className="bg-[#f1f5f9] text-[#64748b] text-xs font-bold px-3 py-2 flex items-center border-r border-[#e2e8f0]">
                      +91
                    </span>
                    <input
                      type="tel"
                      maxLength={10}
                      required
                      disabled={loginOtpSent}
                      value={loginPhone}
                      onChange={(e) => setLoginPhone(e.target.value.replace(/\D/g, ""))}
                      placeholder="10-digit mobile number"
                      className="flex-1 px-3 py-2 text-xs outline-none bg-transparent"
                    />
                  </div>
                </div>

                {!loginOtpSent && (
                  <div>
                    <label className="block text-xs font-bold text-[#17231b] mb-1">
                      Your Full Name{" "}
                      {isCheckoutSignup ? (
                        <span className="text-red-500">*</span>
                      ) : (
                        <span className="text-gray-400 font-normal">(Optional)</span>
                      )}
                    </label>
                    <input
                      type="text"
                      required={isCheckoutSignup}
                      value={loginPhoneName}
                      onChange={(e) => setLoginPhoneName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full rounded-xl border border-[#ddddd9] px-3 py-2 text-xs outline-none focus:border-[#244f31]"
                    />
                  </div>
                )}

                {loginOtpSent && (
                  <div>
                    <label className="block text-xs font-bold text-[#17231b] mb-1">Enter 6-digit WhatsApp Code</label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      autoFocus
                      value={loginOtp}
                      onChange={(e) => setLoginOtp(e.target.value.replace(/\D/g, ""))}
                      placeholder="XXXXXX"
                      className="w-full tracking-[0.25em] text-center font-black text-lg rounded-xl border-2 border-emerald-400 px-3 py-2 outline-none focus:border-emerald-600"
                    />
                    <div className="mt-1 flex justify-between items-center">
                      <button
                        type="button"
                        onClick={handleSendInCheckoutWhatsAppOtp}
                        disabled={loginLoading}
                        className="text-[11px] text-[#244f31] hover:underline font-semibold"
                      >
                        Resend Code
                      </button>
                      <button
                        type="button"
                        onClick={() => setLoginOtpSent(false)}
                        className="text-[11px] text-gray-500 hover:underline"
                      >
                        Change Number
                      </button>
                    </div>
                  </div>
                )}

                {isCheckoutSignup && !loginOtpSent && (
                  <div className="rounded-xl bg-[#244f31]/5 border border-[#244f31]/15 p-2 text-[11px] font-semibold text-[#244f31] flex items-center gap-1.5">
                    <Sparkles className="size-3.5 shrink-0 text-amber-500" />
                    <span>Instant account setup via WhatsApp OTP • 50 Pure Coins bonus</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full rounded-xl bg-[#244f31] py-3 text-xs font-black tracking-wider text-white hover:bg-[#1d3b24] transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loginLoading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : loginOtpSent ? (
                    isCheckoutSignup ? "VERIFY & CREATE ACCOUNT" : "VERIFY & SIGN IN"
                  ) : (
                    "SEND WHATSAPP OTP"
                  )}
                </button>
              </form>
            ) : isCheckoutSignup ? (
              <form onSubmit={handleInCheckoutEmailSignup} className="mt-4 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[#17231b] mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full rounded-xl border border-[#ddddd9] px-3 py-2 text-xs outline-none focus:border-[#244f31]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#17231b] mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full rounded-xl border border-[#ddddd9] px-3 py-2 text-xs outline-none focus:border-[#244f31]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#17231b] mb-1">Mobile Number</label>
                  <div className="flex rounded-xl border border-[#ddddd9] bg-white overflow-hidden focus-within:border-[#244f31] transition">
                    <span className="bg-[#f1f5f9] text-[#64748b] text-xs font-bold px-3 py-2 flex items-center border-r border-[#e2e8f0]">
                      +91
                    </span>
                    <input
                      type="tel"
                      maxLength={10}
                      required
                      value={signupPhone}
                      onChange={(e) => setSignupPhone(e.target.value.replace(/\D/g, ""))}
                      placeholder="10-digit mobile number"
                      className="flex-1 px-3 py-2 text-xs outline-none bg-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#17231b] mb-1">Password</label>
                  <div className="relative">
                    <input
                      type={signupShowPassword ? "text" : "password"}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Min 8 chars (Uppercase, Lowercase, Number & Symbol)"
                      className="w-full rounded-xl border border-[#ddddd9] px-3 py-2 text-xs outline-none focus:border-[#244f31] pr-9"
                    />
                    <button
                      type="button"
                      onClick={() => setSignupShowPassword(!signupShowPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {signupShowPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  <p className="mt-1 text-[10px] text-gray-500">
                    Must be 8+ chars with uppercase, lowercase, number & special char.
                  </p>
                </div>
                <div className="rounded-xl bg-[#244f31]/5 border border-[#244f31]/15 p-2 text-[11px] font-semibold text-[#244f31] flex items-center gap-1.5">
                  <Sparkles className="size-3.5 shrink-0 text-amber-500" />
                  <span>🎁 50 Pure Coins will be added to your account instantly!</span>
                </div>
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full rounded-xl bg-[#244f31] py-3 text-xs font-black tracking-wider text-white hover:bg-[#1d3b24] transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loginLoading ? <Loader2 className="size-4 animate-spin" /> : "CREATE ACCOUNT & CONTINUE"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleInCheckoutEmailLogin} className="mt-4 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[#17231b] mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full rounded-xl border border-[#ddddd9] px-3 py-2 text-xs outline-none focus:border-[#244f31]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#17231b] mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full rounded-xl border border-[#ddddd9] px-3 py-2 text-xs outline-none focus:border-[#244f31]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full rounded-xl bg-[#244f31] py-3 text-xs font-black tracking-wider text-white hover:bg-[#1d3b24] transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loginLoading ? <Loader2 className="size-4 animate-spin" /> : "SIGN IN"}
                </button>
              </form>
            )}

            <div className="mt-5 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1.5 text-[11px] text-gray-500 text-center">
              <span>
                Prefer to checkout quickly?{" "}
                <button
                  type="button"
                  onClick={() => setInCheckoutLoginOpen(false)}
                  className="font-bold text-[#244f31] hover:underline"
                >
                  Continue as Guest
                </button>
              </span>
              <span className="text-gray-300">|</span>
              {isCheckoutSignup ? (
                <span>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setIsCheckoutSignup(false);
                      setLoginError("");
                      setLoginSuccessMsg("");
                    }}
                    className="font-bold text-[#244f31] hover:underline"
                  >
                    Sign In
                  </button>
                </span>
              ) : (
                <span>
                  New customer?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setIsCheckoutSignup(true);
                      setLoginError("");
                      setLoginSuccessMsg("");
                    }}
                    className="font-bold text-[#244f31] hover:underline"
                  >
                    Create New Account
                  </button>
                </span>
              )}
            </div>
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
          <span className="text-sm font-black tracking-widest uppercase">PURE AYUR HERBS</span>
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
