import { kiteSpacing } from "@kite/ui";
import * as Notifications from "expo-notifications";
import { StyleSheet, View } from "react-native";
import { useSession } from "../../store/session";
import { GhostButton, Muted, PrimaryButton, Screen, Title } from "../../ui/primitives";

export function NotificationsScreen() {
  const setPromptNotifications = useSession((state) => state.setPromptNotifications);

  const finish = () => setPromptNotifications(false);

  const request = async () => {
    await Notifications.requestPermissionsAsync();
    finish();
  };

  return (
    <Screen style={styles.wrap}>
      <View style={{ gap: 12 }}>
        <Title>Stay in the wind</Title>
        <Muted>
          Kite can ping you when people you follow trade, when a price level hits, or when a whale prints. You can
          change this later.
        </Muted>
      </View>
      <PrimaryButton label="Enable alerts" onPress={() => void request()} />
      <GhostButton label="Not now" onPress={finish} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { justifyContent: "center", gap: kiteSpacing.lg },
});
