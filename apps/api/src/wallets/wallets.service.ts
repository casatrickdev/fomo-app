import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import {
  WALLET_PROVIDER,
  WalletProvider,
} from "./providers/wallet-provider.interface";

@Injectable()
export class WalletsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(WALLET_PROVIDER) private readonly provider: WalletProvider,
  ) {}

  async provisionForUser(userId: string) {
    const existing = await this.prisma.wallet.findMany({ where: { userId } });
    if (existing.length > 0) {
      return existing;
    }

    const provisioned = await this.provider.provision(userId);
    await this.prisma.wallet.createMany({
      data: provisioned.map((wallet) => ({
        userId,
        chain: wallet.chain,
        address: wallet.address,
        provider: wallet.provider,
        providerRef: wallet.providerRef,
      })),
    });

    return this.prisma.wallet.findMany({ where: { userId } });
  }

  listForUser(userId: string) {
    return this.prisma.wallet.findMany({
      where: { userId },
      orderBy: { chain: "asc" },
    });
  }
}
