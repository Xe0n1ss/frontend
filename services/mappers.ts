import type { Event } from "../types/event";
import type { TeamListing, TeamMember } from "../types/team";
import { mockProfile } from "../data/mockProfile";

export type BackendEvent = {
  id?: string;
  event_id?: string;
  title: string;
  description?: string;
  type: "hackathon" | "workshop" | "meetup" | "webinar";
  status?: string;
  start_time?: string;
  end_time?: string;
  date_start?: string;
  date_end?: string;
  location?: string;
  organizer?: string;
  registration_url?: string;
  tags?: string[];
  participants_count?: number;
};

export type BackendUser = {
  id?: string;
  user_id?: string;
  telegram_id?: number;
  username?: string;
  email?: string;
  full_name: string;
  role: string;
  skills?: string[];
  experience_level?: string;
  timezone?: string;
  bio?: string;
  github_username?: string;
  notification_settings?: Record<string, unknown>;
};

export type BackendAuthMe = BackendUser & {
  location?: string;
  city?: string;
};

export type BackendSeasonReference = {
  id?: string;
  season_id?: string;
  name?: string;
  slug?: string;
  description?: string;
  starts_at?: string;
  ends_at?: string;
  is_active?: boolean;
  title?: string;
  label?: string;
  year?: number;
};

export type BackendUserSeasonStat = {
  id?: string;
  user_id?: string;
  season_id?: string;
  season_name?: string;
  xp?: number;
  level?: number;
  rank?: number;
  events_participated?: number;
  wins_count?: number;
  certificates_count?: number;
  created_at?: string;
  updated_at?: string;
};

export type BackendUserEventResult = {
  id?: string;
  user_id?: string;
  season_id?: string;
  season_name?: string;
  event_name?: string;
  event_type?: string;
  event_date?: string;
  result_type?: string;
  result_title?: string;
  placement?: number;
  certificate_url?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
};

type BackendTeamMember = {
  user_id: string;
  full_name: string;
  role: string;
  joined_at?: string;
};

export type BackendTeam = {
  id?: string;
  team_id?: string;
  name: string;
  event_id?: string;
  project_name?: string;
  description?: string;
  members?: BackendTeamMember[];
  github_repo_url?: string;
  status?: string;
  health_score?: number;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
  last_activity?: string;
};

type BackendArticle = {
  article_id: string;
  title: string;
  content?: string;
  preview?: string;
  category: string;
  tags?: string[];
  views_count?: number;
  likes_count?: number;
  published?: boolean;
};

export type BackendGitHubTeamMetrics = {
  team_id: string;
  repo_url?: string;
  commit_count?: number;
  pull_request_count?: number;
  issue_count?: number;
  closed_issue_count?: number;
  code_review_count?: number;
  last_commit_date?: string;
  contributors?: string[];
  activity_score?: number;
  commits_per_week?: number;
  synced_at?: string;
};

export type FrontendSeasonExperience = {
  id: string;
  seasonId: string;
  season: string;
  xp: number;
  level: number;
  rank: number;
  eventsParticipated: number;
  winsCount: number;
  certificatesCount: number;
};

export type FrontendProfileResult = {
  id: string;
  seasonId: string;
  season: string;
  eventName: string;
  eventType: string;
  eventDate: string;
  resultType: string;
  resultTitle: string;
  placement: number;
  certificateUrl: string;
  notes: string;
};

const roleMap: Record<string, TeamMember["role"]> = {
  backend: "Backend",
  frontend: "Frontend",
  design: "Designer",
  pm: "PM",
  qa: "QA",
  devops: "Backend",
  analyst: "Product",
  other: "Product",
};

function titleCaseRole(role?: string): TeamMember["role"] {
  return roleMap[role ?? "other"] ?? "Product";
}

function detectEventFormat(event: BackendEvent): Event["format"] {
  if (event.type === "webinar") {
    return "online";
  }

  if ((event.location || "").toLowerCase().includes("online")) {
    return "online";
  }

  return "offline";
}

function detectAccent(tags: string[] = [], title = ""): Event["accentVariant"] {
  const normalized = `${tags.join(" ")} ${title}`.toLowerCase();

  if (normalized.includes("ai")) {
    return "purple";
  }

  if (normalized.includes("fin")) {
    return "orange";
  }

  if (normalized.includes("web3") || normalized.includes("blockchain")) {
    return "lime";
  }

  return "neutral";
}

export function mapEvent(event: BackendEvent): Event {
  const id = event.id || event.event_id || crypto.randomUUID();
  const startAt = event.start_time || event.date_start || new Date().toISOString();
  const endAt = event.end_time || event.date_end || startAt;

  return {
    id,
    slug: id,
    title: event.title,
    subtitle: event.description || event.organizer || "Событие YaHacks",
    city: event.location || "Online",
    locationLabel: event.location || "Online",
    format: detectEventFormat(event),
    startAt,
    endAt,
    participantsCount: event.participants_count ?? 0,
    tags: event.tags ?? [],
    accentVariant: detectAccent(event.tags, event.title),
    isFeatured: event.type === "hackathon",
  };
}

export function mapUser(user: BackendUser): TeamMember {
  return {
    id: user.user_id || user.id || crypto.randomUUID(),
    name: user.full_name,
    role: titleCaseRole(user.role),
    skills: user.skills ?? [],
    city: user.timezone === "Europe/Moscow" ? "Москва" : user.timezone,
    bio: user.bio || `Ищет команду как ${titleCaseRole(user.role)}`,
    lookingForTeam: true,
  };
}

