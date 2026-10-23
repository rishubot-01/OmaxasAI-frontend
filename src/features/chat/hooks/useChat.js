import {
  useCallback,
  useRef,
  useState,
} from "react";

import {
  createConversation,
  getConversation,
  getConversationMessages,
  sendAssistantMessage,
  sendConversationMessage,
} from "../chatService";


function createMessageId() {
  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)}`;
}


function getErrorMessage(error) {
  const data = error?.data ?? error?.response?.data;

  if (typeof data?.detail === "string") {
    return data.detail;
  }

  if (typeof data?.message === "string") {
    return data.message;
  }

  return (
    error?.message ||
    "AI response laane mein error aaya."
  );
}


function unwrapResponse(response) {
  return response?.data ?? response;
}


function extractMessageList(response) {
  const data = unwrapResponse(response);

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  if (Array.isArray(data?.messages)) {
    return data.messages;
  }

  return [];
}


function normalizeMessage(message) {
  const metadata =
    message?.metadata &&
    typeof message.metadata === "object"
      ? message.metadata
      : {};

  return {
    id: message?.id ?? createMessageId(),

    role: message?.role || "assistant",

    content:
      typeof message?.content === "string"
        ? message.content
        : "",

    createdAt:
      message?.created_at ||
      message?.createdAt ||
      new Date().toISOString(),

    mode: message?.mode || "auto",

    provider: message?.provider || null,

    model:
      message?.model_name ||
      message?.model ||
      null,

    selectedModelId:
      message?.selected_model_id ?? null,

    taskCategory:
      metadata.task_category ||
      message?.task_category ||
      null,

    webSearchUsed:
      message?.web_search_used ?? false,

    fallbackUsed:
      metadata.fallback_used ??
      message?.fallback_used ??
      false,

    usage: {
      input_tokens:
        metadata.input_tokens ??
        message?.usage?.input_tokens ??
        null,

      output_tokens:
        metadata.output_tokens ??
        message?.usage?.output_tokens ??
        null,
    },

    responseTimeMs:
      metadata.response_time_ms ??
      message?.response_time_ms ??
      null,
  };
}


function getConversationId(conversation) {
  const data = unwrapResponse(conversation);

  const id = data?.id ?? data?.pk;

  if (id === null || id === undefined) {
    return null;
  }

  const parsedId = Number(id);

  return Number.isSafeInteger(parsedId) && parsedId > 0
    ? parsedId
    : null;
}


export function useChat() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [activeConversationId, setActiveConversationId] =
    useState(null);

  const [activeConversation, setActiveConversation] =
    useState(null);

  // Refs prevent stale conversation IDs and duplicate sends.
  const conversationIdRef = useRef(null);
  const busyRef = useRef(false);


  const sendMessage = useCallback(
    async (text, options = {}) => {
      const messageText =
        typeof text === "string"
          ? text.trim()
          : "";

      if (!messageText || busyRef.current) {
        return null;
      }

      const guestMode = options.guestMode === true;

      busyRef.current = true;
      setLoading(true);
      setError("");

      const temporaryUserId = createMessageId();

      const userMessage = {
        id: temporaryUserId,
        role: "user",
        content: messageText,
        createdAt: new Date().toISOString(),
        mode: options.mode || "auto",
        provider: null,
        model: null,
      };

      setMessages((previous) => [
        ...previous,
        userMessage,
      ]);

      // Guests must never use a saved conversation ID.
      let conversationId = guestMode
        ? null
        : (
            options.conversationId ??
            conversationIdRef.current
          );

      try {
        // ================================================
        // GUEST CHAT
        // ================================================
        // Guests use the standalone assistant endpoint.
        // No conversation is created in the database.
        // ================================================

        if (guestMode) {
          const response = await sendAssistantMessage({
            message: messageText,
            mode: options.mode || "auto",
            webSearch: options.webSearch ?? false,

            // The service also enforces automatic routing
            // when guestMode is true.
            guestMode: true,
          });

          const data = unwrapResponse(response);

          if (
            typeof data?.reply !== "string" ||
            !data.reply.trim()
          ) {
            throw new Error(
              "Backend response mein AI reply nahi mila."
            );
          }

          // Adapt the standalone API response to the same
          // internal message format used by the chat UI.
          const assistantMessage = normalizeMessage({
            id: `guest-assistant-${createMessageId()}`,
            role: "assistant",
            content: data.reply.trim(),
            created_at: new Date().toISOString(),
            mode: data.mode || options.mode || "auto",
            provider: data.provider || null,
            model_name: data.model || null,
            selected_model_id:
              data.selected_model_id ?? null,
            task_category: data.task_category ?? null,
            web_search_used:
              data.web_search_used ?? false,
            fallback_used:
              data.fallback_used ?? false,
            response_time_ms:
              data.response_time_ms ?? null,
            metadata: {
              task_category:
                data.task_category ?? null,
              fallback_used:
                data.fallback_used ?? false,
              input_tokens:
                data.usage?.input_tokens ?? null,
              output_tokens:
                data.usage?.output_tokens ?? null,
              response_time_ms:
                data.response_time_ms ?? null,
            },
          });

          // The optimistic user message is already in state.
          // Append the AI response without creating a conversation.
          setMessages((previous) => [
            ...previous,
            assistantMessage,
          ]);

          return assistantMessage;
        }


        // ================================================
        // AUTHENTICATED CHAT
        // ================================================
        // Preserve the existing saved-conversation flow.
        // ================================================

        // Create a persistent conversation for a new chat.
        if (
          conversationId === null ||
          conversationId === undefined
        ) {
          const createdConversation =
            await createConversation({
              title: "New chat",
            });

          conversationId =
            getConversationId(createdConversation);

          if (!conversationId) {
            throw new Error(
              "Backend se conversation ID nahi mila."
            );
          }

          conversationIdRef.current = conversationId;

          setActiveConversationId(conversationId);

          setActiveConversation(
            unwrapResponse(createdConversation)
          );
        }

        // Persist the user message and get the AI response.
        const response = await sendConversationMessage({
          conversationId,
          message: messageText,
          mode: options.mode || "auto",
          webSearch: options.webSearch ?? false,

          selectedModel:
            options.selectedModel ??
            options.selectedModelId ??
            null,
        });

        const data = unwrapResponse(response);

        if (
          !data?.assistant_message ||
          typeof data.assistant_message.content !== "string" ||
          !data.assistant_message.content.trim()
        ) {
          throw new Error(
            "Backend response mein saved AI message nahi mila."
          );
        }

        const persistedUserMessage = data.user_message
          ? normalizeMessage(data.user_message)
          : userMessage;

        const assistantMessage = normalizeMessage(
          data.assistant_message
        );

        // Replace the temporary user message with its saved
        // database record and append the saved AI response.
        setMessages((previous) => [
          ...previous.filter(
            (message) => message.id !== temporaryUserId
          ),
          persistedUserMessage,
          assistantMessage,
        ]);

        return assistantMessage;

      } catch (err) {
        const apiData = err?.data ?? err?.response?.data;

        // Only authenticated conversation requests can return
        // a persistent conversation ID.
        if (!guestMode) {
          const serverConversationId = Number(
            apiData?.conversation_id
          );

          if (
            Number.isSafeInteger(serverConversationId) &&
            serverConversationId > 0
          ) {
            conversationId = serverConversationId;

            conversationIdRef.current =
              serverConversationId;

            setActiveConversationId(
              serverConversationId
            );
          }

          // The backend might have saved the user message even
          // when AI generation subsequently failed.
          if (apiData?.user_message_id != null) {
            setMessages((previous) =>
              previous.map((message) =>
                message.id === temporaryUserId
                  ? {
                      ...message,
                      id: apiData.user_message_id,
                    }
                  : message
              )
            );
          }
        }

        // A failed guest request has no saved user message.
        // Remove its optimistic message. Also remove messages
        // when authenticated conversation creation failed.
        if (
          guestMode ||
          conversationId === null ||
          conversationId === undefined
        ) {
          setMessages((previous) =>
            previous.filter(
              (message) => message.id !== temporaryUserId
            )
          );
        }

        setError(getErrorMessage(err));

        return null;

      } finally {
        busyRef.current = false;
        setLoading(false);
      }
    },
    []
  );


  const loadConversation = useCallback(
    async (conversationId) => {
      if (busyRef.current) {
        return false;
      }

      const parsedId = Number(conversationId);

      if (
        !Number.isSafeInteger(parsedId) ||
        parsedId < 1
      ) {
        setError("Invalid conversation ID.");
        return false;
      }

      busyRef.current = true;
      setLoading(true);
      setError("");

      try {
        const [conversationResponse, messagesResponse] =
          await Promise.all([
            getConversation(parsedId),
            getConversationMessages(parsedId),
          ]);

        const conversation =
          unwrapResponse(conversationResponse);

        const savedMessages = extractMessageList(
          messagesResponse
        ).map(normalizeMessage);

        conversationIdRef.current = parsedId;

        setActiveConversationId(parsedId);
        setActiveConversation(conversation);
        setMessages(savedMessages);

        return true;

      } catch (err) {
        setError(getErrorMessage(err));
        return false;

      } finally {
        busyRef.current = false;
        setLoading(false);
      }
    },
    []
  );


  const startNewChat = useCallback(() => {
    if (busyRef.current) {
      return false;
    }

    conversationIdRef.current = null;

    setActiveConversationId(null);
    setActiveConversation(null);
    setMessages([]);
    setError("");

    return true;
  }, []);


  const clearMessages = useCallback(() => {
    if (busyRef.current) {
      return;
    }

    // Clear only the visible messages. This does not delete
    // the saved conversation from the database.
    setMessages([]);
    setError("");
  }, []);


  return {
    messages,
    setMessages,

    sendMessage,

    loadConversation,
    startNewChat,

    activeConversationId,
    activeConversation,

    loading,
    error,

    clearMessages,
  };
}