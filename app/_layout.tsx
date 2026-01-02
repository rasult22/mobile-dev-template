import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import queryClient from "../queries/index";
import { TimerProvider } from "../store/timerContext";
import { colors } from "../constants/theme";

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <TimerProvider>
        <SafeAreaProvider>
          <StatusBar barStyle="light-content" backgroundColor={colors.background} />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.background },
            }}
          />
        </SafeAreaProvider>
      </TimerProvider>
    </QueryClientProvider>
  );
}
