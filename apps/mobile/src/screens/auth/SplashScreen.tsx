import { kiteColors, kiteSpacing } from "@kite/ui";
import { useEffect } from "react";
import { Image, StyleSheet, Text } from "react-native";
import { kiteApi } from "../../lib/api";
import { getAccessToken } from "../../lib/session-store";
import { useSession } from "../../store/session";
import { Screen } from "../../ui/primitives";

export function SplashScreen() {
  const { setUser, setHydrated, signOut } = useSession();

  useEffect(() => {
    let cancelled = false;
    const boot = async () => {
      const token = await getAccessToken();
      if (!token) {
        if (!cancelled) setHydrated(true);
        return;
      }
      try {
        const me = await kiteApi.me();
        if (!cancelled) {
          setUser(me);
          setHydrated(true);
        }
      } catch {
        await signOut();
      }
    };
    void boot();
    return () => {
      cancelled = true;
    };
  }, [setHydrated, setUser, signOut]);

  return (
    <Screen style={styles.center}>
      <Image source={require("../../../assets/icon.png")} style={styles.logo} />
      <Text style={styles.wordmark}>Kite</Text>
      <Text style={styles.tag}>Follow the flow</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: "center",
    justifyContent: "center",
    gap: kiteSpacing.md,
  },
  logo: { width: 96, height: 96, borderRadius: 24 },
  wordmark: { color: kiteColors.text, fontSize: 40, fontWeight: "800", letterSpacing: -1 },
  tag: { color: kiteColors.accent, fontSize: 16, fontWeight: "600" },
});
