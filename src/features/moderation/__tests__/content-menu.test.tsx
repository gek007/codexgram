import React from "react";
import { test, expect, jest } from "@jest/globals";
import { fireEvent, render } from "@testing-library/react-native";
import type { Id } from "../../../../convex/_generated/dataModel";
import { ContentMenu } from "../content-menu";
const mockMutation = jest
  .fn<(...args: unknown[]) => Promise<void>>()
  .mockResolvedValue(undefined);
jest.mock("convex/react", () => ({ useMutation: () => mockMutation }));
jest.mock("@expo/vector-icons", () => ({ Feather: () => null }));
test("a report requires a reason and confirms the selected content was sent", async () => {
  const screen = await render(
    <ContentMenu
      target={{ type: "post", id: "post1" as Id<"posts"> }}
      authorId={"author1" as Id<"users">}
      onDone={jest.fn()}
    />,
  );
  await fireEvent.press(screen.getByRole("button", { name: "Report post" }));
  expect(screen.getByRole("button", { name: "Send report" })).toBeDisabled();
  await fireEvent.press(screen.getByRole("radio", { name: "Spam" }));
  await fireEvent.press(screen.getByRole("button", { name: "Send report" }));
  expect(mockMutation).toHaveBeenCalledTimes(1);
  expect(mockMutation).toHaveBeenCalledWith({
    target: { type: "post", id: "post1" },
    reason: "Spam",
  });
  expect(
    screen.getByRole("header", { name: "Thanks for letting us know." }),
  ).toBeOnTheScreen();
});
