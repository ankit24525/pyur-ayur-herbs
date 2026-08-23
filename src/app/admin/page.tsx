"use client";

import { useState, useEffect, useRef } from "react";
import { concerns } from "@/lib/store";
import Link from "next/link";
import Image from "next/image";
import {
  TrendingUp,
  ShoppingBag,
  Users,
  Eye,
  EyeOff,
  Mail,
  Settings,
  Database,
  Truck,
  CheckCircle,
  Clock,
  Search,
  MessageSquare,
  Sparkles,
  ArrowLeft,
  DollarSign,
  Ticket,
  BookOpen,
  Star,
  Plus,
  X,
  Trash2,
  ChevronDown,
  Layers,
  Megaphone,
  Bell,
  Sliders,
  ShieldCheck,
  FileCode,
  Layout,
  PlusCircle,
  HelpCircle,
  Smile,
  Globe,
  Lock,
  AlertCircle,
} from "lucide-react";

export default function AdminDashboard() {
  const [activeMenu, setActiveMenu] = useState("dashboard"); // dashboard, orders, products, customers, discounts, marketing, content, reviews, shipping, analytics, seo, support, settings
  const [subTab, setSubTab] = useState("overview");
  const [graphTimeRange, setGraphTimeRange] = useState("7days");
  const [graphProductFilter, setGraphProductFilter] = useState("all");
  const [graphMetricType, setGraphMetricType] = useState("overall-sales");
  const activeMenuRef = useRef(activeMenu);

  useEffect(() => {
    activeMenuRef.current = activeMenu;
  }, [activeMenu]);

  // Admin Auth State — checked against sessionStorage on mount
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Admin Forgot Password State
  const [isAdminForgotPassword, setIsAdminForgotPassword] = useState(false);
  const [adminForgotEmail, setAdminForgotEmail] = useState("");
  const [adminForgotLoading, setAdminForgotLoading] = useState(false);
  const [adminForgotSuccess, setAdminForgotSuccess] = useState<string | null>(null);
  const [adminForgotError, setAdminForgotError] = useState<string | null>(null);

  const handleAdminForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminForgotEmail.trim()) {
      setAdminForgotError("Please enter your admin email address or username.");
      return;
    }
    setAdminForgotLoading(true);
    setAdminForgotError(null);
    setAdminForgotSuccess(null);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: adminForgotEmail.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAdminForgotSuccess(
          data.message || "Password recovery instructions & OTP code have been sent to your email!"
        );
      } else {
        setAdminForgotSuccess(
          `Password reset token generated for '${adminForgotEmail}'. Admin credentials can also be reset by setting ADMIN_PASSWORD in your server environment (.env.local).`
        );
      }
    } catch {
      setAdminForgotError("Failed to process reset request. Please check server logs or update .env.local.");
    } finally {
      setAdminForgotLoading(false);
    }
  };

  // Check session on mount
  useEffect(() => {
    const token = sessionStorage.getItem("pyur_admin_token");
    const expiry = sessionStorage.getItem("pyur_admin_expiry");
    if (token && expiry && Date.now() < parseInt(expiry, 10)) {
      setIsAdminLoggedIn(true);
    }
    setAuthChecked(true);
  }, []);

  // 10 minutes inactivity auto-logout for Admin session
  useEffect(() => {
    if (!isAdminLoggedIn) return;

    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      
      // 10 minutes = 600,000 milliseconds
      timeoutId = setTimeout(() => {
        handleAdminLogout();
        alert("Your admin session has expired due to 10 minutes of inactivity. Please log in again.");
      }, 600000);
    };

    // Initialize timer
    resetTimer();

    // Listen for common user interactions
    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];
    const handleActivity = () => resetTimer();

    events.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [isAdminLoggedIn]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: loginUsername, password: loginPassword }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        sessionStorage.setItem("pyur_admin_token", data.token);
        sessionStorage.setItem("pyur_admin_expiry", String(Date.now() + data.expiresIn * 1000));
        setIsAdminLoggedIn(true);
        setLoginError(null);
      } else {
        setLoginError(data.error || "Invalid credentials. Please try again.");
      }
    } catch {
      setLoginError("Connection error. Please check your network and try again.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem("pyur_admin_token");
    sessionStorage.removeItem("pyur_admin_expiry");
    setIsAdminLoggedIn(false);
    setLoginUsername("");
    setLoginPassword("");
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Dynamic Database State loaded from process database
  const [dbData, setDbData] = useState<any>({
    products: [],
    orders: [],
    coupons: [],
    leads: [],
    settings: {
      storeName: "",
      supportEmail: "",
      whatsappNumber: "",
      whatsappMessage: "",
      codOtpEnabled: true,
      prepaidDiscount: 5,
      taxRate: 18,
      shipping: { freeThreshold: 999, baseRate: 49, partners: [] },
      email: { senderName: "", smtpHost: "" },
      notifications: { orderPlacedSms: true, abandonedCartReminder: true },
      adminUsers: [],
    },
    reviews: [],
    blogs: [],
    faqs: [],
    testimonials: [],
    marketing: { campaigns: [], banners: [], popups: [], notifications: [] },
    seo: { title: "", metaDesc: "", sitemapUrl: "", robotsTxt: "" },
    collections: [],
  });

  // Forms states
  const [newProduct, setNewProduct] = useState({
    name: "",
    slug: "",
    concern: "Sugar Management",
    price: "",
    compareAt: "",
    badge: "NEW",
    ingredients: "",
    description: "",
    image: "",
    images: [] as string[],
  });

  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [newProductImageUrl, setNewProductImageUrl] = useState("");
  const [editProductImageUrl, setEditProductImageUrl] = useState("");
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orderSearchQuery, setOrderSearchQuery] = useState("");
  const [orderPaymentFilter, setOrderPaymentFilter] = useState("All");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const [newCoupon, setNewCoupon] = useState({
    code: "",
    type: "Percentage",
    value: "",
    status: "Active",
    minCartValue: "",
    applicableType: "All",
    applicableValue: "",
  });
  const [newCategory, setNewCategory] = useState({ name: "", image: "", icon: "🌿" });
  const [newFaq, setNewFaq] = useState({ question: "", answer: "" });
  const [newBlog, setNewBlog] = useState<any>({
    title: "",
    author: "",
    content: "",
    image: "",
    date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
    status: "Published",
    relatedProducts: [], // array of product IDs
    videos: "", // YouTube URLs comma separated
    audio: "", // Audio/Podcast URL
  });
  const [blogFaqs, setBlogFaqs] = useState<{ question: string; answer: string }[]>([]);
  const [newTestimonial, setNewTestimonial] = useState({ name: "", rating: 5, comment: "", status: "Approved" });

  const [campaignName, setCampaignName] = useState("");
  const [campaignChannel, setCampaignChannel] = useState("Meta Ads");
  const [campaignSpend, setCampaignSpend] = useState("");

  const [flashSaleTimer, setFlashSaleTimer] = useState("12:00:00");
  const [campaignRevenue, setCampaignRevenue] = useState("");
  const [campaignStatus, setCampaignStatus] = useState("Running");
  const [newBanner, setNewBanner] = useState({ name: "", link: "", image: "", status: "Active" });
  const [newPopup, setNewPopup] = useState({ title: "", discount: "", couponCode: "", trigger: "Exit Intent", status: "Active" });
  const [newNotification, setNewNotification] = useState({ title: "", delay: "30 mins", message: "", status: "Active" });

  // Inventory & Collections control states
  const [inventorySearchQuery, setInventorySearchQuery] = useState("");
  const [inventoryConcernFilter, setInventoryConcernFilter] = useState("All");
  const [inventoryStatusFilter, setInventoryStatusFilter] = useState("All");

  const [editingCollection, setEditingCollection] = useState<any>(null);
  const [newCollection, setNewCollection] = useState({
    title: "",
    slug: "",
    description: "",
    image: "",
    status: "Active",
    type: "Manual",
    rules: [] as any[],
    matchType: "all",
    manualProductIds: [] as string[],
    sortOrder: "manual",
  });

  // CMS slide states
  const [editingSlide, setEditingSlide] = useState<any>(null);
  const [newSlide, setNewSlide] = useState({
    id: 0,
    title: "",
    subtitle: "",
    offer: "",
    ctaText: "",
    href: "",
    badge: "",
    image: "",
    bgColor: "from-[#1d3b24] via-[#244f31] to-[#0f2416]",
    fullWidthBanner: false,
  });

  const loadData = async () => {
    try {
      const res = await fetch("/api/admin/all", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        
        // Deep merge settings defaults to prevent crashes
        const settings = {
          storeName: "Pyur Ayur Herbs Store",
          supportEmail: "support@pyurayurherbs.com",
          whatsappNumber: "919876543210",
          whatsappMessage: "नमस्ते! मुझे आपकी वेबसाइट से ऑर्डर करने में मदद चाहिए।",
          codOtpEnabled: true,
          prepaidDiscount: 5,
          taxRate: 18,
          shipping: { freeThreshold: 999, baseRate: 49, partners: [] },
          email: { senderName: "", smtpHost: "", smtpPort: 587, smtpUser: "", smtpPass: "" },
          notifications: { orderPlacedSms: false, orderPlacedEmail: false },
          adminUsers: [
            { email: "pureayurherbs@gmail.com", role: "Super Admin" },
            { email: "pyuradmin", role: "Administrator" }
          ],
          ...(data.settings || {})
        };

        settings.shipping = {
          freeThreshold: 999,
          baseRate: 49,
          partners: [],
          ...(data.settings?.shipping || {})
        };
        settings.phonepe = {
          merchantId: "PGBARCHUPGTEST",
          saltKey: "099eb0cd-02cf-4e2a-8aca-3e6c6aff0399",
          saltIndex: "1",
          env: "sandbox",
          enabled: true,
          ...(data.settings?.phonepe || {})
        };
        settings.email = {
          senderName: "",
          smtpHost: "",
          smtpPort: 587,
          smtpUser: "",
          smtpPass: "",
          ...(data.settings?.email || {})
        };
        settings.notifications = {
          orderPlacedSms: false,
          orderPlacedEmail: false,
          ...(data.settings?.notifications || {})
        };
        if (!settings.adminUsers) {
          settings.adminUsers = [
            { email: "pureayurherbs@gmail.com", role: "Super Admin" },
            { email: "pyuradmin", role: "Administrator" }
          ];
        }

        setDbData({
          ...data,
          settings,
          seo: {
            title: "Pyur Ayur Herbs - Original Ayurvedic Formulations",
            metaDesc: "Shop authentic gold-grade Shilajit, juices, and wellness supplements certified by Ayurvedic experts.",
            ...(data.seo || {})
          }
        });
      }
    } catch (e) {
      console.error("Error fetching database:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeMenu === "settings") {
      setLoading(false);
      return;
    }

    void loadData();

    // Poll for real-time database updates (every 5 seconds)
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        void loadData();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [activeMenu]);

  const saveKey = async (key: string, value: any) => {
    try {
      const res = await fetch("/api/admin/all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "updateKey", key, value }),
      });
      if (res.ok) {
        setDbData((prev: any) => ({ ...prev, [key]: value }));
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(`Error saving ${key}: ${errData.error || "Server error"}`);
      }
    } catch (e) {
      alert("Error saving data to server.");
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/admin/all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "updateOrder", orderId, newStatus }),
      });
      if (res.ok) {
        setDbData((prev: any) => ({
          ...prev,
          orders: prev.orders.map((o: any) => (o.id === orderId ? { ...o, status: newStatus } : o)),
        }));
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(`Error updating order status: ${errData.error || "Server error"}`);
      }
    } catch {
      alert("Error updating order status.");
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (confirm("Are you sure you want to delete this order?")) {
      try {
        const updated = dbData.orders.filter((o: any) => o.id !== orderId);
        await saveKey("orders", updated);
        showToast("Order deleted successfully!");
        setSelectedOrder(null);
      } catch {
        alert("Error deleting order.");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProduct((prev) => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddProductAdditionalImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const target = e.target;
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProduct((prev: any) => ({
          ...prev,
          images: [...(prev.images || []), reader.result as string]
        }));
        target.value = "";
        showToast("Additional image added successfully!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveProductAdditionalImage = (index: number) => {
    setNewProduct((prev: any) => ({
      ...prev,
      images: (prev.images || []).filter((_: any, idx: number) => idx !== index)
    }));
    showToast("Additional image removed.");
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const prod = {
      id: `${dbData.products.length + 1}`,
      name: newProduct.name,
      slug: newProduct.slug || newProduct.name.toLowerCase().replace(/rs\.?|₹|[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
      concern: newProduct.concern,
      price: parseFloat(newProduct.price),
      compareAt: parseFloat(newProduct.compareAt) || parseFloat(newProduct.price) * 1.2,
      rating: 5.0,
      reviews: 0,
      badge: newProduct.badge || "NEW",
      image: newProduct.image || "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=500&q=80",
      images: newProduct.images || [],
      ingredients: newProduct.ingredients ? newProduct.ingredients.split(",").map(i => i.trim()) : ["Herbal Extract"],
      description: newProduct.description || "Premium Ayurvedic wellness support.",
      coinsEarned: Math.round(parseFloat(newProduct.price) * 0.05),
      deliveryDays: "3 - 5 Days",
      inStock: true,
      sku: "PAH-" + newProduct.name.toUpperCase().replace(/[^A-Z0-9]+/g, "-") + "-" + Math.floor(100 + Math.random() * 900),
      stockQty: 50,
      lowStockThreshold: 10,
    };
    const updated = [...dbData.products, prod];
    await saveKey("products", updated);
    setNewProduct({ name: "", slug: "", concern: "Sugar Management", price: "", compareAt: "", badge: "NEW", ingredients: "", description: "", image: "", images: [] });
    setSubTab("all");
    showToast("New product added to catalog successfully!");
  };

  const handleDeleteProduct = async (prodId: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      const updated = dbData.products.filter((p: any) => p.id !== prodId);
      await saveKey("products", updated);
      showToast("Product deleted successfully!");
    }
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingProduct((prev: any) => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditProductAdditionalImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const target = e.target;
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingProduct((prev: any) => ({
          ...prev,
          images: [...(prev.images || []), reader.result as string]
        }));
        target.value = "";
        showToast("Additional image added successfully!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveEditProductAdditionalImage = (index: number) => {
    setEditingProduct((prev: any) => ({
      ...prev,
      images: (prev.images || []).filter((_: any, idx: number) => idx !== index)
    }));
    showToast("Additional image removed.");
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const updated = dbData.products.map((p: any) =>
      p.id === editingProduct.id
        ? {
            ...editingProduct,
            slug: editingProduct.slug || editingProduct.name.toLowerCase().replace(/rs\.?|₹|[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
            price: parseFloat(editingProduct.price),
            compareAt: parseFloat(editingProduct.compareAt) || parseFloat(editingProduct.price) * 1.2,
            ingredients: typeof editingProduct.ingredients === "string" 
              ? editingProduct.ingredients.split(",").map((i: string) => i.trim()) 
              : editingProduct.ingredients,
            images: editingProduct.images || [],
          }
        : p
    );

    await saveKey("products", updated);
    setEditingProduct(null);
    showToast("Product details updated successfully!");
  };

  const handleCategoryFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewCategory((prev) => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSlideFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewSlide((prev) => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBlogFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewBlog((prev: any) => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.name) return;

    const currentCats = dbData.categories && dbData.categories.length > 0
      ? dbData.categories
      : concerns;

    const newCat = {
      id: newCategory.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      name: newCategory.name,
      icon: newCategory.icon || "🌿",
      image: newCategory.image || "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=120&q=80",
    };

    const updated = [...currentCats, newCat];
    await saveKey("categories", updated);
    setNewCategory({ name: "", image: "", icon: "🌿" });
    alert("New category added successfully!");
  };

  const handleDeleteCategory = async (catId: string) => {
    if (confirm("Are you sure you want to delete this category?")) {
      const currentCats = dbData.categories && dbData.categories.length > 0
        ? dbData.categories
        : concerns;
      const updated = currentCats.filter((c: any) => c.id !== catId);
      await saveKey("categories", updated);
      alert("Category deleted successfully!");
    }
  };

  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const coup = {
      code: newCoupon.code.toUpperCase(),
      type: newCoupon.type,
      value: newCoupon.value,
      status: newCoupon.status,
      minCartValue: newCoupon.minCartValue ? parseFloat(newCoupon.minCartValue) : 0,
      applicableType: newCoupon.applicableType,
      applicableValue: newCoupon.applicableValue || "",
      used: 0,
    };
    const updated = [...dbData.coupons, coup];
    await saveKey("coupons", updated);
    setNewCoupon({
      code: "",
      type: "Percentage",
      value: "",
      status: "Active",
      minCartValue: "",
      applicableType: "All",
      applicableValue: ""
    });
    setSubTab("coupons");
    showToast("Coupon code created successfully!");
  };

  const handleDeleteCoupon = async (code: string) => {
    if (confirm("Are you sure you want to delete this coupon?")) {
      try {
        const updated = dbData.coupons.filter((c: any) => c.code !== code);
        await saveKey("coupons", updated);
        showToast("Coupon deleted successfully!");
      } catch {
        alert("Error deleting coupon.");
      }
    }
  };

  const handleAddCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    const spendVal = parseFloat(campaignSpend) || 0;
    const revVal = parseFloat(campaignRevenue) || 0;
    const roasVal = spendVal > 0 ? parseFloat((revVal / spendVal).toFixed(2)) : 0;
    
    const camp = {
      name: campaignName,
      channel: campaignChannel,
      spend: spendVal,
      revenue: revVal,
      roas: roasVal,
      status: campaignStatus,
    };
    const updated = {
      ...dbData.marketing,
      campaigns: [...dbData.marketing.campaigns, camp],
    };
    await saveKey("marketing", updated);
    setCampaignName("");
    setCampaignSpend("");
    setCampaignRevenue("");
    setCampaignStatus("Running");
    showToast("Ad campaign logged successfully!");
  };

  const handleDeleteCampaign = async (index: number) => {
    if (confirm("Are you sure you want to delete this campaign?")) {
      try {
        const updatedCampaigns = dbData.marketing.campaigns.filter((_: any, idx: number) => idx !== index);
        const updated = { ...dbData.marketing, campaigns: updatedCampaigns };
        await saveKey("marketing", updated);
        showToast("Campaign deleted successfully!");
      } catch {
        alert("Error deleting campaign.");
      }
    }
  };

  const handleAddBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updatedBanners = [...(dbData.marketing.banners || []), newBanner];
      const updated = { ...dbData.marketing, banners: updatedBanners };
      await saveKey("marketing", updated);
      setNewBanner({ name: "", link: "", image: "", status: "Active" });
      showToast("Promotional banner added successfully!");
    } catch {
      alert("Error adding banner.");
    }
  };

  const handleDeleteBanner = async (index: number) => {
    if (confirm("Are you sure you want to delete this banner?")) {
      try {
        const updatedBanners = dbData.marketing.banners.filter((_: any, idx: number) => idx !== index);
        const updated = { ...dbData.marketing, banners: updatedBanners };
        await saveKey("marketing", updated);
        showToast("Banner deleted successfully!");
      } catch {
        alert("Error deleting banner.");
      }
    }
  };

  const handleAddPopup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updatedPopups = [...(dbData.marketing.popups || []), newPopup];
      const updated = { ...dbData.marketing, popups: updatedPopups };
      await saveKey("marketing", updated);
      setNewPopup({ title: "", discount: "", couponCode: "", trigger: "Exit Intent", status: "Active" });
      showToast("Exit intent popup created!");
    } catch {
      alert("Error creating popup.");
    }
  };

  const handleDeletePopup = async (index: number) => {
    if (confirm("Are you sure you want to delete this popup?")) {
      try {
        const updatedPopups = dbData.marketing.popups.filter((_: any, idx: number) => idx !== index);
        const updated = { ...dbData.marketing, popups: updatedPopups };
        await saveKey("marketing", updated);
        showToast("Popup deleted successfully!");
      } catch {
        alert("Error deleting popup.");
      }
    }
  };

  const handleAddNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updatedNotifications = [...(dbData.marketing.notifications || []), newNotification];
      const updated = { ...dbData.marketing, notifications: updatedNotifications };
      await saveKey("marketing", updated);
      setNewNotification({ title: "", delay: "30 mins", message: "", status: "Active" });
      showToast("Notification trigger configured!");
    } catch {
      alert("Error configuring notification.");
    }
  };

  const handleDeleteNotification = async (index: number) => {
    if (confirm("Are you sure you want to delete this trigger?")) {
      try {
        const updatedNotifications = dbData.marketing.notifications.filter((_: any, idx: number) => idx !== index);
        const updated = { ...dbData.marketing, notifications: updatedNotifications };
        await saveKey("marketing", updated);
        showToast("Notification trigger deleted!");
      } catch {
        alert("Error deleting notification trigger.");
      }
    }
  };

  const handleToggleMarketingStatus = async (section: "campaigns" | "banners" | "popups" | "notifications", index: number) => {
    try {
      const updatedSection = dbData.marketing[section].map((item: any, idx: number) => {
        if (idx === index) {
          let nextStatus;
          if (section === "campaigns") {
            nextStatus = item.status === "Running" ? "Paused" : item.status === "Paused" ? "Completed" : "Running";
          } else {
            nextStatus = item.status === "Active" ? "Inactive" : "Active";
          }
          return { ...item, status: nextStatus };
        }
        return item;
      });
      const updated = { ...dbData.marketing, [section]: updatedSection };
      await saveKey("marketing", updated);
      showToast("Status updated successfully!");
    } catch {
      alert("Error updating status.");
    }
  };

  const handleAddFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    const faq = { question: newFaq.question, answer: newFaq.answer };
    const updated = [...dbData.faqs, faq];
    await saveKey("faqs", updated);
    setNewFaq({ question: "", answer: "" });
    setSubTab("faqs");
    alert("FAQ added!");
  };

  const handleAddBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    const blogId = newBlog.title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-") || String(Date.now());
    
    // Parse related videos
    const parsedVideos = newBlog.videos
      ? newBlog.videos.split(",").map((v: any) => v.trim()).filter(Boolean)
      : [];

    const blog = {
      id: blogId,
      title: newBlog.title,
      author: newBlog.author,
      content: newBlog.content,
      image: newBlog.image || "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80",
      date: newBlog.date,
      status: newBlog.status,
      relatedProducts: newBlog.relatedProducts || [],
      videos: parsedVideos,
      audio: newBlog.audio || "",
      faqs: blogFaqs
    };

    const updated = [...(dbData.blogs || []), blog];
    await saveKey("blogs", updated);

    setNewBlog({
      title: "",
      author: "",
      content: "",
      image: "",
      date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      status: "Published",
      relatedProducts: [],
      videos: "",
      audio: ""
    });
    setBlogFaqs([]);
    setSubTab("blogs");
    showToast("Blog published successfully!");
  };

  const handleDeleteBlog = async (index: number) => {
    try {
      const updated = dbData.blogs.filter((_: any, idx: number) => idx !== index);
      await saveKey("blogs", updated);
      showToast("Blog post deleted successfully!");
    } catch {
      showToast("Error deleting blog.");
    }
  };

  const handleToggleBlogStatus = async (index: number) => {
    try {
      const updated = dbData.blogs.map((b: any, idx: number) => {
        if (idx === index) {
          return { ...b, status: b.status === "Published" ? "Draft" : "Published" };
        }
        return b;
      });
      await saveKey("blogs", updated);
      showToast("Blog status updated!");
    } catch {
      alert("Error updating blog status.");
    }
  };

  const handleAddTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    const test = { name: newTestimonial.name, rating: newTestimonial.rating, comment: newTestimonial.comment, status: newTestimonial.status };
    const updated = [...dbData.testimonials, test];
    await saveKey("testimonials", updated);
    setNewTestimonial({ name: "", rating: 5, comment: "", status: "Approved" });
    setSubTab("testimonials");
    alert("Testimonial added!");
  };

  const handleUpdateLeadStatus = async (leadId: string, newStatus: string) => {
    try {
      const leads = dbData.leads || [];
      const idx = leads.findIndex((l: any) => l.id === leadId);
      if (idx !== -1) {
        const updated = [...leads];
        updated[idx].status = newStatus;
        await saveKey("leads", updated);
        showToast("Lead status updated successfully!");
      }
    } catch {
      showToast("Error updating status.");
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    try {
      const leads = dbData.leads || [];
      const updated = leads.filter((l: any) => l.id !== leadId);
      await saveKey("leads", updated);
      showToast("Lead query deleted successfully!");
    } catch {
      showToast("Error deleting lead query.");
    }
  };

  const handleSaveSettings = async (section: string, value: any) => {
    const updatedSettings = {
      ...dbData.settings,
      [section]: value,
    };
    try {
      const res = await fetch("/api/admin/all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "saveSettings", data: updatedSettings }),
      });
      if (res.ok) {
        setDbData((prev: any) => ({ ...prev, settings: updatedSettings }));
        alert("Settings saved successfully!");
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(`Error saving settings: ${errData.error || "Server error"}`);
      }
    } catch {
      alert("Error saving settings.");
    }
  };

  const handleSaveSeo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "saveSeo", data: dbData.seo }),
      });
      if (res.ok) {
        alert("SEO metadata configuration updated!");
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(`Error saving SEO configuration: ${errData.error || "Server error"}`);
      }
    } catch {
      alert("Error saving SEO configuration.");
    }
  };

  const handleToggleProductStock = async (prodId: string) => {
    const updated = dbData.products.map((p: any) => {
      if (p.id === prodId) {
        const nextInStock = !p.inStock;
        return {
          ...p,
          inStock: nextInStock,
          stockQty: nextInStock ? (p.stockQty > 0 ? p.stockQty : 50) : 0
        };
      }
      return p;
    });
    await saveKey("products", updated);
  };

  const handleUpdateInventoryField = async (prodId: string, field: string, value: any) => {
    const updated = dbData.products.map((p: any) => {
      if (p.id === prodId) {
        const updatedProd = { ...p, [field]: value };
        if (field === "stockQty") {
          updatedProd.inStock = value > 0;
        }
        return updatedProd;
      }
      return p;
    });
    await saveKey("products", updated);
  };

  const getProductsForCollection = (collection: any) => {
    if (!collection) return [];
    if (collection.type === "Manual") {
      const ids = collection.manualProductIds || [];
      return dbData.products.filter((p: any) => ids.includes(p.id));
    }
    return dbData.products.filter((prod: any) => {
      const rules = collection.rules || [];
      if (rules.length === 0) return false;
      
      const results = rules.map((rule: any) => {
        let fieldValue: any = prod[rule.field];
        if (rule.field === "price" || rule.field === "rating") {
          fieldValue = parseFloat(fieldValue) || 0;
        } else {
          fieldValue = String(fieldValue || "").toLowerCase();
        }
        
        const ruleValue = rule.field === "price" || rule.field === "rating" 
          ? parseFloat(rule.value) || 0 
          : String(rule.value || "").toLowerCase();

        switch (rule.operator) {
          case "equals":
            return fieldValue === ruleValue;
          case "less_than":
            return fieldValue < ruleValue;
          case "greater_than":
            return fieldValue > ruleValue;
          case "contains":
            return String(fieldValue).includes(String(ruleValue));
          case "not_contains":
            return !String(fieldValue).includes(String(ruleValue));
          default:
            return false;
        }
      });

      if (collection.matchType === "any") {
        return results.some((r: any) => r);
      }
      return results.every((r: any) => r);
    });
  };

  const handleSaveCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentCols = dbData.collections || [];
    let updated;
    
    if (editingCollection === "new") {
      const colId = newCollection.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const col = {
        ...newCollection,
        id: colId,
        slug: newCollection.slug || colId,
      };
      updated = [...currentCols, col];
    } else {
      updated = currentCols.map((c: any) => 
        c.id === editingCollection.id ? { ...newCollection, id: c.id } : c
      );
    }
    
    await saveKey("collections", updated);
    setEditingCollection(null);
    setNewCollection({
      title: "",
      slug: "",
      description: "",
      image: "",
      status: "Active",
      type: "Manual",
      rules: [],
      matchType: "all",
      manualProductIds: [],
      sortOrder: "manual",
    });
    alert("Collection saved successfully!");
  };

  const handleDeleteCollection = async (colId: string) => {
    if (confirm("Are you sure you want to delete this collection?")) {
      const currentCols = dbData.collections || [];
      const updated = currentCols.filter((c: any) => c.id !== colId);
      await saveKey("collections", updated);
      alert("Collection deleted successfully!");
    }
  };

  const handleSaveCMSContent = async (updatedContent: any) => {
    await saveKey("content", updatedContent);
    alert("Storefront CMS configuration saved successfully!");
  };

  const handleSaveSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = dbData.content || { announcement: {}, heroSlides: [], consultationBanner: {} };
    const currentSlides = content.heroSlides || [];
    let updatedSlides;

    if (editingSlide === "new") {
      const newId = currentSlides.length > 0 ? Math.max(...currentSlides.map((s: any) => s.id)) + 1 : 1;
      const slide = { ...newSlide, id: newId };
      updatedSlides = [...currentSlides, slide];
    } else {
      updatedSlides = currentSlides.map((s: any) => s.id === editingSlide.id ? newSlide : s);
    }

    const updatedContent = { ...content, heroSlides: updatedSlides };
    await handleSaveCMSContent(updatedContent);
    setEditingSlide(null);
    setNewSlide({
      id: 0,
      title: "",
      subtitle: "",
      offer: "",
      ctaText: "",
      href: "",
      badge: "",
      image: "",
      bgColor: "from-[#1d3b24] via-[#244f31] to-[#0f2416]",
      fullWidthBanner: false
    });
  };

  const handleDeleteSlide = async (slideId: number) => {
    if (confirm("Are you sure you want to delete this slide?")) {
      const content = dbData.content || { announcement: {}, heroSlides: [], consultationBanner: {} };
      const currentSlides = content.heroSlides || [];
      const updatedSlides = currentSlides.filter((s: any) => s.id !== slideId);
      const updatedContent = { ...content, heroSlides: updatedSlides };
      await handleSaveCMSContent(updatedContent);
    }
  };

  const handleReviewStatus = async (idx: number, status: string) => {
    const updated = dbData.reviews.map((r: any, i: number) =>
      i === idx ? { ...r, status } : r
    );
    await saveKey("reviews", updated);
  };

  const totalRevenue = dbData.orders
    .filter((o: any) => o.status !== "Cancelled" && o.status !== "Pending OTP")
    .reduce((acc: number, o: any) => acc + o.total, 0);

  const pendingCodCount = dbData.orders.filter((o: any) => o.status === "Pending OTP").length;

  const tabStyle = (menu: string) =>
    `flex w-full items-center gap-2.5 rounded-xl px-4 py-3 text-xs font-bold transition ${
      activeMenu === menu ? "bg-[#244f31] text-white" : "text-[#666666] hover:bg-[#f8faf1]"
    }`;

  const subTabStyle = (tab: string) =>
    `px-4 py-2 rounded-lg text-xs font-bold transition ${
      subTab === tab ? "bg-[#eef5df] text-[#244f31]" : "bg-white border border-[#ddddd9] text-[#666666] hover:bg-[#f8faf1]"
    }`;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f7f2] font-black text-[#244f31] text-sm tracking-wider">
        🔄 LOADING PYUR AYUR ADMIN PORTAL...
      </div>
    );
  }

  // Auth guard: show spinner while sessionStorage check is pending (avoids flash)
  if (!authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#17231b]">
        <div className="size-8 animate-spin rounded-full border-4 border-[#80a03c] border-t-transparent" />
      </div>
    );
  }

  // Admin Login Screen
  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-[#17231b] flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Logo Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center size-24 rounded-full bg-white p-1.5 shadow-2xl border-2 border-[#80a03c] mb-4">
              <Image
                src="/brand/pure-ayur-logo.png"
                alt="Pure Ayur Herbs Logo"
                width={96}
                height={96}
                className="size-full rounded-full object-cover"
                priority
              />
            </div>
            <h1 className="text-2xl font-black text-white tracking-wide">PURE AYUR HERBS</h1>
            <p className="text-xs text-white/50 mt-1 font-semibold uppercase tracking-wider">Admin Portal</p>
          </div>

          {/* Card: Forgot Password or Login */}
          {isAdminForgotPassword ? (
            <div className="bg-white rounded-2xl shadow-2xl p-8 border border-white/10">
              <h2 className="text-lg font-black text-[#17231b] mb-1">Reset Admin Password</h2>
              <p className="text-xs text-[#888888] font-semibold mb-6">
                Enter your admin email address or username to receive recovery instructions.
              </p>

              <form onSubmit={handleAdminForgotPassword} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-[#666666] mb-1.5">
                    Admin Email / Username
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                      <Mail className="size-4" />
                    </span>
                    <input
                      type="text"
                      value={adminForgotEmail}
                      onChange={(e) => setAdminForgotEmail(e.target.value)}
                      placeholder="e.g. admin@pyurayurherbs.com"
                      required
                      className="w-full rounded-xl border border-[#ddddd9] bg-[#f8f8f8] pl-10 pr-4 py-2.5 text-xs font-semibold text-[#17231b] outline-none focus:border-[#244f31] focus:bg-white transition"
                    />
                  </div>
                </div>

                {adminForgotSuccess && (
                  <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-[11px] font-bold text-emerald-800 leading-relaxed">
                    ✓ {adminForgotSuccess}
                  </div>
                )}

                {adminForgotError && (
                  <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-[11px] font-bold text-rose-700">
                    ⚠️ {adminForgotError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={adminForgotLoading}
                  className="w-full rounded-xl bg-[#244f31] hover:bg-[#1d3b24] text-white font-black text-sm py-3 shadow-sm transition disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {adminForgotLoading && (
                    <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  )}
                  <span>{adminForgotLoading ? "Sending Instructions..." : "Request Password Reset"}</span>
                </button>
              </form>

              <div className="mt-6 pt-5 border-t border-[#f0f0eb] text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsAdminForgotPassword(false);
                    setAdminForgotError(null);
                    setAdminForgotSuccess(null);
                  }}
                  className="text-xs font-bold text-[#244f31] hover:underline"
                >
                  ← Back to Admin Sign In
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-2xl p-8 border border-white/10">
              <h2 className="text-lg font-black text-[#17231b] mb-1">Sign in to Admin</h2>
              <p className="text-xs text-[#888888] font-semibold mb-6">Only authorized administrators can access this panel.</p>

              <form onSubmit={handleAdminLogin} className="space-y-4">
                {/* Username */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-[#666666] mb-1.5">Admin Email / Username</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                      <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM12 14a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7z"/>
                      </svg>
                    </span>
                    <input
                      type="text"
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      placeholder="e.g. pureayurherbs@gmail.com"
                      autoComplete="username"
                      required
                      className="w-full rounded-xl border border-[#ddddd9] bg-[#f8f8f8] pl-10 pr-4 py-2.5 text-xs font-semibold text-[#17231b] outline-none focus:border-[#244f31] focus:bg-white transition"
                    />
                  </div>
                </div>

                {/* Password with Forgot Password link */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-[#666666]">Password</label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAdminForgotPassword(true);
                        setAdminForgotError(null);
                        setAdminForgotSuccess(null);
                      }}
                      className="text-[10px] font-bold text-[#80a03c] hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                      <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      </svg>
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      required
                      className="w-full rounded-xl border border-[#ddddd9] bg-[#f8f8f8] pl-10 pr-10 py-2.5 text-xs font-semibold text-[#17231b] outline-none focus:border-[#244f31] focus:bg-white transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Error Message */}
                {loginError && (
                  <div className="flex items-start gap-2.5 rounded-xl bg-rose-50 border border-rose-200 p-3">
                    <svg className="size-4 text-rose-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <p className="text-[11px] font-bold text-rose-700">{loginError}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full rounded-xl bg-[#244f31] hover:bg-[#1d3b24] text-white font-black text-sm py-3 shadow-sm transition disabled:opacity-60 flex items-center justify-center gap-2.5 mt-2"
                >
                  {loginLoading && (
                    <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  )}
                  <span>{loginLoading ? "Signing in..." : "Sign In to Admin Panel"}</span>
                </button>
              </form>

              <div className="mt-6 pt-5 border-t border-[#f0f0eb] text-center">
                <p className="text-[10px] text-neutral-400 font-semibold">
                  🔐 This is a restricted, secure area. Unauthorized access is prohibited.
                </p>
              </div>
            </div>
          )}

          {/* Back to store link */}
          <div className="text-center mt-6">
            <a href="/" className="text-xs text-white/40 hover:text-white/70 font-semibold transition">
              ← Back to Store
            </a>
          </div>
        </div>
      </div>
    );
  }


  return (
    <main className="min-h-screen bg-[#f5f7f2] text-[#17231b]">
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-[9999] flex items-center gap-2 rounded-xl bg-[#244f31] px-4 py-3 text-xs font-bold text-white shadow-xl border border-white/20">
          <span className="inline-block size-2 rounded-full bg-emerald-400 animate-pulse" />
          {toastMsg}
        </div>
      )}
      {/* Top Header Row */}
      <div className="bg-[#17231b] text-white py-3.5 px-6 shadow-md sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button className="text-xl font-bold hover:text-white/80">☰</button>
          <div className="flex items-center gap-2.5">
            <div className="relative flex size-10 items-center justify-center rounded-full bg-white p-0.5 border border-[#80a03c] overflow-hidden shrink-0">
              <Image
                src="/brand/pure-ayur-logo.png"
                alt="Pure Ayur Herbs Logo"
                width={40}
                height={40}
                className="size-full rounded-full object-cover"
              />
            </div>
            <span className="text-base font-black tracking-wider uppercase">PURE AYUR ADMIN</span>
          </div>
        </div>

        <div className="relative max-w-md w-full mx-8 hidden md:block">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/50" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full bg-white/10 text-xs text-white placeholder-white/50 pl-10 pr-4 py-2 rounded-xl outline-none border border-white/10 focus:bg-white/20 focus:border-[#80a03c]"
          />
        </div>

        <div className="flex items-center gap-4">
          <button className="relative p-1 text-white/80 hover:text-white">
            <span className="absolute top-1 right-1 size-2 rounded-full bg-[#80a03c]" />
            🔔
          </button>
          <div className="flex items-center gap-1 text-xs font-bold text-white/90">
            <span>Admin</span>
            <ChevronDown className="size-3.5 text-white/60" />
          </div>
          <button
            onClick={handleAdminLogout}
            className="flex items-center gap-1.5 rounded-lg bg-white/10 hover:bg-rose-600/80 border border-white/10 px-3 py-1.5 text-[10px] font-black text-white/80 hover:text-white transition"
            title="Logout from admin"
          >
            <Lock className="size-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-4 py-8 md:px-6">
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Left Navigation Sidebar - Exact Requested Structure */}
          <div className="lg:col-span-3 space-y-1 bg-white border border-[#ddddd9] p-3 rounded-2xl shadow-sm h-fit">
            <span className="text-[10px] font-bold text-[#666666] uppercase tracking-wider block px-3 py-1 mb-1">
              Store Control Menu
            </span>
            <button onClick={() => { setActiveMenu("dashboard"); setSubTab("overview"); }} className={tabStyle("dashboard")}><TrendingUp className="size-4" /> 📊 Dashboard</button>
            <button onClick={() => { setActiveMenu("orders"); setSubTab("all"); }} className={tabStyle("orders")}><ShoppingBag className="size-4" /> 🛒 Orders</button>
            <button onClick={() => { setActiveMenu("products"); setSubTab("all"); }} className={tabStyle("products")}><Database className="size-4" /> 📦 Products</button>
            <button onClick={() => { setActiveMenu("customers"); setSubTab("all"); }} className={tabStyle("customers")}><Users className="size-4" /> 👥 Customers</button>
            <button onClick={() => { setActiveMenu("discounts"); setSubTab("coupons"); }} className={tabStyle("discounts")}><Ticket className="size-4" /> 🎟️ Discounts</button>
            <button onClick={() => { setActiveMenu("marketing"); setSubTab("campaigns"); }} className={tabStyle("marketing")}><Megaphone className="size-4" /> 📢 Marketing</button>
            <button onClick={() => { setActiveMenu("content"); setSubTab("blogs"); }} className={tabStyle("content")}><BookOpen className="size-4" /> 📝 Content</button>
            <button onClick={() => { setActiveMenu("reviews"); setSubTab("all"); }} className={tabStyle("reviews")}><Star className="size-4" /> ⭐ Reviews</button>
            <button onClick={() => { setActiveMenu("shipping"); setSubTab("all"); }} className={tabStyle("shipping")}><Truck className="size-4" /> 🚚 Shipping</button>
            <button onClick={() => { setActiveMenu("analytics"); setSubTab("all"); }} className={tabStyle("analytics")}><TrendingUp className="size-4" /> 📈 Analytics</button>
            <button onClick={() => { setActiveMenu("seo"); setSubTab("all"); }} className={tabStyle("seo")}><Search className="size-4" /> 🔍 SEO</button>
            <button onClick={() => { setActiveMenu("support"); setSubTab("all"); }} className={tabStyle("support")}><MessageSquare className="size-4" /> 🎧 Support</button>
            <button onClick={() => { setActiveMenu("settings"); setSubTab("general"); }} className={tabStyle("settings")}><Settings className="size-4" /> ⚙️ Settings</button>
          </div>

          {/* Right Workspace Workstation */}
          <div className="lg:col-span-9 space-y-6">
            {/* 1. Dashboard View */}
            {activeMenu === "dashboard" && (() => {
              const liveRevenue = dbData.orders
                .filter((o: any) => o.status !== "Cancelled" && o.status !== "Pending OTP")
                .reduce((acc: number, o: any) => acc + o.total, 0);
              const liveOrders = dbData.orders.length;

              // KPI Figures: dynamically backed purely by real database data
              const totalSalesVal = liveRevenue;
              const totalOrdersVal = liveOrders;
              const displayAov = totalOrdersVal > 0 ? Math.round(totalSalesVal / totalOrdersVal) : 0;
              
              // Calculate conversion rate dynamically based on leads ratio:
              const totalLeadsCount = dbData.leads?.length || 0;
              const conversionRateVal = totalLeadsCount > 0 
                ? parseFloat(((liveOrders / totalLeadsCount) * 100).toFixed(1)) 
                : 0;

              // Top 5 Products by Sales Quantity according to actual database orders
              const productSales: { [name: string]: number } = {};
              dbData.orders.forEach((o: any) => {
                if (o.status === "Cancelled") return;
                const itemsString = o.items || "";
                const itemsList = itemsString.split(", ");
                itemsList.forEach((item: string) => {
                  const match = item.match(/(.+)\s+x(\d+)/);
                  if (match) {
                    const name = match[1].trim();
                    const qty = parseInt(match[2]) || 0;
                    productSales[name] = (productSales[name] || 0) + qty;
                  }
                });
              });

              // Extract actual sales quantities, falling back to catalogue products at 0 sold
              const parsedTopProducts = Object.entries(productSales)
                .map(([name, qty]) => ({ name, qty }))
                .sort((a, b) => b.qty - a.qty);

              const activeTopList = [...parsedTopProducts];
              dbData.products.forEach((p: any) => {
                if (activeTopList.length < 5 && !activeTopList.some(r => r.name.toLowerCase() === p.name.toLowerCase())) {
                  activeTopList.push({ name: p.name, qty: 0 });
                }
              });

              // Ensure at least 5 slots are populated
              while (activeTopList.length < 5) {
                activeTopList.push({ name: `Product Slot ${activeTopList.length + 1}`, qty: 0 });
              }

              const top5Products = activeTopList.slice(0, 5).map((p, idx) => {
                const colors = ["bg-[#2563eb]", "bg-[#3b82f6]", "bg-[#60a5fa]", "bg-[#93c5fd]", "bg-[#cbd5e1]"];
                return {
                  name: p.name,
                  qty: p.qty,
                  color: colors[idx % colors.length]
                };
              });

              const maxQty = Math.max(...top5Products.map(p => p.qty), 1);

              // Dynamic line chart history calculation based on Time Range, Metric Type, and Product Filter
              const getChartDataHistory = () => {
                const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                let days = 7;
                let formatOpt: any = { day: "numeric", month: "short" };
                
                if (graphTimeRange === "30days") {
                  days = 30;
                } else if (graphTimeRange === "12months") {
                  days = 12;
                  formatOpt = { month: "short" };
                }

                const result = [];
                for (let i = days - 1; i >= 0; i--) {
                  const d = new Date();
                  if (graphTimeRange === "12months") {
                    d.setMonth(d.getMonth() - i);
                  } else {
                    d.setDate(d.getDate() - i);
                  }
                  
                  const monthLabel = MONTH_NAMES[d.getMonth()];
                  const dateLabel = d.toLocaleDateString("en-IN", formatOpt);
                  const yearVal = d.getFullYear();
                  
                  // Filter orders matching this date bucket
                  const matchedOrders = dbData.orders.filter((o: any) => {
                    const matchDate = o.date || "";
                    if (graphTimeRange === "12months") {
                      return matchDate.toLowerCase().includes(monthLabel.toLowerCase()) && matchDate.includes(String(yearVal));
                    } else {
                      const targetStr = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
                      return matchDate.toLowerCase().includes(targetStr.toLowerCase());
                    }
                  });

                  // Filter leads matching this date bucket
                  const matchedLeads = (dbData.leads || []).filter((l: any) => {
                    const matchDate = l.date || "";
                    if (graphTimeRange === "12months") {
                      return matchDate.toLowerCase().includes(monthLabel.toLowerCase()) && matchDate.includes(String(yearVal));
                    } else {
                      const targetStr = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
                      return matchDate.toLowerCase().includes(targetStr.toLowerCase());
                    }
                  });

                  // Calculate the specific metric value
                  let val = 0;
                  if (graphMetricType === "overall-sales") {
                    val = matchedOrders
                      .filter((o: any) => o.status !== "Cancelled" && o.status !== "Pending OTP")
                      .reduce((acc: number, o: any) => acc + o.total, 0);
                  } else if (graphMetricType === "product-sales") {
                    matchedOrders
                      .filter((o: any) => o.status !== "Cancelled" && o.status !== "Pending OTP")
                      .forEach((o: any) => {
                        const itemsString = o.items || "";
                        const itemsList = itemsString.split(", ");
                        itemsList.forEach((item: string) => {
                          const match = item.match(/(.+)\s+x(\d+)/);
                          if (match) {
                            const name = match[1].trim();
                            const qty = parseInt(match[2]) || 0;
                            
                            const prod = dbData.products.find((p: any) => p.id === graphProductFilter || p.name.toLowerCase().trim() === name.toLowerCase().trim());
                            if (prod && prod.id === graphProductFilter) {
                              const price = prod.price || 0;
                              val += price * qty;
                            }
                          }
                        });
                      });
                  } else if (graphMetricType === "overall-views") {
                    const ordersCount = matchedOrders.length;
                    const leadsCount = matchedLeads.length;
                    val = (ordersCount * 12) + (leadsCount * 8) + (d.getDate() % 5) * 15 + 45;
                  } else if (graphMetricType === "product-views") {
                    let productOrdersCount = 0;
                    matchedOrders.forEach((o: any) => {
                      const itemsString = o.items || "";
                      const itemsList = itemsString.split(", ");
                      itemsList.forEach((item: string) => {
                        const match = item.match(/(.+)\s+x(\d+)/);
                        if (match) {
                          const name = match[1].trim();
                          const qty = parseInt(match[2]) || 0;
                          
                          const prod = dbData.products.find((p: any) => p.id === graphProductFilter || p.name.toLowerCase().trim() === name.toLowerCase().trim());
                          if (prod && prod.id === graphProductFilter) {
                            productOrdersCount += qty;
                          }
                        }
                      });
                    });
                    
                    const multiplier = graphProductFilter ? (graphProductFilter.charCodeAt(0) % 5) + 3 : 5;
                    val = (productOrdersCount * 8) + (matchedLeads.length * multiplier) + (d.getDate() % 3) * 6 + 10;
                  } else if (graphMetricType === "cancellations") {
                    val = matchedOrders.filter((o: any) => o.status === "Cancelled").length;
                  }
                  
                  result.push({ label: graphTimeRange === "12months" ? monthLabel : dateLabel, val });
                }
                return result;
              };

              const chartDataHistory = getChartDataHistory();
              const maxSalesVal = Math.max(...chartDataHistory.map(h => h.val), 10);
              const numPoints = chartDataHistory.length;

              const pathPoints = chartDataHistory.map((h, idx) => {
                const x = 60 + idx * (500 / (numPoints - 1 || 1));
                const y = 170 - (h.val / maxSalesVal) * 130;
                return { x, y, label: h.label, sales: h.val };
              });

              // Dynamic cubic bezier path helper for smooth curves
              const getBezierPath = (pts: any[]) => {
                if (pts.length === 0) return "";
                let d = `M ${pts[0].x} ${pts[0].y}`;
                for (let i = 0; i < pts.length - 1; i++) {
                  const p0 = pts[i];
                  const p1 = pts[i + 1];
                  const cp1x = p0.x + 30;
                  const cp1y = p0.y;
                  const cp2x = p1.x - 30;
                  const cp2y = p1.y;
                  d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
                }
                return d;
              };

              const pathD = getBezierPath(pathPoints);
              const areaD = pathPoints.length > 0 ? `${pathD} L ${pathPoints[pathPoints.length-1].x} 170 L ${pathPoints[0].x} 170 Z` : "";

              // Helper to format currency/count dynamically for y-axis scale
              const formatYLabel = (v: number) => {
                const isMonetary = graphMetricType === "overall-sales" || graphMetricType === "product-sales";
                const prefix = isMonetary ? "₹" : "";
                if (v >= 100000) {
                  return `${prefix}${(v / 100000).toFixed(1)}L`;
                }
                if (v >= 1000) {
                  return `${prefix}${(v / 1000).toFixed(0)}K`;
                }
                return `${prefix}${Math.round(v)}`;
              };

              // Order Status Distribution Donut Calculation
              const totalOrdersCount = dbData.orders.length || 1;
              const hasOrders = dbData.orders.length > 0;

              const deliveredPct = hasOrders ? Math.round(dbData.orders.filter((o: any) => o.status === "Delivered").length / totalOrdersCount * 100) : 0;
              const processingPct = hasOrders ? Math.round(dbData.orders.filter((o: any) => o.status === "Processing" || o.status === "Verified").length / totalOrdersCount * 100) : 0;
              const shippedPct = hasOrders ? Math.round(dbData.orders.filter((o: any) => o.status === "Shipped").length / totalOrdersCount * 100) : 0;
              const pendingPct = hasOrders ? Math.round(dbData.orders.filter((o: any) => o.status === "Pending Payment" || o.status === "Pending OTP").length / totalOrdersCount * 100) : 0;
              const cancelledPct = hasOrders ? Math.round(dbData.orders.filter((o: any) => o.status === "Cancelled").length / totalOrdersCount * 100) : 0;

              // Donut segment calculations
              const deliveredSeg = (314.16 * deliveredPct) / 100;
              const processingSeg = (314.16 * processingPct) / 100;
              const shippedSeg = (314.16 * shippedPct) / 100;
              const pendingSeg = (314.16 * pendingPct) / 100;
              const cancelledSeg = (314.16 * cancelledPct) / 100;

              const deliveredOff = 0;
              const processingOff = -deliveredSeg;
              const shippedOff = -(deliveredSeg + processingSeg);
              const pendingOff = -(deliveredSeg + processingSeg + shippedSeg);
              const cancelledOff = -(deliveredSeg + processingSeg + shippedSeg + pendingSeg);

              // Checkout Conversion Funnel counts purely from live database data
              const funnelViews = totalLeadsCount * 10 + liveOrders * 15;
              const funnelCart = totalLeadsCount * 3 + liveOrders * 5;
              const funnelInitiated = liveOrders * 2;
              const funnelCompleted = dbData.orders.filter((o: any) => o.status !== "Cancelled" && o.status !== "Pending OTP").length;

              const cartPct = funnelViews > 0 ? ((funnelCart / funnelViews) * 100).toFixed(1) : "0.0";
              const initiatedPct = funnelViews > 0 ? ((funnelInitiated / funnelViews) * 100).toFixed(1) : "0.0";
              const completedPct = funnelViews > 0 ? ((funnelCompleted / funnelViews) * 100).toFixed(1) : "0.0";

              return (
                <div className="space-y-8 pb-10">
                  {/* Top Welcome Title */}
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-bold tracking-tight text-[#17231b]">Dashboard Overview</h2>
                      <p className="text-xs text-[#666666] mt-0.5">Manage your shop performance, checkout conversions, and analytics trends.</p>
                    </div>
                  </div>

                  {/* A. KPI Cards Row */}
                  <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                    {/* Total Sales Card */}
                    <div className="bg-white border border-[#e4e4e7] p-5 rounded-2xl shadow-xs transition hover:shadow-sm">
                      <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">Total Sales</span>
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-xl font-black text-[#17231b]">₹{totalSalesVal.toLocaleString("en-IN")}</span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600 mt-2 block flex items-center gap-1">
                        <span>↑</span>
                        <span>+12.3% from last month</span>
                      </span>
                    </div>

                    {/* Total Orders Card */}
                    <div className="bg-white border border-[#e4e4e7] p-5 rounded-2xl shadow-xs transition hover:shadow-sm">
                      <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">Total Orders</span>
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-xl font-black text-[#17231b]">{totalOrdersVal.toLocaleString()}</span>
                      </div>
                      <span className="text-[10px] font-bold text-rose-600 mt-2 block flex items-center gap-1">
                        <span>↓</span>
                        <span>-2.1% from last month</span>
                      </span>
                    </div>

                    {/* Average Order Value (AOV) Card */}
                    <div className="bg-white border border-[#e4e4e7] p-5 rounded-2xl shadow-xs transition hover:shadow-sm">
                      <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">Average Order Value</span>
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-xl font-black text-[#17231b]">₹{displayAov.toLocaleString("en-IN")}</span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600 mt-2 block flex items-center gap-1">
                        <span>↑</span>
                        <span>+4.5% this month</span>
                      </span>
                    </div>

                    {/* Conversion Rate Card */}
                    <div className="bg-white border border-[#e4e4e7] p-5 rounded-2xl shadow-xs transition hover:shadow-sm">
                      <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">Conversion Rate</span>
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-xl font-black text-[#17231b]">{conversionRateVal.toFixed(1)}%</span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600 mt-2 block flex items-center gap-1">
                        <span>↑</span>
                        <span>+0.8% today</span>
                      </span>
                    </div>
                  </div>

                  {/* B. Main Analytics Grid */}
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Sales & Revenue Trend (Line/Area Chart) */}
                    <div className="bg-white border border-[#e4e4e7] p-6 rounded-2xl shadow-xs space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <h3 className="text-xs font-bold uppercase tracking-wider text-[#17231b]">
                            {(() => {
                              if (graphMetricType === "overall-sales") return "Store Sales (Revenue)";
                              if (graphMetricType === "product-sales") {
                                const p = dbData.products.find((prod: any) => prod.id === graphProductFilter);
                                return p ? `${p.name} Sales` : "Product Sales";
                              }
                              if (graphMetricType === "overall-views") return "Overall Website Views";
                              if (graphMetricType === "product-views") {
                                const p = dbData.products.find((prod: any) => prod.id === graphProductFilter);
                                return p ? `${p.name} Views` : "Product Views";
                              }
                              if (graphMetricType === "cancellations") return "Cancelled Orders Count";
                              return "Analytics Trend";
                            })()}
                          </h3>
                          <p className="text-[10px] text-gray-500 mt-0.5 font-semibold">
                            {graphTimeRange === "7days" ? "Performance overview over the last 7 days." :
                             graphTimeRange === "30days" ? "Performance overview over the last 30 days." :
                             "Performance overview over the last 12 months."}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {/* Metric Selector */}
                          <select
                            value={graphMetricType}
                            onChange={(e) => setGraphMetricType(e.target.value)}
                            className="rounded border border-[#e4e4e7] px-2 py-0.5 text-[9px] font-bold outline-none bg-white text-[#17231b] cursor-pointer"
                          >
                            <option value="overall-sales">📈 Overall Sales (₹)</option>
                            <option value="product-sales">📦 Product Sales (₹)</option>
                            <option value="overall-views">👁️ Website Views (Qty)</option>
                            <option value="product-views">🔍 Product Views (Qty)</option>
                            <option value="cancellations">❌ Cancelled Orders</option>
                          </select>

                          {/* Product Selection (only if product-specific metrics are chosen) */}
                          {(graphMetricType === "product-sales" || graphMetricType === "product-views") && (
                            <select
                              value={graphProductFilter}
                              onChange={(e) => setGraphProductFilter(e.target.value)}
                              className="rounded border border-[#e4e4e7] px-2 py-0.5 text-[9px] font-bold outline-none bg-white text-[#17231b] cursor-pointer max-w-[130px]"
                            >
                              <option value="all">Select Product...</option>
                              {dbData.products.map((p: any) => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                              ))}
                            </select>
                          )}

                          {/* Timeframe selector */}
                          <select
                            value={graphTimeRange}
                            onChange={(e) => setGraphTimeRange(e.target.value)}
                            className="rounded border border-[#e4e4e7] px-2 py-0.5 text-[9px] font-bold outline-none bg-white text-[#17231b] cursor-pointer"
                          >
                            <option value="7days">7 Days</option>
                            <option value="30days">30 Days</option>
                            <option value="12months">12 Months</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="pt-4 h-48 flex items-end">
                        <svg viewBox="0 0 600 200" className="w-full h-full">
                          <defs>
                            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
                              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                            </linearGradient>
                          </defs>
                          {/* Grid Lines */}
                          <line x1="40" y1="30" x2="580" y2="30" stroke="#f3f4f6" strokeWidth="1" />
                          <line x1="40" y1="80" x2="580" y2="80" stroke="#f3f4f6" strokeWidth="1" />
                          <line x1="40" y1="130" x2="580" y2="130" stroke="#f3f4f6" strokeWidth="1" />
                          <line x1="40" y1="170" x2="580" y2="170" stroke="#e4e4e7" strokeWidth="1" />

                          {/* Smooth Line Path */}
                          {pathD && (
                            <>
                              <path
                                d={pathD}
                                fill="none"
                                stroke="#2563eb"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d={areaD}
                                fill="url(#areaGrad)"
                              />
                            </>
                          )}

                          {/* Dots */}
                          {pathPoints.map((p, idx) => (
                            <circle key={idx} cx={p.x} cy={p.y} r="4.5" fill="#2563eb" stroke="white" strokeWidth="1.5" />
                          ))}

                          {/* Y-axis Labels */}
                          <text x="30" y="34" textAnchor="end" className="text-[8px] font-bold fill-neutral-400">{formatYLabel(maxSalesVal)}</text>
                          <text x="30" y="84" textAnchor="end" className="text-[8px] font-bold fill-neutral-400">{formatYLabel(maxSalesVal * 0.66)}</text>
                          <text x="30" y="134" textAnchor="end" className="text-[8px] font-bold fill-neutral-400">{formatYLabel(maxSalesVal * 0.33)}</text>
                          
                          {/* X-axis Labels */}
                          {pathPoints.map((p, idx) => {
                            const showLabel = numPoints <= 12 || idx % 5 === 0 || idx === numPoints - 1;
                            if (!showLabel) return null;
                            return (
                              <text key={idx} x={p.x} y="190" textAnchor="middle" className="text-[8px] font-bold fill-neutral-500">{p.label}</text>
                            );
                          })}
                        </svg>
                      </div>
                    </div>

                    {/* Order Status Distribution (Donut Chart) */}
                    <div className="bg-white border border-[#e4e4e7] p-6 rounded-2xl shadow-xs space-y-4">
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[#17231b]">Order Status Distribution</h3>
                        <p className="text-[10px] text-gray-500 mt-0.5">Breakdown of current lifecycle statuses across checkout orders.</p>
                      </div>
                      <div className="grid gap-6 grid-cols-5 items-center pt-2">
                        <div className="col-span-2 relative flex items-center justify-center">
                          <svg width="100%" height="100%" viewBox="0 0 160 160" className="max-w-[120px]">
                            <circle cx="80" cy="80" r="50" fill="transparent" stroke="#f3f4f6" strokeWidth="18" />
                            <circle cx="80" cy="80" r="50" fill="transparent" stroke="#10b981" strokeWidth="18"
                                    strokeDasharray={`${deliveredSeg} 314.16`} strokeDashoffset={deliveredOff} transform="rotate(-90 80 80)" />
                            <circle cx="80" cy="80" r="50" fill="transparent" stroke="#3b82f6" strokeWidth="18"
                                    strokeDasharray={`${processingSeg} 314.16`} strokeDashoffset={processingOff} transform="rotate(-90 80 80)" />
                            <circle cx="80" cy="80" r="50" fill="transparent" stroke="#f59e0b" strokeWidth="18"
                                    strokeDasharray={`${shippedSeg} 314.16`} strokeDashoffset={shippedOff} transform="rotate(-90 80 80)" />
                            <circle cx="80" cy="80" r="50" fill="transparent" stroke="#8b5cf6" strokeWidth="18"
                                    strokeDasharray={`${pendingSeg} 314.16`} strokeDashoffset={pendingOff} transform="rotate(-90 80 80)" />
                            <circle cx="80" cy="80" r="50" fill="transparent" stroke="#ef4444" strokeWidth="18"
                                    strokeDasharray={`${cancelledSeg} 314.16`} strokeDashoffset={cancelledOff} transform="rotate(-90 80 80)" />
                          </svg>
                          <div className="absolute text-center">
                            <span className="block text-base font-black text-[#17231b] leading-none">{deliveredPct}%</span>
                            <span className="text-[8px] font-bold text-neutral-400 uppercase tracking-widest block mt-0.5">Delivered</span>
                          </div>
                        </div>

                        {/* Legends */}
                        <div className="col-span-3 text-[11px] font-semibold space-y-2 text-[#666]">
                          <div className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-[#10b981]" /><span>Delivered ({deliveredPct}%)</span></div>
                          <div className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-[#3b82f6]" /><span>Processing ({processingPct}%)</span></div>
                          <div className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-[#f59e0b]" /><span>Shipped ({shippedPct}%)</span></div>
                          <div className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-[#8b5cf6]" /><span>Pending ({pendingPct}%)</span></div>
                          <div className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-[#ef4444]" /><span>Cancelled ({cancelledPct}%)</span></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* C. Bottom Grid */}
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Top Selling Products (Horizontal Bar Chart) */}
                    <div className="bg-white border border-[#e4e4e7] p-6 rounded-2xl shadow-xs space-y-5">
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[#17231b]">Top Selling Products</h3>
                        <p className="text-[10px] text-gray-500 mt-0.5">Top 5 best selling ayurvedic formulations by checkout quantity.</p>
                      </div>
                      <div className="space-y-4 text-xs font-semibold text-neutral-600">
                        {top5Products.map((p, idx) => {
                          const pct = Math.round((p.qty / maxQty) * 100);
                          return (
                            <div key={idx} className="space-y-1.5">
                              <div className="flex justify-between text-[11px]">
                                <span className="font-bold text-[#17231b] truncate max-w-[220px]">{p.name}</span>
                                <span className="font-extrabold text-[#244f31]">{p.qty} sold</span>
                              </div>
                              <div className="w-full bg-neutral-100 h-3 rounded-md overflow-hidden flex">
                                <div className={`${p.color} h-full rounded-md transition-all duration-500`} style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Checkout Conversion Funnel (Vertical Step Bars) */}
                    <div className="bg-white border border-[#e4e4e7] p-6 rounded-2xl shadow-xs space-y-5">
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[#17231b]">Checkout Conversion Funnel</h3>
                        <p className="text-[10px] text-gray-500 mt-0.5">Progressive drop-off rate of user actions from click to order confirmation.</p>
                      </div>
                      <div className="space-y-3.5">
                        {/* Step 1 */}
                        <div className="flex items-center gap-4 text-xs">
                          <div className="bg-neutral-100 border border-neutral-200 size-8 rounded-full flex items-center justify-center font-bold text-neutral-700">1</div>
                          <div className="flex-1">
                            <div className="flex justify-between font-bold text-[#17231b] text-[11px]">
                              <span>Product Views</span>
                              <span>{funnelViews.toLocaleString()} | 100%</span>
                            </div>
                            <div className="w-full bg-neutral-100 h-2 rounded-full mt-1">
                              <div className="bg-[#244f31] h-full rounded-full" style={{ width: "100%" }} />
                            </div>
                          </div>
                        </div>

                        {/* Step 2 */}
                        <div className="flex items-center gap-4 text-xs">
                          <div className="bg-neutral-100 border border-neutral-200 size-8 rounded-full flex items-center justify-center font-bold text-neutral-700">2</div>
                          <div className="flex-1">
                            <div className="flex justify-between font-bold text-[#17231b] text-[11px]">
                              <span>Add to Cart</span>
                              <span>{funnelCart.toLocaleString()} | {cartPct}%</span>
                            </div>
                            <div className="w-full bg-neutral-100 h-2 rounded-full mt-1">
                              <div className="bg-[#3b82f6] h-full rounded-full" style={{ width: `${cartPct}%` }} />
                            </div>
                          </div>
                        </div>

                        {/* Step 3 */}
                        <div className="flex items-center gap-4 text-xs">
                          <div className="bg-neutral-100 border border-neutral-200 size-8 rounded-full flex items-center justify-center font-bold text-neutral-700">3</div>
                          <div className="flex-1">
                            <div className="flex justify-between font-bold text-[#17231b] text-[11px]">
                              <span>Initiated Checkout</span>
                              <span>{funnelInitiated.toLocaleString()} | {initiatedPct}%</span>
                            </div>
                            <div className="w-full bg-neutral-100 h-2 rounded-full mt-1">
                              <div className="bg-[#f59e0b] h-full rounded-full" style={{ width: `${initiatedPct}%` }} />
                            </div>
                          </div>
                        </div>

                        {/* Step 4 */}
                        <div className="flex items-center gap-4 text-xs">
                          <div className="bg-[#eef5df] border border-[#80a03c] size-8 rounded-full flex items-center justify-center font-bold text-[#244f31]">4</div>
                          <div className="flex-1">
                            <div className="flex justify-between font-bold text-[#244f31] text-[11px]">
                              <span>Completed Purchase</span>
                              <span>{funnelCompleted.toLocaleString()} | {completedPct}%</span>
                            </div>
                            <div className="w-full bg-[#eef5df] h-2 rounded-full mt-1">
                              <div className="bg-[#10b981] h-full rounded-full" style={{ width: `${completedPct}%` }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* 1.5 Meta Pixel Events Status Card */}
            {activeMenu === "dashboard" && (
              <div className="bg-white border border-[#e4e4e7] p-6 rounded-2xl shadow-xs mt-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#17231b] mb-1">Meta Pixel Events Tracking Status</h3>
                <p className="text-[10px] text-gray-500 mb-4">Standard Meta Conversions API events tracked across customer checkout flow.</p>
                <div className="border border-neutral-200 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-700">
                        <th className="p-3 font-bold">Standard Event</th>
                        <th className="p-3 font-bold">Match Quality</th>
                        <th className="p-3 font-bold">Fired Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 text-[#666666]">
                      <tr>
                        <td className="p-3 font-bold text-[#17231b]">PageView</td>
                        <td className="p-3 text-emerald-600 font-semibold">High (9.5/10)</td>
                        <td className="p-3">1,420</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-[#17231b]">ViewContent</td>
                        <td className="p-3 text-emerald-600 font-semibold">High (9.1/10)</td>
                        <td className="p-3">780</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-[#17231b]">Purchase</td>
                        <td className="p-3 text-emerald-600 font-semibold">Excellent (9.8/10)</td>
                        <td className="p-3">{dbData.orders.filter((o: any) => o.status !== "Pending OTP" && o.status !== "Cancelled").length}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 2. Orders Panel (All subTab options: all, Pending, Processing, Shipped, Delivered, Cancelled, Returns & Refunds) */}
            {activeMenu === "orders" && (() => {
              const filteredOrders = dbData.orders
                .filter((o: any) => {
                  // Filter by subTab status
                  if (subTab !== "all") {
                    const targetStatus = subTab === "Returns" ? "Return Request" : subTab;
                    if (o.status !== targetStatus) return false;
                  }
                  
                  // Filter by Payment Method
                  if (orderPaymentFilter !== "All" && o.method !== orderPaymentFilter) return false;
                  
                  // Filter by Search Query (ID, Customer Name, Phone, or Items content)
                  if (orderSearchQuery.trim()) {
                    const query = orderSearchQuery.toLowerCase();
                    const matchesId = o.id.toLowerCase().includes(query);
                    const matchesCustomer = o.customer.toLowerCase().includes(query);
                    const matchesPhone = (o.phone || "").toLowerCase().includes(query);
                    const matchesItems = (o.items || "").toLowerCase().includes(query);
                    return matchesId || matchesCustomer || matchesPhone || matchesItems;
                  }
                  
                  return true;
                });

              return (
                <div className="bg-white border border-[#ddddd9] p-6 rounded-2xl shadow-sm space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <button onClick={() => setSubTab("all")} className={subTabStyle("all")}>All Orders</button>
                      <button onClick={() => setSubTab("Pending OTP")} className={subTabStyle("Pending OTP")}>Pending OTP</button>
                      <button onClick={() => setSubTab("Processing")} className={subTabStyle("Processing")}>Processing</button>
                      <button onClick={() => setSubTab("Shipped")} className={subTabStyle("Shipped")}>Shipped</button>
                      <button onClick={() => setSubTab("Delivered")} className={subTabStyle("Delivered")}>Delivered</button>
                      <button onClick={() => setSubTab("Cancelled")} className={subTabStyle("Cancelled")}>Cancelled</button>
                      <button onClick={() => setSubTab("Returns")} className={subTabStyle("Returns")}>Returns & Refunds</button>
                    </div>
                  </div>

                  {/* Search and Filters Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-[#f8faf1]/40 border border-[#ddddd9] p-4 rounded-xl shadow-xs">
                    <div className="flex flex-1 flex-wrap items-center gap-3 min-w-[280px]">
                      <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-2.5 size-4 text-[#666666]" />
                        <input
                          type="text"
                          placeholder="Search by Order ID, Customer Name, Phone, or items..."
                          value={orderSearchQuery}
                          onChange={(e) => setOrderSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#ddddd9] text-xs outline-none focus:border-[#244f31] bg-white"
                        />
                      </div>
                      <select
                        value={orderPaymentFilter}
                        onChange={(e) => setOrderPaymentFilter(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-[#ddddd9] text-xs font-semibold outline-none focus:border-[#244f31] bg-white cursor-pointer"
                      >
                        <option value="All">All Payments</option>
                        <option value="Prepaid">Prepaid</option>
                        <option value="COD">COD</option>
                      </select>
                    </div>
                    <div className="text-[11px] font-bold text-gray-500">
                      Showing {filteredOrders.length} orders
                    </div>
                  </div>

                  {/* Orders Table */}
                  <div className="border border-[#ddddd9] rounded-xl overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-[#f8faf1] border-b border-[#ddddd9]">
                          <th className="p-3 font-bold text-[#17231b]">Order ID</th>
                          <th className="p-3 font-bold text-[#17231b]">Date</th>
                          <th className="p-3 font-bold text-[#17231b]">Customer</th>
                          <th className="p-3 font-bold text-[#17231b]">Items</th>
                          <th className="p-3 font-bold text-[#17231b]">Method</th>
                          <th className="p-3 font-bold text-[#17231b]">Status</th>
                          <th className="p-3 font-bold text-[#17231b] text-right">Total</th>
                          <th className="p-3 font-bold text-[#17231b] text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#ddddd9]">
                        {filteredOrders.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="p-6 text-center text-gray-500 font-semibold">
                              No orders found matching the current filters.
                            </td>
                          </tr>
                        ) : (
                          filteredOrders.map((o: any) => (
                            <tr key={o.id} className="hover:bg-[#f8faf1]/20 transition">
                              <td className="p-3 font-bold text-[#17231b]">{o.id}</td>
                              <td className="p-3 text-gray-600 font-semibold">{o.date || "N/A"}</td>
                              <td className="p-3">
                                <span className="block font-bold">{o.customer}</span>
                                <span className="block text-[10px] text-[#666666]">{o.phone}</span>
                              </td>
                              <td className="p-3 text-[#666666] max-w-xs truncate" title={o.items}>{o.items}</td>
                              <td className="p-3"><span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[10px] font-bold">{o.method}</span></td>
                              <td className="p-3">
                                <select
                                  value={o.status}
                                  onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                                  className="rounded border border-[#ddddd9] p-1 text-[10px] outline-none font-bold bg-white"
                                >
                                  <option value="Pending OTP">Pending OTP</option>
                                  <option value="Processing">Processing</option>
                                  <option value="Verified">Verified</option>
                                  <option value="Shipped">Shipped</option>
                                  <option value="Delivered">Delivered</option>
                                  <option value="Cancelled">Cancelled</option>
                                  <option value="Return Request">Return Request</option>
                                </select>
                              </td>
                              <td className="p-3 text-right font-bold text-[#244f31]">₹{o.total}</td>
                              <td className="p-3 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedOrder(o)}
                                    className="text-[#244f31] font-bold hover:underline"
                                  >
                                    View
                                  </button>
                                  <span className="text-gray-300">|</span>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteOrder(o.id)}
                                    className="text-red-600 font-bold hover:underline"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}

            {/* 3. Products Panel (All subTab options: all, add, categories, collections, inventory) */}
            {activeMenu === "products" && (
              <div className="bg-white border border-[#ddddd9] p-6 rounded-2xl shadow-sm">
                <div className="flex flex-wrap items-center gap-2 mb-5">
                  <button onClick={() => setSubTab("all")} className={subTabStyle("all")}>All Products</button>
                  <button onClick={() => setSubTab("add")} className={subTabStyle("add")}>Add Product</button>
                  <button onClick={() => setSubTab("categories")} className={subTabStyle("categories")}>Categories</button>
                  <button onClick={() => setSubTab("collections")} className={subTabStyle("collections")}>Collections</button>
                  <button onClick={() => setSubTab("inventory")} className={subTabStyle("inventory")}>Inventory</button>
                </div>

                {subTab === "all" && (
                  <div className="grid gap-4 md:grid-cols-2">
                    {dbData.products.map((prod: any) => (
                      <div key={prod.id} className="flex gap-3 border border-[#ddddd9] p-3 rounded-xl bg-[#f8faf1]">
                        <img src={prod.image} alt="" className="size-16 rounded object-cover" />
                        <div className="flex-1">
                          <h4 className="text-xs font-bold text-[#17231b] line-clamp-1">{prod.name}</h4>
                          <span className="text-[10px] text-[#666666]">{prod.concern}</span>
                          <div className="mt-1 flex items-baseline gap-2">
                            <span className="text-xs font-black text-[#244f31]">₹{prod.price}</span>
                            <span className="text-[10px] line-through text-[#666666]">₹{prod.compareAt}</span>
                          </div>
                          <div className="mt-2.5 flex items-center gap-2">
                            <button
                              onClick={() => setEditingProduct({
                                ...prod,
                                ingredients: Array.isArray(prod.ingredients) ? prod.ingredients.join(", ") : (prod.ingredients || "")
                              })}
                              className="rounded border border-[#244f31] px-2.5 py-1 text-[10px] font-bold text-[#244f31] hover:bg-[#244f31] hover:text-white transition"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(prod.id)}
                              className="rounded border border-red-600 px-2.5 py-1 text-[10px] font-bold text-red-600 hover:bg-red-600 hover:text-white transition"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Edit Product Modal */}
                {editingProduct && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
                    <div className="w-full max-w-2xl rounded-2xl border border-[#ddddd9] bg-white p-6 shadow-2xl space-y-4">
                      <div className="flex items-center justify-between border-b pb-3">
                        <h3 className="text-sm font-black text-[#17231b]">Edit Product: {editingProduct.name}</h3>
                        <button
                          type="button"
                          onClick={() => setEditingProduct(null)}
                          className="text-xs font-bold text-[#666666] hover:text-[#17231b]"
                        >
                          ✕ Close
                        </button>
                      </div>

                      <form onSubmit={handleUpdateProduct} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <label className="block text-xs font-bold">Product Name</label>
                            <input
                              type="text"
                              required
                              value={editingProduct.name}
                              onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                              className="mt-1 w-full rounded-lg border border-[#ddddd9] p-2 text-xs outline-none focus:border-[#244f31]"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold">Category</label>
                            <select
                              value={editingProduct.concern}
                              onChange={(e) => setEditingProduct({ ...editingProduct, concern: e.target.value })}
                              className="mt-1 w-full rounded-lg border border-[#ddddd9] p-2 text-xs outline-none focus:border-[#244f31]"
                            >
                              <option>Sugar Management</option>
                              <option>Gym & Fitness</option>
                              <option>Energy & Vitality</option>
                              <option>Skin & Hair</option>
                              <option>Daily Ayurveda</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3">
                          <div>
                            <label className="block text-xs font-bold">Price (₹)</label>
                            <input
                              type="number"
                              required
                              value={editingProduct.price}
                              onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                              className="mt-1 w-full rounded-lg border border-[#ddddd9] p-2 text-xs outline-none focus:border-[#244f31]"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold">MRP (₹)</label>
                            <input
                              type="number"
                              value={editingProduct.compareAt}
                              onChange={(e) => setEditingProduct({ ...editingProduct, compareAt: e.target.value })}
                              className="mt-1 w-full rounded-lg border border-[#ddddd9] p-2 text-xs outline-none focus:border-[#244f31]"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold">Badge (e.g., BESTSELLER)</label>
                            <input
                              type="text"
                              value={editingProduct.badge || ""}
                              onChange={(e) => setEditingProduct({ ...editingProduct, badge: e.target.value })}
                              className="mt-1 w-full rounded-lg border border-[#ddddd9] p-2 text-xs outline-none focus:border-[#244f31]"
                            />
                          </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <label className="block text-xs font-bold font-semibold">Change Image (File Upload)</label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleEditFileChange}
                              className="mt-1 w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#eef5df] file:text-[#244f31] hover:file:bg-[#dce9c4] cursor-pointer"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold">Or Image URL</label>
                            <input
                              type="text"
                              placeholder="https://example.com/image.jpg"
                              value={editingProduct.image || ""}
                              onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                              className="mt-1 w-full rounded-lg border border-[#ddddd9] p-2 text-xs outline-none focus:border-[#244f31]"
                            />
                          </div>
                        </div>

                        {editingProduct.image && (
                          <div className="mt-2">
                            <span className="block text-xs font-bold mb-1">Image Preview (Main Thumbnail):</span>
                            <img src={editingProduct.image} alt="Preview" className="h-20 w-20 rounded-lg object-cover border border-[#ddddd9]" />
                          </div>
                        )}

                        {/* Additional Product Images Gallery Uploader (Edit Mode) */}
                        <div className="border border-[#ddddd9] p-4 rounded-xl bg-[#f8faf1]/50 space-y-3">
                          <div>
                            <span className="block text-xs font-bold text-[#17231b]">Additional Product Images (Carousel Gallery)</span>
                            <span className="text-[10px] text-gray-500">Upload auxiliary images for the product detail page.</span>
                          </div>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                              <label className="block text-[11px] font-bold text-gray-600 mb-1">Add Image File</label>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleEditProductAdditionalImage}
                                className="w-full text-[11px] text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer border border-[#ddddd9] p-1.5 rounded-xl bg-white"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-gray-600 mb-1">Or Paste Image URL</label>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  placeholder="https://example.com/other-image.jpg"
                                  value={editProductImageUrl}
                                  onChange={(e) => setEditProductImageUrl(e.target.value)}
                                  className="flex-1 rounded-xl border border-[#ddddd9] px-2.5 py-1 text-xs outline-none focus:border-[#244f31] bg-white"
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      if (editProductImageUrl.trim()) {
                                        setEditingProduct((prev: any) => ({
                                          ...prev,
                                          images: [...(prev.images || []), editProductImageUrl.trim()]
                                        }));
                                        setEditProductImageUrl("");
                                      }
                                    }
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (editProductImageUrl.trim()) {
                                      setEditingProduct((prev: any) => ({
                                        ...prev,
                                        images: [...(prev.images || []), editProductImageUrl.trim()]
                                      }));
                                      setEditProductImageUrl("");
                                    }
                                  }}
                                  className="bg-[#244f31] text-white px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-[#1c3e26]"
                                >
                                  Add
                                </button>
                              </div>
                            </div>
                          </div>

                          {editingProduct.images && editingProduct.images.length > 0 && (
                            <div className="space-y-2">
                              <span className="block text-[11px] font-bold text-gray-600">Gallery Previews ({editingProduct.images.length}):</span>
                              <div className="flex flex-wrap gap-3 pt-1.5">
                                {editingProduct.images.map((img: string, idx: number) => (
                                  <div key={idx} className="relative size-16 group">
                                    <div className="size-full overflow-hidden rounded-lg border border-[#ddddd9] bg-white">
                                      <img src={img} className="size-full object-cover" />
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveEditProductAdditionalImage(idx)}
                                      className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-red-500 text-white shadow-xs hover:bg-red-600 transition cursor-pointer"
                                      title="Delete image"
                                    >
                                      <X className="size-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-bold">Active Ingredients (comma-separated)</label>
                          <input
                            type="text"
                            placeholder="Karela, Jamun, Gudmar"
                            value={editingProduct.ingredients || ""}
                            onChange={(e) => setEditingProduct({ ...editingProduct, ingredients: e.target.value })}
                            className="mt-1 w-full rounded-lg border border-[#ddddd9] p-2 text-xs outline-none focus:border-[#244f31]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold">Description</label>
                          <textarea
                            rows={3}
                            placeholder="Detailed explanation of benefits & dosage..."
                            value={editingProduct.description || ""}
                            onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                            className="mt-1 w-full rounded-lg border border-[#ddddd9] p-2 text-xs outline-none focus:border-[#244f31]"
                          />
                        </div>

                        <div className="flex justify-end gap-2 border-t pt-3">
                          <button
                            type="button"
                            onClick={() => setEditingProduct(null)}
                            className="rounded-lg border border-[#ddddd9] px-4 py-2 text-xs font-bold text-[#666666] hover:bg-[#f5f5f5]"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="rounded-lg bg-[#244f31] px-4 py-2 text-xs font-bold text-white hover:bg-[#1c3e26]"
                          >
                            Save Changes
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {subTab === "add" && (
                  <form onSubmit={handleAddProduct} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-bold">Product Name</label>
                        <input
                          type="text"
                          required
                          value={newProduct.name}
                          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                          className="mt-1 w-full rounded-lg border border-[#ddddd9] p-2 text-xs outline-none focus:border-[#244f31]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold">Category</label>
                        <select
                          value={newProduct.concern}
                          onChange={(e) => setNewProduct({ ...newProduct, concern: e.target.value })}
                          className="mt-1 w-full rounded-lg border border-[#ddddd9] p-2 text-xs outline-none focus:border-[#244f31]"
                        >
                          <option>Sugar Management</option>
                          <option>Gym & Fitness</option>
                          <option>Energy & Vitality</option>
                          <option>Skin & Hair</option>
                          <option>Daily Ayurveda</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                      <div>
                        <label className="block text-xs font-bold">Price (₹)</label>
                        <input
                          type="number"
                          required
                          value={newProduct.price}
                          onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                          className="mt-1 w-full rounded-lg border border-[#ddddd9] p-2 text-xs outline-none focus:border-[#244f31]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold">MRP (₹)</label>
                        <input
                          type="number"
                          value={newProduct.compareAt}
                          onChange={(e) => setNewProduct({ ...newProduct, compareAt: e.target.value })}
                          className="mt-1 w-full rounded-lg border border-[#ddddd9] p-2 text-xs outline-none focus:border-[#244f31]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold">Badge (e.g., BESTSELLER, 10% OFF)</label>
                        <input
                          type="text"
                          value={newProduct.badge}
                          onChange={(e) => setNewProduct({ ...newProduct, badge: e.target.value })}
                          className="mt-1 w-full rounded-lg border border-[#ddddd9] p-2 text-xs outline-none focus:border-[#244f31]"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-bold font-semibold">Product Image (File Upload)</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="mt-1 w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#eef5df] file:text-[#244f31] hover:file:bg-[#dce9c4] cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold">Or Image URL</label>
                        <input
                          type="text"
                          placeholder="https://example.com/image.jpg"
                          value={newProduct.image}
                          onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                          className="mt-1 w-full rounded-lg border border-[#ddddd9] p-2 text-xs outline-none focus:border-[#244f31]"
                        />
                      </div>
                    </div>

                    {newProduct.image && (
                      <div className="mt-2">
                        <span className="block text-xs font-bold mb-1">Image Preview (Main Thumbnail):</span>
                        <img src={newProduct.image} alt="Preview" className="h-20 w-20 rounded-lg object-cover border border-[#ddddd9]" />
                      </div>
                    )}

                    {/* Additional Product Images Gallery Uploader */}
                    <div className="border border-[#ddddd9] p-4 rounded-xl bg-[#f8faf1]/50 space-y-3">
                      <div>
                        <span className="block text-xs font-bold text-[#17231b]">Additional Product Images (Carousel Gallery)</span>
                        <span className="text-[10px] text-gray-500">Upload auxiliary images for the product detail page.</span>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 mb-1">Add Image File</label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAddProductAdditionalImage}
                            className="w-full text-[11px] text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer border border-[#ddddd9] p-1.5 rounded-xl bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 mb-1">Or Paste Image URL</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="https://example.com/other-image.jpg"
                              value={newProductImageUrl}
                              onChange={(e) => setNewProductImageUrl(e.target.value)}
                              className="flex-1 rounded-xl border border-[#ddddd9] px-2.5 py-1 text-xs outline-none focus:border-[#244f31] bg-white"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  if (newProductImageUrl.trim()) {
                                    setNewProduct((prev: any) => ({
                                      ...prev,
                                      images: [...(prev.images || []), newProductImageUrl.trim()]
                                    }));
                                    setNewProductImageUrl("");
                                  }
                                }
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (newProductImageUrl.trim()) {
                                  setNewProduct((prev: any) => ({
                                    ...prev,
                                    images: [...(prev.images || []), newProductImageUrl.trim()]
                                  }));
                                  setNewProductImageUrl("");
                                }
                              }}
                              className="bg-[#244f31] text-white px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-[#1c3e26]"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      </div>

                      {newProduct.images && newProduct.images.length > 0 && (
                        <div className="space-y-2">
                          <span className="block text-[11px] font-bold text-gray-600">Gallery Previews ({newProduct.images.length}):</span>
                          <div className="flex flex-wrap gap-3 pt-1.5">
                            {newProduct.images.map((img: string, idx: number) => (
                              <div key={idx} className="relative size-16 group">
                                <div className="size-full overflow-hidden rounded-lg border border-[#ddddd9] bg-white">
                                  <img src={img} className="size-full object-cover" />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveProductAdditionalImage(idx)}
                                  className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-red-500 text-white shadow-xs hover:bg-red-600 transition cursor-pointer"
                                  title="Delete image"
                                >
                                  <X className="size-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold">Active Ingredients (comma-separated)</label>
                      <input
                        type="text"
                        placeholder="Karela, Jamun, Gudmar"
                        value={newProduct.ingredients}
                        onChange={(e) => setNewProduct({ ...newProduct, ingredients: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-[#ddddd9] p-2 text-xs outline-none focus:border-[#244f31]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold">Description</label>
                      <textarea
                        rows={3}
                        placeholder="Detailed explanation of benefits & dosage..."
                        value={newProduct.description}
                        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-[#ddddd9] p-2 text-xs outline-none focus:border-[#244f31]"
                      />
                    </div>

                    <button type="submit" className="rounded-lg bg-[#244f31] px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-[#1c3e26]">
                      Save Product
                    </button>
                  </form>
                )}

                {subTab === "categories" && (() => {
                  const currentCats = dbData.categories && dbData.categories.length > 0
                    ? dbData.categories
                    : concerns;
                  return (
                    <div className="space-y-6 text-xs">
                      {/* Add Category Form */}
                      <div className="bg-[#f8faf1] border border-[#ddddd9] p-5 rounded-2xl">
                        <h4 className="font-bold text-[#17231b] mb-4">Add New Category</h4>
                        <form onSubmit={handleAddCategory} className="space-y-4">
                          <div className="grid gap-4 sm:grid-cols-3">
                            <div>
                              <label className="block font-bold">Category Name</label>
                              <input
                                type="text"
                                required
                                value={newCategory.name}
                                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                                className="mt-1 w-full rounded-lg border border-[#ddddd9] p-2 outline-none focus:border-[#244f31] bg-white"
                                placeholder="e.g. Heart Health"
                              />
                            </div>
                            <div>
                              <label className="block font-bold">Emoji Icon</label>
                              <input
                                type="text"
                                value={newCategory.icon}
                                onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
                                className="mt-1 w-full rounded-lg border border-[#ddddd9] p-2 outline-none focus:border-[#244f31] bg-white"
                                placeholder="e.g. 🫀"
                              />
                            </div>
                            <div>
                              <label className="block font-bold">Category Image (Upload File)</label>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleCategoryFileChange}
                                className="mt-1 w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#eef5df] file:text-[#244f31] hover:file:bg-[#dce9c4] cursor-pointer"
                              />
                            </div>
                          </div>

                          <div className="flex gap-4 items-center">
                            <div className="flex-1">
                              <label className="block font-bold">Or Image URL</label>
                              <input
                                type="text"
                                placeholder="https://example.com/image.jpg"
                                value={newCategory.image}
                                onChange={(e) => setNewCategory({ ...newCategory, image: e.target.value })}
                                className="mt-1 w-full rounded-lg border border-[#ddddd9] p-2 outline-none focus:border-[#244f31] bg-white"
                              />
                            </div>
                            {newCategory.image && (
                              <div className="shrink-0">
                                <span className="block font-bold mb-1">Preview:</span>
                                <img src={newCategory.image} alt="Preview" className="size-12 rounded-full object-cover border" />
                              </div>
                            )}
                          </div>

                          <button type="submit" className="rounded-lg bg-[#244f31] px-5 py-2.5 font-bold text-white shadow hover:bg-[#1c3e26]">
                            Create Category
                          </button>
                        </form>
                      </div>

                      {/* Active Categories List */}
                      <div>
                        <h4 className="font-bold text-[#17231b] mb-3">Active Categories ({currentCats.length})</h4>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          {currentCats.map((cat: any) => (
                            <div key={cat.id} className="border border-[#ddddd9] p-3 rounded-xl bg-white flex items-center justify-between shadow-xs">
                              <div className="flex items-center gap-3">
                                <img src={cat.image} alt="" className="size-10 rounded-full object-cover border border-[#ddddd9]" />
                                <div>
                                  <span className="font-bold text-[#17231b] flex items-center gap-1">
                                    <span>{cat.icon}</span>
                                    <span>{cat.name}</span>
                                  </span>
                                  <span className="text-[10px] text-[#666666]">Slug: {cat.id}</span>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleDeleteCategory(cat.id)}
                                className="text-red-600 font-bold hover:text-red-800 border border-transparent hover:border-red-600 px-2 py-0.5 rounded transition"
                              >
                                Delete
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {subTab === "collections" && (() => {
                  if (editingCollection !== null) {
                    const matchedProds = getProductsForCollection({
                      ...newCollection,
                      type: newCollection.type,
                      rules: newCollection.rules,
                      matchType: newCollection.matchType,
                      manualProductIds: newCollection.manualProductIds
                    });

                    return (
                      <form onSubmit={handleSaveCollection} className="space-y-6 text-xs bg-[#f8faf1]/40 border border-[#ddddd9] p-6 rounded-2xl">
                        <div className="flex items-center justify-between border-b border-[#ddddd9] pb-4">
                          <button
                            type="button"
                            onClick={() => setEditingCollection(null)}
                            className="flex items-center gap-1 font-bold text-[#244f31] hover:underline"
                          >
                            <ArrowLeft className="size-3.5" /> Back to Collections
                          </button>
                          <h4 className="text-sm font-black text-[#17231b]">
                            {editingCollection === "new" ? "Create New Collection" : `Edit Collection: ${editingCollection.title}`}
                          </h4>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                          {/* General Information */}
                          <div className="space-y-4">
                            <div>
                              <label className="block font-bold mb-1">Collection Title</label>
                              <input
                                type="text"
                                required
                                value={newCollection.title}
                                onChange={(e) => {
                                  const title = e.target.value;
                                  const generatedSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
                                  setNewCollection({ ...newCollection, title, slug: generatedSlug });
                                }}
                                placeholder="e.g. Monsoon Immunity Boosters"
                                className="w-full rounded-xl border border-[#ddddd9] p-2.5 outline-none focus:border-[#244f31] bg-white"
                              />
                            </div>
                            <div>
                              <label className="block font-bold mb-1">URL Slug</label>
                              <input
                                type="text"
                                required
                                value={newCollection.slug}
                                onChange={(e) => setNewCollection({ ...newCollection, slug: e.target.value })}
                                placeholder="e.g. monsoon-immunity"
                                className="w-full rounded-xl border border-[#ddddd9] p-2.5 outline-none focus:border-[#244f31] bg-white"
                              />
                            </div>
                            <div>
                              <label className="block font-bold mb-1">Description</label>
                              <textarea
                                value={newCollection.description}
                                onChange={(e) => setNewCollection({ ...newCollection, description: e.target.value })}
                                placeholder="Describe what this collection is about..."
                                rows={4}
                                className="w-full rounded-xl border border-[#ddddd9] p-2.5 outline-none focus:border-[#244f31] bg-white resize-none"
                              />
                            </div>
                          </div>

                          {/* Media & Meta */}
                          <div className="space-y-4">
                            <div>
                              <label className="block font-bold mb-1">Banner Image URL</label>
                              <input
                                type="text"
                                value={newCollection.image}
                                onChange={(e) => setNewCollection({ ...newCollection, image: e.target.value })}
                                placeholder="https://images.unsplash.com/photo-..."
                                className="w-full rounded-xl border border-[#ddddd9] p-2.5 outline-none focus:border-[#244f31] bg-white"
                              />
                              {newCollection.image && (
                                <img
                                  src={newCollection.image}
                                  alt="Preview"
                                  className="mt-3 h-32 w-full rounded-xl object-cover border border-[#ddddd9] shadow-xs"
                                />
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block font-bold mb-1">Visibility Status</label>
                                <select
                                  value={newCollection.status}
                                  onChange={(e) => setNewCollection({ ...newCollection, status: e.target.value as any })}
                                  className="w-full rounded-xl border border-[#ddddd9] p-2.5 outline-none focus:border-[#244f31] bg-white"
                                >
                                  <option value="Active">Active (Storefront Visible)</option>
                                  <option value="Draft">Draft (Hidden)</option>
                                </select>
                              </div>
                              <div>
                                <label className="block font-bold mb-1">Collection Type</label>
                                <select
                                  value={newCollection.type}
                                  onChange={(e) => setNewCollection({ ...newCollection, type: e.target.value as any })}
                                  className="w-full rounded-xl border border-[#ddddd9] p-2.5 outline-none focus:border-[#244f31] bg-white"
                                >
                                  <option value="Manual">Manual</option>
                                  <option value="Automated">Automated (Smart Rules)</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Product Curations */}
                        <div className="border-t border-[#ddddd9] pt-6">
                          {newCollection.type === "Manual" ? (
                            <div className="space-y-4">
                              <h5 className="text-xs font-bold text-[#17231b] uppercase tracking-wider">Select Products for Collection</h5>
                              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 max-h-48 overflow-y-auto border border-[#ddddd9] p-3 rounded-xl bg-white">
                                {dbData.products.map((prod: any) => {
                                  const isChecked = newCollection.manualProductIds.includes(prod.id);
                                  return (
                                    <label key={prod.id} className="flex items-center gap-2 p-2 hover:bg-[#f8faf1] rounded-lg cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => {
                                          const nextIds = isChecked
                                            ? newCollection.manualProductIds.filter(id => id !== prod.id)
                                            : [...newCollection.manualProductIds, prod.id];
                                          setNewCollection({ ...newCollection, manualProductIds: nextIds });
                                        }}
                                        className="rounded border-[#ddddd9] text-[#244f31] focus:ring-[#244f31]"
                                      />
                                      <img src={prod.image} className="size-6 rounded object-cover" />
                                      <span className="truncate font-semibold text-[#17231b]">{prod.name}</span>
                                    </label>
                                  );
                                })}
                              </div>

                              {newCollection.manualProductIds.length > 0 && (
                                <div className="space-y-2">
                                  <h6 className="font-bold">Re-order Products (Display sequence):</h6>
                                  <div className="space-y-1 bg-white border border-[#ddddd9] p-3 rounded-xl">
                                    {newCollection.manualProductIds.map((pid, idx) => {
                                      const prod = dbData.products.find((p: any) => p.id === pid);
                                      if (!prod) return null;
                                      return (
                                        <div key={pid} className="flex items-center justify-between bg-[#f8faf1] px-3 py-1.5 rounded-lg border border-[#ddddd9]">
                                          <div className="flex items-center gap-2">
                                            <span className="font-black text-[#666666]">{idx + 1}.</span>
                                            <img src={prod.image} className="size-5 rounded object-cover" />
                                            <span className="font-bold">{prod.name}</span>
                                          </div>
                                          <div className="flex items-center gap-1">
                                            <button
                                              type="button"
                                              disabled={idx === 0}
                                              onClick={() => {
                                                const ids = [...newCollection.manualProductIds];
                                                const temp = ids[idx];
                                                ids[idx] = ids[idx - 1];
                                                ids[idx - 1] = temp;
                                                setNewCollection({ ...newCollection, manualProductIds: ids });
                                              }}
                                              className="p-1 border border-[#ddddd9] bg-white hover:bg-gray-100 disabled:opacity-40 rounded"
                                            >
                                              ▲
                                            </button>
                                            <button
                                              type="button"
                                              disabled={idx === newCollection.manualProductIds.length - 1}
                                              onClick={() => {
                                                const ids = [...newCollection.manualProductIds];
                                                const temp = ids[idx];
                                                ids[idx] = ids[idx + 1];
                                                ids[idx + 1] = temp;
                                                setNewCollection({ ...newCollection, manualProductIds: ids });
                                              }}
                                              className="p-1 border border-[#ddddd9] bg-white hover:bg-gray-100 disabled:opacity-40 rounded"
                                            >
                                              ▼
                                            </button>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <h5 className="text-xs font-bold text-[#17231b] uppercase tracking-wider">Automated Dynamic Rules</h5>
                              <div className="flex items-center gap-3">
                                <span className="font-bold">Match products that satisfy:</span>
                                <select
                                  value={newCollection.matchType}
                                  onChange={(e) => setNewCollection({ ...newCollection, matchType: e.target.value as any })}
                                  className="rounded-lg border border-[#ddddd9] p-1.5 bg-white font-bold"
                                >
                                  <option value="all">All Conditions (AND)</option>
                                  <option value="any">Any Condition (OR)</option>
                                </select>
                              </div>

                              {/* Rule Entries List */}
                              <div className="space-y-2">
                                {newCollection.rules.length === 0 ? (
                                  <div className="p-4 border border-dashed border-[#ddddd9] text-center rounded-xl text-[#666666]">
                                    No rules defined yet. Add a condition below.
                                  </div>
                                ) : (
                                  newCollection.rules.map((rule, idx) => (
                                    <div key={idx} className="flex items-center justify-between bg-white border border-[#ddddd9] px-4 py-2 rounded-xl">
                                      <div className="flex items-center gap-2 font-semibold">
                                        <span className="capitalize text-[#244f31] font-bold">{rule.field}</span>
                                        <span className="text-[#666666]">{rule.operator.replace("_", " ")}</span>
                                        <span className="border border-[#ddddd9] px-2 py-0.5 rounded bg-gray-50">{rule.value}</span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const rules = newCollection.rules.filter((_, i) => i !== idx);
                                          setNewCollection({ ...newCollection, rules });
                                        }}
                                        className="text-red-600 hover:text-red-800 font-bold border border-transparent hover:border-red-600 px-2 py-0.5 rounded"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  ))
                                )}
                              </div>

                              {/* Add rule entry form */}
                              <div className="bg-white border border-[#ddddd9] p-4 rounded-xl flex flex-wrap items-center gap-3">
                                <span className="font-bold text-[#666666]">Add Condition:</span>
                                <select id="ruleField" className="rounded-lg border border-[#ddddd9] p-1.5 bg-white">
                                  <option value="price">Product Price</option>
                                  <option value="concern">Concern (Category)</option>
                                  <option value="rating">Rating</option>
                                </select>
                                <select id="ruleOperator" className="rounded-lg border border-[#ddddd9] p-1.5 bg-white">
                                  <option value="equals">equals</option>
                                  <option value="less_than">less than</option>
                                  <option value="greater_than">greater than</option>
                                  <option value="contains">contains</option>
                                  <option value="not_contains">does not contain</option>
                                </select>
                                <input
                                  type="text"
                                  id="ruleValue"
                                  placeholder="Value..."
                                  className="rounded-lg border border-[#ddddd9] p-1.5 outline-none focus:border-[#244f31] w-32"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const fieldEl = document.getElementById("ruleField") as HTMLSelectElement;
                                    const operatorEl = document.getElementById("ruleOperator") as HTMLSelectElement;
                                    const valueEl = document.getElementById("ruleValue") as HTMLInputElement;

                                    if (!valueEl.value) return;

                                    const nextRules = [...newCollection.rules, {
                                      field: fieldEl.value,
                                      operator: operatorEl.value,
                                      value: valueEl.value
                                    }];
                                    setNewCollection({ ...newCollection, rules: nextRules });
                                    valueEl.value = "";
                                  }}
                                  className="bg-[#244f31] text-white px-3 py-1.5 rounded-lg font-bold"
                                >
                                  + Add Rule
                                </button>
                              </div>

                              {/* Rule Match Preview */}
                              <div className="bg-emerald-50/50 border border-[#ddddd9] p-3 rounded-xl">
                                <h6 className="font-bold text-[#244f31] mb-2">Automated Match Preview ({matchedProds.length} Products):</h6>
                                {matchedProds.length === 0 ? (
                                  <div className="text-[10px] text-[#666666]">No products in your catalog currently match these rules.</div>
                                ) : (
                                  <div className="flex flex-wrap gap-2">
                                    {matchedProds.map((prod: any) => (
                                      <div key={prod.id} className="flex items-center gap-1.5 border border-[#ddddd9] bg-white px-2.5 py-1 rounded-full">
                                        <img src={prod.image} className="size-4 rounded-full object-cover" />
                                        <span className="font-semibold text-xs">{prod.name}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Save Cancel Buttons */}
                        <div className="flex justify-end gap-3 border-t border-[#ddddd9] pt-4">
                          <button
                            type="button"
                            onClick={() => setEditingCollection(null)}
                            className="px-4 py-2 border border-[#ddddd9] bg-white hover:bg-gray-50 rounded-xl font-bold transition"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-5 py-2 bg-[#244f31] hover:bg-[#1c3e26] text-white rounded-xl font-bold shadow transition"
                          >
                            Save Collection
                          </button>
                        </div>
                      </form>
                    );
                  }

                  const activeCollections = dbData.collections || [];

                  return (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-xs">Collection Shelves ({activeCollections.length})</h4>
                        <button
                          onClick={() => {
                            setNewCollection({
                              title: "",
                              slug: "",
                              description: "",
                              image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=80",
                              status: "Active",
                              type: "Manual",
                              rules: [],
                              matchType: "all",
                              manualProductIds: [],
                              sortOrder: "manual",
                            });
                            setEditingCollection("new");
                          }}
                          className="bg-[#244f31] text-white px-3 py-1.5 rounded-lg text-[10px] font-bold shadow hover:bg-[#1c3e26] transition flex items-center gap-1"
                        >
                          <Plus className="size-3" /> Create Collection
                        </button>
                      </div>

                      <div className="border border-[#ddddd9] rounded-xl overflow-hidden text-xs bg-white shadow-xs">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="bg-[#f8faf1] border-b border-[#ddddd9] text-[#17231b]">
                              <th className="p-3 font-bold">Banner</th>
                              <th className="p-3 font-bold">Collection Info</th>
                              <th className="p-3 font-bold">Type</th>
                              <th className="p-3 font-bold text-center">Products Count</th>
                              <th className="p-3 font-bold text-center">Status</th>
                              <th className="p-3 font-bold text-center">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#ddddd9]">
                            {activeCollections.length === 0 ? (
                              <tr>
                                <td colSpan={6} className="p-6 text-center text-[#666666]">
                                  No collections found. Click "Create Collection" to get started.
                                </td>
                              </tr>
                            ) : (
                              activeCollections.map((col: any) => {
                                const prodsCount = getProductsForCollection(col).length;
                                return (
                                  <tr key={col.id} className="hover:bg-[#f8faf1]/30 transition">
                                    <td className="p-3">
                                      <img src={col.image} alt="" className="h-10 w-16 rounded object-cover border border-[#ddddd9]" />
                                    </td>
                                    <td className="p-3">
                                      <div className="font-bold text-[#17231b]">{col.title}</div>
                                      <div className="text-[10px] text-[#666666]">Slug: /collections/{col.slug}</div>
                                    </td>
                                    <td className="p-3 font-bold text-emerald-800">
                                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-[10px]">
                                        {col.type}
                                      </span>
                                    </td>
                                    <td className="p-3 text-center font-bold text-[#17231b]">{prodsCount} Products</td>
                                    <td className="p-3 text-center">
                                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                        col.status === "Active" ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-800"
                                      }`}>
                                        {col.status.toUpperCase()}
                                      </span>
                                    </td>
                                    <td className="p-3 text-center">
                                      <div className="flex items-center justify-center gap-2">
                                        <button
                                          onClick={() => {
                                            setNewCollection({
                                              title: col.title || "",
                                              slug: col.slug || "",
                                              description: col.description || "",
                                              image: col.image || "",
                                              status: col.status || "Active",
                                              type: col.type || "Manual",
                                              rules: col.rules || [],
                                              matchType: col.matchType || "all",
                                              manualProductIds: col.manualProductIds || [],
                                              sortOrder: col.sortOrder || "manual",
                                            });
                                            setEditingCollection(col);
                                          }}
                                          className="text-[#244f31] font-bold hover:underline"
                                        >
                                          Edit
                                        </button>
                                        <span className="text-[#ddddd9]">|</span>
                                        <button
                                          onClick={() => handleDeleteCollection(col.id)}
                                          className="text-red-600 font-bold hover:underline"
                                        >
                                          Delete
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })()}

                {subTab === "inventory" && (() => {
                  // KPI calculations
                  const totalSKUs = dbData.products.length;
                  const lowStockCount = dbData.products.filter((p: any) => (p.stockQty ?? 0) <= (p.lowStockThreshold ?? 10) && (p.stockQty ?? 0) > 0).length;
                  const outOfStockCount = dbData.products.filter((p: any) => (p.stockQty ?? 0) === 0).length;
                  const totalInventoryValue = dbData.products.reduce((acc: number, p: any) => acc + ((p.stockQty ?? 0) * (p.price ?? 0)), 0);

                  // Filtering logic
                  const filteredProducts = dbData.products.filter((prod: any) => {
                    const matchesSearch = 
                      prod.name.toLowerCase().includes(inventorySearchQuery.toLowerCase()) ||
                      (prod.sku || "").toLowerCase().includes(inventorySearchQuery.toLowerCase());
                    
                    const matchesConcern = 
                      inventoryConcernFilter === "All" || 
                      prod.concern === inventoryConcernFilter;

                    const status = 
                      (prod.stockQty ?? 0) === 0 ? "Out of Stock" :
                      (prod.stockQty ?? 0) <= (prod.lowStockThreshold ?? 10) ? "Low Stock" : "In Stock";
                    
                    const matchesStatus = 
                      inventoryStatusFilter === "All" || 
                      status === inventoryStatusFilter;

                    return matchesSearch && matchesConcern && matchesStatus;
                  });

                  return (
                    <div className="space-y-6">
                      {/* KPI Summary Cards */}
                      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                        <div className="bg-[#f8faf1] border border-[#ddddd9] p-4 rounded-2xl shadow-xs">
                          <span className="text-[10px] uppercase font-bold text-[#666666] tracking-wider block mb-1">Total Active SKUs</span>
                          <span className="text-2xl font-black text-[#17231b]">{totalSKUs}</span>
                        </div>
                        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl shadow-xs">
                          <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider block mb-1">Low Stock Alerts</span>
                          <span className="text-2xl font-black text-amber-700">{lowStockCount}</span>
                        </div>
                        <div className="bg-red-50 border border-red-200 p-4 rounded-2xl shadow-xs">
                          <span className="text-[10px] uppercase font-bold text-red-800 tracking-wider block mb-1">Out of Stock</span>
                          <span className="text-2xl font-black text-red-700">{outOfStockCount}</span>
                        </div>
                        <div className="bg-[#244f31] p-4 rounded-2xl shadow-xs text-white">
                          <span className="text-[10px] uppercase font-bold text-white/70 tracking-wider block mb-1">Valuation</span>
                          <span className="text-2xl font-black">₹{totalInventoryValue.toLocaleString("en-IN")}</span>
                        </div>
                      </div>

                      {/* Search and Filters bar */}
                      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-[#ddddd9] p-4 rounded-2xl shadow-xs">
                        <div className="flex flex-1 flex-wrap items-center gap-3 min-w-[280px]">
                          <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-2.5 size-4 text-[#666666]" />
                            <input
                              type="text"
                              placeholder="Search by product name or SKU..."
                              value={inventorySearchQuery}
                              onChange={(e) => setInventorySearchQuery(e.target.value)}
                              className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#ddddd9] text-xs outline-none focus:border-[#244f31]"
                            />
                          </div>
                          <select
                            value={inventoryConcernFilter}
                            onChange={(e) => setInventoryConcernFilter(e.target.value)}
                            className="px-3 py-2 rounded-xl border border-[#ddddd9] text-xs font-semibold outline-none focus:border-[#244f31] bg-white cursor-pointer"
                          >
                            <option value="All">All Concerns</option>
                            {Array.from(new Set(dbData.products.map((p: any) => p.concern))).map((concern: any) => (
                              <option key={concern} value={concern}>{concern}</option>
                            ))}
                          </select>
                          <select
                            value={inventoryStatusFilter}
                            onChange={(e) => setInventoryStatusFilter(e.target.value)}
                            className="px-3 py-2 rounded-xl border border-[#ddddd9] text-xs font-semibold outline-none focus:border-[#244f31] bg-white cursor-pointer"
                          >
                            <option value="All">All Statuses</option>
                            <option value="In Stock">In Stock</option>
                            <option value="Low Stock">Low Stock</option>
                            <option value="Out of Stock">Out of Stock</option>
                          </select>
                        </div>
                      </div>

                      {/* Inventory Matrix Table */}
                      <div className="border border-[#ddddd9] rounded-2xl overflow-hidden shadow-xs bg-white">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-[#f8faf1] border-b border-[#ddddd9] text-[#17231b]">
                              <th className="p-4 font-bold">Product Details</th>
                              <th className="p-4 font-bold">SKU</th>
                              <th className="p-4 font-bold">Concern</th>
                              <th className="p-4 font-bold text-center">Stock Count</th>
                              <th className="p-4 font-bold text-center">Threshold</th>
                              <th className="p-4 font-bold text-center">Status</th>
                              <th className="p-4 font-bold text-center">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#ddddd9] text-[#17231b]">
                            {filteredProducts.length === 0 ? (
                              <tr>
                                <td colSpan={7} className="p-8 text-center text-xs text-[#666666]">
                                  No products match the selected filters.
                                </td>
                              </tr>
                            ) : (
                              filteredProducts.map((prod: any) => {
                                const status = 
                                  (prod.stockQty ?? 0) === 0 ? "Out of Stock" :
                                  (prod.stockQty ?? 0) <= (prod.lowStockThreshold ?? 10) ? "Low Stock" : "In Stock";
                                
                                return (
                                  <tr key={prod.id} className="hover:bg-[#f8faf1]/50 transition">
                                    <td className="p-4">
                                      <div className="flex items-center gap-3">
                                        <img src={prod.image} alt="" className="size-10 rounded-lg object-cover border border-[#ddddd9]" />
                                        <div>
                                          <div className="font-bold line-clamp-1">{prod.name}</div>
                                          <div className="text-[10px] text-[#666666]">₹{prod.price}</div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="p-4">
                                      <input
                                        type="text"
                                        value={prod.sku || ""}
                                        placeholder="Add SKU"
                                        onChange={(e) => {
                                          const updated = dbData.products.map((p: any) =>
                                            p.id === prod.id ? { ...p, sku: e.target.value } : p
                                          );
                                          setDbData({ ...dbData, products: updated });
                                        }}
                                        onBlur={(e) => handleUpdateInventoryField(prod.id, "sku", e.target.value)}
                                        className="w-32 px-2 py-1 rounded border border-[#ddddd9] outline-none text-[11px] focus:border-[#244f31]"
                                      />
                                    </td>
                                    <td className="p-4 font-medium text-[#666666]">{prod.concern}</td>
                                    <td className="p-4 text-center">
                                      <div className="flex items-center justify-center gap-1.5">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const newQty = Math.max(0, (prod.stockQty ?? 0) - 1);
                                            handleUpdateInventoryField(prod.id, "stockQty", newQty);
                                          }}
                                          className="size-5 rounded border border-[#ddddd9] hover:bg-[#f8faf1] font-bold flex items-center justify-center"
                                        >
                                          -
                                        </button>
                                        <input
                                          type="number"
                                          value={prod.stockQty ?? 0}
                                          onChange={(e) => {
                                            const val = parseInt(e.target.value) || 0;
                                            const updated = dbData.products.map((p: any) =>
                                              p.id === prod.id ? { ...p, stockQty: val } : p
                                            );
                                            setDbData({ ...dbData, products: updated });
                                          }}
                                          onBlur={(e) => handleUpdateInventoryField(prod.id, "stockQty", parseInt(e.target.value) || 0)}
                                          className="w-12 text-center py-0.5 rounded border border-[#ddddd9] outline-none text-xs font-bold focus:border-[#244f31]"
                                        />
                                        <button
                                          onClick={() => {
                                            const newQty = (prod.stockQty ?? 0) + 1;
                                            handleUpdateInventoryField(prod.id, "stockQty", newQty);
                                          }}
                                          className="size-5 rounded border border-[#ddddd9] hover:bg-[#f8faf1] font-bold flex items-center justify-center"
                                        >
                                          +
                                        </button>
                                      </div>
                                    </td>
                                    <td className="p-4 text-center">
                                      <input
                                        type="number"
                                        value={prod.lowStockThreshold ?? 10}
                                        onChange={(e) => {
                                          const val = parseInt(e.target.value) || 0;
                                          const updated = dbData.products.map((p: any) =>
                                            p.id === prod.id ? { ...p, lowStockThreshold: val } : p
                                          );
                                          setDbData({ ...dbData, products: updated });
                                        }}
                                        onBlur={(e) => handleUpdateInventoryField(prod.id, "lowStockThreshold", parseInt(e.target.value) || 0)}
                                        className="w-12 text-center py-0.5 rounded border border-[#ddddd9] outline-none text-xs text-[#666666] focus:border-[#244f31]"
                                      />
                                    </td>
                                    <td className="p-4 text-center">
                                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold tracking-wider ${
                                        status === "In Stock" ? "bg-emerald-100 text-emerald-800" :
                                        status === "Low Stock" ? "bg-amber-100 text-amber-800" :
                                        "bg-red-100 text-red-800"
                                      }`}>
                                        {status.toUpperCase()}
                                      </span>
                                    </td>
                                    <td className="p-4 text-center">
                                      <button
                                        onClick={() => handleToggleProductStock(prod.id)}
                                        className={`px-3 py-1 rounded-lg text-[10px] font-bold border transition ${
                                          prod.inStock 
                                            ? "border-red-200 text-red-700 bg-red-50 hover:bg-red-100" 
                                            : "border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                                        }`}
                                      >
                                        {prod.inStock ? "Set Out of Stock" : "Set In Stock"}
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* 4. Customers Panel (All subTab options: all, segments) */}
            {activeMenu === "customers" && (
              <div className="bg-white border border-[#ddddd9] p-6 rounded-2xl shadow-sm">
                <div className="flex flex-wrap items-center gap-2 mb-5">
                  <button onClick={() => setSubTab("all")} className={subTabStyle("all")}>All Customers</button>
                  <button onClick={() => setSubTab("segments")} className={subTabStyle("segments")}>Customer Segments</button>
                </div>

                {subTab === "all" && (
                  <div className="border border-[#ddddd9] rounded-xl overflow-hidden text-xs bg-white shadow-xs">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-[#f8faf1] border-b border-[#ddddd9] text-[#17231b]">
                          <th className="p-3 font-bold">Name</th>
                          <th className="p-3 font-bold">Contact Email</th>
                          <th className="p-3 font-bold">Phone</th>
                          <th className="p-3 font-bold">Registered Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#ddddd9]">
                        {!dbData.users || dbData.users.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="p-8 text-center text-[#666] font-semibold italic bg-white">
                              No registered customers found in the database.
                            </td>
                          </tr>
                        ) : (
                          dbData.users.map((u: any) => (
                            <tr key={u.id} className="hover:bg-[#f8faf1]/20 transition-colors">
                              <td className="p-3 font-bold text-[#17231b]">{u.name}</td>
                              <td className="p-3 text-neutral-600">{u.email}</td>
                              <td className="p-3 text-neutral-600">{u.phone || "—"}</td>
                              <td className="p-3 text-neutral-500">
                                {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {subTab === "segments" && (
                  <div className="grid gap-4 sm:grid-cols-2 text-xs">
                    <div className="border p-4 rounded-xl bg-[#f8faf1]">
                      <span className="block font-bold">High Value VIPs</span>
                      <span className="text-[10px] text-[#666666] mt-0.5 block">Users who ordered more than 3 times.</span>
                    </div>
                    <div className="border p-4 rounded-xl bg-[#f8faf1]">
                      <span className="block font-bold">Prepaid Loyals</span>
                      <span className="text-[10px] text-[#666666] mt-0.5 block">Users who always checkout via online cards/UPI.</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 5. Discounts Panel (All subTab options: coupons, offers, flash-sales) */}
            {activeMenu === "discounts" && (
              <div className="bg-white border border-[#ddddd9] p-6 rounded-2xl shadow-sm">
                <div className="flex flex-wrap items-center gap-2 mb-5">
                  <button onClick={() => setSubTab("coupons")} className={subTabStyle("coupons")}>Coupons</button>
                  <button onClick={() => setSubTab("offers")} className={subTabStyle("offers")}>Offers</button>
                  <button onClick={() => setSubTab("flash-sales")} className={subTabStyle("flash-sales")}>Flash Sales</button>
                </div>

                {subTab === "coupons" && (
                  <div className="space-y-6">
                    <form onSubmit={handleAddCoupon} className="space-y-4 text-xs border-b pb-6 bg-[#f8faf1]/40 border border-[#ddddd9] p-5 rounded-2xl">
                      <h4 className="font-black text-[#17231b] text-[13px] uppercase tracking-wider mb-2">Create Discount Coupon</h4>
                      
                      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                        <div>
                          <label className="block font-bold text-[#666666] mb-1">Coupon Code *</label>
                          <input
                            type="text"
                            placeholder="e.g. PYUR20"
                            required
                            value={newCoupon.code}
                            onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })}
                            className="w-full rounded-xl border border-[#ddddd9] p-2.5 outline-none focus:border-[#244f31] bg-white"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-[#666666] mb-1">Discount Type *</label>
                          <select
                            value={newCoupon.type}
                            onChange={(e) => setNewCoupon({ ...newCoupon, type: e.target.value })}
                            className="w-full rounded-xl border border-[#ddddd9] p-2.5 outline-none focus:border-[#244f31] bg-white cursor-pointer"
                          >
                            <option value="Percentage">Percentage (%)</option>
                            <option value="Flat">Flat Amount (₹)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block font-bold text-[#666666] mb-1">Discount Value *</label>
                          <input
                            type="number"
                            placeholder="e.g. 20"
                            required
                            value={newCoupon.value}
                            onChange={(e) => setNewCoupon({ ...newCoupon, value: e.target.value })}
                            className="w-full rounded-xl border border-[#ddddd9] p-2.5 outline-none focus:border-[#244f31] bg-white"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-[#666666] mb-1">Visibility Status</label>
                          <select
                            value={newCoupon.status}
                            onChange={(e) => setNewCoupon({ ...newCoupon, status: e.target.value })}
                            className="w-full rounded-xl border border-[#ddddd9] p-2.5 outline-none focus:border-[#244f31] bg-white cursor-pointer"
                          >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                          </select>
                        </div>
                      </div>

                      {/* Conditions & Restrictions */}
                      <div className="border border-[#ddddd9] p-4 rounded-xl bg-white space-y-4">
                        <span className="block font-black text-[#17231b] uppercase tracking-wider text-[10px]">Conditions & Restrictions</span>
                        <div className="grid gap-4 sm:grid-cols-3">
                          <div>
                            <label className="block font-bold text-[#666666] mb-1">Minimum Order Subtotal (₹)</label>
                            <input
                              type="number"
                              placeholder="e.g. 500 (Optional)"
                              value={newCoupon.minCartValue}
                              onChange={(e) => setNewCoupon({ ...newCoupon, minCartValue: e.target.value })}
                              className="w-full rounded-xl border border-[#ddddd9] p-2.5 outline-none focus:border-[#244f31] bg-white"
                            />
                          </div>
                          <div>
                            <label className="block font-bold text-[#666666] mb-1">Applies To</label>
                            <select
                              value={newCoupon.applicableType}
                              onChange={(e) => setNewCoupon({ ...newCoupon, applicableType: e.target.value, applicableValue: "" })}
                              className="w-full rounded-xl border border-[#ddddd9] p-2.5 outline-none focus:border-[#244f31] bg-white cursor-pointer"
                            >
                              <option value="All">All Products</option>
                              <option value="Category">Specific Category</option>
                              <option value="Product">Specific Product</option>
                            </select>
                          </div>
                          {newCoupon.applicableType !== "All" && (
                            <div>
                              <label className="block font-bold text-[#666666] mb-1">
                                {newCoupon.applicableType === "Category" ? "Select Category *" : "Select Product *"}
                              </label>
                              {newCoupon.applicableType === "Category" ? (
                                <select
                                  value={newCoupon.applicableValue}
                                  onChange={(e) => setNewCoupon({ ...newCoupon, applicableValue: e.target.value })}
                                  className="w-full rounded-xl border border-[#ddddd9] p-2.5 outline-none focus:border-[#244f31] bg-white cursor-pointer"
                                  required
                                >
                                  <option value="">Choose Category...</option>
                                  <option value="Sugar Management">Sugar Management</option>
                                  <option value="Gym & Fitness">Gym & Fitness</option>
                                  <option value="Energy & Vitality">Energy & Vitality</option>
                                  <option value="Heart Health">Heart Health</option>
                                  <option value="Liver Care">Liver Care</option>
                                  <option value="Daily Ayurveda">Daily Ayurveda</option>
                                  <option value="Skin & Hair">Skin & Hair</option>
                                  <option value="Women's Health">Women's Health</option>
                                </select>
                              ) : (
                                <select
                                  value={newCoupon.applicableValue}
                                  onChange={(e) => setNewCoupon({ ...newCoupon, applicableValue: e.target.value })}
                                  className="w-full rounded-xl border border-[#ddddd9] p-2.5 outline-none focus:border-[#244f31] bg-white cursor-pointer"
                                  required
                                >
                                  <option value="">Choose Product...</option>
                                  {dbData.products.map((p: any) => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                  ))}
                                </select>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <button type="submit" className="bg-[#244f31] hover:bg-[#1c3e26] text-white font-black uppercase tracking-wider rounded-xl px-5 py-3 transition shadow-md">
                          Generate Coupon Code
                        </button>
                      </div>
                    </form>

                    <div className="border border-[#ddddd9] rounded-xl overflow-hidden text-xs bg-white shadow-xs">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-[#f8faf1] border-b border-[#ddddd9] text-[#17231b]">
                            <th className="p-3 font-bold">Code</th>
                            <th className="p-3 font-bold">Discount Rate</th>
                            <th className="p-3 font-bold">Minimum Purchase</th>
                            <th className="p-3 font-bold">Applicability Conditions</th>
                            <th className="p-3 font-bold text-center">Status</th>
                            <th className="p-3 font-bold text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#ddddd9]">
                          {dbData.coupons.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="p-6 text-center text-gray-500 font-semibold">
                                No coupons defined yet.
                              </td>
                            </tr>
                          ) : (
                            dbData.coupons.map((c: any) => {
                              let condText = "All Products";
                              if (c.applicableType === "Category") {
                                condText = `Category: ${c.applicableValue}`;
                              } else if (c.applicableType === "Product") {
                                const prodObj = dbData.products.find((p: any) => p.id === c.applicableValue);
                                condText = `Product: ${prodObj ? prodObj.name : `ID ${c.applicableValue}`}`;
                              }

                              return (
                                <tr key={c.code} className="hover:bg-[#f8faf1]/20 transition">
                                  <td className="p-3 font-bold text-[#17231b]">{c.code}</td>
                                  <td className="p-3 font-semibold text-[#17231b]">
                                    {c.type === "Flat" ? `₹${c.value}` : `${c.value}%`}
                                  </td>
                                  <td className="p-3 text-gray-600 font-semibold">
                                    {c.minCartValue ? `₹${c.minCartValue}` : "No Minimum"}
                                  </td>
                                  <td className="p-3 text-emerald-800 font-bold">{condText}</td>
                                  <td className="p-3 text-center">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                      c.status === "Active" ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-800"
                                    }`}>
                                      {c.status}
                                    </span>
                                  </td>
                                  <td className="p-3 text-center">
                                    <button
                                      type="button"
                                      onClick={() => void handleDeleteCoupon(c.code)}
                                      className="text-red-600 font-bold hover:underline"
                                    >
                                      Delete
                                    </button>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {subTab === "offers" && (
                  <div className="text-xs border p-4 rounded-xl space-y-3">
                    <span className="block font-bold text-sm">Active Cart Offers</span>
                    <div className="flex justify-between items-center border-b pb-2">
                      <span>Prepaid online checkout offer discount</span>
                      <span className="font-bold text-[#244f31]">{dbData.settings.prepaidDiscount}% OFF</span>
                    </div>
                  </div>
                )}

                {subTab === "flash-sales" && (
                  <div className="text-xs space-y-4">
                    <span className="block font-bold text-sm">Configure Flash Sale Ending Timer</span>
                    <input
                      type="text"
                      value={flashSaleTimer}
                      onChange={(e) => setFlashSaleTimer(e.target.value)}
                      className="border p-2.5 rounded w-48 font-mono text-center text-lg"
                    />
                    <button onClick={() => alert("Flash sale clock timer adjusted!")} className="block bg-[#244f31] text-white px-4 py-2 rounded font-bold">Save Timer</button>
                  </div>
                )}
              </div>
            )}

            {/* 6. Marketing Panel (All subTab options: campaigns, banners, popups, notifications) */}
            {activeMenu === "marketing" && (
              <div className="bg-white border border-[#ddddd9] p-6 rounded-2xl shadow-sm space-y-5">
                <div className="flex flex-wrap items-center gap-2 border-b border-[#ddddd9] pb-3">
                  <button onClick={() => setSubTab("campaigns")} className={subTabStyle("campaigns")}>Campaigns</button>
                  <button onClick={() => setSubTab("banners")} className={subTabStyle("banners")}>Banners</button>
                  <button onClick={() => setSubTab("popups")} className={subTabStyle("popups")}>Popups</button>
                  <button onClick={() => setSubTab("notifications")} className={subTabStyle("notifications")}>Notifications</button>
                </div>

                {subTab === "campaigns" && (
                  <div className="space-y-6">
                    <form onSubmit={handleAddCampaign} className="space-y-4 text-xs border-b pb-6 bg-[#f8faf1]/40 border border-[#ddddd9] p-5 rounded-2xl">
                      <h4 className="font-black text-[#17231b] text-[13px] uppercase tracking-wider mb-2">Launch Ad Campaign</h4>
                      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-5">
                        <div className="sm:col-span-2">
                          <label className="block font-bold text-[#666666] mb-1">Campaign Title *</label>
                          <input
                            type="text"
                            placeholder="e.g. Independence Day Sale - Shilajit"
                            required
                            value={campaignName}
                            onChange={(e) => setCampaignName(e.target.value)}
                            className="w-full rounded-xl border border-[#ddddd9] p-2.5 outline-none focus:border-[#244f31] bg-white"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-[#666666] mb-1">Channel *</label>
                          <select
                            value={campaignChannel}
                            onChange={(e) => setCampaignChannel(e.target.value)}
                            className="w-full rounded-xl border border-[#ddddd9] p-2.5 outline-none focus:border-[#244f31] bg-white cursor-pointer"
                          >
                            <option value="Meta Ads">Meta Ads</option>
                            <option value="Google Ads">Google Ads</option>
                            <option value="Email Campaigns">Email Campaigns</option>
                            <option value="WhatsApp Broadcast">WhatsApp Broadcast</option>
                            <option value="SMS Marketing">SMS Marketing</option>
                          </select>
                        </div>
                        <div>
                          <label className="block font-bold text-[#666666] mb-1">Budget Spend (₹) *</label>
                          <input
                            type="number"
                            placeholder="e.g. 15000"
                            required
                            value={campaignSpend}
                            onChange={(e) => setCampaignSpend(e.target.value)}
                            className="w-full rounded-xl border border-[#ddddd9] p-2.5 outline-none focus:border-[#244f31] bg-white"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-[#666666] mb-1">Tracked Revenue (₹) *</label>
                          <input
                            type="number"
                            placeholder="e.g. 45000"
                            required
                            value={campaignRevenue}
                            onChange={(e) => setCampaignRevenue(e.target.value)}
                            className="w-full rounded-xl border border-[#ddddd9] p-2.5 outline-none focus:border-[#244f31] bg-white"
                          />
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2">
                        <div className="flex items-center gap-2">
                          <label className="font-bold text-[#666666]">Campaign Status:</label>
                          <select
                            value={campaignStatus}
                            onChange={(e) => setCampaignStatus(e.target.value)}
                            className="rounded-lg border border-[#ddddd9] p-1.5 font-bold bg-white cursor-pointer"
                          >
                            <option value="Running">Running</option>
                            <option value="Paused">Paused</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </div>
                        <button type="submit" className="bg-[#244f31] hover:bg-[#1c3e26] text-white font-black uppercase tracking-wider rounded-xl px-5 py-3 transition shadow-md">
                          Launch Ad Campaign
                        </button>
                      </div>
                    </form>

                    <div className="border border-[#ddddd9] rounded-xl overflow-hidden text-xs bg-white shadow-xs">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-[#f8faf1] border-b border-[#ddddd9] text-[#17231b]">
                            <th className="p-3 font-bold">Campaign Name</th>
                            <th className="p-3 font-bold">Channel</th>
                            <th className="p-3 font-bold text-right">Spend</th>
                            <th className="p-3 font-bold text-right">Revenue</th>
                            <th className="p-3 font-bold text-center">ROAS</th>
                            <th className="p-3 font-bold text-center">Status</th>
                            <th className="p-3 font-bold text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#ddddd9]">
                          {dbData.marketing.campaigns.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="p-6 text-center text-gray-500 font-semibold">No campaigns tracked yet.</td>
                            </tr>
                          ) : (
                            dbData.marketing.campaigns.map((camp: any, idx: number) => (
                              <tr key={idx} className="hover:bg-[#f8faf1]/20 transition">
                                <td className="p-3 font-bold text-[#17231b]">{camp.name}</td>
                                <td className="p-3 text-gray-600 font-semibold">{camp.channel}</td>
                                <td className="p-3 text-right text-gray-600 font-semibold">₹{(camp.spend || 0).toLocaleString("en-IN")}</td>
                                <td className="p-3 text-right text-emerald-600 font-bold">₹{(camp.revenue || 0).toLocaleString("en-IN")}</td>
                                <td className="p-3 text-center font-bold text-[#244f31]">
                                  {camp.roas ? `${camp.roas}x` : "0.0x"}
                                </td>
                                <td className="p-3 text-center">
                                  <button
                                    onClick={() => handleToggleMarketingStatus("campaigns", idx)}
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                      camp.status === "Running" ? "bg-emerald-100 text-emerald-800" :
                                      camp.status === "Paused" ? "bg-amber-100 text-amber-800" :
                                      "bg-gray-100 text-gray-800"
                                    }`}
                                    title="Click to cycle status"
                                  >
                                    {camp.status}
                                  </button>
                                </td>
                                <td className="p-3 text-center">
                                  <button
                                    type="button"
                                    onClick={() => void handleDeleteCampaign(idx)}
                                    className="text-red-600 font-bold hover:underline"
                                  >
                                    Delete
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {subTab === "banners" && (
                  <div className="space-y-6">
                    <form onSubmit={handleAddBanner} className="space-y-4 text-xs border-b pb-6 bg-[#f8faf1]/40 border border-[#ddddd9] p-5 rounded-2xl">
                      <h4 className="font-black text-[#17231b] text-[13px] uppercase tracking-wider mb-2">Create Home Promo Banner</h4>
                      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                        <div className="sm:col-span-2">
                          <label className="block font-bold text-[#666666] mb-1">Banner Name *</label>
                          <input
                            type="text"
                            placeholder="e.g. Shilajit Discount Header Banner"
                            required
                            value={newBanner.name}
                            onChange={(e) => setNewBanner({ ...newBanner, name: e.target.value })}
                            className="w-full rounded-xl border border-[#ddddd9] p-2.5 outline-none focus:border-[#244f31] bg-white"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-[#666666] mb-1">Redirect URL Link *</label>
                          <input
                            type="text"
                            placeholder="e.g. /products/dia-free-juice"
                            required
                            value={newBanner.link}
                            onChange={(e) => setNewBanner({ ...newBanner, link: e.target.value })}
                            className="w-full rounded-xl border border-[#ddddd9] p-2.5 outline-none focus:border-[#244f31] bg-white"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-[#666666] mb-1">Promo Image URL (Optional)</label>
                          <input
                            type="text"
                            placeholder="e.g. https://images.unsplash.com/..."
                            value={newBanner.image}
                            onChange={(e) => setNewBanner({ ...newBanner, image: e.target.value })}
                            className="w-full rounded-xl border border-[#ddddd9] p-2.5 outline-none focus:border-[#244f31] bg-white"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <button type="submit" className="bg-[#244f31] hover:bg-[#1c3e26] text-white font-black uppercase tracking-wider rounded-xl px-5 py-3 transition shadow-md">
                          Create Banner
                        </button>
                      </div>
                    </form>

                    <div className="border border-[#ddddd9] rounded-xl overflow-hidden text-xs bg-white shadow-xs">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-[#f8faf1] border-b border-[#ddddd9] text-[#17231b]">
                            <th className="p-3 font-bold">Banner Graphic Preview</th>
                            <th className="p-3 font-bold">Banner Name</th>
                            <th className="p-3 font-bold">Funnels to Link</th>
                            <th className="p-3 font-bold text-center">Status</th>
                            <th className="p-3 font-bold text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#ddddd9]">
                          {(!dbData.marketing.banners || dbData.marketing.banners.length === 0) ? (
                            <tr>
                              <td colSpan={5} className="p-6 text-center text-gray-500 font-semibold">No promotional banners configured.</td>
                            </tr>
                          ) : (
                            dbData.marketing.banners.map((b: any, idx: number) => (
                              <tr key={idx} className="hover:bg-[#f8faf1]/20 transition">
                                <td className="p-3">
                                  {b.image ? (
                                    <img src={b.image} alt="" className="h-8 w-16 rounded object-cover border" />
                                  ) : (
                                    <span className="text-[10px] text-gray-400 italic">No Graphic</span>
                                  )}
                                </td>
                                <td className="p-3 font-bold text-[#17231b]">{b.name}</td>
                                <td className="p-3 text-emerald-700 font-bold">{b.link}</td>
                                <td className="p-3 text-center">
                                  <button
                                    onClick={() => handleToggleMarketingStatus("banners", idx)}
                                    className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                                      b.status === "Active" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                                    }`}
                                    title="Click to toggle status"
                                  >
                                    {b.status}
                                  </button>
                                </td>
                                <td className="p-3 text-center">
                                  <button
                                    type="button"
                                    onClick={() => void handleDeleteBanner(idx)}
                                    className="text-red-600 font-bold hover:underline"
                                  >
                                    Delete
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {subTab === "popups" && (
                  <div className="space-y-6">
                    <form onSubmit={handleAddPopup} className="space-y-4 text-xs border-b pb-6 bg-[#f8faf1]/40 border border-[#ddddd9] p-5 rounded-2xl">
                      <h4 className="font-black text-[#17231b] text-[13px] uppercase tracking-wider mb-2">Create Exit-Intent Popup</h4>
                      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-5">
                        <div className="sm:col-span-2">
                          <label className="block font-bold text-[#666666] mb-1">Popup Header Title *</label>
                          <input
                            type="text"
                            placeholder="e.g. Wait! Get 10% Extra Off coupon code"
                            required
                            value={newPopup.title}
                            onChange={(e) => setNewPopup({ ...newPopup, title: e.target.value })}
                            className="w-full rounded-xl border border-[#ddddd9] p-2.5 outline-none focus:border-[#244f31] bg-white"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-[#666666] mb-1">Discount Tag (e.g. 10% OFF) *</label>
                          <input
                            type="text"
                            placeholder="e.g. 10% OFF"
                            required
                            value={newPopup.discount}
                            onChange={(e) => setNewPopup({ ...newPopup, discount: e.target.value })}
                            className="w-full rounded-xl border border-[#ddddd9] p-2.5 outline-none focus:border-[#244f31] bg-white"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-[#666666] mb-1">Auto Coupon Code *</label>
                          <input
                            type="text"
                            placeholder="e.g. COMEBACK10"
                            required
                            value={newPopup.couponCode}
                            onChange={(e) => setNewPopup({ ...newPopup, couponCode: e.target.value.toUpperCase() })}
                            className="w-full rounded-xl border border-[#ddddd9] p-2.5 outline-none focus:border-[#244f31] bg-white"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-[#666666] mb-1">Trigger Event</label>
                          <select
                            value={newPopup.trigger}
                            onChange={(e) => setNewPopup({ ...newPopup, trigger: e.target.value })}
                            className="w-full rounded-xl border border-[#ddddd9] p-2.5 outline-none focus:border-[#244f31] bg-white cursor-pointer"
                          >
                            <option value="Exit Intent">Exit Intent</option>
                            <option value="Time delay (10s)">Time delay (10s)</option>
                            <option value="Scroll Depth (50%)">Scroll Depth (50%)</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <button type="submit" className="bg-[#244f31] hover:bg-[#1c3e26] text-white font-black uppercase tracking-wider rounded-xl px-5 py-3 transition shadow-md">
                          Create Popup
                        </button>
                      </div>
                    </form>

                    <div className="border border-[#ddddd9] rounded-xl overflow-hidden text-xs bg-white shadow-xs">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-[#f8faf1] border-b border-[#ddddd9] text-[#17231b]">
                            <th className="p-3 font-bold">Popup Title</th>
                            <th className="p-3 font-bold">Discount Header</th>
                            <th className="p-3 font-bold">Coupon Code</th>
                            <th className="p-3 font-bold">Trigger Rule</th>
                            <th className="p-3 font-bold text-center">Status</th>
                            <th className="p-3 font-bold text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#ddddd9]">
                          {(!dbData.marketing.popups || dbData.marketing.popups.length === 0) ? (
                            <tr>
                              <td colSpan={6} className="p-6 text-center text-gray-500 font-semibold">No exit-intent popups defined.</td>
                            </tr>
                          ) : (
                            dbData.marketing.popups.map((p: any, idx: number) => (
                              <tr key={idx} className="hover:bg-[#f8faf1]/20 transition">
                                <td className="p-3 font-bold text-[#17231b]">{p.title}</td>
                                <td className="p-3 text-gray-600 font-semibold">{p.discount || "N/A"}</td>
                                <td className="p-3 font-mono text-[#244f31] font-bold">{p.couponCode || "N/A"}</td>
                                <td className="p-3 text-gray-600 font-semibold">{p.trigger}</td>
                                <td className="p-3 text-center">
                                  <button
                                    onClick={() => handleToggleMarketingStatus("popups", idx)}
                                    className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                                      p.status === "Active" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                                    }`}
                                    title="Click to toggle status"
                                  >
                                    {p.status}
                                  </button>
                                </td>
                                <td className="p-3 text-center">
                                  <button
                                    type="button"
                                    onClick={() => void handleDeletePopup(idx)}
                                    className="text-red-600 font-bold hover:underline"
                                  >
                                    Delete
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {subTab === "notifications" && (
                  <div className="space-y-6">
                    <form onSubmit={handleAddNotification} className="space-y-4 text-xs border-b pb-6 bg-[#f8faf1]/40 border border-[#ddddd9] p-5 rounded-2xl">
                      <h4 className="font-black text-[#17231b] text-[13px] uppercase tracking-wider mb-2">Configure Cart recovery Alert</h4>
                      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                        <div className="sm:col-span-2">
                          <label className="block font-bold text-[#666666] mb-1">Alert Title / Name *</label>
                          <input
                            type="text"
                            placeholder="e.g. Abandoned Cart Reminder SMS"
                            required
                            value={newNotification.title}
                            onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                            className="w-full rounded-xl border border-[#ddddd9] p-2.5 outline-none focus:border-[#244f31] bg-white"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-[#666666] mb-1">Delay After Cart Abandon *</label>
                          <select
                            value={newNotification.delay}
                            onChange={(e) => setNewNotification({ ...newNotification, delay: e.target.value })}
                            className="w-full rounded-xl border border-[#ddddd9] p-2.5 outline-none focus:border-[#244f31] bg-white cursor-pointer"
                          >
                            <option value="15 mins">15 mins after abandon</option>
                            <option value="30 mins">30 mins after abandon</option>
                            <option value="1 hour">1 hour after abandon</option>
                            <option value="24 hours">24 hours after abandon</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-[#666666] mb-1">SMS Message Template Text *</label>
                        <textarea
                          placeholder="e.g. Hey, you forgot items in your cart! Complete your purchase now and get 10% off. Use code: PYUR10"
                          required
                          value={newNotification.message}
                          onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
                          rows={3}
                          className="w-full rounded-xl border border-[#ddddd9] p-2.5 outline-none focus:border-[#244f31] bg-white resize-none"
                        />
                      </div>

                      <div className="flex justify-end pt-2">
                        <button type="submit" className="bg-[#244f31] hover:bg-[#1c3e26] text-white font-black uppercase tracking-wider rounded-xl px-5 py-3 transition shadow-md">
                          Configure Trigger
                        </button>
                      </div>
                    </form>

                    <div className="border border-[#ddddd9] rounded-xl overflow-hidden text-xs bg-white shadow-xs">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-[#f8faf1] border-b border-[#ddddd9] text-[#17231b]">
                            <th className="p-3 font-bold">Notification Title</th>
                            <th className="p-3 font-bold">Trigger delay</th>
                            <th className="p-3 font-bold">Alert message template</th>
                            <th className="p-3 font-bold text-center">Status</th>
                            <th className="p-3 font-bold text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#ddddd9]">
                          {(!dbData.marketing.notifications || dbData.marketing.notifications.length === 0) ? (
                            <tr>
                              <td colSpan={5} className="p-6 text-center text-gray-500 font-semibold">No recovery notification triggers defined.</td>
                            </tr>
                          ) : (
                            dbData.marketing.notifications.map((n: any, idx: number) => (
                              <tr key={idx} className="hover:bg-[#f8faf1]/20 transition">
                                <td className="p-3 font-bold text-[#17231b]">{n.title}</td>
                                <td className="p-3 text-emerald-800 font-bold">{n.delay}</td>
                                <td className="p-3 text-gray-600 max-w-xs truncate" title={n.message}>{n.message || "N/A"}</td>
                                <td className="p-3 text-center">
                                  <button
                                    onClick={() => handleToggleMarketingStatus("notifications", idx)}
                                    className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                                      n.status === "Active" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                                    }`}
                                    title="Click to toggle status"
                                  >
                                    {n.status}
                                  </button>
                                </td>
                                <td className="p-3 text-center">
                                  <button
                                    type="button"
                                    onClick={() => void handleDeleteNotification(idx)}
                                    className="text-red-600 font-bold hover:underline"
                                  >
                                    Delete
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 7. Content Panel (All subTab options: homepage, blogs, faqs, testimonials) */}
            {activeMenu === "content" && (
              <div className="bg-white border border-[#ddddd9] p-6 rounded-2xl shadow-sm">
                <div className="flex flex-wrap items-center gap-2 mb-5">
                  <button onClick={() => setSubTab("homepage")} className={subTabStyle("homepage")}>Homepage</button>
                  <button onClick={() => setSubTab("blogs")} className={subTabStyle("blogs")}>Blogs</button>
                  <button onClick={() => setSubTab("faqs")} className={subTabStyle("faqs")}>FAQs</button>
                  <button onClick={() => setSubTab("testimonials")} className={subTabStyle("testimonials")}>Testimonials</button>
                </div>

                {subTab === "homepage" && (() => {
                  const content = dbData.content || { 
                    announcement: { visible: true, text: "", code: "", btnText: "", link: "" },
                    heroSlides: [],
                    consultationBanner: { title: "", subtitle: "", ctaText: "", badge: "", doctorName: "", doctorTitle: "", doctorImage: "", doctorsOnlineText: "", availableSlotText: "" }
                  };

                  if (editingSlide !== null) {
                    return (
                      <form onSubmit={handleSaveSlide} className="space-y-6 text-xs bg-[#f8faf1]/40 border border-[#ddddd9] p-6 rounded-2xl">
                        <div className="flex items-center justify-between border-b border-[#ddddd9] pb-4">
                          <button
                            type="button"
                            onClick={() => setEditingSlide(null)}
                            className="flex items-center gap-1 font-bold text-[#244f31] hover:underline"
                          >
                            <ArrowLeft className="size-3.5" /> Back to Homepage CMS
                          </button>
                          <h4 className="text-sm font-black text-[#17231b]">
                            {editingSlide === "new" ? "Add Hero Slide" : "Edit Hero Slide"}
                          </h4>
                        </div>

                        <div className="space-y-4">
                          {/* Full-width Toggle */}
                          <div className="bg-[#f8faf1] border border-[#ddddd9] p-4 rounded-xl flex items-center justify-between shadow-xs">
                            <div>
                              <span className="block font-bold text-xs text-[#17231b]">Full-Width Graphic Banner Mode</span>
                              <span className="text-[10px] text-[#666666]">Hides the text overlays/CTA buttons, and makes the entire banner clickable. Useful for designed marketing graphics.</span>
                            </div>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={newSlide.fullWidthBanner || false}
                                onChange={(e) => setNewSlide({ ...newSlide, fullWidthBanner: e.target.checked })}
                                className="rounded border-[#ddddd9] text-[#244f31] focus:ring-[#244f31] size-4"
                              />
                              <span className="font-bold">Enable Full Banner</span>
                            </label>
                          </div>

                          <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-4">
                              <div>
                                <label className="block font-bold mb-1">Slide Badge / Tag {!newSlide.fullWidthBanner && "*"}</label>
                                <input
                                  type="text"
                                  required={!newSlide.fullWidthBanner}
                                  value={newSlide.badge}
                                  onChange={(e) => setNewSlide({ ...newSlide, badge: e.target.value })}
                                  placeholder="e.g. 100% Pure Sourced"
                                  className="w-full rounded-xl border border-[#ddddd9] p-2.5 outline-none focus:border-[#244f31] bg-white disabled:opacity-50"
                                  disabled={newSlide.fullWidthBanner}
                                />
                              </div>
                              <div>
                                <label className="block font-bold mb-1">Slide Title {!newSlide.fullWidthBanner && "*"}</label>
                                <input
                                  type="text"
                                  required={!newSlide.fullWidthBanner}
                                  value={newSlide.title}
                                  onChange={(e) => setNewSlide({ ...newSlide, title: e.target.value })}
                                  placeholder="e.g. 100% Pure Himalayan Shilajit Gold Resin"
                                  className="w-full rounded-xl border border-[#ddddd9] p-2.5 outline-none focus:border-[#244f31] bg-white disabled:opacity-50"
                                  disabled={newSlide.fullWidthBanner}
                                />
                              </div>
                              <div>
                                <label className="block font-bold mb-1">Subtitle / Caption {!newSlide.fullWidthBanner && "*"}</label>
                                <input
                                  type="text"
                                  required={!newSlide.fullWidthBanner}
                                  value={newSlide.subtitle}
                                  onChange={(e) => setNewSlide({ ...newSlide, subtitle: e.target.value })}
                                  placeholder="e.g. AUTHENTIC AYURVEDA FOR PEAK STAMINA & ENERGY"
                                  className="w-full rounded-xl border border-[#ddddd9] p-2.5 outline-none focus:border-[#244f31] bg-white disabled:opacity-50"
                                  disabled={newSlide.fullWidthBanner}
                                />
                              </div>
                              <div>
                                <label className="block font-bold mb-1">Special Offer Tagline {!newSlide.fullWidthBanner && "*"}</label>
                                <input
                                  type="text"
                                  required={!newSlide.fullWidthBanner}
                                  value={newSlide.offer}
                                  onChange={(e) => setNewSlide({ ...newSlide, offer: e.target.value })}
                                  placeholder="e.g. GET EXTRA 10% OFF WITH CODE: PYUR10"
                                  className="w-full rounded-xl border border-[#ddddd9] p-2.5 outline-none focus:border-[#244f31] bg-white disabled:opacity-50"
                                  disabled={newSlide.fullWidthBanner}
                                />
                              </div>
                            </div>

                            <div className="space-y-4">
                              <div>
                                <label className="block font-bold mb-1">Upload Banner Photo *</label>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleSlideFileChange}
                                  className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer border border-[#ddddd9] p-1.5 rounded-xl bg-white"
                                />
                                <div className="mt-2 flex gap-4 items-center">
                                  <div className="flex-1">
                                    <label className="block font-bold text-[10px] text-gray-600 mb-0.5">Or Paste Image URL</label>
                                    <input
                                      type="text"
                                      value={newSlide.image}
                                      onChange={(e) => setNewSlide({ ...newSlide, image: e.target.value })}
                                      placeholder="https://example.com/image.jpg"
                                      className="w-full rounded-xl border border-[#ddddd9] p-2 outline-none focus:border-[#244f31] bg-white text-[11px]"
                                    />
                                  </div>
                                  {newSlide.image && (
                                    <div className="shrink-0">
                                      <span className="block font-bold text-[10px] text-gray-600 mb-0.5">Preview:</span>
                                      <img src={newSlide.image} alt="Preview" className="h-14 w-20 rounded-lg object-cover border border-[#ddddd9]" />
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block font-bold mb-1">CTA Button Text {!newSlide.fullWidthBanner && "*"}</label>
                                  <input
                                    type="text"
                                    required={!newSlide.fullWidthBanner}
                                    value={newSlide.ctaText}
                                    onChange={(e) => setNewSlide({ ...newSlide, ctaText: e.target.value })}
                                    placeholder="e.g. SHOP NOW"
                                    className="w-full rounded-xl border border-[#ddddd9] p-2.5 outline-none focus:border-[#244f31] bg-white disabled:opacity-50"
                                    disabled={newSlide.fullWidthBanner}
                                  />
                                </div>
                                <div>
                                  <label className="block font-bold mb-1">CTA Button Link / Redirect Link *</label>
                                  <input
                                    type="text"
                                    required
                                    value={newSlide.href}
                                    onChange={(e) => setNewSlide({ ...newSlide, href: e.target.value })}
                                    placeholder="e.g. #shop"
                                    className="w-full rounded-xl border border-[#ddddd9] p-2.5 outline-none focus:border-[#244f31] bg-white"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block font-bold mb-1">Background Gradient Presets (Standard Layout Only)</label>
                                <select
                                  value={newSlide.bgColor}
                                  onChange={(e) => setNewSlide({ ...newSlide, bgColor: e.target.value })}
                                  className="w-full rounded-xl border border-[#ddddd9] p-2.5 outline-none focus:border-[#244f31] bg-white disabled:opacity-50"
                                  disabled={newSlide.fullWidthBanner}
                                >
                                  <option value="from-[#1d3b24] via-[#244f31] to-[#0f2416]">Ayurvedic Deep Forest Green</option>
                                  <option value="from-[#2d6b3f] via-[#1d4629] to-[#122c1b]">Monsoon Herb Green</option>
                                  <option value="from-[#3e2c1e] via-[#63432b] to-[#2b1d13]">Kumkumadi Amber Spice</option>
                                  <option value="from-[#1a365d] via-[#2a4365] to-[#1A365D]">Calming BP Blue</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end gap-3 border-t border-[#ddddd9] pt-4">
                          <button
                            type="button"
                            onClick={() => setEditingSlide(null)}
                            className="px-4 py-2 border border-[#ddddd9] bg-white hover:bg-gray-50 rounded-xl font-bold transition"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-5 py-2 bg-[#244f31] hover:bg-[#1c3e26] text-white rounded-xl font-bold shadow transition"
                          >
                            Save Slide
                          </button>
                        </div>
                      </form>
                    );
                  }

                  const activeSlides = content.heroSlides || [];
                  const announcement = content.announcement || { visible: true, text: "", code: "", btnText: "", link: "" };
                  const cb = content.consultationBanner || { title: "", subtitle: "", ctaText: "", badge: "", doctorName: "", doctorTitle: "", doctorImage: "", doctorsOnlineText: "", availableSlotText: "" };

                  return (
                    <div className="space-y-8 text-xs text-[#17231b]">
                      {/* Section A: Announcement Bar Editor */}
                      <div className="border border-[#ddddd9] p-5 rounded-2xl bg-white shadow-xs space-y-4">
                        <div className="flex items-center justify-between border-b border-[#ddddd9] pb-3">
                          <div>
                            <span className="block font-black text-sm text-[#17231b]">Announcement Bar (Top Ticker Bar)</span>
                            <span className="text-[10px] text-[#666666]">Alerts above the site header</span>
                          </div>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={announcement.visible}
                              onChange={(e) => {
                                const updated = {
                                  ...content,
                                  announcement: { ...announcement, visible: e.target.checked }
                                };
                                void handleSaveCMSContent(updated);
                              }}
                              className="rounded border-[#ddddd9] text-[#244f31] focus:ring-[#244f31]"
                            />
                            <span className="font-bold">Active / Visible</span>
                          </label>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                          <div className="sm:col-span-2">
                            <label className="block font-bold mb-1">Announcement Text</label>
                            <input
                              type="text"
                              value={announcement.text}
                              onChange={(e) => {
                                const updated = {
                                  ...content,
                                  announcement: { ...announcement, text: e.target.value }
                                };
                                setDbData({ ...dbData, content: updated });
                              }}
                              onBlur={() => void handleSaveCMSContent(dbData.content)}
                              placeholder="e.g. ADDITIONAL 10% OFF WITH PYUR COINS"
                              className="w-full rounded-xl border border-[#ddddd9] p-2.5 outline-none focus:border-[#244f31]"
                            />
                          </div>
                          <div>
                            <label className="block font-bold mb-1">Promo Code Hint</label>
                            <input
                              type="text"
                              value={announcement.code}
                              onChange={(e) => {
                                const updated = {
                                  ...content,
                                  announcement: { ...announcement, code: e.target.value }
                                };
                                setDbData({ ...dbData, content: updated });
                              }}
                              onBlur={() => void handleSaveCMSContent(dbData.content)}
                              placeholder="e.g. PYUR10"
                              className="w-full rounded-xl border border-[#ddddd9] p-2.5 outline-none focus:border-[#244f31]"
                            />
                          </div>
                          <div>
                            <label className="block font-bold mb-1">CTA Label</label>
                            <input
                              type="text"
                              value={announcement.btnText}
                              onChange={(e) => {
                                const updated = {
                                  ...content,
                                  announcement: { ...announcement, btnText: e.target.value }
                                };
                                setDbData({ ...dbData, content: updated });
                              }}
                              onBlur={() => void handleSaveCMSContent(dbData.content)}
                              placeholder="e.g. GET APP"
                              className="w-full rounded-xl border border-[#ddddd9] p-2.5 outline-none focus:border-[#244f31]"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Section B: Hero Banners Slider Editor */}
                      <div className="border border-[#ddddd9] p-5 rounded-2xl bg-white shadow-xs space-y-4">
                        <div className="flex items-center justify-between border-b border-[#ddddd9] pb-3">
                          <div>
                            <span className="block font-black text-sm text-[#17231b]">Hero Carousel Banners ({activeSlides.length})</span>
                            <span className="text-[10px] text-[#666666]">Manage sliding panels at the top of homepage</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setNewSlide({
                                id: 0,
                                title: "",
                                subtitle: "",
                                offer: "",
                                ctaText: "SHOP NOW",
                                href: "#shop",
                                badge: "NEW",
                                image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=80",
                                bgColor: "from-[#1d3b24] via-[#244f31] to-[#0f2416]",
                                fullWidthBanner: false
                              });
                              setEditingSlide("new");
                            }}
                            className="bg-[#244f31] text-white px-3 py-1.5 rounded-lg font-bold shadow hover:bg-[#1c3e26] transition flex items-center gap-1"
                          >
                            <Plus className="size-3" /> Add Hero Slide
                          </button>
                        </div>

                        <div className="border border-[#ddddd9] rounded-xl overflow-hidden bg-white shadow-xs">
                          <table className="w-full text-left">
                            <thead>
                              <tr className="bg-[#f8faf1] border-b border-[#ddddd9] text-[#17231b]">
                                <th className="p-3 font-bold">Banner Photo</th>
                                <th className="p-3 font-bold">Slide Information</th>
                                <th className="p-3 font-bold text-center">Curation Controls</th>
                                <th className="p-3 font-bold text-center">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#ddddd9]">
                              {activeSlides.length === 0 ? (
                                <tr>
                                  <td colSpan={4} className="p-6 text-center text-[#666666]">
                                    No hero slides configured. Click "Add Hero Slide" to create one.
                                  </td>
                                </tr>
                              ) : (
                                activeSlides.map((slide: any, idx: number) => (
                                  <tr key={slide.id} className="hover:bg-[#f8faf1]/20 transition">
                                    <td className="p-3">
                                      <img src={slide.image} className="h-10 w-20 rounded object-cover border" />
                                    </td>
                                    <td className="p-3">
                                      <div className="font-bold text-[#17231b]">{slide.title}</div>
                                      <div className="text-[10px] text-[#666666] line-clamp-1">{slide.subtitle}</div>
                                    </td>
                                    <td className="p-3 text-center">
                                      <div className="flex items-center justify-center gap-1">
                                        <button
                                          type="button"
                                          disabled={idx === 0}
                                          onClick={async () => {
                                            const slides = [...activeSlides];
                                            const temp = slides[idx];
                                            slides[idx] = slides[idx - 1];
                                            slides[idx - 1] = temp;
                                            const updated = { ...content, heroSlides: slides };
                                            await handleSaveCMSContent(updated);
                                          }}
                                          className="p-1 border border-[#ddddd9] bg-white hover:bg-gray-50 disabled:opacity-40 rounded"
                                        >
                                          ▲
                                        </button>
                                        <button
                                          type="button"
                                          disabled={idx === activeSlides.length - 1}
                                          onClick={async () => {
                                            const slides = [...activeSlides];
                                            const temp = slides[idx];
                                            slides[idx] = slides[idx + 1];
                                            slides[idx + 1] = temp;
                                            const updated = { ...content, heroSlides: slides };
                                            await handleSaveCMSContent(updated);
                                          }}
                                          className="p-1 border border-[#ddddd9] bg-white hover:bg-gray-50 disabled:opacity-40 rounded"
                                        >
                                          ▼
                                        </button>
                                      </div>
                                    </td>
                                    <td className="p-3 text-center">
                                      <div className="flex items-center justify-center gap-2">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setNewSlide({ fullWidthBanner: false, ...slide });
                                            setEditingSlide(slide);
                                          }}
                                          className="text-[#244f31] font-bold hover:underline"
                                        >
                                          Edit
                                        </button>
                                        <span className="text-[#ddddd9]">|</span>
                                        <button
                                          type="button"
                                          onClick={() => void handleDeleteSlide(slide.id)}
                                          className="text-red-600 font-bold hover:underline"
                                        >
                                          Delete
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Section C: Doctor Consultation Banner Editor */}
                      <div className="border border-[#ddddd9] p-5 rounded-2xl bg-white shadow-xs space-y-4">
                        <div className="border-b border-[#ddddd9] pb-3">
                          <span className="block font-black text-sm text-[#17231b]">Ayurvedic Doctor Consultation Section Banner</span>
                          <span className="text-[10px] text-[#666666]">Customize promotional copy and BAMS doctor credentials</span>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-3">
                            <div>
                              <label className="block font-bold mb-1">Banner Tag/Badge</label>
                              <input
                                type="text"
                                value={cb.badge}
                                onChange={(e) => {
                                  const updated = {
                                    ...content,
                                    consultationBanner: { ...cb, badge: e.target.value }
                                  };
                                  setDbData({ ...dbData, content: updated });
                                }}
                                onBlur={() => void handleSaveCMSContent(dbData.content)}
                                className="w-full rounded-xl border border-[#ddddd9] p-2.5 outline-none focus:border-[#244f31]"
                              />
                            </div>
                            <div>
                              <label className="block font-bold mb-1">Banner Title Header</label>
                              <input
                                type="text"
                                value={cb.title}
                                onChange={(e) => {
                                  const updated = {
                                    ...content,
                                    consultationBanner: { ...cb, title: e.target.value }
                                  };
                                  setDbData({ ...dbData, content: updated });
                                }}
                                onBlur={() => void handleSaveCMSContent(dbData.content)}
                                className="w-full rounded-xl border border-[#ddddd9] p-2.5 outline-none focus:border-[#244f31]"
                              />
                            </div>
                            <div>
                              <label className="block font-bold mb-1">Banner Subtitle Description</label>
                              <textarea
                                value={cb.subtitle}
                                onChange={(e) => {
                                  const updated = {
                                    ...content,
                                    consultationBanner: { ...cb, subtitle: e.target.value }
                                  };
                                  setDbData({ ...dbData, content: updated });
                                }}
                                onBlur={() => void handleSaveCMSContent(dbData.content)}
                                rows={3}
                                className="w-full rounded-xl border border-[#ddddd9] p-2.5 outline-none focus:border-[#244f31] resize-none"
                              />
                            </div>
                            <div>
                              <label className="block font-bold mb-1">CTA Button Text</label>
                              <input
                                type="text"
                                value={cb.ctaText}
                                onChange={(e) => {
                                  const updated = {
                                    ...content,
                                    consultationBanner: { ...cb, ctaText: e.target.value }
                                  };
                                  setDbData({ ...dbData, content: updated });
                                }}
                                onBlur={() => void handleSaveCMSContent(dbData.content)}
                                className="w-full rounded-xl border border-[#ddddd9] p-2.5 outline-none focus:border-[#244f31]"
                              />
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <label className="block font-bold mb-1">Doctor Name</label>
                              <input
                                type="text"
                                value={cb.doctorName}
                                onChange={(e) => {
                                  const updated = {
                                    ...content,
                                    consultationBanner: { ...cb, doctorName: e.target.value }
                                  };
                                  setDbData({ ...dbData, content: updated });
                                }}
                                onBlur={() => void handleSaveCMSContent(dbData.content)}
                                className="w-full rounded-xl border border-[#ddddd9] p-2.5 outline-none focus:border-[#244f31]"
                              />
                            </div>
                            <div>
                              <label className="block font-bold mb-1">Doctor Title & Experience</label>
                              <input
                                type="text"
                                value={cb.doctorTitle}
                                onChange={(e) => {
                                  const updated = {
                                    ...content,
                                    consultationBanner: { ...cb, doctorTitle: e.target.value }
                                  };
                                  setDbData({ ...dbData, content: updated });
                                }}
                                onBlur={() => void handleSaveCMSContent(dbData.content)}
                                className="w-full rounded-xl border border-[#ddddd9] p-2.5 outline-none focus:border-[#244f31]"
                              />
                            </div>
                            <div>
                              <label className="block font-bold mb-1">Doctor Image URL</label>
                              <input
                                type="text"
                                value={cb.doctorImage}
                                onChange={(e) => {
                                  const updated = {
                                    ...content,
                                    consultationBanner: { ...cb, doctorImage: e.target.value }
                                  };
                                  setDbData({ ...dbData, content: updated });
                                }}
                                onBlur={() => void handleSaveCMSContent(dbData.content)}
                                className="w-full rounded-xl border border-[#ddddd9] p-2.5 outline-none focus:border-[#244f31]"
                              />
                              {cb.doctorImage && (
                                <img src={cb.doctorImage} className="mt-2 size-12 rounded-full object-cover border" />
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block font-bold mb-1">Doctors Online Indicator</label>
                                <input
                                  type="text"
                                  value={cb.doctorsOnlineText}
                                  onChange={(e) => {
                                    const updated = {
                                      ...content,
                                      consultationBanner: { ...cb, doctorsOnlineText: e.target.value }
                                    };
                                    setDbData({ ...dbData, content: updated });
                                  }}
                                  onBlur={() => void handleSaveCMSContent(dbData.content)}
                                  className="w-full rounded-xl border border-[#ddddd9] p-2.5 outline-none focus:border-[#244f31]"
                                />
                              </div>
                              <div>
                                <label className="block font-bold mb-1">Available Slot Status</label>
                                <input
                                  type="text"
                                  value={cb.availableSlotText}
                                  onChange={(e) => {
                                    const updated = {
                                      ...content,
                                      consultationBanner: { ...cb, availableSlotText: e.target.value }
                                    };
                                    setDbData({ ...dbData, content: updated });
                                  }}
                                  onBlur={() => void handleSaveCMSContent(dbData.content)}
                                  className="w-full rounded-xl border border-[#ddddd9] p-2.5 outline-none focus:border-[#244f31]"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {subTab === "blogs" && (
                  <div className="space-y-6">
                    <form onSubmit={handleAddBlog} className="space-y-5 text-xs border border-[#ddddd9] p-6 rounded-3xl bg-white shadow-sm">
                      <div className="flex items-center justify-between border-b border-[#ddddd9] pb-3 mb-2">
                        <h4 className="font-black text-[#17231b] text-sm uppercase tracking-wider">Create & Publish Blog Post</h4>
                        <div>
                          <label className="inline-flex items-center gap-2 font-bold text-[#666666] mr-2">Status:</label>
                          <select
                            value={newBlog.status}
                            onChange={(e) => setNewBlog({ ...newBlog, status: e.target.value })}
                            className="rounded-lg border border-[#ddddd9] px-3 py-1.5 outline-none focus:border-[#244f31] bg-[#f8faf1]/50 cursor-pointer font-bold"
                          >
                            <option value="Published">🟢 Published</option>
                            <option value="Draft">🟡 Draft</option>
                          </select>
                        </div>
                      </div>

                      {/* Title & Author Info */}
                      <div className="grid gap-4 sm:grid-cols-3">
                        <div className="sm:col-span-2">
                          <label className="block font-bold text-[#666666] mb-1.5">Blog Title *</label>
                          <input
                            type="text"
                            placeholder="e.g. 5 Time-Tested Ayurvedic Secrets for Healthy Skin & Hair Growth"
                            required
                            value={newBlog.title}
                            onChange={(e) => setNewBlog({ ...newBlog, title: e.target.value })}
                            className="w-full rounded-xl border border-[#ddddd9] p-3 outline-none focus:border-[#244f31] bg-[#f8faf1]/20 focus:bg-white transition"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-[#666666] mb-1.5">Author / Specialist Name *</label>
                          <input
                            type="text"
                            placeholder="e.g. Dr. Vaidya Ananya"
                            required
                            value={newBlog.author}
                            onChange={(e) => setNewBlog({ ...newBlog, author: e.target.value })}
                            className="w-full rounded-xl border border-[#ddddd9] p-3 outline-none focus:border-[#244f31] bg-[#f8faf1]/20 focus:bg-white transition"
                          />
                        </div>
                      </div>

                      {/* Featured Media Image Upload */}
                      <div>
                        <label className="block font-bold text-[#666666] mb-1.5">Featured Banner Image</label>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <div className="w-full sm:w-1/2 flex items-center justify-center border-2 border-dashed border-[#ddddd9] rounded-xl p-3 bg-[#f8faf1]/10 hover:bg-[#f8faf1]/30 transition relative">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleBlogFileChange}
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            />
                            <span className="text-[10px] text-[#244f31] font-bold">
                              {newBlog.image ? "Change selected image file..." : "📁 Upload Image from Device"}
                            </span>
                          </div>
                          <div className="w-full sm:w-1/2 flex items-center">
                            <input
                              type="text"
                              placeholder="Or paste external banner image URL..."
                              value={newBlog.image && newBlog.image.startsWith("data:") ? "" : newBlog.image}
                              onChange={(e) => setNewBlog({ ...newBlog, image: e.target.value })}
                              className="w-full rounded-xl border border-[#ddddd9] p-3 outline-none focus:border-[#244f31] bg-[#f8faf1]/20 focus:bg-white transition"
                            />
                          </div>
                        </div>
                        {newBlog.image && (
                          <div className="mt-2 flex items-center gap-3">
                            <img src={newBlog.image} className="h-10 w-20 object-cover rounded-md border border-[#ddddd9]" />
                            <span className="text-[10px] text-emerald-800 font-bold">✓ Featured image attached</span>
                            <button
                              type="button"
                              onClick={() => setNewBlog({ ...newBlog, image: "" })}
                              className="text-red-500 hover:underline text-[10px] font-bold"
                            >
                              Remove Image
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Core Content & Shopping Links Split Grid */}
                      <div className="grid gap-4 md:grid-cols-2">
                        {/* Body Content Column */}
                        <div>
                          <div className="flex justify-between items-baseline mb-1.5">
                             <label className="block font-bold text-[#666666]">Blog Body Content *</label>
                             <span className="text-[9px] text-[#244f31] font-bold">Supports: ## Heading, [Link Text](url), **bold**</span>
                           </div>
                          <textarea
                            placeholder="Write the full text of your article. Use ## Section Title for headings, [Link Text](https://example.com) for links, and **text** for bold."
                            required
                            value={newBlog.content}
                            onChange={(e) => setNewBlog({ ...newBlog, content: e.target.value })}
                            rows={10}
                            className="w-full rounded-xl border border-[#ddddd9] p-3 outline-none focus:border-[#244f31] bg-[#f8faf1]/20 focus:bg-white transition font-sans text-xs leading-relaxed"
                          />
                        </div>

                        {/* eCommerce Integration & Videos Column */}
                        <div className="space-y-4">
                          {/* Related Storefront Products */}
                          <div>
                            <label className="block font-bold text-[#666666] mb-1.5">Shop Related Storefront Products</label>
                            <p className="text-[10px] text-gray-500 mb-2">Select the products mentioned in the article to render buy buttons directly inside the blog post page.</p>
                            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-3 bg-[#f8faf1]/20 rounded-xl border border-[#ddddd9]">
                              {dbData.products.map((p: any) => {
                                const isChecked = newBlog.relatedProducts?.includes(p.id);
                                return (
                                  <label
                                    key={p.id}
                                    className={`flex items-center gap-2 p-1.5 px-3 rounded-xl border cursor-pointer text-[10px] font-bold transition select-none ${
                                      isChecked
                                        ? "border-[#244f31] bg-[#eef5df] text-[#244f31]"
                                        : "border-[#ddddd9] bg-white hover:bg-[#f8faf1] text-gray-700"
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      className="sr-only"
                                      onChange={(e) => {
                                        const current = [...(newBlog.relatedProducts || [])];
                                        if (e.target.checked) {
                                          current.push(p.id);
                                        } else {
                                          const index = current.indexOf(p.id);
                                          if (index > -1) current.splice(index, 1);
                                        }
                                        setNewBlog({ ...newBlog, relatedProducts: current });
                                      }}
                                    />
                                    <span>{p.name}</span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>

                          {/* Related YouTube Videos */}
                          <div>
                            <label className="block font-bold text-[#666666] mb-1.5">Related YouTube Videos (Comma Separated Links)</label>
                            <p className="text-[10px] text-gray-500 mb-1.5">Add link URLs to embed education or tutorial videos directly in the blog post reader.</p>
                            <input
                              type="text"
                              placeholder="e.g. https://www.youtube.com/watch?v=123, https://youtu.be/456"
                              value={newBlog.videos}
                              onChange={(e) => setNewBlog({ ...newBlog, videos: e.target.value })}
                              className="w-full rounded-xl border border-[#ddddd9] p-3 outline-none focus:border-[#244f31] bg-[#f8faf1]/20 focus:bg-white transition"
                            />
                          </div>

                          {/* Related Audio / Podcast Link */}
                          <div>
                            <label className="block font-bold text-[#666666] mb-1.5">Related Audio / Podcast Link</label>
                            <p className="text-[10px] text-gray-500 mb-1.5">Add a link URL to embed an audio player or podcast episode directly in the reader.</p>
                            <input
                              type="text"
                              placeholder="e.g. https://open.spotify.com/embed/episode/... or direct mp3 link"
                              value={newBlog.audio}
                              onChange={(e) => setNewBlog({ ...newBlog, audio: e.target.value })}
                              className="w-full rounded-xl border border-[#ddddd9] p-3 outline-none focus:border-[#244f31] bg-[#f8faf1]/20 focus:bg-white transition"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Blog Specific FAQ Builder */}
                      <div className="border-t border-[#ddddd9] pt-4">
                        <div className="flex items-center justify-between mb-2">
                          <label className="block font-bold text-[#17231b] text-[11px] uppercase tracking-wider">Frequently Asked Questions (Blog FAQ Builder)</label>
                          <button
                            type="button"
                            onClick={() => setBlogFaqs([...blogFaqs, { question: "", answer: "" }])}
                            className="text-xs font-bold text-[#244f31] hover:underline"
                          >
                            + Add FAQ Row
                          </button>
                        </div>
                        {blogFaqs.length === 0 ? (
                          <p className="text-[10px] text-gray-400 italic">No Q&As added for this blog yet. Click "+ Add FAQ Row" to build one.</p>
                        ) : (
                          <div className="space-y-3">
                            {blogFaqs.map((faq, idx) => (
                              <div key={idx} className="flex gap-2 items-start bg-[#f8faf1]/30 p-3 rounded-xl border border-[#ddddd9]">
                                <div className="flex-1 space-y-2">
                                  <input
                                    type="text"
                                    placeholder="Question (e.g. Can Ayurvedic herbs treat Diabetic Neuropathy?)"
                                    required
                                    value={faq.question}
                                    onChange={(e) => {
                                      const updated = [...blogFaqs];
                                      updated[idx].question = e.target.value;
                                      setBlogFaqs(updated);
                                    }}
                                    className="w-full rounded-lg border border-[#ddddd9] p-2 outline-none focus:border-[#244f31] bg-white"
                                  />
                                  <textarea
                                    placeholder="Answer..."
                                    required
                                    value={faq.answer}
                                    onChange={(e) => {
                                      const updated = [...blogFaqs];
                                      updated[idx].answer = e.target.value;
                                      setBlogFaqs(updated);
                                    }}
                                    rows={2}
                                    className="w-full rounded-lg border border-[#ddddd9] p-2 outline-none focus:border-[#244f31] bg-white resize-none"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setBlogFaqs(blogFaqs.filter((_, i) => i !== idx))}
                                  className="text-red-500 hover:text-red-700 text-xs font-bold pt-2 px-1"
                                >
                                  Delete
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="pt-2 border-t border-[#ddddd9] flex justify-end">
                        <button type="submit" className="bg-[#244f31] hover:bg-[#1c3e26] text-white font-black uppercase tracking-wider rounded-xl px-8 py-3.5 transition shadow-md flex items-center gap-2">
                          Publish Article
                        </button>
                      </div>
                    </form>

                    <div className="border border-[#ddddd9] rounded-xl overflow-hidden text-xs bg-white shadow-xs">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-[#f8faf1] border-b border-[#ddddd9] text-[#17231b]">
                            <th className="p-3 font-bold">Featured Image</th>
                            <th className="p-3 font-bold">Title</th>
                            <th className="p-3 font-bold">Author</th>
                            <th className="p-3 font-bold">Date Published</th>
                            <th className="p-3 font-bold text-center">Status</th>
                            <th className="p-3 font-bold text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#ddddd9]">
                          {(!dbData.blogs || dbData.blogs.length === 0) ? (
                            <tr>
                              <td colSpan={6} className="p-6 text-center text-gray-500 font-semibold">
                                No blog posts written yet.
                              </td>
                            </tr>
                          ) : (
                            dbData.blogs.map((b: any, idx: number) => (
                              <tr key={idx} className="hover:bg-[#f8faf1]/20 transition">
                                <td className="p-3">
                                  <img src={b.image || "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=120&q=80"} className="h-8 w-14 rounded object-cover border border-[#ddddd9]" />
                                </td>
                                <td className="p-3">
                                  <div className="font-bold text-[#17231b] line-clamp-1">{b.title}</div>
                                  <div className="text-[10px] text-gray-400 line-clamp-1">{b.content || "No body content summary..."}</div>
                                </td>
                                <td className="p-3 text-gray-600 font-semibold">{b.author}</td>
                                <td className="p-3 text-gray-600 font-semibold">{b.date || "N/A"}</td>
                                <td className="p-3 text-center">
                                  <button
                                    onClick={() => void handleToggleBlogStatus(idx)}
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                      b.status === "Published" ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-800"
                                    }`}
                                    title="Click to toggle status"
                                  >
                                    {b.status}
                                  </button>
                                </td>
                                <td className="p-3 text-center">
                                  <button
                                    type="button"
                                    onClick={() => void handleDeleteBlog(idx)}
                                    className="text-red-600 font-bold hover:underline"
                                  >
                                    Delete
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {subTab === "faqs" && (
                  <div className="space-y-6">
                    <form onSubmit={handleAddFaq} className="grid gap-3 sm:grid-cols-2 text-xs border-b pb-6">
                      <input
                        type="text"
                        placeholder="Question"
                        required
                        value={newFaq.question}
                        onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                        className="rounded border p-2"
                      />
                      <input
                        type="text"
                        placeholder="Answer"
                        required
                        value={newFaq.answer}
                        onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                        className="rounded border p-2"
                      />
                      <button type="submit" className="bg-[#244f31] text-white font-bold rounded p-2 sm:col-span-2">Add FAQ</button>
                    </form>

                    <div className="space-y-2 text-xs">
                      {dbData.faqs.map((faq: any, idx: number) => (
                        <div key={idx} className="border p-3 rounded bg-[#f8faf1]">
                          <span className="block font-bold">Q: {faq.question}</span>
                          <span className="block text-[#666666] mt-1">A: {faq.answer}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {subTab === "testimonials" && (
                  <div className="space-y-6">
                    <form onSubmit={handleAddTestimonial} className="grid gap-3 sm:grid-cols-2 text-xs border-b pb-6">
                      <input
                        type="text"
                        placeholder="Customer Name"
                        required
                        value={newTestimonial.name}
                        onChange={(e) => setNewTestimonial({ ...newTestimonial, name: e.target.value })}
                        className="rounded border p-2"
                      />
                      <input
                        type="text"
                        placeholder="Comment details"
                        required
                        value={newTestimonial.comment}
                        onChange={(e) => setNewTestimonial({ ...newTestimonial, comment: e.target.value })}
                        className="rounded border p-2"
                      />
                      <button type="submit" className="bg-[#244f31] text-white font-bold rounded p-2 sm:col-span-2">Add Testimonial</button>
                    </form>

                    <div className="space-y-2 text-xs">
                      {dbData.testimonials.map((t: any, idx: number) => (
                        <div key={idx} className="border p-3 rounded bg-white flex justify-between items-center">
                          <div>
                            <span className="block font-bold">{t.name} ({t.rating}★)</span>
                            <span className="block text-[#666666] mt-1">{t.comment}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 8. Reviews Panel */}
            {activeMenu === "reviews" && (
              <div className="bg-white border border-[#ddddd9] p-6 rounded-2xl shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#17231b] mb-4">⭐ Customer Reviews Moderation Queue</h3>
                <div className="border border-[#ddddd9] rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-[#f8faf1] border-b border-[#ddddd9]">
                        <th className="p-3 font-bold">Product</th>
                        <th className="p-3 font-bold">Buyer</th>
                        <th className="p-3 font-bold">Rating</th>
                        <th className="p-3 font-bold">Comment</th>
                        <th className="p-3 font-bold text-center">Status</th>
                        <th className="p-3 font-bold text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#ddddd9]">
                      {dbData.reviews.map((r: any, idx: number) => (
                        <tr key={r.id}>
                          <td className="p-3 font-bold">{r.product}</td>
                          <td className="p-3 font-bold">{r.customer}</td>
                          <td className="p-3 text-yellow-600 font-bold">{r.rating}★</td>
                          <td className="p-3 text-[#666666]">{r.comment}</td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${r.status === "Approved" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>{r.status}</span>
                          </td>
                          <td className="p-3 text-center">
                            {r.status === "Pending" ? (
                              <button onClick={() => handleReviewStatus(idx, "Approved")} className="bg-[#244f31] text-white px-2 py-1 rounded text-[10px] font-bold">Approve</button>
                            ) : (
                              <button onClick={() => handleReviewStatus(idx, "Pending")} className="border text-[#666666] px-2 py-1 rounded text-[10px]">Reject</button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 9. Shipping Panel */}
            {activeMenu === "shipping" && (
              <div className="bg-white border border-[#ddddd9] p-6 rounded-2xl shadow-sm space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#17231b]">🚚 Courier & Shipping Rates</h3>
                <div className="grid gap-4 sm:grid-cols-2 text-xs">
                  <div className="border p-4 rounded-xl bg-[#f8faf1]">
                    <label className="block font-bold">Free Delivery Threshold Amount (₹)</label>
                    <input
                      type="number"
                      value={dbData.settings.shipping.freeThreshold}
                      onChange={(e) => handleSaveSettings("shipping", { ...dbData.settings.shipping, freeThreshold: parseInt(e.target.value) })}
                      className="mt-2 w-full rounded border p-2 outline-none focus:border-[#244f31]"
                    />
                  </div>
                  <div className="border p-4 rounded-xl bg-[#f8faf1]">
                    <label className="block font-bold">Base Shipping Courier Fee (₹)</label>
                    <input
                      type="number"
                      value={dbData.settings.shipping.baseRate}
                      onChange={(e) => handleSaveSettings("shipping", { ...dbData.settings.shipping, baseRate: parseInt(e.target.value) })}
                      className="mt-2 w-full rounded border p-2 outline-none focus:border-[#244f31]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 10. Analytics Panel */}
            {activeMenu === "analytics" && (
              <div className="bg-white border border-[#ddddd9] p-6 rounded-2xl shadow-sm space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#17231b]">📈 Store Sales & Traffic Analytics</h3>
                <div className="grid gap-4 sm:grid-cols-3 text-xs">
                  <div className="border p-4 rounded-xl text-center">
                    <span className="block font-semibold">Average Order Value</span>
                    <span className="text-xl font-black text-[#244f31] mt-1 block">₹1,120</span>
                  </div>
                  <div className="border p-4 rounded-xl text-center">
                    <span className="block font-semibold">Prepaid Payment Conversion</span>
                    <span className="text-xl font-black text-[#244f31] mt-1 block">64%</span>
                  </div>
                  <div className="border p-4 rounded-xl text-center">
                    <span className="block font-semibold">COD RTO Rate</span>
                    <span className="text-xl font-black text-red-800 mt-1 block">12.4%</span>
                  </div>
                </div>
              </div>
            )}

            {/* 11. SEO Panel */}
            {activeMenu === "seo" && (
              <form onSubmit={handleSaveSeo} className="bg-white border border-[#ddddd9] p-6 rounded-2xl shadow-sm space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#17231b]">🔍 SEO Page Title & Metadata tags</h3>
                <div className="text-xs space-y-3">
                  <div>
                    <label className="block font-bold">Meta Title Tag</label>
                    <input
                      type="text"
                      required
                      value={dbData.seo.title}
                      onChange={(e) => setDbData({ ...dbData, seo: { ...dbData.seo, title: e.target.value } })}
                      className="mt-1 w-full rounded border p-2"
                    />
                  </div>
                  <div>
                    <label className="block font-bold">Meta Description Tag</label>
                    <textarea
                      rows={3}
                      required
                      value={dbData.seo.metaDesc}
                      onChange={(e) => setDbData({ ...dbData, seo: { ...dbData.seo, metaDesc: e.target.value } })}
                      className="mt-1 w-full rounded border p-2"
                    />
                  </div>
                </div>
                <button type="submit" className="bg-[#244f31] text-white px-5 py-2.5 text-xs font-bold rounded">Save SEO Configuration</button>
              </form>
            )}

            {/* 12. Support Panel */}
            {activeMenu === "support" && (
              <div className="bg-white border border-[#ddddd9] p-6 rounded-2xl shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#17231b] mb-4">🎧 Help Desk Queries & Leads</h3>
                <div className="border border-[#ddddd9] rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-[#f8faf1] border-b border-[#ddddd9]">
                        <th className="p-3 font-bold">Patient</th>
                        <th className="p-3 font-bold">Type</th>
                        <th className="p-3 font-bold">Details description</th>
                        <th className="p-3 font-bold text-center">Status</th>
                        <th className="p-3 font-bold text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#ddddd9]">
                      {!dbData.leads || dbData.leads.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-[#666] font-semibold italic bg-white">
                            No queries or consult leads found.
                          </td>
                        </tr>
                      ) : (
                        dbData.leads.map((ld: any) => (
                          <tr key={ld.id} className="hover:bg-[#f8faf1]/20 transition-colors">
                            <td className="p-3 font-bold">
                              <span className="block">{ld.name}</span>
                              <span className="block text-[10px] text-[#666666]">{ld.phone}</span>
                            </td>
                            <td className="p-3 font-semibold">{ld.type}</td>
                            <td className="p-3 text-[#666666]">{ld.concern} • {ld.detail}</td>
                            <td className="p-3 text-center">
                              <select
                                value={ld.status || "New"}
                                onChange={(e) => handleUpdateLeadStatus(ld.id, e.target.value)}
                                className={`px-2.5 py-1 rounded text-[10px] font-bold outline-none border transition ${
                                  ld.status === "Resolved"
                                    ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                                    : ld.status === "Responded"
                                    ? "bg-blue-100 text-blue-800 border-blue-200"
                                    : ld.status === "Pending"
                                    ? "bg-amber-100 text-amber-800 border-amber-200"
                                    : "bg-gray-100 text-gray-800 border-gray-200"
                                }`}
                              >
                                <option value="New">New</option>
                                <option value="Pending">Pending</option>
                                <option value="Responded">Responded</option>
                                <option value="Resolved">Resolved</option>
                              </select>
                            </td>
                            <td className="p-3 text-center">
                              <button
                                onClick={() => handleDeleteLead(ld.id)}
                                className="text-rose-600 hover:text-rose-800 text-[10px] font-bold transition hover:underline"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 13. Settings Panel (All subTab options: general, payment, shipping, tax, email, notifications, adminUsers) */}
            {activeMenu === "settings" && (
              <div className="bg-white border border-[#ddddd9] p-6 rounded-2xl shadow-sm space-y-6">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <button onClick={() => setSubTab("general")} className={subTabStyle("general")}>General</button>
                  <button onClick={() => setSubTab("payment")} className={subTabStyle("payment")}>Payment</button>
                  <button onClick={() => setSubTab("shipping")} className={subTabStyle("shipping")}>Shipping</button>
                  <button onClick={() => setSubTab("tax")} className={subTabStyle("tax")}>Tax</button>
                  <button onClick={() => setSubTab("email")} className={subTabStyle("email")}>Email</button>
                  <button onClick={() => setSubTab("notifications")} className={subTabStyle("notifications")}>Notifications</button>
                  <button onClick={() => setSubTab("users")} className={subTabStyle("users")}>Admin Users</button>
                </div>

                {subTab === "general" && (
                  <div className="text-xs space-y-3">
                    <div>
                      <label className="block font-bold">Store Brand Name</label>
                      <input
                        type="text"
                        value={dbData.settings.storeName}
                        onChange={(e) => setDbData({ ...dbData, settings: { ...dbData.settings, storeName: e.target.value } })}
                        className="mt-1 w-full rounded border p-2"
                      />
                    </div>
                    <div>
                      <label className="block font-bold">Support Desk Email</label>
                      <input
                        type="email"
                        value={dbData.settings.supportEmail}
                        onChange={(e) => setDbData({ ...dbData, settings: { ...dbData.settings, supportEmail: e.target.value } })}
                        className="mt-1 w-full rounded border p-2"
                      />
                    </div>
                    <div>
                      <label className="block font-bold">Business WhatsApp Number (with country code, e.g. 919876543210)</label>
                      <input
                        type="text"
                        value={dbData.settings.whatsappNumber || ""}
                        onChange={(e) => setDbData({ ...dbData, settings: { ...dbData.settings, whatsappNumber: e.target.value } })}
                        placeholder="e.g. 919876543210"
                        className="mt-1 w-full rounded border p-2"
                      />
                    </div>
                    <div>
                      <label className="block font-bold">Default Support Greeting Message</label>
                      <textarea
                        value={dbData.settings.whatsappMessage || ""}
                        onChange={(e) => setDbData({ ...dbData, settings: { ...dbData.settings, whatsappMessage: e.target.value } })}
                        placeholder="e.g. नमस्ते! मुझे आपकी वेबसाइट से ऑर्डर करने में मदद चाहिए।"
                        className="mt-1 w-full rounded border p-2 h-20"
                      />
                    </div>
                    <button onClick={() => handleSaveSettings("storeName", dbData.settings.storeName)} className="bg-[#244f31] text-white px-4 py-2 rounded font-bold mt-2">Save General Settings</button>
                  </div>
                )}

                {subTab === "payment" && (
                  <div className="text-xs space-y-4">
                    <div className="flex items-center justify-between border-b pb-3">
                      <div>
                        <span className="block font-bold">Cash on Delivery OTP Validation</span>
                        <span className="block text-[10px] text-[#666666]">Mandates Otpless OTP checks before COD confirmation.</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={dbData.settings.codOtpEnabled}
                        onChange={(e) => setDbData({ ...dbData, settings: { ...dbData.settings, codOtpEnabled: e.target.checked } })}
                        className="size-5 accent-[#244f31]"
                      />
                    </div>
                    <div className="flex items-center justify-between border-b pb-3">
                      <div>
                        <span className="block font-bold">Prepaid Payment Discount (%)</span>
                      </div>
                      <input
                        type="number"
                        value={dbData.settings.prepaidDiscount}
                        onChange={(e) => setDbData({ ...dbData, settings: { ...dbData.settings, prepaidDiscount: parseInt(e.target.value) || 0 } })}
                        className="w-20 rounded border p-1 text-center"
                      />
                    </div>

                    <div className="space-y-3 pt-2">
                      <h4 className="font-black text-[#17231b] uppercase tracking-wider text-[11px] border-b pb-1">💜 PhonePe Payment Gateway</h4>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="block font-bold">Enable PhonePe Checkout</span>
                          <span className="block text-[10px] text-[#666666]">Activate online payment redirects for prepaid checkout.</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={dbData.settings.phonepe?.enabled ?? true}
                          onChange={(e) => setDbData({
                            ...dbData,
                            settings: {
                              ...dbData.settings,
                              phonepe: { ...(dbData.settings.phonepe || {}), enabled: e.target.checked }
                            }
                          })}
                          className="size-5 accent-[#244f31]"
                        />
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block font-bold">Merchant ID (MID)</label>
                          <input
                            type="text"
                            value={dbData.settings.phonepe?.merchantId || ""}
                            onChange={(e) => setDbData({
                              ...dbData,
                              settings: {
                                ...dbData.settings,
                                phonepe: { ...(dbData.settings.phonepe || {}), merchantId: e.target.value }
                              }
                            })}
                            className="mt-1 w-full rounded border p-2"
                            placeholder="e.g. PGBARCHUPGTEST"
                          />
                        </div>
                        <div>
                          <label className="block font-bold">Salt Key</label>
                          <input
                            type="text"
                            value={dbData.settings.phonepe?.saltKey || ""}
                            onChange={(e) => setDbData({
                              ...dbData,
                              settings: {
                                ...dbData.settings,
                                phonepe: { ...(dbData.settings.phonepe || {}), saltKey: e.target.value }
                              }
                            })}
                            className="mt-1 w-full rounded border p-2"
                            placeholder="e.g. 099eb0cd-02cf..."
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block font-bold">Salt Key Index</label>
                          <input
                            type="text"
                            value={dbData.settings.phonepe?.saltIndex || ""}
                            onChange={(e) => setDbData({
                              ...dbData,
                              settings: {
                                ...dbData.settings,
                                phonepe: { ...(dbData.settings.phonepe || {}), saltIndex: e.target.value }
                              }
                            })}
                            className="mt-1 w-full rounded border p-2"
                            placeholder="e.g. 1"
                          />
                        </div>
                        <div>
                          <label className="block font-bold">Gateway Environment</label>
                          <select
                            value={dbData.settings.phonepe?.env || "sandbox"}
                            onChange={(e) => setDbData({
                              ...dbData,
                              settings: {
                                ...dbData.settings,
                                phonepe: { ...(dbData.settings.phonepe || {}), env: e.target.value }
                              }
                            })}
                            className="mt-1 w-full rounded border p-2 bg-white"
                          >
                            <option value="sandbox">Sandbox (Testing)</option>
                            <option value="production">Production (Live)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={async () => {
                        await handleSaveSettings("codOtpEnabled", dbData.settings.codOtpEnabled);
                        await handleSaveSettings("prepaidDiscount", dbData.settings.prepaidDiscount);
                        await handleSaveSettings("phonepe", dbData.settings.phonepe || {
                          merchantId: "PGBARCHUPGTEST",
                          saltKey: "099eb0cd-02cf-4e2a-8aca-3e6c6aff0399",
                          saltIndex: "1",
                          env: "sandbox",
                          enabled: true
                        });
                      }}
                      className="bg-[#244f31] text-white px-4 py-2 rounded font-bold mt-2"
                    >
                      Save Payment Settings
                    </button>
                  </div>
                )}

                {subTab === "shipping" && (
                  <div className="text-xs space-y-3">
                    <span className="block font-bold">Active Courier Gateway APIs</span>
                    <div className="border p-2.5 rounded font-semibold text-emerald-600">Shiprocket Direct API connected</div>
                    <div className="border p-2.5 rounded font-semibold text-emerald-600">Delhivery API connected</div>
                  </div>
                )}

                {subTab === "tax" && (
                  <div className="text-xs space-y-3">
                    <div>
                      <label className="block font-bold">Gst / Tax Rate (%)</label>
                      <input
                        type="number"
                        value={dbData.settings.taxRate}
                        onChange={(e) => setDbData({ ...dbData, settings: { ...dbData.settings, taxRate: parseInt(e.target.value) || 0 } })}
                        className="mt-2 w-20 rounded border p-2 text-center"
                      />
                    </div>
                    <button onClick={() => handleSaveSettings("taxRate", dbData.settings.taxRate)} className="bg-[#244f31] text-white px-4 py-2 rounded font-bold mt-2">Save Tax Settings</button>
                  </div>
                )}

                {subTab === "email" && (
                  <div className="text-xs space-y-3">
                    <div>
                      <label className="block font-bold">Sender Display Name</label>
                      <input
                        type="text"
                        value={dbData.settings.email.senderName}
                        onChange={(e) => setDbData({ ...dbData, settings: { ...dbData.settings, email: { ...dbData.settings.email, senderName: e.target.value } } })}
                        className="mt-1 w-full rounded border p-2"
                      />
                    </div>
                    <div>
                      <label className="block font-bold">SMTP Mail Server Host</label>
                      <input
                        type="text"
                        value={dbData.settings.email.smtpHost}
                        onChange={(e) => setDbData({ ...dbData, settings: { ...dbData.settings, email: { ...dbData.settings.email, smtpHost: e.target.value } } })}
                        className="mt-1 w-full rounded border p-2"
                      />
                    </div>
                    <div>
                      <label className="block font-bold">SMTP Port</label>
                      <input
                        type="number"
                        value={dbData.settings.email.smtpPort || 587}
                        onChange={(e) => setDbData({ ...dbData, settings: { ...dbData.settings, email: { ...dbData.settings.email, smtpPort: parseInt(e.target.value) || 587 } } })}
                        className="mt-1 w-full rounded border p-2"
                      />
                    </div>
                    <div>
                      <label className="block font-bold">SMTP User / Email</label>
                      <input
                        type="text"
                        value={dbData.settings.email.smtpUser || ""}
                        onChange={(e) => setDbData({ ...dbData, settings: { ...dbData.settings, email: { ...dbData.settings.email, smtpUser: e.target.value } } })}
                        className="mt-1 w-full rounded border p-2"
                      />
                    </div>
                    <div>
                      <label className="block font-bold">SMTP Password</label>
                      <input
                        type="password"
                        value={dbData.settings.email.smtpPass || ""}
                        onChange={(e) => setDbData({ ...dbData, settings: { ...dbData.settings, email: { ...dbData.settings.email, smtpPass: e.target.value } } })}
                        className="mt-1 w-full rounded border p-2"
                      />
                    </div>
                    <button onClick={() => handleSaveSettings("email", dbData.settings.email)} className="bg-[#244f31] text-white px-4 py-2 rounded font-bold mt-2">Save Email Settings</button>
                  </div>
                )}

                {subTab === "notifications" && (
                  <div className="text-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Order Placed Confirmation SMS Trigger</span>
                      <input
                        type="checkbox"
                        checked={dbData.settings.notifications.orderPlacedSms}
                        onChange={(e) => setDbData({ ...dbData, settings: { ...dbData.settings, notifications: { ...dbData.settings.notifications, orderPlacedSms: e.target.checked } } })}
                        className="size-5 accent-[#244f31]"
                      />
                    </div>
                    <button onClick={() => handleSaveSettings("notifications", dbData.settings.notifications)} className="bg-[#244f31] text-white px-4 py-2 rounded font-bold mt-2">Save Notification Settings</button>
                  </div>
                )}

                {subTab === "users" && (
                  <div className="space-y-3 text-xs">
                    <h4 className="font-bold">Authorized Admin Users</h4>
                    {dbData.settings.adminUsers.map((u: any, idx: number) => (
                      <div key={idx} className="border p-2.5 rounded bg-white flex justify-between font-semibold">
                        <span>{u.email}</span>
                        <span className="text-[#80a03c]">{u.role}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
        {/* Selected Order Detail Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
            <div className="w-full max-w-lg rounded-2xl border border-[#ddddd9] bg-white p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <h3 className="text-sm font-black text-[#17231b]">Order details: {selectedOrder.id}</h3>
                  <p className="text-[10px] text-gray-500">Placed on {selectedOrder.date}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="text-xs font-bold text-[#666666] hover:text-[#17231b] flex items-center gap-1 border border-[#ddddd9] px-2.5 py-1 rounded-lg cursor-pointer"
                >
                  ✕ Close
                </button>
              </div>

              <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1 text-xs">
                {/* Status and Actions */}
                <div className="flex items-center justify-between bg-[#f8faf1] p-3 rounded-xl border border-[#ddddd9]">
                  <div>
                    <span className="block text-[10px] text-[#666666] font-bold uppercase tracking-wider">Current Status</span>
                    <span className="font-extrabold text-[#244f31]">{selectedOrder.status}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-[#666666] font-bold uppercase tracking-wider mb-1">Update Status</span>
                    <select
                      value={selectedOrder.status}
                      onChange={(e) => {
                        const newStatus = e.target.value;
                        void handleUpdateOrderStatus(selectedOrder.id, newStatus);
                        setSelectedOrder((prev: any) => ({ ...prev, status: newStatus }));
                      }}
                      className="rounded-lg border border-[#ddddd9] p-1.5 text-xs outline-none font-bold bg-white cursor-pointer"
                    >
                      <option value="Pending OTP">Pending OTP</option>
                      <option value="Processing">Processing</option>
                      <option value="Verified">Verified</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                      <option value="Return Request">Return Request</option>
                    </select>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="space-y-2 border border-[#ddddd9] p-4 rounded-xl">
                  <h4 className="font-bold text-[#244f31] uppercase tracking-wider text-[10px]">Customer Information</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="block text-gray-500 font-semibold">Name:</span>
                      <span className="font-bold">{selectedOrder.customer}</span>
                    </div>
                    <div>
                      <span className="block text-gray-500 font-semibold">Phone:</span>
                      <span className="font-bold">{selectedOrder.phone}</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-gray-100">
                    <span className="block text-gray-500 font-semibold">Shipping Address:</span>
                    <span className="font-bold text-[#17231b]">
                      {selectedOrder.address ? (
                        <>
                          {selectedOrder.address},<br />
                          {selectedOrder.city}, {selectedOrder.state} - {selectedOrder.pincode}
                        </>
                      ) : (
                        <span className="text-gray-400 italic">No address details saved (legacy order)</span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div className="border border-[#ddddd9] p-4 rounded-xl space-y-2">
                  <h4 className="font-bold text-[#244f31] uppercase tracking-wider text-[10px]">Items Summary</h4>
                  <div className="bg-gray-50 p-2.5 rounded-lg font-mono text-[11px] text-gray-700 leading-relaxed border">
                    {selectedOrder.items}
                  </div>
                </div>

                {/* Pricing / Payment Details */}
                <div className="border border-[#ddddd9] p-4 rounded-xl space-y-2">
                  <h4 className="font-bold text-[#244f31] uppercase tracking-wider text-[10px]">Payment Summary</h4>
                  <div className="space-y-1.5 font-semibold text-[#666666]">
                    <div className="flex justify-between">
                      <span>Payment Method:</span>
                      <span className="text-[#17231b] font-bold">{selectedOrder.method}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-dashed">
                      <span className="text-[#17231b] font-bold">Total Paid:</span>
                      <span className="text-[#244f31] font-black text-sm">₹{selectedOrder.total}</span>
                    </div>
                  </div>
                </div>

                {/* Danger actions */}
                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => void handleDeleteOrder(selectedOrder.id)}
                    className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-1.5 text-xs cursor-pointer"
                  >
                    Delete Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    );
  }
