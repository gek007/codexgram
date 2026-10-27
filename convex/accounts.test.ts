import { expect, test, vi } from "vitest";
import { convexTest } from "convex-test";
import schema from "./schema";
import { api, internal } from "./_generated/api";
const modules = import.meta.glob("./**/*.ts");
test("deletion immediately disables writes, is idempotent and cleans up in bounded batches", async () => {
  const t = convexTest(schema, modules);
  const a = t.withIdentity({ subject: "a" });
  const userId = await a.mutation(api.users.ensureCurrent, {});
  const communityId = await a.mutation(api.communities.create, {
    name: "My community",
    handle: "community",
    description: "",
    accent: "#6841D9",
  });
  const jobId = await a.mutation(api.accounts.requestDeletion, {});
  expect(await a.mutation(api.accounts.requestDeletion, {})).toBe(jobId);
  await expect(
    a.mutation(api.communities.join, { communityId }),
  ).rejects.toThrow("ACCOUNT_UNAVAILABLE");
  for (let i = 0; i < 25; i++) {
    const job = await t.run((ctx) => ctx.db.get(jobId));
    if (job?.state !== "pending") break;
    await t.mutation(internal.accounts.runDeletionBatch, { jobId });
  }
  const job = await t.run((ctx) => ctx.db.get(jobId));
  expect(job?.state).toBe("clerk");
  expect(await t.run((ctx) => ctx.db.get(communityId))).toMatchObject({
    status: "archived",
  });
  expect(
    await t.run((ctx) => ctx.db.query("memberships").collect()),
  ).toHaveLength(0);
  expect(await t.run((ctx) => ctx.db.get(userId))).toMatchObject({
    status: "deleting",
  });
  const previous = process.env.CLERK_SECRET_KEY;
  process.env.CLERK_SECRET_KEY = "sk_test_fixture";
  const fetcher = vi
    .spyOn(globalThis, "fetch")
    .mockResolvedValue(new Response("", { status: 404 }));
  try {
    await t.action(internal.accounts.deleteClerkIdentity, { jobId });
    expect((await t.run((ctx) => ctx.db.get(jobId)))?.state).toBe("complete");
    expect((await t.run((ctx) => ctx.db.get(userId)))?.status).toBe("deleted");
  } finally {
    fetcher.mockRestore();
    if (previous) process.env.CLERK_SECRET_KEY = previous;
    else delete process.env.CLERK_SECRET_KEY;
  }
});
test("unsigned external account deletion is rejected", async () => {
  const t = convexTest(schema, modules);
  const response = await t.fetch("/clerk/webhook", {
    method: "POST",
    body: JSON.stringify({ type: "user.deleted", data: { id: "a" } }),
  });
  expect([401, 503]).toContain(response.status);
});
