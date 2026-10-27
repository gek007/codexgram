import { expect, test } from "vitest";
import { makeEditInput } from "./edit-input";
test("an edit sends its persisted base revision and rejects a draft with no base", () => {
  const draft = {
    version: 1 as const,
    ownerId: "alice",
    postId: "post",
    communityId: "community",
    requestId: "edit-id",
    caption: "My old draft",
    expectedRevision: 3,
    updatedAt: 1,
  };
  expect(makeEditInput(draft)).toMatchObject({
    expectedRevision: 3,
    requestId: "edit-id",
    caption: "My old draft",
  });
  expect(() =>
    makeEditInput({ ...draft, expectedRevision: undefined }),
  ).toThrow("CONFLICT");
});
