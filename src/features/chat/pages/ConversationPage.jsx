import { useCallback } from "react";

import { useChatContext } from "../../../context/ChatContext";
import { useAuth } from "../../auth/useAuth";

import MessageList from "../components/MessageList";
import ChatComposer from "../components/ChatComposer";

export default function ConversationPage() {
  const {
    messages,
    sendMessage,
    loading,
    error,
    clearMessages,
  } = useChatContext();

  const { user, logout } = useAuth();

  // Send a suggested prompt using the shared chat context.
  const handleSelectPrompt = useCallback(
    async (prompt) => {
      if (loading || typeof prompt !== "string" || !prompt.trim()) {
        return null;
      }

      return sendMessage(prompt.trim());
    },
    [loading, sendMessage],
  );

  // Start a fresh chat in the current in-memory session.
  const handleNewChat = useCallback(() => {
    if (!loading) {
      clearMessages();
    }
  }, [loading, clearMessages]);

  const displayName =
    user?.display_name || user?.email || "user";

  return (
    <main className="conversation-page">
      <header className="conversation-header">
        <div className="conversation-brand">
          <div className="brand-mark small" aria-hidden="true">
            O
          </div>

          <div>
            <strong>OMAXAS AI</strong>
            <span className="conversation-status">
              AI Assistant
            </span>
          </div>
        </div>

        <div className="conversation-header-actions">
          <button
            type="button"
            className="conversation-new-button"
            onClick={handleNewChat}
            disabled={loading || messages.length === 0}
          >
            + New chat
          </button>

          <button
            type="button"
            className="logout-button"
            onClick={logout}
          >
            Log out
          </button>
        </div>
      </header>

      <section className="conversation-workspace">
        <MessageList
          messages={messages}
          loading={loading}
          error={error}
          onSelectPrompt={handleSelectPrompt}
        />

        <footer className="conversation-composer-area">
          <div className="conversation-composer-container">
            <ChatComposer
              onSend={sendMessage}
              loading={loading}
            />
          </div>
        </footer>
      </section>

      <span className="sr-only">
        Signed in as {displayName}
      </span>
    </main>
  );
}