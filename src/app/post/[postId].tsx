import React from "react";
import { useLocalSearchParams } from "expo-router";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Screen } from "@/components/ui/screen";
import { StateView } from "@/components/ui/state-view";
import { PostCard } from "@/features/feed/post-card";
import { CommentList } from "@/features/posts/comment-list";
export default function Post() {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const post = useQuery(api.posts.get, { postId: postId as Id<"posts"> });
  return (
    <Screen insetTop={false}>
      {post === undefined ? (
        <StateView title="Opening photo…" loading />
      ) : post ? (
        <>
          <PostCard post={post} detail />
          <CommentList postId={post.id} communityId={post.communityId} />
        </>
      ) : (
        <StateView
          title="Photo unavailable"
          detail="This photo was removed or you cannot view it."
        />
      )}
    </Screen>
  );
}
