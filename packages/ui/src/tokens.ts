/**
 * Kite visual identity.
 * Deep indigo night sky + amber kite fabric + cyan tail streamer.
 * Intentionally distinct from typical purple/green trading-app palettes.
 */
export const kiteColors = {
  bg: "#070A12",
  bgElevated: "#0E1424",
  surface: "#151C31",
  surfaceHover: "#1C2540",
  border: "#2A3557",
  text: "#F4F1EA",
  textMuted: "#8B93A7",
  accent: "#FFC857",
  accentDim: "#C4922A",
  stream: "#3DDCFF",
  buy: "#3DDCFF",
  sell: "#FF6B8A",
  danger: "#FF5A5A",
  success: "#7CFFB1",
  overlay: "rgba(7, 10, 18, 0.72)",
} as const;

export const kiteSpacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 40,
} as const;

export const kiteRadii = {
  sm: 8,
  md: 14,
  lg: 22,
  pill: 999,
} as const;

export const kiteTypography = {
  display: { fontSize: 32, fontWeight: "700" as const, letterSpacing: -0.8 },
  title: { fontSize: 22, fontWeight: "700" as const, letterSpacing: -0.4 },
  body: { fontSize: 16, fontWeight: "500" as const },
  caption: { fontSize: 13, fontWeight: "500" as const, letterSpacing: 0.2 },
  mono: { fontSize: 13, fontWeight: "600" as const, letterSpacing: 0.4 },
} as const;

export const kiteShadow = {
  glow: {
    shadowColor: "#FFC857",
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
} as const;

export type KiteColors = typeof kiteColors;
