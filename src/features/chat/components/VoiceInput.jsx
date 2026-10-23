import { useEffect, useRef, useState } from "react";

function getSpeechRecognitionConstructor() {
  if (typeof window === "undefined") {
    return null;
  }

  return (
    window.SpeechRecognition ||
    window.webkitSpeechRecognition ||
    null
  );
}

function getSpeechErrorMessage(error) {
  switch (error) {
    case "not-allowed":
    case "service-not-allowed":
      return "Microphone permission allow karo, phir dobara try karo.";

    case "no-speech":
      return "Koi speech detect nahi hui. Dobara bolkar try karo.";

    case "audio-capture":
      return "Microphone nahi mil raha. Device aur microphone settings check karo.";

    case "network":
      return "Speech recognition network error. Connection check karo.";

    case "language-not-supported":
      return "Selected language speech recognition ke liye supported nahi hai.";

    default:
      return "Voice recognition mein error aaya. Dobara try karo.";
  }
}

export default function VoiceInput({
  onTranscript,
  disabled = false,
  lang = "en-IN",
  className = "",
}) {
  const recognitionRef = useRef(null);
  const callbackRef = useRef(onTranscript);
  const mountedRef = useRef(true);

  const [supported, setSupported] = useState(null);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState("");

  // Keep the latest callback available to recognition events.
  callbackRef.current = onTranscript;

  useEffect(() => {
    mountedRef.current = true;
    setSupported(Boolean(getSpeechRecognitionConstructor()));

    return () => {
      mountedRef.current = false;

      const recognition = recognitionRef.current;

      if (recognition) {
        // Detach callbacks before stopping to avoid state updates
        // after this component has unmounted.
        recognition.onresult = null;
        recognition.onerror = null;
        recognition.onend = null;

        try {
          recognition.abort();
        } catch {
          // Recognition may already have stopped.
        }

        recognitionRef.current = null;
      }
    };
  }, []);

  function stopListening() {
    const recognition = recognitionRef.current;

    if (!recognition) {
      setListening(false);
      return;
    }

    try {
      recognition.stop();
    } catch {
      recognitionRef.current = null;
      setListening(false);
    }
  }

  function startListening() {
    const Recognition = getSpeechRecognitionConstructor();

    if (!Recognition) {
      setSupported(false);
      setError(
        "Is browser mein voice input supported nahi hai. Chrome ya Edge ka updated version try karo.",
      );
      return;
    }

    if (recognitionRef.current || listening) {
      return;
    }

    if (typeof callbackRef.current !== "function") {
      setError("Voice transcript receive karne ka callback configured nahi hai.");
      return;
    }

    setError("");

    let recognition;

    try {
      recognition = new Recognition();

      recognition.lang = lang;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event) => {
        let finalTranscript = "";

        for (
          let index = event.resultIndex;
          index < event.results.length;
          index += 1
        ) {
          const result = event.results[index];
          const transcript = result?.[0]?.transcript;

          if (result?.isFinal && transcript) {
            finalTranscript += transcript;
          }
        }

        const cleanTranscript = finalTranscript.trim();

        if (cleanTranscript && mountedRef.current) {
          callbackRef.current?.(cleanTranscript);
        }
      };

      recognition.onerror = (event) => {
        if (!mountedRef.current) return;

        if (event.error !== "aborted") {
          setError(getSpeechErrorMessage(event.error));
        }

        setListening(false);
        recognitionRef.current = null;
      };

      recognition.onend = () => {
        if (!mountedRef.current) return;

        setListening(false);
        recognitionRef.current = null;
      };

      recognitionRef.current = recognition;
      recognition.start();

      setListening(true);
    } catch (exception) {
      recognitionRef.current = null;
      setListening(false);

      if (mountedRef.current) {
        setError(
          exception?.name === "NotAllowedError"
            ? "Microphone permission allow karo."
            : "Voice input start nahi hua. Dobara try karo.",
        );
      }
    }
  }

  function handleClick() {
    if (disabled) return;

    if (listening) {
      stopListening();
    } else {
      startListening();
    }
  }

  const buttonDisabled = disabled || supported === false;

  return (
    <div className={`voice-input ${className}`.trim()}>
      <button
        type="button"
        className={[
          "voice-input-button",
          listening ? "voice-input-listening" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={handleClick}
        disabled={buttonDisabled}
        aria-label={
          listening ? "Stop voice input" : "Start voice input"
        }
        aria-pressed={listening}
        title={
          supported === false
            ? "Voice input is not supported in this browser"
            : listening
              ? "Stop voice input"
              : "Speak to enter a message"
        }
      >
        {listening ? (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </svg>
        ) : (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="9" y="2" width="6" height="12" rx="3" />
            <path d="M5 10v2a7 7 0 0 0 14 0v-2" />
            <path d="M12 19v3" />
            <path d="M8 22h8" />
          </svg>
        )}
      </button>

      {listening && (
        <span className="voice-input-status" role="status">
          Listening…
        </span>
      )}

      {error && (
        <p className="voice-input-error" role="status">
          {error}
        </p>
      )}

      {supported === false && (
        <span className="voice-input-help">
          Voice input unavailable
        </span>
      )}
    </div>
  );
}