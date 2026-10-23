
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  Languages,
  AudioLines,
  Monitor,
  Settings,
  Save,
} from "lucide-react";

const STORAGE_KEY = "omaxas-settings";

export const OMAXAS_LANGUAGES = [
  { value: "auto", label: "Auto detect" },
  { value: "en-IN", label: "English (India)" },
  { value: "hi-IN", label: "हिंदी (Hindi)" },
  { value: "bho-IN", label: "भोजपुरी (Bhojpuri)" },
  { value: "bn-IN", label: "বাংলা (Bengali)" },
  { value: "as-IN", label: "অসমীয়া (Assamese)" },
  { value: "ta-IN", label: "தமிழ் (Tamil)" },
  { value: "te-IN", label: "తెలుగు (Telugu)" },
  { value: "mr-IN", label: "मराठी (Marathi)" },
  { value: "gu-IN", label: "ગુજરાતી (Gujarati)" },
  { value: "pa-IN", label: "ਪੰਜਾਬੀ (Punjabi)" },
  { value: "kn-IN", label: "ಕನ್ನಡ (Kannada)" },
  { value: "ml-IN", label: "മലയാളം (Malayalam)" },
  { value: "or-IN", label: "ଓଡ଼ିଆ (Odia)" },
  { value: "ur-IN", label: "اردو (Urdu)" },
];

const DEFAULT_SETTINGS = {
  responseLanguage: "auto",
  voiceLanguage: "hi-IN",
  speechOutput: true,
  theme: "system",
};

