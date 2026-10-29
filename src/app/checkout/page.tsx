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
  Clock,
  ChevronUp,
  ChevronDown,
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

  const parsedUrlPrice = priceParam ? parseFloat(priceParam) : NaN;
  const initialPrice = !isNaN(parsedUrlPrice) && parsedUrlPrice > 0 ? parsedUrlPrice : 999;
  const initialMrp = Math.round(initialPrice * 1.25);
  const initialName = variantNameParam ? `Ayurvedic Remedy (${variantNameParam})` : "Ayurvedic Formulation";

  const fallbackProd: Product = {
    id: prodId || "1",
    name: initialName,
    slug: "ayurvedic-formulation",
    concern: "Ayurveda",
    price: initialPrice,
    compareAt: initialMrp,
    rating: 5.0,
    reviews: 1,
    badge: "100% PURE",
    image: variantImageParam || "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=500&q=80",
    ingredients: ["Natural Herbs"],
    description: "Ayurvedic wellness remedy.",
    coinsEarned: 50,
    deliveryDays: "3 - 5 Days",
    inStock: true,
  };

  const [catalog, setCatalog] = useState<Product[]>([]);
  const [product, setProduct] = useState<Product>(fallbackProd);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [summaryExpanded, setSummaryExpanded] = useState(true);
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
    paymentMethod: "cod", // default to cod; user can manually select prepaid / upi if preferred
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
          const found = data.products.find(
            (p: any) => p.id === prodId || p.slug === prodId || (prodId && prodId.startsWith(p.id))
          );
          if (found) {
            // 1. Check if variants exist in database and match variantIdParam
            let matchedVar: any = null;
            if (variantIdParam && Array.isArray(found.variants) && found.variants.length > 0) {
              matchedVar = found.variants.find((v: any) => v.id === variantIdParam);
            }

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

            // 2. Dynamic pack bundle or URL price/variant parameter handling
            const parsedP = priceParam ? parseFloat(priceParam) : NaN;
            const hasValidPrice = !isNaN(parsedP) && parsedP > 0;

            const isPack2 =
              variantIdParam?.endsWith("-pack2") ||
              variantNameParam?.toLowerCase().includes("pack of 2") ||
              variantNameParam?.toLowerCase().includes("2 pack");
            const isPack3 =
              variantIdParam?.endsWith("-pack3") ||
              variantNameParam?.toLowerCase().includes("pack of 3") ||
              variantNameParam?.toLowerCase().includes("3 pack");
            const isPack1 =
              variantIdParam?.endsWith("-pack1") ||
              variantNameParam?.toLowerCase().includes("pack of 1") ||
              variantNameParam?.toLowerCase().includes("1 pack");

            let packLabel = variantNameParam || "";
            if (!packLabel) {
              if (isPack2) packLabel = "Pack of 2";
              else if (isPack3) packLabel = "Pack of 3";
              else if (isPack1) packLabel = "1 Pack";
            }

            let finalPrice = found.price;
            let finalMrp = Number(found.compareAt || found.mrp) || Math.round(found.price * 1.25);

            if (hasValidPrice) {
              finalPrice = parsedP;
              if (isPack2) {
                finalMrp = finalMrp * 2;
              } else if (isPack3) {
                finalMrp = finalMrp * 3;
              } else {
                finalMrp = Math.max(finalMrp, Math.round(parsedP * 1.25));
              }
            } else if (isPack2) {
              finalPrice = Math.round(found.price * 2 * 0.85);
              finalMrp = finalMrp * 2;
            } else if (isPack3) {
              finalPrice = Math.round(found.price * 3 * 0.75);
              finalMrp = finalMrp * 3;
            }

            const finalName =
              packLabel && !found.name.includes(packLabel)
                ? `${found.name} (${packLabel})`
                : found.name;

            setProduct({
              ...found,
              price: finalPrice,
              compareAt: finalMrp,
              image: variantImageParam || found.image,
              name: finalName,
            });
            return;
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
          credentials: "include",
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

  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const [orderComplete, setOrderComplete] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");

  // Thank You Page COD WhatsApp OTP Verification State
  const [codOtpInput, setCodOtpInput] = useState("");
  const [codOtpVerifying, setCodOtpVerifying] = useState(false);
  const [codOtpSending, setCodOtpSending] = useState(false);
  const [codOtpError, setCodOtpError] = useState("");
  const [codVerified, setCodVerified] = useState(false);
  const [codResendTimer, setCodResendTimer] = useState(30);
  const [canResendCod, setCanResendCod] = useState(false);

  // Auto countdown for COD OTP resend
  useEffect(() => {
    if (
      orderComplete &&
      (orderComplete.method === "COD" || formData.paymentMethod === "cod") &&
      !codVerified &&
      orderComplete.codVerified !== true
    ) {
      if (codResendTimer > 0) {
        const timer = setTimeout(() => {
          setCodResendTimer((prev) => {
            if (prev <= 1) {
              setCanResendCod(true);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [orderComplete, codVerified, codResendTimer, formData.paymentMethod]);

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

  // Auto-apply coupon from URL query param (?coupon=...) or stored session
  useEffect(() => {
    const couponParam = searchParams.get("coupon");
    const storedCoupon = typeof window !== "undefined" ? localStorage.getItem("pyur_applied_coupon") : null;
    const targetCode = (couponParam || storedCoupon || "").trim();

    if (!targetCode || appliedCoupon) return;

    let isCancelled = false;
    fetch("/api/admin/coupons")
      .then((res) => res.json())
      .then((data) => {
        if (isCancelled) return;
        const match = data.coupons?.find(
          (c: any) => c.code === targetCode.toUpperCase() && c.status === "Active"
        );
        if (match) {
          if (match.minCartValue && subtotal < parseFloat(match.minCartValue)) {
            return;
          }
          if (match.applicableType === "Category" && match.applicableValue && product.concern !== match.applicableValue) {
            return;
          }
          if (match.applicableType === "Product" && match.applicableValue && String(product.id) !== String(match.applicableValue)) {
            return;
          }

          setCouponCode(match.code);
          setAppliedCoupon(match);
          setCouponError("");
        }
      })
      .catch(() => {});

    return () => {
      isCancelled = true;
    };
  }, [searchParams, subtotal, product, appliedCoupon]);

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


  const prepaidDiscountValue = Math.round(subtotal * (settings.prepaidDiscount / 100));
  const prepaidDiscount =
    formData.paymentMethod === "prepaid" ? prepaidDiscountValue : 0;

  let couponDiscount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === "Percentage") {
      couponDiscount = Math.round(subtotal * (parseFloat(appliedCoupon.value) / 100));
    } else {
      couponDiscount = parseFloat(appliedCoupon.value);
    }
  }

  // Pure Coins Configuration & Dynamic Exchange Rate
  const coinsEnabled = settings.coinsSettings?.enabled !== false;
  const coinsPerRupee = Number(settings.coinsSettings?.coinsPerRupee) || 10;
  const maxCoinsPercent = Number(settings.coinsSettings?.maxRedemptionPercent) || 20;
  const minCoinsToRedeem = Number(settings.coinsSettings?.minCoinsToRedeem) || 1;

  // Max allowed discount in rupees on this subtotal
  const maxAllowedRupeesDiscount = Math.floor(subtotal * (maxCoinsPercent / 100));
  // Total coins needed for maximum discount
  const maxCoinsUsable = maxAllowedRupeesDiscount * coinsPerRupee;
  // Actual coins customer can redeem from wallet
  const coinsToRedeem = Math.min(userCoins, maxCoinsUsable);
  // Actual rupee discount (coins / coinsPerRupee)
  const maxDiscountInRupees = Math.floor(coinsToRedeem / coinsPerRupee);
  const coinsDiscount = currentUser && redeemCoins && coinsEnabled ? maxDiscountInRupees : 0;

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

    if (formData.paymentMethod === "prepaid") {
      void processPrepaidPhonePeOrder(pendingOrderId);
    } else {
      void processOrder(pendingOrderId);
    }
  };

  const handleVerifyCodOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setCodOtpError("");
    const cleanPhone = (orderComplete?.phone || formData.phone || "").replace(/\D/g, "").slice(-10);
    const targetOrderId = orderComplete?.orderId;

    if (codOtpInput.trim().length !== 6) {
      setCodOtpError("Please enter the 6-digit verification code sent to your WhatsApp.");
      return;
    }

    setCodOtpVerifying(true);
    try {
      const response = await fetch("/api/checkout/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: cleanPhone,
          email: userEmail,
          otp: codOtpInput.trim(),
          orderId: targetOrderId,
        }),
      });
      const resData = await response.json();
      if (resData.success && resData.verified) {
        setCodVerified(true);
        setCodOtpError("");
      } else {
        setCodOtpError(resData.error || "Incorrect verification code. Please check WhatsApp and try again.");
      }
    } catch {
      setCodOtpError("Connection error while verifying. Please check your internet connection.");
    } finally {
      setCodOtpVerifying(false);
    }
  };

  const handleResendCodOtp = async () => {
    if (!canResendCod && codResendTimer > 0) return;
    const cleanPhone = (orderComplete?.phone || formData.phone || "").replace(/\D/g, "").slice(-10);
    setCodOtpSending(true);
    setCodOtpError("");
    try {
      const res = await fetch("/api/checkout/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanPhone, email: userEmail, purpose: "cod" }),
      });
      const data = await res.json();
      if (data.success) {
        setCodResendTimer(30);
        setCanResendCod(false);
      } else {
        setCodOtpError(data.error || "Failed to resend code.");
      }
    } catch {
      setCodOtpError("Network error. Could not resend code.");
    } finally {
      setCodOtpSending(false);
    }
  };

  const processPrepaidPhonePeOrder = async (existingOrderId?: string | null) => {
    setLoading(true);
    try {
      const response = await fetch("/api/payment/phonepe/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          email: userEmail,
          subtotal,
          items: [{ productId: product.id, quantity: qty, name: product.name, price: product.price }],
          appliedCoupon: appliedCoupon?.code,
          couponDiscount,
          coinsRedeemed: coinsDiscount,
          pendingOrderId: existingOrderId || pendingOrderId,
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

  const processOrder = async (existingOrderId?: string | null) => {
    setLoading(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          email: userEmail,
          subtotal,
          items: [{ productId: product.id, quantity: qty, name: product.name, price: product.price }],
          appliedCoupon: appliedCoupon?.code,
          couponDiscount,
          coinsRedeemed: coinsDiscount,
          pendingOrderId: existingOrderId || pendingOrderId,
        }),
      });
      const resData = await response.json();
      if (resData.success) {
        setOrderComplete(resData);
        if (resData.codVerified) {
          setCodVerified(true);
        }
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
      <div className="text-center py-10 font-bold text-[#023915]">
        🔄 Retrieving product details for checkout...
      </div>
    );
  }

  if (orderComplete) {
    const isCod = orderComplete.method === "COD" || formData.paymentMethod === "cod";
    const isOrderCodVerified = codVerified || orderComplete.codVerified === true;
    const cleanPhone = (orderComplete?.phone || formData.phone || "").replace(/\D/g, "").slice(-10);
    const orderTotal = orderComplete.total ?? total;

    return (
      <div className="mx-auto max-w-xl py-4 sm:py-8">
        <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 shadow-sm text-center">
          {isCod && !isOrderCodVerified ? (
            <div>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-700 mb-4 animate-pulse">
                <Clock className="size-8" />
              </div>
              <span className="inline-block text-[11px] font-black uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-full mb-2">
                Order Received • 1 Final Step
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-neutral-900">Confirm Cash on Delivery</h2>
              <p className="mt-2 text-xs sm:text-sm text-gray-600">
                Order ID: <b className="text-[#023915]">#{orderComplete.orderId}</b>
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Amount payable on delivery: <b className="text-neutral-900">₹{orderTotal}</b> (COD)
              </p>

              {/* COD Verification Card */}
              <div className="mt-6 rounded-2xl bg-[#f0fdf4] border-2 border-dashed border-[#86efac] p-5 text-left">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xs">
                    <MessageSquare className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-emerald-950">
                      Enter 6-digit WhatsApp OTP to Confirm Dispatch
                    </h3>
                    <p className="mt-1 text-xs text-emerald-800 leading-relaxed">
                      We have sent a 6-digit verification code to your WhatsApp on <b className="text-emerald-950">+91 {cleanPhone}</b>. Please enter the OTP to confirm your delivery address and schedule priority dispatch.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleVerifyCodOtp} className="mt-5 space-y-3">
                  <div>
                    <input
                      type="text"
                      maxLength={6}
                      autoFocus
                      required
                      value={codOtpInput}
                      onChange={(e) => setCodOtpInput(e.target.value.replace(/\D/g, ""))}
                      placeholder="• • • • • •"
                      className="w-full text-center tracking-[0.35em] text-2xl font-black rounded-xl border-2 border-emerald-400 bg-white px-4 py-3 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 text-gray-900 shadow-xs transition"
                    />
                  </div>

                  {codOtpError && (
                    <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                      <AlertCircle className="size-4 shrink-0 text-red-500" />
                      <span>{codOtpError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={codOtpVerifying || codOtpInput.trim().length !== 6}
                    className="w-full rounded-xl bg-[#023915] hover:bg-black py-3.5 text-xs font-black tracking-widest text-white shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {codOtpVerifying ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        <span>VERIFYING COD ORDER...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="size-4" />
                        <span>VERIFY & CONFIRM COD DELIVERY</span>
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-emerald-200/60">
                  <span className="text-gray-500 text-[11px]">Didn&apos;t receive the WhatsApp message?</span>
                  <button
                    type="button"
                    onClick={handleResendCodOtp}
                    disabled={!canResendCod || codOtpSending}
                    className="font-bold text-[#023915] hover:underline disabled:opacity-50 disabled:no-underline text-xs flex items-center gap-1 cursor-pointer"
                  >
                    {codOtpSending ? (
                      <Loader2 className="size-3 animate-spin" />
                    ) : canResendCod ? (
                      "Resend Code via WhatsApp"
                    ) : (
                      `Resend in ${codResendTimer}s`
                    )}
                  </button>
                </div>
              </div>

              {/* Order Info Saved Notice */}
              <div className="mt-5 p-3 rounded-xl bg-[#f5f5f5] border border-neutral-200 text-left">
                <p className="text-[11px] text-gray-600">
                  ℹ️ <b>Your order details have been recorded in our system.</b> If you are facing any difficulty with OTP verification, our team will call or message you on <b>+91 {cleanPhone}</b> before dispatching your package.
                </p>
              </div>
            </div>
          ) : (
            <div>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 mb-4">
                <CheckCircle2 className="size-10 text-[#023915]" />
              </div>
              <span className="inline-block text-[11px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full mb-2">
                {isCod ? "✓ Cash on Delivery Confirmed" : "✓ Payment & Order Confirmed"}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-neutral-900">Order Confirmed Successfully!</h2>
              <p className="mt-2 text-sm text-[#023915] font-bold">
                Order ID: #{orderComplete.orderId}
              </p>
              <p className="mt-2 text-xs sm:text-sm text-neutral-600 max-w-md mx-auto leading-relaxed">
                Thank you for choosing Pure Ayur Herbs. We have received your order details and scheduled priority packaging. Live tracking updates will be sent to <b>+91 {cleanPhone}</b> on WhatsApp.
              </p>

              {/* Delivery Details Pill */}
              <div className="mt-5 p-4 rounded-2xl bg-[#f5f5f5] border border-neutral-200 text-left text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-gray-500">Customer:</span>
                  <span className="font-bold text-neutral-900">{formData.name || "Customer"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Mobile:</span>
                  <span className="font-bold text-neutral-900">+91 {cleanPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Payment:</span>
                  <span className="font-bold text-[#023915]">
                    {isCod ? `Cash on Delivery (₹${orderTotal})` : `Prepaid Online (₹${orderTotal})`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Shipping:</span>
                  <span className="font-bold text-neutral-900">{formData.city}, {formData.state} ({formData.pincode})</span>
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="rounded-xl bg-[#023915] py-3.5 px-6 text-xs font-bold text-white transition hover:bg-black shadow-xs text-center"
            >
              CONTINUE SHOPPING
            </Link>
            <a
              href={`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(`Hi Pure Ayur Herbs team, I have a query about my Order #${orderComplete.orderId}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 py-3.5 px-6 text-xs font-bold text-emerald-900 transition flex items-center justify-center gap-2"
            >
              <MessageSquare className="size-4 text-[#25D366]" />
              <span>Contact Support on WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <form id="checkout-form" onSubmit={handleCheckoutSubmit} className="space-y-4 pb-24 md:pb-6">
        {/* Top Guest / Logged In Customer State */}
        {currentUser ? (
          <div className="rounded-2xl border border-neutral-200 bg-[#c2d4c5]/20 p-3.5 shadow-2xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="size-8 rounded-full bg-[#023915] text-white flex items-center justify-center font-bold text-xs shrink-0">
                <User className="size-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-bold text-neutral-900 truncate">
                    {currentUser.name || "Customer"}
                  </span>
                  <span className="text-[9px] bg-[#023915]/10 text-[#023915] font-bold px-1.5 py-0.2 rounded-full">
                    Verified
                  </span>
                </div>
                <p className="text-[10px] text-neutral-500 truncate">
                  {currentUser.phone ? `+91 ${currentUser.phone}` : ""} {currentUser.email ? `• ${currentUser.email}` : ""}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleCheckoutSignOut}
              className="text-[11px] text-red-600 hover:text-red-700 font-bold px-2.5 py-1 rounded-lg border border-red-200 bg-white hover:bg-red-50 transition shrink-0 cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="rounded-xl border border-neutral-200 bg-[#f5f5f5] px-3.5 py-2.5 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-bold text-neutral-800">
              <span className="text-amber-600 font-black">⚡</span>
              <span>Express Checkout • Instant Guest or Account</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsCheckoutSignup(false);
                setLoginError("");
                setLoginSuccessMsg("");
                setInCheckoutLoginOpen(true);
              }}
              className="rounded-lg border border-neutral-300 bg-white px-3 py-1 text-xs font-bold text-neutral-800 hover:border-[#023915] hover:text-[#023915] transition shrink-0 cursor-pointer shadow-2xs"
            >
              Log In
            </button>
          </div>
        )}

        {/* STEP 1: MOBILE NUMBER & CONTACT (with 1-Click OTP / Quick Verify) */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <div className="size-6 rounded-full bg-[#023915] text-white flex items-center justify-center text-xs font-bold">
                1
              </div>
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-900">
                Mobile Number &amp; Contact
              </h3>
            </div>
            {!currentUser && (
              <button
                type="button"
                onClick={() => {
                  setIsCheckoutSignup(false);
                  setLoginError("");
                  setLoginSuccessMsg("");
                  setInCheckoutLoginOpen(true);
                }}
                className="text-[11px] font-bold text-[#023915] hover:underline cursor-pointer"
              >
                1-Click OTP Login
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-neutral-900 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Full Name"
                className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs text-neutral-900 outline-none focus:border-[#023915] bg-white font-medium transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-900 mb-1">Mobile Number</label>
              <div className="flex rounded-xl border border-neutral-200 bg-white overflow-hidden focus-within:border-[#023915] transition">
                <span className="bg-[#f5f5f5] text-neutral-600 text-xs font-bold px-2.5 py-2 flex items-center border-r border-neutral-200 select-none shrink-0">
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
                  }}
                  placeholder="10-digit mobile"
                  className="flex-1 px-2.5 py-2 text-xs outline-none bg-transparent text-neutral-900 min-w-0 font-medium font-mono"
                />
              </div>
            </div>
          </div>

          <div className="mt-3">
            <label className="block text-xs font-bold text-neutral-900 mb-1">
              Email <span className="text-neutral-400 font-normal text-[11px]">(Optional for invoice &amp; tracking)</span>
            </label>
            <input
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs text-neutral-900 outline-none focus:border-[#023915] bg-white font-medium transition"
            />
          </div>
        </div>

        {/* STEP 2: DELIVERY ADDRESS */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <div className="size-6 rounded-full bg-[#023915] text-white flex items-center justify-center text-xs font-bold">
                2
              </div>
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-900">
                Delivery Address
              </h3>
            </div>
            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={detectingLocation}
              className="flex items-center gap-1 text-[11px] font-bold text-[#023915] hover:text-black transition disabled:opacity-50 cursor-pointer"
            >
              <MapPin className="size-3 text-[#023915]" />
              <span>{detectingLocation ? "Detecting..." : "Auto-Detect"}</span>
            </button>
          </div>

          <div>
            <label className="text-xs font-bold text-neutral-900 block mb-1">Complete Address</label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="House / Flat No., Building, Street, Area"
              className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs text-neutral-900 outline-none focus:border-[#023915] bg-white font-medium transition"
            />
            {locationError && (
              <p className="mt-1 text-[10px] text-red-500 font-bold flex items-center gap-1 animate-pulse">
                <span>⚠️</span>
                <span>{locationError}</span>
              </p>
            )}
          </div>

          <div className="mt-3">
            <label className="block text-xs font-bold text-neutral-900 mb-1">
              Landmark <span className="text-neutral-400 font-normal text-[11px]">(Optional)</span>
            </label>
            <input
              type="text"
              value={formData.landmark}
              onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
              placeholder="e.g. Near Temple, Behind Bank"
              className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs text-neutral-900 outline-none focus:border-[#023915] bg-white font-medium transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <label className="block text-xs font-bold text-neutral-900 mb-1">Pincode</label>
              <input
                type="text"
                required
                maxLength={6}
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, "") })}
                placeholder="6-digit PIN code"
                className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs text-neutral-900 outline-none focus:border-[#023915] bg-white font-medium font-mono transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-900 mb-1">City</label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="City"
                className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs text-neutral-900 outline-none focus:border-[#023915] bg-white font-medium transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <label className="block text-xs font-bold text-neutral-900 mb-1">State</label>
              <input
                type="text"
                required
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="State"
                className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs text-neutral-900 outline-none focus:border-[#023915] bg-white font-medium transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-900 mb-1">Country</label>
              <input
                type="text"
                readOnly
                value="India"
                className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs text-neutral-700 bg-[#f5f5f5] font-medium outline-none select-none cursor-default"
              />
            </div>
          </div>
        </div>

        {/* STEP 3: PAYMENT METHOD (COD vs UPI/Prepaid) */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-neutral-100">
            <div className="size-6 rounded-full bg-[#023915] text-white flex items-center justify-center text-xs font-bold">
              3
            </div>
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-900">
              Payment Method
            </h3>
          </div>

          {codBlocked && (
            <div className="mb-3 rounded-xl bg-amber-50 border border-amber-300 p-2.5 text-xs text-amber-900 flex items-start gap-2">
              <AlertCircle className="size-4 text-amber-600 shrink-0 mt-0.5" />
              <span className="text-[11px] text-amber-800 leading-tight">
                {codBlockReason} Please complete your purchase using secure Online Payment.
              </span>
            </div>
          )}

          <div className="space-y-2.5">
            {/* Cash on Delivery (₹0 Fee) */}
            <button
              type="button"
              disabled={codBlocked}
              onClick={() => {
                if (!codBlocked) setFormData({ ...formData, paymentMethod: "cod" });
              }}
              className={`w-full rounded-xl p-3.5 text-left transition flex items-center justify-between cursor-pointer ${
                codBlocked
                  ? "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed"
                  : formData.paymentMethod === "cod"
                  ? "border-2 border-[#023915] bg-[#c2d4c5]/15 shadow-2xs"
                  : "border border-neutral-200 bg-white hover:border-neutral-400"
              }`}
            >
              <div className="flex items-center gap-3">
                {formData.paymentMethod === "cod" ? (
                  <div className="size-5 rounded-full bg-[#023915] text-white flex items-center justify-center shrink-0">
                    <Check className="size-3 stroke-[3]" />
                  </div>
                ) : (
                  <div className="size-5 rounded-full border border-neutral-300 bg-white shrink-0" />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-neutral-900">Cash on Delivery</span>
                    <span className="text-[10px] font-bold text-[#023915] bg-[#c2d4c5]/30 px-1.5 py-0.2 rounded">
                      ₹0 Fee
                    </span>
                    {codBlocked && (
                      <span className="rounded bg-red-100 px-1.5 py-0.2 text-[9px] font-bold text-red-700 uppercase">
                        Unavailable
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-neutral-500 block mt-0.5">Pay with cash upon delivery</span>
                </div>
              </div>
            </button>

            {/* UPI / Online Payment (5% Extra Discount) */}
            <button
              type="button"
              onClick={() => setFormData({ ...formData, paymentMethod: "prepaid" })}
              className={`w-full rounded-xl p-3.5 text-left transition flex items-center justify-between cursor-pointer ${
                formData.paymentMethod === "prepaid"
                  ? "border-2 border-[#023915] bg-[#c2d4c5]/15 shadow-2xs"
                  : "border border-neutral-200 bg-white hover:border-neutral-400"
              }`}
            >
              <div className="flex items-center gap-3">
                {formData.paymentMethod === "prepaid" ? (
                  <div className="size-5 rounded-full bg-[#023915] text-white flex items-center justify-center shrink-0">
                    <Check className="size-3 stroke-[3]" />
                  </div>
                ) : (
                  <div className="size-5 rounded-full border border-neutral-300 bg-white shrink-0" />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-neutral-900">UPI / Cards / Net Banking</span>
                    {Number(settings?.prepaidDiscount) > 0 && (
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                        {settings.prepaidDiscount}% Extra Discount
                      </span>
                    )}
                  </div>
                  {Number(settings?.prepaidDiscount) > 0 ? (
                    <span className="text-[11px] text-emerald-800 font-semibold block mt-0.5">
                      Instant 1-Click Pay • Save ₹{prepaidDiscountValue}
                    </span>
                  ) : (
                    <span className="text-[11px] text-neutral-500 font-normal block mt-0.5">
                      Instant 1-Click Pay
                    </span>
                  )}
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* STEP 4: ORDER SUMMARY & FREE SHIPPING */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <div className="size-6 rounded-full bg-[#023915] text-white flex items-center justify-center text-xs font-bold">
                4
              </div>
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-900">
                Order Summary &amp; Free Shipping
              </h3>
            </div>
            <span className="text-[10px] font-bold uppercase bg-[#c2d4c5] text-[#023915] px-2 py-0.5 rounded-full">
              Free Shipping
            </span>
          </div>

          <div className="flex items-center gap-3 py-1">
            <div className="size-14 rounded-xl border border-neutral-200 overflow-hidden bg-white shrink-0 flex items-center justify-center">
              <Image
                src={product.image}
                alt={product.name}
                width={56}
                height={56}
                unoptimized
                className="size-full object-contain"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-neutral-900 line-clamp-1 uppercase">
                {product.name}
              </h4>
              <p className="text-xs text-neutral-500 mt-0.5 font-medium">
                Qty: {qty} • ₹{product.price * qty}
              </p>
            </div>
          </div>

          {/* Coupon Code Input */}
          <div className="mt-3 pt-3 border-t border-neutral-100">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter Coupon Code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="flex-1 rounded-xl border border-neutral-200 px-3 py-2 text-xs outline-none uppercase font-bold text-neutral-900 placeholder:text-neutral-400 focus:border-[#023915]"
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                className="rounded-xl bg-[#023915] px-4 py-2 text-xs font-bold text-white hover:bg-black transition cursor-pointer"
              >
                APPLY
              </button>
            </div>
            {couponError && <p className="text-[11px] text-red-500 font-bold mt-1">{couponError}</p>}
            {appliedCoupon && (
              <div className="mt-2 flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-300 p-2 text-xs text-emerald-900">
                <span className="font-bold text-[11px]">🎉 Coupon <b>{appliedCoupon.code}</b> applied! (-₹{couponDiscount})</span>
                <button
                  type="button"
                  onClick={() => {
                    setAppliedCoupon(null);
                    setCouponCode("");
                    if (typeof window !== "undefined") localStorage.removeItem("pyur_applied_coupon");
                  }}
                  className="text-red-600 hover:text-red-800 text-[10px] font-bold uppercase underline ml-2 cursor-pointer"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* Coins Toggle */}
          {coinsEnabled && currentUser && userCoins >= minCoinsToRedeem && maxDiscountInRupees > 0 && (
            <div className="mt-2.5 flex items-center justify-between rounded-xl bg-amber-50 border border-amber-200 p-2.5">
              <div className="text-[11px] text-amber-950 font-medium">
                <span>🪙 Redeem <b>{coinsToRedeem} Coins</b> (Save ₹{maxDiscountInRupees})</span>
              </div>
              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-amber-950">
                <input
                  type="checkbox"
                  checked={redeemCoins}
                  onChange={(e) => setRedeemCoins(e.target.checked)}
                  className="accent-[#023915]"
                />
                <span>Apply</span>
              </label>
            </div>
          )}

          {/* Pricing Breakdown */}
          <div className="mt-3 pt-3 border-t border-neutral-100 space-y-1.5 text-xs">
            <div className="flex justify-between text-neutral-600">
              <span>Subtotal</span>
              <span className="font-bold text-neutral-900">₹{subtotal}</span>
            </div>
            {prepaidDiscount > 0 && (
              <div className="flex justify-between text-emerald-800 font-bold">
                <span>{settings.prepaidDiscount}% Online Payment Discount</span>
                <span>-₹{prepaidDiscount}</span>
              </div>
            )}
            {couponDiscount > 0 && (
              <div className="flex justify-between text-emerald-800 font-bold">
                <span>Coupon ({appliedCoupon.code}) Discount</span>
                <span>-₹{couponDiscount}</span>
              </div>
            )}
            {coinsDiscount > 0 && (
              <div className="flex justify-between text-amber-700 font-bold">
                <span>Pure Coins Redeemed</span>
                <span>-₹{coinsDiscount}</span>
              </div>
            )}
            <div className="flex justify-between text-neutral-600">
              <span>Shipping Fee</span>
              <span className="font-bold text-[#023915]">{shipping === 0 ? "FREE" : `₹${shipping}`}</span>
            </div>
            <div className="border-t border-neutral-200 mt-2 pt-2 flex justify-between items-baseline">
              <span className="text-sm font-bold text-neutral-900">Total Payable</span>
              <span className="text-lg font-black text-neutral-900">₹{total}</span>
            </div>
          </div>
        </div>

        {/* TRUST BADGES */}
        <div className="flex items-center justify-center gap-4 text-[11px] font-bold text-neutral-500 py-1">
          <div className="flex items-center gap-1.5">
            <Lock className="size-3.5 text-[#023915]" />
            <span>100% Encrypted Transactions</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Truck className="size-3.5 text-[#023915]" />
            <span>Fast Insured Shipment</span>
          </div>
        </div>

        {/* IN-PAGE ORDER BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-[#023915] hover:bg-black py-4 text-xs sm:text-sm font-bold uppercase tracking-wider text-white shadow-lg active:scale-[0.99] transition cursor-pointer flex items-center justify-center gap-2"
        >
          <span>{loading ? "PROCESSING..." : `PLACE ORDER - ₹${total} (${formData.paymentMethod === "cod" ? "COD" : "ONLINE"})`}</span>
        </button>
      </form>

      {/* MOBILE STICKY FLOATING ORDER BUTTON */}
      <aside
        aria-label="Mobile Sticky Order Bar"
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200 p-3 md:hidden shadow-[0_-4px_25px_rgba(0,0,0,0.12)]"
      >
        <button
          type="button"
          onClick={() => {
            const form = document.getElementById("checkout-form") as HTMLFormElement;
            if (form) form.requestSubmit();
          }}
          disabled={loading}
          className="w-full rounded-xl bg-[#023915] hover:bg-black py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-white shadow-md active:scale-98 transition flex items-center justify-center cursor-pointer"
        >
          <span>{loading ? "PROCESSING..." : `PLACE ORDER - ₹${total} (${formData.paymentMethod === "cod" ? "COD" : "ONLINE"})`}</span>
        </button>
      </aside>


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
              className="absolute right-4 top-4 rounded-full p-1 text-neutral-500 hover:bg-neutral-100 transition"
            >
              <X className="size-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-1">
              <div className="h-9 w-9 rounded-full bg-[#023915]/10 text-[#023915] flex items-center justify-center">
                {isCheckoutSignup ? <UserPlus className="size-5" /> : <LogIn className="size-5" />}
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900">
                  {isCheckoutSignup ? "Create Pure Ayur Account" : "Sign In to Pure Ayur Herbs"}
                </h3>
                <p className="text-[11px] text-neutral-500">
                  {isCheckoutSignup
                    ? "Get 50 bonus Pure Coins & save your delivery address"
                    : "Access saved addresses & redeem Pure Coins"}
                </p>
              </div>
            </div>

            {/* Login / Sign Up Mode Tabs */}
            <div className="mt-4 flex rounded-xl bg-neutral-100 p-1">
              <button
                type="button"
                onClick={() => {
                  setInCheckoutLoginMode("whatsapp");
                  setLoginError("");
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
                  inCheckoutLoginMode === "whatsapp"
                    ? "bg-white text-[#023915] shadow-xs"
                    : "text-neutral-600 hover:text-neutral-900"
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
                    ? "bg-white text-[#023915] shadow-xs"
                    : "text-neutral-600 hover:text-neutral-900"
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
                  <label className="block text-xs font-bold text-neutral-900 mb-1">Mobile Number</label>
                  <div className="flex rounded-xl border border-neutral-300 bg-white overflow-hidden focus-within:border-[#023915] transition">
                    <span className="bg-[#f5f5f5] text-neutral-600 text-xs font-bold px-3 py-2 flex items-center border-r border-neutral-200">
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
                    <label className="block text-xs font-bold text-neutral-900 mb-1">
                      Your Full Name{" "}
                      {isCheckoutSignup ? (
                        <span className="text-red-500">*</span>
                      ) : (
                        <span className="text-neutral-400 font-normal">(Optional)</span>
                      )}
                    </label>
                    <input
                      type="text"
                      required={isCheckoutSignup}
                      value={loginPhoneName}
                      onChange={(e) => setLoginPhoneName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-xs outline-none focus:border-[#023915]"
                    />
                  </div>
                )}

                {loginOtpSent && (
                  <div>
                    <label className="block text-xs font-bold text-neutral-900 mb-1">Enter 6-digit WhatsApp Code</label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      autoFocus
                      value={loginOtp}
                      onChange={(e) => setLoginOtp(e.target.value.replace(/\D/g, ""))}
                      placeholder="XXXXXX"
                      className="w-full tracking-[0.25em] text-center font-bold text-lg rounded-xl border-2 border-emerald-400 px-3 py-2 outline-none focus:border-emerald-600"
                    />
                    <div className="mt-1 flex justify-between items-center">
                      <button
                        type="button"
                        onClick={handleSendInCheckoutWhatsAppOtp}
                        disabled={loginLoading}
                        className="text-[11px] text-[#023915] hover:underline font-semibold"
                      >
                        Resend Code
                      </button>
                      <button
                        type="button"
                        onClick={() => setLoginOtpSent(false)}
                        className="text-[11px] text-neutral-500 hover:underline"
                      >
                        Change Number
                      </button>
                    </div>
                  </div>
                )}

                {isCheckoutSignup && !loginOtpSent && (
                  <div className="rounded-xl bg-[#023915]/5 border border-[#023915]/15 p-2 text-[11px] font-semibold text-[#023915] flex items-center gap-1.5">
                    <Sparkles className="size-3.5 shrink-0 text-amber-500" />
                    <span>Instant account setup via WhatsApp OTP • 50 Pure Coins bonus</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full rounded-xl bg-[#023915] py-3 text-xs font-bold tracking-wider text-white hover:bg-black transition disabled:opacity-50 flex items-center justify-center gap-2"
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
                  <label className="block text-xs font-bold text-neutral-900 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-xs outline-none focus:border-[#023915]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-900 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-xs outline-none focus:border-[#023915]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-900 mb-1">Mobile Number</label>
                  <div className="flex rounded-xl border border-neutral-300 bg-white overflow-hidden focus-within:border-[#023915] transition">
                    <span className="bg-[#f5f5f5] text-neutral-600 text-xs font-bold px-3 py-2 flex items-center border-r border-neutral-200">
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
                  <label className="block text-xs font-bold text-neutral-900 mb-1">Password</label>
                  <div className="relative">
                    <input
                      type={signupShowPassword ? "text" : "password"}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Min 8 chars (Uppercase, Lowercase, Number & Symbol)"
                      className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-xs outline-none focus:border-[#023915] pr-9"
                    />
                    <button
                      type="button"
                      onClick={() => setSignupShowPassword(!signupShowPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                    >
                      {signupShowPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  <p className="mt-1 text-[10px] text-neutral-500">
                    Must be 8+ chars with uppercase, lowercase, number & special char.
                  </p>
                </div>
                <div className="rounded-xl bg-[#023915]/5 border border-[#023915]/15 p-2 text-[11px] font-semibold text-[#023915] flex items-center gap-1.5">
                  <Sparkles className="size-3.5 shrink-0 text-amber-500" />
                  <span>🎁 50 Pure Coins will be added to your account instantly!</span>
                </div>
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full rounded-xl bg-[#023915] py-3 text-xs font-bold tracking-wider text-white hover:bg-black transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loginLoading ? <Loader2 className="size-4 animate-spin" /> : "CREATE ACCOUNT & CONTINUE"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleInCheckoutEmailLogin} className="mt-4 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-900 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-xs outline-none focus:border-[#023915]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-900 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-xs outline-none focus:border-[#023915]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full rounded-xl bg-[#023915] py-3 text-xs font-bold tracking-wider text-white hover:bg-black transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loginLoading ? <Loader2 className="size-4 animate-spin" /> : "SIGN IN"}
                </button>
              </form>
            )}

            <div className="mt-5 pt-3 border-t border-neutral-100 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1.5 text-[11px] text-neutral-500 text-center">
              <span>
                Prefer to checkout quickly?{" "}
                <button
                  type="button"
                  onClick={() => setInCheckoutLoginOpen(false)}
                  className="font-bold text-[#023915] hover:underline"
                >
                  Continue as Guest
                </button>
              </span>
              <span className="text-neutral-300">|</span>
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
                    className="font-bold text-[#023915] hover:underline"
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
                    className="font-bold text-[#023915] hover:underline"
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
    <main className="min-h-screen bg-[#f8f9fa] md:bg-white text-neutral-900 antialiased">
      {/* Mobile Top Header: Header with lock icon: "100% Secure Checkout" */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-200 px-4 py-3 flex items-center justify-between md:hidden shadow-2xs relative">
        <button
          type="button"
          onClick={() => {
            if (typeof window !== "undefined" && window.history.length > 1) {
              window.history.back();
            } else {
              window.location.href = "/";
            }
          }}
          className="p-1 -ml-1 text-neutral-700 hover:text-black cursor-pointer z-10"
          aria-label="Back"
        >
          <ArrowLeft className="size-5" />
        </button>
        <h1 className="text-sm sm:text-base font-bold text-neutral-900 tracking-tight flex items-center justify-center gap-1.5 absolute inset-x-0 mx-auto w-fit pointer-events-none">
          <Lock className="size-4 text-[#023915]" />
          <span>100% Secure Checkout</span>
        </h1>
        <div className="w-6 z-10" />
      </header>

      {/* Desktop Top Header */}
      <div className="hidden md:block bg-white text-neutral-900 py-3.5 border-b border-neutral-200">
        <div className="mx-auto max-w-[1280px] px-6 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-neutral-700 hover:text-[#023915] transition">
            <ArrowLeft className="size-4" />
            <span>Continue Shopping</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-base font-extrabold uppercase tracking-wider text-[#023915]">PURE AYUR</span>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#80a03c]">HERBS</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#023915] bg-[#c2d4c5]/25 px-3 py-1 rounded-full border border-[#023915]/20">
            <Lock className="size-3.5" />
            <span>100% Secure Checkout</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[560px] px-3.5 py-4 md:py-8">
        <Suspense fallback={<div className="text-center py-10 font-bold text-[#023915]">🔄 Loading Checkout details...</div>}>
          <CheckoutForm />
        </Suspense>
      </div>
    </main>
  );
}
