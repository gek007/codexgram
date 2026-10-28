import type { QueryCtx, MutationCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import { fail, requireUser } from "./auth";
type Ctx = QueryCtx | MutationCtx;
export const membership = (
  ctx: Ctx,
  userId: Id<"users">,
  communityId: Id<"communities">,
) =>
  ctx.db
    .query("memberships")
    .withIndex("by_pair", (q) =>
      q.eq("userId", userId).eq("communityId", communityId),
    )
    .unique();
export const ban = (
  ctx: Ctx,
  userId: Id<"users">,
  communityId: Id<"communities">,
) =>
  ctx.db
    .query("bans")
    .withIndex("by_pair", (q) =>
      q.eq("communityId", communityId).eq("userId", userId),
    )
    .unique();
export async function canViewAuthor(
  ctx: Ctx,
  viewerId: Id<"users">,
  authorId: Id<"users">,
) {
  const author = await ctx.db.get(authorId);
  if (!author || author.status !== "active") return false;
  if (viewerId === authorId) return true;
  const [a, b] = await Promise.all([
    ctx.db
      .query("blocks")
      .withIndex("by_pair", (q) =>
        q.eq("userId", viewerId).eq("blockedId", authorId),
      )
      .unique(),
    ctx.db
      .query("blocks")
      .withIndex("by_pair", (q) =>
        q.eq("userId", authorId).eq("blockedId", viewerId),
      )
      .unique(),
  ]);
  return !a && !b;
}
export async function requireCommunityMember(
  ctx: Ctx,
  userId: Id<"users">,
  communityId: Id<"communities">,
) {
  const community = await ctx.db.get(communityId);
  if (!community || community.status !== "active") return fail("NOT_FOUND");
  if (await ban(ctx, userId, communityId)) return fail("BANNED");
  if (!(await membership(ctx, userId, communityId))) return fail("FORBIDDEN");
  return community;
}
export async function requireCanInteract(ctx: Ctx, postId: Id<"posts">) {
  const viewer = await requireUser(ctx);
  const post = await ctx.db.get(postId);
  if (!post || post.status !== "active") return fail("NOT_FOUND");
  if (!(await canViewAuthor(ctx, viewer._id, post.authorId)))
    return fail("BLOCKED");
  await requireCommunityMember(ctx, viewer._id, post.communityId);
  return { viewer, post };
}
