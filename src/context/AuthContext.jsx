import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getCurrentUser,
  loginUser,
  registerUser,
  googleLoginUser,
  logoutUser,
} from "../features/auth/authService";

import { getAccessToken } from "../utils/storage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore the existing session when the application loads.
  useEffect(() => {
    let active = true;

    async function restoreSession() {
      try {
        if (!getAccessToken()) {
          return;
        }

        const profile = await getCurrentUser();

        if (active) {
          setUser(profile);
        }
      } catch {
        // Clear invalid or expired authentication sessions.
        logoutUser();

        if (active) {
          setUser(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    restoreSession();

    return () => {
      active = false;
    };
  }, []);

  // Authenticate using the existing email/password endpoint.
  const login = useCallback(async (credentials) => {
    await loginUser(credentials);

    try {
      const profile = await getCurrentUser();

      setUser(profile);

      return profile;
    } catch (error) {
      logoutUser();
      setUser(null);

      throw error;
    }
  }, []);

  // Authenticate using a Google ID-token credential.
  // googleLoginUser must verify through the backend and save
  // the returned OMAXAS AI access and refresh tokens.
  const loginWithGoogle = useCallback(async (credential) => {
    if (
      typeof credential !== "string" ||
      !credential.trim()
    ) {
      throw new Error(
        "Google credential nahi mila. Please try again."
      );
    }

    await googleLoginUser(credential.trim());

    try {
      // Load the authenticated OMAXAS AI profile after
      // the backend has issued and saved the JWT tokens.
      const profile = await getCurrentUser();

      setUser(profile);

      return profile;
    } catch (error) {
      // Do not retain tokens if profile retrieval fails.
      logoutUser();
      setUser(null);

      throw error;
    }
  }, []);

  // Create an account and reuse the normal login flow.
  const register = useCallback(
    async (details) => {
      await registerUser(details);

      return login({
        email: details.email,
        password: details.password,
      });
    },
    [login],
  );

  // Reload the current user's profile from Django.
  const refreshUser = useCallback(async () => {
    const profile = await getCurrentUser();

    setUser(profile);

    return profile;
  }, []);

  // Clear the local authentication session.
  const logout = useCallback(() => {
    logoutUser();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),

      // Existing authentication methods.
      login,
      register,
      logout,
      refreshUser,

      // Google authentication method for login/signup pages.
      loginWithGoogle,
    }),
    [
      user,
      loading,
      login,
      loginWithGoogle,
      register,
      logout,
      refreshUser,
    ],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Access authentication state and actions inside React components.
export function useAuthContext() {
  const context = useContext(AuthContext);

  if (context === null) {
    throw new Error(
      "useAuthContext must be used inside AuthProvider.",
    );
  }

  return context;
}

export default AuthContext;