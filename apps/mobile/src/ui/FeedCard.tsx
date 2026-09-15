import { kiteColors, kiteRadii, kiteSpacing } from "@kite/ui";
import type { FeedItem } from "@kite/shared-types";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Avatar } from "./Avatar";

function timeAgo(iso: string): string {
  const delta = Date.now() - new Date(iso).getTime();
  const minutes = Math.max(1, Math.round(delta / 60000));
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.round(hours / 24)}d`;
}

function usd(value: number): string {
  return `$${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

export function FeedCard({
  item,
  onOpenTrader,
  onOpenToken,
}: {
  item: FeedItem;
  onOpenTrader: (handle: string) => void;
  onOpenToken: (symbol: string, address: string) => void;
}) {
  const isBuy = item.side === "BUY";
  return (
    <View style={styles.card}>
      <Pressable style={styles.header} onPress={() => onOpenTrader(item.trader.handle)}>
        <Avatar uri={item.trader.avatarUrl} handle={item.trader.handle} />
        <View style={{ flex: 1 }}>
          <Text style={styles.handle}>@{item.trader.handle}</Text>
          <Text style={styles.meta}>{item.trader.displayName}</Text>
        </View>
        <Text style={styles.time}>{timeAgo(item.createdAt)}</Text>
      </Pressable>
      <Pressable onPress={() => onOpenToken(item.token.symbol, item.token.address)}>
        <Text style={styles.body}>
          <Text style={{ color: isBuy ? kiteColors.buy : kiteColors.sell }}>{isBuy ? "bought" : "sold"} </Text>
          <Text style={styles.strong}>{usd(item.usdValue)}</Text>
          <Text> of </Text>
          <Text style={styles.token}>{item.token.symbol}</Text>
        </Text>
        <View style={styles.chip}>
          <Text style={styles.chipText}>
            {item.token.chain} · {item.token.name}
          </Text>
        </View>
      </Pressable>
      {item.thesis ? <Text style={styles.thesis}>“{item.thesis.text}”</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: kiteColors.surface,
    borderRadius: kiteRadii.lg,
    padding: kiteSpacing.lg,
    gap: 10,
    borderWidth: 1,
    borderColor: kiteColors.border,
  },
  header: { flexDirection: "row", alignItems: "center", gap: 10 },
  handle: { color: kiteColors.text, fontWeight: "700", fontSize: 15 },
  meta: { color: kiteColors.textMuted, fontSize: 12 },
  time: { color: kiteColors.textMuted, fontSize: 12 },
  body: { color: kiteColors.text, fontSize: 17, lineHeight: 24 },
  strong: { fontWeight: "700" },
  token: { color: kiteColors.accent, fontWeight: "700" },
  chip: {
    alignSelf: "flex-start",
    marginTop: 8,
    backgroundColor: kiteColors.bgElevated,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: kiteRadii.pill,
  },
  chipText: { color: kiteColors.stream, fontSize: 11, fontWeight: "600", letterSpacing: 0.4 },
  thesis: {
    color: kiteColors.textMuted,
    fontSize: 14,
    fontStyle: "italic",
    lineHeight: 20,
  },
});
