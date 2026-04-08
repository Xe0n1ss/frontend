import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import type { ReactNode } from "react";

export type BottomNavKey = "discover" | "search" | "home" | "profile";

type BottomNavProps = {
  activeTab: BottomNavKey;
  onChange: (tab: BottomNavKey) => void;
  domains?: Partial<Record<BottomNavKey, string>>;
};

const items: Array<{
  key: BottomNavKey;
  label: string;
  icon: ReactNode;
}> = [
  { key: "home", label: "Главная", icon: <HomeRoundedIcon fontSize="small" /> },
  { key: "search", label: "Команды", icon: <SearchRoundedIcon fontSize="small" /> },
  { key: "discover", label: "База знаний", icon: <AutoAwesomeRoundedIcon fontSize="small" /> },
  { key: "profile", label: "Профиль", icon: <PersonRoundedIcon fontSize="small" /> },
];

function isExternalTarget(target: string) {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const url = new URL(target, window.location.origin);
    return url.origin !== window.location.origin;
  } catch {
    return false;
  }
}

export function BottomNav({ activeTab, onChange, domains }: BottomNavProps) {
  return (
    <nav className="bottom-nav" aria-label="Основная навигация">
      {items.map((item) => {
        const target = domains?.[item.key];

        return (
          <button
            key={item.key}
            type="button"
            className={`bottom-nav__item ${activeTab === item.key ? "is-active" : ""}`}
            onClick={() => {
              if (target && isExternalTarget(target)) {
                window.location.href = target;
                return;
              }

              onChange(item.key);
            }}
            aria-label={item.label}
            title={item.label}
          >
            {item.icon}
            <span className="bottom-nav__label">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
