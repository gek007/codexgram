import { expect, test } from "vitest";
import { convexTest } from "convex-test";
import schema from "./schema";
import { api } from "./_generated/api";
const modules = import.meta.glob("./**/*.ts");
test("unique normalized names, creator membership and onboarding rules", async () => {
  const t = convexTest(schema, modules);
  const alice = t.withIdentity({ subject: "alice" });
  const bob = t.withIdentity({ subject: "bob" });
  await alice.mutation(api.users.ensureCurrent, {});
  await bob.mutation(api.users.ensureCurrent, {});
  await alice.mutation(api.users.setUsername, { username: "Alice" });
  await expect(
    bob.mutation(api.users.setUsername, { username: "ALICE" }),
  ).rejects.toThrow("USERNAME_TAKEN");
  await expect(
    alice.mutation(api.users.completeOnboarding, {}),
  ).rejects.toThrow();
  const communityId = await alice.mutation(api.communities.create, {
    name: "Street photography",
    handle: "street",
    description: "Your city, your lens",
    accent: "#6841D9",
  });
  await expect(
    bob.mutation(api.communities.create, {
      name: "Other",
      handle: "STREET",
      description: "",
      accent: "#6841D9",
    }),
  ).rejects.toThrow("HANDLE_TAKEN");
  expect(
    (await alice.query(api.communities.get, { communityId }))?.joined,
  ).toBe(true);
  await expect(
    alice.mutation(api.communities.leave, { communityId }),
  ).rejects.toThrow("FORBIDDEN");
  await alice.mutation(api.users.completeOnboarding, {});
  await bob.mutation(api.communities.join, { communityId });
  await bob.mutation(api.communities.join, { communityId });
  expect(
    await t.run((ctx) => ctx.db.query("memberships").collect()),
  ).toHaveLength(2);
  const list = await bob.query(api.communities.list, {
    paginationOpts: { cursor: null, numItems: 10 },
  });
  expect(list.page).toHaveLength(1);
});
