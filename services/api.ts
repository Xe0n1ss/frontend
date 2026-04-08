import axios from "axios";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/v1",
  timeout: 5000,
});

function getAuthToken() {
  if (typeof window === "undefined") {
    return import.meta.env.VITE_AUTH_TOKEN || "";
  }

  return (
    window.localStorage.getItem("yahacks_access_token") ||
    window.localStorage.getItem("access_token") ||
    window.localStorage.getItem("token") ||
    import.meta.env.VITE_AUTH_TOKEN ||
    ""
  );
}

function buildConfig() {
  const token = getAuthToken();

  if (!token) {
    return undefined;
  }

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}

const api = {
  async get<T>(path: string): Promise<T> {
    const response = await client.get<T>(path, buildConfig());
    return response.data;
  },
  async post<T>(path: string, body?: unknown): Promise<T> {
    const response = await client.post<T>(path, body, buildConfig());
    return response.data;
  },
  async patch<T>(path: string, body?: unknown): Promise<T> {
    const response = await client.patch<T>(path, body, buildConfig());
    return response.data;
  },
};

export default api;
