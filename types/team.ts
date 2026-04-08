export type Role =
  | "Frontend"
  | "Backend"
  | "ML Engineer"
  | "Designer"
  | "Product"
  | "PM"
  | "QA";

export interface TeamMember {
  id: string;
  name: string;
  role: Role;
  avatarUrl?: string;
  skills: string[];
  lookingForRoles?: Role[];
  currentTeamName?: string;
  targetEventSlug?: string;
  city?: string;
  formatPreferences?: ("online" | "offline" | "hybrid")[];
  bio?: string;
  lookingForTeam: boolean;
}

export interface TeamListing {
  id: string;
  name: string;
  accent: "blue" | "purple" | "magenta";
  targetRoles: Role[];
  membersPreview: string[];
  skillsSummary: string[];
  eventName: string;
  participantsCount: number;
  ctaLabel: string;
}
