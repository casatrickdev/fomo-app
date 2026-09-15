import { z } from "zod";

export const requestOtpSchema = z.object({
  email: z.string().email().max(254),
});
export type RequestOtpInput = z.infer<typeof requestOtpSchema>;

export const verifyOtpSchema = z.object({
  email: z.string().email().max(254),
  code: z.string().regex(/^\d{6}$/, "OTP must be a 6-digit code"),
});
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;

export const refreshSessionSchema = z.object({
  refreshToken: z.string().min(20).max(2048),
});
export type RefreshSessionInput = z.infer<typeof refreshSessionSchema>;

export const handleSchema = z
  .string()
  .min(3)
  .max(20)
  .regex(/^[a-z][a-z0-9_]*$/, "Handle must start with a letter and use lowercase letters, numbers, or underscores");

export const updateProfileSchema = z.object({
  handle: handleSchema.optional(),
  displayName: z.string().min(1).max(40).optional(),
  bio: z.string().max(160).optional(),
  avatarUrl: z.string().url().max(500).optional(),
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const followUserSchema = z.object({
  handle: handleSchema,
});
export type FollowUserInput = z.infer<typeof followUserSchema>;
