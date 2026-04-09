import { useEffect, useMemo, useState } from "react";

const THEME_KEY = "ui-theme";

function resolveInitialTheme() {
  if (typeof window === "undefined") {
    return "dark";
  }

  const saved = window.localStorage.getItem(THEME_KEY);
  if (saved === "light" || saved === "dark") {
    return saved;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function useUiTheme() {
  const [uiTheme, setUiTheme] = useState(resolveInitialTheme);
  const isDarkTheme = useMemo(() => uiTheme === "dark", [uiTheme]);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.uiTheme = uiTheme;
    root.style.setProperty("color-scheme", uiTheme);
    window.localStorage.setItem(THEME_KEY, uiTheme);
  }, [uiTheme]);

  return { uiTheme, isDarkTheme, setUiTheme };
}
