import React from "react";
import { test, expect, jest } from "@jest/globals";
import { render, fireEvent, act } from "@testing-library/react-native";
import { ComposerScreen } from "../composer-screen";
import { ComposerHeader } from "../composer-navigation";
const mockBack = jest.fn();
jest.mock("@expo/vector-icons", () => ({ Feather: () => null }));
jest.mock("expo-router", () => ({
  router: {
    back: () => mockBack(),
    replace: (...args: unknown[]) => mockReplace(...args),
  },
  usePreventRemove: (busy: boolean) => mockPreventRemove(busy),
  Stack: {
    Screen: ({ options }: { options: { headerLeft: () => React.ReactNode } }) =>
      options.headerLeft(),
  },
}));
test("publishing prevents the new close control from leaving the composer", async () => {
  const screen = await render(<ComposerHeader busy />);
  await fireEvent.press(screen.getByRole("button", { name: "Close composer" }));
  expect(mockBack).not.toHaveBeenCalled();
  expect(screen.getByRole("button", { name: "Close composer" })).toBeDisabled();
  await screen.rerender(<ComposerHeader busy={false} />);
  await fireEvent.press(screen.getByRole("button", { name: "Close composer" }));
  expect(mockBack).toHaveBeenCalledTimes(1);
});

const mockPublish = jest.fn<(...args: unknown[]) => Promise<string>>();
const mockReplace = jest.fn();
const mockDisableRemoval = jest.fn();
const mockPreventRemove = jest.fn((_busy: boolean) => mockDisableRemoval);
jest.mock("@clerk/expo", () => ({ useAuth: () => ({ getToken: jest.fn() }) }));
jest.mock("@/providers/session", () => ({
  useSession: () => ({ user: { id: "owner1" } }),
}));
jest.mock("convex/react", () => ({
  useMutation: () => jest.fn(),
  useQuery: () => undefined,
  useConvex: () => ({ query: jest.fn() }),
  usePaginatedQuery: () => ({
    results: [{ id: "community1", name: "Photos", accent: "#5B36E8" }],
    status: "Exhausted",
  }),
}));
jest.mock("expo-crypto", () => ({ randomUUID: () => "request1" }));
jest.mock("../draft-store", () => ({
  loadDraft: () =>
    Promise.resolve({
      version: 1,
      ownerId: "owner1",
      requestId: "request1",
      communityId: "community1",
      caption: "QA",
      localPhotoUri: "file:///qa.jpg",
      width: 100,
      height: 100,
      updatedAt: 0,
    }),
  saveDraft: () => Promise.resolve(),
  clearDraft: () => Promise.resolve(),
}));
jest.mock("../publish-flow", () => ({
  publishDraft: (...args: unknown[]) => mockPublish(...args),
}));
jest.mock("../upload", () => ({ uploadPhoto: jest.fn() }));
jest.mock("../media", () => ({ selectPhoto: jest.fn() }));
jest.mock("../photo-editor", () => ({ PhotoEditor: () => null }));

test("a deferred publish locks dismissal until the result is ready to navigate", async () => {
  mockBack.mockClear();
  mockReplace.mockClear();
  mockPreventRemove.mockClear();
  mockDisableRemoval.mockClear();
  let complete!: (id: string) => void;
  mockPublish.mockImplementationOnce(
    () =>
      new Promise<string>((resolve) => {
        complete = resolve;
      }),
  );
  const screen = await render(<ComposerScreen />);
  await fireEvent.press(
    await screen.findByRole("button", { name: "Publish photo" }),
  );
  expect(mockPublish).toHaveBeenCalledTimes(1);
  expect(mockPreventRemove).toHaveBeenLastCalledWith(true);
  await fireEvent.press(screen.getByRole("button", { name: "Close composer" }));
  expect(mockBack).not.toHaveBeenCalled();
  expect(mockReplace).not.toHaveBeenCalled();
  await act(async () => complete("post1"));
  expect(mockDisableRemoval).toHaveBeenCalledTimes(1);
  expect(mockReplace).toHaveBeenCalledWith({
    pathname: "/post/[postId]",
    params: { postId: "post1" },
  });
});
