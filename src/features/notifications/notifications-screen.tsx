import React, { useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { usePaginatedQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
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
  const [error, setError] = useState("");
  return (
    <Screen
      title="A little love"
      subtitle="The conversations your photos started."
      scroll={false}
    >
      {!!error && (
        <Text accessibilityRole="alert" style={{ color: colors.danger }}>
          {error}
        </Text>
      )}
      <FlatList
        style={{ flex: 1 }}
        data={results}
        keyExtractor={(n) => n.id}
        contentContainerStyle={{ gap: 12 }}
        renderItem={({ item: n }) => (
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
              padding: 18,
              borderRadius: 20,
              backgroundColor: n.readAt ? colors.surface : colors.secondary,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <View
              style={{ flexDirection: "row", gap: 12, alignItems: "center" }}
            >
              <Text style={{ fontSize: 25 }}>
                {n.kind === "like" ? "♡" : "✳"}
              </Text>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={{ color: colors.text, lineHeight: 22 }}>
                  <Text style={{ fontWeight: "800" }}>@{n.actorUsername}</Text>{" "}
                  {n.kind === "like"
                    ? "liked your photo."
                    : "commented on your photo."}
                </Text>
                <Text style={{ color: colors.muted, fontSize: 12 }}>
                  {new Date(n.createdAt).toLocaleDateString("en")}
                </Text>
              </View>
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
