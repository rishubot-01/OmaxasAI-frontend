
import {
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
  saveAuthTokens,
} from "../utils/storage";

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000/api"
).replace(/\/+$/, "");

// Share one refresh operation when several requests receive 401.
let refreshInFlight = null;

function getUrl(endpoint) {
  return `${API_BASE_URL}/${endpoint.replace(/^\/+/, "")}`;
}

function getErrorMessage(data) {
  if (typeof data === "string" && data.trim()) {
    return data;
  }

  if (data && typeof data === "object") {
    if (typeof data.detail === "string") {
      return data.detail;
    }

    if (typeof data.message === "string") {
      return data.message;
    }

    if (typeof data.error === "string") {
      return data.error;
    }

    for (const value of Object.values(data)) {
      if (typeof value === "string" && value.trim()) {
        return value;
      }

      if (Array.isArray(value)) {
        const message = value.find(
          (item) =>
            typeof item === "string" && item.trim()
        );

        if (message) {
          return message;
        }
      }

      if (value && typeof value === "object") {
        const message = getErrorMessage(value);

        if (message && message !== "API request failed.") {
          return message;
        }
      }
    }
  }

  return "API request failed.";
}

async function executeRequest(
  endpoint,
  options = {},
  accessToken = null
) {
  const {
    method = "GET",
    body,
    headers = {},
  } = options;

  const requestHeaders = {
    Accept: "application/json",
    ...headers,
  };

  const isFormData =
    typeof FormData !== "undefined" &&
    body instanceof FormData;

  if (body !== undefined && !isFormData) {
    requestHeaders["Content-Type"] = "application/json";
  }

  if (accessToken) {
    requestHeaders.Authorization = `Bearer ${accessToken}`;
  }

  let serializedBody;

  try {
    serializedBody =
      body === undefined
        ? undefined
        : isFormData
          ? body
          : JSON.stringify(body);
  } catch {
    throw new Error(
      "Request body could not be serialized."
    );
  }

  let response;

  try {
    response = await fetch(getUrl(endpoint), {
      method,
      headers: requestHeaders,
      body: serializedBody,
    });
  } catch (cause) {
    const error = new Error(
      "Django backend se connection nahi ho raha. " +
      "Backend URL, server status aur network check karo."
    );

    error.cause = cause;
    error.isNetworkError = true;

    throw error;
  }

  let data = null;

  if (response.status !== 204) {
    const responseText = await response.text();

    if (responseText) {
      const contentType =
        response.headers.get("content-type") || "";

      if (contentType.includes("application/json")) {
        try {
          data = JSON.parse(responseText);
        } catch {
          // Preserve the server response if it contains invalid JSON.
          data = responseText;
        }
      } else {
        data = responseText;
      }
    }
  }

  return { response, data };
}

function createApiError(response, data) {
  const error = new Error(
    getErrorMessage(data) ||
      `Request failed with status ${response.status}.`
  );

  error.status = response.status;
  error.data = data;

  return error;
}

function throwApiError(response, data) {
  throw createApiError(response, data);
}

/**
 * Refresh the access token.
 *
 * Concurrent requests share the same refresh operation.
 * Tokens are cleared only when the refresh endpoint explicitly
 * rejects the refresh token with 400 or 401.
 */
async function refreshAccessToken() {
  if (refreshInFlight) {
    return refreshInFlight;
  }

  refreshInFlight = (async () => {
    const refresh = getRefreshToken();

    if (!refresh) {
      throw new Error(
        "Refresh token nahi mila. Please log in again."
      );
    }

    const refreshed = await executeRequest(
      "auth/token/refresh/",
      {
        method: "POST",
        body: { refresh },
      },
      null
    );

    if (!refreshed.response.ok) {
      const error = createApiError(
        refreshed.response,
        refreshed.data
      );

      if ([400, 401].includes(refreshed.response.status)) {
        clearAuthTokens();
      }

      throw error;
    }

    const newAccess = refreshed.data?.access;
    const newRefresh = refreshed.data?.refresh;

    if (
      typeof newAccess !== "string" ||
      !newAccess.trim()
    ) {
      throw new Error(
        "Refresh endpoint ne valid access token return nahi kiya."
      );
    }

    // Save a rotated refresh token when the backend returns one.
    // If the backend returns only access, the existing refresh
    // token remains in storage.
    saveAuthTokens({
      access: newAccess,
      refresh:
        typeof newRefresh === "string" &&
        newRefresh.trim()
          ? newRefresh
          : undefined,
    });

    return newAccess;
  })();

  try {
    return await refreshInFlight;
  } finally {
    refreshInFlight = null;
  }
}

export async function apiRequest(
  endpoint,
  {
    method = "GET",
    body,
    headers = {},
    token,
    auth = true,
    retryOnAuth = true,
  } = {}
) {
  const options = {
    method,
    body,
    headers,
  };

  const accessToken =
    token || (auth ? getAccessToken() : null);

  let result = await executeRequest(
    endpoint,
    options,
    accessToken
  );

  // Attempt one refresh when an authenticated request returns 401.
  // This also handles the case where access is missing but refresh
  // is still available.
  if (
    result.response.status === 401 &&
    auth &&
    retryOnAuth
  ) {
    const refresh = getRefreshToken();

    if (refresh) {
      const newAccess = await refreshAccessToken();

      // Retry the original request once with the new access token.
      result = await executeRequest(
        endpoint,
        options,
        newAccess
      );
    }
  }

  if (!result.response.ok) {
    throwApiError(result.response, result.data);
  }

  return result.data;
}
