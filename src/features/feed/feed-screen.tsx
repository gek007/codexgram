import React from "react";
import { FlatList, View } from "react-native";
import { usePaginatedQuery } from "convex/react";
import { router } from "expo-router";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Screen } from "@/components/ui/screen";
import { StateView } from "@/components/ui/state-view";
import { Button } from "@/components/ui/button";
import { PostCard } from "./post-card";
export function FeedList({
  communityId,
  userId,
  header,
}: {
  communityId?: Id<"communities">;
  userId?: Id<"users">;
  header?: React.ReactElement;
}) {
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
      data={results}
      keyExtractor={(post) => post.id}
      style={{ flex: 1 }}
      contentContainerStyle={{ gap: 18, paddingBottom: 30 }}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={header}
      renderItem={({ item }) => <PostCard post={item} />}
      ListEmptyComponent={
        <StateView
          loading={status === "LoadingFirstPage"}
          title={
            status === "LoadingFirstPage"
              ? "Loading photos…"
              : status === "CanLoadMore"
                ? "Keep exploring"
                : "A little quiet here"
          }
          detail={
            status === "CanLoadMore"
              ? "More photos may be further down the feed."
              : "Join a community or share the first photo."
          }
        />
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
  return (
    <Screen
      title="Your people, in pictures."
      subtitle="A fresh look at the things you love."
      scroll={false}
    >
      <View style={{ flexDirection: "row", gap: 10 }}>
        <View style={{ flex: 1 }}>
          <Button
            label="Share a photo"
            onPress={() => router.push("/compose")}
          />
        </View>
        <Button
          secondary
          label="Discover"
          onPress={() => router.push("/(tabs)/discover")}
        />
      </View>
      <FeedList />
    </Screen>
  );
}
