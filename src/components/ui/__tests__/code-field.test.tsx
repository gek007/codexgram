import React from "react";
import { test, expect, jest } from "@jest/globals";
import { render, fireEvent } from "@testing-library/react-native";
import { CodeField } from "../code-field";
test("verification keeps a single editable input and accepts pasted numeric codes", async () => {
  const change = jest.fn();
  const screen = await render(<CodeField value="12" onChangeText={change} />);
  const input = screen.getByLabelText("Verification code");
  expect(input).toHaveProp("value", "12");
  await fireEvent.changeText(input, "12 34-56");
  expect(change).toHaveBeenCalledWith("123456");
});
