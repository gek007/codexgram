import photo from "./test-photo.json";
import { expect, test } from "vitest";
import { convexTest } from "convex-test";
import schema from "./schema";
import { api, internal } from "./_generated/api";
const modules = import.meta.glob("./**/*.ts");
const jpeg = Uint8Array.from(atob(photo.base64), (c) => c.charCodeAt(0));
test("authenticated upload validates bytes and binds media to its uploader", async () => {
  const t = convexTest(schema, modules);
  const alice = t.withIdentity({ subject: "alice" });
  await alice.mutation(api.users.ensureCurrent, {});
  expect(
    (await t.fetch("/media/upload", { method: "POST", body: jpeg })).status,
  ).toBe(401);
  expect(
    (
      await alice.fetch("/media/upload?requestId=bad&purpose=post", {
        method: "POST",
        headers: { "Content-Type": "image/jpeg" },
        body: new Uint8Array([1, 2, 3]),
      })
    ).status,
  ).toBe(400);
  const response = await alice.fetch(
    "/media/upload?requestId=photo1&purpose=post",
    { method: "POST", headers: { "Content-Type": "image/jpeg" }, body: jpeg },
  );
  expect(response.status).toBe(200);
  const { assetId } = await response.json();
  const asset = await t.run((ctx) => ctx.db.get(assetId));
  expect(asset).toMatchObject({ state: "pending", width: 100, height: 100 });
  const retry = await alice.fetch(
    "/media/upload?requestId=photo1&purpose=post",
    { method: "POST", headers: { "Content-Type": "image/jpeg" }, body: jpeg },
  );
  expect((await retry.json()).assetId).toBe(assetId);
  await expect(
    alice.mutation(internal.media.reserve, {
      requestId: "invalid",
      purpose: "post",
      bytes: 6 * 1024 * 1024,
      width: 100,
      height: 100,
    }),
  ).rejects.toThrow("UPLOAD_REJECTED");
});
