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

        <button
          type="button"
          className="theme-toggle"
          onClick={() => setUiTheme(isDarkTheme ? "light" : "dark")}
          aria-label="Переключить тему"
        >
          {isDarkTheme ? "Тема: Dark" : "Тема: Light"}
        </button>
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
