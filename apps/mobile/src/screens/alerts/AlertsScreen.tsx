import { kiteSpacing } from "@kite/ui";
import { StyleSheet } from "react-native";
import { Muted, Screen, Title } from "../../ui/primitives";

export function AlertsScreen() {
  return (
    <Screen style={styles.wrap}>
      <Title>Alerts</Title>
      <Muted>
        Followed-trader prints, price milestones, listings, and whale alerts will appear here. Preferences are stored
        per user on the API (`NotificationPreference`).
      </Muted>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingTop: 24, gap: kiteSpacing.md },
});
