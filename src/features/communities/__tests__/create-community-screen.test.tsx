import React from "react";
import { test, expect, jest } from "@jest/globals";
import { render, fireEvent } from "@testing-library/react-native";
import { CreateCommunityScreen } from "../create-community-screen";
const mockCreate = jest
  .fn<(...args: unknown[]) => Promise<string>>()
  .mockResolvedValue("community1");
const mockReplace = jest.fn();
jest.mock("convex/react", () => ({ useMutation: () => mockCreate }));
jest.mock("expo-router", () => ({
  router: { replace: (...args: unknown[]) => mockReplace(...args) },
}));
jest.mock("@expo/vector-icons", () => ({ Feather: () => null }));
test("invalid community handles stay in the form without sending a mutation", async () => {
  const screen = await render(<CreateCommunityScreen />);
  await fireEvent.changeText(
    screen.getByLabelText("Community name"),
    "Photography",
  );
  for (const invalid of ["", "@photography", "photo club", "ab"]) {
    await fireEvent.changeText(
      screen.getByLabelText("Community handle"),
      invalid,
    );
    await fireEvent.press(
      screen.getByRole("button", { name: "Create community" }),
    );
    expect(
      screen.getByText(
        "Use 3–24 letters, numbers or underscores. Don’t include @ or spaces.",
      ),
    ).toBeOnTheScreen();
    expect(mockCreate).not.toHaveBeenCalled();
  }
  await fireEvent.changeText(
    screen.getByLabelText("Community handle"),
    " Photography_1 ",
  );
  await fireEvent.press(
    screen.getByRole("button", { name: "Create community" }),
  );
  expect(mockCreate).toHaveBeenCalledTimes(1);
  expect(mockCreate).toHaveBeenCalledWith({
    name: "Photography",
    handle: "photography_1",
    description: "",
    accent: "#5B36E8",
  });
  expect(mockReplace).toHaveBeenCalledWith({
    pathname: "/community/[communityId]",
    params: { communityId: "community1" },
  });
});
