import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import { requireUser, fail } from "./lib/auth";
import { charge } from "./lib/limits";
const purpose = v.union(v.literal("post"), v.literal("avatar"));
export const reserve = internalMutation({
  args: {
    requestId: v.string(),
    purpose,
    bytes: v.number(),
    width: v.number(),
    height: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    if (
      !/^[a-zA-Z0-9_-]{1,80}$/.test(args.requestId) ||
      args.bytes > 5 * 1024 * 1024 ||
      args.bytes < 12 ||
      ![args.width, args.height].every(
        (n) => Number.isInteger(n) && n > 0 && n <= 1600,
      )
    )
      return fail("UPLOAD_REJECTED");
    const old = await ctx.db
      .query("mediaAssets")
      .withIndex("by_request", (q) =>
        q.eq("ownerId", user._id).eq("requestId", args.requestId),
      )
      .unique();
    if (old) {
      if (
        old.purpose !== args.purpose ||
        old.bytes !== args.bytes ||
        old.width !== args.width ||
        old.height !== args.height
      )
        return fail("UPLOAD_REJECTED");
      if (old.state === "uploading") return fail("UPLOAD_IN_PROGRESS");
      if (old.state === "deleting") return fail("UPLOAD_REJECTED");
      return { id: old._id, existing: true };
    }
    await charge(ctx, user._id, args.purpose === "post" ? "photos" : "avatars");
    const id = await ctx.db.insert("mediaAssets", {
      ownerId: user._id,
      ...args,
      state: "uploading",
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });
    return { id, existing: false };
  },
});
export const finish = internalMutation({
  args: { assetId: v.id("mediaAssets"), storageId: v.id("_storage") },
  handler: async (ctx, { assetId, storageId }) => {
    const user = await requireUser(ctx);
    const asset = await ctx.db.get(assetId);
    if (!asset || asset.ownerId !== user._id || asset.state !== "uploading")
      return fail("UPLOAD_REJECTED");
    await ctx.db.patch(assetId, { storageId, state: "pending" });
  },
});
export const cancel = internalMutation({
  args: { assetId: v.id("mediaAssets") },
  handler: async (ctx, { assetId }) => {
    const user = await requireUser(ctx);
    const asset = await ctx.db.get(assetId);
    if (asset?.ownerId === user._id && asset.state === "uploading")
      await ctx.db.delete(assetId);
  },
});
export const deleteAsset = internalMutation({
  args: { assetId: v.id("mediaAssets") },
  handler: async (ctx, { assetId }) => {
    const asset = await ctx.db.get(assetId);
    if (!asset || asset.state !== "deleting") return;
    if (asset.storageId) await ctx.storage.delete(asset.storageId);
    await ctx.db.delete(assetId);
  },
});
