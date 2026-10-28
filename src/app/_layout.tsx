import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AppProviders } from "@/providers/app-providers";
import { useTheme } from "@/theme/theme-provider";
import { useSession } from "@/providers/session";
export { ErrorBoundary } from "expo-router";
function Navigation() {
  const { colors, dark } = useTheme();
  const { user } = useSession();
  return (
    <>
      <StatusBar style={dark ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          contentStyle: { backgroundColor: colors.background },
          headerShadowVisible: false,
          headerBackButtonDisplayMode: "minimal",
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="continue" options={{ headerShown: false }} />
        <Stack.Protected guard={user?.status === "active"} redirectTo="/">
          <Stack.Screen name="(onboarding)/username" options={{ title: "" }} />
          <Stack.Screen
            name="(onboarding)/communities"
            options={{ title: "" }}
          />
          <Stack.Screen name="community/create" options={{ title: "" }} />
          <Stack.Screen
            name="community/[communityId]"
            options={{ headerShown: false }}
          />
        </Stack.Protected>
        <Stack.Protected
          guard={user?.status === "active" && !!user.onboardingComplete}
          redirectTo="/"
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="compose"
            options={{ title: "New post", presentation: "modal" }}
          />
          <Stack.Screen name="post/[postId]" options={{ title: "Post" }} />
          <Stack.Screen
            name="post/edit/[postId]"
            options={{ title: "Edit post" }}
          />
          <Stack.Screen name="user/[userId]" options={{ title: "Profile" }} />
          <Stack.Screen name="settings/index" options={{ title: "Settings" }} />
          <Stack.Screen
            name="settings/profile"
            options={{ title: "Edit profile" }}
          />
          <Stack.Screen
            name="settings/blocked"
            options={{ title: "Blocked accounts" }}
          />
          <Stack.Screen
            name="admin/reports"
            options={{ title: "Report inbox" }}
          />
        </Stack.Protected>
      </Stack>
    </>
  );
}
export default function RootLayout() {
  return (
    <AppProviders>
      <Navigation />
    </AppProviders>
  );
}
