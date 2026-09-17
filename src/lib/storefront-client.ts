/**
 * Client-Side Storefront Data Deduplicator
 * Prevents multiple components (Header, Footer, Page, Widgets) from firing duplicate API requests.
 * Shares in-flight promises and caches responses in-memory to slash Vercel Origin Transfer by >85%.
 */

let cachedStorefrontPromise: Promise<any> | null = null;
let cachedStorefrontData: any = null;
let lastFetchTimestamp = 0;

// 30-second in-memory client-side cache TTL
const IN_MEMORY_TTL = 30 * 1000;

export async function getStorefrontData(forceFresh = false): Promise<any> {
  const now = Date.now();

  // 1. Return existing in-memory data if valid
  if (!forceFresh && cachedStorefrontData && now - lastFetchTimestamp < IN_MEMORY_TTL) {
    return cachedStorefrontData;
  }

  // 2. Return currently active in-flight network request if one is already running
  if (!forceFresh && cachedStorefrontPromise) {
    return cachedStorefrontPromise;
  }

  // 3. Initiate single deduplicated fetch
  const url = forceFresh ? "/api/storefront?fresh=1" : "/api/storefront";

  cachedStorefrontPromise = fetch(url, {
    cache: forceFresh ? "no-store" : "default",
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
      // Fallback to existing cache if available even on error
      if (cachedStorefrontData) {
        return cachedStorefrontData;
      }
      throw error;
    });

  return cachedStorefrontPromise;
}

/**
 * Manually bust client-side cache (e.g. after cart updates or admin edits)
 */
export function invalidateStorefrontCache() {
  cachedStorefrontData = null;
  cachedStorefrontPromise = null;
  lastFetchTimestamp = 0;
}
