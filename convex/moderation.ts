import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { Id, Doc } from "./_generated/dataModel";
import { requireUser, fail, isAdmin } from "./lib/auth";
import { text } from "./lib/validation";
import { removePost } from "./posts";
import { removeComment } from "./comments";
const target = v.union(
  v.object({ type: v.literal("post"), id: v.id("posts") }),
  v.object({ type: v.literal("comment"), id: v.id("comments") }),
  v.object({ type: v.literal("user"), id: v.id("users") }),
);
export const block = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const user = await requireUser(ctx);
    if (user._id === userId) return fail("FORBIDDEN");
    if (!(await ctx.db.get(userId))) return fail("NOT_FOUND");
    if (
      !(await ctx.db
        .query("blocks")
        .withIndex("by_pair", (q) =>
          q.eq("userId", user._id).eq("blockedId", userId),
        )
        .unique())
    )
      await ctx.db.insert("blocks", { userId: user._id, blockedId: userId });
  },
});
export const unblock = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const user = await requireUser(ctx);
    const row = await ctx.db
      .query("blocks")
      .withIndex("by_pair", (q) =>
        q.eq("userId", user._id).eq("blockedId", userId),
      )
      .unique();
    if (row) await ctx.db.delete(row._id);
  },
});
export const blocked = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, { paginationOpts }) => {
    const user = await requireUser(ctx);
    const result = await ctx.db
      .query("blocks")
      .withIndex("by_pair", (q) => q.eq("userId", user._id))
      .paginate({
        ...paginationOpts,
        numItems: Math.min(30, paginationOpts.numItems),
      });
    const rows = await Promise.all(
      result.page.map(async (b) => {
        const blocked = await ctx.db.get(b.blockedId);
        return blocked
          ? {
              id: blocked._id,
              username: blocked.username ?? "Deleted member",
              bio: "",
              avatarUrl: null,
              isMe: false,
            }
          : null;
      }),
    );
    return { ...result, page: rows.filter((r) => r !== null) };
  },
});
async function creator(
  ctx: MutationCtx | QueryCtx,
  communityId: Id<"communities">,
) {
  const user = await requireUser(ctx);
  const community = await ctx.db.get(communityId);
  if (!community) return fail("NOT_FOUND");
  if (community.creatorId !== user._id && !isAdmin(user))
    return fail("FORBIDDEN");
  return { user, community };
}
export const ban = mutation({
  args: { communityId: v.id("communities"), userId: v.id("users") },
  handler: async (ctx, args) => {
    const { user, community } = await creator(ctx, args.communityId);
    if (args.userId === community.creatorId || args.userId === user._id)
      return fail("FORBIDDEN");
    if (!(await ctx.db.get(args.userId))) return fail("NOT_FOUND");
    if (
      !(await ctx.db
        .query("bans")
        .withIndex("by_pair", (q) =>
          q.eq("communityId", args.communityId).eq("userId", args.userId),
        )
        .unique())
    )
      await ctx.db.insert("bans", args);
    const m = await ctx.db
      .query("memberships")
      .withIndex("by_pair", (q) =>
        q.eq("userId", args.userId).eq("communityId", args.communityId),
      )
      .unique();
    if (m) await ctx.db.delete(m._id);
    await ctx.db.insert("moderationEvents", {
      actorId: user._id,
      targetId: args.userId,
      action: "ban",
      reason: args.communityId,
    });
  },
});
export const unban = mutation({
  args: { communityId: v.id("communities"), userId: v.id("users") },
  handler: async (ctx, args) => {
    await creator(ctx, args.communityId);
    const row = await ctx.db
      .query("bans")
      .withIndex("by_pair", (q) =>
        q.eq("communityId", args.communityId).eq("userId", args.userId),
      )
      .unique();
    if (row) await ctx.db.delete(row._id);
  },
});
export const bans = query({
  args: {
    communityId: v.id("communities"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { communityId, paginationOpts }) => {
    await creator(ctx, communityId);
    const result = await ctx.db
      .query("bans")
      .withIndex("by_pair", (q) => q.eq("communityId", communityId))
      .paginate({
        ...paginationOpts,
        numItems: Math.min(30, paginationOpts.numItems),
      });
    return {
      ...result,
      page: await Promise.all(
        result.page.map(async (row) => ({
          id: row.userId,
          username: (await ctx.db.get(row.userId))?.username ?? "member",
        })),
      ),
    };
  },
});
export const report = mutation({
  args: { target, reason: v.string() },
  handler: async (ctx, { target, reason }) => {
    const user = await requireUser(ctx);
    if (!(await ctx.db.get(target.id))) return fail("NOT_FOUND");
    return ctx.db.insert("reports", {
      reporterId: user._id,
      targetType: target.type,
      targetId: target.id,
      reason: text(reason, 500, true),
      status: "open",
    });
  },
});
export const removeContent = mutation({
  args: { target, reason: v.string() },
  handler: async (ctx, { target, reason }) => {
    if (target.type === "post") {
      const post = await ctx.db.get(target.id);
      if (!post) return fail("NOT_FOUND");
      const { user } = await creator(ctx, post.communityId);
      await removePost(ctx, post);
      await ctx.db.insert("moderationEvents", {
        actorId: user._id,
        targetId: post._id,
        action: "removePost",
        reason: text(reason, 500, true),
      });
    } else if (target.type === "comment") {
      const comment = await ctx.db.get(target.id);
      if (!comment) return fail("NOT_FOUND");
      const post = await ctx.db.get(comment.postId);
      if (!post) return fail("NOT_FOUND");
      const { user } = await creator(ctx, post.communityId);
      await removeComment(ctx, comment);
      await ctx.db.insert("moderationEvents", {
        actorId: user._id,
        targetId: comment._id,
        action: "removeComment",
        reason: text(reason, 500, true),
      });
    } else return fail("VALIDATION");
  },
});
async function reportedContent(
  ctx: QueryCtx | MutationCtx,
  report: Doc<"reports">,
) {
  if (report.targetType === "post") {
    const id = ctx.db.normalizeId("posts", report.targetId);
    const post = id ? await ctx.db.get(id) : null;
    const asset = post ? await ctx.db.get(post.assetId) : null;
    return {
      post,
      comment: null,
      userId: post?.authorId,
      text: post?.caption ?? "Post unavailable",
      photoUrl: asset?.storageId
        ? await ctx.storage.getUrl(asset.storageId)
        : null,
    };
  }
  if (report.targetType === "comment") {
    const id = ctx.db.normalizeId("comments", report.targetId);
    const comment = id ? await ctx.db.get(id) : null;
    return {
      post: null,
      comment,
      userId: comment?.authorId,
      text: comment?.text ?? "Comment unavailable",
      photoUrl: null,
    };
  }
  const id = ctx.db.normalizeId("users", report.targetId);
  const user = id ? await ctx.db.get(id) : null;
  return {
    post: null,
    comment: null,
    userId: user?._id,
    text: user?.username ?? "Account unavailable",
    photoUrl: null,
  };
}
export const listReports = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, { paginationOpts }) => {
    const user = await requireUser(ctx);
    if (!isAdmin(user)) return fail("FORBIDDEN");
    const result = await ctx.db
      .query("reports")
      .withIndex("by_status", (q) => q.eq("status", "open"))
      .order("desc")
      .paginate({
        ...paginationOpts,
        numItems: Math.min(30, paginationOpts.numItems),
      });
    return {
      ...result,
      page: await Promise.all(
        result.page.map(async (r) => {
          const content = await reportedContent(ctx, r);
          return {
            id: r._id,
            targetType: r.targetType,
            targetId: r.targetId,
            reason: r.reason,
            createdAt: r._creationTime,
            text: content.text,
            photoUrl: content.photoUrl,
          };
        }),
      ),
    };
  },
});
export const resolveReport = mutation({
  args: {
    reportId: v.id("reports"),
    decision: v.union(
      v.literal("dismiss"),
      v.literal("remove"),
      v.literal("suspend"),
    ),
  },
  handler: async (ctx, { reportId, decision }) => {
    const user = await requireUser(ctx);
    if (!isAdmin(user)) return fail("FORBIDDEN");
    const report = await ctx.db.get(reportId);
    if (!report || report.status !== "open") return;
    const content = await reportedContent(ctx, report);
    if (decision === "remove") {
      if (content.post) await removePost(ctx, content.post);
      else if (content.comment) await removeComment(ctx, content.comment);
      else return fail("VALIDATION");
    }
    if (decision === "suspend") {
      if (!content.userId || content.userId === user._id)
        return fail("FORBIDDEN");
      await ctx.db.patch(content.userId, { status: "suspended" });
    }
    await ctx.db.patch(reportId, {
      status: "resolved",
      reviewerId: user._id,
      decision,
    });
    await ctx.db.insert("moderationEvents", {
      actorId: user._id,
      targetId: report.targetId,
      action: decision,
      reason: report.reason,
    });
  },
});
