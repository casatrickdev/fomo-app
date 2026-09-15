import { StubWalletProvider } from "./stub-wallet.provider";

describe("StubWalletProvider", () => {
  const provider = new StubWalletProvider();

  it("provisions Solana, Base, and Ethereum addresses without keys", async () => {
    const wallets = await provider.provision("user-1");
    expect(wallets).toHaveLength(3);
    expect(wallets.map((wallet) => wallet.chain).sort()).toEqual([
      "BASE",
      "ETHEREUM",
      "SOLANA",
    ]);
    expect(wallets.every((wallet) => wallet.address.length > 20)).toBe(true);
    expect(JSON.stringify(wallets)).not.toMatch(
      /private|secret|mnemonic|seed/i,
    );
  });

  it("is deterministic for the same user", async () => {
    const first = await provider.provision("user-2");
    const second = await provider.provision("user-2");
    expect(first).toEqual(second);
    expect(provider.deriveAddress("user-2", "BASE").startsWith("0x")).toBe(
      true,
    );
  });
});
