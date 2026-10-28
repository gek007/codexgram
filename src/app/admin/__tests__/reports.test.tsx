import React from "react";
import { Alert } from "react-native";
import { test, expect, jest } from "@jest/globals";
import { render, fireEvent, act } from "@testing-library/react-native";
import Reports from "../reports";
const mockResolve = jest
  .fn<(...args: unknown[]) => Promise<void>>()
  .mockRejectedValue(new Error("Offline"));
jest.mock("convex/react", () => ({
  usePaginatedQuery: () => ({
    results: [
      {
        id: "report1",
        targetType: "post",
        reason: "Spam",
        text: "Reported photo",
      },
    ],
    status: "Exhausted",
  }),
  useMutation: () => mockResolve,
}));
jest.mock("@/providers/session", () => ({
  useSession: () => ({ user: { isAdmin: true } }),
}));
jest.mock("@expo/vector-icons", () => ({ Feather: () => null }));
test("a failed moderation decision explains the failure inside the open review", async () => {
  const alert = jest.spyOn(Alert, "alert").mockImplementation(() => {});
  try {
    const screen = await render(<Reports />);
    await fireEvent.press(
      screen.getByRole("button", { name: "Review post report: Spam" }),
    );
    await fireEvent.press(
      screen.getByRole("button", { name: "Dismiss report" }),
    );
    const confirm = alert.mock.calls[0]?.[2]?.find(
      (button) => button.text === "Confirm",
    );
    await act(async () => {
      confirm?.onPress?.();
    });
    expect(await screen.findByRole("alert")).toBeOnTheScreen();
    expect(
      screen.getByRole("header", { name: "Review report" }),
    ).toBeOnTheScreen();
  } finally {
    alert.mockRestore();
  }
});
