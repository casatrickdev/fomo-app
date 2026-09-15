import { kiteSpacing } from "@kite/ui";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { kiteApi } from "../../lib/api";
import type { AuthStackParamList } from "../../navigation/types";
import { Field, Muted, PrimaryButton, Screen, Title } from "../../ui/primitives";

type Nav = NativeStackNavigationProp<AuthStackParamList, "SignIn">;

export function SignInScreen() {
  const navigation = useNavigation<Nav>();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      const result = await kiteApi.requestOtp(email.trim());
      navigation.navigate("VerifyOtp", { email: email.trim(), devCode: result.devCode });
    } catch (error) {
      Alert.alert("Could not send code", error instanceof Error ? error.message : "Try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen style={styles.wrap} withTopInset={false}>
      <View style={{ gap: 12 }}>
        <Title>Sign in to Kite</Title>
        <Muted>
          Email a one-time code. No passwords, no seed phrases — wallets are provisioned on the server after you
          verify.
        </Muted>
      </View>
      <Field
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        placeholder="you@domain.com"
      />
      <PrimaryButton label="Send code" onPress={() => void submit()} loading={loading} disabled={!email.includes("@")} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { justifyContent: "center", gap: kiteSpacing.xl },
});
