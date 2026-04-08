export type ParticipantScreen = "home" | "search" | "discover" | "profile";
export type SiteMode = "participant" | "organizer";

export type DomainRoutingConfig = {
  siteMode: SiteMode;
  initialScreen: ParticipantScreen;
  domains: Record<ParticipantScreen | "organizer", string>;
};

function trimDomain(value?: string) {
  return (value || "").trim().replace(/\/+$/, "");
}

function hostFromDomain(domain: string) {
  if (!domain) {
    return "";
  }

  try {
    return new URL(domain).host.toLowerCase();
  } catch {
    return domain
      .replace(/^https?:\/\//i, "")
      .replace(/\/.*$/, "")
      .toLowerCase();
  }
}

function normalizeCurrentHost() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.location.host.toLowerCase();
}

function getCurrentOrigin() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.location.origin;
}

export function getDomainRoutingConfig(): DomainRoutingConfig {
  const currentOrigin = getCurrentOrigin();
  const domains = {
    home: trimDomain(import.meta.env.VITE_HOME_DOMAIN) || currentOrigin,
    search: trimDomain(import.meta.env.VITE_TEAMS_DOMAIN) || currentOrigin,
    discover: trimDomain(import.meta.env.VITE_KNOWLEDGE_DOMAIN) || currentOrigin,
    profile: trimDomain(import.meta.env.VITE_PROFILE_DOMAIN) || currentOrigin,
    organizer: trimDomain(import.meta.env.VITE_ORGANIZER_DOMAIN) || currentOrigin,
  };

  const currentHost = normalizeCurrentHost();
  const homeHost = hostFromDomain(domains.home);
  const searchHost = hostFromDomain(domains.search);
  const discoverHost = hostFromDomain(domains.discover);
  const profileHost = hostFromDomain(domains.profile);
  const organizerHost = hostFromDomain(domains.organizer);

  if (currentHost && organizerHost && currentHost === organizerHost) {
    return {
      siteMode: "organizer",
      initialScreen: "home",
      domains,
    };
  }

  let initialScreen: ParticipantScreen = "home";

  if (currentHost && searchHost && currentHost === searchHost) {
    initialScreen = "search";
  } else if (currentHost && discoverHost && currentHost === discoverHost) {
    initialScreen = "discover";
  } else if (currentHost && profileHost && currentHost === profileHost) {
    initialScreen = "profile";
  } else if (currentHost && homeHost && currentHost === homeHost) {
    initialScreen = "home";
  }

  return {
    siteMode: "participant",
    initialScreen,
    domains,
  };
}
