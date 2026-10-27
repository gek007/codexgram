import React, { useRef, useState } from "react";
import { Text, View, Pressable, Alert } from "react-native";
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useTheme } from "@/theme/theme-provider";
import { errorMessage } from "@/lib/errors";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ContentMenu } from "@/features/moderation/content-menu";
import type { PostCardData } from "@/features/posts/types";
export function PostCard({
  post,
  detail = false,
}: {
  post: PostCardData;
  detail?: boolean;
}) {
  const { colors } = useTheme();
  const like = useMutation(api.likes.set);
  const remove = useMutation(api.posts.remove);
  const [optimistic, setOptimistic] = useState<boolean | null>(null);
  const [menu, setMenu] = useState(false);
  const [error, setError] = useState("");
  const locked = useRef(false);
  const liked = optimistic ?? post.likedByMe;
  const count =
    post.likeCount + (liked === post.likedByMe ? 0 : liked ? 1 : -1);
  const toggle = async () => {
    if (locked.current) return;
    locked.current = true;
    const target = !liked;
    setOptimistic(target);
    setError("");
    try {
      await like({ postId: post.id, liked: target });
    } catch (e) {
      setOptimistic(null);
      setError(errorMessage(e));
    } finally {
      locked.current = false;
      setOptimistic(null);
    }
  };
  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          padding: 12,
          alignItems: "center",
          gap: 10,
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`View ${post.username}'s profile`}
          onPress={() =>
            router.push({
              pathname: "/user/[userId]",
              params: { userId: post.authorId },
            })
          }
        >
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: colors.secondary,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {post.avatarUrl ? (
              <Image
                source={post.avatarUrl}
                style={{ width: 40, height: 40, borderRadius: 20 }}
              />
            ) : (
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "800",
                  color: colors.primary,
                }}
              >
                {post.username[0]?.toUpperCase()}
              </Text>
            )}
          </View>
        </Pressable>
        <View style={{ flex: 1, gap: 3 }}>
          <Text style={{ fontWeight: "700", color: colors.text, fontSize: 15 }}>
            @{post.username}
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() =>
              router.push({
                pathname: "/community/[communityId]",
                params: { communityId: post.communityId },
              })
            }
          >
            <Text
              style={{ color: colors.primary, fontWeight: "600", fontSize: 13 }}
            >
              {post.communityName}
            </Text>
          </Pressable>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Post options"
          hitSlop={10}
          onPress={() => setMenu(!menu)}
          style={{ padding: 10 }}
        >
          <Feather name="more-horizontal" size={22} color={colors.muted} />
        </Pressable>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open photo and comments"
        onPress={() => {
          if (!detail)
            router.push({
              pathname: "/post/[postId]",
              params: { postId: post.id },
            });
        }}
      >
        <Image
          source={post.photoUrl}
          contentFit="cover"
          transition={150}
          accessibilityLabel={post.caption || `Photo by ${post.username}`}
          style={{
            width: "100%",
            aspectRatio: post.width / post.height,
            backgroundColor: colors.secondary,
          }}
        />
      </Pressable>
      <View style={{ padding: 12, gap: 12 }}>
        {!!post.caption && (
          <Text style={{ color: colors.text, lineHeight: 23, fontSize: 15 }}>
            {post.caption}
          </Text>
        )}
        <View style={{ flexDirection: "row", gap: 20, alignItems: "center" }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={liked ? "Unlike photo" : "Like photo"}
            accessibilityState={{ selected: liked }}
            onPress={() => void toggle()}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 7,
              minHeight: 44,
            }}
          >
            <Feather
              name="heart"
              size={23}
              color={liked ? colors.primary : colors.text}
            />
            <Text style={{ color: colors.text, fontWeight: "700" }}>
              {Math.max(0, count)}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${post.commentCount} comments`}
            onPress={() => {
              if (!detail)
                router.push({
                  pathname: "/post/[postId]",
                  params: { postId: post.id },
                });
            }}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 7,
              minHeight: 44,
            }}
          >
            <Feather name="message-circle" size={23} color={colors.text} />
            <Text style={{ color: colors.text, fontWeight: "700" }}>
              {post.commentCount}
            </Text>
          </Pressable>
          <Text
            style={{ color: colors.muted, fontSize: 12, marginLeft: "auto" }}
          >
            {new Date(post.createdAt).toLocaleDateString("en", {
              month: "short",
              day: "numeric",
            })}
            {post.editedAt ? " · edited" : ""}
          </Text>
        </View>
        {!!error && (
          <Text accessibilityRole="alert" style={{ color: colors.danger }}>
            {error}
          </Text>
        )}
        {menu &&
          (post.canEdit ? (
            <Sheet title="Your post" onClose={() => setMenu(false)}>
              <Button
                secondary
                label="Edit caption or replace photo"
                onPress={() => {
                  setMenu(false);
                  router.push({
                    pathname: "/post/edit/[postId]",
                    params: { postId: post.id },
                  });
                }}
              />
              <Button
                secondary
                danger
                label="Delete post"
                onPress={() =>
                  Alert.alert(
                    "Delete this post?",
                    "Your photo and its comments will be removed.",
                    [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Delete",
                        style: "destructive",
                        onPress: () => {
                          void remove({ postId: post.id }).catch((e) =>
                            setError(errorMessage(e)),
                          );
                        },
                      },
                    ],
                  )
                }
              />
              <Button secondary label="Cancel" onPress={() => setMenu(false)} />
            </Sheet>
          ) : (
            <ContentMenu
              target={{ type: "post", id: post.id }}
              authorId={post.authorId}
              communityId={post.communityId}
              canModerate={post.canModerate}
              onDone={() => setMenu(false)}
            />
          ))}
      </View>
    </View>
  );
}
