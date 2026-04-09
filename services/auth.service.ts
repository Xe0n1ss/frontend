import api, { setApiToken } from "./api";

const STORAGE_TOKEN_KEY = "yahacks-auth-token";
const STORAGE_USER_KEY = "yahacks-auth-user";

export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  role: string;
  skills: string[];
  timezone: string;
  bio?: string;
  githubUsername?: string;
  telegramId?: number;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  full_name: string;
  email: string;
  password: string;
  role: string;
  skills: string[];
  timezone: string;
  bio?: string;
  github_username?: string;
};

export type UpdateProfilePayload = {
  full_name?: string;
  email?: string;
  password?: string;
  role?: string;
  skills?: string[];
  timezone?: string;
  bio?: string;
  github_username?: string;
};

type AuthResponse = {
  token: string;
  user: unknown;
};

function readString(source: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = source[key];

    if (typeof value === "string" && value.trim() !== "") {
      return value;
    }
  }

  return "";
}

function readNumber(source: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = source[key];

    if (typeof value === "number") {
      return value;
    }
  }

  return undefined;
}

function readStringArray(source: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = source[key];

    if (Array.isArray(value)) {
      return value.filter((item): item is string => typeof item === "string");
    }
  }

  return [];
}

export function normalizeAuthUser(input: unknown): AuthUser {
  const source = typeof input === "object" && input !== null ? (input as Record<string, unknown>) : {};

  return {
    id: readString(source, ["user_id", "id", "ID"]),
    email: readString(source, ["email", "Email"]),
    fullName: readString(source, ["full_name", "fullName", "FullName"]),
    role: readString(source, ["role", "Role"]),
    skills: readStringArray(source, ["skills", "Skills"]),
    timezone: readString(source, ["timezone", "Timezone"]) || "Europe/Moscow",
    bio: readString(source, ["bio", "Bio"]),
    githubUsername: readString(source, ["github_username", "githubUsername", "GitHubUsername"]),
    telegramId: readNumber(source, ["telegram_id", "telegramId", "TelegramID"]),
  };
}

function saveSession(token: string, user: AuthUser) {
  localStorage.setItem(STORAGE_TOKEN_KEY, token);
  localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
  setApiToken(token);
}

export function getStoredToken() {
  return localStorage.getItem(STORAGE_TOKEN_KEY) || "";
}

export function getStoredUser() {
  const raw = localStorage.getItem(STORAGE_USER_KEY);

  if (!raw) {
    return null;
  }

  try {
    return normalizeAuthUser(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function hasSession() {
  return Boolean(getStoredToken());
}

export function restoreSession() {
  const token = getStoredToken();
  setApiToken(token);
  return token;
}

export function clearSession() {
  localStorage.removeItem(STORAGE_TOKEN_KEY);
  localStorage.removeItem(STORAGE_USER_KEY);
  setApiToken("");
}

export function startDemoSession(profile: "nastya" = "nastya") {
  const demoUser: AuthUser =
    profile === "nastya"
      ? {
          id: "demo-nastya",
          email: "nastya@example.com",
          fullName: "Настя — фронтенд",
          role: "frontend",
          skills: ["React", "TypeScript", "UI"],
          timezone: "Europe/Moscow",
          bio: "Demo session user",
          githubUsername: "nastya-ui",
        }
      : {
          id: "demo-user",
          email: "demo@example.com",
          fullName: "Demo User",
          role: "frontend",
          skills: ["React"],
          timezone: "Europe/Moscow",
        };

  saveSession("demo-token", demoUser);
  return demoUser;
}

export async function login(payload: LoginPayload) {
  const response = await api.post<AuthResponse>("/auth/login", payload);
  const user = normalizeAuthUser(response.user);
  saveSession(response.token, user);
  return user;
}

export async function register(payload: RegisterPayload) {
  const createdUser = normalizeAuthUser(await api.post("/users", payload));
  const loggedInUser = await login({
    email: payload.email,
    password: payload.password,
  });

  return loggedInUser.id ? loggedInUser : createdUser;
}

export async function getMe() {
  const user = normalizeAuthUser(await api.get("/auth/me"));
  const token = getStoredToken();

  if (token) {
    saveSession(token, user);
  }

  return user;
}

export async function updateMe(payload: UpdateProfilePayload) {
  const updatedUser = normalizeAuthUser(await api.patch("/auth/me", payload));
  const token = getStoredToken();

  if (token) {
    saveSession(token, updatedUser);
  }

  return updatedUser;
}

restoreSession();
