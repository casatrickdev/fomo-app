import { kiteColors, kiteRadii, kiteSpacing } from "@kite/ui";
import { RouteProp, useRoute } from "@react-navigation/native";
import { StyleSheet, Text, View } from "react-native";
import type { MainStackParamList } from "../../navigation/types";
import { Muted, PrimaryButton, Screen, Title } from "../../ui/primitives";

type R = RouteProp<MainStackParamList, "Token">;

export function TokenDetailScreen() {
  const { params } = useRoute<R>();
  return (
    <Screen style={styles.wrap} withTopInset={false}>
      <Title>{params.symbol}</Title>
      <Muted>{params.address}</Muted>
      <View style={styles.chart}>
        <Text style={styles.chartLabel}>Candle chart and live market data land in a later milestone.</Text>
        <Text style={styles.chartLabel}>Public sources only: DexScreener / CoinGecko / Birdeye — never private app APIs.</Text>
      </View>
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Gasless swap</Text>
        <Muted>Quotes and execution go through the Kite relayer. No client-side keys. Not live yet.</Muted>
        <PrimaryButton label="Buy (coming soon)" onPress={() => undefined} disabled />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingTop: 16, gap: kiteSpacing.lg },
  chart: {
    minHeight: 180,
    borderRadius: kiteRadii.lg,
    backgroundColor: kiteColors.surface,
    borderWidth: 1,
    borderColor: kiteColors.border,
    padding: 16,
    justifyContent: "center",
    gap: 8,
  },
  chartLabel: { color: kiteColors.textMuted, lineHeight: 20 },
  panel: {
    backgroundColor: kiteColors.surface,
    borderRadius: kiteRadii.lg,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: kiteColors.border,
  },
  panelTitle: { color: kiteColors.text, fontWeight: "800", fontSize: 18 },
});
