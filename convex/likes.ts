import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { requireCanInteract } from "./lib/access";
import { recordNotification } from "./notifications";
export const set = mutation({
  args: { postId: v.id("posts"), liked: v.boolean() },
  handler: async (ctx, { postId, liked }) => {
    const { viewer, post } = await requireCanInteract(ctx, postId);
    const old = await ctx.db
      .query("likes")
      .withIndex("by_pair", (q) =>
        q.eq("userId", viewer._id).eq("postId", postId),
      )
      .unique();
    if (liked && !old) {
      await ctx.db.insert("likes", { userId: viewer._id, postId });
      await ctx.db.patch(postId, { likeCount: post.likeCount + 1 });
      await recordNotification(ctx, {
        recipientId: post.authorId,
        actorId: viewer._id,
        postId,
        kind: "like",
        eventKey: `like:${viewer._id}:${postId}`,
      });
    } else if (!liked && old) {
      await ctx.db.delete(old._id);
      await ctx.db.patch(postId, {
        likeCount: Math.max(0, post.likeCount - 1),
      });
    }
  },
});
