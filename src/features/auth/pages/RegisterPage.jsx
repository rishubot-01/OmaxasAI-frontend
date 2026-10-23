import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../useAuth";
import omaxasLogo from "../../../assets/Analysis output 1.png";
import "../../../App.css";

const GOOGLE_CLIENT_ID = (
  import.meta.env.VITE_GOOGLE_CLIENT_ID || ""
).trim();

export default function RegisterPage() {
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const googleButtonRef = useRef(null);
  const googleBusyRef = useRef(false);
  const googleCredentialHandlerRef = useRef(null);

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googleNotice, setGoogleNotice] = useState("");

  // Normal email/password registration.
  async function handleSubmit(event) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setError("");

    if (password !== passwordConfirm) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);

    try {
      await register({
        email: email.trim(),
        display_name: displayName.trim(),
        password,
        password_confirm: passwordConfirm,
      });

      navigate("/chat/new", { replace: true });
    } catch (err) {
      setError(
        err?.message ||
          "Sign up failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  // Handle the credential returned by Google Identity Services.
  const handleGoogleCredential = useCallback(
    async (credential) => {
      if (googleBusyRef.current) {
        return;
      }

      if (!credential) {
        setError(
          "Google credential nahi mila. Please try again."
        );
        return;
      }

      googleBusyRef.current = true;
      setError("");
      setGoogleNotice("");
      setSubmitting(true);

      try {
        await loginWithGoogle(credential);

        navigate("/chat/new", { replace: true });
      } catch (err) {
        setError(
          err?.message ||
            "Google sign up failed. Please try again."
        );
      } finally {
        googleBusyRef.current = false;
        setSubmitting(false);
      }
    },
    [loginWithGoogle, navigate]
  );

  // Keep the latest handler available to Google's callback.
  googleCredentialHandlerRef.current =
    handleGoogleCredential;

  // Load Google Identity Services and render its official button.
  useEffect(() => {
    let cancelled = false;
    let script = null;

    if (!GOOGLE_CLIENT_ID) {
      setGoogleNotice(
        "Google sign in is not configured. Check VITE_GOOGLE_CLIENT_ID in the frontend .env file."
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

      googleIdentity.initialize({
        client_id: GOOGLE_CLIENT_ID,

        callback: (response) => {
          const credential = response?.credential;

          googleCredentialHandlerRef.current?.(
            credential
          );
        },
      });

      // Avoid rendering duplicate buttons.
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

    function handleScriptError() {
      if (!cancelled) {
        setGoogleNotice(
          "Google sign up could not load. Check your internet connection and try again."
        );
      }
    }

    if (window.google?.accounts?.id) {
      renderGoogleButton();
    } else {
      script = document.querySelector(
        'script[src="https://accounts.google.com/gsi/client"]'
      );

      if (!script) {
        script = document.createElement("script");
        script.src =
          "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
      }

      script.addEventListener("load", renderGoogleButton);
      script.addEventListener("error", handleScriptError);

      if (!script.isConnected) {
        document.head.appendChild(script);
      }
    }

    return () => {
      cancelled = true;

      if (script) {
        script.removeEventListener(
          "load",
          renderGoogleButton
        );

        script.removeEventListener(
          "error",
          handleScriptError
        );
      }
    };
  }, []);

  return (
    <main className="auth-page">
      <section className="auth-card">
        {/* Animated OMAXAS AI logo and centered heading */}
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

          <h1>Sign up for OmaxasAI</h1>

          <p className="auth-subtitle">
            Create your account and get started with OmaxasAI.
          </p>
        </div>

        {/* Google sign-up option */}
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

        {/* Existing email/password registration */}
        <form
          onSubmit={handleSubmit}
          className="auth-form"
        >
          <label htmlFor="display-name">
            Display name
          </label>

          <input
            id="display-name"
            name="display_name"
            type="text"
            autoComplete="name"
            placeholder="Your name"
            value={displayName}
            onChange={(event) => {
              setDisplayName(event.target.value);
              setError("");
            }}
            required
            disabled={submitting}
          />

          <label htmlFor="register-email">
            Email address
          </label>

          <input
            id="register-email"
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

          <label htmlFor="register-password">
            Password
          </label>

          <input
            id="register-password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            placeholder="At least 8 characters"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setError("");
            }}
            required
            disabled={submitting}
          />

          <label htmlFor="password-confirm">
            Confirm password
          </label>

          <input
            id="password-confirm"
            name="password_confirm"
            type="password"
            autoComplete="new-password"
            minLength={8}
            placeholder="Enter password again"
            value={passwordConfirm}
            onChange={(event) => {
              setPasswordConfirm(event.target.value);
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
            {submitting
              ? "Signing up..."
              : "Sign up"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{" "}
          <Link to="/login">
            Log in
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