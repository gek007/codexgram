import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
export const orphanMedia = internalMutation({
  args: {},
  handler: async (ctx) => {
    for (const state of ["pending", "uploading", "deleting"] as const) {
      const rows = await ctx.db
        .query("mediaAssets")
        .withIndex("by_state_expiry", (q) =>
          q.eq("state", state).lt("expiresAt", Date.now()),
        )
        .take(50);
      for (const asset of rows) {
        await ctx.db.patch(asset._id, { state: "deleting" });
        await ctx.scheduler.runAfter(0, internal.media.deleteAsset, {
          assetId: asset._id,
        });
      }
    }
  },
});
export const cleanupPost = internalMutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, { postId }) => {
    const post = await ctx.db.get(postId);
    if (post?.status === "active") return;
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_post", (q) => q.eq("postId", postId))
      .take(50);
    const likes = await ctx.db
      .query("likes")
      .withIndex("by_post", (q) => q.eq("postId", postId))
      .take(50);
    const notes = await ctx.db
      .query("notifications")
      .withIndex("by_post", (q) => q.eq("postId", postId))
      .take(50);
    for (const row of [...comments, ...likes, ...notes])
      await ctx.db.delete(row._id);
    if (comments.length === 50 || likes.length === 50 || notes.length === 50)
      await ctx.scheduler.runAfter(0, internal.maintenance.cleanupPost, {
        postId,
      });
  },
});
