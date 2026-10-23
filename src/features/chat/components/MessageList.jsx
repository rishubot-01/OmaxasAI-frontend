import { useEffect, useRef } from "react";

import omaxasLogo from "../../../assets/Analysis output 1.png";

import EmptyState from "./EmptyState";
import MessageBubble from "./MessageBubble";

export default function MessageList({
  messages = [],
  loading = false,
  error = "",
  onSelectPrompt,
}) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, loading, error]);

  const hasMessages = messages.length > 0;

  return (
    <section
      className="message-list"
      aria-label="Chat messages"
      aria-live="polite"
    >
      {!hasMessages && !loading ? (
        <EmptyState
          onSelectPrompt={onSelectPrompt}
          disabled={loading}
        />
      ) : (
        <div className="message-list-inner">
          {messages.map((message, index) => (
            <MessageBubble
              key={message.id ?? `${message.role}-${index}`}
              message={message}
            />
          ))}

          {loading && (
            <article className="message-row message-row-assistant">
              <div
                className="message-avatar message-avatar-assistant"
                aria-hidden="true"
              >
                <img
                  src={omaxasLogo}
                  alt=""
                  className="message-avatar-assistant-logo"
                />
              </div>

              <div className="message-body">
                <div className="message-author message-author-loading">
                  <span>OMAXAS AI</span>

                  <span
                    className="message-typing message-typing-inline"
                    role="status"
                    aria-label="OMAXAS AI is generating a response"
                  >
                    <span />
                    <span />
                    <span />
                  </span>
                </div>
              </div>
            </article>
          )}
        </div>
      )}

      {error && (
        <div className="message-error" role="alert">
          <strong>Could not get a response.</strong>
          <p>{error}</p>
          <p>Please check your connection and try again.</p>
        </div>
      )}

      <div ref={bottomRef} />
    </section>
  );
}