import { v } from "convex/values";
import { handle, text } from "./lib/validation";
import { canViewAuthor } from "./lib/access";
import { ownedAsset, retireAsset } from "./posts";
import { mutation, query } from "./_generated/server";
import { fail, requireUser, isAdmin } from "./lib/auth";
export const ensureCurrent = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return fail("UNAUTHENTICATED");
    const existing = await ctx.db
      .query("users")
      .withIndex("by_identity", (q) =>
        q.eq("identity", identity.tokenIdentifier),
      )
      .unique();
    if (existing) {
      if (existing.status !== "active") return fail("ACCOUNT_UNAVAILABLE");
      return existing._id;
    }
    return ctx.db.insert("users", {
      identity: identity.tokenIdentifier,
      clerkId: identity.subject,
      bio: "",
      onboardingComplete: false,
      status: "active",
    });
  },
});
export const me = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const user = await ctx.db
      .query("users")
      .withIndex("by_identity", (q) =>
        q.eq("identity", identity.tokenIdentifier),
      )
      .unique();
    if (!user) return null;
    return {
      id: user._id,
      username: user.username,
      bio: user.bio,
      onboardingComplete: user.onboardingComplete,
      status: user.status,
      isAdmin: isAdmin(user),
    };
  },
});

export const setUsername = mutation({
  args: { username: v.string() },
  handler: async (ctx, { username }) => {
    const user = await requireUser(ctx);
    const normalized = handle(username);
    const existing = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", normalized))
      .unique();
    if (existing && existing._id !== user._id) return fail("USERNAME_TAKEN");
    await ctx.db.patch(user._id, { username: normalized });
  },
});
export const completeOnboarding = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    if (
      !user.username ||
      !(await ctx.db
        .query("memberships")
        .withIndex("by_pair", (q) => q.eq("userId", user._id))
        .first())
    )
      return fail("VALIDATION");
    await ctx.db.patch(user._id, { onboardingComplete: true });
  },
});
export const profile = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const viewer = await requireUser(ctx);
    if (!(await canViewAuthor(ctx, viewer._id, userId))) return null;
    const user = await ctx.db.get(userId);
    if (!user) return null;
    const asset = user.avatarAssetId
      ? await ctx.db.get(user.avatarAssetId)
      : null;
    return {
      id: user._id,
      username: user.username ?? "member",
      bio: user.bio,
      avatarUrl: asset?.storageId
        ? await ctx.storage.getUrl(asset.storageId)
        : null,
      isMe: viewer._id === userId,
    };
  },
});
export const updateProfile = mutation({
  args: { bio: v.string(), avatarAssetId: v.optional(v.id("mediaAssets")) },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    if (args.avatarAssetId) {
      await ownedAsset(ctx, user._id, args.avatarAssetId, "avatar");
      await ctx.db.patch(args.avatarAssetId, { state: "attached" });
      if (user.avatarAssetId) await retireAsset(ctx, user.avatarAssetId);
    }
    await ctx.db.patch(user._id, {
      bio: text(args.bio, 160),
      ...(args.avatarAssetId ? { avatarAssetId: args.avatarAssetId } : {}),
    });
  },
});
