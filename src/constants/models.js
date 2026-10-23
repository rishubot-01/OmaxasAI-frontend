/**
 * Omaxas AI - Model Configuration
 * File: src/constants/models.js
 *
 * This file defines frontend model options.
 * The backend must support the selected model IDs.
 */

export const AI_MODELS = [
  {
    id: "omaxas-auto",
    name: "Omaxas Auto",
    label: "Auto",
    description: "Automatically select an available AI model",
    provider: "omaxas",
    category: "general",
    isDefault: true,
    supportsStreaming: true,
    supportsWebSearch: true,
    supportsThinking: true,
    supportsImages: true,
    enabled: true,
  },

  {
    id: "omaxas-fast",
    name: "Omaxas Fast",
    label: "Fast",
    description: "For quick questions and everyday tasks",
    provider: "omaxas",
    category: "general",
    isDefault: false,
    supportsStreaming: true,
    supportsWebSearch: true,
    supportsThinking: false,
    supportsImages: false,
    enabled: true,
  },

  {
    id: "omaxas-reasoning",
    name: "Omaxas Reasoning",
    label: "Reasoning",
    description: "For complex questions and multi-step analysis",
    provider: "omaxas",
    category: "reasoning",
    isDefault: false,
    supportsStreaming: true,
    supportsWebSearch: true,
    supportsThinking: true,
    supportsImages: false,
    enabled: true,
  },

  {
    id: "omaxas-code",
    name: "Omaxas Code",
    label: "Coding",
    description: "For programming, debugging and code explanations",
    provider: "omaxas",
    category: "coding",
    isDefault: false,
    supportsStreaming: true,
    supportsWebSearch: true,
    supportsThinking: true,
    supportsImages: false,
    enabled: true,
  },
];

/**
 * Default model identifier.
 */
export const DEFAULT_MODEL_ID =
  AI_MODELS.find((model) => model.isDefault)?.id ??
  AI_MODELS[0]?.id ??
  null;

/**
 * Return models available in the selector.
 */
export function getAvailableModels() {
  return AI_MODELS.filter((model) => model.enabled);
}

/**
 * Find a model by its identifier.
 */
export function getModelById(modelId) {
  return AI_MODELS.find((model) => model.id === modelId) ?? null;
}

/**
 * Return the default model configuration.
 */
export function getDefaultModel() {
  return getModelById(DEFAULT_MODEL_ID);
}

/**
 * Check whether a model supports a specific feature.
 */
export function modelSupports(modelId, feature) {
  const model = getModelById(modelId);

  if (!model || !model.enabled || !feature) {
    return false;
  }

  return model[feature] === true;
}