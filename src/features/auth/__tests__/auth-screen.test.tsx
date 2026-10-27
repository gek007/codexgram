import React from "react";
import { test, expect, jest } from "@jest/globals";
import { render, fireEvent } from "@testing-library/react-native";
import { AuthScreen } from "../auth-screen";
const mockSubmitPassword = jest
  .fn<(...args: unknown[]) => Promise<{ error: null }>>()
  .mockResolvedValue({ error: null });
const mockOk = () => Promise.resolve({ error: null });
jest.mock("@clerk/expo", () => ({
  useSignIn: () => ({
    signIn: {
      create: mockOk,
      resetPasswordEmailCode: {
        sendCode: mockOk,
        verifyCode: mockOk,
        submitPassword: mockSubmitPassword,
      },
    },
    fetchStatus: "idle",
  }),
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

test("a password mismatch cannot submit the reset and preserves the form", async () => {
  const screen = await render(<AuthScreen />);
  await fireEvent.press(
    screen.getByRole("button", { name: "I have an account" }),
  );
  await fireEvent.press(
    screen.getByRole("button", { name: "Forgot password?" }),
  );
  await fireEvent.changeText(screen.getByLabelText("Email"), "qa@example.com");
  await fireEvent.press(
    screen.getByRole("button", { name: "Send reset code" }),
  );
  await fireEvent.changeText(
    await screen.findByLabelText("Verification code"),
    "123456",
  );
  await fireEvent.press(screen.getByRole("button", { name: "Verify" }));
  await fireEvent.changeText(
    await screen.findByLabelText("New password"),
    "new-password-123",
  );
  await fireEvent.changeText(
    screen.getByLabelText("Confirm password"),
    "different-password",
  );
  await fireEvent.press(screen.getByRole("button", { name: "Save password" }));
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Passwords don’t match.",
  );
  expect(mockSubmitPassword).not.toHaveBeenCalled();
  expect(screen.getByLabelText("New password")).toBeOnTheScreen();
});
