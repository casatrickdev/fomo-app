import { kiteColors, kiteSpacing } from "@kite/ui";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { kiteApi } from "../../lib/api";
import { useSession } from "../../store/session";
import type { AuthStackParamList } from "../../navigation/types";
import { Field, Muted, PrimaryButton, Screen, Title } from "../../ui/primitives";

type R = RouteProp<AuthStackParamList, "VerifyOtp">;

export function VerifyOtpScreen() {
  const { params } = useRoute<R>();
  const signIn = useSession((state) => state.signIn);
  const [code, setCode] = useState(params.devCode ?? "");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      const session = await kiteApi.verifyOtp(params.email, code.trim());
      await signIn(session.user, session.accessToken, session.refreshToken);
    } catch (error) {
      Alert.alert("Code did not match", error instanceof Error ? error.message : "Try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen style={styles.wrap} withTopInset={false}>
      <View style={{ gap: 12 }}>
        <Title>Enter the code</Title>
        <Muted>Sent to {params.email}. In local development the API may echo the code so you can skip a mailer.</Muted>
        {params.devCode ? <Text style={styles.dev}>dev code {params.devCode}</Text> : null}
      </View>
      <Field
        label="6-digit code"
        value={code}
        onChangeText={setCode}
        keyboardType="number-pad"
        maxLength={6}
        placeholder="000000"
      />
      <PrimaryButton label="Verify" onPress={() => void submit()} loading={loading} disabled={code.length !== 6} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { justifyContent: "center", gap: kiteSpacing.xl },
  dev: { color: kiteColors.stream, fontWeight: "700" },
});
