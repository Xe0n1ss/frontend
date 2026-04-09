import { useEffect, useState } from "react";
import HackathonsPage from "./pages/HackathonsPage";
import { OrganizerWorkspacePage } from "./pages/OrganizerWorkspacePage";
import { AuthPage } from "./pages/AuthPage";
import { LandingPage } from "./pages/LandingPage";
import "./App.css";
import { usePlatformTheme } from "./hooks/usePlatformTheme";
import { hasSession } from "../services/auth.service";

const participantPaths = {
  home: "/participant/home",
  search: "/participant/teams",
  discover: "/participant/knowledge",
  profile: "/participant/profile",
};

function normalizePath(input) {
  if (!input) {
    return "/";
  }

  const raw = String(input).split("?")[0].split("#")[0] || "/";

  if (raw === "/") {
    return "/";
  }

  return raw.replace(/\/+$/, "");
}

function resolveRoute(pathname) {
  const path = normalizePath(pathname);

  if (path === "/") {
    return { page: "landing" };
  }

  if (path === "/organizer") {
    return { page: "organizer" };
  }

  if (path === "/auth") {
    return { page: "auth" };
  }

  if (path === "/participant" || path === "/participant/home" || path === "/home") {
    return { page: "participant", screen: "home" };
  }

  if (path === "/participant/teams" || path === "/search") {
    return { page: "participant", screen: "search" };
  }

  if (path === "/participant/knowledge" || path === "/discover") {
    return { page: "participant", screen: "discover" };
  }

  if (path === "/participant/profile" || path === "/profile") {
    return { page: "participant", screen: "profile" };
  }

  return { page: "landing" };
}

function App() {
  const platformTheme = usePlatformTheme();
  const [route, setRoute] = useState(() =>
    resolveRoute(typeof window === "undefined" ? "/" : window.location.pathname)
  );
  const [isAuthenticated, setIsAuthenticated] = useState(() => hasSession());

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.uiTheme = "dark";
    root.style.setProperty("color-scheme", "dark");
    window.localStorage.setItem("ui-theme", "dark");
  }, []);

  useEffect(() => {
    function handlePopState() {
      setRoute(resolveRoute(window.location.pathname));
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  function navigateTo(path) {
    const target = path || "/";
    const normalizedPath = normalizePath(target);
    const currentPath = normalizePath(window.location.pathname);

    if (currentPath !== normalizedPath || window.location.search !== (target.includes("?") ? `?${target.split("?")[1]}` : "")) {
      window.history.pushState({}, "", target);
    }
    setRoute(resolveRoute(normalizedPath));
  }

  function navigateToAuth(nextPath) {
    const normalizedNext = normalizePath(nextPath);
    const query = normalizedNext ? `?next=${encodeURIComponent(normalizedNext)}` : "";
    navigateTo(`/auth${query}`);
  }

  function resolvePostAuthPath() {
    const params = new URLSearchParams(window.location.search);
    const next = params.get("next");
    const allowedNext = next && next.startsWith("/") ? next : participantPaths.home;
    return normalizePath(allowedNext);
  }

  useEffect(() => {
    if (!isAuthenticated && route.page !== "landing" && route.page !== "auth") {
      navigateToAuth(normalizePath(window.location.pathname));
    }
  }, [isAuthenticated, route.page]);

  if (route.page === "landing") {
    return (
      <LandingPage
        isAuthenticated={isAuthenticated}
        onOpenParticipant={() =>
          isAuthenticated ? navigateTo(participantPaths.home) : navigateToAuth(participantPaths.home)
        }
        onOpenOrganizer={() =>
          isAuthenticated ? navigateTo("/organizer") : navigateToAuth("/organizer")
        }
        onOpenAuth={() => navigateTo("/auth")}
      />
    );
  }

  if (route.page === "auth") {
    return (
      <div className={`app-shell app-shell--${platformTheme}`}>
        <AuthPage
          onAuthSuccess={() => {
            setIsAuthenticated(true);
          }}
          onNavigate={(screen) => {
            if (screen === "onboarding") {
              navigateTo("/participant/profile");
              return;
            }

            if (screen === "profile") {
              navigateTo(resolvePostAuthPath());
              return;
            }

            navigateTo(participantPaths.home);
          }}
        />
      </div>
    );
  }

  if (!isAuthenticated && route.page !== "landing" && route.page !== "auth") {
    return null;
  }

  if (route.page === "organizer") {
    return <OrganizerWorkspacePage platformTheme={platformTheme} />;
  }

  return (
    <HackathonsPage
      platformTheme={platformTheme}
      initialScreen={route.screen || "home"}
      onPrimaryNavigate={(screen) => navigateTo(participantPaths[screen] || participantPaths.home)}
    />
  );
}

export default App;
