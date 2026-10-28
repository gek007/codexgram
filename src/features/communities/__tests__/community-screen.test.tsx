import React from "react";
import { test, expect, jest } from "@jest/globals";
import { render, fireEvent } from "@testing-library/react-native";
import { CommunityScreen } from "../community-screen";
import type { Id } from "../../../../convex/_generated/dataModel";
jest.mock(
  "react-native-safe-area-context",
  () =>
    jest.requireActual<
      typeof import("react-native-safe-area-context/jest/mock")
    >("react-native-safe-area-context/jest/mock").default,
);
let mockJoined = true;
jest.mock("convex/react", () => ({
  useQuery: () => ({
    name: "Photography",
    handle: "photography",
    accent: "#5B36E8",
    joined: mockJoined,
    canPost: mockJoined,
    canModerate: false,
  }),
  useMutation: () => jest.fn(),
}));
jest.mock("expo-router", () => ({
  router: { back: jest.fn(), push: jest.fn() },
}));
jest.mock("@expo/vector-icons", () => ({ Feather: () => null }));
jest.mock("@/features/feed/feed-screen", () => {
  const { Text } =
    jest.requireActual<typeof import("react-native")>("react-native");
  return {
    FeedList: ({
      header,
      hideItems,
    }: {
      header: React.ReactNode;
      hideItems: boolean;
    }) => (
      <>
        {header}
        {!hideItems && <Text>Visible community posts</Text>}
      </>
    ),
  };
});
test("About retains membership controls and Posts returns to the community feed", async () => {
  const screen = await render(
    <CommunityScreen communityId={"community1" as Id<"communities">} />,
  );
  expect(screen.getByText("Visible community posts")).toBeOnTheScreen();
  expect(screen.queryByRole("button", { name: "Leave community" })).toBeNull();
  await fireEvent.press(screen.getByRole("tab", { name: "About" }));
  expect(screen.queryByText("Visible community posts")).toBeNull();
  expect(
    screen.getByRole("button", { name: "Leave community" }),
  ).toBeOnTheScreen();
  await fireEvent.press(screen.getByRole("tab", { name: "Posts" }));
  expect(screen.getByText("Visible community posts")).toBeOnTheScreen();
});

test("leaving while on About immediately restores the public posts view", async () => {
  const element = (
    <CommunityScreen communityId={"community1" as Id<"communities">} />
  );
  const screen = await render(element);
  await fireEvent.press(screen.getByRole("tab", { name: "About" }));
  mockJoined = false;
  try {
    await screen.rerender(
      <CommunityScreen communityId={"community1" as Id<"communities">} />,
    );
    expect(screen.getByText("Visible community posts")).toBeOnTheScreen();
    expect(
      screen.getByRole("button", { name: "Join community" }),
    ).toBeOnTheScreen();
  } finally {
    mockJoined = true;
  }
});
