import { apiRequest } from "../../../services/apiClient";

function requireConversationId(id) {
  if (id === undefined || id === null || id === "") {
    throw new Error("Conversation ID is required.");
  }

  return `conversations/${encodeURIComponent(String(id))}/`;
}

/**
 * Fetch the authenticated user's conversations.
 * Optional search filters conversation titles.
 */
export async function getConversations({ search = "" } = {}) {
  const query = search.trim()
    ? `?search=${encodeURIComponent(search.trim())}`
    : "";

  return apiRequest(`conversations/${query}`);
}

/**
 * Create a conversation.
 * The payload must match the backend conversation serializer.
 */
export async function createConversation(data = {}) {
  return apiRequest("conversations/", {
    method: "POST",
    body: data,
  });
}

/**
 * Fetch a single conversation.
 */
export async function getConversation(conversationId) {
  return apiRequest(requireConversationId(conversationId));
}

/**
 * Update conversation fields accepted by the backend.
 */
export async function updateConversation(conversationId, data) {
  return apiRequest(requireConversationId(conversationId), {
    method: "PATCH",
    body: data,
  });
}

/**
 * Delete a conversation.
 */
export async function deleteConversation(conversationId) {
  return apiRequest(requireConversationId(conversationId), {
    method: "DELETE",
  });
}

/**
 * Fetch messages belonging to a conversation.
 */
export async function getConversationMessages(conversationId) {
  return apiRequest(
    `${requireConversationId(conversationId)}messages/`,
  );
}

/**
 * Send a message and save the user and assistant messages
 * using the backend's persistent conversation endpoint.
 */
export async function sendConversationMessage(
  conversationId,
  {
    message,
    mode = "auto",
    webSearch = false,
  },
) {
  const cleanMessage =
    typeof message === "string" ? message.trim() : "";

  if (!cleanMessage) {
    throw new Error("Message cannot be empty.");
  }

  return apiRequest(
    `${requireConversationId(conversationId)}messages/send/`,
    {
      method: "POST",
      body: {
        message: cleanMessage,
        mode,
        web_search: webSearch,
        stream: false,
      },
    },
  );
}