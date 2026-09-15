import { kiteColors } from "@kite/ui";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { useSession } from "../store/session";
import { SplashScreen } from "../screens/auth/SplashScreen";
import { SignInScreen } from "../screens/auth/SignInScreen";
import { VerifyOtpScreen } from "../screens/auth/VerifyOtpScreen";
import { OnboardingScreen } from "../screens/auth/OnboardingScreen";
import { NotificationsScreen } from "../screens/auth/NotificationsScreen";
import { MainNavigator } from "./MainNavigator";
import type { AuthStackParamList } from "./types";

const Auth = createNativeStackNavigator<AuthStackParamList>();

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: kiteColors.bg,
    card: kiteColors.bg,
    text: kiteColors.text,
    border: kiteColors.border,
    primary: kiteColors.accent,
  },
};

function AuthNavigator() {
  return (
    <Auth.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: kiteColors.bg },
        headerTintColor: kiteColors.text,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: kiteColors.bg },
      }}
    >
      <Auth.Screen name="SignIn" component={SignInScreen} options={{ title: "Welcome" }} />
      <Auth.Screen name="VerifyOtp" component={VerifyOtpScreen} options={{ title: "Verify" }} />
    </Auth.Navigator>
  );
}

export function RootNavigator() {
  const { user, hydrated, promptNotifications } = useSession();

  return (
    <NavigationContainer theme={theme}>
      <StatusBar style="light" />
      {!hydrated ? (
        <SplashScreen />
      ) : !user ? (
        <AuthNavigator />
      ) : !user.onboardingComplete ? (
        <OnboardingScreen />
      ) : promptNotifications ? (
        <NotificationsScreen />
      ) : (
        <MainNavigator />
      )}
    </NavigationContainer>
  );
}
