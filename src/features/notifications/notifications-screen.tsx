import React, { useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { usePaginatedQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Image } from "expo-image";
import { Brand } from "@/components/ui/brand";
import { Screen } from "@/components/ui/screen";
import { StateView } from "@/components/ui/state-view";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/theme/theme-provider";
import { errorMessage } from "@/lib/errors";
export function NotificationsScreen() {
  const { colors } = useTheme();
  const { results, status, loadMore } = usePaginatedQuery(
    api.notifications.list,
    {},
    { initialNumItems: 20 },
  );
  const read = useMutation(api.notifications.markRead);
  const [now] = useState(() => Date.now());
  const grouped = [
    ...results.filter((row) => !row.readAt),
    ...results.filter((row) => !!row.readAt),
  ];
  const [error, setError] = useState("");
  return (
    <Screen scroll={false} insetBottom={false}>
      <Brand />
      <Text
        accessibilityRole="header"
        style={{ color: colors.text, fontSize: 20, fontWeight: "700" }}
      >
        Activity
      </Text>
      {!!error && (
        <Text accessibilityRole="alert" style={{ color: colors.danger }}>
          {error}
        </Text>
      )}
      <FlatList
        style={{ flex: 1 }}
        data={grouped}
        keyExtractor={(n) => n.id}
        contentContainerStyle={{ gap: 0 }}
        renderItem={({ item: n, index }) => (
          <View>
            {(index === 0 || (!!n.readAt && !grouped[index - 1]?.readAt)) && (
              <Text
                style={{
                  fontWeight: "600",
                  color: colors.muted,
                  fontSize: 14,
                  paddingTop: 16,
                  paddingBottom: 4,
                }}
              >
                {n.readAt ? "Earlier" : "New"}
              </Text>
            )}
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                void read({ notificationId: n.id })
                  .then(() =>
                    router.push({
                      pathname: "/post/[postId]",
                      params: { postId: n.postId },
                    }),
                  )
                  .catch((e) => setError(errorMessage(e)));
              }}
              style={{
                paddingVertical: 18,

                backgroundColor: colors.background,
                borderBottomWidth: 1,
                borderColor: colors.border,
              }}
            >
              <View
                style={{ flexDirection: "row", gap: 12, alignItems: "center" }}
              >
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: colors.secondary,
                  }}
                >
                  {n.actorAvatarUrl ? (
                    <Image
                      source={n.actorAvatarUrl}
                      style={{ width: 48, height: 48, borderRadius: 24 }}
                    />
                  ) : (
                    <Text
                      style={{
                        fontSize: 20,
                        fontWeight: "700",
                        color: colors.primary,
                      }}
                    >
                      {n.actorUsername[0]?.toUpperCase()}
                    </Text>
                  )}
                </View>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={{ color: colors.text, lineHeight: 22 }}>
                    <Text style={{ fontWeight: "800" }}>
                      @{n.actorUsername}
                    </Text>{" "}
                    {n.kind === "like" ? "liked your photo." : "commented:"}
                  </Text>
                  {!!n.commentText && (
                    <Text
                      numberOfLines={2}
                      style={{ color: colors.text, lineHeight: 21 }}
                    >
                      {n.commentText}
                    </Text>
                  )}
                  <Text style={{ color: colors.muted, fontSize: 12 }}>
                    {Math.max(1, Math.floor((now - n.createdAt) / 3600000)) < 24
                      ? `${Math.max(1, Math.floor((now - n.createdAt) / 3600000))}h`
                      : new Date(n.createdAt).toLocaleDateString("en", {
                          month: "short",
                          day: "numeric",
                        })}
                  </Text>
                </View>
                {!!n.photoUrl && (
                  <Image
                    source={n.photoUrl}
                    contentFit="cover"
                    style={{ width: 52, height: 60, borderRadius: 6 }}
                  />
                )}
                {!n.readAt && (
                  <View
                    accessibilityLabel="Unread"
                    style={{
                      height: 8,
                      width: 8,
                      borderRadius: 4,
                      backgroundColor: colors.primary,
                    }}
                  />
                )}
              </View>
            </Pressable>
          </View>
        )}
        ListEmptyComponent={
          <StateView
            title={
              status === "LoadingFirstPage"
                ? "Loading activity…"
                : "Your next connection starts with a photo"
            }
            loading={status === "LoadingFirstPage"}
            detail="Likes and comments on your posts will appear here."
          />
        }
        ListFooterComponent={
          status === "CanLoadMore" ? (
            <Button
              secondary
              label="More activity"
              onPress={() => loadMore(20)}
            />
          ) : undefined
        }
      />
    </Screen>
  );
}
