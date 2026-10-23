import { apiRequest } from "../../services/apiClient";

const CONVERSATIONS_ENDPOINT = "conversations/";

/**
 * Validate a positive database ID.
 */
function validateDatabaseId(value, label = "ID") {
  if (value === null || value === undefined) {
    throw new Error(`${label} is required.`);
  }

  if (typeof value === "boolean") {
    throw new Error(`Invalid ${label}.`);
  }

  const validString =
    typeof value === "string" && /^\d+$/.test(value.trim());

  const validNumber =
    typeof value === "number" && Number.isInteger(value);

  if (!validString && !validNumber) {
    throw new Error(`Invalid ${label}.`);
  }

  const parsed = Number(value);

  if (!Number.isSafeInteger(parsed) || parsed < 1) {
    throw new Error(`Invalid ${label}.`);
  }

  return parsed;
}

/**
 * Resolve the database ID of the selected ModelRegistry model.
 *
 * Accepts a model object, numeric ID, or numeric string.
 * Do not use model_id: it is the upstream provider model identifier.
 */
function resolveSelectedModelId(selectedModel, selectedModelId) {
  if (selectedModelId !== null && selectedModelId !== undefined) {
    return selectedModelId;
  }

  if (selectedModel === null || selectedModel === undefined) {
    return null;
  }

  if (typeof selectedModel === "object") {
    return selectedModel.id ?? selectedModel.pk ?? null;
  }

  return selectedModel;
}

/**
 * Build the selected model payload for authenticated requests.
 */
function buildSelectedModelPayload(selectedModel, selectedModelId) {
  const rawId = resolveSelectedModelId(
    selectedModel,
    selectedModelId
  );

  if (
    rawId === null ||
    rawId === undefined ||
    rawId === "" ||
    rawId === "auto"
  ) {
    return {};
  }

  return {
    selected_model_id: validateDatabaseId(
      rawId,
      "Selected model ID"
    ),
  };
}

/**
 * Send a message to the standalone assistant endpoint.
 *
 * Endpoint:
 * POST /api/assistant/chat/
 *
 * Guest mode:
 * - Does not send an Authorization token.
 * - Uses automatic model routing.
 * - Does not create a saved conversation.
 *
 * Authenticated mode:
 * - Sends the normal authentication token.
 * - Supports explicit model selection.
 *
 * This endpoint does not persist messages as Conversation/Message
 * records. Use sendConversationMessage() for saved conversations.
 */
export async function sendAssistantMessage({
  message,
  mode = "auto",
  webSearch = false,
  selectedModel = null,
  selectedModelId = null,
  guestMode = false,
}) {
  const cleanMessage =
    typeof message === "string" ? message.trim() : "";

  if (!cleanMessage) {
    throw new Error("Message cannot be empty.");
  }

  const body = {
    message: cleanMessage,
    mode,
    web_search: Boolean(webSearch),
    stream: false,

    // Guests always use automatic model routing.
    // Logged-in users may select a registered model.
    ...(
      guestMode
        ? {}
        : buildSelectedModelPayload(
            selectedModel,
            selectedModelId
          )
    ),
  };

  return apiRequest("assistant/chat/", {
    method: "POST",
    body,

    // Prevent stale or expired tokens from being attached
    // to guest requests.
    auth: !guestMode,
  });
}

/**
 * Fetch registered AI models.
 *
 * Authentication is required by the current backend.
 */
export async function getAvailableModels() {
  return apiRequest("assistant/models/");
}

/**
 * Fetch the authenticated user's AI request history.
 *
 * This contains request metadata, not complete conversations.
 */
export async function getAIRequestHistory() {
  return apiRequest("assistant/requests/");
}

/**
 * Fetch the authenticated user's saved conversations.
 *
 * Optional search filters conversation titles.
 *
 * GET /api/conversations/?search=...
 */
