import { z } from "zod";
import { LEADERBOARD_WINDOWS } from "./enums";

export const leaderboardRowSchema = z.object({
  rank: z.number().int().positive(),
  user: z.object({
    id: z.string(),
    handle: z.string(),
    displayName: z.string(),
    avatarUrl: z.string().nullable(),
  }),
  pnlUsd: z.number(),
  volumeUsd: z.number(),
  winRate: z.number(),
  followerCount: z.number().int().nonnegative(),
});
export type LeaderboardRow = z.infer<typeof leaderboardRowSchema>;

export const leaderboardResponseSchema = z.object({
  window: z.enum(LEADERBOARD_WINDOWS),
  computedAt: z.string().datetime(),
  rows: z.array(leaderboardRowSchema),
});
export type LeaderboardResponse = z.infer<typeof leaderboardResponseSchema>;
