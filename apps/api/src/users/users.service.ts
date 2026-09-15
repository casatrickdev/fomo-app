import { updateProfileSchema } from "@kite/shared-types";
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { isOnboardingComplete, toSessionUser } from "./user.mapper";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getSessionUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        wallets: true,
        _count: { select: { followers: true, following: true } },
      },
    });
    if (!user) {
      throw new NotFoundException("User not found");
    }
    return toSessionUser(user);
  }

  async getPublicByHandle(handle: string, viewerId?: string) {
    const user = await this.prisma.user.findUnique({
      where: { handle },
      include: {
        _count: { select: { followers: true, following: true } },
        positions: {
          where: { status: "OPEN" },
          take: 8,
          orderBy: { openedAt: "desc" },
        },
        trades: {
          take: 12,
          orderBy: { createdAt: "desc" },
          include: { thesis: true },
        },
      },
    });
    if (!user) {
      throw new NotFoundException("Trader not found");
    }

    const following =
      viewerId && viewerId !== user.id
        ? Boolean(
            await this.prisma.follow.findUnique({
              where: {
                followerId_followeeId: {
                  followerId: viewerId,
                  followeeId: user.id,
                },
              },
            }),
          )
        : false;

    return {
      id: user.id,
      handle: user.handle,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      createdAt: user.createdAt.toISOString(),
      followerCount: user._count.followers,
      followingCount: user._count.following,
      isFollowing: following,
      onboardingComplete: isOnboardingComplete(user),
      positions: user.positions.map((position) => ({
        id: position.id,
        tokenSymbol: position.tokenSymbol,
        chain: position.chain,
        avgEntryPrice: position.avgEntryPrice.toString(),
        amountHeld: position.amountHeld.toString(),
        unrealizedPnlUsd: Number(position.unrealizedPnlUsd),
        realizedPnlUsd: Number(position.realizedPnlUsd),
        status: position.status,
      })),
      recentTrades: user.trades.map((trade) => ({
        id: trade.id,
        side: trade.side,
        tokenSymbol: trade.tokenSymbol,
        chain: trade.chain,
        usdValue: Number(trade.usdValue),
        createdAt: trade.createdAt.toISOString(),
        thesis: trade.thesis?.text ?? null,
      })),
    };
  }

  async updateMe(
    userId: string,
    input: ReturnType<typeof updateProfileSchema.parse>,
  ) {
    try {
      const user = await this.prisma.user.update({
        where: { id: userId },
        data: {
          ...(input.handle ? { handle: input.handle } : {}),
          ...(input.displayName ? { displayName: input.displayName } : {}),
          ...(input.bio !== undefined ? { bio: input.bio } : {}),
          ...(input.avatarUrl ? { avatarUrl: input.avatarUrl } : {}),
        },
        include: {
          wallets: true,
          _count: { select: { followers: true, following: true } },
        },
      });
      return toSessionUser(user);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new ConflictException("Handle already taken");
      }
      throw error;
    }
  }

  async follow(followerId: string, handle: string) {
    const followee = await this.prisma.user.findUnique({ where: { handle } });
    if (!followee) {
      throw new NotFoundException("Trader not found");
    }
    if (followee.id === followerId) {
      throw new ConflictException("You cannot follow yourself");
    }
    await this.prisma.follow.upsert({
      where: { followerId_followeeId: { followerId, followeeId: followee.id } },
      update: {},
      create: { followerId, followeeId: followee.id },
    });
    return { ok: true, following: true };
  }

  async unfollow(followerId: string, handle: string) {
    const followee = await this.prisma.user.findUnique({ where: { handle } });
    if (!followee) {
      throw new NotFoundException("Trader not found");
    }
    await this.prisma.follow.deleteMany({
      where: { followerId, followeeId: followee.id },
    });
    return { ok: true, following: false };
  }
}
