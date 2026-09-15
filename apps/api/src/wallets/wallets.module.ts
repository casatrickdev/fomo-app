import { Module } from "@nestjs/common";
import { WALLET_PROVIDER } from "./providers/wallet-provider.interface";
import { StubWalletProvider } from "./providers/stub-wallet.provider";
import { WalletsController } from "./wallets.controller";
import { WalletsService } from "./wallets.service";

@Module({
  controllers: [WalletsController],
  providers: [
    WalletsService,
    StubWalletProvider,
    { provide: WALLET_PROVIDER, useExisting: StubWalletProvider },
  ],
  exports: [WalletsService],
})
export class WalletsModule {}
