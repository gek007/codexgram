import React from "react";
import { test, expect, jest } from "@jest/globals";
import { render, fireEvent } from "@testing-library/react-native";
import { AuthScreen } from "../auth-screen";
jest.mock("@clerk/expo", () => ({
  useSignIn: () => ({ signIn: {}, fetchStatus: "idle" }),
  useSignUp: () => ({ signUp: {}, fetchStatus: "idle" }),
  useSSO: () => ({ startSSOFlow: jest.fn() }),
}));
jest.mock("@expo/vector-icons", () => ({ Feather: () => null }));
jest.mock("expo-router", () => ({ router: { replace: jest.fn() } }));
jest.mock("expo-auth-session", () => ({ makeRedirectUri: jest.fn() }));
test("welcome offers separate new and returning account paths with social sign-in", async () => {
  const screen = await render(<AuthScreen />);
  await fireEvent.press(screen.getByRole("button", { name: "Get started" }));
  expect(
    screen.getByRole("header", { name: "Make room for your perspective." }),
  ).toBeOnTheScreen();
  expect(screen.getByLabelText("Email")).toBeOnTheScreen();
  expect(
    screen.getByRole("button", { name: "Continue with Google" }),
  ).toBeOnTheScreen();
  expect(
    screen.getByRole("button", { name: "Continue with Facebook" }),
  ).toBeOnTheScreen();
  await fireEvent.press(
    screen.getByRole("button", { name: "Already have an account? Sign in" }),
  );
  expect(
    screen.getByRole("header", { name: "Good to see you." }),
  ).toBeOnTheScreen();
  expect(
    screen.getByRole("button", { name: "Forgot password?" }),
  ).toBeOnTheScreen();
});
