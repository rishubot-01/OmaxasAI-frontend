import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

export const VOICE_LANGUAGES = [
  { code: "auto", name: "Auto Detect", recognitionCode: "hi-IN" },
  { code: "en-IN", name: "English (India)" },
  { code: "hi-IN", name: "हिंदी" },
  { code: "bho-IN", name: "भोजपुरी" },
  { code: "bn-IN", name: "বাংলা" },
  { code: "as-IN", name: "অসমীয়া" },
  { code: "ta-IN", name: "தமிழ்" },
  { code: "te-IN", name: "తెలుగు" },
  { code: "mr-IN", name: "मराठी" },
  { code: "gu-IN", name: "ગુજરાતી" },
  { code: "pa-IN", name: "ਪੰਜਾਬੀ" },
  { code: "kn-IN", name: "ಕನ್ನಡ" },
  { code: "ml-IN", name: "മലയാളം" },
  { code: "or-IN", name: "ଓଡ଼ିଆ" },
  { code: "ur-IN", name: "اردو" },
];

const LANGUAGE_NAMES = {
  "en-IN": "English",
  "hi-IN": "Hindi",
  "bho-IN": "Bhojpuri",
  "bn-IN": "Bengali",
  "as-IN": "Assamese",
  "ta-IN": "Tamil",
  "te-IN": "Telugu",
  "mr-IN": "Marathi",
  "gu-IN": "Gujarati",
  "pa-IN": "Punjabi",
  "kn-IN": "Kannada",
  "ml-IN": "Malayalam",
  "or-IN": "Odia",
  "ur-IN": "Urdu",
};

function detectLanguageFromText(text, fallback = "hi-IN") {
  if (!text) return fallback;

  // Detect languages with distinct writing systems.
  if (/[\u0B80-\u0BFF]/.test(text)) return "ta-IN";
  if (/[\u0C00-\u0C7F]/.test(text)) return "te-IN";
  if (/[\u0C80-\u0CFF]/.test(text)) return "kn-IN";
  if (/[\u0D00-\u0D7F]/.test(text)) return "ml-IN";
  if (/[\u0A00-\u0A7F]/.test(text)) return "pa-IN";
  if (/[\u0A80-\u0AFF]/.test(text)) return "gu-IN";
  if (/[\u0B00-\u0B7F]/.test(text)) return "or-IN";
  if (/[\u0600-\u06FF]/.test(text)) return "ur-IN";

  if (/[\u0980-\u09FF]/.test(text)) {
    // Assamese and Bengali share a writing system.
    // This heuristic cannot reliably distinguish them.
    return fallback === "as-IN" ? "as-IN" : "bn-IN";
  }

  if (/[\u0900-\u097F]/.test(text)) {
    // Hindi, Marathi and Bhojpuri share Devanagari.
    // Preserve the user's selected language.
    if (
      ["hi-IN", "mr-IN", "bho-IN"].includes(fallback)
    ) {
      return fallback;
    }

    return "hi-IN";
  }

  if (/[a-zA-Z]/.test(text)) return "en-IN";

  return fallback;
}

