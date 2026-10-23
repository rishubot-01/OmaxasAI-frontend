import { apiRequest } from "../../services/apiClient";

import {
  clearAuthTokens,
  saveAuthTokens,
} from "../../utils/storage";


/**
 * Register a new user using email and password.
 *
 * POST /api/auth/register/
 */
export async function registerUser({
  email,
  display_name,
  password,
  password_confirm,
}) {
  return apiRequest("auth/register/", {
    method: "POST",
    auth: false,
    retryOnAuth: false,
    body: {
      email: email.trim().toLowerCase(),
      display_name: display_name.trim(),
      password,
      password_confirm,
    },
  });
}


/**
 * Log in using the normal email/password flow.
 *
 * POST /api/auth/token/
 *
 * Save the returned OMAXAS AI JWT access and refresh tokens.
 */
export async function loginUser({ email, password }) {
  const tokens = await apiRequest("auth/token/", {
    method: "POST",
    auth: false,
    retryOnAuth: false,
    body: {
      email: email.trim().toLowerCase(),
      password,
    },
  });

  if (!tokens?.access || !tokens?.refresh) {
    throw new Error(
      "Login response mein JWT tokens nahi mile."
    );
  }

  saveAuthTokens(tokens);

  return tokens;
}


/**
 * Log in or sign up using a verified Google ID-token credential.
 *
 * POST /api/auth/google/
 *
 * The backend verifies the Google credential and returns
 * OMAXAS AI JWT tokens. Google credentials are never stored
 * as OMAXAS AI authentication tokens.
 */
export async function googleLoginUser(credential) {
  if (
    typeof credential !== "string" ||
    !credential.trim()
  ) {
    throw new Error(
      "Google credential nahi mila. Please try again."
    );
  }

  const tokens = await apiRequest("auth/google/", {
    method: "POST",
    auth: false,
    retryOnAuth: false,
    body: {
      credential: credential.trim(),
    },
  });

  if (
    typeof tokens?.access !== "string" ||
    !tokens.access.trim() ||
    typeof tokens?.refresh !== "string" ||
    !tokens.refresh.trim()
  ) {
    throw new Error(
      "Google login response mein valid OMAXAS AI JWT tokens nahi mile."
    );
  }

  // Save OMAXAS AI tokens so the existing AuthContext,
  // apiClient and protected endpoints can use them.
  saveAuthTokens({
    access: tokens.access,
    refresh: tokens.refresh,
  });

  return tokens;
}


/**
 * Fetch the authenticated user's profile.
 *
 * GET /api/accounts/me/
 */
export async function getCurrentUser() {
  return apiRequest("accounts/me/");
}


/**
 * Update the authenticated user's profile.
 *
 * PATCH /api/accounts/me/
 */
export async function updateCurrentUser(profile) {
  return apiRequest("accounts/me/", {
    method: "PATCH",
    body: profile,
  });
}


/**
 * Fetch the authenticated user's preferences.
 *
 * GET /api/accounts/preferences/
 */
export async function getUserPreferences() {
  return apiRequest("accounts/preferences/");
}


/**
 * Update the authenticated user's preferences.
 *
 * PATCH /api/accounts/preferences/
 */
export async function updateUserPreferences(preferences) {
  return apiRequest("accounts/preferences/", {
    method: "PATCH",
    body: preferences,
  });
}


/**
 * Log out locally by clearing OMAXAS AI authentication tokens.
 */
export function logoutUser() {
  clearAuthTokens();
}