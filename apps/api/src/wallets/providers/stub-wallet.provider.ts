import { CHAINS, type Chain } from "@kite/shared-types";
import { Injectable } from "@nestjs/common";
import { createHash } from "crypto";
import type {
  ProvisionedWallet,
  WalletProvider,
} from "./wallet-provider.interface";

/**
 * Deterministic, non-custodial stub. Generates display addresses only.
 * It never creates, stores, or returns private keys.
 * Swap this class for Alchemy Account Kit / Privy / Turnkey behind WALLET_PROVIDER.
 */
@Injectable()
export class StubWalletProvider implements WalletProvider {
  readonly name = "stub";

  provision(userId: string): Promise<ProvisionedWallet[]> {
    return Promise.resolve(
      CHAINS.map((chain) => ({
        chain,
        address: this.deriveAddress(userId, chain),
        provider: this.name,
        providerRef: `stub:${userId}:${chain}`,
      })),
    );
  }

  deriveAddress(userId: string, chain: Chain): string {
    const hash = createHash("sha256")
      .update(`kite-stub:${userId}:${chain}`)
      .digest("hex");
    if (chain === "SOLANA") {
      return Buffer.from(hash, "hex").toString("base64url").slice(0, 44);
    }
    return `0x${hash.slice(0, 40)}`;
  }
}
