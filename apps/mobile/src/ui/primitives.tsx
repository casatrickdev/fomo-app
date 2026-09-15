import { kiteColors, kiteRadii, kiteSpacing, kiteTypography } from "@kite/ui";
import { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function Screen({
  children,
  style,
  withTopInset = true,
}: {
  children: ReactNode;
  style?: ViewStyle;
  withTopInset?: boolean;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.screen,
        { paddingTop: withTopInset ? Math.max(insets.top, 12) : 12, paddingBottom: insets.bottom },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function Title({ children }: { children: ReactNode }) {
  return <Text style={styles.title}>{children}</Text>;
}

export function Muted({ children, center }: { children: ReactNode; center?: boolean }) {
  return <Text style={[styles.muted, center ? styles.center : null]}>{children}</Text>;
}

export function PrimaryButton({
  label,
  onPress,
  loading,
  disabled,
}: {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [styles.primary, (disabled || loading) && styles.disabled, pressed && styles.pressed]}
    >
      {loading ? <ActivityIndicator color={kiteColors.bg} /> : <Text style={styles.primaryLabel}>{label}</Text>}
    </Pressable>
  );
}

export function GhostButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.ghost}>
      <Text style={styles.ghostLabel}>{label}</Text>
    </Pressable>
  );
}

export function Field({ label, ...inputProps }: { label: string } & TextInputProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        placeholderTextColor={kiteColors.textMuted}
        style={styles.input}
        autoCapitalize="none"
        autoCorrect={false}
        {...inputProps}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: kiteColors.bg,
    paddingHorizontal: kiteSpacing.xl,
  },
  title: {
    ...kiteTypography.display,
    color: kiteColors.text,
  },
  muted: {
    ...kiteTypography.body,
    color: kiteColors.textMuted,
    lineHeight: 22,
  },
  center: { textAlign: "center" },
  primary: {
    backgroundColor: kiteColors.accent,
    borderRadius: kiteRadii.md,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryLabel: {
    color: kiteColors.bg,
    fontSize: 16,
    fontWeight: "700",
  },
  disabled: { opacity: 0.5 },
  pressed: { transform: [{ scale: 0.98 }] },
  ghost: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  ghostLabel: {
    color: kiteColors.stream,
    fontSize: 15,
    fontWeight: "600",
  },
  field: { gap: 8 },
  fieldLabel: {
    ...kiteTypography.caption,
    color: kiteColors.textMuted,
    textTransform: "uppercase",
  },
  input: {
    backgroundColor: kiteColors.surface,
    borderColor: kiteColors.border,
    borderWidth: 1,
    borderRadius: kiteRadii.md,
    color: kiteColors.text,
    paddingHorizontal: 14,
    minHeight: 52,
    fontSize: 16,
  },
});
