import api from "./api";
import { mockProfile } from "../data/mockProfile";
import type {
  BackendAuthMe,
  BackendGitHubTeamMetrics,
  BackendSeasonReference,
  BackendTeam,
  BackendUserEventResult,
  BackendUserSeasonStat,
} from "./mappers";
import {
  mapProfileFromAuth,
  mapSeasonReferences,
  mapSeasonStat,
  mapUserEventResult,
} from "./mappers";

export type SeasonOption = {
  id: string;
  name: string;
};

export type CreateSeasonExperienceInput = {
  seasonId?: string;
  seasonName: string;
  xp: number;
  level: number;
  rank: number;
  eventsParticipated: number;
  winsCount: number;
  certificatesCount: number;
};

export type CreateProfileResultInput = {
  seasonId?: string;
  seasonName: string;
  eventName: string;
  eventType: string;
  eventDate: string;
  resultType: string;
  resultTitle: string;
  placement: number;
  certificateUrl: string;
  notes: string;
};

type TeamsListResponse = {
  teams: BackendTeam[];
};

type SeasonsListResponse = {
  seasons?: BackendSeasonReference[];
  items?: BackendSeasonReference[];
};

type SeasonExperienceResponse = {
  seasons?: BackendUserSeasonStat[];
  items?: BackendUserSeasonStat[];
  stats?: BackendUserSeasonStat[];
};

type ResultsResponse = {
  results?: BackendUserEventResult[];
  items?: BackendUserEventResult[];
};

async function getCurrentUser() {
  return await api.get<BackendAuthMe>("/auth/me");
}

async function getSeasonReferences() {
  try {
    const response = await api.get<SeasonsListResponse | BackendSeasonReference[]>("/seasons");

    if (Array.isArray(response)) {
      return response;
    }

    return response.seasons ?? response.items ?? [];
  } catch {
    return [];
  }
}

async function createSeason(payload: { name: string; slug: string; description: string; starts_at: string; ends_at: string; is_active: boolean }) {
  return await api.post<BackendSeasonReference>("/seasons", payload);
}

async function getSeasonExperience() {
  try {
    const response = await api.get<SeasonExperienceResponse | BackendUserSeasonStat[]>("/auth/me/seasons");

    if (Array.isArray(response)) {
      return response;
    }

    return response.seasons ?? response.items ?? response.stats ?? [];
  } catch {
    return [];
  }
}

async function getResults() {
  try {
    const response = await api.get<ResultsResponse | BackendUserEventResult[]>("/auth/me/results");

    if (Array.isArray(response)) {
      return response;
    }

    return response.results ?? response.items ?? [];
  } catch {
    return [];
  }
}

async function getGithubTeamMetrics(userId: string) {
  try {
    const teamsResponse = await api.get<TeamsListResponse>(`/users/${userId}/teams`);
    const teamId = teamsResponse.teams?.[0]?.team_id || teamsResponse.teams?.[0]?.id;

    if (!teamId) {
      return null;
    }

    return await api.get<BackendGitHubTeamMetrics>(`/github/teams/${teamId}/metrics`);
  } catch {
    return null;
  }
}

function createSeasonSlug(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9а-яё-]/gi, "")
    .replace(/-+/g, "-");
}

function createSeasonDates(name: string) {
  const yearMatch = name.match(/(20\d{2})/);
  const year = Number(yearMatch?.[1] || new Date().getFullYear());
  const normalized = name.toLowerCase();

  if (normalized.includes("вес")) {
    return { starts_at: `${year}-03-01T00:00:00Z`, ends_at: `${year}-05-31T23:59:59Z` };
  }

  if (normalized.includes("лет")) {
    return { starts_at: `${year}-06-01T00:00:00Z`, ends_at: `${year}-08-31T23:59:59Z` };
  }

  if (normalized.includes("осен")) {
    return { starts_at: `${year}-09-01T00:00:00Z`, ends_at: `${year}-11-30T23:59:59Z` };
  }

  return { starts_at: `${year}-12-01T00:00:00Z`, ends_at: `${year + 1}-02-28T23:59:59Z` };
}

export async function getProfile() {
  try {
    const user = await getCurrentUser();
    const [seasonReferences, seasonExperience, results, githubMetrics] = await Promise.all([
      getSeasonReferences(),
      getSeasonExperience(),
      getResults(),
      getGithubTeamMetrics(user.user_id || user.id || ""),
    ]);

    const seasonMap = mapSeasonReferences(seasonReferences);

    return mapProfileFromAuth(
      user,
      seasonExperience.map((item) => mapSeasonStat(item, seasonMap)),
      results.map((item) => mapUserEventResult(item, seasonMap)),
      githubMetrics
    );
  } catch {
    return mockProfile;
  }
}

