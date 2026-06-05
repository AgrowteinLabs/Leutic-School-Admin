/**
 * A lightweight GraphQL client wrapper using native fetch.
 * Automatically injects the JWT bearer token if present in localStorage.
 * Automatically handles token expiration by executing silent refresh mutations.
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

export async function graphqlRequest<T = unknown>(
  query: string,
  variables: Record<string, unknown> = {},
  options: RequestInit = {}
): Promise<T> {
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const firstError = json.errors[0] as any;
    const errorMsg = firstError?.message || "Unknown GraphQL error";

    const isAuthError =
      firstError?.extensions?.code === "UNAUTHENTICATED" ||
      firstError?.extensions?.originalError?.statusCode === 401 ||
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

  return json.data;
}
