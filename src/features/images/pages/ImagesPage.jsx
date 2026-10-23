
import { useState } from "react";
import "./ImagesPage.css";

const imageStyles = [
  {
    name: "Realistic",
    emoji: "📸",
    description: "Photorealistic images",
  },
  {
    name: "Anime",
    emoji: "🎨",
    description: "Anime and manga art",
  },
  {
    name: "3D Art",
    emoji: "🧊",
    description: "3D rendered scenes",
  },
  {
    name: "Digital Art",
    emoji: "✨",
    description: "Creative digital art",
  },
  {
    name: "Cinematic",
    emoji: "🎬",
    description: "Movie-like visuals",
  },
  {
    name: "Minimal",
    emoji: "◻️",
    description: "Clean and minimal",
  },
];

const aspectRatios = [
  { label: "Square", value: "1:1", shape: "square" },
  { label: "Portrait", value: "3:4", shape: "portrait" },
  { label: "Landscape", value: "16:9", shape: "landscape" },
  { label: "Story", value: "9:16", shape: "story" },
];

const exampleImages = [
  {
    id: 1,
    title: "Dreamy Mountain Landscape",
    category: "Digital Art",
    ratio: "landscape",
    background: "mountain",
    icon: "🏔️",
    prompt:
      "A dreamy mountain landscape at sunset, cinematic light, colorful digital art",
  },
  {
    id: 2,
    title: "Neon Future City",
    category: "Cinematic",
    ratio: "portrait",
    background: "city",
    icon: "🌃",
    prompt:
      "A futuristic neon city at night, cinematic lighting, reflections and detailed architecture",
  },
  {
    id: 3,
    title: "Abstract Glass Shapes",
    category: "3D Art",
    ratio: "landscape",
    background: "glass",
    icon: "💎",
    prompt:
      "Abstract glass shapes, beautiful 3D render, reflective surfaces and soft studio lighting",
  },
  {
    id: 4,
    title: "Fantasy Universe",
    category: "Anime",
    ratio: "portrait",
    background: "fantasy",
    icon: "🌌",
    prompt:
      "A magical fantasy universe in anime art style, glowing stars, colorful nebula and dramatic lighting",
  },
];

