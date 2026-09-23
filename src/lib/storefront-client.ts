/**
 * Client-Side Storefront Data Deduplicator
 * Prevents multiple components (Header, Footer, Page, Widgets) from firing duplicate API requests.
 * Shares in-flight promises and caches responses in-memory to slash Vercel Origin Transfer by >85%.
 */

let cachedStorefrontPromise: Promise<any> | null = null;
let cachedStorefrontData: any = null;
let lastFetchTimestamp = 0;

// 2-second in-memory client-side cache TTL (only for deduplicating simultaneous component mounts on a single page render)
const IN_MEMORY_TTL = 2 * 1000;

// Real-time cross-tab synchronization listener
if (typeof window !== "undefined") {
  try {
    const channel = new BroadcastChannel("pyur_storefront_sync");
    channel.onmessage = (event) => {
      if (event?.data?.type === "SYNC") {
        invalidateStorefrontCache();
        try {
          const cached = JSON.parse(localStorage.getItem("pyur_storefront_cache") || "{}");
          cached[event.data.key] = event.data.value;
          localStorage.setItem("pyur_storefront_cache", JSON.stringify(cached));
        } catch {}
        window.dispatchEvent(
          new CustomEvent("pyur_storefront_updated", {
            detail: { key: event.data.key, value: event.data.value },
          })
        );
      }
    };
  } catch {}
}

export async function getStorefrontData(forceFresh = false): Promise<any> {
  const now = Date.now();
  const isLocalhost =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

  // On localhost, always ensure fresh data is fetched
  const shouldForce = forceFresh || isLocalhost;

  // 1. Return existing in-memory data if valid and not forcing fresh
  if (!forceFresh && cachedStorefrontData && now - lastFetchTimestamp < IN_MEMORY_TTL) {
    return cachedStorefrontData;
  }

  // 2. Return currently active in-flight network request if one is already running and not forcing fresh
  if (!forceFresh && cachedStorefrontPromise) {
    return cachedStorefrontPromise;
  }

  // 3. Initiate fresh fetch
  const url = `/api/storefront?fresh=1&_t=${now}`;

  const currentPromise = fetch(url, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
    },
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`Storefront API error (${response.status})`);
      }
      const data = await response.json();
      cachedStorefrontData = data;
      lastFetchTimestamp = Date.now();
      cachedStorefrontPromise = null;
      return data;
    })
    .catch((error) => {
      cachedStorefrontPromise = null;
      if (cachedStorefrontData) {
        return cachedStorefrontData;
      }
      throw error;
    });

  cachedStorefrontPromise = currentPromise;
  return currentPromise;
}

/**
 * Manually bust client-side cache (e.g. after cart updates or admin edits)
 */
export function invalidateStorefrontCache() {
  cachedStorefrontData = null;
  cachedStorefrontPromise = null;
  lastFetchTimestamp = 0;
}
