
import { useEffect, useRef, useState } from "react";
import {
  Plus,
  ArrowUp,
  Square,
  X,
  FileText,
  Globe,
  Brain,
  AudioLines,
  Maximize2,
  Minimize2,
} from "lucide-react";

import VoiceInput from "./VoiceInput";
import useVoiceConversation from "../hooks/useVoiceConversation";

export default function ChatComposer({
  onSend,
  onStop,
  onNotice,
  loading = false,
  disabled = false,
}) {
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState("auto");
  const [webSearch, setWebSearch] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [expanded, setExpanded] = useState(false);

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const submittingRef = useRef(false);

  const isBusy = loading || submitting;
  const isDisabled = disabled || isBusy;
  const hasText = message.trim().length > 0;

  const {
    isActive: voiceActive,
    status: voiceStatus,
    error: voiceError,
    startVoiceConversation,
    stopVoiceConversation,
  } = useVoiceConversation({
    onSend,
    mode,
    webSearch,
    disabled: isDisabled,
    language: "en-IN",
  });

  const composerLocked = isDisabled || voiceActive;

  const canSend =
    hasText &&
    typeof onSend === "function" &&
    !composerLocked;

  const voiceStatusText = {
    listening: "Listening",
    thinking: "OmaxasAI is thinking",
    speaking: "OmaxasAI is speaking",
  }[voiceStatus] || "Voice conversation";

  const voiceHint = {
    listening: "Speak naturally",
    thinking: "Preparing your response",
    speaking: "Listen to OmaxasAI",
  }[voiceStatus] || "Talk with OmaxasAI";

  // Resize the textarea without changing the toolbar position.
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";

    const maxHeight = expanded
      ? Math.min(window.innerHeight * 0.55, 600)
      : 220;

    const minHeight = expanded
      ? Math.min(Math.max(window.innerHeight * 0.35, 220), 420)
      : 36;

    const nextHeight = Math.max(
      minHeight,
      Math.min(textarea.scrollHeight, maxHeight)
    );

    textarea.style.height = `${nextHeight}px`;
    textarea.style.overflowY =
      textarea.scrollHeight > maxHeight ? "auto" : "hidden";
  }, [message, expanded]);

  function handleVoiceTranscript(transcript) {
    const cleanTranscript = String(transcript || "").trim();

    if (!cleanTranscript || composerLocked) return;

    setMessage((current) => {
      if (!current) return cleanTranscript;

      const separator = /\s$/.test(current) ? "" : " ";
      return `${current}${separator}${cleanTranscript}`;
    });

    textareaRef.current?.focus();
  }

  function handleChooseFiles() {
    if (!composerLocked) {
      fileInputRef.current?.click();
    }
  }

  function handleFileSelection(event) {
    const selectedFiles = Array.from(event.target.files || []);
    if (!selectedFiles.length) return;

    setAttachments((current) => {
      const next = [...current];

      selectedFiles.forEach((file) => {
        const exists = next.some(
          (item) =>
            item.name === file.name &&
            item.size === file.size &&
            item.lastModified === file.lastModified
        );

        if (!exists) next.push(file);
      });

      return next;
    });

    event.target.value = "";
  }

  function handleRemoveAttachment(indexToRemove) {
    if (composerLocked) return;

    setAttachments((current) =>
      current.filter((_, index) => index !== indexToRemove)
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!canSend || submittingRef.current) return;

    submittingRef.current = true;
    setSubmitting(true);

    try {
      const result = await onSend(message.trim(), {
        mode,
        webSearch,
        attachments,
      });

      if (result) {
        setMessage("");
        setAttachments([]);

        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
        }
      }
    } catch (error) {
      console.error(
        "OMAXAS AI message submission failed:",
        error
      );

      onNotice?.(
        error?.message ||
          "Message could not be sent. Please retry."
      );
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
      textareaRef.current?.focus();
    }
  }

  function handleKeyDown(event) {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent?.isComposing
    ) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }

    if (event.key === "Escape" && expanded) {
      setExpanded(false);
    }
  }

  function handleVoiceMode() {
    if (voiceActive) {
      stopVoiceConversation();
      return;
    }

    if (isDisabled) return;

    if (typeof onSend !== "function") {
      onNotice?.("Chat API is not connected.");
      return;
    }

    startVoiceConversation();
  }

  function handleStop() {
    onStop?.();
  }

  function toggleExpanded() {
    if (voiceActive) return;

    setExpanded((current) => !current);
    textareaRef.current?.focus();
  }

  return (
    <section
      className={[
        "chat-composer",
        expanded ? "chat-composer-expanded" : "",
        voiceActive ? "chat-composer-voice-active" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Floating assistant orb ABOVE the input.
          Its position remains independent of the toolbar. */}
      {voiceActive && (
        <div className="voice-orb-floating">
          <span
            className="voice-orb-floating-status"
            role="status"
            aria-live="polite"
          >
            {voiceError || voiceStatusText}
          </span>

          <div
            className={[
              "voice-orb-floating-sphere",
              `voice-orb-floating-${voiceStatus || "listening"}`,
            ].join(" ")}
            role="img"
            aria-label={voiceStatusText}
          >
            <span
              className="voice-orb-floating-halo"
              aria-hidden="true"
            />
            <span
              className="voice-orb-floating-core"
              aria-hidden="true"
            />
            <span
              className="voice-orb-floating-shine"
              aria-hidden="true"
            />
          </div>

          <span className="voice-orb-floating-hint">
            {voiceHint}
          </span>
        </div>
      )}

      <form
        className="chat-composer-form"
        onSubmit={handleSubmit}
      >
        {/* Selected attachment previews */}
        {attachments.length > 0 && (
          <div
            className="chat-composer-attachments"
            aria-label="Selected files"
          >
            {attachments.map((file, index) => (
              <div
                className="chat-attachment-item"
                key={`${file.name}-${file.size}-${file.lastModified}`}
              >
                <FileText size={18} aria-hidden="true" />

                <div className="chat-attachment-info">
                  <span className="chat-attachment-name">
                    {file.name}
                  </span>

                  <span className="chat-attachment-size">
                    {file.size < 1024 * 1024
                      ? `${Math.max(
                          1,
                          Math.round(file.size / 1024)
                        )} KB`
                      : `${(
                          file.size /
                          (1024 * 1024)
                        ).toFixed(1)} MB`}
                  </span>
                </div>

                <button
                  type="button"
                  className="chat-attachment-remove"
                  onClick={() => handleRemoveAttachment(index)}
                  aria-label={`Remove ${file.name}`}
                  disabled={composerLocked}
                >
                  <X size={15} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input bar: no voice-end button here */}
        <div className="chat-composer-input-area">
          <textarea
            ref={textareaRef}
            className="chat-composer-input"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              voiceActive
                ? "Voice conversation is active"
                : "Ask OmaxasAI"
            }
            aria-label="Write a message"
            rows={1}
            maxLength={50000}
            disabled={composerLocked}
          />

          <button
            type="button"
            className="chat-composer-expand-button"
            onClick={toggleExpanded}
            aria-label={
              expanded ? "Collapse composer" : "Expand composer"
            }
            aria-expanded={expanded}
            title={expanded ? "Collapse" : "Expand"}
            disabled={voiceActive}
          >
            {expanded ? (
              <Minimize2 size={18} />
            ) : (
              <Maximize2 size={18} />
            )}
          </button>
        </div>

        {/* Native file picker */}
        <input
          ref={fileInputRef}
          className="chat-composer-file-input"
          type="file"
          multiple
          accept="image/*,.pdf,.txt,.csv,.doc,.docx,.xlsx,.md"
          onChange={handleFileSelection}
          tabIndex={-1}
          aria-label="Choose files"
          disabled={composerLocked}
        />

        {/* Existing toolbar; its layout and positions stay the same */}
        <div className="chat-composer-toolbar chat-composer-toolbar-v2">
          <div className="chat-composer-toolbar-left">
            <button
              type="button"
              className="chat-attach-button"
              onClick={handleChooseFiles}
              disabled={composerLocked}
              aria-label="Attach files"
              title="Add photos and files"
            >
              <Plus size={24} />
            </button>
          </div>

          <div className="chat-composer-toolbar-right">
            <button
              type="button"
              className={`chat-think-button ${
                mode === "think" ? "chat-think-active" : ""
              }`}
              onClick={() =>
                setMode((current) =>
                  current === "think" ? "auto" : "think"
                )
              }
              disabled={composerLocked}
              aria-pressed={mode === "think"}
              title="Toggle Think mode"
            >
              <Brain size={17} />
              <span>Think</span>
            </button>

            <button
              type="button"
              className={`chat-web-search-button ${
                webSearch ? "chat-web-search-active" : ""
              }`}
              onClick={() => setWebSearch((current) => !current)}
              disabled={composerLocked}
              aria-pressed={webSearch}
              aria-label={
                webSearch ? "Disable web search" : "Enable web search"
              }
              title={webSearch ? "Web Search: On" : "Web Search: Off"}
            >
              <Globe size={19} />
            </button>

            {/* Standard speech-to-text input */}
            <div className="chat-microphone">
              <VoiceInput
                onTranscript={handleVoiceTranscript}
                disabled={composerLocked}
                lang="en-IN"
              />
            </div>

            {/* X replaces AudioLines at the EXACT same toolbar position */}
            {voiceActive ? (
              <button
                type="button"
                className="chat-composer-round-action chat-composer-voice-mode"
                onClick={stopVoiceConversation}
                aria-label="End voice conversation"
                title="End voice conversation"
              >
                <X size={22} strokeWidth={2.5} />
              </button>
            ) : isBusy && typeof onStop === "function" ? (
              <button
                type="button"
                className="chat-composer-round-action chat-stop-button"
                onClick={handleStop}
                aria-label="Stop generating"
                title="Stop generating"
              >
                <Square size={15} fill="currentColor" />
              </button>
            ) : hasText ? (
              <button
                type="submit"
                className="chat-composer-round-action chat-composer-send"
                disabled={!canSend}
                aria-label="Send message"
                title="Send message"
              >
                <ArrowUp size={21} strokeWidth={2.5} />
              </button>
            ) : (
              <button
                type="button"
                className="chat-composer-round-action chat-composer-voice-mode"
                onClick={handleVoiceMode}
                disabled={isDisabled}
                aria-label="Start voice conversation"
                title="Voice conversation"
              >
                <AudioLines size={22} strokeWidth={2.2} />
              </button>
            )}
          </div>
        </div>

        {/* Voice errors, without adding another panel */}
        {voiceError && !voiceActive && (
          <p
            className="chat-composer-voice-notice"
            role="alert"
          >
            {voiceError}
          </p>
        )}
      </form>
    </section>
  );
}
