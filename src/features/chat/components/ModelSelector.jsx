import { useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { getAvailableModels } from "../chatService";

const AUTO_VALUE = "__omaxas_auto__";

const PREFERRED_PROVIDER_ORDER = [
  "gemini",
  "openrouter",
  "groq",
  "cohere",
];

const PROVIDER_LABELS = {
  openai: "OpenAI",
  gemini: "Gemini",
  anthropic: "Anthropic",
  xai: "xAI",
  deepseek: "DeepSeek",
  mistral: "Mistral",
  cohere: "Cohere",
  groq: "Groq",
  openrouter: "OpenRouter",
  together: "Together AI",
  fireworks: "Fireworks AI",
  cerebras: "Cerebras",
  perplexity: "Perplexity",
  huggingface: "Hugging Face",
  nvidia: "NVIDIA",
  omaxas: "OmaxasAI",
  custom: "Custom Provider",
};

const UNAVAILABLE_STATUSES = new Set([
  "coming_soon",
  "coming soon",
  "disabled",
  "unavailable",
  "inactive",
  "not_available",
]);

function normalizeProvider(provider) {
  return String(provider || "")
    .toLowerCase()
    .trim()
    .replace(/[\s-]+/g, "_");
}

function extractModels(response) {
  let data = response?.data ?? response;

  // Support APIs that wrap the payload in a data property.
  if (
    data &&
    !Array.isArray(data) &&
    data.data !== undefined
  ) {
    data = data.data;
  }

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  if (Array.isArray(data?.models)) {
    return data.models;
  }

  return [];
}

function isUnavailable(model) {
  const config =
    model?.config && typeof model.config === "object"
      ? model.config
      : {};

  const status = String(
    model?.availability_status || config?.status || ""
  )
    .toLowerCase()
    .trim()
    .replace(/[\s-]+/g, "_");

  return (
    model?.active === false ||
    model?.is_available_for_inference === false ||
    config?.coming_soon === true ||
    UNAVAILABLE_STATUSES.has(status)
  );
}

function getModelId(model) {
  return model?.id ?? model?.pk ?? null;
}

function getModelName(model) {
  const config =
    model?.config && typeof model.config === "object"
      ? model.config
      : {};

  return (
    model?.name ||
    model?.display_name ||
    model?.label ||
    config?.display_name ||
    model?.model_id ||
    model?.model_name ||
    "Unnamed model"
  );
}

function getProviderLabel(provider) {
  const normalized = normalizeProvider(provider);

  return (
    PROVIDER_LABELS[normalized] ||
    String(provider || "Other Provider")
      .trim()
  );
}

function getSelectionValue(model) {
  const id = getModelId(model);

  return id === null || id === undefined
    ? AUTO_VALUE
    : `model:${String(id)}`;
}

function getProviderRank(provider) {
  const index = PREFERRED_PROVIDER_ORDER.indexOf(
    normalizeProvider(provider)
  );

  return index === -1
    ? PREFERRED_PROVIDER_ORDER.length
    : index;
}

function sortModels(models) {
  return [...models].sort((a, b) => {
    const providerA = normalizeProvider(a?.provider);
    const providerB = normalizeProvider(b?.provider);

    const rankDifference =
      getProviderRank(providerA) -
      getProviderRank(providerB);

    if (rankDifference !== 0) {
      return rankDifference;
    }

    const providerComparison =
      getProviderLabel(providerA).localeCompare(
        getProviderLabel(providerB)
      );

    if (providerComparison !== 0) {
      return providerComparison;
    }

    return getModelName(a).localeCompare(
      getModelName(b)
    );
  });
}

export default function ModelSelector({
  selectedModel = null,
  onModelChange,
  disabled = false,
}) {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadModels() {
      setLoading(true);
      setError("");

      try {
        const response = await getAvailableModels();
        const registeredModels = extractModels(response);

        const usableModels = registeredModels.filter((model) => {
          const provider = normalizeProvider(model?.provider);
          const id = getModelId(model);

          return (
            Boolean(provider) &&
            id !== null &&
            id !== undefined &&
            String(id).length > 0 &&
            !isUnavailable(model)
          );
        });

        // Avoid duplicate entries if the API returns duplicate IDs.
        const uniqueModels = Array.from(
          new Map(
            usableModels.map((model) => [
              String(getModelId(model)),
              model,
            ])
          ).values()
        );

        if (!cancelled) {
          setModels(sortModels(uniqueModels));
        }
      } catch (err) {
        if (!cancelled) {
          setModels([]);
          setError(
            err?.response?.data?.detail ||
              err?.message ||
              "Could not load available models."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadModels();

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedValue = useMemo(() => {
    if (
      selectedModel === null ||
      selectedModel === undefined
    ) {
      return AUTO_VALUE;
    }

    const selectedId =
      typeof selectedModel === "object"
        ? getModelId(selectedModel)
        : selectedModel;

    if (
      selectedId === null ||
      selectedId === undefined
    ) {
      return AUTO_VALUE;
    }

    const matchingModel = models.find(
      (model) =>
        String(getModelId(model)) === String(selectedId)
    );

    return matchingModel
      ? getSelectionValue(matchingModel)
      : AUTO_VALUE;
  }, [selectedModel, models]);

  function handleChange(event) {
    const value = event.target.value;

    if (value === AUTO_VALUE) {
      onModelChange?.(null);
      return;
    }

    const selected = models.find(
      (model) => getSelectionValue(model) === value
    );

    if (selected) {
      onModelChange?.(selected);
    }
  }

  return (
    <div
      className="model-selector"
      style={styles.wrapper}
      title={
        error ||
        (loading
          ? "Loading available models..."
          : "Choose an AI model")
      }
    >
      <select
        className="model-selector-select"
        aria-label="Select AI model"
        aria-busy={loading}
        value={selectedValue}
        onChange={handleChange}
        disabled={disabled || loading}
        style={styles.select}
      >
        <option value={AUTO_VALUE}>
          OmaxasAI — auto
        </option>

        {models.map((model) => {
          const provider = normalizeProvider(model.provider);
          const modelName = getModelName(model);
          const providerLabel = getProviderLabel(provider);
          const selectionValue = getSelectionValue(model);

          return (
            <option
              key={String(getModelId(model))}
              value={selectionValue}
              title={`${providerLabel} — ${modelName}`}
            >
              {providerLabel} — {modelName}
            </option>
          );
        })}

        {!loading && models.length === 0 && (
          <option value="__omaxas_no_models__" disabled>
            {error ? "Models unavailable" : "No models available"}
          </option>
        )}
      </select>

      <ChevronDown
        size={14}
        strokeWidth={1.8}
        aria-hidden="true"
        style={styles.chevron}
      />
    </div>
  );
}

const styles = {
  wrapper: {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "flex-end",
    flexShrink: 0,
    width: "122px",
    height: "28px",
    padding: 0,
    margin: 0,
    border: "none",
    borderRadius: 0,
    background: "transparent",
    boxShadow: "none",
  },

  select: {
    appearance: "none",
    WebkitAppearance: "none",
    MozAppearance: "none",

    display: "block",
    width: "100%",
    height: "28px",
    minHeight: "28px",

    padding: "0 19px 0 0",
    margin: 0,

    border: "none",
    borderRadius: 0,
    outline: "none",
    boxShadow: "none",

    background: "transparent",
    color: "var(--text-color, #a9a1a1)",

    fontFamily: "inherit",
    fontSize: "12px",
    fontWeight: 500,
    lineHeight: "28px",
    textAlign: "right",
    textAlignLast: "right",

    cursor: "pointer",
  },

  chevron: {
    position: "absolute",
    right: 0,
    top: "50%",
    transform: "translateY(-50%)",
    pointerEvents: "none",
    color: "var(--text-color, rgb(194, 190, 190))",
    opacity: 0.75,
  },
};