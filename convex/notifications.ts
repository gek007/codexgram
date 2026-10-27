import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { fail, requireUser } from "./lib/auth";
import { canViewAuthor } from "./lib/access";
import { postView } from "./posts";
export async function recordNotification(
  ctx: MutationCtx,
  args: {
    recipientId: Id<"users">;
    actorId: Id<"users">;
    postId: Id<"posts">;
    commentId?: Id<"comments">;
    kind: "like" | "comment";
    eventKey: string;
  },
) {
  if (args.recipientId === args.actorId) return;
  if (
    await ctx.db
      .query("notifications")
      .withIndex("by_event", (q) => q.eq("eventKey", args.eventKey))
      .unique()
  )
    return;
  await ctx.db.insert("notifications", args);
}
export const list = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, { paginationOpts }) => {
    const user = await requireUser(ctx);
    const result = await ctx.db
      .query("notifications")
      .withIndex("by_recipient", (q) => q.eq("recipientId", user._id))
      .order("desc")
      .paginate({
        ...paginationOpts,
        numItems: Math.min(30, paginationOpts.numItems),
      });
    const notes = await Promise.all(
      result.page.map(async (n) => {
        if (!(await canViewAuthor(ctx, user._id, n.actorId))) return null;
        const post = await ctx.db.get(n.postId);
        if (!post || !(await postView(ctx, user._id, post))) return null;
        const comment = n.commentId ? await ctx.db.get(n.commentId) : null;
        if (n.commentId && comment?.status !== "active") return null;
        const actor = await ctx.db.get(n.actorId);
        return {
          id: n._id,
          kind: n.kind,
          actorUsername: actor?.username ?? "member",
          postId: n.postId,
          createdAt: n._creationTime,
          readAt: n.readAt,
        };
      }),
    );
    return { ...result, page: notes.filter((n) => n !== null) };
  },
});
export const markRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, { notificationId }) => {
    const user = await requireUser(ctx);
    const note = await ctx.db.get(notificationId);
    if (!note || note.recipientId !== user._id) return fail("FORBIDDEN");
    if (!note.readAt) await ctx.db.patch(note._id, { readAt: Date.now() });
  },
});
