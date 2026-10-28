import React, { useSyncExternalStore } from "react";
import { Image } from "react-native";
import { Image as ExpoImage } from "expo-image";
import { getFunctionName } from "convex/server";
export const assetsReady = ExpoImage.prefetch([
  Image.resolveAssetSource(require("../../assets/design/community-violet.png"))
    .uri,
  Image.resolveAssetSource(require("../../assets/design/community-green.png"))
    .uri,
  Image.resolveAssetSource(require("../../assets/design/community-orange.png"))
    .uri,
  Image.resolveAssetSource(require("../../assets/design/community-night.png"))
    .uri,
  Image.resolveAssetSource(
    require("../../assets/design/community-violet-cover.png"),
  ).uri,
  Image.resolveAssetSource(require("../../assets/design/community-success.png"))
    .uri,
  Image.resolveAssetSource(require("../../assets/design/mail.png")).uri,
  Image.resolveAssetSource(require("../../assets/design/lock.png")).uri,
  Image.resolveAssetSource(require("../../assets/design/key.png")).uri,
  Image.resolveAssetSource(require("../../assets/design/providers.png")).uri,
  Image.resolveAssetSource(require("../../assets/design/feed-empty.png")).uri,
  Image.resolveAssetSource(
    require("../../assets/design/conversation-empty.png"),
  ).uri,
  Image.resolveAssetSource(require("../../assets/design/report-success.png"))
    .uri,
]);
const photo = Image.resolveAssetSource(
  require("../visual/fixtures/coffee.png"),
).uri;
const plant = Image.resolveAssetSource(
  require("../visual/fixtures/plant.png"),
).uri;
const avatar = Image.resolveAssetSource(
  require("../visual/fixtures/avatar.png"),
).uri;
export const fixtures = { photo, plant, avatar };
export const data = {
  scenario: "home",
  version: 0,
  user: {
    id: "qa-user",
    username: "mayachen",
    bio: "QA fixture • Collecting everyday moments.",
    status: "active",
    onboardingComplete: true,
    isAdmin: true,
  },
  communities: [
    {
      id: "qa-community",
      name: "Everyday Light",
      handle: "everyday_light",
      description:
        "Small moments. Beautiful light. A public space for the photos you almost walked past.",
      accent: "#5B36E8",
      joined: true,
      canPost: true,
      canModerate: true,
    },
    ...["Green Spaces", "Golden Hour", "After Dark"].map((name, i) => ({
      id: "qa-community" + i,
      name,
      handle: "community_" + i,
      description: [
        "Plants and green escapes.",
        "Warm light and everyday wonder.",
        "Night scenes and quiet moments.",
      ][i],
      accent: ["#377C43", "#F58316", "#251044"][i],
      joined: false,
      canPost: false,
      canModerate: false,
    })),
  ],
  posts: Array.from({ length: 9 }, (_, i) => ({
    id: "qa-post" + i,
    authorId: i % 2 ? "qa-user" : "qa-other",
    username: i % 2 ? "mayachen" : "noahpark",
    avatarUrl: avatar,
    communityId: "qa-community",
    communityName: "Everyday Light",
    photoUrl: i % 2 ? plant : photo,
    width: 1200,
    height: 900,
    caption:
      i % 2
        ? "QA fixture • A little green goes a long way."
        : "QA fixture • A little afternoon pause.",
    createdAt: Date.now() - 3600000,
    revision: 1,
    likeCount: 24,
    commentCount: 2,
    likedByMe: false,
    canEdit: i % 2 === 1,
    canModerate: true,
  })),
  comments: [
    {
      id: "qa-comment1",
      authorId: "qa-other",
      username: "noahpark",
      text: "QA comment • Love this light!",
      createdAt: Date.now(),
      canEdit: false,
    },
    {
      id: "qa-comment2",
      authorId: "qa-user",
      username: "mayachen",
      text: "QA comment • Thank you!",
      createdAt: Date.now(),
      canEdit: true,
    },
  ],
  blocked: [{ id: "qa-blocked", username: "alexriver" }],
  reports: [
    {
      id: "qa-report1",
      targetType: "post",
      reason: "Spam",
      text: "QA fixture • Reported photo",
      photoUrl: photo,
    },
    {
      id: "qa-report2",
      targetType: "comment",
      reason: "Harassment or bullying",
      text: "QA fixture • Reported comment",
    },
    {
      id: "qa-report3",
      targetType: "user",
      reason: "Spam",
      text: "QA fixture • Reported account",
    },
  ],
  notifications: [0, 1, 2].map((i) => ({
    id: "qa-notification" + i,
    postId: "qa-post1",
    actorUsername: "noahpark",
    actorAvatarUrl: avatar,
    photoUrl: i % 2 ? plant : photo,
    kind: i ? "comment" : "like",
    commentText: i ? "QA comment • Love this light!" : undefined,
    createdAt: Date.now() - i * 3600000,
    readAt: i ? Date.now() : undefined,
  })),
  bans: [{ id: "qa-banned", username: "bannedmember" }],
};
const listeners = new Set();
let snapshot = { ...data, user: { ...data.user } };
export const emit = () => {
  data.version++;
  snapshot = { ...data, user: { ...data.user } };
  for (const fn of listeners) fn();
};
const subscribe = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};
export function useFixture() {
  return useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => snapshot,
  );
}
export function chooseScenario(scenario) {
  data.scenario = scenario;
  data.user.onboardingComplete = !scenario.startsWith("onboarding");
  data.user.isAdmin = scenario !== "admin-denied";
  data.user.status =
    scenario === "account-unavailable" ? "suspended" : "active";
  emit();
}
export function useSession() {
  const state = useFixture();
  return {
    user: state.scenario === "auth" ? null : state.user,
    loading: false,
    error: null,
    retry() {},
  };
}
export const SessionProvider = ({ children }) => children;
export const ClerkProvider = ({ children }) => children;
export const ConvexProviderWithClerk = ({ children }) => children;
export class ConvexReactClient {
  close() {}
}
export const tokenCache = {
  getToken: async () => null,
  saveToken: async () => {},
};
export function useAuth() {
  const state = useFixture();
  return {
    isLoaded: true,
    isSignedIn: state.scenario !== "auth",
    userId: "qa-clerk",
    getToken: async () => null,
    signOut: async () => chooseScenario("auth"),
  };
}
export const useConvexAuth = () => ({
  isAuthenticated: true,
  isLoading: false,
});
const callbacks = new Map();
export function useMutation(fn) {
  const name = getFunctionName(fn);
  if (!callbacks.has(name))
    callbacks.set(name, async (args) => mutate(name, args));
  return callbacks.get(name);
}
function query(name, args = {}) {
  if (name === "users:me") return data.user;
  if (name === "users:profile")
    return {
      ...data.user,
      id: args.userId,
      username: args.userId === "qa-other" ? "noahpark" : data.user.username,
      avatarUrl: avatar,
      isMe: args.userId !== "qa-other",
    };
  if (name === "communities:get") {
    if (data.scenario === "community-unavailable") return null;
    if (data.scenario === "community-loading") return undefined;
    return data.communities.find((c) => c.id === args.communityId) ?? null;
  }
  if (name === "posts:get")
    return data.posts.find((p) => p.id === args.postId) ?? null;
  if (name === "posts:reconcile") return null;
  if (name === "media:available") return true;
  return null;
}
export function useQuery(fn, args) {
  useFixture();
  return args === "skip" ? undefined : query(getFunctionName(fn), args);
}
export const useConvex = () => ({
  query: async (fn, args) => query(getFunctionName(fn), args),
});
export function usePaginatedQuery(fn, args) {
  const state = useFixture();
  const name = getFunctionName(fn);
  let results = [];
  if (args !== "skip") {
    if (name === "communities:list")
      results = state.communities.filter(
        (c) =>
          !args.search ||
          c.name.toLowerCase().includes(args.search.toLowerCase()),
      );
    if (name === "communities:joined")
      results = state.communities.filter((c) => c.joined);
    if (name.startsWith("feed:"))
      results = state.posts.filter(
        (p) =>
          (name !== "feed:profile" || p.authorId === args.userId) &&
          (name !== "feed:community" || p.communityId === args.communityId),
      );
    if (name === "comments:list") results = state.comments;
    if (name === "notifications:list") results = state.notifications;
    if (name === "moderation:blocked") results = state.blocked;
    if (name === "moderation:listReports") results = state.reports;
    if (name === "moderation:bans") results = state.bans;
  }
  if (state.scenario.startsWith("empty-") || state.scenario === "feed-loading")
    results = [];
  return {
    results,
    status:
      state.scenario === "feed-loading" ? "LoadingFirstPage" : "Exhausted",
    loadMore() {},
  };
}
async function mutate(name, args = {}) {
  if (data.scenario === "mutation-error")
    throw new Error("QA fixture • Simulated failure");
  if (name === "communities:join" || name === "communities:leave") {
    const c = data.communities.find((c) => c.id === args.communityId);
    if (c) {
      c.joined = name.endsWith("join");
      c.canPost = c.joined;
    }
  }
  if (name === "communities:create") {
    const c = {
      ...args,
      id: "qa-created",
      joined: true,
      canPost: true,
      canModerate: true,
    };
    data.communities.push(c);
    emit();
    return c.id;
  }
  if (name === "users:setUsername") data.user.username = args.username;
  if (name === "users:completeOnboarding") data.user.onboardingComplete = true;
  if (name === "users:updateProfile") data.user.bio = args.bio;
  if (name === "likes:set") {
    const p = data.posts.find((p) => p.id === args.postId);
    if (p) {
      p.likeCount += args.liked === p.likedByMe ? 0 : args.liked ? 1 : -1;
      p.likedByMe = args.liked;
    }
  }
  if (name === "comments:create")
    data.comments.push({
      id: "qa-comment" + Date.now(),
      authorId: data.user.id,
      username: data.user.username,
      text: args.text,
      canEdit: true,
      createdAt: Date.now(),
    });
  if (name === "comments:update") {
    const c = data.comments.find((c) => c.id === args.commentId);
    if (c) c.text = args.text;
  }
  if (name === "comments:remove")
    data.comments = data.comments.filter((c) => c.id !== args.commentId);
  if (name === "posts:remove")
    data.posts = data.posts.filter((p) => p.id !== args.postId);
  if (name === "posts:update") {
    const p = data.posts.find((p) => p.id === args.postId);
    if (p) {
      p.caption = args.caption;
      p.revision++;
    }
  }
  if (name === "posts:create") {
    emit();
    return "qa-post1";
  }
  if (name === "notifications:markRead") {
    const n = data.notifications.find((n) => n.id === args.notificationId);
    if (n) n.readAt = Date.now();
  }
  if (name === "moderation:unblock")
    data.blocked = data.blocked.filter((x) => x.id !== args.userId);
  if (name === "moderation:block")
    data.blocked.push({ id: args.userId, username: "noahpark" });
  if (name === "moderation:unban")
    data.bans = data.bans.filter((x) => x.id !== args.userId);
  if (name === "moderation:resolveReport")
    data.reports = data.reports.filter((x) => x.id !== args.reportId);
  emit();
}
const resetResource = {
  status: "needs_first_factor",
  reset() {},
  password: async () => ({ error: null }),
  create: async () => ({ error: null }),
  update: async () => ({ error: null }),
  finalize: async () => ({ error: null }),
  verifications: {
    sendEmailCode: async () => ({ error: null }),
    verifyEmailCode: async () => ({ error: null }),
  },
  resetPasswordEmailCode: {
    sendCode: async () => ({ error: null }),
    verifyCode: async () => ({ error: null }),
    submitPassword: async () => ({ error: null }),
  },
};
export const useSignIn = () => ({ signIn: resetResource, fetchStatus: "idle" });
export const useSignUp = () => ({ signUp: resetResource, fetchStatus: "idle" });
export const useSSO = () => ({ startSSOFlow: async () => ({}) });