export default function ImagesPage() {
  const [prompt, setPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("Realistic");
  const [selectedRatio, setSelectedRatio] = useState("1:1");
  const [imageCount, setImageCount] = useState("1");
  const [status, setStatus] = useState("");

  const handleGenerate = (event) => {
    event.preventDefault();

    if (!prompt.trim()) {
      setStatus("Please describe the image you want to create.");
      return;
    }

    setStatus(
      `Prompt ready · Style: ${selectedStyle} · Ratio: ${selectedRatio} · Images: ${imageCount}. Connect an image-generation API to create real images.`
    );
  };

  const handleExamplePrompt = () => {
    setPrompt(
      "A futuristic city at sunset, cinematic lighting, ultra-detailed architecture, vibrant colors"
    );
    setSelectedStyle("Cinematic");
    setSelectedRatio("16:9");
    setStatus("");
  };

  const handleSelectExample = (item) => {
    setPrompt(item.prompt);
    setSelectedStyle(item.category);
    setSelectedRatio(item.ratio === "portrait" ? "3:4" : "16:9");
    setStatus("");
  };

  return (
    <main className="omaxas-images-page">
      <div className="images-page__container">
        {/* Page header */}
        <header className="images-page__header">
          <p className="images-page__eyebrow">
            OMAXAS AI STUDIO
          </p>

          <h1 className="images-page__title">
            Create Images
          </h1>

          <p className="images-page__description">
            Turn your imagination into visuals. Describe your idea,
            choose a style, and configure your image.
          </p>
        </header>

        {/* Main workspace */}
        <div className="images-page__layout">
          {/* Prompt panel */}
          <section className="images-page__panel images-page__prompt-panel">
            <div className="images-page__panel-header">
              <div>
                <h2>Describe your image</h2>
                <p>Start with an idea and make it your own.</p>
              </div>

              <span className="images-page__studio-badge">
                AI Studio
              </span>
            </div>

            <form
              className="images-page__form"
              onSubmit={handleGenerate}
            >
              {/* Prompt */}
              <div className="images-page__form-section">
                <label
                  className="images-page__label"
                  htmlFor="image-prompt"
                >
                  Image prompt
                </label>

                <textarea
                  id="image-prompt"
                  className="images-page__textarea"
                  value={prompt}
                  onChange={(event) => {
                    setPrompt(event.target.value);
                    setStatus("");
                  }}
                  placeholder="Describe the image you imagine. For example, a futuristic Indian city at sunset, cinematic lighting and detailed architecture..."
                  rows={5}
                  maxLength={2000}
                />

                <div className="images-page__prompt-meta">
                  <span>Be descriptive for better results.</span>
                  <span>{prompt.length}/2000</span>
                </div>

                <button
                  type="button"
                  className="images-page__example-prompt"
                  onClick={handleExamplePrompt}
                >
                  Try an example prompt
                  <span aria-hidden="true"> ↗</span>
                </button>
              </div>

              {/* Style selector */}
              <div className="images-page__form-section">
                <div className="images-page__section-heading">
                  <h3>Choose a style</h3>
                  <p>Select the look you want for your image.</p>
                </div>

                <div className="images-page__styles-grid">
                  {imageStyles.map((style) => {
                    const isSelected =
                      selectedStyle === style.name;

                    return (
                      <button
                        key={style.name}
                        type="button"
                        className={`images-page__style-card ${
                          isSelected
                            ? "images-page__style-card--selected"
                            : ""
                        }`}
                        onClick={() => {
                          setSelectedStyle(style.name);
                          setStatus("");
                        }}
                        aria-pressed={isSelected}
                      >
                        <span
                          className="images-page__style-emoji"
                          aria-hidden="true"
                        >
                          {style.emoji}
                        </span>

                        <span className="images-page__style-name">
                          {style.name}
                        </span>

                        <span className="images-page__style-description">
                          {style.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Aspect ratio */}
              <div className="images-page__form-section">
                <div className="images-page__section-heading">
                  <h3>Aspect ratio</h3>
                  <p>Choose the shape of your image.</p>
                </div>

                <div className="images-page__ratios">
                  {aspectRatios.map((ratio) => {
                    const isSelected =
                      selectedRatio === ratio.value;

                    return (
                      <button
                        key={ratio.value}
                        type="button"
                        className={`images-page__ratio-card ${
                          isSelected
                            ? "images-page__ratio-card--selected"
                            : ""
                        }`}
                        onClick={() => {
                          setSelectedRatio(ratio.value);
                          setStatus("");
                        }}
                        aria-pressed={isSelected}
                      >
                        <span
                          className={`images-page__ratio-shape images-page__ratio-shape--${ratio.shape}`}
                          aria-hidden="true"
                        />

                        <span className="images-page__ratio-label">
                          {ratio.label}
                        </span>

                        <span className="images-page__ratio-value">
                          {ratio.value}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Number of images */}
              <div className="images-page__form-section">
                <label
                  className="images-page__label"
                  htmlFor="image-count"
                >
                  Number of images
                </label>

                <select
                  id="image-count"
                  className="images-page__select"
                  value={imageCount}
                  onChange={(event) => {
                    setImageCount(event.target.value);
                    setStatus("");
                  }}
                >
                  <option value="1">1 image</option>
                  <option value="2">2 images</option>
                  <option value="3">3 images</option>
                  <option value="4">4 images</option>
                </select>
              </div>

              {/* Status */}
              {status && (
                <div
                  className="images-page__status"
                  role="status"
                  aria-live="polite"
                >
                  {status}
                </div>
              )}

              {/* Generate */}
              <button
                type="submit"
                className="images-page__generate-button"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-2-5.8L4 11l6-2.2L12 3Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                  />
                  <path
                    d="m19 15 .9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15Z"
                    fill="currentColor"
                  />
                </svg>

                Generate image
              </button>

              <p className="images-page__disclaimer">
                Image generation requires a connected AI image service.
              </p>
            </form>
          </section>

          {/* Right-side workspace */}
          <aside className="images-page__sidebar">
            {/* Settings summary */}
            <section className="images-page__panel images-page__settings-panel">
              <div className="images-page__panel-header">
                <div>
                  <h2>Your settings</h2>
                  <p>Review your image configuration.</p>
                </div>
              </div>

              <div className="images-page__settings-list">
                <div className="images-page__setting-row">
                  <span>Style</span>
                  <strong>{selectedStyle}</strong>
                </div>

                <div className="images-page__setting-row">
                  <span>Aspect ratio</span>
                  <strong>{selectedRatio}</strong>
                </div>

                <div className="images-page__setting-row">
                  <span>Image count</span>
                  <strong>
                    {imageCount}{" "}
                    {Number(imageCount) === 1 ? "image" : "images"}
                  </strong>
                </div>
              </div>
            </section>

            {/* Preview workspace */}
            <section className="images-page__panel">
              <div className="images-page__panel-header">
                <div>
                  <h2>Image workspace</h2>
                  <p>Your future creations will appear here.</p>
                </div>
              </div>

              <div className="images-page__empty-workspace">
                <div className="images-page__empty-icon">
                  ✨
                </div>

                <h3>Your next idea starts here</h3>

                <p>
                  Write a prompt and connect an image model to start
                  creating images.
                </p>
              </div>
            </section>

            {/* Inspiration gallery */}
            <section className="images-page__panel images-page__inspiration-panel">
              <div className="images-page__panel-header">
                <div>
                  <h2>Explore inspiration</h2>
                  <p>Get ideas for your next creation.</p>
                </div>
              </div>

              <div className="images-page__gallery">
                {exampleImages.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="images-page__gallery-card"
                    onClick={() => handleSelectExample(item)}
                    aria-label={`Use ${item.title} as a prompt`}
                  >
                    <span
                      className={`images-page__gallery-visual images-page__gallery-visual--${item.background} images-page__gallery-visual--${item.ratio}`}
                    >
                      <span
                        className="images-page__gallery-emoji"
                        aria-hidden="true"
                      >
                        {item.icon}
                      </span>
                    </span>

                    <span className="images-page__gallery-info">
                      <span className="images-page__gallery-title">
                        {item.title}
                      </span>

                      <span className="images-page__gallery-category">
                        {item.category}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </section>
          </aside>
        </div>

        <footer className="images-page__footer">
          OMAXAS AI Studio · Image generation API integration required
        </footer>
      </div>
    </main>
  );
}
