import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Interval } from "@nestjs/schedule";
import { TradeSide } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { FeedGateway } from "./feed.gateway";
import { mapTradeToFeedItem } from "./feed.service";

const DEMO_TOKENS = [
  {
    symbol: "BONK",
    name: "Bonk",
    chain: "SOLANA" as const,
    address: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
  },
  {
    symbol: "WIF",
    name: "dogwifhat",
    chain: "SOLANA" as const,
    address: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm",
  },
  {
    symbol: "DEGEN",
    name: "Degen",
    chain: "BASE" as const,
    address: "0x4ed4e862860bed51a9570b96d89af5e1b0efefed",
  },
  {
    symbol: "PEPE",
    name: "Pepe",
    chain: "ETHEREUM" as const,
    address: "0x6982508145454ce325ddbe47a25d4ec3d2311933",
  },
];

const THESES = [
  "Tape looks cleaner than the timeline.",
  "Adding on a retest, not chasing the wick.",
  "Taking chips off — thesis already worked.",
];

@Injectable()
export class FeedSimulatorService {
  private readonly logger = new Logger(FeedSimulatorService.name);
  private tick = 0;

  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: FeedGateway,
    private readonly config: ConfigService,
  ) {}

  @Interval(4500)
  async emitDemoTrade() {
    if (
      this.config.get("FEED_SIMULATOR_ENABLED") === "false" ||
      process.env.NODE_ENV === "test"
    ) {
      return;
    }

    const traders = await this.prisma.user.findMany({
      where: { isDemo: true },
      take: 16,
    });
    if (traders.length === 0) {
      return;
    }

    const trader = traders[this.tick % traders.length];
    const token = DEMO_TOKENS[this.tick % DEMO_TOKENS.length];
    const side = this.tick % 4 === 0 ? TradeSide.SELL : TradeSide.BUY;
    const usdValue = 220 + ((this.tick * 73) % 2800);
    this.tick += 1;

    const trade = await this.prisma.trade.create({
      data: {
        userId: trader.id,
        chain: token.chain,
        tokenAddress: token.address,
        tokenSymbol: token.symbol,
        tokenName: token.name,
        side,
        amountToken: usdValue / 0.02,
        priceUsd: 0.02,
        usdValue,
        txHash: `sim_${Date.now()}_${this.tick}`,
        thesis:
          this.tick % 2 === 0
            ? {
                create: {
                  userId: trader.id,
                  text: THESES[this.tick % THESES.length],
                  likes: this.tick % 12,
                },
              }
            : undefined,
      },
      include: { user: true, thesis: true },
    });

    const item = mapTradeToFeedItem(trade);
    this.gateway.emitTrade(item);
    this.logger.log(`live trade ${trader.handle} ${side} ${token.symbol}`);
  }
}