function pickAccent(index: number): TeamListing["accent"] {
  const accents: TeamListing["accent"][] = ["blue", "purple", "magenta"];
  return accents[index % accents.length];
}

export function mapTeam(team: BackendTeam, index: number): TeamListing {
  return {
    id: team.team_id || team.id || crypto.randomUUID(),
    name: team.name,
    accent: pickAccent(index),
    targetRoles: (team.members?.length ? [] : ["Frontend"]) as TeamListing["targetRoles"],
    membersPreview: (team.members ?? []).slice(0, 3).map((member) => member.full_name.split(" ")[0]),
    skillsSummary: team.tags?.length ? team.tags : [team.project_name || "Hackathon project"],
    eventName: team.project_name || "YaHacks project",
    participantsCount: team.members?.length ?? 0,
    ctaLabel: team.status === "active" ? "Смотреть" : "Подать заявку",
  };
}

function formatArticleCategory(category: string) {
  const map: Record<string, string> = {
    guide: "Guide",
    case_study: "Case Study",
    tutorial: "Tutorial",
    faq: "FAQ",
    best_practices: "Best Practices",
  };

  return map[category] || category;
}

export function mapArticle(article: BackendArticle) {
  return {
    id: article.article_id,
    title: article.title,
    category: formatArticleCategory(article.category),
    summary: article.preview || article.content?.slice(0, 140) || "Статья базы знаний",
    readTime: `${Math.max(3, Math.ceil((article.content?.length ?? 600) / 900))} мин`,
  };
}

function resolveLocation(user: BackendAuthMe | null) {
  if (!user) {
    return mockProfile.location;
  }

  if (user.location) {
    return user.location;
  }

  if (user.city) {
    return user.city;
  }

  if (user.timezone === "Europe/Moscow") {
    return "Москва";
  }

  return user.timezone || "Не указано";
}

function resolveSeasonName(
  item: BackendUserSeasonStat | BackendUserEventResult,
  seasonMap: Map<string, string>
) {
  const seasonId = item.season_id || "";
  const directName = item.season_name;

  if (directName) {
    return directName;
  }

  if (seasonId && seasonMap.has(seasonId)) {
    return seasonMap.get(seasonId) || mockProfile.seasonExperience[0].season;
  }

  return mockProfile.seasonExperience[0].season;
}

export function mapSeasonReferences(seasons: BackendSeasonReference[]) {
  return new Map(
    seasons.map((season) => [
      season.season_id || season.id || String(season.year || season.name || season.title || season.label),
      season.name || season.title || season.label || (season.year ? `Сезон ${season.year}` : "Сезон"),
    ])
  );
}

export function mapSeasonStat(stat: BackendUserSeasonStat, seasonMap: Map<string, string>): FrontendSeasonExperience {
  const seasonId = stat.season_id || stat.id || crypto.randomUUID();

  return {
    id: stat.id || seasonId,
    seasonId,
    season: resolveSeasonName(stat, seasonMap),
    xp: stat.xp ?? 0,
    level: stat.level ?? 1,
    rank: stat.rank ?? 0,
    eventsParticipated: stat.events_participated ?? 0,
    winsCount: stat.wins_count ?? 0,
    certificatesCount: stat.certificates_count ?? 0,
  };
}

export function mapUserEventResult(result: BackendUserEventResult, seasonMap: Map<string, string>): FrontendProfileResult {
  const seasonId = result.season_id || crypto.randomUUID();

  return {
    id: result.id || crypto.randomUUID(),
    seasonId,
    season: resolveSeasonName(result, seasonMap),
    eventName: result.event_name || "Хакатон",
    eventType: result.event_type || "hackathon",
    eventDate: result.event_date || result.created_at || new Date().toISOString(),
    resultType: result.result_type || "participation",
    resultTitle: result.result_title || "Результат участия",
    placement: result.placement ?? 0,
    certificateUrl: result.certificate_url || "",
    notes: result.notes || "Результат участия сохранён в профиле.",
  };
}

export function mapProfileFromAuth(
  user: BackendAuthMe | null,
  seasonExperience: FrontendSeasonExperience[],
  results: FrontendProfileResult[],
  githubMetrics?: BackendGitHubTeamMetrics | null
) {
  if (!user) {
    return mockProfile;
  }

  const repos = githubMetrics?.repo_url ? 1 : mockProfile.githubStats.repos;
  const stars = githubMetrics?.pull_request_count ?? mockProfile.githubStats.stars;
  const contributions = githubMetrics?.commit_count ?? mockProfile.githubStats.contributions;

  return {
    ...mockProfile,
    fullName: user.full_name,
    role: `${titleCaseRole(user.role)}, ${user.experience_level ?? "member"}`,
    location: resolveLocation(user),
    githubUsername: user.github_username || githubMetrics?.contributors?.[0] || mockProfile.githubUsername,
    githubStats: {
      repos,
      stars,
      contributions,
    },
    githubDetails: {
      repoUrl: githubMetrics?.repo_url || mockProfile.githubDetails.repoUrl,
      activityScore: githubMetrics?.activity_score ?? mockProfile.githubDetails.activityScore,
      lastCommitDate: githubMetrics?.last_commit_date || mockProfile.githubDetails.lastCommitDate,
    },
    streak: githubMetrics?.commits_per_week
      ? `${Math.round(githubMetrics.commits_per_week)} коммитов в неделю`
      : mockProfile.streak,
    seasonExperience: seasonExperience.length ? seasonExperience : mockProfile.seasonExperience,
    results: results.length ? results : mockProfile.results,
  };
}
