import { useMemo, useState } from "react";
import HackathonsPage from "./pages/HackathonsPage";
import { OrganizerWorkspacePage } from "./pages/OrganizerWorkspacePage";
import "./App.css";
import { usePlatformTheme } from "./hooks/usePlatformTheme";
import { useUiTheme } from "./hooks/useUiTheme";
import { getDomainRoutingConfig } from "./config/domainRouting";

function App() {
  const platformTheme = usePlatformTheme();
  const { isDarkTheme, setUiTheme } = useUiTheme();
  const routingConfig = useMemo(() => getDomainRoutingConfig(), []);
  const [siteMode, setSiteMode] = useState(routingConfig.siteMode);

  return (
    <div className="site-mode-layout">
      <div className="toolbar">
        <div className="role-switcher">
          <button
            type="button"
            className={`role-switcher__item ${siteMode === "participant" ? "is-active" : ""}`}
            onClick={() => setSiteMode("participant")}
          >
            Версия для участника
          </button>
          <button
            type="button"
            className={`role-switcher__item ${siteMode === "organizer" ? "is-active" : ""}`}
            onClick={() => setSiteMode("organizer")}
          >
            Версия для организатора
          </button>
        </div>

        <label className="theme-switch" aria-label="Переключить тему">
          <input
            type="checkbox"
            checked={isDarkTheme}
            onChange={() => setUiTheme(isDarkTheme ? "light" : "dark")}
            aria-label="Тёмная тема"
          />
          <span className="theme-switch__track" />
          <span className="theme-switch__label">{isDarkTheme ? "Dark" : "Light"}</span>
        </label>
      </div>

      {siteMode === "participant" ? (
        <HackathonsPage
          platformTheme={platformTheme}
          initialScreen={routingConfig.initialScreen}
          domains={routingConfig.domains}
        />
      ) : (
        <OrganizerWorkspacePage platformTheme={platformTheme} />
      )}
    </div>
  );
}

export default App;
