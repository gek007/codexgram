import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { mutation, query } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { requireUser, fail, isAdmin } from "./lib/auth";
import { requireCanInteract, canViewAuthor } from "./lib/access";
import { text } from "./lib/validation";
import { recordNotification } from "./notifications";
import { postView } from "./posts";
export const create = mutation({
  args: { postId: v.id("posts"), text: v.string(), requestId: v.string() },
  handler: async (ctx, args) => {
    const { viewer, post } = await requireCanInteract(ctx, args.postId);
    const content = text(args.text, 1000, true);
    if (args.requestId.length > 80 || !args.requestId)
      return fail("VALIDATION");
    const old = await ctx.db
      .query("comments")
      .withIndex("by_request", (q) =>
        q.eq("authorId", viewer._id).eq("requestId", args.requestId),
      )
      .unique();
    if (old) {
      if (old.postId !== post._id || old.text !== content)
        return fail("CONFLICT");
      return old._id;
    }
    const id = await ctx.db.insert("comments", {
      authorId: viewer._id,
      postId: post._id,
      text: content,
      requestId: args.requestId,
      status: "active",
    });
    await ctx.db.patch(post._id, { commentCount: post.commentCount + 1 });
    await recordNotification(ctx, {
      recipientId: post.authorId,
      actorId: viewer._id,
      postId: post._id,
      commentId: id,
      kind: "comment",
      eventKey: `comment:${id}`,
    });
    return id;
  },
});
export const update = mutation({
  args: { commentId: v.id("comments"), text: v.string() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const comment = await ctx.db.get(args.commentId);
    if (!comment || comment.status !== "active") return fail("NOT_FOUND");
    if (comment.authorId !== user._id) return fail("FORBIDDEN");
    await requireCanInteract(ctx, comment.postId);
    await ctx.db.patch(comment._id, {
      text: text(args.text, 1000, true),
      editedAt: Date.now(),
    });
  },
});
export async function removeComment(
  ctx: MutationCtx,
  comment: Doc<"comments">,
) {
  if (comment.status !== "active") return;
  await ctx.db.patch(comment._id, { status: "deleted" });
  const post = await ctx.db.get(comment.postId);
  if (post)
    await ctx.db.patch(post._id, {
      commentCount: Math.max(0, post.commentCount - 1),
    });
}
export const remove = mutation({
  args: { commentId: v.id("comments") },
  handler: async (ctx, { commentId }) => {
    const user = await requireUser(ctx);
    const comment = await ctx.db.get(commentId);
    if (!comment) return;
    if (comment.authorId !== user._id) return fail("FORBIDDEN");
    await removeComment(ctx, comment);
  },
});
export const list = query({
  args: { postId: v.id("posts"), paginationOpts: paginationOptsValidator },
  handler: async (ctx, { postId, paginationOpts }) => {
    const user = await requireUser(ctx);
    const post = await ctx.db.get(postId);
    if (!post || !(await postView(ctx, user._id, post)))
      return { page: [], continueCursor: "", isDone: true };
    const community = await ctx.db.get(post.communityId);
    const result = await ctx.db
      .query("comments")
      .withIndex("by_post", (q) =>
        q.eq("postId", postId).eq("status", "active"),
      )
      .order("asc")
      .paginate({
        ...paginationOpts,
        numItems: Math.min(30, paginationOpts.numItems),
      });
    const comments = await Promise.all(
      result.page.map(async (c) => {
        if (!(await canViewAuthor(ctx, user._id, c.authorId))) return null;
        const author = await ctx.db.get(c.authorId);
        return {
          id: c._id,
          authorId: c.authorId,
          username: author?.username ?? "member",
          text: c.text,
          createdAt: c._creationTime,
          editedAt: c.editedAt,
          canEdit: c.authorId === user._id,
          canModerate: community?.creatorId === user._id || isAdmin(user),
        };
      }),
    );
    return { ...result, page: comments.filter((c) => c !== null) };
  },
});
