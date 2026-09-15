import { kiteColors, kiteSpacing } from "@kite/ui";
import type { FeedItem } from "@kite/shared-types";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { io, type Socket } from "socket.io-client";
import { kiteApi } from "../../lib/api";
import { WS_URL } from "../../lib/config";
import { getAccessToken } from "../../lib/session-store";
import type { MainStackParamList } from "../../navigation/types";
import { FeedCard } from "../../ui/FeedCard";
import { Screen } from "../../ui/primitives";

type Nav = NativeStackNavigationProp<MainStackParamList>;

export function HomeFeedScreen() {
  const navigation = useNavigation<Nav>();
  const queryClient = useQueryClient();
  const [liveNote, setLiveNote] = useState("Connecting to live tape…");
  const feed = useQuery({ queryKey: ["feed"], queryFn: kiteApi.feed });

  useEffect(() => {
    let socket: Socket | undefined;
    let cancelled = false;
    const connect = async () => {
      const token = await getAccessToken();
      if (!token || cancelled) return;
      socket = io(`${WS_URL}/feed`, { auth: { token }, transports: ["websocket"] });
      socket.on("connect", () => setLiveNote("Live"));
      socket.on("disconnect", () => setLiveNote("Reconnecting…"));
      socket.on("trade", (item: FeedItem) => {
        queryClient.setQueryData(["feed"], (current: Awaited<ReturnType<typeof kiteApi.feed>> | undefined) => {
          if (!current) {
            return { items: [item], nextCursor: null };
          }
          if (current.items.some((row) => row.id === item.id)) {
            return current;
          }
          return { ...current, items: [item, ...current.items] };
        });
      });
    };
    void connect();
    return () => {
      cancelled = true;
      socket?.disconnect();
    };
  }, [queryClient]);

  return (
    <Screen style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.brand}>Kite</Text>
        <View style={styles.livePill}>
          <View style={styles.dot} />
          <Text style={styles.liveText}>{liveNote}</Text>
        </View>
      </View>
      <FlatList
        data={feed.data?.items ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            tintColor={kiteColors.accent}
            refreshing={feed.isRefetching}
            onRefresh={() => void feed.refetch()}
          />
        }
        ListEmptyComponent={
          <Text style={styles.empty}>
            {feed.isLoading ? "Lifting the tape…" : "No trades yet. Follow a flyer or wait for the live demo feed."}
          </Text>
        }
        renderItem={({ item }) => (
          <FeedCard
            item={item}
            onOpenTrader={(handle) => navigation.navigate("Trader", { handle })}
            onOpenToken={(symbol, address) => navigation.navigate("Token", { symbol, address })}
          />
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: 0 },
  header: {
    paddingHorizontal: kiteSpacing.xl,
    paddingTop: 8,
    paddingBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brand: { color: kiteColors.text, fontSize: 28, fontWeight: "800", letterSpacing: -0.8 },
  livePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: kiteColors.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: kiteColors.stream },
  liveText: { color: kiteColors.stream, fontSize: 12, fontWeight: "700" },
  list: { paddingHorizontal: kiteSpacing.lg, paddingBottom: 40, gap: 12 },
  empty: { color: kiteColors.textMuted, textAlign: "center", marginTop: 48 },
});
