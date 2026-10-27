import React from "react";
import { FlatList, View, Text, Pressable } from "react-native";
import { usePaginatedQuery } from "convex/react";
import { router } from "expo-router";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Screen } from "@/components/ui/screen";
import { StateView } from "@/components/ui/state-view";
import { Button } from "@/components/ui/button";
import { Image } from "expo-image";
import { Brand, IconButton, Aperture } from "@/components/ui/brand";
import { useTheme } from "@/theme/theme-provider";
import { PostCard } from "./post-card";
export function FeedList({
  communityId,
  userId,
  header,
  noCommunities = false,
}: {
  communityId?: Id<"communities">;
  userId?: Id<"users">;
  header?: React.ReactElement;
  noCommunities?: boolean;
}) {
  const { colors } = useTheme();
  const grid = !!userId;
  const home = usePaginatedQuery(
    api.feed.home,
    communityId || userId ? "skip" : {},
    { initialNumItems: 20 },
  );
  const community = usePaginatedQuery(
    api.feed.community,
    communityId ? { communityId } : "skip",
    { initialNumItems: 20 },
  );
  const profile = usePaginatedQuery(
    api.feed.profile,
    userId ? { userId } : "skip",
    { initialNumItems: 20 },
  );
  const { results, status, loadMore } = communityId
    ? community
    : userId
      ? profile
      : home;
  return (
    <FlatList
      key={grid ? "photos" : "feed"}
      numColumns={grid ? 3 : 1}
      columnWrapperStyle={grid ? { gap: 0 } : undefined}
      data={results}
      keyExtractor={(post) => post.id}
      style={{ flex: 1 }}
      contentContainerStyle={{ gap: grid ? 0 : 12, paddingBottom: 30 }}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={header}
      renderItem={({ item }) =>
        grid ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={item.caption || `Photo by ${item.username}`}
            onPress={() =>
              router.push({
                pathname: "/post/[postId]",
                params: { postId: item.id },
              })
            }
            style={{
              flexBasis: "33.333%",
              maxWidth: "33.333%",
              aspectRatio: 1,
              padding: 2,
            }}
          >
            <Image
              source={item.photoUrl}
              contentFit="cover"
              recyclingKey={item.id}
              style={{
                width: "100%",
                height: "100%",
                borderRadius: 6,
                backgroundColor: colors.secondary,
              }}
            />
          </Pressable>
        ) : (
          <PostCard post={item} />
        )
      }
      ListEmptyComponent={
        <View style={{ paddingVertical: 40, gap: 20, alignItems: "center" }}>
          {status !== "LoadingFirstPage" && <Aperture size={64} />}
          <StateView
            loading={status === "LoadingFirstPage"}
            title={
              status === "LoadingFirstPage"
                ? "Loading photos…"
                : status === "CanLoadMore"
                  ? "Keep exploring"
                  : noCommunities
                    ? "Your feed starts here."
                    : "No photos here yet."
            }
            detail={
              status === "CanLoadMore"
                ? "More photos may be further down the feed."
                : noCommunities
                  ? "Join a community to see new photos."
                  : userId
                    ? "Photos shared with communities will appear here."
                    : "Share the first one."
            }
          />
          {noCommunities && (
            <Button
              label="Discover communities"
              onPress={() => router.push("/(tabs)/discover")}
            />
          )}
        </View>
      }
      ListFooterComponent={
        status === "CanLoadMore" ? (
          <Button secondary label="More photos" onPress={() => loadMore(20)} />
        ) : status === "LoadingMore" ? (
          <StateView loading title="Loading more…" />
        ) : undefined
      }
    />
  );
}
export function HomeScreen() {
  const { colors } = useTheme();
  const joined = usePaginatedQuery(
    api.communities.joined,
    {},
    { initialNumItems: 1 },
  );
  return (
    <Screen scroll={false} insetBottom={false}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Brand />
        <IconButton
          icon="plus"
          label="New post"
          filled
          onPress={() => router.push("/compose")}
        />
      </View>
      <Text style={{ color: colors.text, fontSize: 16, fontWeight: "600" }}>
        From your communities
      </Text>
      <FeedList
        noCommunities={joined.status === "Exhausted" && !joined.results.length}
      />
    </Screen>
  );
}
