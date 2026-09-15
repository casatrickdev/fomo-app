import { kiteColors } from "@kite/ui";
import { Image, StyleSheet, Text, View } from "react-native";

export function Avatar({ uri, handle, size = 40 }: { uri?: string | null; handle: string; size?: number }) {
  const initial = handle.slice(0, 1).toUpperCase();
  return (
    <View style={[styles.wrap, { width: size, height: size, borderRadius: size / 2 }]}>
      {uri ? (
        <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2 }} />
      ) : (
        <Text style={[styles.initial, { fontSize: size * 0.4 }]}>{initial}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: kiteColors.surfaceHover,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: kiteColors.border,
  },
  initial: {
    color: kiteColors.accent,
    fontWeight: "700",
  },
});
