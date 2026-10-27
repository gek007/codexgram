import { expect, test } from "vitest";
import { createDraftRepository, type DraftStorage } from "./draft-repository";
test("draft serialization survives restart and isolates accounts", async () => {
  const files = new Map<string, string>();
  const storage: DraftStorage = {
    read: async (key) => files.get(key) ?? null,
    write: async (key, value) => {
      files.set(key, value);
    },
    remove: async (key) => {
      files.delete(key);
    },
  };
  const first = createDraftRepository(storage);
  await first.save({
    version: 1,
    ownerId: "alice",
    requestId: "attempt1",
    caption: "Still here",
    localPhotoUri: "file:///documents/alice/photo.jpg",
    updatedAt: 1,
  });
  const restarted = createDraftRepository(storage);
  expect((await restarted.load("alice"))?.caption).toBe("Still here");
  expect(await restarted.load("bob")).toBeNull();
  await restarted.clear("alice");
  expect(await first.load("alice")).toBeNull();
});
test("corrupt or foreign draft cannot be restored as the current user", async () => {
  const storage: DraftStorage = {
    read: async () =>
      JSON.stringify({ version: 1, ownerId: "bob", caption: "other" }),
    write: async () => {},
    remove: async () => {},
  };
  expect(await createDraftRepository(storage).load("alice")).toBeNull();
});

test("new-post drafts and different edit targets cannot overwrite each other", async () => {
  const files = new Map<string, string>();
  const storage: DraftStorage = {
    read: async (key) => files.get(key) ?? null,
    write: async (key, value) => {
      files.set(key, value);
    },
    remove: async (key) => {
      files.delete(key);
    },
  };
  const repo = createDraftRepository(storage);
  await repo.save({
    version: 1,
    ownerId: "alice",
    requestId: "new",
    caption: "Unsent photo",
    updatedAt: 1,
  });
  await repo.save({
    version: 1,
    ownerId: "alice",
    postId: "post-a",
    requestId: "edit",
    caption: "Editing old photo",
    expectedRevision: 4,
    updatedAt: 2,
  });
  expect((await repo.load("alice"))?.caption).toBe("Unsent photo");
  expect((await repo.load("alice", "post-a"))?.expectedRevision).toBe(4);
  await repo.clear("alice", "post-a");
  expect((await repo.load("alice"))?.caption).toBe("Unsent photo");
});
