import { expect, test } from "vitest";
import { convexTest } from "convex-test";
import schema from "./schema";
import { api } from "./_generated/api";
const modules = import.meta.glob("./**/*.ts");
test("identity upsert is authenticated, idempotent and independent of email", async () => {
  const t = convexTest(schema, modules);
  await expect(t.mutation(api.users.ensureCurrent, {})).rejects.toThrow();
  const alice = t.withIdentity({
    issuer: "https://test.clerk.accounts.dev",
    subject: "alice",
    email: "same@example.com",
  });
  const first = await alice.mutation(api.users.ensureCurrent, {});
  expect(await alice.mutation(api.users.ensureCurrent, {})).toBe(first);
  const bob = t.withIdentity({
    issuer: "https://test.clerk.accounts.dev",
    subject: "bob",
    email: "same@example.com",
  });
  expect(await bob.mutation(api.users.ensureCurrent, {})).not.toBe(first);
  await t.run((ctx) => ctx.db.patch(first, { status: "suspended" }));
  await expect(alice.mutation(api.users.ensureCurrent, {})).rejects.toThrow(
    "ACCOUNT_UNAVAILABLE",
  );
});
