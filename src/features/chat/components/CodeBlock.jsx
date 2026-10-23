import { useState } from "react";

export default function CodeBlock({ code = "", language = "text" }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(String(code));
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className="code-block">
      <header className="code-block-header">
        <span className="code-block-language">
          {language || "text"}
        </span>

        <button
          type="button"
          className="code-block-copy"
          onClick={handleCopy}
          aria-label="Copy code"
        >
          {copied ? "Copied ✓" : "Copy code"}
        </button>
      </header>

      <pre className="code-block-content">
        <code className={`language-${language || "text"}`}>
          {String(code)}
        </code>
      </pre>
    </section>
  );
}