function loadSettings() {
  if (typeof window === "undefined") {
    return DEFAULT_SETTINGS;
  }

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return { ...DEFAULT_SETTINGS };
    }

    const parsed = JSON.parse(saved);

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return { ...DEFAULT_SETTINGS };
    }

    const validLanguages = OMAXAS_LANGUAGES.map(
      (language) => language.value
    );

    return {
      responseLanguage: validLanguages.includes(parsed.responseLanguage)
        ? parsed.responseLanguage
        : DEFAULT_SETTINGS.responseLanguage,

      voiceLanguage:
        validLanguages.includes(parsed.voiceLanguage) &&
        parsed.voiceLanguage !== "auto"
          ? parsed.voiceLanguage
          : DEFAULT_SETTINGS.voiceLanguage,

      speechOutput:
        typeof parsed.speechOutput === "boolean"
          ? parsed.speechOutput
          : DEFAULT_SETTINGS.speechOutput,

      theme: ["system", "light", "dark"].includes(parsed.theme)
        ? parsed.theme
        : DEFAULT_SETTINGS.theme,
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

const cardStyle = {
  padding: "20px",
  border: "1px solid var(--border-color, #3f3f46)",
  borderRadius: "14px",
  background: "var(--card-background, transparent)",
  marginBottom: "16px",
};

const selectStyle = {
  width: "100%",
  maxWidth: "360px",
  minHeight: "42px",
  padding: "9px 12px",
  borderRadius: "9px",
  border: "1px solid var(--border-color, #52525b)",
  background: "var(--input-background, #18181b)",
  color: "var(--text-color, inherit)",
  font: "inherit",
  boxSizing: "border-box",
};

function SettingRow({ title, description, children }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "16px",
        padding: "16px 0",
        borderBottom: "1px solid var(--border-color, #3f3f46)",
      }}
    >
      <div style={{ flex: "1 1 220px" }}>
        <div style={{ fontWeight: 600, marginBottom: 5 }}>
          {title}
        </div>

        <div
          style={{
            fontSize: 13,
            lineHeight: 1.6,
            color: "var(--text-secondary, #a1a1aa)",
          }}
        >
          {description}
        </div>
      </div>

      <div style={{ flex: "0 1 360px", minWidth: 0 }}>
        {children}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const navigate = useNavigate();

  const [settings, setSettings] = useState(loadSettings);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Apply the selected theme identifier to the document.
  // Actual colours depend on the app's CSS theme rules.
  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const root = document.documentElement;

    root.dataset.theme = settings.theme;

    try {
      const prefersDark =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;

      root.style.colorScheme =
        settings.theme === "system"
          ? prefersDark
            ? "dark"
            : "light"
          : settings.theme;
    } catch {
      root.style.colorScheme =
        settings.theme === "system" ? "normal" : settings.theme;
    }
  }, [settings.theme]);

  function updateSetting(key, value) {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));

    setSaved(false);
    setSaveError("");
  }

  function handleSave(event) {
    event.preventDefault();

    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(settings)
      );

      // Notify components that choose to subscribe to preference changes.
      window.dispatchEvent(
        new CustomEvent("omaxas-settings-changed", {
          detail: { ...settings },
        })
      );

      setSaved(true);
      setSaveError("");
    } catch {
      setSaved(false);
      setSaveError(
        "Settings could not be saved. Check browser storage permissions."
      );
    }
  }

  return (
    <section
      className="settings-page"
      style={{
        width: "100%",
        minHeight: "100%",
        boxSizing: "border-box",
        overflowY: "auto",
        padding: "clamp(20px, 4vw, 40px)",
        color: "var(--text-color, inherit)",
      }}
    >
      <div style={{ maxWidth: 850, margin: "0 auto" }}>
        <button
          type="button"
          onClick={() => navigate("/chat/new")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 0",
            marginBottom: 24,
            border: 0,
            background: "transparent",
            color: "inherit",
            cursor: "pointer",
            font: "inherit",
          }}
        >
          <ArrowLeft size={18} />
          Back to chat
        </button>

        <header style={{ marginBottom: 28 }}>
          <h1
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              margin: "0 0 8px",
              fontSize: "clamp(24px, 3vw, 32px)",
            }}
          >
            <Settings size={27} />
            Settings
          </h1>

          <p
            style={{
              margin: 0,
              color: "var(--text-secondary, #a1a1aa)",
              lineHeight: 1.6,
            }}
          >
            Customize your Omaxas AI experience.
          </p>
        </header>

        <form onSubmit={handleSave}>
          {/* Language preferences */}
          <div style={cardStyle}>
            <h2
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                margin: "0 0 4px",
                fontSize: 18,
              }}
            >
              <Languages size={20} />
              Language preferences
            </h2>

            <SettingRow
              title="AI response language"
              description="Choose the preferred language for AI replies."
            >
              <select
                name="responseLanguage"
                aria-label="AI response language"
                value={settings.responseLanguage}
                onChange={(event) =>
                  updateSetting("responseLanguage", event.target.value)
                }
                style={selectStyle}
              >
                {OMAXAS_LANGUAGES.map((language) => (
                  <option
                    key={language.value}
                    value={language.value}
                  >
                    {language.label}
                  </option>
                ))}
              </select>
            </SettingRow>

            <SettingRow
              title="Voice input language"
              description="Choose the language you normally speak to the assistant."
            >
              <select
                name="voiceLanguage"
                aria-label="Voice input language"
                value={settings.voiceLanguage}
                onChange={(event) =>
                  updateSetting("voiceLanguage", event.target.value)
                }
                style={selectStyle}
              >
                {OMAXAS_LANGUAGES.filter(
                  (language) => language.value !== "auto"
                ).map((language) => (
                  <option
                    key={language.value}
                    value={language.value}
                  >
                    {language.label}
                  </option>
                ))}
              </select>
            </SettingRow>
          </div>

          {/* Voice preferences */}
          <div style={cardStyle}>
            <h2
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                margin: "0 0 4px",
                fontSize: 18,
              }}
            >
              <AudioLines size={20} />
              Voice assistant
            </h2>

            <SettingRow
              title="Spoken AI responses"
              description="Allow the assistant to speak responses during voice conversations."
            >
              <label
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  name="speechOutput"
                  checked={settings.speechOutput}
                  onChange={(event) =>
                    updateSetting("speechOutput", event.target.checked)
                  }
                />
                Enable voice output
              </label>
            </SettingRow>
          </div>

          {/* Appearance */}
          <div style={cardStyle}>
            <h2
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                margin: "0 0 4px",
                fontSize: 18,
              }}
            >
              <Monitor size={20} />
              Appearance
            </h2>

            <SettingRow
              title="Theme"
              description="Choose the interface appearance."
            >
              <select
                name="theme"
                aria-label="Theme"
                value={settings.theme}
                onChange={(event) =>
                  updateSetting("theme", event.target.value)
                }
                style={selectStyle}
              >
                <option value="system">System default</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </SettingRow>
          </div>

          {saveError && (
            <p
              role="alert"
              style={{ color: "#ef4444", fontSize: 14 }}
            >
              {saveError}
            </p>
          )}

          {saved && (
            <p
              role="status"
              style={{ color: "#22c55e", fontSize: 14 }}
            >
              <Check
                size={16}
                style={{
                  verticalAlign: "middle",
                  marginRight: 6,
                }}
              />
              Preferences saved in this browser.
            </p>
          )}

          <button
            type="submit"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 9,
              padding: "11px 18px",
              border: 0,
              borderRadius: 10,
              background: "#2563eb",
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {saved ? <Check size={17} /> : <Save size={17} />}
            {saved ? "Saved" : "Save settings"}
          </button>
        </form>
      </div>
    </section>
  );
}
