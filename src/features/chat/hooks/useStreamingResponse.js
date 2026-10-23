import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { API_BASE_URL } from "../../../services/apiClient";
import { getAccessToken } from "../../../utils/storage";

function getErrorMessage(data, status) {
  if (typeof data === "string" && data.trim()) {
    return data;
  }

  if (data && typeof data === "object") {
    if (typeof data.detail === "string") return data.detail;
    if (typeof data.message === "string") return data.message;
    if (typeof data.error === "string") return data.error;
  }

  return `Request failed with status ${status}.`;
}

// Extract text from common JSON streaming formats.
function extractChunkText(value) {
  if (typeof value === "string") {
    return value;
  }

  if (!value || typeof value !== "object") {
    return "";
  }

  if (typeof value.token === "string") return value.token;
  if (typeof value.delta === "string") return value.delta;
  if (typeof value.text === "string") return value.text;
  if (typeof value.content === "string") return value.content;

  const choice = value.choices?.[0];

  if (typeof choice?.delta?.content === "string") {
    return choice.delta.content;
  }

  if (typeof choice?.text === "string") {
    return choice.text;
  }

  return "";
}

async function readErrorResponse(response) {
  const contentType = response.headers.get("content-type") || "";

  try {
    const data = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    return getErrorMessage(data, response.status);
  } catch {
    return `Request failed with status ${response.status}.`;
  }
}

export function useStreamingResponse() {
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const controllerRef = useRef(null);
  const responseRef = useRef("");

  const cancel = useCallback(() => {
    controllerRef.current?.abort();
  }, []);

  const clearResponse = useCallback(() => {
    cancel();
    responseRef.current = "";
    setResponse("");
    setError("");
    setLoading(false);
  }, [cancel]);

  const startStreaming = useCallback(
    async ({
      message,
      mode = "auto",
      webSearch = false,
    } = {}) => {
      const cleanMessage =
        typeof message === "string" ? message.trim() : "";

      if (!cleanMessage) {
        setError("Message cannot be empty.");
        return null;
      }

      // Stop an earlier request before starting another one.
      controllerRef.current?.abort();

      const controller = new AbortController();
      controllerRef.current = controller;

      responseRef.current = "";
      setResponse("");
      setError("");
      setLoading(true);

      function replaceResponse(text) {
        responseRef.current = text;
        setResponse(text);
      }

      function appendChunk(text) {
        if (!text) return;

        responseRef.current += text;
        setResponse(responseRef.current);
      }

      try {
        const token = getAccessToken();

        const result = await fetch(
          `${API_BASE_URL}/assistant/chat/`,
          {
            method: "POST",
            headers: {
              Accept: "application/json, text/event-stream",
              "Content-Type": "application/json",
              ...(token
                ? { Authorization: `Bearer ${token}` }
                : {}),
            },
            body: JSON.stringify({
              message: cleanMessage,
              mode,
              web_search: webSearch,
              stream: true,
            }),
            signal: controller.signal,
          },
        );

        if (!result.ok) {
          throw new Error(await readErrorResponse(result));
        }

        const contentType =
          result.headers.get("content-type") || "";

        // Current Django endpoint returns a regular JSON reply.
        // Keep this branch so the hook works with the current API.
        if (
          contentType.includes("application/json") ||
          !result.body
        ) {
          const data = await result.json();

          if (typeof data.reply !== "string") {
            throw new Error(
              "Django response mein reply field nahi mila.",
            );
          }

          replaceResponse(data.reply);

          return data;
        }

        const isEventStream =
          contentType.includes("text/event-stream");

        const isNdjson =
          contentType.includes("application/x-ndjson") ||
          contentType.includes("application/ndjson");

        if (!isEventStream && !isNdjson) {
          // Support a server that streams plain text chunks.
          const reader = result.body.getReader();
          const decoder = new TextDecoder();

          while (true) {
            const { value, done } = await reader.read();

            if (done) break;

            appendChunk(decoder.decode(value, { stream: true }));
          }

          appendChunk(decoder.decode());

          return { reply: responseRef.current };
        }

        // SSE and NDJSON require a documented server-side
        // payload format. This parser supports common token,
        // delta, text, content, and OpenAI-style choice chunks.
        const reader = result.body.getReader();
        const decoder = new TextDecoder();

        let buffer = "";
        let eventDataLines = [];

        function processPayload(payload) {
          const trimmed = payload.trim();

          if (!trimmed || trimmed === "[DONE]") {
            return;
          }

          let parsed;

          try {
            parsed = JSON.parse(trimmed);
          } catch {
            // Plain-text SSE data is also supported.
            appendChunk(payload);
            return;
          }

          if (typeof parsed.reply === "string") {
            replaceResponse(parsed.reply);
            return;
          }

          const text = extractChunkText(parsed);
          appendChunk(text);
        }

        function processLine(line) {
          if (isEventStream) {
            if (line === "") {
              if (eventDataLines.length > 0) {
                processPayload(eventDataLines.join("\n"));
                eventDataLines = [];
              }

              return;
            }

            // Ignore SSE comments and metadata lines.
            if (line.startsWith(":")) return;

            if (line.startsWith("data:")) {
              eventDataLines.push(line.slice(5).replace(/^ /, ""));
            }

            return;
          }

          if (line.trim()) {
            processPayload(line);
          }
        }

        while (true) {
          const { value, done } = await reader.read();

          buffer += decoder.decode(value || new Uint8Array(), {
            stream: !done,
          });

          const lines = buffer.split(/\r?\n/);
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            processLine(line);
          }

          if (done) break;
        }

        if (buffer) {
          processLine(buffer);
        }

        if (isEventStream && eventDataLines.length > 0) {
          processPayload(eventDataLines.join("\n"));
        }

        return { reply: responseRef.current };
      } catch (err) {
        if (err.name === "AbortError") {
          return null;
        }

        setError(
          err.message ||
            "AI response receive karte waqt error aaya.",
        );

        return null;
      } finally {
        if (controllerRef.current === controller) {
          controllerRef.current = null;
          setLoading(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    return () => {
      controllerRef.current?.abort();
    };
  }, []);

  return {
    response,
    loading,
    error,
    startStreaming,
    cancel,
    clearResponse,
  };
}

export default useStreamingResponse;