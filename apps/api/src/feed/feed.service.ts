import type { FeedItem } from "@kite/shared-types";
import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

type TradeWithRelations = Prisma.TradeGetPayload<{
  include: { user: true; thesis: true };
}>;

export function mapTradeToFeedItem(trade: TradeWithRelations): FeedItem {
  return {
    id: trade.id,
    createdAt: trade.createdAt.toISOString(),
    trader: {
      id: trade.user.id,
      handle: trade.user.handle,
      displayName: trade.user.displayName,
      avatarUrl: trade.user.avatarUrl,
    },
    token: {
      address: trade.tokenAddress,
      symbol: trade.tokenSymbol,
      name: trade.tokenName,
      chain: trade.chain,
    },
    side: trade.side,
    usdValue: Number(trade.usdValue),
    amountToken: trade.amountToken.toString(),
    priceUsd: trade.priceUsd.toString(),
    txHash: trade.txHash,
    thesis: trade.thesis
      ? {
          id: trade.thesis.id,
          text: trade.thesis.text,
          likes: trade.thesis.likes,
        }
      : null,
  };
}

@Injectable()
export class FeedService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string, cursor?: string) {
    const follows = await this.prisma.follow.findMany({
      where: { followerId: userId },
      select: { followeeId: true },
    });
    const followeeIds = follows.map((follow) => follow.followeeId);
    const where =
      followeeIds.length > 0
        ? { userId: { in: followeeIds } }
        : { user: { isDemo: true } };

    const items = await this.prisma.trade.findMany({
      where,
      include: { user: true, thesis: true },
      orderBy: { createdAt: "desc" },
      take: 40,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    });

    return {
      items: items.map(mapTradeToFeedItem),
      nextCursor: items.at(-1)?.id ?? null,
    };
  }
}
