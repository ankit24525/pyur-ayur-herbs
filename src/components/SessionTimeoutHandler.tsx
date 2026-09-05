"use client";

import { useEffect, useRef } from "react";

// 15 minutes of inactivity before auto-logout
const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000;
// Throttle saving last activity to localStorage to avoid excessive disk I/O
const THROTTLE_INTERVAL_MS = 10 * 1000; // 10 seconds
// Background checker frequency
const CHECK_INTERVAL_MS = 10 * 1000; // 10 seconds
// Active session refresh ping frequency (extends sliding server session)
const PING_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

export default function SessionTimeoutHandler() {
  const lastActiveRef = useRef<number>(Date.now());
  const lastPingRef = useRef<number>(Date.now());

  useEffect(() => {
    // Check if user is logged in
    const isUserLoggedIn = () => {
      if (typeof window === "undefined") return false;
      try {
        return !!localStorage.getItem("pyur_user");
      } catch {
        return false;
      }
    };

    const performLogout = () => {
      try {
        localStorage.removeItem("pyur_user");
        localStorage.removeItem("pyur_last_activity");
        localStorage.removeItem("pyur_session");
        sessionStorage.clear();
        document.cookie = "pyur_session=; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT";
      } catch {}

      try {
        fetch("/api/auth/logout", {
          method: "POST",
          credentials: "include",
          cache: "no-store",
          keepalive: true,
        }).catch(() => {});
      } catch {}

      // Notify all tabs / components in current tab
      window.dispatchEvent(new Event("pyur_auth_change"));

      if (window.location.pathname.startsWith("/profile") || window.location.pathname.startsWith("/checkout")) {
        window.location.href = "/login?expired=1";
      } else {
        if (typeof window.alert === "function") {
          window.alert("Session expired due to 15 minutes of inactivity.");
        }
      }
    };

    const checkInactivity = () => {
      if (!isUserLoggedIn()) return;

      let lastActive = lastActiveRef.current;
      try {
        const stored = localStorage.getItem("pyur_last_activity");
        if (stored) {
          const parsed = parseInt(stored, 10);
          if (!isNaN(parsed) && parsed > 0) {
            lastActive = Math.max(lastActive, parsed);
          }
        } else {
          // Initialize last activity if not present
          localStorage.setItem("pyur_last_activity", Date.now().toString());
          lastActive = Date.now();
        }
      } catch {}

      const elapsed = Date.now() - lastActive;
      if (elapsed >= INACTIVITY_TIMEOUT_MS) {
        performLogout();
      }
    };

    const recordActivity = () => {
      if (!isUserLoggedIn()) return;

      const now = Date.now();
      lastActiveRef.current = now;

      // Throttle writing to localStorage
      try {
        const stored = localStorage.getItem("pyur_last_activity");
        const parsed = stored ? parseInt(stored, 10) : 0;
        if (now - parsed >= THROTTLE_INTERVAL_MS) {
          localStorage.setItem("pyur_last_activity", now.toString());
        }
      } catch {}

      // Periodically refresh server session cookie while active
      if (now - lastPingRef.current >= PING_INTERVAL_MS) {
        lastPingRef.current = now;
        fetch("/api/auth/me", { credentials: "include", cache: "no-store" }).catch(() => {});
      }
    };

    // User activity listeners
    const activityEvents = ["mousedown", "keydown", "scroll", "touchstart", "click"];
    activityEvents.forEach((evt) => {
      window.addEventListener(evt, recordActivity, { passive: true });
    });

    // Check on tab visibility change & focus (e.g. user returns to inactive tab after 15m)
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        checkInactivity();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", checkInactivity);

    // Multi-tab sync: if another tab logs out or updates activity
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "pyur_user" && !e.newValue) {
        window.dispatchEvent(new Event("pyur_auth_change"));
        if (window.location.pathname.startsWith("/profile")) {
          window.location.href = "/login?expired=1";
        }
      } else if (e.key === "pyur_last_activity" && e.newValue) {
        const parsed = parseInt(e.newValue, 10);
        if (!isNaN(parsed)) {
          lastActiveRef.current = Math.max(lastActiveRef.current, parsed);
        }
      }
    };
    window.addEventListener("storage", handleStorage);

    // Periodic checker
    const timer = setInterval(checkInactivity, CHECK_INTERVAL_MS);

    // Initial check on mount
    checkInactivity();

    return () => {
      activityEvents.forEach((evt) => {
        window.removeEventListener(evt, recordActivity);
      });
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", checkInactivity);
      window.removeEventListener("storage", handleStorage);
      clearInterval(timer);
    };
  }, []);

  return null;
}
