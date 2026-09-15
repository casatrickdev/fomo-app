import {
  Chain,
  NotificationType,
  PositionStatus,
  PrismaClient,
  TradeSide,
} from "@prisma/client";
import { createHash } from "crypto";

const prisma = new PrismaClient();

const DEMO_TRADERS = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    handle: "luna_flow",
    displayName: "Luna Flow",
    bio: "Chasing liquidity, not headlines.",
    email: "luna@demo.kite.dev",
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    handle: "cobalt",
    displayName: "Cobalt",
    bio: "Base-native, size-disciplined.",
    email: "cobalt@demo.kite.dev",
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    handle: "ridge",
    displayName: "Ridge",
    bio: "Swing trades with a written thesis.",
    email: "ridge@demo.kite.dev",
  },
  {
    id: "44444444-4444-4444-8444-444444444444",
    handle: "nori",
    displayName: "Nori",
    bio: "Mostly Solana memes, always a stop.",
    email: "nori@demo.kite.dev",
  },
  {
    id: "55555555-5555-4555-8555-555555555555",
    handle: "vale",
    displayName: "Vale",
    bio: "ETH majors + a little chaos.",
    email: "vale@demo.kite.dev",
  },
  {
    id: "66666666-6666-4666-8666-666666666666",
    handle: "knox",
    displayName: "Knox",
    bio: "High volume, low commentary.",
    email: "knox@demo.kite.dev",
  },
  {
    id: "77777777-7777-4777-8777-777777777777",
    handle: "iris",
    displayName: "Iris",
    bio: "Reads order flow, writes it down.",
    email: "iris@demo.kite.dev",
  },
  {
    id: "88888888-8888-4888-8888-888888888888",
    handle: "jett",
    displayName: "Jett",
    bio: "In and out before the thread starts.",
    email: "jett@demo.kite.dev",
  },
] as const;

const TOKENS = [
  {
    symbol: "SOL",
    name: "Solana",
    chain: Chain.SOLANA,
    address: "So11111111111111111111111111111111111111112",
  },
  {
    symbol: "BONK",
    name: "Bonk",
    chain: Chain.SOLANA,
    address: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
  },
  {
    symbol: "WIF",
    name: "dogwifhat",
    chain: Chain.SOLANA,
    address: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm",
  },
  {
    symbol: "ETH",
    name: "Ether",
    chain: Chain.ETHEREUM,
    address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
  },
  {
    symbol: "PEPE",
    name: "Pepe",
    chain: Chain.ETHEREUM,
    address: "0x6982508145454ce325ddbe47a25d4ec3d2311933",
  },
  {
    symbol: "DEGEN",
    name: "Degen",
    chain: Chain.BASE,
    address: "0x4ed4e862860bed51a9570b96d89af5e1b0efefed",
  },
  {
    symbol: "BRETT",
    name: "Brett",
    chain: Chain.BASE,
    address: "0x532f27101965dd16442e59d40670faf5ebb142e4",
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    chain: Chain.BASE,
    address: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
  },
] as const;

const THESES = [
  "Liquidity is holding the range. Scaling, not swinging for the fences.",
  "Narrative is tired but the tape is not. Small add.",
  "Taking the other side of the timeline. Tight invalidation.",
  "This is a position, not a personality. Size stays boring.",
  "Exiting into strength — the thesis already paid.",
  "First print over a broken level. Watching holders, not headlines.",
];

function stubAddress(userId: string, chain: Chain): string {
  const hash = createHash("sha256")
    .update(`kite-stub:${userId}:${chain}`)
    .digest("hex");
  if (chain === Chain.SOLANA) {
    return Buffer.from(hash, "hex").toString("base64url").slice(0, 44);
  }
  return `0x${hash.slice(0, 40)}`;
}

function avatar(handle: string): string {
  return `https://api.dicebear.com/9.x/shapes/png?seed=${encodeURIComponent(handle)}&backgroundColor=0e1424`;
}

