import { User, Wallet } from "@prisma/client";
import type { SessionUser } from "@kite/shared-types";

const PLACEHOLDER_HANDLE_PREFIX = "kite_";

export function isOnboardingComplete(
  user: Pick<User, "handle" | "displayName">,
): boolean {
  return (
    !user.handle.startsWith(PLACEHOLDER_HANDLE_PREFIX) &&
    user.displayName.trim().length > 0
  );
}

export function toSessionUser(
  user: User & {
    wallets: Wallet[];
    _count?: { followers: number; following: number };
  },
): SessionUser {
  return {
    id: user.id,
    email: user.email,
    handle: user.handle,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    createdAt: user.createdAt.toISOString(),
    followerCount: user._count?.followers ?? 0,
    followingCount: user._count?.following ?? 0,
    onboardingComplete: isOnboardingComplete(user),
    wallets: user.wallets.map((wallet) => ({
      id: wallet.id,
      chain: wallet.chain,
      address: wallet.address,
      provider: wallet.provider,
    })),
  };
}
