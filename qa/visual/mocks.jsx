import React from "react";
import { View, Text, Image as NativeImage } from "react-native-web";
import feather from "../../node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/glyphmaps/Feather.json";
import ionicons from "../../node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/glyphmaps/Ionicons.json";
import { getFunctionName } from "convex/server";
export const scenario =
  new URLSearchParams(location.search).get("screen") ?? "home";
const uri = (name) => `/fixtures/${name}.png`;
export const user = {
  id: "user1",
  username: "mayachen",
  bio: "Collecting little moments. Coffee, plants and city walks.",
  onboardingComplete: true,
  status: "active",
  isAdmin: true,
};
export const communities = [
  {
    id: "community1",
    name: "Everyday Light",
    handle: "everyday_light",
    description:
      "Small moments. Beautiful light. A public space for the photos you almost walked past.",
    accent: "#5B36E8",
    joined: true,
    canPost: true,
    canModerate: false,
  },
  ...["Green Spaces", "Golden Hour", "After Dark"].map((name, i) => ({
    id: "community" + (i + 2),
    name,
    handle: "community" + i,
    description: [
      "Plants, nature and green escapes.",
      "Warm light and everyday wonder.",
      "Night scenes and quiet moments.",
    ][i],
    accent: ["#377C43", "#F58316", "#251044"][i],
    joined: false,
  })),
];
export const posts = Array.from({ length: 9 }, (_, i) => ({
  id: "post" + i,
  authorId: "user1",
  username: i % 2 ? "mayachen" : "noahpark",
  avatarUrl: uri("avatar"),
  communityId: "community1",
  communityName: "Everyday Light",
  photoUrl: uri(i % 2 ? "plant" : "coffee"),
  width: 1200,
  height: 900,
  caption:
    i % 2 ? "A little green goes a long way." : "A little afternoon pause.",
  createdAt: Date.now() - 3600000,
  likeCount: 24,
  commentCount: 3,
  likedByMe: i === 0,
  canEdit: true,
}));
export const useSession = () => ({ user, loading: false });
export const useAuth = () => ({
  getToken: async () => null,
  signOut: async () => {},
});
const resource = {
  status: "needs_first_factor",
  reset() {},
  password: async () => ({}),
  create: async () => ({}),
  finalize: async () => ({}),
  verifications: {
    sendEmailCode: async () => ({}),
    verifyEmailCode: async () => ({}),
  },
  resetPasswordEmailCode: {
    sendCode: async () => ({}),
    verifyCode: async () => ({}),
    submitPassword: async () => ({}),
  },
};
export const useSignIn = () => ({ signIn: resource, fetchStatus: "idle" });
export const useSignUp = () => ({ signUp: resource, fetchStatus: "idle" });
export const useSSO = () => ({ startSSOFlow: async () => ({}) });
export const makeRedirectUri = () => "";
export const randomUUID = () => "fixture-id";
export const usePreventRemove = () => () => {};
export const router = { push() {}, replace() {}, back() {} };
export const Stack = {
  Screen: ({ options }) =>
    options?.headerShown === false ? (
      <style>{"#fixture-header {display:none}"}</style>
    ) : options?.headerRight ? (
      <div style={{ position: "fixed", top: 44, right: 12, zIndex: 10 }}>
        {options.headerRight()}
      </div>
    ) : null,
};
export const useLocalSearchParams = () => ({ postId: "post0" });
export const SafeAreaView = ({ children, edges = [], style }) => (
  <View
    style={[
      {
        paddingTop: edges.includes("top") ? 44 : 0,
        paddingBottom: edges.includes("bottom") ? 20 : 0,
      },
      style,
    ]}
  >
    {children}
  </View>
);
export const useSafeAreaInsets = () => ({
  top: 44,
  bottom: 20,
  left: 0,
  right: 0,
});
export const Image = ({ source, contentFit, style, ...props }) => {
  const uri = typeof source === "string" ? source : source?.uri;
  if (uri?.startsWith("data:image/svg+xml"))
    return (
      <View style={style}>
        <img
          alt=""
          src={uri}
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      </View>
    );
  return (
    <NativeImage
      {...props}
      source={typeof source === "string" ? { uri: source } : source}
      resizeMode={contentFit === "contain" ? "contain" : "cover"}
      style={style}
    />
  );
};
export const Feather = ({ name, size, color }) => (
  <Text style={{ fontFamily: "Feather", fontSize: size, color }}>
    {String.fromCodePoint(feather[name] ?? feather.circle)}
  </Text>
);
export const Ionicons = ({ name, size, color }) => (
  <Text style={{ fontFamily: "Ionicons", fontSize: size, color }}>
    {String.fromCodePoint(ionicons[name] ?? ionicons.ellipse)}
  </Text>
);
export function useQuery(fn, args) {
  if (args === "skip") return;
  const name = getFunctionName(fn);
  if (name === "communities:get" && scenario === "unavailable") return null;
  if (name === "communities:get" && scenario === "loading") return undefined;
  if (name === "communities:get")
    return {
      ...communities[0],
      canModerate: scenario === "creator",
      joined: scenario !== "preview",
      canPost: scenario !== "preview",
    };
  if (name === "users:profile")
    return {
      ...user,
      avatarUrl: uri("avatar"),
      isMe: scenario !== "public-profile",
    };
  if (name === "posts:get") return posts[0];
  return null;
}
export const useMutation = (fn) => async () =>
  getFunctionName(fn) === "communities:create" ? "community1" : undefined;
export const useConvex = () => ({
  mutation: async () => {},
  query: async () => null,
});
export function usePaginatedQuery(fn, args) {
  const name = getFunctionName(fn);
  let results = [];
  if (args !== "skip") {
    if (name.startsWith("feed:")) results = posts;
    if (name.startsWith("communities:")) results = communities;
    if (name === "moderation:blocked")
      results = [{ id: "blocked1", username: "alexriver" }];
    if (name === "moderation:listReports")
      results = [
        {
          id: "report1",
          targetType: "post",
          reason: "Spam",
          text: "Reported photo",
          photoUrl: uri("coffee"),
        },
      ];
    if (name === "comments:list")
      results = [
        {
          id: "comment1",
          username: "noahpark",
          text: "Love this light!",
          createdAt: Date.now(),
          canEdit: false,
          authorId: "user2",
        },
      ];
    if (name === "notifications:list")
      results = posts.slice(0, 3).map((p, i) => ({
        id: "notification" + i,
        postId: p.id,
        actorUsername: p.username,
        actorAvatarUrl: p.avatarUrl,
        photoUrl: p.photoUrl,
        kind: i ? "comment" : "like",
        commentText: i ? "Love this light!" : undefined,
        createdAt: p.createdAt,
        readAt: i ? Date.now() : undefined,
      }));
  }
  if (scenario.startsWith("empty-")) results = [];
  return { results, status: "Exhausted", loadMore() {} };
}
export const selectPhoto = async () => null;
export const rotatePhoto = async (p) => p;
export const preparePhoto = async () => ({});
export const uploadPhoto = async () => {
  if (scenario === "publishing")
    await new Promise((resolve) => setTimeout(resolve, 10000));
  if (scenario === "retry") throw new Error("Fixture offline");
  return "";
};
export const loadDraft = async () => ({
  ownerId: "user1",
  communityId: "community1",
  caption: "A little afternoon pause.",
  localPhotoUri: uri("coffee"),
  width: 1200,
  height: 900,
  requestId: "fixture-id",
});
export const saveDraft = async () => {};
export const clearDraft = async () => {};
export const clearAllDrafts = async () => {};
export const retainPhoto = async (_, uri) => uri;
