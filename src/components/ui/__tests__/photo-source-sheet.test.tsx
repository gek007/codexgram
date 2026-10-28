import React from "react";
import { Platform } from "react-native";
import { test, expect, jest } from "@jest/globals";
import { render, fireEvent, act } from "@testing-library/react-native";
import { PhotoSourceSheet } from "../photo-source-sheet";
jest.mock("@expo/vector-icons", () => ({ Feather: () => null }));
let mockDismiss: (() => void) | undefined;
jest.mock("../sheet", () => ({
  Sheet: ({
    onDismiss,
    children,
  }: {
    onDismiss?: () => void;
    children: React.ReactNode;
  }) => {
    mockDismiss = onDismiss;
    return children;
  },
}));
test("iOS waits for the source sheet to dismiss before launching the picker", async () => {
  expect(Platform.OS).toBe("ios");
  const select = jest.fn();
  const close = jest.fn();
  const screen = await render(
    <PhotoSourceSheet onClose={close} onSelect={select} />,
  );
  await fireEvent.press(
    screen.getByRole("button", { name: "Choose from library" }),
  );
  expect(select).not.toHaveBeenCalled();
  expect(close).not.toHaveBeenCalled();
  // Model the native iOS dismissal completion, not a fixed animation timeout.
  await act(() => mockDismiss?.());
  expect(close).toHaveBeenCalledTimes(1);
  expect(select).toHaveBeenCalledWith(false);
  await act(() => mockDismiss?.());
  expect(select).toHaveBeenCalledTimes(1);
});

test("cancel dismisses the sheet without choosing a camera or library", async () => {
  const select = jest.fn();
  const close = jest.fn();
  const screen = await render(
    <PhotoSourceSheet onClose={close} onSelect={select} />,
  );
  await fireEvent.press(screen.getByRole("button", { name: "Cancel" }));
  expect(select).not.toHaveBeenCalled();
  await act(() => mockDismiss?.());
  expect(close).toHaveBeenCalledTimes(1);
  expect(select).not.toHaveBeenCalled();
});

test("Android launches the selected source without waiting for the iOS-only event", async () => {
  const os = jest.replaceProperty(Platform, "OS", "android");
  try {
    const select = jest.fn();
    const close = jest.fn();
    const screen = await render(
      <PhotoSourceSheet onClose={close} onSelect={select} />,
    );
    await fireEvent.press(screen.getByRole("button", { name: "Take a photo" }));
    expect(close).toHaveBeenCalledTimes(1);
    expect(select).toHaveBeenCalledWith(true);
    await act(() => mockDismiss?.());
    expect(select).toHaveBeenCalledTimes(1);
  } finally {
    os.restore();
  }
});
