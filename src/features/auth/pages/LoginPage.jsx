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

// Keep Google's initialization page-wide and avoid initializing
// the same client repeatedly when navigating between auth pages.
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

  // Keep the latest React callbacks available to Google's
  // asynchronous credential callback.
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

  // Load Google Identity Services and render Google's official button.
  useEffect(() => {
    let cancelled = false;

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

      // Initialize only when this page's Client ID has not
      // already been initialized in this frontend session.
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

      // Prevent duplicate buttons if the component is remounted.
      googleButtonRef.current.replaceChildren();

      googleIdentity.renderButton(
        googleButtonRef.current,
        {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "rectangular",
          logo_alignment: "left",
          width: 320,
        }
      );

      setGoogleNotice("");
    }

    function handleGoogleScriptError() {
      if (!cancelled) {
        setGoogleNotice(
          "Google sign in could not load. Check your internet connection and try again."
        );
      }
    }

    if (window.google?.accounts?.id) {
      renderGoogleButton();
    } else {
      let script = document.querySelector(
        'script[src="https://accounts.google.com/gsi/client"]'
      );

      const handleGoogleScriptLoad = () => {
        renderGoogleButton();
      };

      if (!script) {
        script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
      }

      script.addEventListener(
        "load",
        handleGoogleScriptLoad
      );

      script.addEventListener(
        "error",
        handleGoogleScriptError
      );

      if (!script.isConnected) {
        document.head.appendChild(script);
      }

      return () => {
        cancelled = true;

        script.removeEventListener(
          "load",
          handleGoogleScriptLoad
        );

        script.removeEventListener(
          "error",
          handleGoogleScriptError
        );

        if (
          activeGoogleCredentialHandler === credentialHandler
        ) {
          activeGoogleCredentialHandler = null;
        }
      };
    }

    return () => {
      cancelled = true;

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
        {/* Centered, animated OMAXAS AI logo */}
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

        {/* Google sign-in section */}
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

          <div className="auth-google-divider">
            <span />
            <span className="auth-google-divider__label">
              OR
            </span>
            <span />
          </div>
        </div>

        {/* Existing email/password login */}
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