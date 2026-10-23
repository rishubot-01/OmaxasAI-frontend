import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from "react-router-dom";

import { useAuth } from "../features/auth/useAuth";

import LoginPage from "../features/auth/pages/LoginPage";
import RegisterPage from "../features/auth/pages/RegisterPage";

import SearchPage from "../features/Search/pages/SearchPage";
import ImagesPage from "../features/images/pages/ImagesPage";
import ExplorePage from "../features/explore/pages/ExplorePage";
import LibraryPage from "../features/library/pages/LibraryPage";
import ProjectPage from "../features/projects/pages/ProjectPage";

import AppLayout from "../layouts/AppLayout";


function LoadingScreen() {
  return (
    <main className="loading-screen" role="status">
      Loading OmaxasAI...
    </main>
  );
}


// Private pages require authentication.
// Guests return to the public AI homepage instead of
// being forced onto the login form.
function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}


// Public pages are available without login.
// Authenticated users are redirected to their workspace.
function GuestRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to="/chat/new" replace />;
  }

  return <Outlet />;
}


export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}

        <Route element={<GuestRoute />}>
          <Route
            path="/"
            element={<AppLayout guestMode />}
          />

          <Route
            path="/login"
            element={<LoginPage />}
          />

          <Route
            path="/register"
            element={<RegisterPage />}
          />
        </Route>


        {/* Protected routes */}

        <Route element={<ProtectedRoute />}>
          <Route
            path="/chat/new"
            element={<AppLayout />}
          />

          <Route
            path="/search"
            element={<SearchPage />}
          />

          <Route
            path="/images"
            element={<ImagesPage />}
          />

          <Route
            path="/explore"
            element={<ExplorePage />}
          />

          <Route
            path="/library"
            element={<LibraryPage />}
          />

          <Route
            path="/projects"
            element={<ProjectPage />}
          />

          <Route
            path="/settings/*"
            element={<AppLayout />}
          />
        </Route>


        {/* Unknown routes return to the homepage */}

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}