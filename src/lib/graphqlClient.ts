/**
 * A lightweight GraphQL client wrapper using native fetch.
 * Automatically injects the JWT bearer token if present in localStorage.
 * Automatically handles token expiration by executing silent refresh mutations.
 *
 * Caching features:
 * - Stale-while-revalidate: serves cached data immediately, refreshes in background
 * - Request deduplication: same in-flight query doesn't fire duplicate network calls
 * - Configurable TTLs: 2min fresh / 10min stale for most queries
 */

let activeRefreshPromise: Promise<string | null> | null = null;

async function attemptTokenRefresh(): Promise<string | null> {
  if (activeRefreshPromise) {
    console.log("[GraphQL Client] Token refresh already in progress. Reusing existing promise.");
    return activeRefreshPromise;
  }

  const refreshToken = localStorage.getItem("refresh_token");
  if (!refreshToken) {
    console.warn("[GraphQL Client] No refresh token found in localStorage.");
    return null;
  }

  const refreshMutation = `
    mutation RefreshToken($refreshToken: String!) {
      refreshToken(refreshTokenInput: { refreshToken: $refreshToken }) {
        access_token
        refresh_token
      }
    }
  `;

  activeRefreshPromise = (async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || "/graphql";

      console.log("[GraphQL Client] Attempting silent token refresh...");
      const response = await fetch(baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: refreshMutation,
          variables: { refreshToken },
        }),
      });

      if (!response.ok) {
        console.warn("[GraphQL Client] Token refresh HTTP request failed status:", response.status);
        return null;
      }

      const json = await response.json();
      if (json.errors && json.errors.length > 0) {
        console.error("[GraphQL Client] Token refresh GraphQL errors returned:", json.errors);
        return null;
      }

      const tokens = json.data?.refreshToken;
      if (tokens?.access_token) {
        console.log("[GraphQL Client] Token refresh successful. Saving new access token.");
        localStorage.setItem("jwt_token", tokens.access_token);
        if (tokens.refresh_token) {
          localStorage.setItem("refresh_token", tokens.refresh_token);
        }
        return tokens.access_token;
      } else {
        console.warn("[GraphQL Client] Token refresh returned no access token in payload:", json.data);
      }
    } catch (err) {
      console.error("[GraphQL Client] Token refresh exception caught:", err);
    } finally {
      activeRefreshPromise = null;
    }
    return null;
  })();

  return activeRefreshPromise;
}

// ── Cache Configuration ──────────────────────────────────────────────

interface CacheEntry {
  data: any;
  staleAt: number;    // Before this timestamp → data is fresh, return instantly
  expiresAt: number;  // Before this timestamp → data is stale but servable (background refresh)
                      // After this timestamp  → data is expired, must fetch fresh
}

const queryCache = new Map<string, CacheEntry>();
const inflightFetches = new Map<string, Promise<any>>();
const backgroundRefreshLocks = new Set<string>();

const DEFAULT_STALE_MS = 120_000;   // 2 minutes — data is considered "fresh"
const DEFAULT_EXPIRE_MS = 600_000;  // 10 minutes — stale data is served while refreshing

/**
 * Fetches fresh data in the background and updates the cache.
 * Only one background refresh per cache key runs at a time.
 */
async function backgroundRefresh(
  cacheKey: string,
  query: string,
  variables: Record<string, unknown>,
  options: RequestInit
): Promise<void> {
  if (backgroundRefreshLocks.has(cacheKey)) return;
  backgroundRefreshLocks.add(cacheKey);

  try {
    const token = localStorage.getItem("jwt_token");
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "/graphql";
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...((options.headers as Record<string, string>) || {}),
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(baseUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({ query, variables }),
      ...options,
    });

    if (!response.ok) return;

    const json = await response.json();
    if (json.data && !json.errors) {
      const now = Date.now();
      queryCache.set(cacheKey, {
        data: json.data,
        staleAt: now + DEFAULT_STALE_MS,
        expiresAt: now + DEFAULT_EXPIRE_MS,
      });
    }
  } catch {
    // Silently fail — stale data is better than nothing
  } finally {
    backgroundRefreshLocks.delete(cacheKey);
  }
}

// ── Main Request Function ────────────────────────────────────────────

