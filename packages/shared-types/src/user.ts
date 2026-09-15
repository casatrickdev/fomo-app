import { z } from "zod";
import { CHAINS } from "./enums";

export const publicUserSchema = z.object({
  id: z.string().uuid(),
  handle: z.string(),
  displayName: z.string(),
  avatarUrl: z.string().nullable(),
  bio: z.string().nullable(),
  createdAt: z.string().datetime(),
  followerCount: z.number().int().nonnegative(),
  followingCount: z.number().int().nonnegative(),
});
export type PublicUser = z.infer<typeof publicUserSchema>;

export const walletSchema = z.object({
  id: z.string().uuid(),
  chain: z.enum(CHAINS),
  address: z.string(),
  provider: z.string(),
});
export type WalletDto = z.infer<typeof walletSchema>;

export const sessionUserSchema = publicUserSchema.extend({
  email: z.string().email(),
  onboardingComplete: z.boolean(),
  wallets: z.array(walletSchema),
});
export type SessionUser = z.infer<typeof sessionUserSchema>;

export const authTokensSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresInSeconds: z.number().int().positive(),
});
export type AuthTokens = z.infer<typeof authTokensSchema>;

export const authSessionSchema = authTokensSchema.extend({
  user: sessionUserSchema,
});
export type AuthSession = z.infer<typeof authSessionSchema>;
