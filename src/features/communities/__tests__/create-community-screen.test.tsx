import React from "react";
import { test, expect, jest } from "@jest/globals";
import { render, fireEvent } from "@testing-library/react-native";
import { CreateCommunityScreen } from "../create-community-screen";
const mockCreate = jest
  .fn<(...args: unknown[]) => Promise<string>>()
  .mockResolvedValue("community1");
let mockOnboardingComplete = true;
const mockReplace = jest.fn();
jest.mock("@/providers/session", () => ({
  useSession: () => ({ user: { onboardingComplete: mockOnboardingComplete } }),
}));
jest.mock("convex/react", () => ({ useMutation: () => mockCreate }));
jest.mock("expo-router", () => ({
  Stack: { Screen: () => null },
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
  expect(await screen.findByText("Your community is ready.")).toBeOnTheScreen();
  expect(mockReplace).not.toHaveBeenCalled();
  await fireEvent.press(
    screen.getByRole("button", { name: "Go to community" }),
  );
  expect(mockReplace).toHaveBeenCalledWith({
    pathname: "/community/[communityId]",
    params: { communityId: "community1" },
  });
});

test("a rejected creation keeps the form and never displays success", async () => {
  mockReplace.mockClear();
  mockCreate.mockRejectedValueOnce(new Error("Unable to create community"));
  const screen = await render(<CreateCommunityScreen />);
  await fireEvent.changeText(
    screen.getByLabelText("Community name"),
    "QA community",
  );
  await fireEvent.changeText(
    screen.getByLabelText("Community handle"),
    "qa_community",
  );
  await fireEvent.press(
    screen.getByRole("button", { name: "Create community" }),
  );
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Could not complete that action. Check your connection and try again.",
  );
  expect(screen.queryByText("Your community is ready.")).toBeNull();
  expect(mockReplace).not.toHaveBeenCalled();
});

test("onboarding creation resumes setup instead of entering the protected composer", async () => {
  mockReplace.mockClear();
  mockOnboardingComplete = false;
  try {
    const screen = await render(<CreateCommunityScreen />);
    await fireEvent.changeText(
      screen.getByLabelText("Community name"),
      "New community",
    );
    await fireEvent.changeText(
      screen.getByLabelText("Community handle"),
      "new_community",
    );
    await fireEvent.press(
      screen.getByRole("button", { name: "Create community" }),
    );
    expect(
      await screen.findByRole("button", { name: "Continue setup" }),
    ).toBeOnTheScreen();
    expect(screen.queryByRole("button", { name: "Share a photo" })).toBeNull();
    await fireEvent.press(
      screen.getByRole("button", { name: "Continue setup" }),
    );
    expect(mockReplace).toHaveBeenCalledWith("/(onboarding)/communities");
  } finally {
    mockOnboardingComplete = true;
  }
});

test("completed accounts can share into the community returned by creation", async () => {
  mockReplace.mockClear();
  const screen = await render(<CreateCommunityScreen />);
  await fireEvent.changeText(
    screen.getByLabelText("Community name"),
    "QA Photos",
  );
  await fireEvent.changeText(
    screen.getByLabelText("Community handle"),
    "qa_photos",
  );
  await fireEvent.press(
    screen.getByRole("button", { name: "Create community" }),
  );
  await fireEvent.press(
    await screen.findByRole("button", { name: "Share a photo" }),
  );
  expect(mockReplace).toHaveBeenCalledWith({
    pathname: "/compose",
    params: { communityId: "community1" },
  });
});
