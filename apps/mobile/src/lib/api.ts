import type { AuthSession, FeedPage, LeaderboardResponse, SessionUser } from "@kite/shared-types";
import { API_URL } from "./config";
import { clearTokens, getAccessToken, getRefreshToken, saveTokens } from "./session-store";

type RequestOptions = {
  method?: string;
  body?: unknown;
  auth?: boolean;
};

async function rawRequest<T>(path: string, options: RequestOptions, token?: string | null): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (options.auth !== false && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/v1${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(errorBody.message ?? `Request failed (${response.status})`);
  }

  return (await response.json()) as T;
}

let refreshInFlight: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (refreshInFlight) {
    return refreshInFlight;
  }
  refreshInFlight = (async () => {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) {
      return null;
    }
    try {
      const session = await rawRequest<AuthSession>(
        "/auth/refresh",
        { method: "POST", body: { refreshToken }, auth: false },
      );
      await saveTokens(session.accessToken, session.refreshToken);
      return session.accessToken;
    } catch {
      await clearTokens();
      return null;
    }
  })();
  try {
    return await refreshInFlight;
  } finally {
    refreshInFlight = null;
  }
}

export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = options.auth === false ? null : await getAccessToken();
  try {
    return await rawRequest<T>(path, options, token);
  } catch (error) {
    if (options.auth === false) {
      throw error;
    }
    const next = await refreshAccessToken();
    if (!next) {
      throw error;
    }
    return rawRequest<T>(path, options, next);
  }
}

export const kiteApi = {
  requestOtp: (email: string) =>
    api<{ ok: true; expiresInSeconds: number; devCode?: string }>("/auth/otp/request", {
      method: "POST",
      body: { email },
      auth: false,
    }),
  verifyOtp: (email: string, code: string) =>
    api<AuthSession>("/auth/otp/verify", { method: "POST", body: { email, code }, auth: false }),
  me: () => api<SessionUser>("/users/me"),
  updateProfile: (input: { handle?: string; displayName?: string; bio?: string }) =>
    api<SessionUser>("/users/me", { method: "PATCH", body: input }),
  feed: () => api<FeedPage>("/feed"),
  leaderboard: (window: string) => api<LeaderboardResponse>(`/leaderboard?window=${window}`),
  trader: (handle: string) => api<TraderProfile>(`/users/${handle}`),
  follow: (handle: string) => api<{ ok: true; following: boolean }>(`/users/${handle}/follow`, { method: "POST" }),
  unfollow: (handle: string) =>
    api<{ ok: true; following: boolean }>(`/users/${handle}/follow`, { method: "DELETE" }),
};

export type TraderProfile = {
  id: string;
  handle: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: string;
  followerCount: number;
  followingCount: number;
  isFollowing: boolean;
  positions: Array<{
    id: string;
    tokenSymbol: string;
    chain: string;
    avgEntryPrice: string;
    amountHeld: string;
    unrealizedPnlUsd: number;
    realizedPnlUsd: number;
    status: string;
  }>;
  recentTrades: Array<{
    id: string;
    side: "BUY" | "SELL";
    tokenSymbol: string;
    chain: string;
    usdValue: number;
    createdAt: string;
    thesis: string | null;
  }>;
};
