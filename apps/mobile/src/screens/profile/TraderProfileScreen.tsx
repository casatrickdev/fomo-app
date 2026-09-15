import { kiteColors, kiteRadii, kiteSpacing } from "@kite/ui";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { kiteApi } from "../../lib/api";
import type { MainStackParamList } from "../../navigation/types";
import { Avatar } from "../../ui/Avatar";
import { PrimaryButton, Screen } from "../../ui/primitives";

type R = RouteProp<MainStackParamList, "Trader">;

export function TraderProfileScreen() {
  const { params } = useRoute<R>();
  const queryClient = useQueryClient();
  const trader = useQuery({
    queryKey: ["trader", params.handle],
    queryFn: () => kiteApi.trader(params.handle),
  });
  const follow = useMutation({
    mutationFn: () =>
      trader.data?.isFollowing ? kiteApi.unfollow(params.handle) : kiteApi.follow(params.handle),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["trader", params.handle] });
      void queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });

  if (!trader.data) {
    return (
      <Screen>
        <Text style={styles.meta}>{trader.isError ? "Could not load trader" : "Loading…"}</Text>
      </Screen>
    );
  }

  const person = trader.data;
  return (
    <Screen style={{ paddingHorizontal: 0 }} withTopInset={false}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Avatar uri={person.avatarUrl} handle={person.handle} size={72} />
          <Text style={styles.name}>{person.displayName}</Text>
          <Text style={styles.handle}>@{person.handle}</Text>
          {person.bio ? <Text style={styles.bio}>{person.bio}</Text> : null}
          <Text style={styles.meta}>
            {person.followerCount} followers · {person.followingCount} following
          </Text>
          <PrimaryButton
            label={person.isFollowing ? "Following" : "Follow"}
            onPress={() => follow.mutate()}
            loading={follow.isPending}
          />
        </View>
        <Text style={styles.section}>Open positions</Text>
        {person.positions.map((position) => (
          <View key={position.id} style={styles.card}>
            <Text style={styles.cardTitle}>
              {position.tokenSymbol} · {position.chain}
            </Text>
            <Text style={styles.meta}>
              uPnL ${position.unrealizedPnlUsd.toLocaleString()} · realized $
              {position.realizedPnlUsd.toLocaleString()}
            </Text>
          </View>
        ))}
        <Text style={styles.section}>Recent trades</Text>
        {person.recentTrades.map((trade) => (
          <View key={trade.id} style={styles.card}>
            <Text style={styles.cardTitle}>
              {trade.side} {trade.tokenSymbol} · ${trade.usdValue.toLocaleString()}
            </Text>
            {trade.thesis ? <Text style={styles.bio}>{trade.thesis}</Text> : null}
          </View>
        ))}
        <View style={styles.warning}>
          <Text style={styles.warningTitle}>Copy trading</Text>
          <Text style={styles.meta}>
            Automated copy trading is opt-in and not enabled in this milestone. It will require a second
            confirmation above a USD threshold and is not financial advice.
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: kiteSpacing.xl, gap: 12, paddingBottom: 48 },
  hero: { gap: 8, alignItems: "flex-start" },
  name: { color: kiteColors.text, fontSize: 26, fontWeight: "800" },
  handle: { color: kiteColors.accent, fontWeight: "700" },
  bio: { color: kiteColors.textMuted, lineHeight: 20 },
  meta: { color: kiteColors.textMuted },
  section: { color: kiteColors.text, fontWeight: "800", fontSize: 18, marginTop: 8 },
  card: {
    backgroundColor: kiteColors.surface,
    borderRadius: kiteRadii.md,
    padding: 12,
    borderWidth: 1,
    borderColor: kiteColors.border,
    gap: 4,
  },
  cardTitle: { color: kiteColors.text, fontWeight: "700" },
  warning: {
    backgroundColor: kiteColors.bgElevated,
    borderRadius: kiteRadii.md,
    padding: 14,
    gap: 6,
    borderWidth: 1,
    borderColor: kiteColors.accentDim,
  },
  warningTitle: { color: kiteColors.accent, fontWeight: "800" },
});
