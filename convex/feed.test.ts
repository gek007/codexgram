import { expect, test } from "vitest";
import { convexTest } from "convex-test";
import schema from "./schema";
import { api } from "./_generated/api";
const modules = import.meta.glob("./**/*.ts");
test("home filters unjoined topics without falsely ending pagination; block hides direct/profile access", async () => {
  const t = convexTest(schema, modules);
  const alice = t.withIdentity({ subject: "alice" });
  const bob = t.withIdentity({ subject: "bob" });
  const a = await alice.mutation(api.users.ensureCurrent, {});
  const b = await bob.mutation(api.users.ensureCurrent, {});
  const joined = await alice.mutation(api.communities.create, {
    name: "Joined",
    handle: "joined",
    description: "",
    accent: "#6841D9",
  });
  const other = await bob.mutation(api.communities.create, {
    name: "Other",
    handle: "other",
    description: "",
    accent: "#6841D9",
  });
  const create = async (authorId: typeof a, communityId: typeof joined) =>
    t.run(async (ctx) => {
      const assetId = await ctx.db.insert("mediaAssets", {
        ownerId: authorId,
        storageId: await ctx.storage.store(new Blob(["photo"])),
        requestId: crypto.randomUUID(),
        purpose: "post",
        state: "attached",
        bytes: 100,
        width: 100,
        height: 100,
        expiresAt: 0,
      });
      return ctx.db.insert("posts", {
        authorId,
        communityId,
        assetId,
        caption: "photo",
        requestId: crypto.randomUUID(),
        revision: 0,
        status: "active",
        likeCount: 0,
        commentCount: 0,
      });
    });
  await create(a, joined);
  await create(b, other);
  const p = await create(b, other);
  const first = await alice.query(api.feed.home, {
    paginationOpts: { cursor: null, numItems: 1 },
  });
  expect(first.page).toHaveLength(0);
  expect(first.isDone).toBe(false);
  const next = await alice.query(api.feed.home, {
    paginationOpts: { cursor: first.continueCursor, numItems: 2 },
  });
  expect(next.page).toHaveLength(1);
  expect(await alice.query(api.posts.get, { postId: p })).not.toBeNull();
  await t.run((ctx) => ctx.db.insert("blocks", { userId: b, blockedId: a }));
  expect(await alice.query(api.posts.get, { postId: p })).toBeNull();
  expect(await alice.query(api.users.profile, { userId: b })).toBeNull();
  expect(
    (
      await alice.query(api.feed.profile, {
        userId: b,
        paginationOpts: { cursor: null, numItems: 20 },
      })
    ).page,
  ).toHaveLength(0);
});
