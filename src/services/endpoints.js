/**
 * OMAXAS AI — API Endpoint Registry
 *
 * Base URL is configured in src/services/apiClient.js:
 * VITE_API_BASE_URL=http://127.0.0.1:8000/api
 *
 * Keep endpoint paths relative to that base URL.
 */

function requireId(id, label = "ID") {
  const value = Number(id);

  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new Error(`${label} must be a positive integer.`);
  }

  return String(value);
}

function conversationPath(id) {
  return `conversations/${requireId(id, "Conversation ID")}/`;
}

export const API_ENDPOINTS = Object.freeze({
  // Authentication — apps/accounts/urls.py
  auth: Object.freeze({
    register: "auth/register/",
    login: "auth/token/",
    refresh: "auth/token/refresh/",
    verify: "auth/token/verify/",
  }),

  // User account and preferences
  accounts: Object.freeze({
    me: "accounts/me/",
    preferences: "accounts/preferences/",
  }),

  // AI assistant — apps/assistant/urls.py
  assistant: Object.freeze({
    chat: "assistant/chat/",
    models: "assistant/models/",
    requests: "assistant/requests/",
  }),

  // Saved conversations — apps/conversations/urls.py
  conversations: Object.freeze({
    list: "conversations/",

    detail(id) {
      return conversationPath(id);
    },

    messages(id) {
      return `${conversationPath(id)}messages/`;
    },

    sendMessage(id) {
      return `${conversationPath(id)}messages/send/`;
    },

    attachments(id) {
      return `${conversationPath(id)}attachments/`;
    },

    feedback: "conversations/feedback/",
  }),

  // These API groups are registered in config/urls.py.
  // Their exact child endpoints must be verified before use.
  knowledge: Object.freeze({
    base: "knowledge/",
  }),

  images: Object.freeze({
    base: "images/",
  }),

  explore: Object.freeze({
    base: "explore/",
  }),
});

// Build a safe query string for endpoints that support query parameters.
export function withQuery(endpoint, params = {}) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") {
      continue;
    }

    query.set(key, String(value));
  }

  const queryString = query.toString();

  return queryString ? `${endpoint}?${queryString}` : endpoint;
}