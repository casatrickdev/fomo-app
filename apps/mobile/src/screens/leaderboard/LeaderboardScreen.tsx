import { kiteColors, kiteRadii, kiteSpacing } from "@kite/ui";
import type { LeaderboardWindow } from "@kite/shared-types";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useQuery } from "@tanstack/react-query";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useState } from "react";
import { kiteApi } from "../../lib/api";
import type { MainStackParamList } from "../../navigation/types";
import { Avatar } from "../../ui/Avatar";
import { Screen } from "../../ui/primitives";

const WINDOWS: LeaderboardWindow[] = ["24h", "7d", "30d", "all"];
type Nav = NativeStackNavigationProp<MainStackParamList>;

function formatPnl(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}$${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

export function LeaderboardScreen() {
  const navigation = useNavigation<Nav>();
  const [window, setWindow] = useState<LeaderboardWindow>("7d");
  const board = useQuery({
    queryKey: ["leaderboard", window],
    queryFn: () => kiteApi.leaderboard(window),
  });

  return (
    <Screen style={{ paddingHorizontal: 0 }}>
      <Text style={styles.title}>Leaderboard</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
        {WINDOWS.map((item) => (
          <Pressable key={item} onPress={() => setWindow(item)} style={[styles.tab, window === item && styles.tabOn]}>
            <Text style={[styles.tabText, window === item && styles.tabTextOn]}>{item}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <ScrollView contentContainerStyle={styles.list}>
        {(board.data?.rows ?? []).map((row) => (
          <Pressable
            key={row.user.id}
            style={styles.row}
            onPress={() => navigation.navigate("Trader", { handle: row.user.handle })}
          >
            <Text style={styles.rank}>{row.rank}</Text>
            <Avatar uri={row.user.avatarUrl} handle={row.user.handle} />
            <View style={{ flex: 1 }}>
              <Text style={styles.handle}>@{row.user.handle}</Text>
              <Text style={styles.meta}>
                {row.followerCount} followers · vol ${row.volumeUsd.toLocaleString()}
              </Text>
            </View>
            <Text style={[styles.pnl, { color: row.pnlUsd >= 0 ? kiteColors.success : kiteColors.sell }]}>
              {formatPnl(row.pnlUsd)}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: kiteColors.text,
    fontSize: 28,
    fontWeight: "800",
    paddingHorizontal: kiteSpacing.xl,
    marginBottom: 8,
  },
  tabs: { paddingHorizontal: kiteSpacing.lg, gap: 8, paddingBottom: 12 },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: kiteRadii.pill,
    backgroundColor: kiteColors.surface,
  },
  tabOn: { backgroundColor: kiteColors.accent },
  tabText: { color: kiteColors.textMuted, fontWeight: "700" },
  tabTextOn: { color: kiteColors.bg },
  list: { paddingHorizontal: kiteSpacing.lg, gap: 10, paddingBottom: 32 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: kiteColors.surface,
    padding: 12,
    borderRadius: kiteRadii.md,
    borderWidth: 1,
    borderColor: kiteColors.border,
  },
  rank: { color: kiteColors.accent, width: 24, fontWeight: "800", fontSize: 16 },
  handle: { color: kiteColors.text, fontWeight: "700" },
  meta: { color: kiteColors.textMuted, fontSize: 12, marginTop: 2 },
  pnl: { fontWeight: "800" },
});
