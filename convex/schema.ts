import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
const status = v.union(
  v.literal("active"),
  v.literal("removed"),
  v.literal("deleted"),
);
export default defineSchema({
  users: defineTable({
    identity: v.string(),
    clerkId: v.string(),
    username: v.optional(v.string()),
    bio: v.string(),
    avatarAssetId: v.optional(v.id("mediaAssets")),
    onboardingComplete: v.boolean(),
    status: v.union(
      v.literal("active"),
      v.literal("suspended"),
      v.literal("deleting"),
      v.literal("deleted"),
    ),
  })
    .index("by_identity", ["identity"])
    .index("by_username", ["username"])
    .index("by_clerk", ["clerkId"]),
  communities: defineTable({
    name: v.string(),
    handle: v.string(),
    description: v.string(),
    accent: v.string(),
    creatorId: v.id("users"),
    status: v.union(v.literal("active"), v.literal("archived")),
  })
    .index("by_handle", ["handle"])
    .index("by_name", ["status", "name"])
    .index("by_creator", ["creatorId", "status"])
    .searchIndex("search_name", {
      searchField: "name",
      filterFields: ["status"],
    }),
  memberships: defineTable({
    userId: v.id("users"),
    communityId: v.id("communities"),
  })
    .index("by_pair", ["userId", "communityId"])
    .index("by_community", ["communityId"]),
  posts: defineTable({
    authorId: v.id("users"),
    communityId: v.id("communities"),
    assetId: v.id("mediaAssets"),
    caption: v.string(),
    requestId: v.string(),
    revision: v.number(),
    editedAt: v.optional(v.number()),
    status,
    likeCount: v.number(),
    commentCount: v.number(),
  })
    .index("by_author_request", ["authorId", "requestId"])
    .index("by_status", ["status"])
    .index("by_community", ["communityId", "status"])
    .index("by_author", ["authorId", "status"]),
  comments: defineTable({
    authorId: v.id("users"),
    postId: v.id("posts"),
    text: v.string(),
    requestId: v.string(),
    status,
    editedAt: v.optional(v.number()),
  })
    .index("by_post", ["postId", "status"])
    .index("by_request", ["authorId", "requestId"])
    .index("by_author", ["authorId"]),
  likes: defineTable({ userId: v.id("users"), postId: v.id("posts") })
    .index("by_pair", ["userId", "postId"])
    .index("by_post", ["postId"]),
  notifications: defineTable({
    recipientId: v.id("users"),
    actorId: v.id("users"),
    postId: v.id("posts"),
    commentId: v.optional(v.id("comments")),
    kind: v.union(v.literal("like"), v.literal("comment")),
    eventKey: v.string(),
    readAt: v.optional(v.number()),
  })
    .index("by_recipient", ["recipientId"])
    .index("by_event", ["eventKey"])
    .index("by_post", ["postId"])
    .index("by_actor", ["actorId"]),
  blocks: defineTable({ userId: v.id("users"), blockedId: v.id("users") })
    .index("by_pair", ["userId", "blockedId"])
    .index("by_blocked", ["blockedId"]),
  bans: defineTable({ communityId: v.id("communities"), userId: v.id("users") })
    .index("by_pair", ["communityId", "userId"])
    .index("by_user", ["userId"]),
  reports: defineTable({
    reporterId: v.id("users"),
    targetType: v.union(
      v.literal("post"),
      v.literal("comment"),
      v.literal("user"),
    ),
    targetId: v.string(),
    reason: v.string(),
    status: v.union(v.literal("open"), v.literal("resolved")),
    reviewerId: v.optional(v.id("users")),
    decision: v.optional(v.string()),
  })
    .index("by_status", ["status"])
    .index("by_reporter", ["reporterId"])
    .index("by_target", ["targetId"]),
  moderationEvents: defineTable({
    actorId: v.id("users"),
    targetId: v.string(),
    action: v.string(),
    reason: v.string(),
  }),
  mediaAssets: defineTable({
    ownerId: v.id("users"),
    storageId: v.optional(v.id("_storage")),
    requestId: v.string(),
    purpose: v.union(v.literal("post"), v.literal("avatar")),
    state: v.union(
      v.literal("uploading"),
      v.literal("pending"),
      v.literal("attached"),
      v.literal("deleting"),
    ),
    bytes: v.number(),
    width: v.number(),
    height: v.number(),
    expiresAt: v.number(),
  })
    .index("by_request", ["ownerId", "requestId"])
    .index("by_state_expiry", ["state", "expiresAt"])
    .index("by_owner", ["ownerId"]),
  dailyUsage: defineTable({
    userId: v.id("users"),
    day: v.string(),
    posts: v.number(),
    photos: v.number(),
    avatars: v.number(),
  }).index("by_pair", ["userId", "day"]),
  deletionJobs: defineTable({
    userId: v.id("users"),
    phase: v.number(),
    state: v.union(
      v.literal("pending"),
      v.literal("clerk"),
      v.literal("complete"),
    ),
    error: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_state", ["state"]),
});
