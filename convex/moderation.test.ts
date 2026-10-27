import { expect, test } from "vitest";
import { convexTest } from "convex-test";
import schema from "./schema";
import { api } from "./_generated/api";
const modules = import.meta.glob("./**/*.ts");
test("creator permissions are scoped; blocking is mutual and bans reject new interactions", async () => {
  const t = convexTest(schema, modules);
  const a = t.withIdentity({ subject: "a" });
  const b = t.withIdentity({ subject: "b" });
  const aid = await a.mutation(api.users.ensureCurrent, {});
  const bid = await b.mutation(api.users.ensureCurrent, {});
  const communityId = await a.mutation(api.communities.create, {
    name: "Photos",
    handle: "photos",
    description: "",
    accent: "#6841D9",
  });
  await b.mutation(api.communities.join, { communityId });
  await expect(
    b.mutation(api.moderation.ban, { communityId, userId: aid }),
  ).rejects.toThrow("FORBIDDEN");
  await expect(
    a.mutation(api.moderation.ban, { communityId, userId: aid }),
  ).rejects.toThrow("FORBIDDEN");
  await expect(
    a.mutation(api.moderation.block, { userId: aid }),
  ).rejects.toThrow("FORBIDDEN");
  await a.mutation(api.moderation.block, { userId: bid });
  expect(await b.query(api.users.profile, { userId: aid })).toBeNull();
  expect(await a.query(api.users.profile, { userId: bid })).toBeNull();
  await a.mutation(api.moderation.unblock, { userId: bid });
  expect(await a.query(api.users.profile, { userId: bid })).not.toBeNull();
  await a.mutation(api.moderation.ban, { communityId, userId: bid });
  await expect(
    b.mutation(api.communities.join, { communityId }),
  ).rejects.toThrow("BANNED");
  await a.mutation(api.moderation.unban, { communityId, userId: bid });
  await b.mutation(api.communities.join, { communityId });
  await expect(
    b.query(api.moderation.listReports, {
      paginationOpts: { cursor: null, numItems: 20 },
    }),
  ).rejects.toThrow("FORBIDDEN");
});
