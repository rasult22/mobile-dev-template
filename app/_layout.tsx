import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar, useColorScheme } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import queryClient from "../queries/index";

export default function RootLayout() {
  const isDarkMode = useColorScheme() === "dark";

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
        <Stack />;
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
