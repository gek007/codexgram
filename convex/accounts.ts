import { v } from "convex/values";
import {
  mutation,
  internalMutation,
  internalAction,
  internalQuery,
} from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";
import { fail } from "./lib/auth";
import { removePost, retireAsset } from "./posts";
import { removeComment } from "./comments";
async function begin(ctx: MutationCtx, userId: Id<"users">) {
  const old = await ctx.db
    .query("deletionJobs")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .unique();
  if (old) return old._id;
  await ctx.db.patch(userId, { status: "deleting" });
  const jobId = await ctx.db.insert("deletionJobs", {
    userId,
    phase: 0,
    state: "pending",
  });
  await ctx.scheduler.runAfter(0, internal.accounts.runDeletionBatch, {
    jobId,
  });
  return jobId;
}
export const requestDeletion = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return fail("UNAUTHENTICATED");
    const user = await ctx.db
      .query("users")
      .withIndex("by_identity", (q) =>
        q.eq("identity", identity.tokenIdentifier),
      )
      .unique();
    if (!user) return fail("NOT_FOUND");
    return begin(ctx, user._id);
  },
});
export const externalDeletion = internalMutation({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", clerkId))
      .unique();
    if (user) await begin(ctx, user._id);
  },
});
export const runDeletionBatch = internalMutation({
  args: { jobId: v.id("deletionJobs") },
  handler: async (ctx, { jobId }) => {
    const job = await ctx.db.get(jobId);
    if (!job || job.state !== "pending") return;
    const uid = job.userId;
    let count = 0;
    switch (job.phase) {
      case 0: {
        const rows = await ctx.db
          .query("communities")
          .withIndex("by_creator", (q) =>
            q.eq("creatorId", uid).eq("status", "active"),
          )
          .take(50);
        for (const row of rows)
          await ctx.db.patch(row._id, { status: "archived" });
        count = rows.length;
        break;
      }
      case 1: {
        const rows = await ctx.db
          .query("posts")
          .withIndex("by_author", (q) => q.eq("authorId", uid))
          .take(50);
        for (const row of rows) {
          await removePost(ctx, row);
          await ctx.db.delete(row._id);
        }
        count = rows.length;
        break;
      }
      case 2: {
        const rows = await ctx.db
          .query("comments")
          .withIndex("by_author", (q) => q.eq("authorId", uid))
          .take(50);
        for (const row of rows) {
          await removeComment(ctx, row);
          const reports = await ctx.db
            .query("reports")
            .withIndex("by_target", (q) => q.eq("targetId", row._id))
            .take(50);
          for (const r of reports) await ctx.db.delete(r._id);
          await ctx.db.delete(row._id);
        }
        count = rows.length;
        break;
      }
      case 3: {
        const rows = await ctx.db
          .query("likes")
          .withIndex("by_pair", (q) => q.eq("userId", uid))
          .take(50);
        for (const row of rows) {
          const post = await ctx.db.get(row.postId);
          if (post)
            await ctx.db.patch(post._id, {
              likeCount: Math.max(0, post.likeCount - 1),
            });
          await ctx.db.delete(row._id);
        }
        count = rows.length;
        break;
      }
      case 4:
      case 5: {
        const rows =
          job.phase === 4
            ? await ctx.db
                .query("notifications")
                .withIndex("by_recipient", (q) => q.eq("recipientId", uid))
                .take(50)
            : await ctx.db
                .query("notifications")
                .withIndex("by_actor", (q) => q.eq("actorId", uid))
                .take(50);
        for (const r of rows) await ctx.db.delete(r._id);
        count = rows.length;
        break;
      }
      case 6: {
        const rows = await ctx.db
          .query("memberships")
          .withIndex("by_pair", (q) => q.eq("userId", uid))
          .take(50);
        for (const r of rows) await ctx.db.delete(r._id);
        count = rows.length;
        break;
      }
      case 7:
      case 8: {
        const rows =
          job.phase === 7
            ? await ctx.db
                .query("blocks")
                .withIndex("by_pair", (q) => q.eq("userId", uid))
                .take(50)
            : await ctx.db
                .query("blocks")
                .withIndex("by_blocked", (q) => q.eq("blockedId", uid))
                .take(50);
        for (const r of rows) await ctx.db.delete(r._id);
        count = rows.length;
        break;
      }
      case 9: {
        const rows = await ctx.db
          .query("bans")
          .withIndex("by_user", (q) => q.eq("userId", uid))
          .take(50);
        for (const r of rows) await ctx.db.delete(r._id);
        count = rows.length;
        break;
      }
      case 10:
      case 11: {
        const rows =
          job.phase === 10
            ? await ctx.db
                .query("reports")
                .withIndex("by_reporter", (q) => q.eq("reporterId", uid))
                .take(50)
            : await ctx.db
                .query("reports")
                .withIndex("by_target", (q) => q.eq("targetId", uid))
                .take(50);
        for (const r of rows) await ctx.db.delete(r._id);
        count = rows.length;
        break;
      }
      case 12: {
        const rows = await ctx.db
          .query("mediaAssets")
          .withIndex("by_owner", (q) => q.eq("ownerId", uid))
          .take(50);
        for (const r of rows) {
          if (r.storageId) await ctx.storage.delete(r.storageId);
          await ctx.db.delete(r._id);
        }
        count = rows.length;
        break;
      }
      case 13: {
        const rows = await ctx.db
          .query("dailyUsage")
          .withIndex("by_pair", (q) => q.eq("userId", uid))
          .take(50);
        for (const r of rows) await ctx.db.delete(r._id);
        count = rows.length;
        break;
      }
      default:
        await ctx.db.patch(jobId, { state: "clerk" });
        await ctx.scheduler.runAfter(0, internal.accounts.deleteClerkIdentity, {
          jobId,
        });
        return;
    }
    if (count < 50) await ctx.db.patch(jobId, { phase: job.phase + 1 });
    await ctx.scheduler.runAfter(0, internal.accounts.runDeletionBatch, {
      jobId,
    });
  },
});
export const deletionIdentity = internalQuery({
  args: { jobId: v.id("deletionJobs") },
  handler: async (ctx, { jobId }) => {
    const job = await ctx.db.get(jobId);
    if (!job || job.state !== "clerk") return null;
    const user = await ctx.db.get(job.userId);
    return user ? { clerkId: user.clerkId } : null;
  },
});
export const finish = internalMutation({
  args: { jobId: v.id("deletionJobs"), error: v.optional(v.string()) },
  handler: async (ctx, { jobId, error }) => {
    const job = await ctx.db.get(jobId);
    if (!job || job.state === "complete") return;
    if (error) {
      await ctx.db.patch(jobId, { error });
      return;
    }
    await ctx.db.patch(job.userId, {
      status: "deleted",
      bio: "",
      username: undefined,
      avatarAssetId: undefined,
      identity: `deleted:${job.userId}`,
      clerkId: `deleted:${job.userId}`,
    });
    await ctx.db.patch(jobId, { state: "complete", error: undefined });
  },
});
export const deleteClerkIdentity = internalAction({
  args: { jobId: v.id("deletionJobs") },
  handler: async (ctx, { jobId }) => {
    const identity = await ctx.runQuery(internal.accounts.deletionIdentity, {
      jobId,
    });
    if (!identity) return;
    const key = process.env.CLERK_SECRET_KEY;
    if (!key) {
      await ctx.runMutation(internal.accounts.finish, {
        jobId,
        error: "CLERK_KEY_MISSING",
      });
      return;
    }
    try {
      const response = await fetch(
        `https://api.clerk.com/v1/users/${encodeURIComponent(identity.clerkId)}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${key}` } },
      );
      if (!response.ok && response.status !== 404)
        throw new Error("CLERK_DELETE_FAILED");
      await ctx.runMutation(internal.accounts.finish, { jobId });
    } catch {
      await ctx.runMutation(internal.accounts.finish, {
        jobId,
        error: "CLERK_DELETE_FAILED",
      });
    }
  },
});
export const retryClerk = internalMutation({
  args: {},
  handler: async (ctx) => {
    const jobs = await ctx.db
      .query("deletionJobs")
      .withIndex("by_state", (q) => q.eq("state", "clerk"))
      .take(50);
    for (const job of jobs)
      await ctx.scheduler.runAfter(0, internal.accounts.deleteClerkIdentity, {
        jobId: job._id,
      });
  },
});
