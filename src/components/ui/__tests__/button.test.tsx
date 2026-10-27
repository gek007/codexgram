import { test, expect, jest } from "@jest/globals";
import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { Button } from "../button";

test("enabled action fires once; disabled and loading actions cannot submit", async () => {
  const onPress = jest.fn();
  const screen = await render(<Button label="Publish" onPress={onPress} />);
  await fireEvent.press(screen.getByRole("button", { name: "Publish" }));
  expect(onPress).toHaveBeenCalledTimes(1);
  await screen.rerender(<Button label="Publish" onPress={onPress} loading />);
  expect(screen.getByRole("button", { name: "Publish" })).toBeDisabled();
  await fireEvent.press(screen.getByRole("button", { name: "Publish" }));
  await screen.rerender(<Button label="Publish" onPress={onPress} disabled />);
  await fireEvent.press(screen.getByRole("button", { name: "Publish" }));
  expect(onPress).toHaveBeenCalledTimes(1);
});
