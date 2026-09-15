export type AuthStackParamList = {
  SignIn: undefined;
  VerifyOtp: { email: string; devCode?: string };
};

export type MainStackParamList = {
  Tabs: undefined;
  Trader: { handle: string };
  Token: { symbol: string; address: string };
};

export type TabsParamList = {
  Home: undefined;
  Leaderboard: undefined;
  Portfolio: undefined;
  Alerts: undefined;
  Me: undefined;
};
