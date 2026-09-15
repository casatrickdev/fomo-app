import { kiteSpacing } from "@kite/ui";
import { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { kiteApi } from "../../lib/api";
import { useSession } from "../../store/session";
import { Field, Muted, PrimaryButton, Screen, Title } from "../../ui/primitives";

export function OnboardingScreen() {
  const setUser = useSession((state) => state.setUser);
  const setPromptNotifications = useSession((state) => state.setPromptNotifications);
  const [handle, setHandle] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      const user = await kiteApi.updateProfile({
        handle: handle.trim().toLowerCase(),
        displayName: displayName.trim(),
        bio: bio.trim(),
      });
      setUser(user);
      setPromptNotifications(true);
    } catch (error) {
      Alert.alert("Could not save profile", error instanceof Error ? error.message : "Try another handle");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen style={styles.wrap}>
      <View style={{ gap: 12 }}>
        <Title>Claim your handle</Title>
        <Muted>This is how other flyers find you on the feed and leaderboard.</Muted>
      </View>
      <Field label="Handle" value={handle} onChangeText={setHandle} placeholder="luna_flow" />
      <Field
        label="Display name"
        value={displayName}
        onChangeText={setDisplayName}
        placeholder="Luna"
        autoCapitalize="words"
      />
      <Field label="Bio" value={bio} onChangeText={setBio} placeholder="Short note on how you trade" />
      <PrimaryButton
        label="Continue"
        onPress={() => void submit()}
        loading={loading}
        disabled={handle.length < 3 || displayName.length < 1}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { justifyContent: "center", gap: kiteSpacing.lg, paddingTop: 80 },
});
