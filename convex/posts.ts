import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { Id, Doc } from "./_generated/dataModel";
import { internal } from "./_generated/api";
import { fail, requireUser, isAdmin } from "./lib/auth";
import { text } from "./lib/validation";
import { charge } from "./lib/limits";
import { canViewAuthor, requireCommunityMember } from "./lib/access";
export async function ownedAsset(
  ctx: MutationCtx,
  ownerId: Id<"users">,
  assetId: Id<"mediaAssets">,
  purpose: "post" | "avatar",
) {
  const asset = await ctx.db.get(assetId);
  if (
    !asset ||
    asset.ownerId !== ownerId ||
    asset.purpose !== purpose ||
    asset.state !== "pending" ||
    !asset.storageId ||
    asset.expiresAt < Date.now()
  )
    return fail("UPLOAD_REJECTED");
  return asset;
}
export async function retireAsset(
  ctx: MutationCtx,
  assetId: Id<"mediaAssets">,
) {
  const asset = await ctx.db.get(assetId);
  if (asset) {
    await ctx.db.patch(assetId, { state: "deleting", expiresAt: Date.now() });
    await ctx.scheduler.runAfter(0, internal.media.deleteAsset, { assetId });
  }
}
export async function postView(
  ctx: QueryCtx,
  viewerId: Id<"users">,
  post: Doc<"posts">,
) {
  if (
    post.status !== "active" ||
    !(await canViewAuthor(ctx, viewerId, post.authorId))
  )
    return null;
  const community = await ctx.db.get(post.communityId);
  if (!community || community.status !== "active") return null;
  const author = await ctx.db.get(post.authorId);
  const asset = await ctx.db.get(post.assetId);
  if (!author || !asset?.storageId || asset.state !== "attached") return null;
  const photoUrl = await ctx.storage.getUrl(asset.storageId);
  if (!photoUrl) return null;
  const like = await ctx.db
    .query("likes")
    .withIndex("by_pair", (q) =>
      q.eq("userId", viewerId).eq("postId", post._id),
    )
    .unique();
  const viewer = await ctx.db.get(viewerId);
  const avatar = author.avatarAssetId
    ? await ctx.db.get(author.avatarAssetId)
    : null;
  return {
    id: post._id,
    authorId: post.authorId,
    communityId: post.communityId,
    communityName: community.name,
    accent: community.accent,
    username: author.username ?? "member",
    avatarUrl: avatar?.storageId
      ? await ctx.storage.getUrl(avatar.storageId)
      : null,
    photoUrl,
    width: asset.width,
    height: asset.height,
    caption: post.caption,
    createdAt: post._creationTime,
    editedAt: post.editedAt,
    revision: post.revision,
    likeCount: post.likeCount,
    commentCount: post.commentCount,
    likedByMe: !!like,
    canEdit: viewerId === post.authorId,
    canModerate:
      viewerId === community.creatorId || (!!viewer && isAdmin(viewer)),
  };
}
export const create = mutation({
  args: {
    communityId: v.id("communities"),
    assetId: v.id("mediaAssets"),
    caption: v.optional(v.string()),
    requestId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    if (!/^[a-zA-Z0-9_-]{1,80}$/.test(args.requestId))
      return fail("VALIDATION");
    const caption = text(args.caption ?? "", 2000);
    const old = await ctx.db
      .query("posts")
      .withIndex("by_author_request", (q) =>
        q.eq("authorId", user._id).eq("requestId", args.requestId),
      )
      .unique();
    if (old) {
      if (
        old.communityId !== args.communityId ||
        old.assetId !== args.assetId ||
        old.caption !== caption
      )
        return fail("CONFLICT");
      return old._id;
    }
    await requireCommunityMember(ctx, user._id, args.communityId);
    await ownedAsset(ctx, user._id, args.assetId, "post");
    await charge(ctx, user._id, "posts");
    await ctx.db.patch(args.assetId, { state: "attached" });
    return ctx.db.insert("posts", {
      authorId: user._id,
      communityId: args.communityId,
      assetId: args.assetId,
      caption,
      requestId: args.requestId,
      revision: 0,
      status: "active",
      likeCount: 0,
      commentCount: 0,
    });
  },
});
export const update = mutation({
  args: {
    postId: v.id("posts"),
    caption: v.optional(v.string()),
    assetId: v.optional(v.id("mediaAssets")),
    expectedRevision: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const post = await ctx.db.get(args.postId);
    if (!post || post.status !== "active") return fail("NOT_FOUND");
    if (post.authorId !== user._id) return fail("FORBIDDEN");
    if (post.revision !== args.expectedRevision) return fail("CONFLICT");
    await requireCommunityMember(ctx, user._id, post.communityId);
    if (args.assetId) {
      await ownedAsset(ctx, user._id, args.assetId, "post");
      await ctx.db.patch(args.assetId, { state: "attached" });
      await retireAsset(ctx, post.assetId);
    }
    await ctx.db.patch(post._id, {
      caption:
        args.caption === undefined ? post.caption : text(args.caption, 2000),
      assetId: args.assetId ?? post.assetId,
      revision: post.revision + 1,
      editedAt: Date.now(),
    });
  },
});
export const get = query({
  args: { postId: v.id("posts") },
  handler: async (ctx, { postId }) => {
    const user = await requireUser(ctx);
    const post = await ctx.db.get(postId);
    return post ? postView(ctx, user._id, post) : null;
  },
});
export async function removePost(ctx: MutationCtx, post: Doc<"posts">) {
  if (post.status !== "active") return;
  await ctx.db.patch(post._id, { status: "deleted" });
  await retireAsset(ctx, post.assetId);
  await ctx.scheduler.runAfter(0, internal.maintenance.cleanupPost, {
    postId: post._id,
  });
}
export const remove = mutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, { postId }) => {
    const user = await requireUser(ctx);
    const post = await ctx.db.get(postId);
    if (!post) return;
    if (post.authorId !== user._id) return fail("FORBIDDEN");
    await removePost(ctx, post);
  },
});
