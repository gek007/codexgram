import type { MutationCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import { fail } from "./auth";
export async function charge(
  ctx: MutationCtx,
  userId: Id<"users">,
  kind: "posts" | "photos" | "avatars",
) {
  const day = new Date(Date.now()).toISOString().slice(0, 10);
  const row = await ctx.db
    .query("dailyUsage")
    .withIndex("by_pair", (q) => q.eq("userId", userId).eq("day", day))
    .unique();
  const limit = kind === "posts" ? 10 : kind === "photos" ? 20 : 5;
  if ((row?.[kind] ?? 0) >= limit) return fail("QUOTA_EXCEEDED");
  if (row) await ctx.db.patch(row._id, { [kind]: row[kind] + 1 });
  else
    await ctx.db.insert("dailyUsage", {
      userId,
      day,
      posts: kind === "posts" ? 1 : 0,
      photos: kind === "photos" ? 1 : 0,
      avatars: kind === "avatars" ? 1 : 0,
    });
}
