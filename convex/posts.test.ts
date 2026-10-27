import { expect, test, vi } from "vitest";
import { convexTest } from "convex-test";
import schema from "./schema";
import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
const modules = import.meta.glob("./**/*.ts");
test("publishing requires membership, owns its media and charges at most once per request", async () => {
  const t = convexTest(schema, modules);
  const alice = t.withIdentity({ subject: "alice" });
  const bob = t.withIdentity({ subject: "bob" });
  const userId = await alice.mutation(api.users.ensureCurrent, {});
  await bob.mutation(api.users.ensureCurrent, {});
  const communityId = await alice.mutation(api.communities.create, {
    name: "Photos",
    handle: "photos",
    description: "",
    accent: "#6841D9",
  });
  const asset = () =>
    t.run(async (ctx) =>
      ctx.db.insert("mediaAssets", {
        ownerId: userId,
        storageId: await ctx.storage.store(new Blob(["image"])),
        requestId: crypto.randomUUID(),
        purpose: "post",
        state: "pending",
        bytes: 100,
        width: 100,
        height: 100,
        expiresAt: Date.now() + 86400000,
      }),
    );
  const assetId = await asset();
  const input = {
    communityId,
    assetId,
    caption: "One moment",
    requestId: "post-one",
  };
  await expect(bob.mutation(api.posts.create, input)).rejects.toThrow();
  const postId = await alice.mutation(api.posts.create, input);
  expect(await alice.mutation(api.posts.create, input)).toBe(postId);
  await expect(
    alice.mutation(api.posts.create, { ...input, requestId: "reuse-media" }),
  ).rejects.toThrow("UPLOAD_REJECTED");
  for (let i = 1; i < 10; i++)
    await alice.mutation(api.posts.create, {
      communityId,
      assetId: await asset(),
      requestId: `post-${i}`,
    });
  await alice.mutation(api.posts.remove, { postId });
  await expect(
    alice.mutation(api.posts.create, {
      communityId,
      assetId: await asset(),
      requestId: "eleventh",
    }),
  ).rejects.toThrow("QUOTA_EXCEEDED");
  const usage = await t.run((ctx) => ctx.db.query("dailyUsage").first());
  expect(usage?.posts).toBe(10);
  const future = Date.now() + 86400000;
  vi.spyOn(Date, "now").mockReturnValue(future);
  try {
    expect(
      await alice.mutation(api.posts.create, {
        communityId,
        assetId: await asset(),
        requestId: "tomorrow",
      }),
    ).toBeTruthy();
  } finally {
    vi.restoreAllMocks();
  }
});
test("replacement keeps the post identity and counts; stale or foreign edits reject", async () => {
  const t = convexTest(schema, modules);
  const alice = t.withIdentity({ subject: "alice" });
  const userId = await alice.mutation(api.users.ensureCurrent, {});
  const communityId = await alice.mutation(api.communities.create, {
    name: "Photos",
    handle: "photos",
    description: "",
    accent: "#6841D9",
  });
  const asset = () =>
    t.run(async (ctx) =>
      ctx.db.insert("mediaAssets", {
        ownerId: userId,
        storageId: await ctx.storage.store(new Blob(["img"])),
        requestId: crypto.randomUUID(),
        purpose: "post",
        state: "pending",
        bytes: 100,
        width: 100,
        height: 100,
        expiresAt: Date.now() + 86400000,
      }),
    );
  const postId = await alice.mutation(api.posts.create, {
    communityId,
    assetId: await asset(),
    requestId: "new",
  });
  await alice.mutation(api.posts.update, {
    postId,
    assetId: await asset(),
    caption: "Edited",
    expectedRevision: 0,
  });
  const post = await t.run((ctx) => ctx.db.get(postId));
  expect(post).toMatchObject({
    caption: "Edited",
    revision: 1,
    likeCount: 0,
    commentCount: 0,
  });
  expect(post?.editedAt).toBeTypeOf("number");
  await expect(
    alice.mutation(api.posts.update, {
      postId,
      caption: "stale",
      expectedRevision: 0,
    }),
  ).rejects.toThrow("CONFLICT");
  const bob = t.withIdentity({ subject: "bob" });
  await bob.mutation(api.users.ensureCurrent, {});
  await expect(
    bob.mutation(api.posts.update, {
      postId,
      caption: "hijack",
      expectedRevision: 1,
    }),
  ).rejects.toThrow("FORBIDDEN");
});
