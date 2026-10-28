import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { query } from "./_generated/server";
import { requireUser } from "./lib/auth";
import { membership } from "./lib/access";
import { postView } from "./posts";
const opts = (p: { cursor: string | null; numItems: number }) => ({
  ...p,
  numItems: Math.max(1, Math.min(30, p.numItems)),
});
export const home = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, { paginationOpts }) => {
    const user = await requireUser(ctx);
    const result = await ctx.db
      .query("posts")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .order("desc")
      .paginate(opts(paginationOpts));
    const cards = await Promise.all(
      result.page.map(async (post) =>
        (await membership(ctx, user._id, post.communityId))
          ? postView(ctx, user._id, post)
          : null,
      ),
    );
    return { ...result, page: cards.filter((p) => p !== null) };
  },
});
export const community = query({
  args: {
    communityId: v.id("communities"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { communityId, paginationOpts }) => {
    const user = await requireUser(ctx);
    const result = await ctx.db
      .query("posts")
      .withIndex("by_community", (q) =>
        q.eq("communityId", communityId).eq("status", "active"),
      )
      .order("desc")
      .paginate(opts(paginationOpts));
    const cards = await Promise.all(
      result.page.map((p) => postView(ctx, user._id, p)),
    );
    return { ...result, page: cards.filter((p) => p !== null) };
  },
});
export const profile = query({
  args: { userId: v.id("users"), paginationOpts: paginationOptsValidator },
  handler: async (ctx, { userId, paginationOpts }) => {
    const user = await requireUser(ctx);
    const result = await ctx.db
      .query("posts")
      .withIndex("by_author", (q) =>
        q.eq("authorId", userId).eq("status", "active"),
      )
      .order("desc")
      .paginate(opts(paginationOpts));
    const cards = await Promise.all(
      result.page.map((p) => postView(ctx, user._id, p)),
    );
    return { ...result, page: cards.filter((p) => p !== null) };
  },
});
