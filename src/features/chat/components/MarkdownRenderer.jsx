import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import CodeBlock from "./CodeBlock";

export default function MarkdownRenderer({ content = "" }) {
  const markdown =
    typeof content === "string" ? content : String(content ?? "");

  return (
    <div className="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          pre({ children }) {
            // CodeBlock handles the styling for fenced code.
            return <>{children}</>;
          },

          code({ className, children, ...props }) {
            const code = String(children).replace(/\n$/, "");
            const languageMatch = /language-([\w+-]+)/.exec(
              className || "",
            );

            const isInline =
              !className && !String(children).includes("\n");

            if (isInline) {
              return (
                <code className="markdown-inline-code" {...props}>
                  {children}
                </code>
              );
            }

            return (
              <CodeBlock
                code={code}
                language={languageMatch?.[1] || "text"}
              />
            );
          },

          a({ href, children, ...props }) {
            const isExternal =
              typeof href === "string" &&
              /^https?:\/\//i.test(href);

            return (
              <a
                href={href}
                {...props}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
              >
                {children}
              </a>
            );
          },
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}