export async function graphqlRequest<T = unknown>(
  query: string,
  variables: Record<string, unknown> = {},
  options: RequestInit = {}
): Promise<T> {
  const isMutation = query.trim().startsWith("mutation");
  const cacheKey = JSON.stringify({ query, variables });

  // ---- CACHE CHECK ----
  if (isMutation) {
    queryCache.clear();
  } else {
    const cached = queryCache.get(cacheKey);
    if (cached) {
      const now = Date.now();
      if (now < cached.staleAt) {
        // Fresh cache — return immediately, no fetch needed
        return cached.data as T;
      }
      if (now < cached.expiresAt) {
        // Stale but not expired — return cached, refresh in background
        backgroundRefresh(cacheKey, query, variables, options).catch(() => {});
        return cached.data as T;
      }
      // Expired — fall through to fetch fresh
    }
  }

  // ---- IN-FLIGHT DEDUPLICATION ----
  if (!isMutation && inflightFetches.has(cacheKey)) {
    return inflightFetches.get(cacheKey) as Promise<T>;
  }

  // ---- EXECUTION WRAPPER ----
  const requestPromise = (async (): Promise<T> => {
    const executeRequest = async (tokenToUse: string | null) => {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || "/graphql";

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...((options.headers as Record<string, string>) || {}),
      };

      if (tokenToUse) {
        headers["Authorization"] = `Bearer ${tokenToUse}`;
      }

      const response = await fetch(baseUrl, {
        method: "POST",
        headers,
        body: JSON.stringify({ query, variables }),
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
      }

      return response.json() as Promise<{
        data?: T;
        errors?: Array<{ message: string }>;
      }>;
    };

    const initialToken = localStorage.getItem("jwt_token");
    let json = await executeRequest(initialToken);

    if (json.errors && json.errors.length > 0) {
      const firstError = json.errors[0] as Record<string, unknown>;
      const errorMsg = (firstError?.message as string) || "Unknown GraphQL error";
      const extensions = firstError?.extensions as Record<string, unknown> | undefined;
      const originalError = extensions?.originalError as Record<string, unknown> | undefined;

      const isAuthError =
        extensions?.code === "UNAUTHENTICATED" ||
        originalError?.statusCode === 401 ||
        errorMsg.toLowerCase().includes("invalid or expired token") ||
        errorMsg.toLowerCase().includes("unauthorized") ||
        errorMsg.toLowerCase().includes("jwt expired") ||
        errorMsg.toLowerCase().includes("invalid token") ||
        errorMsg.toLowerCase().includes("token expired") ||
        errorMsg.toLowerCase().includes("expired token") ||
        errorMsg.toLowerCase().includes("unauthenticated");

      if (isAuthError) {
        const newAccessToken = await attemptTokenRefresh();
        if (newAccessToken) {
          json = await executeRequest(newAccessToken);
        } else {
          // Only run cleanup and redirect if local storage has auth data to avoid loops and race redirects
          if (localStorage.getItem("jwt_token") || localStorage.getItem("refresh_token")) {
            localStorage.removeItem("jwt_token");
            localStorage.removeItem("refresh_token");
            localStorage.removeItem("user_id");
            localStorage.removeItem("user_role");
            localStorage.removeItem("user_name");
            localStorage.removeItem("school_id");
            globalThis.location.href = "/login";
          }
          throw new Error(errorMsg);
        }
      }
    }

    if (json.errors && json.errors.length > 0) {
      const errorMsg = json.errors[0]?.message || "Unknown GraphQL error";
      throw new Error(errorMsg);
    }

    if (!json.data) {
      throw new Error("No data returned from GraphQL server");
    }

    // Store in cache (only for queries, not mutations)
    if (!isMutation) {
      const now = Date.now();
      queryCache.set(cacheKey, {
        data: json.data,
        staleAt: now + DEFAULT_STALE_MS,
        expiresAt: now + DEFAULT_EXPIRE_MS,
      });
    }

    return json.data;
  })();

  // Track in-flight request so duplicate calls wait for the same promise
  if (!isMutation) {
    inflightFetches.set(cacheKey, requestPromise);
  }

  try {
    return await requestPromise;
  } finally {
    if (!isMutation) {
      inflightFetches.delete(cacheKey);
    }
  }
}