export async function getConversations({ search = "" } = {}) {
  const query = String(search || "").trim();

  const endpoint = query
    ? `${CONVERSATIONS_ENDPOINT}?search=${encodeURIComponent(query)}`
    : CONVERSATIONS_ENDPOINT;

  return apiRequest(endpoint);
}

/**
 * Create a saved conversation.
 *
 * The backend assigns ownership from the authenticated user.
 */
export async function createConversation({
  title = "New chat",
} = {}) {
  const cleanTitle =
    typeof title === "string" ? title.trim() : "";

  return apiRequest(CONVERSATIONS_ENDPOINT, {
    method: "POST",
    body: {
      title: cleanTitle || "New chat",
    },
  });
}

/**
 * Fetch one saved conversation.
 */
export async function getConversation(conversationId) {
  const id = validateDatabaseId(
    conversationId,
    "Conversation ID"
  );

  return apiRequest(`${CONVERSATIONS_ENDPOINT}${id}/`);
}

/**
 * Rename or update a saved conversation.
 *
 * Pass only fields supported by the backend serializer.
 */
export async function updateConversation(
  conversationId,
  updates
) {
  const id = validateDatabaseId(
    conversationId,
    "Conversation ID"
  );

  if (
    !updates ||
    typeof updates !== "object" ||
    Array.isArray(updates)
  ) {
    throw new Error("Conversation updates must be an object.");
  }

  return apiRequest(`${CONVERSATIONS_ENDPOINT}${id}/`, {
    method: "PATCH",
    body: updates,
  });
}

/**
 * Delete a saved conversation owned by the current user.
 */
export async function deleteConversation(conversationId) {
  const id = validateDatabaseId(
    conversationId,
    "Conversation ID"
  );

  return apiRequest(`${CONVERSATIONS_ENDPOINT}${id}/`, {
    method: "DELETE",
  });
}

/**
 * Fetch saved messages for one conversation.
 *
 * GET /api/conversations/{conversationId}/messages/
 */
export async function getConversationMessages(conversationId) {
  const id = validateDatabaseId(
    conversationId,
    "Conversation ID"
  );

  return apiRequest(
    `${CONVERSATIONS_ENDPOINT}${id}/messages/`
  );
}

/**
 * Send and persist a message in an existing conversation.
 *
 * POST /api/conversations/{conversationId}/messages/send/
 *
 * This function is for authenticated users and saved conversations.
 */
export async function sendConversationMessage({
  conversationId,
  message,
  mode = "auto",
  webSearch = false,
  selectedModel = null,
  selectedModelId = null,
}) {
  const id = validateDatabaseId(
    conversationId,
    "Conversation ID"
  );

  const cleanMessage =
    typeof message === "string" ? message.trim() : "";

  if (!cleanMessage) {
    throw new Error("Message cannot be empty.");
  }

  const body = {
    message: cleanMessage,
    mode,
    web_search: Boolean(webSearch),
    stream: false,
    ...buildSelectedModelPayload(
      selectedModel,
      selectedModelId
    ),
  };

  return apiRequest(
    `${CONVERSATIONS_ENDPOINT}${id}/messages/send/`,
    {
      method: "POST",
      body,
    }
  );
}

/**
 * Fetch attachment metadata for a conversation.
 */
export async function getConversationAttachments(conversationId) {
  const id = validateDatabaseId(
    conversationId,
    "Conversation ID"
  );

  return apiRequest(
    `${CONVERSATIONS_ENDPOINT}${id}/attachments/`
  );
}

/**
 * Fetch the current user's feedback records.
 */
export async function getFeedback() {
  return apiRequest(`${CONVERSATIONS_ENDPOINT}feedback/`);
}

/**
 * Submit feedback for an assistant message.
 */
export async function submitFeedback({
  message,
  rating,
  comment = "",
  ...additionalFields
}) {
  const messageId = validateDatabaseId(
    message,
    "Message ID"
  );

  return apiRequest(`${CONVERSATIONS_ENDPOINT}feedback/`, {
    method: "POST",
    body: {
      ...additionalFields,
      message: messageId,
      rating,
      comment,
    },
  });
}