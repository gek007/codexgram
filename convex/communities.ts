import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import type { QueryCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { fail, requireUser } from "./lib/auth";
import { handle, text, accent } from "./lib/validation";
import { ban, membership } from "./lib/access";
export async function communityView(
  ctx: QueryCtx,
  community: Doc<"communities">,
  userId: Id<"users">,
) {
  const joined = !!(await membership(ctx, userId, community._id));
  const banned = !!(await ban(ctx, userId, community._id));
  return {
    id: community._id,
    name: community.name,
    handle: community.handle,
    description: community.description,
    accent: community.accent,
    creatorId: community.creatorId,
    joined,
    canPost: joined && !banned && community.status === "active",
    canModerate: userId === community.creatorId,
  };
}
export const create = mutation({
  args: {
    name: v.string(),
    handle: v.string(),
    description: v.string(),
    accent: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const normalized = handle(args.handle);
    if (
      await ctx.db
        .query("communities")
        .withIndex("by_handle", (q) => q.eq("handle", normalized))
        .unique()
    )
      return fail("HANDLE_TAKEN");
    const id = await ctx.db.insert("communities", {
      name: text(args.name, 60, true),
      handle: normalized,
      description: text(args.description, 500),
      accent: accent(args.accent),
      creatorId: user._id,
      status: "active",
    });
    await ctx.db.insert("memberships", { userId: user._id, communityId: id });
    return id;
  },
});
export const get = query({
  args: { communityId: v.id("communities") },
  handler: async (ctx, { communityId }) => {
    const user = await requireUser(ctx);
    const community = await ctx.db.get(communityId);
    return community?.status === "active"
      ? communityView(ctx, community, user._id)
      : null;
  },
});
export const list = query({
  args: {
    search: v.optional(v.string()),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const opts = {
      ...args.paginationOpts,
      numItems: Math.min(30, Math.max(1, args.paginationOpts.numItems)),
    };
    const search = text(args.search ?? "", 60);
    const result = search
      ? await ctx.db
          .query("communities")
          .withSearchIndex("search_name", (q) =>
            q.search("name", search).eq("status", "active"),
          )
          .paginate(opts)
      : await ctx.db
          .query("communities")
          .withIndex("by_name", (q) => q.eq("status", "active"))
          .paginate(opts);
    return {
      ...result,
      page: await Promise.all(
        result.page.map((c) => communityView(ctx, c, user._id)),
      ),
    };
  },
});
export const join = mutation({
  args: { communityId: v.id("communities") },
  handler: async (ctx, { communityId }) => {
    const user = await requireUser(ctx);
    const community = await ctx.db.get(communityId);
    if (!community || community.status !== "active") return fail("NOT_FOUND");
    if (await ban(ctx, user._id, communityId)) return fail("BANNED");
    if (!(await membership(ctx, user._id, communityId)))
      await ctx.db.insert("memberships", { communityId, userId: user._id });
  },
});
export const leave = mutation({
  args: { communityId: v.id("communities") },
  handler: async (ctx, { communityId }) => {
    const user = await requireUser(ctx);
    const community = await ctx.db.get(communityId);
    if (community?.creatorId === user._id) return fail("FORBIDDEN");
    const m = await membership(ctx, user._id, communityId);
    if (m) await ctx.db.delete(m._id);
  },
});
export const joined = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, { paginationOpts }) => {
    const user = await requireUser(ctx);
    const result = await ctx.db
      .query("memberships")
      .withIndex("by_pair", (q) => q.eq("userId", user._id))
      .paginate({
        ...paginationOpts,
        numItems: Math.min(30, paginationOpts.numItems),
      });
    const communities = await Promise.all(
      result.page.map(async (m) => {
        const c = await ctx.db.get(m.communityId);
        return c?.status === "active" ? communityView(ctx, c, user._id) : null;
      }),
    );
    return { ...result, page: communities.filter((c) => c !== null) };
  },
});
