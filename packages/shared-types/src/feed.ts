import { z } from "zod";
import { CHAINS, TRADE_SIDES } from "./enums";

export const feedItemSchema = z.object({
  id: z.string(),
  createdAt: z.string().datetime(),
  trader: z.object({
    id: z.string(),
    handle: z.string(),
    displayName: z.string(),
    avatarUrl: z.string().nullable(),
  }),
  token: z.object({
    address: z.string(),
    symbol: z.string(),
    name: z.string(),
    chain: z.enum(CHAINS),
  }),
  side: z.enum(TRADE_SIDES),
  usdValue: z.number(),
  amountToken: z.string(),
  priceUsd: z.string(),
  txHash: z.string(),
  thesis: z
    .object({
      id: z.string(),
      text: z.string(),
      likes: z.number().int().nonnegative(),
    })
    .nullable(),
});
export type FeedItem = z.infer<typeof feedItemSchema>;

export const feedPageSchema = z.object({
  items: z.array(feedItemSchema),
  nextCursor: z.string().nullable(),
});
export type FeedPage = z.infer<typeof feedPageSchema>;
