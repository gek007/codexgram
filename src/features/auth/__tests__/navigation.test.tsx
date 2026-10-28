import React from "react";
import { test, expect, jest } from "@jest/globals";
import { Text } from "react-native";
import { renderRouter, screen } from "expo-router/testing-library";
import RootLayout from "@/app/_layout";
import Index from "@/app/index";
import AuthLayout from "@/app/(auth)/_layout";
import TabsLayout from "@/app/(tabs)/_layout";
const mockUser = {
  id: "user",
  status: "active",
  onboardingComplete: false,
  username: undefined,
};
jest.mock("@clerk/expo", () => ({
  useAuth: () => ({
    isLoaded: true,
    isSignedIn: true,
    signOut: () => Promise.resolve(),
  }),
}));
jest.mock("@/providers/session", () => ({
  useSession: () => ({
    user: mockUser,
    loading: false,
    error: null,
    retry: () => {},
  }),
}));
jest.mock("@/providers/app-providers", () => ({
  AppProviders: ({ children }: { children: React.ReactNode }) => children,
}));
async function renderApp(initialUrl = "/") {
  await renderRouter(
    {
      _layout: RootLayout,
      index: Index,
      account: Index,
      "(auth)/_layout": AuthLayout,
      "(auth)/sign-in": Index,
      "(tabs)/_layout": TabsLayout,
      "(tabs)/index": () => <Text>Home feed</Text>,
      "(tabs)/discover": () => null,
      "(tabs)/notifications": () => null,
      "(tabs)/profile": () => null,
      "(onboarding)/username": () => <Text>Choose a username</Text>,
      "(onboarding)/communities": () => null,
      continue: () => null,
      "community/create": () => null,
      "community/[communityId]": () => null,
      compose: () => null,
      "post/[postId]": () => null,
      "post/edit/[postId]": () => null,
      "user/[userId]": () => null,
      "settings/index": () => null,
      "settings/blocked": () => null,
      "admin/reports": () => null,
    },
    { initialUrl },
  );
}
test("an authenticated new user reaches username onboarding without a redirect cycle", async () => {
  await renderApp();
  expect(screen.getByText("Choose a username")).toBeOnTheScreen();
});
test("a suspended session opening a protected tab reaches account status", async () => {
  mockUser.status = "suspended";
  await renderApp("/(tabs)");
  expect(screen.getByText("Account unavailable")).toBeOnTheScreen();
});
