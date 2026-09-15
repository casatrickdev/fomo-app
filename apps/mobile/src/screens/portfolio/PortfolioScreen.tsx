import { kiteSpacing } from "@kite/ui";
import { StyleSheet } from "react-native";
import { Muted, Screen, Title } from "../../ui/primitives";

export function PortfolioScreen() {
  return (
    <Screen style={styles.wrap}>
      <Title>Portfolio</Title>
      <Muted>
        Multichain balances, open positions, and cash-out will land here. Withdrawals that require KYC/AML are
        flagged as a legal review TODO — Kite does not hardcode compliance decisions.
      </Muted>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingTop: 24, gap: kiteSpacing.md },
});
