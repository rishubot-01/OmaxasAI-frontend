/**
 * Convert any supported value into a safe display string.
 */
export function getMessageContent(message) {
  if (typeof message === "string") {
    return message;
  }

  if (typeof message === "number") {
    return String(message);
  }

  if (!message || typeof message !== "object") {
    return "";
  }

  const content =
    message.content ??
    message.text ??
    message.message ??
    message.reply ??
    "";

  if (typeof content === "string") {
    return content;
  }

  if (typeof content === "number") {
    return String(content);
  }

  return "";
}

/**
 * Normalize common author/role names to "user" or "assistant".
 */
export function normalizeMessageRole(message) {
  const rawRole = String(
    message?.role ??
      message?.sender ??
      message?.author_type ??
      "",
  ).toLowerCase();

  if (
    ["user", "human", "customer", "you"].includes(rawRole)
  ) {
    return "user";
  }

  return "assistant";
}

/**
 * Normalize a message into the frontend's standard shape.
 *
 * Note: this does not validate backend permissions or ownership.
 */
export function formatMessage(message = {}, index = 0) {
  const source =
    typeof message === "string"
      ? { content: message }
      : message && typeof message === "object"
        ? message
        : {};

  const id =
    source.id ??
    source.message_id ??
    source.uuid ??
    `message-${index}`;

  const createdAt =
    source.created_at ??
    source.createdAt ??
    source.timestamp ??
    null;

  return {
    id,
    role: normalizeMessageRole(source),
    content: getMessageContent(source),
    createdAt,
    model: source.model ?? null,
    provider: source.provider ?? null,
    responseTimeMs:
      source.response_time_ms ??
      source.responseTimeMs ??
      null,
    usage: source.usage ?? null,
  };
}

/**
 * Normalize a list of messages.
 */
export function formatMessages(messages) {
  if (!Array.isArray(messages)) {
    return [];
  }

  return messages.map((message, index) =>
    formatMessage(message, index),
  );
}