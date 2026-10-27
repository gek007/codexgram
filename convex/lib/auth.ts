import { ConvexError } from "convex/values";
import type { MutationCtx, QueryCtx } from "../_generated/server";
export const fail = (code: string): never => {
  throw new ConvexError(code);
};
export async function requireUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return fail("UNAUTHENTICATED");
  const user = await ctx.db
    .query("users")
    .withIndex("by_identity", (q) => q.eq("identity", identity.tokenIdentifier))
    .unique();
  if (!user) return fail("ONBOARDING_REQUIRED");
  if (user.status !== "active") return fail("ACCOUNT_UNAVAILABLE");
  return user;
}
export function isAdmin(user: { clerkId: string }) {
  return (process.env.APP_ADMIN_CLERK_IDS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .includes(user.clerkId);
}
