import { useMemo, useState } from "react";
import HackathonsPage from "./pages/HackathonsPage";
import { OrganizerWorkspacePage } from "./pages/OrganizerWorkspacePage";
import "./App.css";
import { usePlatformTheme } from "./hooks/usePlatformTheme";
import { getDomainRoutingConfig } from "./config/domainRouting";

function App() {
  const platformTheme = usePlatformTheme();
  const routingConfig = useMemo(() => getDomainRoutingConfig(), []);
  const [siteMode, setSiteMode] = useState(routingConfig.siteMode);

  return (
    <div className="site-mode-layout">
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
