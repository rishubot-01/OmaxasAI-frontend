
const ACCESS_TOKEN_KEY = "omaxas_ai_access_token";
const REFRESH_TOKEN_KEY = "omaxas_ai_refresh_token";

/**
 * Safely access browser localStorage.
 */
function getStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/**
 * Read and normalize a stored token.
 */
function readToken(key) {
  const storage = getStorage();

  if (!storage) {
    return null;
  }

  try {
    const token = storage.getItem(key);

    if (typeof token !== "string" || !token.trim()) {
      return null;
    }

    return token.trim();
  } catch {
    return null;
  }
}

/**
 * Return the current JWT access token.
 */
export function getAccessToken() {
  return readToken(ACCESS_TOKEN_KEY);
}

/**
 * Return the current JWT refresh token.
 */
export function getRefreshToken() {
  return readToken(REFRESH_TOKEN_KEY);
}

/**
 * Return both stored authentication tokens.
 */
export function getAuthTokens() {
  return {
    access: getAccessToken(),
    refresh: getRefreshToken(),
  };
}

/**
 * Save or update authentication tokens.
 *
 * Partial updates are supported:
 * saveAuthTokens({ access }) updates only the access token
 * and preserves the existing refresh token.
 *
 * This is useful when the refresh endpoint returns only
 * a new access token.
 */
export function saveAuthTokens({
  access,
  refresh,
} = {}) {
  const storage = getStorage();

  if (!storage) {
    throw new Error(
      "Browser storage is unavailable."
    );
  }

  const hasAccess =
    typeof access === "string" && access.trim().length > 0;

  const hasRefresh =
    typeof refresh === "string" && refresh.trim().length > 0;

  if (!hasAccess && !hasRefresh) {
    throw new Error(
      "No valid authentication token was provided."
    );
  }

  try {
    if (hasAccess) {
      storage.setItem(
        ACCESS_TOKEN_KEY,
        access.trim()
      );
    }

    if (hasRefresh) {
      storage.setItem(
        REFRESH_TOKEN_KEY,
        refresh.trim()
      );
    }
  } catch {
    throw new Error(
      "Authentication tokens could not be saved in browser storage."
    );
  }
}

/**
 * Remove both locally stored authentication tokens.
 */
export function clearAuthTokens() {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  try {
    storage.removeItem(ACCESS_TOKEN_KEY);
    storage.removeItem(REFRESH_TOKEN_KEY);
  } catch {
    // Do not expose storage exceptions during logout.
  }
}

/**
 * Check whether an access token is stored.
 *
 * This does not verify token validity or expiration.
 */
export function hasAccessToken() {
  return Boolean(getAccessToken());
}

/**
 * Check whether a refresh token is stored.
 */
export function hasRefreshToken() {
  return Boolean(getRefreshToken());
}
