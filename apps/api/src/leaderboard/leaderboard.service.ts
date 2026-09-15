import {
  LEADERBOARD_WINDOWS,
  type LeaderboardWindow,
} from "@kite/shared-types";
import { BadRequestException, Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class LeaderboardService {
  constructor(private readonly prisma: PrismaService) {}

  async list(window: string) {
    if (!LEADERBOARD_WINDOWS.includes(window as LeaderboardWindow)) {
      throw new BadRequestException("Invalid leaderboard window");
    }

    const rows = await this.prisma.leaderboardEntry.findMany({
      where: { window },
      include: {
        user: { include: { _count: { select: { followers: true } } } },
      },
      orderBy: { rank: "asc" },
      take: 50,
    });

    return {
      window,
      computedAt: rows[0]?.computedAt.toISOString() ?? new Date().toISOString(),
      rows: rows.map((row) => ({
        rank: row.rank,
        user: {
          id: row.user.id,
          handle: row.user.handle,
          displayName: row.user.displayName,
          avatarUrl: row.user.avatarUrl,
        },
        pnlUsd: Number(row.pnlUsd),
        volumeUsd: Number(row.volumeUsd),
        winRate: Number(row.winRate),
        followerCount: row.user._count.followers,
      })),
    };
  }

  @Cron(CronExpression.EVERY_HOUR)
  async recomputeAllWindows() {
    for (const window of LEADERBOARD_WINDOWS) {
      await this.recompute(window);
    }
  }

  async recompute(window: LeaderboardWindow) {
    const since = this.windowStart(window);
    const trades = await this.prisma.trade.groupBy({
      by: ["userId", "side"],
      where: since
        ? { createdAt: { gte: since }, user: { isDemo: true } }
        : { user: { isDemo: true } },
      _sum: { usdValue: true },
      _count: { _all: true },
    });

    const byUser = new Map<
      string,
      { volume: number; buys: number; sells: number }
    >();
    for (const row of trades) {
      const current = byUser.get(row.userId) ?? {
        volume: 0,
        buys: 0,
        sells: 0,
      };
      current.volume += Number(row._sum.usdValue ?? 0);
      if (row.side === "BUY") current.buys += row._count._all;
      if (row.side === "SELL") current.sells += row._count._all;
      byUser.set(row.userId, current);
    }

    const positions = await this.prisma.position.groupBy({
      by: ["userId"],
      _sum: { realizedPnlUsd: true, unrealizedPnlUsd: true },
    });

    const ranked = positions
      .map((position) => {
        const stats = byUser.get(position.userId) ?? {
          volume: 0,
          buys: 0,
          sells: 0,
        };
        const pnl =
          Number(position._sum.realizedPnlUsd ?? 0) +
          Number(position._sum.unrealizedPnlUsd ?? 0);
        const tradesCount = stats.buys + stats.sells;
        const winRate = tradesCount === 0 ? 0 : stats.sells / tradesCount;
        return {
          userId: position.userId,
          pnlUsd: pnl,
          volumeUsd: stats.volume,
          winRate: Math.round(winRate * 10000) / 10000,
        };
      })
      .sort((a, b) => b.pnlUsd - a.pnlUsd);

    await this.prisma.$transaction(
      ranked.map((row, index) =>
        this.prisma.leaderboardEntry.upsert({
          where: { userId_window: { userId: row.userId, window } },
          create: {
            userId: row.userId,
            window,
            pnlUsd: row.pnlUsd,
            volumeUsd: row.volumeUsd,
            winRate: row.winRate,
            rank: index + 1,
          },
          update: {
            pnlUsd: row.pnlUsd,
            volumeUsd: row.volumeUsd,
            winRate: row.winRate,
            rank: index + 1,
            computedAt: new Date(),
          },
        }),
      ),
    );
  }

  private windowStart(window: LeaderboardWindow): Date | null {
    const now = Date.now();
    if (window === "24h") return new Date(now - 24 * 60 * 60 * 1000);
    if (window === "7d") return new Date(now - 7 * 24 * 60 * 60 * 1000);
    if (window === "30d") return new Date(now - 30 * 24 * 60 * 60 * 1000);
    return null;
  }
}
