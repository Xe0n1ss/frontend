import { useEffect, useMemo } from "react";

function detectPlatform() {
  if (typeof window === "undefined") {
    return "default";
  }

  const userAgent = window.navigator.userAgent.toLowerCase();
  const platform = (window.navigator.userAgentData?.platform || window.navigator.platform || "").toLowerCase();

  if (/iphone|ipad|ipod/.test(userAgent) || /iphone|ipad|ipod/.test(platform)) {
    return "ios";
  }

  if (/android/.test(userAgent)) {
    return "android";
  }

  if (/mac/.test(platform) || /mac os/.test(userAgent)) {
    return "macos";
  }

  if (/win/.test(platform) || /windows/.test(userAgent)) {
    return "windows";
  }

  return "default";
}

export function usePlatformTheme() {
  const platformTheme = useMemo(() => detectPlatform(), []);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.platform = platformTheme;

    return () => {
      delete root.dataset.platform;
    };
  }, [platformTheme]);

  return platformTheme;
}