export async function getSeasonOptions() {
  try {
    const seasons = await getSeasonReferences();

    if (seasons.length === 0) {
      return mockProfile.seasonExperience.map((season) => ({
        id: season.seasonId,
        name: season.season,
      })) satisfies SeasonOption[];
    }

    return seasons.map((season) => ({
      id: season.season_id || season.id || season.slug || season.name || crypto.randomUUID(),
      name: season.name || season.title || season.label || season.slug || `Сезон ${season.year || ""}`.trim(),
    })) satisfies SeasonOption[];
  } catch {
    return mockProfile.seasonExperience.map((season) => ({
      id: season.seasonId,
      name: season.season,
    })) satisfies SeasonOption[];
  }
}

async function ensureSeason(input: { seasonId?: string; seasonName: string }) {
  if (input.seasonId) {
    return {
      seasonId: input.seasonId,
      seasonName: input.seasonName,
    };
  }

  const existingSeasons = await getSeasonOptions();
  const matchedSeason = existingSeasons.find((season) => season.name.toLowerCase() === input.seasonName.trim().toLowerCase());

  if (matchedSeason) {
    return {
      seasonId: matchedSeason.id,
      seasonName: matchedSeason.name,
    };
  }

  try {
    const seasonDates = createSeasonDates(input.seasonName.trim());
    const createdSeason = await createSeason({
      name: input.seasonName.trim(),
      slug: createSeasonSlug(input.seasonName),
      description: `Сезон ${input.seasonName.trim()} для статистики и результатов участников`,
      starts_at: seasonDates.starts_at,
      ends_at: seasonDates.ends_at,
      is_active: true,
    });

    return {
      seasonId: createdSeason.season_id || createdSeason.id || createdSeason.slug || input.seasonName.trim(),
      seasonName: createdSeason.name || createdSeason.title || createdSeason.label || input.seasonName.trim(),
    };
  } catch {
    return {
      seasonId: input.seasonName.trim(),
      seasonName: input.seasonName.trim(),
    };
  }
}

export async function createSeasonStat(input: CreateSeasonExperienceInput) {
  const resolvedSeason = await ensureSeason({ seasonId: input.seasonId, seasonName: input.seasonName });

  try {
    const created = await api.post<BackendUserSeasonStat | Record<string, never>>("/auth/me/season-stats", {
      season_id: resolvedSeason.seasonId,
      xp: input.xp,
      level: input.level,
      rank: input.rank,
      events_participated: input.eventsParticipated,
      wins_count: input.winsCount,
      certificates_count: input.certificatesCount,
    });

    const seasonMap = new Map([[resolvedSeason.seasonId, resolvedSeason.seasonName]]);
    return mapSeasonStat(
      {
        season_id: resolvedSeason.seasonId,
        season_name: resolvedSeason.seasonName,
        xp: input.xp,
        level: input.level,
        rank: input.rank,
        events_participated: input.eventsParticipated,
        wins_count: input.winsCount,
        certificates_count: input.certificatesCount,
        ...(created as BackendUserSeasonStat),
      },
      seasonMap
    );
  } catch {
    return {
      id: crypto.randomUUID(),
      seasonId: resolvedSeason.seasonId,
      season: resolvedSeason.seasonName,
      xp: input.xp,
      level: input.level,
      rank: input.rank,
      eventsParticipated: input.eventsParticipated,
      winsCount: input.winsCount,
      certificatesCount: input.certificatesCount,
    };
  }
}

export async function createProfileResult(input: CreateProfileResultInput) {
  const resolvedSeason = await ensureSeason({ seasonId: input.seasonId, seasonName: input.seasonName });

  try {
    const created = await api.post<BackendUserEventResult | Record<string, never>>("/auth/me/results", {
      season_id: resolvedSeason.seasonId,
      event_name: input.eventName,
      event_type: input.eventType,
      event_date: input.eventDate,
      result_type: input.resultType,
      result_title: input.resultTitle,
      placement: input.placement,
      certificate_url: input.certificateUrl,
      notes: input.notes,
    });

    const seasonMap = new Map([[resolvedSeason.seasonId, resolvedSeason.seasonName]]);
    return mapUserEventResult(
      {
        season_id: resolvedSeason.seasonId,
        season_name: resolvedSeason.seasonName,
        event_name: input.eventName,
        event_type: input.eventType,
        event_date: input.eventDate,
        result_type: input.resultType,
        result_title: input.resultTitle,
        placement: input.placement,
        certificate_url: input.certificateUrl,
        notes: input.notes,
        ...(created as BackendUserEventResult),
      },
      seasonMap
    );
  } catch {
    return {
      id: crypto.randomUUID(),
      seasonId: resolvedSeason.seasonId,
      season: resolvedSeason.seasonName,
      eventName: input.eventName,
      eventType: input.eventType,
      eventDate: input.eventDate,
      resultType: input.resultType,
      resultTitle: input.resultTitle,
      placement: input.placement,
      certificateUrl: input.certificateUrl,
      notes: input.notes,
    };
  }
}
