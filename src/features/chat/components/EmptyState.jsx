
import omaxasLogo from "../../../assets/Analysis output 1.png";

const suggestedPrompts = [
  {
    title: "Learn something",
    prompt: "Explain how large language models work.",
  },
  {
    title: "Write code",
    prompt: "Write a Python function to check whether a number is prime.",
  },
  {
    title: "Solve a problem",
    prompt: "Help me create a step-by-step project plan.",
  },
];

export default function EmptyState({
  onSelectPrompt,
  disabled = false,
}) {
  return (
    <>
      {/* Convert the black logo artwork to white and remove
          the white background from the source image. */}
      <svg
        className="omaxas-logo-filter-defs"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <filter
            id="omaxas-black-logo-white"
            colorInterpolationFilters="sRGB"
          >
            <feColorMatrix
              type="matrix"
              values="
                0 0 0 0 1
                0 0 0 0 1
                0 0 0 0 1
                -0.2126 -0.7152 -0.0722 1 0
              "
            />
          </filter>
        </defs>
      </svg>

      <div className="message-empty-state">
        <div className="message-empty-icon" aria-hidden="true">
          <img
            src={omaxasLogo}
            alt=""
            className="message-empty-logo"
          />
        </div>

        <h2>What can I help you with?</h2>

        <p>
          Ask a question, explore an idea, or start a new task.
        </p>

        <div className="empty-state-suggestions">
          {suggestedPrompts.map((item) => (
            <button
              key={item.title}
              type="button"
              className="empty-state-suggestion"
              disabled={
                disabled ||
                typeof onSelectPrompt !== "function"
              }
              onClick={() => onSelectPrompt(item.prompt)}
            >
              <strong>{item.title}</strong>
              <span>{item.prompt}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