export default function useVoiceConversation({
  onSend,
  mode = "auto",
  webSearch = false,
  disabled = false,
  language = "hi-IN",
}) {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const recognitionRef = useRef(null);
  const activeRef = useRef(false);
  const busyRef = useRef(false);
  const restartTimerRef = useRef(null);

  const optionsRef = useRef({
    onSend,
    mode,
    webSearch,
    language,
  });

  optionsRef.current = {
    onSend,
    mode,
    webSearch,
    language,
  };

  const getRecognitionLanguage = useCallback(() => {
    const selected = optionsRef.current.language || "hi-IN";

    if (selected === "auto") {
      // Browser recognition has no universal auto-language mode.
      // Hindi is the fallback until the user selects another language.
      return "hi-IN";
    }

    return selected;
  }, []);

  const scheduleRecognition = useCallback(() => {
    if (restartTimerRef.current !== null) {
      clearTimeout(restartTimerRef.current);
    }

    restartTimerRef.current = setTimeout(() => {
      restartTimerRef.current = null;

      if (!activeRef.current || busyRef.current) return;

      const recognition = recognitionRef.current;
      if (!recognition) return;

      // Apply the latest language preference before restarting.
      recognition.lang = getRecognitionLanguage();

      try {
        recognition.start();
      } catch (err) {
        if (
          err?.name !== "InvalidStateError" &&
          activeRef.current
        ) {
          setError(
            "Microphone could not restart. Please try again."
          );
        }
      }
    }, 300);
  }, [getRecognitionLanguage]);

  const finishTurn = useCallback(() => {
    busyRef.current = false;

    if (!activeRef.current) return;

    setStatus("listening");
    scheduleRecognition();
  }, [scheduleRecognition]);

  const speakResponse = useCallback(
    (text, preferredLanguage) => {
      if (!activeRef.current) return;

      if (
        typeof window === "undefined" ||
        !window.speechSynthesis ||
        typeof window.SpeechSynthesisUtterance !== "function"
      ) {
        setError(
          "Voice playback is not supported in this browser."
        );
        finishTurn();
        return;
      }

      try {
        const utterance =
          new window.SpeechSynthesisUtterance(text);

        const selected = optionsRef.current.language || "hi-IN";

        const outputLanguage =
          selected === "auto"
            ? detectLanguageFromText(
                text,
                preferredLanguage || "hi-IN"
              )
            : detectLanguageFromText(text, selected);

        utterance.lang = outputLanguage;

        utterance.onend = finishTurn;

        utterance.onerror = (event) => {
          if (
            activeRef.current &&
            event?.error !== "canceled"
          ) {
            setError(
              "Could not play the AI voice response. Check available voices."
            );
          }

          finishTurn();
        };

        setStatus("speaking");

        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
      } catch {
        setError("Could not start voice playback.");
        finishTurn();
      }
    },
    [finishTurn]
  );

  const processTranscript = useCallback(
    async (transcript) => {
      if (
        !activeRef.current ||
        busyRef.current ||
        !transcript.trim()
      ) {
        return;
      }

      busyRef.current = true;
      setStatus("thinking");
      setError("");

      try {
        recognitionRef.current?.stop();
      } catch {
        // Continue even if recognition has already stopped.
      }

      try {
        const options = optionsRef.current;
        const send = options.onSend;

        if (typeof send !== "function") {
          throw new Error("Chat API is not connected.");
        }

        const selectedLanguage = options.language || "hi-IN";

        const transcriptLanguage =
          selectedLanguage === "auto"
            ? detectLanguageFromText(transcript, "hi-IN")
            : selectedLanguage;

        const response = await send(transcript.trim(), {
          mode: options.mode || "auto",
          webSearch: options.webSearch ?? false,
          attachments: [],

          // These extra fields require backend/API support
          // to affect the AI's text response.
          language: selectedLanguage,
          languageName:
            LANGUAGE_NAMES[transcriptLanguage] ||
            "Hindi",
          transcriptLanguage,
          responseLanguage: transcriptLanguage,
        });

        if (!activeRef.current) return;

        const answer =
          typeof response === "string"
            ? response
            : response?.content ??
              response?.assistant_message?.content ??
              response?.reply ??
              response?.response?.reply;

        if (
          typeof answer !== "string" ||
          !answer.trim()
        ) {
          setError(
            "AI response was not returned. Check the chat request."
          );
          finishTurn();
          return;
        }

        speakResponse(answer.trim(), transcriptLanguage);
      } catch (err) {
        if (activeRef.current) {
          setError(
            err?.message ||
              "Voice conversation request failed."
          );
          finishTurn();
        }
      }
    },
    [finishTurn, speakResponse]
  );

  const startVoiceConversation = useCallback(() => {
    if (activeRef.current) return true;
    if (disabled) return false;

    if (typeof window === "undefined") {
      setError(
        "Voice conversation is only available in a browser."
      );
      return false;
    }

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError(
        "Speech recognition is not supported. Try Chrome or Edge."
      );
      return false;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = getRecognitionLanguage();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      if (activeRef.current && !busyRef.current) {
        setStatus("listening");
      }
    };

    recognition.onresult = (event) => {
      if (!activeRef.current || busyRef.current) return;

      const transcripts = [];

      for (
        let index = event.resultIndex;
        index < event.results.length;
        index += 1
      ) {
        const result = event.results[index];

        if (result.isFinal && result[0]?.transcript) {
          transcripts.push(result[0].transcript);
        }
      }

      const transcript = transcripts.join(" ").trim();

      if (transcript) {
        void processTranscript(transcript);
      }
    };

    recognition.onerror = (event) => {
      if (
        event.error === "aborted" ||
        event.error === "no-speech"
      ) {
        return;
      }

      const errorMessages = {
        "not-allowed":
          "Microphone permission denied. Allow microphone access in your browser.",
        "service-not-allowed":
          "The browser speech recognition service is unavailable.",
        "audio-capture":
          "No working microphone was detected.",
        network:
          "Speech recognition encountered a network error.",
      };

      setError(
        errorMessages[event.error] ||
          `Speech recognition failed: ${event.error}.`
      );

      const shouldStop = [
        "not-allowed",
        "service-not-allowed",
        "audio-capture",
        "network",
      ].includes(event.error);

      if (shouldStop) {
        activeRef.current = false;
        busyRef.current = false;
        setIsActive(false);
        setStatus("idle");

        if (recognitionRef.current === recognition) {
          recognitionRef.current = null;
        }

        try {
          recognition.abort();
        } catch {
          // Recognition may already have stopped.
        }

        if (window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }
      }
    };

    recognition.onend = () => {
      if (activeRef.current && !busyRef.current) {
        scheduleRecognition();
      }
    };

    recognitionRef.current = recognition;
    activeRef.current = true;
    busyRef.current = false;

    setIsActive(true);
    setStatus("listening");
    setError("");

    try {
      recognition.start();
      return true;
    } catch {
      activeRef.current = false;
      recognitionRef.current = null;

      setIsActive(false);
      setStatus("idle");
      setError(
        "Could not start the microphone. Check browser permissions."
      );

      return false;
    }
  }, [
    disabled,
    getRecognitionLanguage,
    processTranscript,
    scheduleRecognition,
  ]);

  const stopVoiceConversation = useCallback(() => {
    activeRef.current = false;
    busyRef.current = false;

    setIsActive(false);
    setStatus("idle");
    setError("");

    if (restartTimerRef.current !== null) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }

    const recognition = recognitionRef.current;
    recognitionRef.current = null;

    if (recognition) {
      recognition.onstart = null;
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;

      try {
        recognition.abort();
      } catch {
        // Recognition may already have stopped.
      }
    }

    if (
      typeof window !== "undefined" &&
      window.speechSynthesis
    ) {
      window.speechSynthesis.cancel();
    }
  }, []);

  useEffect(() => {
    return () => {
      activeRef.current = false;
      busyRef.current = false;

      if (restartTimerRef.current !== null) {
        clearTimeout(restartTimerRef.current);
      }

      try {
        recognitionRef.current?.abort();
      } catch {
        // Ignore cleanup errors.
      }

      if (
        typeof window !== "undefined" &&
        window.speechSynthesis
      ) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // If the user changes languages while voice mode is active,
  // restart recognition using the newly selected language.
  useEffect(() => {
    if (!activeRef.current || busyRef.current) return;

    const recognition = recognitionRef.current;
    if (!recognition) return;

    try {
      recognition.stop();
    } catch {
      // The normal onend handler schedules the restart.
    }
  }, [language]);

  return {
    isActive,
    status,
    error,
    startVoiceConversation,
    stopVoiceConversation,
  };
}
