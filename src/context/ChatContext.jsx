import {
  createContext,
  useCallback,
  useContext,
  useMemo,
} from "react";

import { useChat } from "../features/chat/hooks/useChat";

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  // Use the existing chat hook for messages, API requests,
  // conversation persistence, and history loading.
  const {
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
  } = useChat();

  const addMessage = useCallback(
    (message) => {
      setMessages((previousMessages) => [
        ...previousMessages,
        message,
      ]);
    },
    [setMessages]
  );

  const value = useMemo(
    () => ({
      // Current conversation messages.
      messages,
      setMessages,

      // Send and manage chat messages.
      sendMessage,
      addMessage,
      clearMessages,

      // Saved conversation management.
      loadConversation,
      startNewChat,
      activeConversationId,
      activeConversation,

      // Request state.
      loading,
      error,
      hasMessages: messages.length > 0,
    }),
    [
      messages,
      setMessages,
      sendMessage,
      addMessage,
      loadConversation,
      startNewChat,
      activeConversationId,
      activeConversation,
      loading,
      error,
      clearMessages,
    ]
  );

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);

  if (context === null) {
    throw new Error(
      "useChatContext must be used inside ChatProvider."
    );
  }

  return context;
}

export default ChatContext;