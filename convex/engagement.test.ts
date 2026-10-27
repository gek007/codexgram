import { expect, test } from "vitest";
import { convexTest } from "convex-test";
import schema from "./schema";
import { api } from "./_generated/api";
const modules = import.meta.glob("./**/*.ts");
test("likes and comments are idempotent, owned and notify once without self notifications", async () => {
  const t = convexTest(schema, modules);
  const a = t.withIdentity({ subject: "a" });
  const b = t.withIdentity({ subject: "b" });
  const aid = await a.mutation(api.users.ensureCurrent, {});
  await b.mutation(api.users.ensureCurrent, {});
  const communityId = await a.mutation(api.communities.create, {
    name: "Photos",
    handle: "photos",
    description: "",
    accent: "#6841D9",
  });
  await b.mutation(api.communities.join, { communityId });
  const assetId = await t.run(async (ctx) =>
    ctx.db.insert("mediaAssets", {
      ownerId: aid,
      storageId: await ctx.storage.store(new Blob(["photo"])),
      requestId: "a",
      purpose: "post",
      state: "pending",
      bytes: 100,
      width: 100,
      height: 100,
      expiresAt: Date.now() + 86400000,
    }),
  );
  const postId = await a.mutation(api.posts.create, {
    communityId,
    assetId,
    requestId: "a",
  });
  await a.mutation(api.likes.set, { postId, liked: true });
  expect(
    (
      await a.query(api.notifications.list, {
        paginationOpts: { cursor: null, numItems: 30 },
      })
    ).page,
  ).toHaveLength(0);
  await b.mutation(api.likes.set, { postId, liked: true });
  await b.mutation(api.likes.set, { postId, liked: true });
  await b.mutation(api.likes.set, { postId, liked: false });
  await b.mutation(api.likes.set, { postId, liked: true });
  expect(
    (
      await a.query(api.notifications.list, {
        paginationOpts: { cursor: null, numItems: 30 },
      })
    ).page,
  ).toHaveLength(1);
  const commentId = await b.mutation(api.comments.create, {
    postId,
    text: "Lovely",
    requestId: "comment-1",
  });
  expect(
    await b.mutation(api.comments.create, {
      postId,
      text: "Lovely",
      requestId: "comment-1",
    }),
  ).toBe(commentId);
  await expect(
    a.mutation(api.comments.update, { commentId, text: "Hijacked" }),
  ).rejects.toThrow("FORBIDDEN");
  await b.mutation(api.comments.update, { commentId, text: "Lovely photo" });
  const notes = await a.query(api.notifications.list, {
    paginationOpts: { cursor: null, numItems: 30 },
  });
  expect(notes.page).toHaveLength(2);
  expect(notes.page.find((n) => n.kind === "comment")).toMatchObject({
    commentText: "Lovely photo",
    photoUrl: expect.any(String),
  });
  await expect(
    b.mutation(api.notifications.markRead, {
      notificationId: notes.page[0].id,
    }),
  ).rejects.toThrow("FORBIDDEN");
  const post = await t.run((ctx) => ctx.db.get(postId));
  expect(post).toMatchObject({ likeCount: 2, commentCount: 1 });
  await t.run(async (ctx) =>
    ctx.db.insert("blocks", {
      userId: aid,
      blockedId: (await ctx.db
        .query("users")
        .withIndex("by_clerk", (q) => q.eq("clerkId", "b"))
        .unique())!._id,
    }),
  );
  expect(
    (
      await a.query(api.comments.list, {
        postId,
        paginationOpts: { cursor: null, numItems: 30 },
      })
    ).page,
  ).toHaveLength(0);
  expect(
    (
      await a.query(api.notifications.list, {
        paginationOpts: { cursor: null, numItems: 30 },
      })
    ).page,
  ).toHaveLength(0);
  await expect(
    b.mutation(api.likes.set, { postId, liked: false }),
  ).rejects.toThrow("BLOCKED");
});
