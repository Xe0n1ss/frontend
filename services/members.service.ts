import api from "./api";
import { mockMembers, mockTeams } from "../data/mockMembers";
import type { TeamListing, TeamMember } from "../types/team";
import { mapTeam, mapUser } from "./mappers";
import { shuffleArray } from "../utils/shuffleArray";

type UsersListResponse = {
  users: Array<{
    user_id: string;
    telegram_id?: number;
    full_name: string;
    role: string;
    skills?: string[];
    experience_level?: string;
    timezone?: string;
    bio?: string;
    github_username?: string;
  }>;
};

type TeamsListResponse = {
  teams: Array<{
    team_id: string;
    name: string;
    project_name?: string;
    description?: string;
    members?: Array<{
      user_id: string;
      full_name: string;
      role: string;
      joined_at?: string;
    }>;
    github_repo_url?: string;
    status?: string;
    health_score?: number;
    tags?: string[];
    created_at?: string;
    last_activity?: string;
  }>;
};

export async function getMembers() {
  try {
    const response = await api.get<UsersListResponse>("/users?limit=20");
    return shuffleArray(response.users.map(mapUser)) satisfies TeamMember[];
  } catch {
    return shuffleArray(mockMembers);
  }
}

export async function getTeams() {
  try {
    const response = await api.get<TeamsListResponse>("/teams?limit=20");
    return shuffleArray(response.teams.map(mapTeam)) satisfies TeamListing[];
  } catch {
    return shuffleArray(mockTeams);
  }
}
