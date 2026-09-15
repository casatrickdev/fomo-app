export const CHAINS = ["SOLANA", "BASE", "ETHEREUM"] as const;
export type Chain = (typeof CHAINS)[number];

export const TRADE_SIDES = ["BUY", "SELL"] as const;
export type TradeSide = (typeof TRADE_SIDES)[number];

export const LEADERBOARD_WINDOWS = ["24h", "7d", "30d", "all"] as const;
export type LeaderboardWindow = (typeof LEADERBOARD_WINDOWS)[number];

export const NOTIFICATION_TYPES = [
  "FOLLOWED_TRADE",
  "PRICE_MILESTONE",
  "NEW_LISTING",
  "WHALE_TRADE",
  "COPY_TRADE_EXECUTED",
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];
