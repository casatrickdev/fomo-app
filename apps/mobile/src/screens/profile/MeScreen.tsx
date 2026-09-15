import { kiteColors, kiteSpacing } from "@kite/ui";
import { StyleSheet, Text, View } from "react-native";
import { useSession } from "../../store/session";
import { Avatar } from "../../ui/Avatar";
import { GhostButton, Muted, Screen, Title } from "../../ui/primitives";

export function MeScreen() {
  const user = useSession((state) => state.user);
  const signOut = useSession((state) => state.signOut);
  if (!user) return null;

  return (
    <Screen style={styles.wrap}>
      <Avatar uri={user.avatarUrl} handle={user.handle} size={72} />
      <Title>{user.displayName}</Title>
      <Text style={styles.handle}>@{user.handle}</Text>
      <Muted>{user.bio ?? "No bio yet."}</Muted>
      <View style={{ gap: 8 }}>
        {user.wallets.map((wallet) => (
          <Text key={wallet.id} style={styles.wallet}>
            {wallet.chain}: {wallet.address.slice(0, 8)}…{wallet.address.slice(-6)}
          </Text>
        ))}
      </View>
      <GhostButton label="Sign out" onPress={() => void signOut()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingTop: 24, gap: kiteSpacing.md },
  handle: { color: kiteColors.accent, fontWeight: "700", fontSize: 16 },
  wallet: { color: kiteColors.textMuted, fontSize: 12, letterSpacing: 0.2 },
});
