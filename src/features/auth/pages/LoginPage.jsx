
import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../useAuth";
import omaxasLogo from "../../../assets/Analysis output 1.png";
import "../../../App.css";

// Set this in the frontend .env file.
const GOOGLE_CLIENT_ID = (
  import.meta.env.VITE_GOOGLE_CLIENT_ID || ""
).trim();

// Keep Google's initialization page-wide.
let initializedGoogleClientId = null;
let activeGoogleCredentialHandler = null;

export default function LoginPage() {
  const { login, loginWithGoogle } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const googleButtonRef = useRef(null);
  const googleFlowRef = useRef(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googleNotice, setGoogleNotice] = useState("");

  const destination = location.state?.from || "/chat/new";

  // Normal email/password login.
  async function handleSubmit(event) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      await login({
        email: email.trim(),
        password,
      });

      navigate(destination, { replace: true });
    } catch (err) {
      setError(
        err?.message ||
          "Login failed. Please check your credentials and try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  // Keep the latest callback available to Google.
  googleFlowRef.current = async (credential) => {
    if (submitting) {
      return;
    }

    if (!credential) {
      setError("Google credential nahi mila. Please try again.");
      return;
    }

    setError("");
    setGoogleNotice("");
    setSubmitting(true);

    try {
      await loginWithGoogle(credential);

      navigate(destination, { replace: true });
    } catch (err) {
      setError(
        err?.message ||
          "Google sign in failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Load Google Identity Services and render a responsive button.
  useEffect(() => {
    let cancelled = false;
    let resizeObserver;
    let resizeFrame = null;
    let script = null;
    let resizeHandler;

    const credentialHandler = (credential) => {
      googleFlowRef.current?.(credential);
    };

    if (!GOOGLE_CLIENT_ID) {
      setGoogleNotice(
        "Google sign in is not configured. Add VITE_GOOGLE_CLIENT_ID to the frontend .env file."
      );

      return undefined;
    }

    function renderGoogleButton() {
      if (
        cancelled ||
        !googleButtonRef.current ||
        !window.google?.accounts?.id
      ) {
        return;
      }

      const googleIdentity = window.google.accounts.id;
      const container = googleButtonRef.current;

      // Initialize Google only once per Client ID.
      if (initializedGoogleClientId !== GOOGLE_CLIENT_ID) {
        googleIdentity.initialize({
          client_id: GOOGLE_CLIENT_ID,

          callback: (response) => {
            if (!response?.credential) {
              setError(
                "Google did not return a credential. Please try again."
              );
              return;
            }

            activeGoogleCredentialHandler?.(
              response.credential
            );
          },
        });

        initializedGoogleClientId = GOOGLE_CLIENT_ID;
      }

      activeGoogleCredentialHandler = credentialHandler;

      // Use the actual available container width.
      const availableWidth = Math.floor(
        container.getBoundingClientRect().width
      );

      if (availableWidth <= 0) {
        return;
      }

      // Google Identity Services supports button widths
      // from 200px to 400px.
      const buttonWidth = Math.min(
        400,
        Math.max(200, availableWidth)
      );

      // Avoid duplicate buttons on resize or remount.
      container.replaceChildren();

      googleIdentity.renderButton(container, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "rectangular",
        logo_alignment: "left",
        width: buttonWidth,
      });

      setGoogleNotice("");
    }

    function scheduleButtonRender() {
      if (cancelled) {
        return;
      }

      if (resizeFrame !== null) {
        window.cancelAnimationFrame(resizeFrame);
      }

      resizeFrame = window.requestAnimationFrame(() => {
        resizeFrame = null;
        renderGoogleButton();
      });
    }

    function handleGoogleScriptError() {
      if (!cancelled) {
        setGoogleNotice(
          "Google sign in could not load. Check your internet connection and try again."
        );
      }
    }

    function setupResponsiveButton() {
      if (cancelled || !googleButtonRef.current) {
        return;
      }

      // Observe the available width on mobile and desktop.
      if ("ResizeObserver" in window) {
        resizeObserver = new ResizeObserver(() => {
          scheduleButtonRender();
        });

        resizeObserver.observe(googleButtonRef.current);
      } else {
        resizeHandler = scheduleButtonRender;
        window.addEventListener("resize", resizeHandler);
      }

      renderGoogleButton();
    }

    if (window.google?.accounts?.id) {
      setupResponsiveButton();
    } else {
      script = document.querySelector(
        'script[src="https://accounts.google.com/gsi/client"]'
      );

      if (!script) {
        script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
      }

      script.addEventListener(
        "load",
        setupResponsiveButton
      );

      script.addEventListener(
        "error",
        handleGoogleScriptError
      );

      if (!script.isConnected) {
        document.head.appendChild(script);
      }
    }

    return () => {
      cancelled = true;

      if (resizeObserver) {
        resizeObserver.disconnect();
      }

      if (resizeHandler) {
        window.removeEventListener("resize", resizeHandler);
      }

      if (resizeFrame !== null) {
        window.cancelAnimationFrame(resizeFrame);
      }

      if (script) {
        script.removeEventListener(
          "load",
          setupResponsiveButton
        );

        script.removeEventListener(
          "error",
          handleGoogleScriptError
        );
      }

      if (
        activeGoogleCredentialHandler === credentialHandler
      ) {
        activeGoogleCredentialHandler = null;
      }
    };
  }, []);

  return (
    <main className="auth-page">
      <section className="auth-card">
        {/* Centered OMAXAS AI logo */}
        <div className="auth-brand-header">
          <Link
            to="/"
            className="auth-brand-logo"
            aria-label="OmaxasAI homepage"
          >
            <img
              src={omaxasLogo}
              alt="OmaxasAI logo"
              className="auth-brand-logo__image"
            />
          </Link>

          <h1>Welcome back</h1>

          <p className="auth-subtitle">
            Sign in to your OmaxasAI account.
          </p>
        </div>

        {/* Responsive Google sign-in section */}
        <div className="auth-google-section">
          {GOOGLE_CLIENT_ID ? (
            <div
              ref={googleButtonRef}
              className="auth-google-button"
              aria-label="Continue with Google"
            />
          ) : (
            <p
              className="auth-google-notice"
              role="status"
            >
              {googleNotice}
            </p>
          )}

          {GOOGLE_CLIENT_ID && googleNotice && (
            <p
              className="auth-google-notice"
              role="status"
            >
              {googleNotice}
            </p>
          )}

          {/* Centered OR divider */}
          <div className="auth-google-divider">
            <span className="auth-google-divider__line" />

            <span className="auth-google-divider__label">
              OR
            </span>

            <span className="auth-google-divider__line" />
          </div>
        </div>

        {/* Email/password login */}
        <form
          onSubmit={handleSubmit}
          className="auth-form"
        >
          <label htmlFor="email">
            Email address
          </label>

          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setError("");
            }}
            required
            disabled={submitting}
          />

          <label htmlFor="password">
            Password
          </label>

          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setError("");
            }}
            required
            disabled={submitting}
          />

          {error && (
            <p
              className="auth-error"
              role="alert"
            >
              {error}
            </p>
          )}

          <button
            className="auth-submit"
            type="submit"
            disabled={submitting}
          >
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account?{" "}
          <Link to="/register">
            Sign up for free
          </Link>
        </p>

        <p className="auth-footer">
          Want to try OmaxasAI first?{" "}
          <Link to="/">
            Continue as guest
          </Link>
        </p>
      </section>
    </main>
  );
}