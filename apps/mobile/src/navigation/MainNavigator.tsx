import { kiteColors } from "@kite/ui";
import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HomeFeedScreen } from "../screens/home/HomeFeedScreen";
import { LeaderboardScreen } from "../screens/leaderboard/LeaderboardScreen";
import { AlertsScreen } from "../screens/alerts/AlertsScreen";
import { PortfolioScreen } from "../screens/portfolio/PortfolioScreen";
import { MeScreen } from "../screens/profile/MeScreen";
import { TraderProfileScreen } from "../screens/profile/TraderProfileScreen";
import { TokenDetailScreen } from "../screens/token/TokenDetailScreen";
import type { MainStackParamList, TabsParamList } from "./types";

const Tab = createBottomTabNavigator<TabsParamList>();
const Stack = createNativeStackNavigator<MainStackParamList>();

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: kiteColors.bgElevated, borderTopColor: kiteColors.border },
        tabBarActiveTintColor: kiteColors.accent,
        tabBarInactiveTintColor: kiteColors.textMuted,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeFeedScreen}
        options={{ tabBarIcon: ({ color, size }) => <Ionicons name="pulse-outline" color={color} size={size} /> }}
      />
      <Tab.Screen
        name="Leaderboard"
        component={LeaderboardScreen}
        options={{ tabBarIcon: ({ color, size }) => <Ionicons name="podium" color={color} size={size} /> }}
      />
      <Tab.Screen
        name="Portfolio"
        component={PortfolioScreen}
        options={{ tabBarIcon: ({ color, size }) => <Ionicons name="wallet" color={color} size={size} /> }}
      />
      <Tab.Screen
        name="Alerts"
        component={AlertsScreen}
        options={{ tabBarIcon: ({ color, size }) => <Ionicons name="notifications" color={color} size={size} /> }}
      />
      <Tab.Screen
        name="Me"
        component={MeScreen}
        options={{ tabBarIcon: ({ color, size }) => <Ionicons name="person" color={color} size={size} /> }}
      />
    </Tab.Navigator>
  );
}

export function MainNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: kiteColors.bg },
        headerTintColor: kiteColors.text,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: kiteColors.bg },
      }}
    >
      <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
      <Stack.Screen name="Trader" component={TraderProfileScreen} options={{ title: "Trader" }} />
      <Stack.Screen name="Token" component={TokenDetailScreen} options={{ title: "Token" }} />
    </Stack.Navigator>
  );
}