async function main() {
  await prisma.leaderboardEntry.deleteMany();
  await prisma.thesis.deleteMany();
  await prisma.trade.deleteMany();
  await prisma.position.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.notificationPreference.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.session.deleteMany();
  await prisma.otpChallenge.deleteMany();
  await prisma.copyTradeSubscription.deleteMany();
  await prisma.user.deleteMany({ where: { isDemo: true } });

  const users = [];
  for (const trader of DEMO_TRADERS) {
    const user = await prisma.user.create({
      data: {
        id: trader.id,
        email: trader.email,
        handle: trader.handle,
        displayName: trader.displayName,
        bio: trader.bio,
        avatarUrl: avatar(trader.handle),
        isDemo: true,
        wallets: {
          create: [
            {
              chain: Chain.SOLANA,
              address: stubAddress(trader.id, Chain.SOLANA),
              provider: "stub",
            },
            {
              chain: Chain.BASE,
              address: stubAddress(trader.id, Chain.BASE),
              provider: "stub",
            },
            {
              chain: Chain.ETHEREUM,
              address: stubAddress(trader.id, Chain.ETHEREUM),
              provider: "stub",
            },
          ],
        },
        notificationPreferences: {
          create: Object.values(NotificationType).map((type) => ({
            type,
            enabled: true,
          })),
        },
      },
    });
    users.push(user);
  }

  for (let i = 0; i < users.length; i += 1) {
    const follower = users[i];
    const followee = users[(i + 1) % users.length];
    const followee2 = users[(i + 3) % users.length];
    await prisma.follow.createMany({
      data: [
        { followerId: follower.id, followeeId: followee.id },
        { followerId: follower.id, followeeId: followee2.id },
      ],
      skipDuplicates: true,
    });
  }

  const now = Date.now();
  let tradeIndex = 0;
  for (const user of users) {
    for (let t = 0; t < 8; t += 1) {
      const token = TOKENS[(tradeIndex + t) % TOKENS.length];
      const side = t % 3 === 0 ? TradeSide.SELL : TradeSide.BUY;
      const usdValue = 180 + ((tradeIndex * 37 + t * 91) % 4200);
      const priceUsd =
        token.symbol === "SOL"
          ? 148
          : token.symbol === "ETH"
            ? 3450
            : 0.012 + (t % 9) * 0.004;
      const amountToken = usdValue / priceUsd;
      const createdAt = new Date(now - (tradeIndex * 19 + t * 47) * 60_000);

      const trade = await prisma.trade.create({
        data: {
          userId: user.id,
          chain: token.chain,
          tokenAddress: token.address,
          tokenSymbol: token.symbol,
          tokenName: token.name,
          side,
          amountToken,
          priceUsd,
          usdValue,
          txHash: `stub_${user.handle}_${t}_${tradeIndex}`,
          createdAt,
          thesis:
            t % 2 === 0
              ? {
                  create: {
                    userId: user.id,
                    text: THESES[(tradeIndex + t) % THESES.length],
                    likes: (t * 3 + tradeIndex) % 40,
                    createdAt,
                  },
                }
              : undefined,
        },
      });
      void trade;
    }

    await prisma.position.create({
      data: {
        userId: user.id,
        tokenAddress: TOKENS[tradeIndex % TOKENS.length].address,
        tokenSymbol: TOKENS[tradeIndex % TOKENS.length].symbol,
        chain: TOKENS[tradeIndex % TOKENS.length].chain,
        avgEntryPrice: 0.08,
        amountHeld: 12500,
        realizedPnlUsd: 420 + tradeIndex * 110,
        unrealizedPnlUsd: 80 + tradeIndex * 35,
        volumeUsd: 12000 + tradeIndex * 1800,
        status: PositionStatus.OPEN,
      },
    });

    tradeIndex += 1;
  }

  const windows = ["24h", "7d", "30d", "all"] as const;
  const pnlBase = [1860, -420, 940, 2210, 310, 1540, -180, 760];
  for (const window of windows) {
    const multiplier =
      window === "24h"
        ? 0.12
        : window === "7d"
          ? 0.4
          : window === "30d"
            ? 0.85
            : 1.4;
    const ranked = users
      .map((user, index) => ({
        user,
        pnlUsd: Math.round(pnlBase[index] * multiplier * 100) / 100,
        volumeUsd: Math.round((8000 + index * 2400) * (multiplier + 0.3)),
        winRate: Math.round((0.41 + (index % 5) * 0.07) * 10000) / 10000,
      }))
      .sort((a, b) => b.pnlUsd - a.pnlUsd);

    for (let rank = 0; rank < ranked.length; rank += 1) {
      const row = ranked[rank];
      await prisma.leaderboardEntry.create({
        data: {
          userId: row.user.id,
          window,
          pnlUsd: row.pnlUsd,
          volumeUsd: row.volumeUsd,
          winRate: row.winRate,
          rank: rank + 1,
        },
      });
    }
  }

  console.log(
    `Seeded ${users.length} demo traders, trades, and leaderboard windows.`,
  );
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
