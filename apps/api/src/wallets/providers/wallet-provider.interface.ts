import type { Chain } from "@kite/shared-types";

export type ProvisionedWallet = {
  chain: Chain;
  address: string;
  provider: string;
  providerRef: string;
};

export const WALLET_PROVIDER = Symbol("WALLET_PROVIDER");

export interface WalletProvider {
  readonly name: string;
  provision(userId: string): Promise<ProvisionedWallet[]>;
}
