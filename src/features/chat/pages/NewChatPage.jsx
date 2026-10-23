import { useAuth } from "../../auth/useAuth";
import "../../chat-placeholder.css";

export default function NewChatPage() {
  const { user, logout } = useAuth();

  return (
    <main className="chat-home">
      <header className="chat-home-header">
        <div className="chat-home-brand">
          <span className="brand-mark small">O</span>
          <span>OMAXAS AI</span>
        </div>

        <button
          type="button"
          className="logout-button"
          onClick={logout}
        >
          Log out
        </button>
      </header>

      <section className="chat-home-content">
        <p className="chat-eyebrow">YOUR AI WORKSPACE</p>

        <h1>
          Hello, {user?.display_name || "there"}.
        </h1>

        <p>
          Your account is connected. Next, we will connect the
          assistant, conversation history and model selector.
        </p>

        <div className="chat-placeholder">
          <span>+</span>
          <p>AI chat composer will appear here.</p>
        </div>
      </section>
    </main>
  );
}